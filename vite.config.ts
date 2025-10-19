import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          radix: [
            '@radix-ui/react-tooltip',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-separator',
            '@radix-ui/react-select',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-progress',
            '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar',
            '@radix-ui/react-label',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-avatar',
            '@radix-ui/react-aspect-ratio',
          ],
          tanstack: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          uiutils: ['class-variance-authority', 'tailwind-merge', 'lucide-react', 'sonner'],
        }
      }
    },
    chunkSizeWarningLimit: 900,
  }
  ,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['/src/setupTests.ts'],
    css: true,
    exclude: [...configDefaults.exclude, 'e2e/**']
  }
})
