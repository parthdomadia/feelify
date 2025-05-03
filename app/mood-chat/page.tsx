"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, User, Bot, Music } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type SongRecommendation = {
  title: string
  artist: string
  mood: string
}

export default function MoodChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I can help determine your mood and suggest songs. How are you feeling today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<SongRecommendation[]>([])
  const [detectedMood, setDetectedMood] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
  
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }
  
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
  
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      })
  
      const data = await response.json()
  
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Based on what you've shared, I sense you're feeling ${data.mood.toLowerCase()}. Here are some songs that might resonate with your current mood.`,
        role: "assistant",
        timestamp: new Date(),
      }
  
      setDetectedMood(data.mood)
      setRecommendations(
        data.recommendations.map((songString: string) => {
          const [artist, title] = songString.split(" - ")
          return {
            title: title?.trim() || "Unknown Title",
            artist: artist?.trim() || "Unknown Artist",
            mood: data.mood,
          }
        })
      )
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, there was an error connecting to the AI.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setDetectedMood("Error")
    }
  
    setIsTyping(false)
  }
  

  // Simple mood analysis function (in a real app, this would use an AI model)
  const analyzeMood = (text: string): string => {
    const text_lower = text.toLowerCase()

    if (text_lower.includes("happy") || text_lower.includes("joy") || text_lower.includes("excited")) {
      return "Happy"
    } else if (text_lower.includes("sad") || text_lower.includes("down") || text_lower.includes("depressed")) {
      return "Melancholic"
    } else if (text_lower.includes("relax") || text_lower.includes("calm") || text_lower.includes("peaceful")) {
      return "Calm"
    } else if (text_lower.includes("energetic") || text_lower.includes("pumped") || text_lower.includes("workout")) {
      return "Energetic"
    } else if (text_lower.includes("focus") || text_lower.includes("concentrate") || text_lower.includes("work")) {
      return "Focused"
    } else {
      // Default mood based on sentiment analysis
      const positiveWords = ["good", "great", "awesome", "nice", "love", "like"]
      const negativeWords = ["bad", "terrible", "hate", "dislike", "awful"]

      let score = 0
      positiveWords.forEach((word) => {
        if (text_lower.includes(word)) score += 1
      })

      negativeWords.forEach((word) => {
        if (text_lower.includes(word)) score -= 1
      })

      if (score > 0) return "Happy"
      if (score < 0) return "Melancholic"
      return "Neutral"
    }
  }

  // Mock song recommendations (in a real app, this would come from a database or API)
  const getSongRecommendations = (mood: string): SongRecommendation[] => {
    const recommendations: Record<string, SongRecommendation[]> = {
      Happy: [
        { title: "Happy", artist: "Pharrell Williams", mood: "Happy" },
        { title: "Good as Hell", artist: "Lizzo", mood: "Happy" },
        { title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "Happy" },
      ],
      Melancholic: [
        { title: "Someone Like You", artist: "Adele", mood: "Melancholic" },
        { title: "Fix You", artist: "Coldplay", mood: "Melancholic" },
        { title: "Hurt", artist: "Johnny Cash", mood: "Melancholic" },
      ],
      Calm: [
        { title: "Weightless", artist: "Marconi Union", mood: "Calm" },
        { title: "Claire de Lune", artist: "Claude Debussy", mood: "Calm" },
        { title: "Gymnopédie No.1", artist: "Erik Satie", mood: "Calm" },
      ],
      Energetic: [
        { title: "Eye of the Tiger", artist: "Survivor", mood: "Energetic" },
        { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", mood: "Energetic" },
        { title: "Stronger", artist: "Kanye West", mood: "Energetic" },
      ],
      Focused: [
        { title: "Experience", artist: "Ludovico Einaudi", mood: "Focused" },
        { title: "Time", artist: "Hans Zimmer", mood: "Focused" },
        { title: "Divenire", artist: "Ludovico Einaudi", mood: "Focused" },
      ],
      Neutral: [
        { title: "Here Comes the Sun", artist: "The Beatles", mood: "Neutral" },
        { title: "Clocks", artist: "Coldplay", mood: "Neutral" },
        { title: "Viva La Vida", artist: "Coldplay", mood: "Neutral" },
      ],
    }

    return recommendations[mood] || recommendations["Neutral"]
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Mood Chat</h1>
      <p className="text-muted-foreground mb-8">
        Chat with our AI to determine your mood and get personalized song recommendations.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start max-w-[80%]">
                        {message.role === "assistant" && (
                          <Avatar className="mr-2 mt-0.5">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="ml-2 mt-0.5">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex mb-4 justify-start">
                      <div className="flex items-start max-w-[80%]">
                        <Avatar className="mr-2 mt-0.5">
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      placeholder="How are you feeling today?"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Music className="mr-2 h-5 w-5" />
                Song Recommendations
              </h2>

              {detectedMood && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Detected Mood:</p>
                  <Badge className="text-sm" variant="secondary">
                    {detectedMood}
                  </Badge>
                </div>
              )}

              {recommendations.length > 0 ? (
                <div className="space-y-4 overflow-y-auto flex-1">
                  {recommendations.map((song, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <h3 className="font-medium">{song.title}</h3>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <p className="text-muted-foreground">
                    Chat with the AI to get personalized song recommendations based on your mood.
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
