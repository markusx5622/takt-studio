import Link from "next/link"
import ConsultingBackground from "@/components/ConsultingBackground"
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Aviso Legal | Takt Studio",
  description: "Información legal y términos de uso de Takt Studio.",
}

export default function LegalPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      <ConsultingBackground />
      
      {/* Glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 bg-hero-glow z-0" />
      
      <div className="relative z-10 w-full max-w-4xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Aviso Legal</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Términos de uso, responsabilidad y cumplimiento normativo de Takt Studio.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">Información General</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>
                Takt Studio es una plataforma de simulación industrial desarrollada como herramienta 
                de apoyo a la ingeniería de organización industrial.
              </p>
              <p>
                <strong>Titular:</strong> Marc Cubero Cantavella<br />
                <strong>Ubicación:</strong> Valencia, España<br />
                <strong>Contacto:</strong> marccuberoc@gmail.com
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">Uso de la Herramienta</h2>
            <div className="space-y-4 text-sm text-foreground/70 leading-relaxed">
              <p>
                Takt Studio es un prototipo con fines educativos y profesionales de simulación. 
                Los resultados son estimaciones basadas en modelos matemáticos de producción.
              </p>
              <p>
                La herramienta se proporciona "tal cual", sin garantías de que los resultados 
                se trasladen idénticamente a la producción física real.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold mb-6">Propiedad Intelectual</h2>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-foreground/70 leading-relaxed">
            <p>
              El código fuente, diseño de interfaz y algoritmos de simulación son propiedad de 
              Takt Studio y su desarrollador. Queda prohibida la reproducción total o parcial 
              sin autorización expresa.
            </p>
            <p>
              Takt Studio utiliza tecnologías de código abierto (Next.js, Tailwind CSS, Lucide) 
              bajo sus respectivas licencias MIT y Apache 2.0.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
