"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Factory, RotateCcw, BarChart3, GitCompare, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaktStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/simulador", label: "Simulador", icon: BarChart3 },
  { href: "/comparar", label: "Comparar", icon: GitCompare },
  { href: "/metodologia", label: "Metodología", icon: BookOpen },
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
      <header className="sticky top-0 z-50 h-16 w-full border-b bg-background">
        <div className="flex h-full items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Factory className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Takt Studio</span>
          </Link>

          {pathname !== "/" && (
            <nav className="hidden flex-1 justify-center gap-6 md:flex">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === href
                      ? "text-primary underline underline-offset-4"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {pathname !== "/" && (
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Resetear datos</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {pathname !== "/" && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                pathname === href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
