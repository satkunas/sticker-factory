import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Build Service Worker bundle using esbuild
async function buildServiceWorker(isDev = false) {
  const swSrcPath = path.resolve(__dirname, 'src/sw-src/index.ts')
  const swDistPath = isDev
    ? path.resolve(__dirname, 'public/sw-bundle.js')
    : path.resolve(__dirname, 'dist/sw-bundle.js')

  console.log(`Building Service Worker (${isDev ? 'dev' : 'prod'})...`)

  await esbuild.build({
    entryPoints: [swSrcPath],
    bundle: true,
    minify: !isDev,
    sourcemap: isDev,
    format: 'iife',
    target: 'es2020',
    outfile: swDistPath,
    loader: {
      '.yaml': 'text'
    },
    define: {
      'import.meta.env.DEV': isDev ? 'true' : 'false',
      'import.meta.env.MODE': isDev ? '"development"' : '"production"',
      'import.meta.env.PROD': isDev ? 'false' : 'true'
    }
  })

  console.log(`Service Worker built: ${swDistPath}`)
}

// Service Worker build plugin
function serviceWorkerPlugin() {
  return {
    name: 'service-worker-builder',
    configureServer: async (server) => {
      // Build Service Worker for dev mode
      await buildServiceWorker(true)

      // Add middleware BEFORE other middleware to intercept .svg URLs
      server.middlewares.use((req, res, next) => {
        // Match pattern: /{encodedState}.svg (not /images/*.svg or other paths)
        if (req.url && /^\/[A-Za-z0-9_-]+\.svg$/.test(req.url)) {
          // Return placeholder - Service Worker will intercept and provide real content
          res.writeHead(200, {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'X-SW-Fallback': 'true'
          })
          res.end('<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" text-anchor="middle" font-size="10">Loading...</text></svg>')
          return
        }
        next()
      })
    },
    buildEnd: async () => {
      // Build Service Worker for production
      await buildServiceWorker(false)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), serviceWorkerPlugin()],
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