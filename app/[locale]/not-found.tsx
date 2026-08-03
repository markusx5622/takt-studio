import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

const ISSUES_URL = "https://github.com/markusx5622/takt-studio/issues"

export default function NotFound() {
  const t = useTranslations("notFound")

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-foreground/60">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {t("backHome")}
      </Link>
      <a
        href={ISSUES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs text-foreground/60 underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t("report")}
      </a>
    </div>
  )
}
