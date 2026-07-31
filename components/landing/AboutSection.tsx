import { Button } from "@/components/ui/button"
import {
  Code2,
  Briefcase,
} from "lucide-react"

export default function AboutSection() {
  return (
<section className="reveal relative z-10 px-4 py-16 md:py-20">
    <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border bg-background p-8 shadow-sm md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
          {/* Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              Sobre este proyecto
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/70">
              <p>
                Takt Studio es un prototipo funcional de simulación y análisis de líneas de
                producción industrializada. Permite modelar estaciones, calcular KPIs operativos
                y comparar escenarios <em className="not-italic font-medium text-foreground/80">what-if</em>{" "}
                antes de realizar cualquier intervención en planta.
              </p>
              <p>
                Desarrollado por{" "}
                <span className="font-medium text-foreground">Marc Cubero</span> en el ámbito
                de la Ingeniería de Organización Industrial de la{" "}
                <span className="font-medium text-foreground">Universidad Europea de Valencia</span>.
                El enfoque es práctico: una herramienta que respalde la toma de decisiones con
                datos, no que la sustituya.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-3.5">
            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
            >
              <a
                href="https://github.com/markusx5622/takt-studio"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Ver repositorio en GitHub"
              >
                <Code2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground/90">Ver repositorio</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
            >
              <a
                href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Ver perfil de LinkedIn"
              >
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground/90">Perfil de LinkedIn</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}
