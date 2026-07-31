import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale, getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import "../globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import Header from "@/components/Header"
import { Analytics } from "@vercel/analytics/react"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    metadataBase: new URL("https://takt-studio.vercel.app"),
    title: t("title"),
    description: t("description"),
    keywords: [
      "takt time",
      "simulador producción",
      "production line simulator",
      "lean manufacturing",
      "línea de producción",
      "cuello de botella",
      "bottleneck analysis",
      "ingeniería organización industrial",
    ],
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "https://takt-studio.vercel.app",
      siteName: "Takt Studio",
      locale: locale === "en" ? "en_US" : "es_ES",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("twitterDescription"),
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", type: "image/png" },
      ],
      shortcut: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body className="font-sans antialiased bg-[#f1f5f9]">
        <NextIntlClientProvider>
          <TooltipProvider>
            <Header />
            <main className="pb-16 md:pb-0">{children}</main>
          </TooltipProvider>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
