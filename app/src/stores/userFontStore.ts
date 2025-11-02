/* global FontFace */
/**
 * User Font Store
 * ===============
 *
 * Manages user-uploaded fonts with localStorage persistence.
 * Supports font file uploads with validation and browser registration.
 *
 * Architecture:
 * - Fonts stored as base64 data URIs in localStorage
 * - Deterministic hashing (same content = same ID)
 * - Browser font registration using CSS @font-face
 * - Validation: file size, format, structure
 */

import { ref, computed } from 'vue'
import { logger } from '../utils/logger'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'
import { generateAssetId, isUserFontId } from '../utils/asset-hash'
import { readFileAsArrayBuffer, arrayBufferToBase64 } from '../utils/file-io'
import { detectFontFormat } from '../utils/font-validation'

// Supported font formats
export const SUPPORTED_FONT_FORMATS = [
  'woff2',
  'woff',
  'truetype', // .ttf
  'opentype'  // .otf
] as const

export type FontFormat = typeof SUPPORTED_FONT_FORMATS[number]

export interface UserFontItem {
  id: string           // Format: user-font-{8charHash}
  name: string         // Display name (from filename)
  fontData: string     // Base64-encoded font file
  format: FontFormat   // Font format (woff2, woff, truetype, opentype)
  uploadDate: number   // Timestamp
}

// Global state
const _items = ref<UserFontItem[]>([])
const _isLoaded = ref(false)

/**
 * Load user fonts from localStorage
 */
export async function loadUserFonts(): Promise<UserFontItem[]> {
  try {
    const stored = localStorage.getItem(USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY)

    if (!stored) {
      _items.value = []
      _isLoaded.value = true
      return []
    }

    const parsed = JSON.parse(stored) as UserFontItem[]

    // Validate and filter items
    const validItems = parsed.filter(item => {
      // Basic validation
      if (!item.id || !item.name || !item.fontData || !item.format) {
        logger.warn('Invalid font item found, skipping:', item.id)
        return false
      }

      // Check ID format
      if (!isUserFontId(item.id)) {
        logger.warn('Invalid font ID format:', item.id)
        return false
      }

      return true
    })

    // Sort by upload date (newest first)
    validItems.sort((a, b) => b.uploadDate - a.uploadDate)

    _items.value = validItems
    _isLoaded.value = true

    // Register all loaded fonts with the browser
    validItems.forEach(font => {
      registerFontFace(font)
    })

    logger.info(`Loaded ${validItems.length} user fonts from localStorage`)
    return validItems
  } catch (error) {
    logger.error('Failed to load user fonts from localStorage:', error)
    _items.value = []
    _isLoaded.value = true
    return []
  }
}

/**
 * Register font with browser using CSS @font-face
 */
function registerFontFace(font: UserFontItem): void {
  try {
    const fontFace = new FontFace(
      font.id, // Use font ID as family name for uniqueness
      `url(data:font/${font.format};base64,${font.fontData})`,
      {
        weight: '100 900', // Support all weights
        style: 'normal'
      }
    )

    fontFace.load().then(loadedFace => {
      // @ts-expect-error - FontFaceSet.add is not in TypeScript definitions
      document.fonts.add(loadedFace)
      logger.debug('Registered font:', font.name)
    }).catch(err => {
      logger.warn('Failed to register font:', font.name, err)
    })
  } catch (error) {
    logger.warn('Failed to create FontFace for:', font.name, error)
  }
}

/**
 * Add a new user font
 * @returns The created font item, or null if validation failed
 */
export async function addUserFont(
  fontFile: File,
  fontName?: string
): Promise<UserFontItem | null> {
  try {
    // Validate file size
    if (fontFile.size > USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES) {
      const sizeMB = (fontFile.size / 1024 / 1024).toFixed(1)
      const maxMB = (USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES / 1024 / 1024).toFixed(0)
      throw new Error(`Font too large: ${sizeMB}MB (max ${maxMB}MB)`)
    }

    // Check font count limit
    if (_items.value.length >= USER_ASSET_CONFIG.MAX_FONT_COUNT) {
      throw new Error(`Maximum ${USER_ASSET_CONFIG.MAX_FONT_COUNT} fonts allowed`)
    }

    // Detect font format from file extension or MIME type
    const format = detectFontFormat(fontFile)
    if (!format) {
      throw new Error('Unsupported font format. Please upload .woff2, .woff, .ttf, or .otf files')
    }

    // Read font file as ArrayBuffer
    const fontData = await readFileAsArrayBuffer(fontFile)

    // Generate deterministic ID from font data
    const fontId = await generateAssetId(fontData, 'font')

    // Check for duplicates
    if (_items.value.some(item => item.id === fontId)) {
      logger.warn('Font already exists:', fontId)
      throw new Error('This font has already been uploaded')
    }

    // Convert to base64 for storage
    const base64Data = arrayBufferToBase64(fontData)

    // Create font item
    const fontItem: UserFontItem = {
      id: fontId,
      name: fontName || fontFile.name.replace(/\.(woff2?|[ot]tf)$/i, ''),
      fontData: base64Data,
      format,
      uploadDate: Date.now()
    }

    // Add to collection
    _items.value.unshift(fontItem)

    // Save to localStorage
    await saveToLocalStorage()

    // Register font with browser
    registerFontFace(fontItem)

    logger.info('Added user font:', fontItem.name, fontItem.id)
    return fontItem
  } catch (error) {
    logger.error('User Font Store: Error adding user font:', error)
    throw error
  }
}

/**
 * Delete a user font
 */
export function deleteUserFont(id: string): boolean {
  const index = _items.value.findIndex(item => item.id === id)

  if (index === -1) {
    logger.warn('Font not found for deletion:', id)
    return false
  }

  // Remove from collection
  _items.value.splice(index, 1)

  // Save to localStorage
  saveToLocalStorage()

  logger.info('Deleted user font:', id)
  return true
}

/**
 * Get font data by ID
 */
export function getUserFontData(id: string): string | null {
  const font = _items.value.find(item => item.id === id)
  return font ? font.fontData : null
}

/**
 * Get font item by ID
 */
export function getUserFont(id: string): UserFontItem | null {
  return _items.value.find(item => item.id === id) || null
}

/**
 * Save current state to localStorage
 */
async function saveToLocalStorage(): Promise<void> {
  try {
    localStorage.setItem(
      USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY,
      JSON.stringify(_items.value)
    )
  } catch (error) {
    logger.error('Failed to save user fonts to localStorage:', error)
    throw new Error('Failed to save fonts. localStorage might be full.')
  }
}

/**
 * Clear all user fonts
 */
export function clearUserFonts(): void {
  _items.value = []
  localStorage.removeItem(USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY)
  logger.info('Cleared all user fonts')
}

// Export store interface
export function useUserFontStore() {
  return {
    items: computed(() => _items.value),
    itemCount: computed(() => _items.value.length),
    isLoaded: computed(() => _isLoaded.value),
    loadUserFonts,
    addUserFont,
    deleteUserFont,
    getUserFontData,
    getUserFont,
    clearUserFonts
  }
}
