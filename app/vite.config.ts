import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for main dependencies
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor'
            }
            if (id.includes('html2canvas') || id.includes('purify')) {
              return 'utils'
            }
            return 'libs'
          }

          // Template chunks - each template gets its own chunk
          if (id.includes('/templates/') && id.includes('.yaml')) {
            const templateName = id.split('/').pop()?.replace('.yaml', '')
            return `template-${templateName}`
          }

          // Font chunk
          if (id.includes('/config/fonts.ts')) {
            return 'fonts'
          }

          // SVG library chunks
          if (id.includes('/config/svg-library-loader.ts') || id.includes('/images/')) {
            return 'svg-assets'
          }

          // Component chunks for heavy components
          if (id.includes('DownloadModal.vue') || id.includes('SvgViewer.vue')) {
            return 'heavy-components'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    strictPort: true, // Fail if port is in use instead of trying another port
    host: true,
    open: false
  },
  preview: {
    port: 3000,
    host: true
  }
})