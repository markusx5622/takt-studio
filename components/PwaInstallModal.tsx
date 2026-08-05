"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Download, X, Laptop, Smartphone, Share2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PwaInstallModal() {
  const t = useTranslations("appShell.pwaModal")
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [activeTab, setActiveTab] = useState<"desktop" | "ios" | "android">("desktop")

  useEffect(() => {
    // Check if user already dismissed the modal
    const dismissed = localStorage.getItem("takt-pwa-modal-dismissed")
    if (dismissed) return

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Automatically trigger modal after 3.5 seconds
    const timer = setTimeout(() => {
      setOpen(true)
    }, 3500)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("takt-pwa-modal-dismissed", "true")
    setOpen(false)
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null)
      }
    }
    handleDismiss()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-in zoom-in-95 slide-in-from-bottom-6 duration-300">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Badge & Title */}
        <div className="flex flex-col items-start gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            {t("badge")}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {t("title")}
          </h3>

          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {t("subtitle")}
          </p>
        </div>

        {/* Device Tabs */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold text-foreground/80">
            {t("guideTitle")}
          </p>
          <div className="flex gap-1.5 rounded-lg border border-slate-200/80 bg-muted/50 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
                activeTab === "desktop" ? "bg-background text-primary shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              PC / Mac
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
                activeTab === "ios" ? "bg-background text-primary shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              iOS (Safari)
            </button>
            <button
              onClick={() => setActiveTab("android")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
                activeTab === "android" ? "bg-background text-primary shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Android
            </button>
          </div>

          {/* Tab Content Box */}
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3.5 text-xs leading-relaxed text-foreground/80">
            {activeTab === "desktop" && <p>{t("stepDesktop")}</p>}
            {activeTab === "ios" && <p>{t("stepIos")}</p>}
            {activeTab === "android" && <p>{t("stepAndroid")}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
          >
            {t("dismissBtn")}
          </Button>

          <Button
            size="sm"
            onClick={handleInstallClick}
            className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-md"
          >
            <Download className="h-4 w-4" />
            {t("installBtn")}
          </Button>
        </div>
      </div>
    </div>
  )
}
