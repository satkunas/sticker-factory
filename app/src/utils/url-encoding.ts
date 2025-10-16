/**
 * URL Encoding System
 * Compact JSON-based encoding for shareable URLs
 */

import type { AppState } from '../types/app-state'
import { logger } from './logger'

/**
 * Encoding format version - increment on breaking changes
 * v2: Modern encoding with TextEncoder/TextDecoder
 */
const ENCODING_VERSION = 2

/**
 * Template IDs are NOT compressed for URL stability
 * Adding new templates must never break existing URLs
 */

export const COLOR_PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#808080', '#800000', '#008000', '#000080',
  '#800080', '#808000', '#c0c0c0', '#404040',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
  '#f3f4f6', '#f9fafb', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4',
  '#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#fbbf24',
  '#f59e0b', '#d97706', '#92400e', '#78350f', '#451a03', '#7c2d12',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'
] as const

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
  'Tahoma': 'Z'
} as const

export const REVERSE_FONT_MAP = Object.fromEntries(
  Object.entries(FONT_MAP).map(([font, char]) => [char, font])
) as Record<string, string>

const PROP_MAP = {
  selectedTemplateId: 't',
  layers: 'l',
  id: 'i',
  type: 'y',
  text: 'x',
  fontSize: 's',
  fontWeight: 'w',
  fontColor: 'c',
  fontFamily: 'f',
  textPath: 'p',
  startOffset: 'q',
  dy: 'd',
  dominantBaseline: 'b',
  fill: 'F',
  stroke: 'S',
  strokeColor: 'C',
  strokeWidth: 'W',
  strokeOpacity: 'O',
  strokeLinejoin: 'j',
  svgImageId: 'v',
  svgContent: 'V',
  color: 'o',
  rotation: 'r',
  scale: 'a',
  transformOrigin: 'T'
} as const

const TYPE_MAP = {
  text: 't',
  shape: 's',
  svgImage: 'i'
} as const

const REVERSE_TYPE_MAP = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k])
) as Record<string, string>

function compressColor(hex: string): number | string {
  const idx = COLOR_PALETTE.indexOf(hex as typeof COLOR_PALETTE[number])
  return idx >= 0 ? idx : hex
}

function decompressColor(value: number | string): string {
  return typeof value === 'number' ? COLOR_PALETTE[value] : value
}

function compressFont(fontFamily: string): string {
  return (FONT_MAP as Record<string, string>)[fontFamily] || fontFamily
}

function decompressFont(value: string): string {
  return REVERSE_FONT_MAP[value] || value
}

function compressTemplateId(templateId: string): string {
  return templateId
}

function decompressTemplateId(value: string): string {
  return value
}

function stringToBase64Url(str: string): string {
  // eslint-disable-next-line no-undef
  const utf8Bytes = new TextEncoder().encode(str)

  let binaryString = ''
  utf8Bytes.forEach(byte => {
    binaryString += String.fromCharCode(byte)
  })

  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlToString(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  const binaryString = atob(padded)

  const utf8Bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    utf8Bytes[i] = binaryString.charCodeAt(i)
  }

  // eslint-disable-next-line no-undef
  return new TextDecoder().decode(utf8Bytes)
}

/**
 * Encode template state to compact URL-safe string
 * Only includes defined properties - no hardcoded defaults
 */
export function encodeTemplateStateCompact(state: AppState): string {
  try {
    const compressedTemplateId = state.selectedTemplateId ? compressTemplateId(state.selectedTemplateId) : null

    const compressedLayers = Array.isArray(state.layers) ? state.layers.map(layer => {
      const flatLayer: Record<string, unknown> = {
        [PROP_MAP.id]: layer.id,
        [PROP_MAP.type]: (TYPE_MAP as Record<string, string>)[layer.type] || layer.type
      }

      if (layer.text !== undefined) flatLayer[PROP_MAP.text] = layer.text
      if (layer.fontSize !== undefined) flatLayer[PROP_MAP.fontSize] = layer.fontSize
      if (layer.fontWeight !== undefined) flatLayer[PROP_MAP.fontWeight] = layer.fontWeight
      if (layer.fontColor !== undefined) flatLayer[PROP_MAP.fontColor] = compressColor(layer.fontColor)
      if (layer.font?.family !== undefined) flatLayer[PROP_MAP.fontFamily] = compressFont(layer.font.family)
      else if ('fontFamily' in layer && layer.fontFamily !== undefined) {
        flatLayer[PROP_MAP.fontFamily] = compressFont(layer.fontFamily as string)
      }

      if (layer.textPath !== undefined) flatLayer[PROP_MAP.textPath] = layer.textPath
      if (layer.startOffset !== undefined) flatLayer[PROP_MAP.startOffset] = layer.startOffset
      if (layer.dy !== undefined) flatLayer[PROP_MAP.dy] = layer.dy
      if (layer.dominantBaseline !== undefined) flatLayer[PROP_MAP.dominantBaseline] = layer.dominantBaseline

      if (layer.fill !== undefined) flatLayer[PROP_MAP.fill] = compressColor(layer.fill)
      if (layer.stroke !== undefined) flatLayer[PROP_MAP.stroke] = compressColor(layer.stroke)
      if (layer.strokeColor !== undefined) flatLayer[PROP_MAP.strokeColor] = compressColor(layer.strokeColor)
      if (layer.strokeWidth !== undefined) flatLayer[PROP_MAP.strokeWidth] = layer.strokeWidth
      if (layer.strokeOpacity !== undefined) flatLayer[PROP_MAP.strokeOpacity] = layer.strokeOpacity
      if (layer.strokeLinejoin !== undefined) flatLayer[PROP_MAP.strokeLinejoin] = layer.strokeLinejoin

      if (layer.svgImageId !== undefined) flatLayer[PROP_MAP.svgImageId] = layer.svgImageId
      if (layer.svgContent !== undefined) flatLayer[PROP_MAP.svgContent] = layer.svgContent
      if (layer.color !== undefined) flatLayer[PROP_MAP.color] = compressColor(layer.color)
      if (layer.rotation !== undefined) flatLayer[PROP_MAP.rotation] = layer.rotation
      if (layer.scale !== undefined) flatLayer[PROP_MAP.scale] = layer.scale
      if (layer.transformOrigin !== undefined) flatLayer[PROP_MAP.transformOrigin] = layer.transformOrigin

      return flatLayer
    }) : []

    const compressedState = {
      v: ENCODING_VERSION,
      [PROP_MAP.selectedTemplateId]: compressedTemplateId,
      [PROP_MAP.layers]: compressedLayers
    }

    const jsonString = JSON.stringify(compressedState)
    return stringToBase64Url(jsonString)
  } catch (error) {
    logger.warn('Failed to encode template state:', error)
    return ''
  }
}

/**
 * Decode template state from URL-safe string
 * Returns only encoded values - no hardcoded defaults
 */
export function decodeTemplateStateCompact(encoded: string): Partial<AppState> | null {
  try {
    if (!encoded || encoded.length < 1) return null

    const jsonString = base64UrlToString(encoded)

    if (!jsonString || jsonString.includes('\ufffd') || jsonString.includes('�')) {
      logger.warn('Invalid encoding format detected - URL may be from older version')
      return null
    }

    const compressedState = JSON.parse(jsonString)

    if (!compressedState.v || compressedState.v !== ENCODING_VERSION) {
      logger.warn(
        `Encoding version mismatch: expected v${ENCODING_VERSION}, got v${compressedState.v || 'none'}. ` +
        `This URL was created with an incompatible encoding format.`
      )
      return null
    }

    const compressedTemplateId = compressedState[PROP_MAP.selectedTemplateId]
    const compressedLayers = compressedState[PROP_MAP.layers]

    if (!compressedTemplateId || !Array.isArray(compressedLayers)) {
      logger.warn('Invalid compressed state structure')
      return null
    }

    const decompressedTemplateId = decompressTemplateId(compressedTemplateId)

    const decompressedLayers = compressedLayers.map((compressedLayer: Record<string, unknown>) => {
      const mappedLayer: Record<string, unknown> = {
        id: compressedLayer[PROP_MAP.id],
        type: REVERSE_TYPE_MAP[compressedLayer[PROP_MAP.type] as string] || compressedLayer[PROP_MAP.type]
      }

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

      if (compressedLayer[PROP_MAP.textPath] !== undefined) {
        mappedLayer.textPath = compressedLayer[PROP_MAP.textPath]
      }
      if (compressedLayer[PROP_MAP.startOffset] !== undefined) {
        mappedLayer.startOffset = compressedLayer[PROP_MAP.startOffset]
      }
      if (compressedLayer[PROP_MAP.dy] !== undefined) {
        mappedLayer.dy = compressedLayer[PROP_MAP.dy]
      }
      if (compressedLayer[PROP_MAP.dominantBaseline] !== undefined) {
        mappedLayer.dominantBaseline = compressedLayer[PROP_MAP.dominantBaseline]
      }

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

export function isValidEncodedState(encoded: string): boolean {
  if (!encoded || encoded.length < 1) return false

  try {
    const jsonString = base64UrlToString(encoded)
    const compressedState = JSON.parse(jsonString)

    if (!compressedState.v || compressedState.v !== ENCODING_VERSION) {
      return false
    }

    return !!(compressedState[PROP_MAP.selectedTemplateId] && Array.isArray(compressedState[PROP_MAP.layers]))
  } catch {
    return false
  }
}

export function generateShareableUrl(state: AppState): string {
  const encoded = encodeTemplateStateCompact(state)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/${encoded}`
}
