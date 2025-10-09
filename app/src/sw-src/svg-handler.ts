/* eslint-env serviceworker */
/* eslint-disable no-undef */
/**
 * SVG Request Handler for Service Worker
 * ======================================
 *
 * Handles .svg URL requests, generates SVG content, and manages caching
 */

import { loadTemplate } from './sw-template-loader'
import { generateSvgString } from '../utils/svg-string-generator'
import { decodeTemplateStateCompact } from '../utils/url-encoding'
import { logger } from '../utils/logger'
import { calculateOptimalTransformOrigin } from '../utils/svg-bounds'
import type { FlatLayerData } from '../types/template-types'

// Cache name for SVG responses
const CACHE_NAME = 'sticker-factory-svg-v1'

/**
 * Handle SVG request: decode state, load template, generate SVG
 */
export async function handleSvgRequest(url: URL, request: Request): Promise<Response> {
  try {
    // Extract encoded state from URL path (remove leading / and trailing .svg)
    const encodedState = url.pathname.slice(1, -4)

    // Check cache first
    const cache = await caches.open(CACHE_NAME)
    const cacheKey = new Request(url.toString())
    const cached = await cache.match(cacheKey)

    if (cached) {
      logger.debug('SVG cache hit:', url.pathname)
      return cached.clone()
    }

    logger.debug('SVG cache miss, generating:', url.pathname)

    // Decode state from URL
    const state = decodeTemplateStateCompact(encodedState)

    if (!state || !state.selectedTemplateId) {
      return createErrorResponse('Invalid state encoding', 400)
    }

    // Load template (basic metadata only)
    const template = await loadTemplate(state.selectedTemplateId)

    if (!template) {
      return createErrorResponse('Template not found', 404)
    }

    // CRITICAL: Compute transformOrigin for svgImage layers (same as store does)
    // This ensures IDENTICAL rendering between main app and .svg URLs
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

    // Create response
    const response = new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...getCorsHeaders(request)
      },
      status: 200
    })

    // Cache the response
    await cache.put(cacheKey, response.clone())

    logger.debug('SVG generated and cached:', url.pathname)

    return response
  } catch (error) {
    logger.error('SVG generation failed:', error)
    return createErrorResponse('SVG generation failed', 500)
  }
}

/**
 * Create error SVG response
 */
function createErrorResponse(message: string, status: number): Response {
  const errorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
  <rect width="400" height="200" fill="#fee" />
  <text x="200" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#c00">
    ${escapeXml(message)}
  </text>
</svg>`

  return new Response(errorSvg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache'
    },
    status
  })
}

/**
 * Get CORS headers for response
 */
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin')

  // Only allow same-origin requests
  if (origin && isOriginAllowed(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    }
  }

  return {}
}

/**
 * Check if origin is allowed (same-origin only)
 */
function isOriginAllowed(origin: string): boolean {
  try {
    const requestOrigin = new URL(origin)
    const selfOrigin = new URL(self.location.href)
    return requestOrigin.origin === selfOrigin.origin
  } catch {
    return false
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
