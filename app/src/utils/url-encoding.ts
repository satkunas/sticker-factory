/**
 * URL ENCODING/DECODING SYSTEM (JSON-based)
 * ==========================================
 *
 * This system encodes the current template and form state into a compact,
 * shareable URL fragment using JSON with Base64 encoding.
 *
 * DESIGN GOALS:
 * - Compact URL encoding for sharing
 * - NO HARDCODED FALLBACK VALUES
 * - Only encode defined properties
 * - Backwards compatible design
 *
 * URL STRUCTURE:
 * #/{base64_encoded_json_data}
 *
 * ENCODING RULES:
 * 1. Only encode properties that have defined values
 * 2. Never use hardcoded defaults or fallbacks
 * 3. Let the application handle undefined values
 */

import type { AppState } from '../types/app-state'
import { logger } from './logger'

// ============================================================================
// COMPRESSION DICTIONARIES AND MAPPING TABLES
// ============================================================================

/**
 * TEMPLATE ID COMPRESSION
 * =======================
 * Maps long template IDs to single characters for maximum compression.
 * Supports up to 62 templates using A-Z, a-z, 0-9.
 */
export const TEMPLATE_MAP = {
  'vinyl-record-label': 'A',
  'business-card': 'B',
  'event-promo-sticker': 'C',
  'conference-sticker': 'D',
  'quality-sticker': 'E',
  'booklet-cover': 'F',
  'catalog-page': 'G',
  'concert-ticket': 'H',
  'safety-alert-diamond': 'I',
  'shipping-label': 'J',
  'social-media-post': 'K',
  'social-media-announcement': 'L',
  'tech-company-sticker': 'M',
  'wellness-sticker': 'N',
  'youtube-thumbnail': 'O',
  'food-packaging-label': 'P',
  // Future templates: Q, R, S, T, U, V, W, X, Y, Z, a-z, 0-9
} as const

export const REVERSE_TEMPLATE_MAP = Object.fromEntries(
  Object.entries(TEMPLATE_MAP).map(([id, char]) => [char, id])
) as Record<string, string>

/**
 * COLOR PALETTE COMPRESSION
 * =========================
 * Common colors for normalization and comparison.
 * Custom colors are passed through as-is.
 */
export const COLOR_PALETTE = [
  // Basic colors (0-15)
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#808080', '#800000', '#008000', '#000080',
  '#800080', '#808000', '#c0c0c0', '#404040',

  // Material Design (16-31)
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',

  // Tailwind CSS (32-47)
  '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
  '#f3f4f6', '#f9fafb', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4',

  // Brand/UI colors (48-63)
  '#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#fbbf24',
  '#f59e0b', '#d97706', '#92400e', '#78350f', '#451a03', '#7c2d12',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'
] as const

/**
 * FONT FAMILY COMPRESSION
 * =======================
 * Popular fonts for normalization and comparison.
 */
export const FONT_MAP = {
  'Inter': 'A',
  'Arial': 'B',
  'Helvetica': 'C',
  'Roboto': 'D',
  'Open Sans': 'E',
  'Poppins': 'F',
  'Montserrat': 'G',
  'Oswald': 'H',
  'Lato': 'I',
  'Nunito': 'J',
  'Source Sans Pro': 'K',
  'Raleway': 'L',
  'Ubuntu': 'M',
  'Playfair Display': 'N',
  'Merriweather': 'O',
  'PT Sans': 'P',
  'Bebas Neue': 'Q',
  'Dancing Script': 'R',
  'Pacifico': 'S',
  'JetBrains Mono': 'T',
  'Source Code Pro': 'U',
  'Courier New': 'V',
  'Georgia': 'W',
  'Times New Roman': 'X',
  'Verdana': 'Y',
  'Tahoma': 'Z',
  // Future: a-z, 0-9, +, /
} as const

export const REVERSE_FONT_MAP = Object.fromEntries(
  Object.entries(FONT_MAP).map(([font, char]) => [char, font])
) as Record<string, string>

// ============================================================================
// MAIN ENCODING/DECODING FUNCTIONS
// ============================================================================

/**
 * FLAT ARCHITECTURE: Encode flat layer data for URL
 * Uses simple JSON encoding with Base64 for URL safety and readability
 *
 * NO HARDCODED FALLBACKS: Only includes properties that are actually defined
 */
export function encodeTemplateStateCompact(state: AppState): string {
  try {
    const stateData = {
      selectedTemplateId: state.selectedTemplateId,
      layers: Array.isArray(state.layers) ? state.layers.map(layer => {
        // FLAT ARCHITECTURE: Only include defined properties
        const flatLayer: Record<string, unknown> = {
          id: layer.id,
          type: layer.type
        }

        // Conditionally include flat properties - omit undefined values
        if (layer.text !== undefined) flatLayer.text = layer.text
        if (layer.fontSize !== undefined) flatLayer.fontSize = layer.fontSize
        if (layer.fontWeight !== undefined) flatLayer.fontWeight = layer.fontWeight
        if (layer.fontColor !== undefined) flatLayer.fontColor = layer.fontColor
        if (layer.font?.family !== undefined) flatLayer.fontFamily = layer.font.family  // Store font family name
        if (layer.fill !== undefined) flatLayer.fill = layer.fill
        if (layer.stroke !== undefined) flatLayer.stroke = layer.stroke
        if (layer.strokeColor !== undefined) flatLayer.strokeColor = layer.strokeColor
        if (layer.strokeWidth !== undefined) flatLayer.strokeWidth = layer.strokeWidth
        if (layer.strokeOpacity !== undefined) flatLayer.strokeOpacity = layer.strokeOpacity
        if (layer.strokeLinejoin !== undefined) flatLayer.strokeLinejoin = layer.strokeLinejoin
        if (layer.svgImageId !== undefined) flatLayer.svgImageId = layer.svgImageId
        if (layer.svgContent !== undefined) flatLayer.svgContent = layer.svgContent
        if (layer.color !== undefined) flatLayer.color = layer.color
        if (layer.rotation !== undefined) flatLayer.rotation = layer.rotation
        if (layer.scale !== undefined) flatLayer.scale = layer.scale

        return flatLayer
      }) : []
    }

    const jsonString = JSON.stringify(stateData)
    const base64 = btoa(unescape(encodeURIComponent(jsonString)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch (error) {
    logger.warn('Failed to encode template state:', error)
    return ''
  }
}

/**
 * FLAT ARCHITECTURE: Decode flat layer data from URL
 * Returns only the values that were encoded - NO HARDCODED DEFAULTS
 */
export function decodeTemplateStateCompact(encoded: string): Partial<AppState> | null {
  try {
    if (!encoded || encoded.length < 1) return null

    // Decode Base64 to JSON
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const jsonString = decodeURIComponent(escape(atob(padded)))
    const stateData = JSON.parse(jsonString)

    if (!stateData.selectedTemplateId || !Array.isArray(stateData.layers)) {
      return null
    }

    // Flat architecture layers - direct property access
    return {
      selectedTemplateId: stateData.selectedTemplateId,
      layers: stateData.layers.map((layer: Record<string, unknown>) => {
        // FLAT ARCHITECTURE: Map flat properties to store format
        // NO HARDCODED DEFAULTS: Only include properties that were encoded
        const mappedLayer: Record<string, unknown> = {
          id: layer.id,
          type: layer.type
        }

        // Map flat properties with correct naming - conditionally
        if (layer.text !== undefined) mappedLayer.text = layer.text
        if (layer.fontSize !== undefined) mappedLayer.fontSize = layer.fontSize
        if (layer.fontWeight !== undefined) mappedLayer.fontWeight = layer.fontWeight
        if (layer.fontColor !== undefined) mappedLayer.fontColor = layer.fontColor
        if (layer.fontFamily !== undefined) mappedLayer.fontFamily = layer.fontFamily  // Font family string
        if (layer.fill !== undefined) mappedLayer.fill = layer.fill
        if (layer.stroke !== undefined) mappedLayer.stroke = layer.stroke
        if (layer.strokeColor !== undefined) mappedLayer.strokeColor = layer.strokeColor
        if (layer.strokeWidth !== undefined) mappedLayer.strokeWidth = layer.strokeWidth
        if (layer.strokeOpacity !== undefined) mappedLayer.strokeOpacity = layer.strokeOpacity
        if (layer.strokeLinejoin !== undefined) mappedLayer.strokeLinejoin = layer.strokeLinejoin
        if (layer.svgImageId !== undefined) mappedLayer.svgImageId = layer.svgImageId
        if (layer.svgContent !== undefined) mappedLayer.svgContent = layer.svgContent
        if (layer.color !== undefined) mappedLayer.color = layer.color
        if (layer.rotation !== undefined) mappedLayer.rotation = layer.rotation
        if (layer.scale !== undefined) mappedLayer.scale = layer.scale

        return mappedLayer
      })
    }
  } catch (error) {
    logger.warn('Failed to decode template state:', error)
    return null
  }
}

/**
 * Validates if an encoded string can be decoded successfully
 * @param encoded Encoded string to validate
 * @returns True if valid, false otherwise
 */
export function isValidEncodedState(encoded: string): boolean {
  if (!encoded || encoded.length < 1) return false

  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const jsonString = decodeURIComponent(escape(atob(paddedBase64)))
    const stateData = JSON.parse(jsonString)

    // Validate structure
    return !!(stateData.selectedTemplateId && Array.isArray(stateData.layers))
  } catch {
    return false
  }
}

/**
 * Generates a complete shareable URL from current state
 * @param state Current app state
 * @returns Complete URL with domain and encoded fragment
 */
export function generateShareableUrl(state: AppState): string {
  const encoded = encodeTemplateStateCompact(state)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/${encoded}`
}
