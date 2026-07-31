import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://takt-studio.vercel.app"
  const routes = [
    "",
    "/simulador",
    "/comparar",
    "/metodologia",
    "/historial",
    "/importar-exportar",
    "/legal",
    "/privacidad",
  ]
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/simulador" ? 0.9 : 0.6,
  }))
}
