import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/store/setup.ts'],
    include: ['tests/store/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/store/**', 'server/store/**'],
      reporter: ['text', 'html'],
    },
  },
})
