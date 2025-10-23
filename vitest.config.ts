import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['test/*/vitest.config.ts'],
  },
})
