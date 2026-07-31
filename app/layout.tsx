import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import Header from "@/components/Header"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  metadataBase: new URL("https://takt-studio.vercel.app"),
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
    title: "Takt Studio — Simulador de Líneas de Producción",
    description:
      "Diseña, simula y optimiza tu línea de producción antes de tocarla. Takt time, cuellos de botella y escenarios what-if.",
    url: "https://takt-studio.vercel.app",
    siteName: "Takt Studio",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Takt Studio — Gráfico de tiempos de ciclo vs takt time y KPIs de la línea de producción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Takt Studio — Simulador de Líneas de Producción",
    description: "Diseña, simula y optimiza tu línea de producción antes de tocarla.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-[#f1f5f9]">
        <TooltipProvider>
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  )
}
