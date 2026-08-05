"use client"

import { useTranslations } from "next-intl"
import { MonitorSmartphone } from "lucide-react"

export default function MobileNotice() {
  const t = useTranslations("appShell")

  return (
    <div className="sticky top-16 z-40 md:hidden flex items-center justify-center gap-2 py-2 px-4 bg-amber-50 border-b border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200 text-xs font-medium text-center">
      <MonitorSmartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t("mobileNotice")}</span>
    </div>
  )
}
