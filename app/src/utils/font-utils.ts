/**
 * Font Utilities - Pure functions for font operations
 * No Vue dependencies
 */

import type { FontConfig } from '../config/fonts'
import { ALL_FONT_WEIGHTS, FONT_CATEGORY_COLORS } from './ui-constants'

/**
 * Get available font weights based on selected font
 */
export function getAvailableFontWeights(selectedFont: FontConfig | null | undefined) {
  if (!selectedFont?.weights?.length) {
    return ALL_FONT_WEIGHTS.filter(w => [400, 700].includes(w.value)) // Default fallback
  }

  return ALL_FONT_WEIGHTS.filter(weight =>
    selectedFont.weights.includes(weight.value)
  )
}

/**
 * Get category color for font category indicators
 */
export function getFontCategoryColor(category: string): string {
  return FONT_CATEGORY_COLORS[category] || 'bg-gray-400'
}

/**
 * Filter fonts by category and search query
 */
export function filterFonts(
  fonts: FontConfig[],
  searchQuery: string,
  selectedCategory: string | null
): FontConfig[] {
  let filteredFonts = fonts

  // Filter by category
  if (selectedCategory) {
    filteredFonts = filteredFonts.filter(font => font.category === selectedCategory)
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filteredFonts = filteredFonts.filter(font =>
      font.name.toLowerCase().includes(query) ||
      font.category.toLowerCase().includes(query)
    )
  }

  return filteredFonts
}

/**
 * Calculate visible fonts for lazy loading
 */
export function getVisibleFonts(fonts: FontConfig[], visibleCount: number): FontConfig[] {
  return fonts.slice(0, visibleCount)
}

/**
 * Check if should load more fonts based on scroll position
 */
export function shouldLoadMoreFonts(
  container: HTMLElement,
  visibleCount: number,
  totalCount: number,
  scrollThreshold = 100
): boolean {
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold
  return isNearBottom && visibleCount < totalCount
}

/**
 * Calculate next visible count for lazy loading
 */
export function getNextVisibleCount(
  currentCount: number,
  increment: number,
  maxCount: number
): number {
  return Math.min(currentCount + increment, maxCount)
}