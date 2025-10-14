import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import yaml from 'js-yaml'
import type { YamlTemplate, SimpleTemplate, FlatLayerData } from './src/types/template-types'
import { logger } from './src/utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Build Service Worker bundle using esbuild
async function buildServiceWorker(isDev = false) {
  const swSrcPath = path.resolve(__dirname, 'src/sw-src/index.ts')
  const swDistPath = isDev
    ? path.resolve(__dirname, 'public/sw-bundle.js')
    : path.resolve(__dirname, 'dist/sw-bundle.js')

  logger.info(`Building Service Worker (${isDev ? 'dev' : 'prod'})...`)

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

  logger.info(`Service Worker built: ${swDistPath}`)
}

// Template loading for Vite middleware (Node.js context)
async function loadTemplateForMiddleware(templateId: string): Promise<SimpleTemplate | null> {
  try {
    const templatePath = path.resolve(__dirname, `templates/${templateId}.yaml`)
    const yamlContent = await readFile(templatePath, 'utf-8')
    const yamlTemplate = yaml.load(yamlContent) as YamlTemplate

    // Calculate viewBox (matches main template-loader.ts logic)
    const viewBox = yamlTemplate.width && yamlTemplate.height
      ? {
          x: 0,
          y: 0,
          width: yamlTemplate.width,
          height: yamlTemplate.height
        }
      : yamlTemplate.viewBox || { x: 0, y: 0, width: 400, height: 400 }

    // Use dynamic import to load template-processing utilities
    const { processTemplateLayers } = await import('./src/utils/template-processing.js')
    const layers = await processTemplateLayers(yamlTemplate)

    return {
      id: yamlTemplate.id,
      name: yamlTemplate.name,
      description: yamlTemplate.description,
      width: yamlTemplate.width ?? viewBox.width,
      height: yamlTemplate.height ?? viewBox.height,
      viewBox,
      layers
    }
  } catch (error) {
    logger.error('Failed to load template:', templateId, error)
    return null
  }
}

// Generate SVG content from encoded state (for middleware fallback)
async function generateSvgFromState(encodedState: string): Promise<string | null> {
  try {
    // Use dynamic imports to load utilities (they use ES modules)
    const { decodeTemplateStateCompact } = await import('./src/utils/url-encoding.js')
    const { generateSvgString } = await import('./src/utils/svg-string-generator.js')
    const { calculateOptimalTransformOrigin } = await import('./src/utils/svg-bounds.js')

    // Decode state from URL
    const state = decodeTemplateStateCompact(encodedState)

    if (!state || !state.selectedTemplateId) {
      return null
    }

    // Load template
    const template = await loadTemplateForMiddleware(state.selectedTemplateId)

    if (!template) {
      return null
    }

    // CRITICAL: Compute transformOrigin for svgImage layers (same as Service Worker)
    const enhancedLayers = (state.layers || []).map((layer: FlatLayerData) => {
      // Only compute for svgImage layers that have content but no transformOrigin
      if (layer.type === 'svgImage' && layer.svgContent && !layer.transformOrigin) {
        try {
          const transformOrigin = calculateOptimalTransformOrigin(layer.svgContent)
          return { ...layer, transformOrigin }
        } catch (error) {
          // Fallback to geometric center of standard 24x24 viewBox
          logger.warn('Failed to calculate transformOrigin, using fallback:', error)
          return { ...layer, transformOrigin: { x: 12, y: 12 } }
        }
      }
      return layer
    })

    // Generate SVG string using unified generator
    const svgContent = generateSvgString(template, enhancedLayers)

    return svgContent
  } catch (error) {
    logger.error('SVG generation failed:', error)
    return null
  }
}

// Service Worker build plugin
function serviceWorkerPlugin() {
  return {
    name: 'service-worker-builder',
    configureServer: async (server) => {
      // Build Service Worker for dev mode
      await buildServiceWorker(true)

      // Add middleware BEFORE other middleware to intercept .svg URLs
      server.middlewares.use(async (req, res, next) => {
        // Match pattern: /{encodedState}.svg (not /images/*.svg or other paths)
        if (req.url && /^\/[A-Za-z0-9_-]+\.svg$/.test(req.url)) {
          // Extract encoded state from URL (remove leading / and trailing .svg)
          const encodedState = req.url.slice(1, -4)

          try {
            // Generate actual SVG content (same logic as Service Worker)
            const svgContent = await generateSvgFromState(encodedState)

            if (svgContent) {
              res.writeHead(200, {
                'Content-Type': 'image/svg+xml; charset=utf-8',
                'Cache-Control': 'no-cache', // Dev mode: no cache
                'X-Vite-Middleware': 'true'
              })
              res.end(svgContent)
              return
            }
          } catch (error) {
            logger.error('Middleware SVG generation error:', error)
          }

          // Fallback: return error SVG if generation failed
          res.writeHead(200, {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'X-SW-Fallback': 'error'
          })
          res.end('<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#fee" /><text x="200" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#c00">Invalid state encoding</text></svg>')
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