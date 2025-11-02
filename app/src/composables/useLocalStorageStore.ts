/* global DOMException */
/**
 * useLocalStorageStore
 * ====================
 *
 * Generic localStorage store composable
 * Reusable for any asset type (fonts, SVGs, images, etc.)
 *
 * Features:
 * - Automatic validation and filtering
 * - Sorting (default: newest first)
 * - Error handling with QuotaExceededError detection
 * - Loading states
 * - Singleton pattern via closure
 *
 * Used by:
 * - userFontStore.ts
 * - userSvgStore.ts
 * - Future user asset stores
 */

import { ref, computed } from 'vue'
import { logger } from '../utils/logger'

/**
 * Configuration options for the localStorage store
 */
export interface LocalStorageStoreOptions<T> {
  /**
   * localStorage key for storing items
   */
  storageKey: string

  /**
   * Function to validate each loaded item
   * Return true to keep, false to filter out
   */
  validateItem: (item: T) => boolean

  /**
   * Optional sort function for loaded items
   * Default: no sorting
   * Common: (a, b) => b.uploadDate - a.uploadDate (newest first)
   */
  sortItems?: (a: T, b: T) => number

  /**
   * Context name for logging (e.g., "User Font Store")
   */
  logContext: string
}

/**
 * Create a localStorage store for managing items
 * Generic type T represents the item type
 */
export function useLocalStorageStore<T>(options: LocalStorageStoreOptions<T>) {
  // Private state
  const _items = ref<T[]>([])
  const _isLoaded = ref(false)
  const _isLoading = ref(false)
  const _error = ref<string | null>(null)

  /**
   * Load items from localStorage
   * Handles validation, sorting, and error states
   */
  const loadItems = async (): Promise<T[]> => {
    // Return cached if already loaded
    if (_isLoaded.value) {
      logger.debug(`${options.logContext}: Returning cached items (${_items.value.length} items)`)
      return _items.value
    }

    // Prevent concurrent loading
    if (_isLoading.value) {
      logger.debug(`${options.logContext}: Already loading, waiting for completion`)
      while (_isLoading.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return _items.value
    }

    _isLoading.value = true
    _error.value = null

    try {
      logger.info(`${options.logContext}: Loading from localStorage...`)

      // Load from localStorage
      const stored = localStorage.getItem(options.storageKey)
      if (!stored) {
        logger.info(`${options.logContext}: No stored items found (first run)`)
        _items.value = []
        _isLoaded.value = true
        _isLoading.value = false
        return []
      }

      // Parse stored data
      const parsed: T[] = JSON.parse(stored)
      logger.debug(`${options.logContext}: Parsed ${parsed.length} items from localStorage`)

      // Validate and filter items
      const validItems = parsed.filter(options.validateItem)

      if (validItems.length < parsed.length) {
        logger.warn(
          `${options.logContext}: Filtered out ${parsed.length - validItems.length} invalid items`
        )
      }

      // Sort items if sorter provided
      if (options.sortItems) {
        validItems.sort(options.sortItems)
      }

      _items.value = validItems
      _isLoaded.value = true
      _isLoading.value = false

      logger.info(`${options.logContext}: Successfully loaded ${validItems.length} items`)
      return validItems

    } catch (err) {
      _error.value = err instanceof Error ? err.message : 'Failed to load items'
      _isLoading.value = false
      _isLoaded.value = true // Mark as loaded even on error to prevent retry loops
      logger.error(`${options.logContext}: Error loading from localStorage:`, err)
      throw err
    }
  }

  /**
   * Save current items to localStorage
   * Handles QuotaExceededError and other storage errors
   */
  const saveItems = (): void => {
    try {
      localStorage.setItem(options.storageKey, JSON.stringify(_items.value))
      logger.debug(`${options.logContext}: Saved ${_items.value.length} items to localStorage`)
    } catch (err) {
      // Check for quota exceeded error
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        const msg = 'Storage quota exceeded. Please delete old uploads to continue.'
        logger.error(`${options.logContext}: localStorage quota exceeded`)
        throw new Error(msg)
      }
      logger.error(`${options.logContext}: Error saving to localStorage:`, err)
      throw new Error('Failed to save to localStorage')
    }
  }

  /**
   * Clear all items from both state and localStorage
   */
  const clearItems = (): void => {
    _items.value = []
    localStorage.removeItem(options.storageKey)
    logger.info(`${options.logContext}: Cleared all items`)
  }

  /**
   * Reset the store state
   * Useful for re-loading from localStorage
   */
  const reset = (): void => {
    _items.value = []
    _isLoaded.value = false
    _isLoading.value = false
    _error.value = null
    logger.debug(`${options.logContext}: Store state reset`)
  }

  // Public interface
  return {
    // Computed reactive state
    items: computed(() => _items.value),
    itemCount: computed(() => _items.value.length),
    isLoaded: computed(() => _isLoaded.value),
    isLoading: computed(() => _isLoading.value),
    error: computed(() => _error.value),

    // Actions
    loadItems,
    saveItems,
    clearItems,
    reset,

    // Internal ref for direct manipulation (use cautiously)
    _items
  }
}
