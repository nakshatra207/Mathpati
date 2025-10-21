import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // Ensure proper environment initialization
    environmentOptions: {
      happyDOM: {
        settings: {
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: false,
        }
      }
    }
  }
})
