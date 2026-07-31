export default function MethodologySection() {
  return (
<section className="reveal relative z-10 bg-grid-pattern-light px-4 py-20 md:py-24">
    <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Validación antes de la inversión
      </h2>
      <p className="mt-4 text-base leading-relaxed text-foreground/70">
        Takt Studio parte de una{" "}
        <span className="font-medium text-foreground">plantilla Monobath calibrada</span>{" "}
        como demostración del método. Puedes ajustar cada parámetro con datos reales de tu
        propia línea y validar decisiones antes de cualquier intervención física.{" "}
        <span className="font-medium text-foreground">
          La herramienta está pensada para reducir el riesgo operativo de las mejoras de
          producción
        </span>{" "}
        mediante simulación analítica, no para sustituir el juicio del ingeniero.
      </p>
    </div>
  </section>
  )
}
