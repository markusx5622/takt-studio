"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

function createParticles(width: number, height: number): Particle[] {
  const isMobile = width < 768
  const count = isMobile ? 45 : 100
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.2 + 0.8,
      opacity: Math.random() * 0.2 + 0.15,
    })
  }

  return particles
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    if (!ctx) return

    let animFrameId: number
    let particles: Particle[] = []

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      particles = createParticles(w, h)
    }

    const draw = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          if (p.x < -2) p.x = w + 2
          if (p.x > w + 2) p.x = -2
          if (p.y < -2) p.y = h + 2
          if (p.y > h + 2) p.y = -2
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)

        const baseColor = "120, 140, 165"
        if (p.opacity > 0.28) {
          ctx.shadowBlur = 3
          ctx.shadowColor = `rgba(${baseColor}, 0.25)`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`
        ctx.fill()
        ctx.shadowBlur = 0
      }

      animFrameId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  )
}
