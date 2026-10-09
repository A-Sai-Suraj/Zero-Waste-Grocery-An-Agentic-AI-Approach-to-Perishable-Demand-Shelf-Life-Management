import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./scripts/load-test-env.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
