/* global FontFace */
/**
 * User Font Store
 * ===============
 *
 * Manages user-uploaded fonts with localStorage persistence.
 * Supports font file uploads with validation and browser registration.
 *
 * Architecture:
 * - Uses useLocalStorageStore for localStorage operations
 * - Fonts stored as base64 data URIs in localStorage
 * - Deterministic hashing (same content = same ID)
 * - Browser font registration using CSS @font-face
 * - Validation: file size, format, structure
 *
 * Data Flow:
 * User Upload → Validate → Generate Hash → Store → localStorage → Register with Browser
 */

import { computed } from 'vue'
import { logger } from '../utils/logger'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'
import { generateAssetId, isUserFontId } from '../utils/asset-hash'
import { readFileAsArrayBuffer, arrayBufferToBase64 } from '../utils/file-io'
import { detectFontFormat } from '../utils/font-validation'
import { useLocalStorageStore } from '../composables/useLocalStorageStore'

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

// Create base localStorage store with validation and sorting
const baseStore = useLocalStorageStore<UserFontItem>({
  storageKey: USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY,
  validateItem: (item) => {
    // Basic validation
    if (!item.id || !item.name || !item.fontData || !item.format) {
      logger.warn('User Font Store: Invalid item found, skipping:', item)
      return false
    }

    // Ensure ID format is correct
    if (!isUserFontId(item.id)) {
      logger.warn('User Font Store: Invalid ID format, skipping:', item.id)
      return false
    }

    return true
  },
  sortItems: (a, b) => b.uploadDate - a.uploadDate, // Newest first
  logContext: 'User Font Store'
})

/**
 * Load user fonts from localStorage
 */
export async function loadUserFonts(): Promise<UserFontItem[]> {
  const items = await baseStore.loadItems()

  // Register all loaded fonts with the browser
  items.forEach(font => {
    registerFontFace(font)
  })

  return items
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
    // Ensure store is loaded
    if (!baseStore.isLoaded.value) {
      await loadUserFonts()
    }

    // Validate file size
    if (fontFile.size > USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES) {
      const sizeMB = (fontFile.size / 1024 / 1024).toFixed(1)
      const maxMB = (USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES / 1024 / 1024).toFixed(0)
      throw new Error(`Font too large: ${sizeMB}MB (max ${maxMB}MB)`)
    }

    // Check font count limit
    if (baseStore.items.value.length >= USER_ASSET_CONFIG.MAX_FONT_COUNT) {
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
    if (baseStore.items.value.some(item => item.id === fontId)) {
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

    // Add to collection (use _items for direct manipulation)
    baseStore._items.value.unshift(fontItem)

    // Save to localStorage
    baseStore.saveItems()

    // Register font with browser
    registerFontFace(fontItem)

    logger.info('User Font Store: Added user font:', fontItem.name, fontItem.id)
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
  try {
    const index = baseStore.items.value.findIndex(item => item.id === id)
    if (index === -1) {
      logger.warn('User Font Store: Item not found for deletion:', id)
      return false
    }

    baseStore._items.value.splice(index, 1)
    baseStore.saveItems()

    logger.info('User Font Store: Deleted user font:', id)
    return true

  } catch (error) {
    logger.error('User Font Store: Error deleting user font:', error)
    return false
  }
}

/**
 * Get font data by ID
 */
export function getUserFontData(id: string): string | null {
  const font = baseStore.items.value.find(item => item.id === id)
  return font ? font.fontData : null
}

/**
 * Get font item by ID
 */
export function getUserFont(id: string): UserFontItem | null {
  return baseStore.items.value.find(item => item.id === id) || null
}

/**
 * Clear all user fonts
 */
export function clearUserFonts(): void {
  baseStore.clearItems()
  baseStore.reset() // Reset loaded flag for tests
  logger.info('User Font Store: Cleared all user fonts')
}

// Export store interface
export function useUserFontStore() {
  return {
    // State
    items: baseStore.items,
    itemCount: computed(() => baseStore.items.value.length),
    isLoaded: baseStore.isLoaded,
    isLoading: baseStore.isLoading,
    error: baseStore.error,

    // Actions
    loadUserFonts,
    addUserFont,
    deleteUserFont,
    getUserFontData,
    getUserFont,
    clearUserFonts
  }
}
