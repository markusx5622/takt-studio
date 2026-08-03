import { test, expect } from "@playwright/test"

// Smoke E2E de los flujos críticos, en ambos locales.
// ES se sirve sin prefijo (locale por defecto); EN bajo /en.
// La detección de locale del middleware usa Accept-Language, que en Chromium
// solo se controla con la opción `locale` del contexto (extraHTTPHeaders la pisa).

test.describe("ES (locale por defecto)", () => {
  test.use({ locale: "es-ES" })

  test("landing carga y navega al simulador", async ({ page }) => {
    await page.goto("/")
    const cta = page.getByRole("link", { name: /Empieza tu simulación ahora/i }).first()
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/simulador/)
    await expect(page.getByRole("heading", { name: /^Simulador$/ })).toBeVisible()
  })

  test("simulador: KPIs visibles y añadir estación", async ({ page }) => {
    await page.goto("/simulador")
    await expect(page.getByRole("heading", { name: /^Simulador$/ })).toBeVisible()
    await expect(page.getByText("Takt Time").first()).toBeVisible()

    await expect(page.getByText(/7 estaciones/)).toBeVisible()
    await page.getByRole("button", { name: /añadir estación/i }).click()
    await expect(page.getByText(/8 estaciones/)).toBeVisible()
  })

  test("historial e importar/exportar renderizan", async ({ page }) => {
    await page.goto("/historial")
    await expect(
      page.getByRole("heading", { name: /Historial de escenarios/ })
    ).toBeVisible()

    await page.goto("/importar-exportar")
    await expect(
      page.getByRole("heading", { name: /Importar y exportar/ })
    ).toBeVisible()
  })

  test("cambio de idioma a EN conserva la página", async ({ page }) => {
    await page.goto("/simulador")
    await page.getByRole("link", { name: /cambiar idioma a EN/i }).click()
    await expect(page).toHaveURL(/\/en\/simulador/)
    await expect(page.getByRole("heading", { name: /^Simulator$/ })).toBeVisible()
  })
})

test.describe("EN (/en)", () => {
  test.use({ locale: "en-US" })

  test("simulador EN renderiza", async ({ page }) => {
    await page.goto("/en/simulador")
    await expect(page.getByRole("heading", { name: /^Simulator$/ })).toBeVisible()
    await expect(page.getByText(/7 stations/)).toBeVisible()
  })

  test("comparar e importar/exportar EN renderizan", async ({ page }) => {
    await page.goto("/en/comparar")
    await expect(
      page.getByRole("heading", { name: /Compare scenarios/ })
    ).toBeVisible()

    await page.goto("/en/importar-exportar")
    await expect(
      page.getByRole("heading", { name: /Import and export/ })
    ).toBeVisible()
  })
})
