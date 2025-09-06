import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.{ts,tsx}'],
    watch: false,
    globals: true
  }
})

