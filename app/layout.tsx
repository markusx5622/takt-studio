import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import Header from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Takt Studio — Simulador de Líneas de Producción",
  description: "Diseña, simula y optimiza tu línea de producción industrializada antes de tocarla. Herramienta de Ingeniería de Organización Industrial.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <TooltipProvider>
          <Header />
          <main className="pt-16 pb-16 md:pb-0">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  )
}
