import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import BrandLogo from "@/components/BrandLogo"
import {
  ShieldCheck,
  FileText,
} from "lucide-react"

export default function LandingFooter() {
  const t = useTranslations("landing.footer")

  return (
<footer className="relative z-10 px-4 py-12">
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <BrandLogo variant="horizontalLight" className="h-9 w-auto mb-1" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">{t("tagline")}</span>
        <span className="text-[10px] text-foreground/30">{t("subtitle")}</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/privacidad"
          className="group flex items-center gap-2 rounded-full border border-foreground/5 bg-background/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50 transition-all hover:border-primary/20 hover:bg-background hover:text-primary"
        >
          <ShieldCheck className="h-3 w-3 transition-transform group-hover:scale-110" />
          {t("privacy")}
        </Link>
        <Link
          href="/legal"
          className="group flex items-center gap-2 rounded-full border border-foreground/5 bg-background/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50 transition-all hover:border-primary/20 hover:bg-background hover:text-primary"
        >
          <FileText className="h-3 w-3 transition-transform group-hover:scale-110" />
          {t("legal")}
        </Link>
      </div>

      <span className="text-[10px] text-foreground/30">{t("madeWith")}</span>
    </div>
  </footer>
  )
}
