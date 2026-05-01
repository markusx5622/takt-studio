"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Factory, RotateCcw, BarChart3, GitCompare, BookOpen, History, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaktStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/simulador", label: "Simulador", icon: BarChart3 },
  { href: "/comparar", label: "Comparar", icon: GitCompare },
  { href: "/metodologia", label: "Metodología", icon: BookOpen },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/importar-exportar", label: "Importar / exportar", icon: ArrowLeftRight },
]

export default function Header() {
  const pathname = usePathname()
  const resetToPreset = useTaktStore((s) => s.resetToPreset)

  function handleReset() {
    if (confirm("¿Seguro? Se perderán todos los cambios.")) {
      resetToPreset()
    }
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 h-16 w-full border-b transition-colors backdrop-blur-md",
        pathname === "/" ? "bg-background/80" : "bg-white"
      )}>
        <div className="flex h-full items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-all hover:opacity-80"
          >
            <Factory className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Takt Studio</span>
          </Link>

          {pathname !== "/" && (
            <nav className="hidden flex-1 justify-center gap-2 md:flex">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                    pathname === href
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {pathname !== "/" && (
            <div className="ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="h-8 rounded-lg border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3 md:mr-2" />
                <span className="hidden md:inline">Reset</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {pathname !== "/" && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white pb-safe md:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                pathname === href 
                  ? "bg-primary text-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" 
                  : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
