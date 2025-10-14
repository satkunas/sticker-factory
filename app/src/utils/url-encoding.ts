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
// ENCODING VERSION
// ============================================================================

/**
 * Encoding format version
 *
 * INCREMENT THIS on any breaking changes to encoding format:
 * - Changes to compression dictionaries (TEMPLATE_MAP, FONT_MAP, etc.)
 * - Changes to property mapping (PROP_MAP)
 * - Changes to encode/decode algorithms
 *
 * Version History:
 * - v2: Modern encoding with TextEncoder/TextDecoder (current, initial versioned release)
 */
const ENCODING_VERSION = 2

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

/**
 * PROPERTY NAME COMPRESSION
 * =========================
 * Maps long property names to single characters for maximum compression.
 * Uses lowercase for text layer properties, uppercase for shape layer properties.
 */
const PROP_MAP = {
  // State level
  selectedTemplateId: 't',
  layers: 'l',
  // Layer common
  id: 'i',
  type: 'y',
  // Text layer (lowercase)
  text: 'x',
  fontSize: 's',
  fontWeight: 'w',
  fontColor: 'c',
  fontFamily: 'f',
  // Shape layer (uppercase)
  fill: 'F',
  stroke: 'S',
  strokeColor: 'C',
  strokeWidth: 'W',
  strokeOpacity: 'O',
  strokeLinejoin: 'j',
  // SVG image layer
  svgImageId: 'v',
  svgContent: 'V',
  color: 'o',
  rotation: 'r',
  scale: 'a',
  transformOrigin: 'T'
} as const

/**
 * TYPE VALUE COMPRESSION
 * ======================
 * Maps layer types to single characters.
 */
const TYPE_MAP = {
  text: 't',
  shape: 's',
  svgImage: 'i'
} as const

const REVERSE_TYPE_MAP = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k])
) as Record<string, string>

/**
 * Compress a color hex value to palette index or keep as-is
 * @param hex Color hex string like "#ff0000"
 * @returns Palette index (0-63) or original hex string
 */
function compressColor(hex: string): number | string {
  const idx = COLOR_PALETTE.indexOf(hex as typeof COLOR_PALETTE[number])
  return idx >= 0 ? idx : hex
}

/**
 * Decompress a palette index or hex string back to hex
 * @param value Palette index or hex string
 * @returns Color hex string
 */
function decompressColor(value: number | string): string {
  return typeof value === 'number' ? COLOR_PALETTE[value] : value
}

/**
 * Compress a font family name to single character or keep as-is
 * @param fontFamily Font family name like "Inter"
 * @returns Single character or original font name
 */
function compressFont(fontFamily: string): string {
  return (FONT_MAP as Record<string, string>)[fontFamily] || fontFamily
}

/**
 * Decompress a font character back to font family name
 * @param value Single character or font family name
 * @returns Font family name
 */
function decompressFont(value: string): string {
  return REVERSE_FONT_MAP[value] || value
}

/**
 * Compress a template ID to single character
 * @param templateId Template ID like "vinyl-record-label"
 * @returns Single character
 */
function compressTemplateId(templateId: string): string {
  return (TEMPLATE_MAP as Record<string, string>)[templateId] || templateId
}

/**
 * Decompress a template character back to template ID
 * @param value Single character
 * @returns Template ID
 */
function decompressTemplateId(value: string): string {
  return REVERSE_TEMPLATE_MAP[value] || value
}

// ============================================================================
// MODERN UTF-8 ENCODING/DECODING HELPERS
// ============================================================================

/**
 * Convert a UTF-8 string to Base64-URL-safe encoding (modern, safe method)
 * Replaces deprecated escape() + unescape() pattern
 */
function stringToBase64Url(str: string): string {
  // Convert string to UTF-8 bytes
  // eslint-disable-next-line no-undef
  const utf8Bytes = new TextEncoder().encode(str)

  // Convert bytes to binary string
  let binaryString = ''
  utf8Bytes.forEach(byte => {
    binaryString += String.fromCharCode(byte)
  })

  // Base64 encode and make URL-safe
  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Convert Base64-URL-safe encoding back to UTF-8 string (modern, safe method)
 * Replaces deprecated escape() + unescape() pattern
 */
function base64UrlToString(base64url: string): string {
  // Restore standard Base64 format
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if needed
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)

  // Decode Base64 to binary string
  const binaryString = atob(padded)

  // Convert binary string to UTF-8 bytes
  const utf8Bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    utf8Bytes[i] = binaryString.charCodeAt(i)
  }

  // Decode UTF-8 bytes to string
  // eslint-disable-next-line no-undef
  return new TextDecoder().decode(utf8Bytes)
}

// ============================================================================
// MAIN ENCODING/DECODING FUNCTIONS
// ============================================================================

/**
 * FLAT ARCHITECTURE: Encode flat layer data for URL with compression
 * Uses compressed property names, template/font/color compression, and Base64
 *
 * NO HARDCODED FALLBACKS: Only includes properties that are actually defined
 */
export function encodeTemplateStateCompact(state: AppState): string {
  try {
    // Compress template ID
    const compressedTemplateId = state.selectedTemplateId ? compressTemplateId(state.selectedTemplateId) : null

    // Compress layers
    const compressedLayers = Array.isArray(state.layers) ? state.layers.map(layer => {
      // FLAT ARCHITECTURE: Only include defined properties with compressed keys
      const flatLayer: Record<string, unknown> = {
        [PROP_MAP.id]: layer.id,
        [PROP_MAP.type]: (TYPE_MAP as Record<string, string>)[layer.type] || layer.type
      }

      // Text layer properties (lowercase keys)
      if (layer.text !== undefined) flatLayer[PROP_MAP.text] = layer.text
      if (layer.fontSize !== undefined) flatLayer[PROP_MAP.fontSize] = layer.fontSize
      if (layer.fontWeight !== undefined) flatLayer[PROP_MAP.fontWeight] = layer.fontWeight
      if (layer.fontColor !== undefined) flatLayer[PROP_MAP.fontColor] = compressColor(layer.fontColor)
      // Support both font.family and direct fontFamily
      if (layer.font?.family !== undefined) flatLayer[PROP_MAP.fontFamily] = compressFont(layer.font.family)
      // Handle layers that have fontFamily directly (from test data or legacy format)
      else if ('fontFamily' in layer && layer.fontFamily !== undefined) {
        flatLayer[PROP_MAP.fontFamily] = compressFont(layer.fontFamily as string)
      }

      // Shape layer properties (uppercase keys)
      if (layer.fill !== undefined) flatLayer[PROP_MAP.fill] = compressColor(layer.fill)
      if (layer.stroke !== undefined) flatLayer[PROP_MAP.stroke] = compressColor(layer.stroke)
      if (layer.strokeColor !== undefined) flatLayer[PROP_MAP.strokeColor] = compressColor(layer.strokeColor)
      if (layer.strokeWidth !== undefined) flatLayer[PROP_MAP.strokeWidth] = layer.strokeWidth
      if (layer.strokeOpacity !== undefined) flatLayer[PROP_MAP.strokeOpacity] = layer.strokeOpacity
      if (layer.strokeLinejoin !== undefined) flatLayer[PROP_MAP.strokeLinejoin] = layer.strokeLinejoin

      // SVG image layer properties
      if (layer.svgImageId !== undefined) flatLayer[PROP_MAP.svgImageId] = layer.svgImageId
      if (layer.svgContent !== undefined) flatLayer[PROP_MAP.svgContent] = layer.svgContent
      if (layer.color !== undefined) flatLayer[PROP_MAP.color] = compressColor(layer.color)
      if (layer.rotation !== undefined) flatLayer[PROP_MAP.rotation] = layer.rotation
      if (layer.scale !== undefined) flatLayer[PROP_MAP.scale] = layer.scale
      if (layer.transformOrigin !== undefined) flatLayer[PROP_MAP.transformOrigin] = layer.transformOrigin

      return flatLayer
    }) : []

    // Build compressed state object with version header
    const compressedState = {
      v: ENCODING_VERSION,  // Version header for format detection
      [PROP_MAP.selectedTemplateId]: compressedTemplateId,
      [PROP_MAP.layers]: compressedLayers
    }

    const jsonString = JSON.stringify(compressedState)
    // Use modern, safe encoding (replaces deprecated unescape/encodeURIComponent pattern)
    return stringToBase64Url(jsonString)
  } catch (error) {
    logger.warn('Failed to encode template state:', error)
    return ''
  }
}

/**
 * FLAT ARCHITECTURE: Decode flat layer data from URL with decompression
 * Returns only the values that were encoded - NO HARDCODED DEFAULTS
 */
export function decodeTemplateStateCompact(encoded: string): Partial<AppState> | null {
  try {
    if (!encoded || encoded.length < 1) return null

    // Use modern, safe decoding (replaces deprecated escape/decodeURIComponent pattern)
    const jsonString = base64UrlToString(encoded)

    // Validate JSON before parsing to detect encoding format mismatches
    if (!jsonString || jsonString.includes('\ufffd') || jsonString.includes('�')) {
      logger.warn('Invalid encoding format detected - URL may be from older version')
      return null
    }

    const compressedState = JSON.parse(jsonString)

    // VERSION CHECK - Reject URLs without version or with wrong version
    if (!compressedState.v || compressedState.v !== ENCODING_VERSION) {
      logger.warn(
        `Encoding version mismatch: expected v${ENCODING_VERSION}, got v${compressedState.v || 'none'}. ` +
        `This URL was created with an incompatible encoding format.`
      )
      return null
    }

    // Access compressed property names
    const compressedTemplateId = compressedState[PROP_MAP.selectedTemplateId]
    const compressedLayers = compressedState[PROP_MAP.layers]

    if (!compressedTemplateId || !Array.isArray(compressedLayers)) {
      logger.warn('Invalid compressed state structure')
      return null
    }

    // Decompress template ID
    const decompressedTemplateId = decompressTemplateId(compressedTemplateId)

    // Decompress layers
    const decompressedLayers = compressedLayers.map((compressedLayer: Record<string, unknown>) => {
      // FLAT ARCHITECTURE: Map compressed properties back to store format
      // NO HARDCODED DEFAULTS: Only include properties that were encoded
      const mappedLayer: Record<string, unknown> = {
        id: compressedLayer[PROP_MAP.id],
        type: REVERSE_TYPE_MAP[compressedLayer[PROP_MAP.type] as string] || compressedLayer[PROP_MAP.type]
      }

      // Text layer properties (lowercase keys)
      if (compressedLayer[PROP_MAP.text] !== undefined) {
        mappedLayer.text = compressedLayer[PROP_MAP.text]
      }
      if (compressedLayer[PROP_MAP.fontSize] !== undefined) {
        mappedLayer.fontSize = compressedLayer[PROP_MAP.fontSize]
      }
      if (compressedLayer[PROP_MAP.fontWeight] !== undefined) {
        mappedLayer.fontWeight = compressedLayer[PROP_MAP.fontWeight]
      }
      if (compressedLayer[PROP_MAP.fontColor] !== undefined) {
        mappedLayer.fontColor = decompressColor(compressedLayer[PROP_MAP.fontColor] as number | string)
      }
      if (compressedLayer[PROP_MAP.fontFamily] !== undefined) {
        mappedLayer.fontFamily = decompressFont(compressedLayer[PROP_MAP.fontFamily] as string)
      }

      // Shape layer properties (uppercase keys)
      if (compressedLayer[PROP_MAP.fill] !== undefined) {
        mappedLayer.fill = decompressColor(compressedLayer[PROP_MAP.fill] as number | string)
      }
      if (compressedLayer[PROP_MAP.stroke] !== undefined) {
        mappedLayer.stroke = decompressColor(compressedLayer[PROP_MAP.stroke] as number | string)
      }
      if (compressedLayer[PROP_MAP.strokeColor] !== undefined) {
        mappedLayer.strokeColor = decompressColor(compressedLayer[PROP_MAP.strokeColor] as number | string)
      }
      if (compressedLayer[PROP_MAP.strokeWidth] !== undefined) {
        mappedLayer.strokeWidth = compressedLayer[PROP_MAP.strokeWidth]
      }
      if (compressedLayer[PROP_MAP.strokeOpacity] !== undefined) {
        mappedLayer.strokeOpacity = compressedLayer[PROP_MAP.strokeOpacity]
      }
      if (compressedLayer[PROP_MAP.strokeLinejoin] !== undefined) {
        mappedLayer.strokeLinejoin = compressedLayer[PROP_MAP.strokeLinejoin]
      }

      // SVG image layer properties
      if (compressedLayer[PROP_MAP.svgImageId] !== undefined) {
        mappedLayer.svgImageId = compressedLayer[PROP_MAP.svgImageId]
      }
      if (compressedLayer[PROP_MAP.svgContent] !== undefined) {
        mappedLayer.svgContent = compressedLayer[PROP_MAP.svgContent]
      }
      if (compressedLayer[PROP_MAP.color] !== undefined) {
        mappedLayer.color = decompressColor(compressedLayer[PROP_MAP.color] as number | string)
      }
      if (compressedLayer[PROP_MAP.rotation] !== undefined) {
        mappedLayer.rotation = compressedLayer[PROP_MAP.rotation]
      }
      if (compressedLayer[PROP_MAP.scale] !== undefined) {
        mappedLayer.scale = compressedLayer[PROP_MAP.scale]
      }
      if (compressedLayer[PROP_MAP.transformOrigin] !== undefined) {
        mappedLayer.transformOrigin = compressedLayer[PROP_MAP.transformOrigin]
      }

      return mappedLayer
    })

    return {
      selectedTemplateId: decompressedTemplateId,
      layers: decompressedLayers
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
    // Use modern, safe decoding (replaces deprecated escape/decodeURIComponent pattern)
    const jsonString = base64UrlToString(encoded)
    const compressedState = JSON.parse(jsonString)

    // Validate version compatibility - require version field
    if (!compressedState.v || compressedState.v !== ENCODING_VERSION) {
      return false  // Reject URLs without version or with wrong version
    }

    // Validate compressed structure
    return !!(compressedState[PROP_MAP.selectedTemplateId] && Array.isArray(compressedState[PROP_MAP.layers]))
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
