# 🎵 Genre Classifier - Audio Genre Detection using AI

This project allows you to upload an audio file (MP3, WAV, FLAC) and automatically detects its **primary music genre** using a trained AI model.

---

## 🚀 How It Works

1. The frontend is built using **Next.js + Tailwind CSS**.
2. The backend (Flask API) handles audio file processing and genre prediction.
3. The genre is returned as a simple JSON response containing only the primary genre.
4. The user interface displays the result with an option to upload and analyze another file.

---

## 🖼️ SampleUser Flow

1. **Homepage → Genre Classifier**
2. **Upload audio file** (drag-and-drop or browse)
3. **Click "Analyze Genre"**
4. Wait for processing...
5. **Result displayed** with the primary genre.

---

## Running the project 
navigate to the main folder named "Feelify" 

## Install dependencies
run "pip intall -r requirement.txt"


## Initiate front server
npm install -force
npm run dev

## initiate backend server
python flask_app.py