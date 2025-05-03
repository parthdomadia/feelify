from flask import Flask, request, jsonify, send_file
import pandas as pd
import random
import joblib
import re
import requests
import os
import pickle
import numpy as np
import base64
import json
import uuid
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from music21 import converter, note, chord, stream
from keras.models import load_model
from midi2audio import FluidSynth
from pydub import AudioSegment
from flask_cors import CORS
from dotenv import load_dotenv
import torch
import torch.nn.functional as F
import librosa
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import argparse
import nltk

load_dotenv()

# nltk.download("punkt")
# nltk.download("stopwords")

app = Flask(__name__)
CORS(app)

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.getenv("ClientID")
SPOTIFY_CLIENT_SECRET = os.getenv("SecretKey")

# Load trained mood classification model
with open("models/mood_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load expanded mood-to-song mapping
with open("data/mood_to_songs_expanded.json", "r") as f:
    mood_to_songs = json.load(f)

# Genre classification model loading
GENRE_MODEL_PATH = "models/genre_model_clean"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
extractor = AutoFeatureExtractor.from_pretrained(GENRE_MODEL_PATH)
genre_model = AutoModelForAudioClassification.from_pretrained(GENRE_MODEL_PATH).to(device)
genre_model.eval()

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in stopwords.words("english")]
    return " ".join(tokens)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("text", "")
    if not user_input:
        return jsonify({"error": "No input provided."}), 400

    clean_input = preprocess_text(user_input)
    predicted_mood = model.predict([clean_input])[0]
    songs = mood_to_songs.get(predicted_mood, [])

    return jsonify({"mood": predicted_mood, "recommendations": songs})

@app.route("/spotify-token", methods=["GET"])
def get_spotify_token():
    auth = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_b64 = base64.b64encode(auth.encode()).decode()
    headers = {"Authorization": f"Basic {auth_b64}", "Content-Type": "application/x-www-form-urlencoded"}
    data = {"grant_type": "client_credentials"}
    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    return jsonify(response.json())

@app.route("/search-song", methods=["POST"])
def search_song():
    data = request.get_json()
    artist = data.get("artist", "")
    title = data.get("title", "")
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Missing Spotify token"}), 401

    query = f"{artist} {title}"
    headers = {"Authorization": token}
    params = {"q": query, "type": "track", "limit": 1}
    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
    return jsonify(response.json())




def preprocess_audio(audio_path, sampling_rate=16000):
    audio, sr = librosa.load(audio_path, sr=sampling_rate)
    return {"array": audio, "sampling_rate": sr}

def predict_genre(audio_path):
    audio_input = preprocess_audio(audio_path)
    features = extractor(audio_input["array"], sampling_rate=audio_input["sampling_rate"], return_tensors="pt")

    with torch.no_grad():
        inputs = {k: v.to(device) for k, v in features.items()}
        logits = genre_model(**inputs).logits
        predicted_class_id = torch.argmax(logits, dim=1).item()
        probabilities = F.softmax(logits, dim=1).cpu().numpy().squeeze()

    label = genre_model.config.id2label[predicted_class_id]
    return label, probabilities


@app.route("/genre-classify", methods=["POST"])
def classify_genre():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400
    UPLOAD_FOLDER = "data/uploads"
    audio_file = request.files["file"]
    file_ext = os.path.splitext(audio_file.filename)[-1]
    save_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, save_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    audio_file.save(file_path)

    try:
        genre, probs = predict_genre(file_path)

        return jsonify({
            "genre": genre,
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    








def process_midi(file_path):
    try:
        midi = converter.parse(file_path)
        notes = []
        for el in midi.flat.notes:
            if isinstance(el, note.Note):
                notes.append(str(el.pitch))
            elif isinstance(el, chord.Chord):
                notes.append('.'.join(str(n) for n in el.normalOrder))
        return notes
    except Exception as e:
        print("Error:", e)
        return []


# --- Helper: Generate Music ---
def generate_music(notes, output_basename, MODEL_FOLDER, GENERATED_FOLDER, SOUNDFONT_PATH):
    try:
        with open(os.path.join(MODEL_FOLDER, 'gen_music.pkl'), 'rb') as f:
            mappings = pickle.load(f)
        note_to_int = mappings['note_to_int']
        int_to_note = mappings['int_to_note']

        model = load_model(os.path.join(MODEL_FOLDER, 'music_lstm.h5'))
        seq_len = 50
        seed = [note_to_int[n] for n in notes[:seq_len] if n in note_to_int]
        output = []

        for _ in range(600):
            input_seq = np.reshape(seed, (1, seq_len, 1)) / len(note_to_int)
            prediction = model.predict(input_seq, verbose=0)
            idx = np.argmax(prediction)
            if idx in int_to_note:
                output.append(int_to_note[idx])
            seed.append(idx)
            seed = seed[1:]

        out_stream = stream.Stream()
        skipped = 0
        for n in output:
            try:
                if '.' in n:
                    pitches = [note.Note(i).nameWithOctave for i in n.split('.') if not i.isdigit()]
                    if pitches:
                        chord_obj = chord.Chord(pitches)
                        chord_obj.duration.quarterLength = random.choice([0.25, 0.5, 1.0])
                        out_stream.append(chord_obj)
                elif n.isdigit():
                    skipped += 1
                else:
                    note_obj = note.Note(n)
                    note_obj.duration.quarterLength = random.choice([0.25, 0.5, 1.0])
                    out_stream.append(note_obj)
            except:
                skipped += 1

        if skipped > len(output) * 0.8:
            return None, "Too many notes skipped. Generation failed."

        midi_path = os.path.join(GENERATED_FOLDER, f"{output_basename}.mid")
        wav_path = os.path.join(GENERATED_FOLDER, f"{output_basename}.wav")
        mp3_path = os.path.join(GENERATED_FOLDER, f"{output_basename}.mp3")

        # out_stream.write('midi', fp=midi_path)
        # fs = FluidSynth(sound_font=SOUNDFONT_PATH, executable=r"C://ProgramData//chocolatey//bin//fluidsynth.exe")
        # fs.midi_to_audio(midi_path, wav_path)
        # audio = AudioSegment.from_wav(wav_path)
        # audio.export(mp3_path, format="mp3")

        midi_path = os.path.join(GENERATED_FOLDER, f"{output_basename}.mid")
        out_stream.write('midi', fp=midi_path)

        return midi_path, None

    except Exception as e:
        return None, str(e)

# --- Route: Music Generation ---
@app.route("/generate-music", methods=["POST"])
def api_generate_music():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_FOLDER = os.path.join(BASE_DIR, "models")
    GENERATED_FOLDER = os.path.join(BASE_DIR, "generated")
    SOUNDFONT_PATH = os.path.join(BASE_DIR, "FluidR3_GM.sf2")
    MIDI_SOURCE = os.path.join(BASE_DIR, "data", "midi_files", "Data")

    os.makedirs(GENERATED_FOLDER, exist_ok=True)

    try:
        num_inputs = int(request.form.get("num_inputs", 3))
    except Exception:
        return jsonify({"error": "Missing or invalid 'num_inputs'"}), 400

    midi_files = [f for f in os.listdir(MIDI_SOURCE) if f.endswith(".mid")]
    if not midi_files:
        return jsonify({"error": "No MIDI files found."}), 500

    selected = random.sample(midi_files, min(num_inputs, len(midi_files)))
    all_notes = []
    for fname in selected:
        notes = process_midi(os.path.join(MIDI_SOURCE, fname))
        all_notes.extend(notes)

    if len(all_notes) < 50:
        return jsonify({"error": "Not enough notes to generate music."}), 400

    file_id = str(uuid.uuid4())
    output_file, error = generate_music(all_notes, file_id, MODEL_FOLDER, GENERATED_FOLDER, SOUNDFONT_PATH)
    if error:
        return jsonify({"error": error}), 500

    return send_file(output_file, mimetype='audio/midi')




if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
