/* global Crypto, TextEncoder */
/**
 * Asset Hashing Utility
 *
 * Generates deterministic 8-character SHA-256 hashes for user-uploaded assets.
 * Critical for cross-user URL sharing - same content produces same hash.
 *
 * Architecture:
 * - Multi-asset support (SVG + fonts)
 * - Only SVG implemented (fonts future)
 * - Deterministic hashing (SHA-256 truncated to 8 chars)
 * - Content normalization for consistent hashing
 */

import { logger } from './logger'

// Asset type prefixes
export const ASSET_TYPE_PREFIX = {
  SVG: 'user-svg-',
  FONT: 'user-font-'  // Future: font support
} as const

export const ASSET_HASH_LENGTH = 8 // 8 hex chars = 32 bits

export type AssetType = 'svg' | 'font'

/**
 * Normalize SVG content for consistent hashing
 * Removes whitespace, comments, normalizes formatting
 */
export function normalizeSvgForHashing(svgContent: string): string {
  return svgContent
    .replace(/>\s+</g, '><')           // Remove whitespace between tags
    .replace(/\s+/g, ' ')              // Normalize all whitespace to single space
    .replace(/\s*(=)\s*/g, '$1')       // Remove spaces around =
    .replace(/\s+>/g, '>')             // Remove spaces before >
    .replace(/<!--.*?-->/gs, '')       // Remove comments (multiline)
    .trim()
}

/**
 * Normalize font content for hashing (no normalization needed - binary data)
 * Future: Font support
 */
export function normalizeFontForHashing(fontData: ArrayBuffer): ArrayBuffer {
  return fontData // Binary data doesn't need normalization
}

/**
 * Get crypto implementation (browser or Node.js)
 * Handles both browser Web Crypto API and Node.js crypto module
 */
function getCrypto(): Crypto {
  // Browser environment - check if crypto.subtle exists
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return window.crypto
  }
  // Node.js / Test environment (jsdom) - check global.crypto
  if (typeof global !== 'undefined' && global.crypto?.subtle) {
    return global.crypto as Crypto
  }
  // Fallback error
  throw new Error('Web Crypto API not available')
}

/**
 * Generate 8-character SHA-256 hash from content
 */
export async function generateAssetHash(content: string | ArrayBuffer): Promise<string> {
  try {
    const cryptoImpl = getCrypto()
    const data = typeof content === 'string'
      ? new TextEncoder().encode(content)
      : new Uint8Array(content)

    const hashBuffer = await cryptoImpl.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')

    return hashHex.substring(0, ASSET_HASH_LENGTH)
  } catch (error) {
    logger.error('Failed to generate asset hash:', error)
    throw new Error('Asset hash generation failed')
  }
}

/**
 * Create asset ID with type prefix
 */
export function createAssetId(hash: string, type: AssetType): string {
  const prefix = type === 'svg' ? ASSET_TYPE_PREFIX.SVG : ASSET_TYPE_PREFIX.FONT
  return `${prefix}${hash}`
}

/**
 * Check if an ID is a user asset
 */
export function isUserAssetId(id: string | undefined): boolean {
  return id?.startsWith('user-svg-') || id?.startsWith('user-font-') || false
}

/**
 * Check if an ID is a user SVG
 */
export function isUserSvgId(id: string | undefined): boolean {
  return id?.startsWith(ASSET_TYPE_PREFIX.SVG) ?? false
}

/**
 * Check if an ID is a user font
 * Future: Font support
 */
export function isUserFontId(id: string | undefined): boolean {
  return id?.startsWith(ASSET_TYPE_PREFIX.FONT) ?? false
}

/**
 * Extract hash from asset ID
 */
export function extractHashFromAssetId(assetId: string): string | null {
  if (isUserSvgId(assetId)) {
    return assetId.substring(ASSET_TYPE_PREFIX.SVG.length)
  }
  if (isUserFontId(assetId)) {
    return assetId.substring(ASSET_TYPE_PREFIX.FONT.length)
  }
  return null
}

/**
 * Validate that content matches expected hash
 */
export async function validateAssetHash(
  content: string | ArrayBuffer,
  expectedHash: string
): Promise<boolean> {
  try {
    const actualHash = await generateAssetHash(content)
    return actualHash === expectedHash
  } catch (error) {
    logger.warn('Asset hash validation failed:', error)
    return false
  }
}

/**
 * Generate complete asset ID from content
 */
export async function generateAssetId(
  content: string | ArrayBuffer,
  type: AssetType
): Promise<string> {
  const normalized = type === 'svg'
    ? normalizeSvgForHashing(content as string)
    : content
  const hash = await generateAssetHash(normalized)
  return createAssetId(hash, type)
}
