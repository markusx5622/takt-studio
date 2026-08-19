import { defineConfig } from "@playwright/test"

const PORT = process.env.PORT || 3000
const HOST = "127.0.0.1"
const baseURL = `http://${HOST}:${PORT}`

// E2E contra el build de producción (next start).
// En CI el workflow hace `npm run build` antes; en local reuseExistingServer
// permite iterar con un servidor ya arrancado.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- -p ${PORT} -H ${HOST}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
