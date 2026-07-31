import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Cpu,
  Rocket,
  FlaskConical,
  Sparkles,
} from "lucide-react"

export default function RoadmapSection() {
  return (
<section className="reveal relative z-10 border-t border-border/50 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-product opacity-30" />
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Roadmap & Visión 2026</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Evolución continua del simulador: de la analítica local a la inteligencia industrial global
        </p>
      </div>

      <div className="relative grid gap-8 md:grid-cols-4">
        {[
          {
            phase: "Fase 1",
            status: "Completado",
            title: "Core Sim Engine",
            desc: "Motor de cálculo reactivo, comparador A/B y sistema de plantillas dinámicas.",
            icon: Cpu,
            color: "bg-emerald-500",
            shadow: "shadow-emerald-500/20",
            done: true
          },
          {
            phase: "Fase 2",
            status: "Completado",
            title: "Advanced Analytics",
            desc: "Simulación Monte Carlo, análisis de sensibilidad y exportación técnica avanzada.",
            icon: FlaskConical,
            color: "bg-emerald-500",
            shadow: "shadow-emerald-500/20",
            done: true,
            active: false
          },
          {
            phase: "Fase 3",
            status: "Q3 2026",
            title: "IoT Sync",
            desc: "Conectividad con sensores en planta para captura de tiempos de ciclo en tiempo real.",
            icon: Rocket,
            color: "bg-slate-400",
            shadow: "shadow-slate-400/10",
            done: false
          },
          {
            phase: "Fase 4",
            status: "Visión 2027",
            title: "Takt Cloud AI",
            desc: "Optimización de líneas basada en IA y colaboración multi-usuario en la nube.",
            icon: Sparkles,
            color: "bg-slate-400",
            shadow: "shadow-slate-400/10",
            done: false
          }
        ].map((item, i) => (
          <div 
            key={i}
            className={cn(
              "relative group rounded-2xl border bg-background/60 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30",
              item.active && "border-primary/40 ring-1 ring-primary/20 bg-background/80"
            )}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white",
                item.color,
                item.shadow
              )}>
                {item.phase}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{item.status}</span>
            </div>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
              <item.icon className={cn("h-6 w-6 transition-transform duration-500 group-hover:scale-110", item.done ? "text-emerald-500" : "text-primary")} />
            </div>

            <h3 className="mb-2 text-sm font-bold tracking-tight">{item.title}</h3>
            <p className="text-xs leading-relaxed text-foreground/60">{item.desc}</p>
            
            {item.active && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3 animate-shimmer" />
                </div>
                <span className="text-[8px] font-bold text-primary">65%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-16 flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center gap-4 text-xs font-bold text-foreground/40 uppercase tracking-[0.2em]">
          <div className="h-px w-8 bg-border" />
          Impulsando la industria 4.0
          <div className="h-px w-8 bg-border" />
        </div>
        <Button 
          size="lg"
          className="group h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
        >
          <Link href="/simulador" className="flex items-center gap-3">
            Empieza tu simulación ahora
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
  )
}
