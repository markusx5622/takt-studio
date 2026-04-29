import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Takt Studio</h1>
        <p className="mt-2 text-muted-foreground">
          Simulador de Líneas de Producción — Diseña y optimiza antes de tocar la fábrica
        </p>
        <Button asChild className="mt-6">
          <Link href="/simulador">Ir al simulador</Link>
        </Button>
      </div>
    </main>
  )
}
