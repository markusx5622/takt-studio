import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export default function AboutSection() {
  const t = useTranslations("landing.about")

  return (
    <section className="reveal relative z-10 px-4 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 section-ambient-calm" />
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border bg-background p-8 shadow-sm md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
            {/* Text */}
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                {t("heading")}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/70">
                <p>
                  {t("p1A")}{" "}
                  <em className="not-italic font-medium text-foreground/80">what-if</em>{" "}
                  {t("p1B")}
                </p>
                <p>
                  {t("p2A")}{" "}
                  <a
                    href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                  >
                    Marc Cubero Cantavella
                  </a>{" "}
                  {t("p2B")}{" "}
                  <a
                    href="https://universidadeuropea.com/conocenos/valencia/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                  >
                    Universidad Europea de Valencia
                  </a>
                  . {t("p2C")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center gap-3.5">
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
              >
                <a
                  href="https://github.com/markusx5622/takt-studio"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t("repoAria")}
                >
                  <GithubIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground/90">{t("repo")}</span>
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-start gap-2.5 rounded-lg border-foreground/15 bg-muted/30 px-5 text-sm transition-all duration-200 hover:bg-muted hover:border-foreground/25"
              >
                <a
                  href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t("linkedinAria")}
                >
                  <LinkedinIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground/90">{t("linkedin")}</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
