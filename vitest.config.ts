import { defineConfig } from 'vitest/config'
import path from 'path'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/pdf-generator.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        // Suelo actual del repo (calibrado en P3.5): statements 83, branches 74,
        // functions 88, lines 85. Ratchet anti-regresión ~4 puntos por debajo.
        // store.ts queda por cubrir: migrate() de persist (líneas 362-387).
        statements: 78,
        branches: 68,
        functions: 82,
        lines: 79,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
