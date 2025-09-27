import type { SvgLibraryItem } from '../types/template-types'
import { useSvgStore } from '../stores/svg-store'

// Backward compatibility layer - delegates to SVG store
// This file maintains the old API while using the new store internally

/**
 * Get all available SVG IDs (backward compatibility)
 */
export const getAvailableSvgIds = (): string[] => {
  const svgStore = useSvgStore()
  return svgStore.items.value.map(item => item.id)
}

/**
 * Load an SVG by its ID (backward compatibility)
 */
export const loadSvg = async (svgId: string): Promise<SvgLibraryItem | null> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  return svgStore.getSvgById(svgId)
}

/**
 * Load all available SVGs (backward compatibility)
 */
export const loadSvgLibrary = async (): Promise<SvgLibraryItem[]> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  return svgStore.items.value
}

/**
 * Get SVGs by category (backward compatibility)
 */
export const getSvgsByCategory = async (category: string): Promise<SvgLibraryItem[]> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  return svgStore.getSvgsByCategory(category)
}

/**
 * Search SVGs by name or tags (backward compatibility)
 */
export const searchSvgs = async (query: string): Promise<SvgLibraryItem[]> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  return svgStore.searchSvgs(query)
}

/**
 * Get all available categories (backward compatibility)
 */
export const getSvgCategories = async (): Promise<string[]> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  return svgStore.categories.value
}

/**
 * Get SVG content by ID (backward compatibility with lazy loading)
 */
export const getSvgContent = async (svgId: string): Promise<string | null> => {
  const svgStore = useSvgStore()

  // Ensure store is loaded
  if (!svgStore.isLoaded.value) {
    await svgStore.loadSvgLibraryStore()
  }

  // Get content with lazy loading
  return await svgStore.getSvgContent(svgId)
}

/**
 * Clear SVG library cache (backward compatibility)
 */
export const clearSvgLibraryCache = (): void => {
  const svgStore = useSvgStore()
  svgStore.clearCache()
}