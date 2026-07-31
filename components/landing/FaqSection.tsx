import {
  HelpCircle,
} from "lucide-react"

export default function FaqSection() {
  return (
<section className="reveal relative z-10 px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-structure opacity-50" />
    <div className="mx-auto max-w-4xl">
      <div className="mb-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Preguntas frecuentes</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Todo lo que necesitas saber sobre Takt Studio y la simulación de líneas
        </p>
      </div>

      <div className="grid gap-4">
        {[
          {
            q: "¿Qué precisión tienen los cálculos de Takt Studio?",
            a: "Los cálculos se basan en fórmulas estándar de Ingeniería de Organización Industrial. La precisión depende de la calidad de los datos de entrada (tiempos de ciclo, eficiencias). Es una herramienta de simulación analítica para toma de decisiones, no un sistema de control en tiempo real."
          },
          {
            q: "¿Dónde se guardan mis datos de simulación?",
            a: "Por privacidad y seguridad, tus datos nunca salen de tu dispositivo. Se guardan en el almacenamiento local de tu navegador (localStorage). Si borras la caché o cambias de navegador, los datos no se sincronizarán a menos que los exportes manualmente."
          },
          {
            q: "¿Puedo exportar mis análisis a otros formatos?",
            a: "Sí, Takt Studio permite exportar los resultados y la configuración actual en formato PDF para presentaciones e informes técnicos, así como importar/exportar archivos JSON para compartir modelos entre diferentes usuarios."
          },
          {
            q: "¿Es necesario tener conocimientos avanzados de Lean Manufacturing?",
            a: "No es obligatorio, pero ayuda. La herramienta está diseñada para ser intuitiva, pero conceptos como 'Cuello de Botella' o 'Balanceo de Línea' son fundamentales para interpretar correctamente los resultados y tomar decisiones de mejora."
          }
        ].map((faq, i) => (
          <div 
            key={i}
            className="group rounded-2xl border bg-background/40 p-6 backdrop-blur-xl transition-all hover:bg-background/60 hover:shadow-md"
          >
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <HelpCircle className="h-5 w-5 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-tight text-foreground/90">{faq.q}</h3>
                <p className="text-xs leading-relaxed text-foreground/60">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}
