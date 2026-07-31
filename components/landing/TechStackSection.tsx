import {
  Cpu,
  Box,
  Database,
} from "lucide-react"

export default function TechStackSection() {
  return (
<section className="reveal relative z-10 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product opacity-40" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ingeniería y Arquitectura</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Tecnología de vanguardia para simulaciones industriales de alto rendimiento
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Core Engine */}
        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-lg font-bold">Motor Reactivo</h3>
          <p className="text-sm leading-relaxed text-foreground/70 mb-6">
            Algoritmos optimizados en JavaScript que recalculan el flujo completo de la línea 
            y detectan cuellos de botella en milisegundos ante cualquier cambio de parámetros.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Next.js 16</span>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">TypeScript</span>
          </div>
        </div>

        {/* Interface & Experience */}
        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-lg font-bold">Industrial Design</h3>
          <p className="text-sm leading-relaxed text-foreground/70 mb-6">
            Interfaz de alta fidelidad construida con Tailwind CSS, priorizando la 
            legibilidad técnica y la ergonomía visual para entornos profesionales de ingeniería.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Tailwind v4</span>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Lucide Icons</span>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-lg font-bold">Local Computing</h3>
          <p className="text-sm leading-relaxed text-foreground/70 mb-6">
            Estrategia &quot;Offline-First&quot; utilizando persistencia en el navegador. Garantiza 
            latencia cero y privacidad total de los datos industriales sin necesidad de base de datos.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Local Storage</span>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-foreground/50 uppercase">Zustand</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}
