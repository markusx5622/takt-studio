import Link from "next/link"
import ConsultingBackground from "@/components/ConsultingBackground"
import { Lock, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Política de Privacidad | Takt Studio",
  description: "Cómo tratamos tus datos en Takt Studio.",
}

export default function PrivacyPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      <ConsultingBackground />
      
      {/* Glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 bg-hero-glow z-0" />
      
      <div className="relative z-10 w-full max-w-4xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacidad</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Tus datos de ingeniería son tuyos. Transparencia total sobre el tratamiento de información.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur-xl shadow-sm text-center">
            <Eye className="h-6 w-6 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2 text-sm">Privacidad por Diseño</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              No guardamos datos de tus modelos en servidores externos. Todo el cálculo ocurre en tu navegador.
            </p>
          </div>
          <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur-xl shadow-sm text-center">
            <Lock className="h-6 w-6 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2 text-sm">Sin Cuentas</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              No requerimos registro. No hay perfiles de usuario ni rastreo de identidad personal.
            </p>
          </div>
          <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur-xl shadow-sm text-center">
            <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2 text-sm">Seguridad Local</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              La persistencia de datos utiliza el almacenamiento local de tu navegador (localStorage).
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/60 p-8 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Tratamiento de Datos
          </h2>
          <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">
            <section>
              <h3 className="font-bold text-foreground mb-2">1. Datos Recopilados</h3>
              <p>
                Takt Studio no recopila datos personales identificables. Los datos técnicos 
                introducidos en el simulador (tiempos de ciclo, nombres de estaciones) permanecen 
                exclusivamente en el dispositivo del usuario.
              </p>
            </section>
            <section>
              <h3 className="font-bold text-foreground mb-2">2. Analítica de Uso</h3>
              <p>
                Podemos utilizar herramientas de analítica anónima para entender el rendimiento 
                técnico de la aplicación y mejorar la experiencia de usuario, sin vincular nunca 
                esta información a personas físicas.
              </p>
            </section>
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

import { ShieldCheck, FileText } from "lucide-react"
