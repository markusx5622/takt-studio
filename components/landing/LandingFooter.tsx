"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import BrandLogo from "@/components/BrandLogo"
import {
  ShieldCheck,
  FileText,
  ArrowUp,
  ExternalLink,
  Lock,
  Layers,
  BarChart3,
  GitCompare,
  BookOpen,
  History,
  ArrowLeftRight,
  Sparkles,
  Sliders,
} from "lucide-react"

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export default function LandingFooter() {
  const t = useTranslations("landing.footer")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl px-4 pt-16 pb-12">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Top Hero / Brand Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-8 border-b border-border/40">
          <div className="max-w-xl space-y-3">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo variant="horizontalLight" className="h-9 w-auto" priority />
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("brandDesc")}
            </p>
          </div>

          {/* System status badge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-foreground/90 backdrop-blur-md self-start lg:self-auto transition-all hover:border-primary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{t("status")}</span>
          </div>
        </div>

        {/* 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Producto */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/90">{t("colProduct")}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/simulador" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
                  {t("simulador")}
                </Link>
              </li>
              <li>
                <Link href="/comparar" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <GitCompare className="h-3.5 w-3.5 text-primary/70" />
                  {t("comparar")}
                </Link>
              </li>
              <li>
                <Link href="/metodologia" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <BookOpen className="h-3.5 w-3.5 text-primary/70" />
                  {t("metodologia")}
                </Link>
              </li>
              <li>
                <Link href="/historial" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <History className="h-3.5 w-3.5 text-primary/70" />
                  {t("historial")}
                </Link>
              </li>
              <li>
                <Link href="/importar-exportar" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-primary/70" />
                  {t("importarExportar")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Recursos */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/90">{t("colResources")}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/metodologia" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <Layers className="h-3.5 w-3.5 text-primary/70" />
                  {t("guide")}
                </Link>
              </li>
              <li>
                <Link href="/simulador" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                  {t("preset")}
                </Link>
              </li>
              <li>
                <Link href="/simulador" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <Sliders className="h-3.5 w-3.5 text-primary/70" />
                  {t("monteCarlo")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/markusx5622/takt-studio"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  <GithubIcon className="h-3.5 w-3.5 text-primary/70" />
                  {t("githubRepo")}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & RGPD */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/90">{t("colLegal")}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/privacidad" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <FileText className="h-3.5 w-3.5 text-primary/70" />
                  {t("legal")}
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  {t("gdpr")}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Desarrollo & Contacto */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/90">{t("colAuthor")}</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="font-semibold text-foreground/80">{t("authorName")}</li>
              <li className="text-muted-foreground">{t("authorRole")}</li>
              <li className="flex items-center gap-2 text-muted-foreground/80">
                <span>{t("uev")}</span>
                <Image
                  src="/logo-uev.png"
                  alt="Universidad Europea de Valencia"
                  width={140}
                  height={28}
                  className="h-5 w-auto object-contain shrink-0"
                />
              </li>
              <li className="pt-1 flex items-center gap-3">
                <a
                  href="mailto:taktstudio.app@gmail.com"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t("contact")}
                </a>
                <a
                  href="https://github.com/markusx5622/takt-studio/issues"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t("reportIssue")}
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
                <a
                  href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-Footer / Copyright & Scroll Top */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-border/40 text-xs text-muted-foreground sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p>{t("copyright")}</p>
            <p className="text-[11px] text-muted-foreground/60">{t("stackNote")}</p>
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-background hover:text-primary"
          >
            <span>{t("scrollTop")}</span>
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
