import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  test: {
    exclude: ['node_modules/**', 'dist/**', 'e2e/**/*.spec.ts']
  }
});
