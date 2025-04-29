import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Music, MessageSquare, Wand2 } from "lucide-react"
import { AnimatedEmojiBackground } from "@/components/animated-emoji-background"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Feelify</h1>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="/genre-classifier" className="font-medium">
              Genre Classifier
            </Link>
            <Link href="/mood-chat" className="font-medium">
              Mood Chat
            </Link>
            <Link href="/music-generator" className="font-medium">
              Music Generator
            </Link>
          </nav>
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 relative overflow-hidden" style={{ height: "600px" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950 dark:to-background"></div>
          <AnimatedEmojiBackground />
          <div className="container text-center relative z-10">
            <div className="hero-content mx-auto max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Discover Your Sound</h2>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-muted-foreground">
                Analyze, chat, and create music based on your mood and preferences
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/genre-classifier">
                  <Button size="lg" className="text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                <span className="animate-pulse">👆 Move your cursor to interact with the emojis</span>
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Music className="h-10 w-10 text-teal-500" />}
                title="Genre Classification"
                description="Upload your songs and our AI will analyze and classify them by genre with high accuracy."
                link="/genre-classifier"
              />
              <FeatureCard
                icon={<MessageSquare className="h-10 w-10 text-teal-500" />}
                title="Mood Chat"
                description="Chat with our AI to determine your mood and get personalized song recommendations."
                link="/mood-chat"
              />
              <FeatureCard
                icon={<Wand2 className="h-10 w-10 text-teal-500" />}
                title="Music Generator"
                description="Generate unique music based on your mood and preferences with our AI-powered tool."
                link="/music-generator"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 MoodTunes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link href={link}>
        <Button variant="outline">Try Now</Button>
      </Link>
    </div>
  )
}
