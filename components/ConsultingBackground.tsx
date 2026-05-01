"use client"

import { useEffect, useRef } from "react"

export default function ConsultingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let w = 0
    let h = 0

    // Puntos para una red sutil de nodos
    const dots: { x: number; y: number; vx: number; vy: number; radius: number }[] = []
    const numDots = 120 // Más puntos para amplificar el efecto
    const connectionDistance = 180

    const init = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight

      dots.length = 0
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8, // Movimiento más rápido
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 1.5 + 0.5,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      
      // Dibujar fondo sutil (gris más oscuro para contraste)
      ctx.fillStyle = "hsl(215, 15%, 91%)"
      ctx.fillRect(0, 0, w, h)

      // Actualizar y dibujar puntos
      ctx.fillStyle = "rgba(71, 85, 105, 0.5)" // slate-700 suave
      
      for (let i = 0; i < numDots; i++) {
        const dot = dots[i]
        
        dot.x += dot.vx
        dot.y += dot.vy

        // Rebote suave en los bordes
        if (dot.x < 0 || dot.x > w) dot.vx *= -1
        if (dot.y < 0 || dot.y > h) dot.vy *= -1

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()

        // Dibujar conexiones entre puntos cercanos
        for (let j = i + 1; j < numDots; j++) {
          const dot2 = dots[j]
          const dx = dot.x - dot2.x
          const dy = dot.y - dot2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(dot2.x, dot2.y)
            const opacity = 1 - (dist / connectionDistance)
            // Líneas grises más definidas
            ctx.strokeStyle = `rgba(100, 116, 139, ${opacity * 0.2})` // slate-500
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    init()
    draw()

    const handleResize = () => {
      init()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-200/50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />
      {/* Overlay gradiente para suavizar la animación y dar look elegante */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-slate-300/30" />
    </div>
  )
}
