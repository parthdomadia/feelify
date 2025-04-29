"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Play, Pause, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function MusicGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState("happy")
  const [selectedGenre, setSelectedGenre] = useState("electronic")
  const [tempo, setTempo] = useState([120])
  const [duration, setDuration] = useState([30])
  const [prompt, setPrompt] = useState("")

  const generateMusic = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedMusic(null)

    // Simulate progress updates
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          // Mock generated music URL - in a real app, this would be from an AI model
          setGeneratedMusic("/placeholder-audio.mp3")
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Music Generator</h1>
      <p className="text-muted-foreground mb-8">Generate unique music based on your mood and preferences.</p>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Generate Music</CardTitle>
              <CardDescription>Customize parameters to create your perfect track</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mood" className="mb-6">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="mood">Mood-based</TabsTrigger>
                  <TabsTrigger value="prompt">Prompt-based</TabsTrigger>
                </TabsList>
                <TabsContent value="mood" className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="focused">Focused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger id="genre">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="ambient">Ambient</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="tempo">Tempo (BPM)</Label>
                      <span className="text-sm text-muted-foreground">{tempo[0]}</span>
                    </div>
                    <Slider id="tempo" min={60} max={180} step={1} value={tempo} onValueChange={setTempo} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <span className="text-sm text-muted-foreground">{duration[0]}</span>
                    </div>
                    <Slider id="duration" min={10} max={60} step={5} value={duration} onValueChange={setDuration} />
                  </div>
                </TabsContent>

                <TabsContent value="prompt" className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Describe your music</Label>
                    <Input
                      id="prompt"
                      placeholder="E.g., A dreamy ambient track with piano and soft synths"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about instruments, mood, tempo, and style for best results.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="duration-prompt">Duration (seconds)</Label>
                      <span className="text-sm text-muted-foreground">{duration[0]}</span>
                    </div>
                    <Slider
                      id="duration-prompt"
                      min={10}
                      max={60}
                      step={5}
                      value={duration}
                      onValueChange={setDuration}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={generateMusic} disabled={isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate Music"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Generated Music</CardTitle>
              <CardDescription>Preview and download your creation</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {isGenerating ? (
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <p className="text-center">Generating your music...</p>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">{generationProgress}% complete</p>
                </div>
              ) : generatedMusic ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-green-500 text-primary-foreground"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-12 bg-muted rounded-md flex items-center px-4">
                      <div className="w-full">
                        <div className="h-1.5 bg-primary rounded-full" style={{ width: isPlaying ? "45%" : "0%" }} />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {isPlaying ? "00:15" : "00:00"} /{" "}
                        {duration[0] < 10 ? `00:0${duration[0]}` : `00:${duration[0]}`}
                      </p>
                      <div className="space-x-2">
                        <Button variant="outline" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <p className="text-muted-foreground">
                    Adjust the parameters and click "Generate Music" to create your track.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
