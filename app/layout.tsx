import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "Takt Studio — Simulador de Líneas de Producción Industrializada",
  description:
    "Herramienta de simulación y análisis de líneas de producción. Calcula takt time, detecta cuellos de botella y compara escenarios what-if. Ingeniería de Organización Industrial.",
  keywords: [
    "takt time",
    "simulador producción",
    "lean manufacturing",
    "línea de producción",
    "cuello de botella",
    "ingeniería organización industrial",
  ],
  openGraph: {
    title: "Takt Studio",
    description: "Diseña, simula y optimiza tu línea de producción antes de tocarla.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <TooltipProvider>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  )
}
