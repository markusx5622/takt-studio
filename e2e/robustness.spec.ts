import { test, expect } from "@playwright/test"

// Regresión E2E de robustez: headers de seguridad (R3), 404 bilingüe (R4),
// persistencia del simulador y páginas legales (R2).

test.describe("ES (locale por defecto)", () => {
  test.use({ locale: "es-ES" })

  test("headers de seguridad presentes en la respuesta", async ({ page }) => {
    const res = await page.goto("/")
    expect(res).not.toBeNull()
    const headers = res!.headers()
    expect(headers["content-security-policy"]).toContain("default-src 'self'")
    expect(headers["x-frame-options"]).toBe("DENY")
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin")
  })

  test("404 raíz devuelve 404 y muestra la página bilingüe", async ({
    page,
  }) => {
    const res = await page.goto("/ruta-que-no-existe")
    expect(res!.status()).toBe(404)
    await expect(
      page.getByText(/Página no encontrada · Page not found/)
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Volver al inicio · Back to home/ })
    ).toBeVisible()
  })

  test("persistencia: añadir estación sobrevive a una recarga", async ({
    page,
  }) => {
    await page.goto("/simulador")
    await page.getByRole("button", { name: /Crear mi primer escenario/i }).click()
    await page.getByRole("button", { name: /Cargar plantilla seleccionada/i }).click()
    await expect(page.getByText(/7 estaciones/)).toBeVisible()
    await page.getByRole("button", { name: /añadir estación/i }).click()
    await expect(page.getByText(/8 estaciones/)).toBeVisible()
    await page.reload()
    await expect(page.getByText(/8 estaciones/)).toBeVisible()
  })

  test("páginas legales renderizan en ES", async ({ page }) => {
    await page.goto("/legal")
    await expect(
      page.getByRole("heading", { name: /^Aviso Legal$/ })
    ).toBeVisible()
    await page.goto("/privacidad")
    await expect(
      page.getByRole("heading", { name: /^Privacidad$/ })
    ).toBeVisible()
    await page.goto("/metodologia")
    await expect(
      page.getByRole("heading", { name: /Metodología y supuestos del modelo/ })
    ).toBeVisible()
  })
})

test.describe("EN (/en)", () => {
  test.use({ locale: "en-US" })

  test("404 bajo /en devuelve 404 y muestra la página bilingüe raíz", async ({
    page,
  }) => {
    // Next.js sirve la not-found raíz para cualquier ruta desconocida,
    // también bajo /en (la de [locale] solo actúa ante notFound() interno).
    const res = await page.goto("/en/ruta-que-no-existe")
    expect(res!.status()).toBe(404)
    await expect(
      page.getByText(/Página no encontrada · Page not found/)
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Volver al inicio · Back to home/ })
    ).toBeVisible()
  })

  test("páginas legales renderizan en EN", async ({ page }) => {
    await page.goto("/en/legal")
    await expect(
      page.getByRole("heading", { name: /^Legal Notice$/ })
    ).toBeVisible()
    await page.goto("/en/privacidad")
    await expect(
      page.getByRole("heading", { name: /^Privacy$/ })
    ).toBeVisible()
  })
})
