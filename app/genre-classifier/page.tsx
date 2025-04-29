"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Music, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GenreClassifier() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    genre: string
    confidence: number
    subgenres: Array<{ name: string; confidence: number }>
  }>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const analyzeGenre = async () => {
    if (!file) return

    setIsAnalyzing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock result - in a real app, this would come from an AI model
      setResult({
        genre: "Electronic",
        confidence: 0.89,
        subgenres: [
          { name: "House", confidence: 0.72 },
          { name: "Techno", confidence: 0.65 },
          { name: "Ambient", confidence: 0.43 },
        ],
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Genre Classifier</h1>
      <p className="text-muted-foreground mb-8">Upload an audio file and our AI will analyze and classify its genre.</p>

      <Card>
        <CardHeader>
          <CardTitle>Upload Audio</CardTitle>
          <CardDescription>Supported formats: MP3, WAV, FLAC (max 10MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg mb-6">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {file ? file.name : "Drag and drop your audio file here or click to browse"}
            </p>
            <input type="file" id="audio-upload" className="hidden" accept="audio/*" onChange={handleFileChange} />
            <label htmlFor="audio-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </label>
          </div>

          {file && !result && !isAnalyzing && (
            <Button onClick={analyzeGenre} className="w-full">
              Analyze Genre
            </Button>
          )}

          {isAnalyzing && (
            <div className="space-y-4">
              <p className="text-center font-medium">Analyzing audio...</p>
              <Progress value={45} className="h-2" />
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <Alert>
                <Music className="h-4 w-4" />
                <AlertTitle>Analysis Complete</AlertTitle>
                <AlertDescription>We've analyzed your track and identified its genre.</AlertDescription>
              </Alert>

              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium mb-2">Primary Genre</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{result.genre}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  <Progress value={result.confidence * 100} className="h-2" />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Subgenres</h3>
                  <div className="space-y-3">
                    {result.subgenres.map((subgenre, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span>{subgenre.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(subgenre.confidence * 100)}%
                          </span>
                        </div>
                        <Progress value={subgenre.confidence * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setFile(null)
                    setResult(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Analyze Another Track
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
