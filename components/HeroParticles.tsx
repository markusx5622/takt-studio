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
}

function createParticles(width: number, height: number): Particle[] {
  const isMobile = width < 768
  const dustCount = isMobile ? 35 : 60
  const moteCount = isMobile ? 25 : 50
  const particles: Particle[] = []

  // Background dust layer — very subtle, slow, small
  for (let i = 0; i < dustCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 0.6 + 0.3,
      opacity: Math.random() * 0.1 + 0.06,
      kind: "dust",
    })
  }

  // Foreground mote layer — more visible, varied, organic
  for (let i = 0; i < moteCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.9,
      opacity: Math.random() * 0.25 + 0.2,
      kind: "mote",
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
  ctx.lineWidth = 1
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

          if (p.x < -4) p.x = w + 4
          if (p.x > w + 4) p.x = -4
          if (p.y < -4) p.y = h + 4
          if (p.y > h + 4) p.y = -4
        }

        if (p.kind === "dust") {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(160, 175, 195, ${p.opacity})`
          ctx.fill()
        } else {
          // Motes: a mix of circles and subtle crosses for variety
          const isCircle = Math.random() > 0.15 // 85% circles, 15% crosses
          const color = `rgba(170, 190, 215, ${p.opacity})`

          if (isCircle) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = color
            ctx.fill()
          } else {
            drawCross(ctx, p.x, p.y, p.radius * 2.2, color)
          }

          // Soft glow on brighter motes
          if (p.opacity > 0.32) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(170, 190, 215, ${p.opacity * 0.12})`
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
