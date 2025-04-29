"use client"

import { useEffect, useRef } from "react"

interface Emoji {
  x: number
  y: number
  vx: number
  vy: number
  emoji: string
  size: number
  baseVx: number
  baseVy: number
  amplitude: number
  period: number
  phase: number
}

export function AnimatedEmojiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameCountRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = 600 // Fixed height for consistency

    // Emoji and music note options
    const emojis = ["😊", "😢", "😍", "😎", "😌", "🎵", "🎶", "🎸", "🎹", "🎷", "🎺", "🎧", "😃", "😤"]

    // Create emojis - increased by ~30%
    const emojiObjects: Emoji[] = []
    const emojiCount = 70 // Increased from 30

    for (let i = 0; i < emojiCount; i++) {
      // Random base velocity for natural movement
      const baseVx = (Math.random() - 0.5) * 0.3
      const baseVy = (Math.random() - 0.5) * 0.3

      emojiObjects.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: baseVx, // Initial velocity
        vy: baseVy,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.floor(Math.random() * 10), // Varied sizes
        baseVx, // Store base velocity for natural movement
        baseVy,
        amplitude: 0.1 + Math.random() * 0.2, // Random amplitude for oscillation
        period: 100 + Math.random() * 200, // Random period for oscillation
        phase: Math.random() * Math.PI * 2, // Random phase offset
      })
    }

    // Track mouse position
    let mouseX = -100
    let mouseY = -100

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseX = -100
      mouseY = -100
    }

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = 600
    }

    // Animation loop
    function animate() {
      frameCountRef.current++
      if (ctx) {
        if (canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      emojiObjects.forEach((emoji) => {
        // Natural movement - oscillating around base velocity
        const time = frameCountRef.current
        const oscillationX = Math.sin(time / emoji.period + emoji.phase) * emoji.amplitude
        const oscillationY = Math.cos(time / emoji.period + emoji.phase) * emoji.amplitude

        // Reset velocity to base + oscillation
        emoji.vx = emoji.baseVx + oscillationX
        emoji.vy = emoji.baseVy + oscillationY

        // Calculate distance to mouse
        const dx = mouseX - emoji.x
        const dy = mouseY - emoji.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Apply force if mouse is close
        if (distance < 120) {
          // Strong push away from cursor
          emoji.vx -= dx * 0.05
          emoji.vy -= dy * 0.05
        }

        // Apply friction
        emoji.vx *= 0.98
        emoji.vy *= 0.98

        // Update position
        emoji.x += emoji.vx
        emoji.y += emoji.vy

        // Wrap around edges (smoother than bouncing)
        if (emoji.x < 0) {
          if (canvas) {
            emoji.x = canvas.width
          }
        } else if (canvas && emoji.x > canvas.width) {
          emoji.x = 0
        }

        if (canvas && emoji.y < 0) {
          emoji.y = canvas.height
        } else if (canvas && emoji.y > canvas.height) {
          emoji.y = 0
        }

        // Draw emoji
        if (ctx) {
          ctx.font = `${emoji.size}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(emoji.emoji, emoji.x, emoji.y)
        }
      })

      requestAnimationFrame(animate)
    }

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-40"
      style={{
        pointerEvents: "auto",
        cursor: "default",
      }}
    />
  )
}
