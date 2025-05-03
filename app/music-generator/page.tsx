"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Play, Pause, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import * as Tone from "tone"
import { Midi } from "@tonejs/midi"

export default function MusicGenerator() {
  const [numInputs, setNumInputs] = useState([3])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [midiUrl, setMidiUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const durationRef = useRef(30)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateMusic = async () => {
    setIsGenerating(true)
    setMidiUrl(null)
    setPlayProgress(0)
    setIsPlaying(false)
    setGenerationProgress(0)

    const fakeProgress = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(fakeProgress)
          return prev
        }
        return prev + 5
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("num_inputs", String(numInputs[0]))

      const res = await fetch("http://localhost:5000/generate-music", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate music.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setMidiUrl(url)
    } catch (err) {
      console.error(err)
    } finally {
      clearInterval(fakeProgress)
      setIsGenerating(false)
      setGenerationProgress(100)
    }
  }

  const playMidi = async () => {
    if (!midiUrl || isPlaying) return

    const response = await fetch(midiUrl)
    const arrayBuffer = await response.arrayBuffer()
    const midi = new Midi(arrayBuffer)

    const now = Tone.now()
    await Tone.start()

    durationRef.current = midi.duration
    setPlayProgress(0)
    setIsPlaying(true)

    intervalRef.current = setInterval(() => {
      setPlayProgress(prev => {
        const next = prev + 0.1
        if (next >= durationRef.current) {
          clearInterval(intervalRef.current!)
          setIsPlaying(false)
          return 0
        }
        return next
      })
    }, 100)

    midi.tracks.forEach(track => {
      const synth = new Tone.Synth().toDestination()
      track.notes.forEach(note => {
        synth.triggerAttackRelease(note.name, note.duration, note.time + now, note.velocity)
      })
    })
  }

  const pauseOrResumeMidi = () => {
    if (isPlaying) {
      Tone.Transport.pause()
      setIsPlaying(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
    } else {
      Tone.start()
      setIsPlaying(true)
      intervalRef.current = setInterval(() => {
        setPlayProgress(Tone.Transport.seconds)
        if (Tone.Transport.seconds >= durationRef.current) {
          clearInterval(intervalRef.current!)
          setIsPlaying(false)
        }
      }, 100)
    }
  }
  

  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Music Generator</h1>
      <p className="text-muted-foreground mb-8">Generate unique music by combining multiple MIDI tracks.</p>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Generate Music</CardTitle>
              <CardDescription>Choose how many MIDI files to blend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="num-inputs" className="text-sm font-medium">
                    Number of Songs
                  </label>
                  <span className="text-sm text-muted-foreground">{numInputs[0]}</span>
                </div>
                <Slider id="num-inputs" min={1} max={100} step={1} value={numInputs} onValueChange={setNumInputs} />
              </div>

              <Button onClick={generateMusic} disabled={isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate Music"}
              </Button>

              {isGenerating && (
                <>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground mt-2">{generationProgress}% complete</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Generated Music</CardTitle>
              <CardDescription>Preview and download your creation</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center space-y-4">
              {!isGenerating && midiUrl ? (
                <>
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-green-500 text-white"
                        onClick={midiUrl && isPlaying ? pauseOrResumeMidi : playMidi}
                        >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  <Progress value={(playProgress / durationRef.current) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{playProgress.toFixed(1)}s</span>
                    <span>{durationRef.current.toFixed(1)}s</span>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setMidiUrl(null)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <a href={midiUrl} download="generated.mid">
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground text-sm px-4">
                  Generate a track using the slider to preview it here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

