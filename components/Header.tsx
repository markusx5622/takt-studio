"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { RotateCcw, BarChart3, GitCompare, BookOpen, History, ArrowLeftRight, Languages, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import BrandLogo from "@/components/BrandLogo"
import { useTaktStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/simulador", key: "simulador", icon: BarChart3 },
  { href: "/comparar", key: "comparar", icon: GitCompare },
  { href: "/metodologia", key: "metodologia", icon: BookOpen },
  { href: "/historial", key: "historial", icon: History },
  { href: "/importar-exportar", key: "importarExportar", icon: ArrowLeftRight },
] as const

export default function Header() {
  const t = useTranslations("header")
  const locale = useLocale()
  const pathname = usePathname()
  const resetToPreset = useTaktStore((s) => s.resetToPreset)
  const otherLocale = locale === "es" ? "en" : "es"
  const isAppRoute = navLinks.some((link) => link.href === pathname || pathname.startsWith(link.href))

  function handleReset() {
    if (confirm(t("resetConfirm"))) {
      resetToPreset()
    }
  }

  const languageToggle = (
    <Link
      href={pathname}
      locale={otherLocale}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={t("switchLocale", { locale: otherLocale.toUpperCase() })}
    >
      <Languages className="h-3.5 w-3.5" />
      {otherLocale}
    </Link>
  )

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 h-16 w-full border-b transition-colors backdrop-blur-md",
        !isAppRoute ? "bg-background/80" : "bg-white"
      )}>
        <div className="flex h-full items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-all hover:opacity-80"
          >
            <BrandLogo variant="horizontalLight" className="h-10 w-auto hidden md:block" />
            <BrandLogo variant="mark" className="h-9 w-auto md:hidden" />
          </Link>

          {isAppRoute && (
            <nav className="hidden flex-1 justify-center gap-2 md:flex">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={cn(
                    "relative flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    pathname === href
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>
          )}

          {!isAppRoute ? (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/simulador"
                className="group flex h-8 items-center gap-1.5 justify-center rounded-lg bg-primary px-3.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("access")}
                <ArrowRight className="h-3.5 w-3.5 text-white transition-transform group-hover:translate-x-0.5" />
              </Link>
              {languageToggle}
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              {languageToggle}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 rounded-lg border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3 md:mr-2" />
                <span className="hidden md:inline">{t("reset")}</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {isAppRoute && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white pb-safe md:hidden">
          {navLinks.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                pathname === href
                  ? "bg-primary text-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
                  : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(`nav.${key}`).split(" ")[0]}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
