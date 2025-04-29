"use client"

import { useState, useEffect } from "react"

export function DebugInfo() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsInteracting(true)

      // Reset interaction indicator after a delay
      setTimeout(() => setIsInteracting(false), 500)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs z-50">
      <div>
        Mouse: {mousePosition.x}, {mousePosition.y}
      </div>
      <div>Interaction: {isInteracting ? "Yes" : "No"}</div>
    </div>
  )
}
