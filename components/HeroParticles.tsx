"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  kind: "dust" | "mote"
  pulsePhase: number
  pulseSpeed: number
}

function createParticles(width: number, height: number): Particle[] {
  const isMobile = width < 768
  // Much more particles for intense effect
  const dustCount = isMobile ? 80 : 160
  const moteCount = isMobile ? 50 : 100
  const particles: Particle[] = []

  // Background dust layer — faster, larger, more visible
  for (let i = 0; i < dustCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 1.7 + 0.8,
      opacity: Math.random() * 0.30 + 0.30,
      kind: "dust",
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    })
  }

  // Foreground mote layer — bright, large, dynamic
  for (let i = 0; i < moteCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      radius: Math.random() * 3.0 + 1.5,
      opacity: Math.random() * 0.35 + 0.55,
      kind: "mote",
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
    })
  }

  return particles
}

function drawCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  const half = size / 2
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(x - half, y)
  ctx.lineTo(x + half, y)
  ctx.moveTo(x, y - half)
  ctx.lineTo(x, y + half)
  ctx.stroke()
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    if (!ctx) return

    let animFrameId: number
    let particles: Particle[] = []
    let time = 0

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

    const drawConnections = () => {
      const connectDistance = 120
      const moteParticles = particles.filter((p) => p.kind === "mote")

      for (let i = 0; i < moteParticles.length; i++) {
        for (let j = i + 1; j < moteParticles.length; j++) {
          const p1 = moteParticles[i]
          const p2 = moteParticles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectDistance) {
            const alpha = (1 - dist / connectDistance) * 0.25 * Math.min(p1.opacity, p2.opacity)
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(170, 195, 230, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
    }

    const draw = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth
      const h = parent.clientHeight

      time += 1
      ctx.clearRect(0, 0, w, h)

      // Draw connections first (behind particles)
      if (!prefersReducedMotion) {
        drawConnections()
      }

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          if (p.y > h + 10) p.y = -10
        }

        // Pulsing opacity for organic feel
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase)
        const currentOpacity = p.opacity * (0.85 + pulse * 0.15)

        if (p.kind === "dust") {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(195, 215, 240, ${currentOpacity})`
          ctx.fill()
        } else {
          // Motes: a mix of circles and subtle crosses for variety
          const isCircle = Math.random() > 0.12 // 88% circles, 12% crosses
          const color = `rgba(200, 225, 255, ${currentOpacity})`

          if (isCircle) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = color
            ctx.fill()
          } else {
            drawCross(ctx, p.x, p.y, p.radius * 2.4, color)
          }

          // Glow on motes — more intense and applied to more particles
          if (p.opacity > 0.20) {
            const glowRadius = p.radius * 3.5
            const glowAlpha = currentOpacity * 0.35
            ctx.beginPath()
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(190, 215, 245, ${glowAlpha})`
            ctx.fill()
          }

          // Extra bright core for the brightest motes
          if (p.opacity > 0.45) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(220, 235, 255, ${currentOpacity * 0.6})`
            ctx.fill()
          }
        }
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
