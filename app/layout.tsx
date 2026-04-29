import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Takt Studio — Simulador de Líneas de Producción",
  description: "Diseña, simula y optimiza tu línea de producción industrializada antes de tocarla. Herramienta de Ingeniería de Organización Industrial.",
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
