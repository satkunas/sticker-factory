/* global DOMException */
/**
 * User SVG Store - Singleton for managing user-uploaded SVGs
 *
 * Architecture:
 * - Singleton pattern matching svgStore.ts
 * - localStorage persistence (no backend)
 * - Deterministic hashing for cross-user URL sharing
 * - Quota management (200KB max per SVG, 50 max total)
 * - CRUD operations for user uploads
 *
 * Data Flow:
 * User Upload → Validate → Generate Hash → Store → localStorage → Merge with Library
 */

import { ref, computed } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import { logger } from '../utils/logger'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'
import {
  generateAssetId,
  validateAssetHash,
  extractHashFromAssetId,
  isUserSvgId
} from '../utils/asset-hash'
import {
  validateAndSanitizeSvg
} from '../utils/svg-validation'

/**
 * User SVG Item - extends SvgLibraryItem with upload metadata
 */
export interface UserSvgItem extends SvgLibraryItem {
  id: string            // Format: "user-svg-{8charHash}" (e.g., "user-svg-a3f8b2c9")
  hash: string          // 8-character SHA-256 hash (deterministic)
  uploadedAt: number    // Timestamp (milliseconds)
  sizeBytes: number     // SVG content size in bytes
}

/**
 * Store state interface
 */
interface UserSvgStoreState {
  isLoaded: boolean
  isLoading: boolean
  items: UserSvgItem[]
  error: string | null
}

/**
 * localStorage storage key
 */
const STORAGE_KEY = USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY

// Private state - singleton
const _state = ref<UserSvgStoreState>({
  isLoaded: false,
  isLoading: false,
  items: [],
  error: null
})

/**
 * Load user SVGs from localStorage
 */
async function loadUserSvgs(): Promise<UserSvgItem[]> {
  // Return cached if already loaded
  if (_state.value.isLoaded) {
    logger.info('User SVG Store: Returning cached items', _state.value.items.length, 'items')
    return _state.value.items
  }

  // Prevent concurrent loading
  if (_state.value.isLoading) {
    logger.info('User SVG Store: Already loading, waiting for completion')
    while (_state.value.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return _state.value.items
  }

  _state.value.isLoading = true
  _state.value.error = null

  try {
    logger.info('User SVG Store: Loading from localStorage...')

    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      logger.info('User SVG Store: No stored items found (first run)')
      _state.value.items = []
      _state.value.isLoaded = true
      _state.value.isLoading = false
      return []
    }

    // Parse stored data
    const items: UserSvgItem[] = JSON.parse(stored)
    logger.info(`User SVG Store: Loaded ${items.length} items from localStorage`)

    // Validate items
    const validatedItems = items.filter(item => {
      // Basic validation
      if (!item.id || !item.hash || !item.svgContent) {
        logger.warn('User SVG Store: Invalid item found, skipping:', item)
        return false
      }

      // Ensure ID format is correct
      if (!isUserSvgId(item.id)) {
        logger.warn('User SVG Store: Invalid ID format, skipping:', item.id)
        return false
      }

      return true
    })

    // Sort by upload date (newest first)
    validatedItems.sort((a, b) => b.uploadedAt - a.uploadedAt)

    _state.value.items = validatedItems
    _state.value.isLoaded = true
    _state.value.isLoading = false

    logger.info(`User SVG Store: Successfully loaded ${validatedItems.length} valid items`)
    return validatedItems

  } catch (error) {
    _state.value.error = error instanceof Error ? error.message : 'Failed to load user SVGs'
    _state.value.isLoading = false
    logger.error('User SVG Store: Error loading from localStorage:', error)
    throw error
  }
}

/**
 * Save user SVGs to localStorage
 */
function saveToLocalStorage(): void {
  try {
    const data = JSON.stringify(_state.value.items)
    localStorage.setItem(STORAGE_KEY, data)
    logger.debug('User SVG Store: Saved to localStorage')
  } catch (error) {
    // Check for quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error('User SVG Store: localStorage quota exceeded')
      throw new Error('Storage quota exceeded. Please delete old uploads to continue.')
    }
    logger.error('User SVG Store: Error saving to localStorage:', error)
    throw new Error('Failed to save user SVGs to localStorage')
  }
}

// Store interface - singleton pattern
export const useUserSvgStore = () => {
  const items = computed(() => _state.value.items)
  const isLoaded = computed(() => _state.value.isLoaded)
  const isLoading = computed(() => _state.value.isLoading)
  const error = computed(() => _state.value.error)

  // Computed properties for quota management
  const itemCount = computed(() => _state.value.items.length)
  const totalSizeBytes = computed(() =>
    _state.value.items.reduce((sum, item) => sum + item.sizeBytes, 0)
  )
  const canAddMore = computed(() => itemCount.value < USER_ASSET_CONFIG.MAX_SVG_COUNT)

  /**
   * Add user-uploaded SVG
   *
   * @param svgContent - Raw SVG markup
   * @param name - Optional custom name (auto-generated if not provided)
   * @returns UserSvgItem if successful, null if failed
   */
  const addUserSvg = async (svgContent: string, name?: string): Promise<UserSvgItem | null> => {
    try {
      // Ensure store is loaded
      if (!_state.value.isLoaded) {
        await loadUserSvgs()
      }

      // Check quota
      if (!canAddMore.value) {
        throw new Error(`Maximum of ${USER_ASSET_CONFIG.MAX_SVG_COUNT} user SVGs reached. Please delete old uploads to continue.`)
      }

      // Validate and sanitize SVG content using svg-validation.ts (single source of truth)
      const result = validateAndSanitizeSvg(svgContent, USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES)
      if (!result.valid) {
        throw new Error(result.error || 'Invalid SVG content')
      }

      const sanitized = result.sanitized!

      // Generate deterministic ID
      const id = await generateAssetId(sanitized, 'svg')
      const hash = extractHashFromAssetId(id)

      if (!hash) {
        throw new Error('Failed to generate hash from ID')
      }

      // Check for existing item with same ID
      const existing = _state.value.items.find(item => item.id === id)
      if (existing) {
        // Collision detection: verify content is truly identical
        if (existing.svgContent === sanitized) {
          logger.info('User SVG Store: SVG with same content already exists:', id)
          return existing // Deterministic - same content = same ID
        } else {
          // TRUE HASH COLLISION - extremely rare but possible
          logger.error('HASH COLLISION DETECTED:', id, 'This should NEVER happen!')
          throw new Error('Hash collision detected. Please try again or contact support.')
        }
      }

      // Calculate size
      const sizeBytes = new Blob([sanitized]).size

      // Generate name if not provided
      const itemName = name || `User SVG ${_state.value.items.length + 1}`

      // Create new item
      const newItem: UserSvgItem = {
        id,
        hash,
        name: itemName,
        svgContent: sanitized,
        category: USER_ASSET_CONFIG.SVG_CATEGORY,
        tags: ['user-upload'],
        uploadedAt: Date.now(),
        sizeBytes
      }

      // Add to store
      _state.value.items.unshift(newItem) // Add to beginning (newest first)

      // Save to localStorage
      saveToLocalStorage()

      logger.info('User SVG Store: Added new user SVG:', id, `(${(sizeBytes / 1000).toFixed(1)}KB)`)
      return newItem

    } catch (error) {
      logger.error('User SVG Store: Error adding user SVG:', error)
      _state.value.error = error instanceof Error ? error.message : 'Failed to add user SVG'
      return null
    }
  }

  /**
   * Delete user SVG by ID
   */
  const deleteUserSvg = (id: string): boolean => {
    try {
      const index = _state.value.items.findIndex(item => item.id === id)
      if (index === -1) {
        logger.warn('User SVG Store: Item not found for deletion:', id)
        return false
      }

      _state.value.items.splice(index, 1)
      saveToLocalStorage()

      logger.info('User SVG Store: Deleted user SVG:', id)
      return true

    } catch (error) {
      logger.error('User SVG Store: Error deleting user SVG:', error)
      return false
    }
  }

  /**
   * Update user SVG name
   */
  const updateUserSvgName = (id: string, newName: string): boolean => {
    try {
      const item = _state.value.items.find(item => item.id === id)
      if (!item) {
        logger.warn('User SVG Store: Item not found for update:', id)
        return false
      }

      item.name = newName
      saveToLocalStorage()

      logger.info('User SVG Store: Updated user SVG name:', id, newName)
      return true

    } catch (error) {
      logger.error('User SVG Store: Error updating user SVG name:', error)
      return false
    }
  }

  /**
   * Get user SVG by ID
   */
  const getUserSvgById = (id: string): UserSvgItem | null => {
    return _state.value.items.find(item => item.id === id) || null
  }

  /**
   * Get user SVG content by ID
   */
  const getUserSvgContent = (id: string): string | null => {
    const item = getUserSvgById(id)
    return item?.svgContent || null
  }

  /**
   * Check if user SVG exists
   */
  const hasUserSvg = (id: string): boolean => {
    return _state.value.items.some(item => item.id === id)
  }

  /**
   * Validate uploaded SVG matches expected hash (for shared URLs)
   */
  const validateUploadedSvg = async (svgContent: string, expectedHash: string): Promise<boolean> => {
    try {
      const isValid = await validateAssetHash(svgContent, expectedHash)
      return isValid
    } catch (error) {
      logger.error('User SVG Store: Error validating uploaded SVG:', error)
      return false
    }
  }

  /**
   * Clear all user SVGs (with confirmation in UI)
   */
  const clearAllUserSvgs = (): void => {
    _state.value.items = []
    _state.value.isLoaded = false // Reset loaded flag for tests
    saveToLocalStorage()
    logger.info('User SVG Store: Cleared all user SVGs')
  }

  /**
   * Get store statistics
   */
  const getStats = () => {
    return {
      totalItems: _state.value.items.length,
      totalSizeBytes: totalSizeBytes.value,
      totalSizeKB: (totalSizeBytes.value / 1000).toFixed(1),
      maxItems: USER_ASSET_CONFIG.MAX_SVG_COUNT,
      maxSizePerItem: USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES,
      canAddMore: canAddMore.value,
      remainingSlots: USER_ASSET_CONFIG.MAX_SVG_COUNT - _state.value.items.length,
      isLoaded: _state.value.isLoaded,
      isLoading: _state.value.isLoading,
      error: _state.value.error
    }
  }

  return {
    // State
    items,
    isLoaded,
    isLoading,
    error,
    itemCount,
    totalSizeBytes,
    canAddMore,

    // Actions
    loadUserSvgs,
    addUserSvg,
    deleteUserSvg,
    updateUserSvgName,
    getUserSvgById,
    getUserSvgContent,
    hasUserSvg,
    validateUploadedSvg,
    clearAllUserSvgs,
    getStats
  }
}
