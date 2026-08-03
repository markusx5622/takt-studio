import { defineConfig } from 'vitest/config'
import path from 'path'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'types/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        // Suelo actual del repo (calibrado en P3): statements 49, branches 47,
        // functions 34, lines 53. Los umbrales van ~4 puntos por debajo como
        // ratchet anti-regresión; subirlos requiere tests nuevos de
        // store.ts / insights.ts / store-names.ts (pendiente).
        statements: 45,
        branches: 40,
        functions: 30,
        lines: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
