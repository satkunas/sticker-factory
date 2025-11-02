/**
 * User SVG Store - Singleton for managing user-uploaded SVGs
 *
 * Architecture:
 * - Uses useLocalStorageStore for localStorage operations
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
  isUserSvgId,
  normalizeSvgForHashing
} from '../utils/asset-hash'
import {
  validateAndSanitizeSvg
} from '../utils/svg-validation'
import { useLocalStorageStore } from '../composables/useLocalStorageStore'

/**
 * User SVG Item - extends SvgLibraryItem with upload metadata
 */
export interface UserSvgItem extends SvgLibraryItem {
  id: string            // Format: "user-svg-{8charHash}" (e.g., "user-svg-a3f8b2c9")
  hash: string          // 8-character SHA-256 hash (deterministic)
  uploadedAt: number    // Timestamp (milliseconds)
  sizeBytes: number     // SVG content size in bytes
}

// Create base localStorage store with validation and sorting
const baseStore = useLocalStorageStore<UserSvgItem>({
  storageKey: USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY,
  validateItem: (item) => {
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
  },
  sortItems: (a, b) => b.uploadedAt - a.uploadedAt, // Newest first
  logContext: 'User SVG Store'
})

// Domain-level error state (separate from baseStore.error)
const _domainError = ref<string | null>(null)

// Store interface - singleton pattern
export const useUserSvgStore = () => {
  // Expose base store state
  const items = baseStore.items
  const isLoaded = baseStore.isLoaded
  const isLoading = baseStore.isLoading

  // Combined error from both baseStore and domain operations
  const error = computed(() => baseStore.error.value || _domainError.value)

  // Computed properties for quota management
  const itemCount = computed(() => baseStore.items.value.length)
  const totalSizeBytes = computed(() =>
    baseStore.items.value.reduce((sum, item) => sum + item.sizeBytes, 0)
  )
  const canAddMore = computed(() => itemCount.value < USER_ASSET_CONFIG.MAX_SVG_COUNT)

  /**
   * Load user SVGs from localStorage
   * Delegates to base store
   */
  const loadUserSvgs = async (): Promise<UserSvgItem[]> => {
    return await baseStore.loadItems()
  }

  /**
   * Add user-uploaded SVG
   *
   * @param svgContent - Raw SVG markup
   * @param name - Optional custom name (auto-generated if not provided)
   * @returns UserSvgItem if successful, null if failed
   */
  const addUserSvg = async (svgContent: string, name?: string): Promise<UserSvgItem | null> => {
    try {
      // Clear previous errors
      _domainError.value = null

      // Ensure store is loaded
      if (!isLoaded.value) {
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
      const existing = baseStore.items.value.find(item => item.id === id)
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
      const itemName = name || `User SVG ${baseStore.items.value.length + 1}`

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

      // Add to store (use _items for direct manipulation)
      baseStore._items.value.unshift(newItem) // Add to beginning (newest first)

      // Save to localStorage
      baseStore.saveItems()

      logger.info('User SVG Store: Added new user SVG:', id, `(${(sizeBytes / 1000).toFixed(1)}KB)`)
      return newItem

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      _domainError.value = errorMsg
      logger.error('User SVG Store: Error adding user SVG:', error)
      return null
    }
  }

  /**
   * Delete user SVG by ID
   */
  const deleteUserSvg = (id: string): boolean => {
    try {
      const index = baseStore.items.value.findIndex(item => item.id === id)
      if (index === -1) {
        logger.warn('User SVG Store: Item not found for deletion:', id)
        return false
      }

      baseStore._items.value.splice(index, 1)
      baseStore.saveItems()

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
      const item = baseStore.items.value.find(item => item.id === id)
      if (!item) {
        logger.warn('User SVG Store: Item not found for update:', id)
        return false
      }

      item.name = newName
      baseStore.saveItems()

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
    return baseStore.items.value.find(item => item.id === id) || null
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
    return baseStore.items.value.some(item => item.id === id)
  }

  /**
   * Validate uploaded SVG matches expected hash (for shared URLs)
   */
  const validateUploadedSvg = async (svgContent: string, expectedHash: string): Promise<boolean> => {
    try {
      // Normalize content before validating hash (same as generateAssetId does)
      const normalized = normalizeSvgForHashing(svgContent)
      const isValid = await validateAssetHash(normalized, expectedHash)
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
    baseStore._items.value = []
    baseStore.saveItems() // Save empty array to localStorage
    baseStore.reset() // Reset loaded flag for tests
    logger.info('User SVG Store: Cleared all user SVGs')
  }

  /**
   * Get store statistics
   */
  const getStats = () => {
    return {
      totalItems: baseStore.items.value.length,
      totalSizeBytes: totalSizeBytes.value,
      totalSizeKB: (totalSizeBytes.value / 1000).toFixed(1),
      maxItems: USER_ASSET_CONFIG.MAX_SVG_COUNT,
      maxSizePerItem: USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES,
      canAddMore: canAddMore.value,
      remainingSlots: USER_ASSET_CONFIG.MAX_SVG_COUNT - baseStore.items.value.length,
      isLoaded: isLoaded.value,
      isLoading: isLoading.value,
      error: error.value
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
