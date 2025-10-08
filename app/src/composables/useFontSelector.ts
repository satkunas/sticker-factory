/**
 * Font Selector Composable
 * Vue-dependent logic for font selection components
 */

import { ref, computed, watch, type Ref } from 'vue'
import { AVAILABLE_FONTS, type FontConfig } from '../config/fonts'
import {
  filterFonts,
  getVisibleFonts,
  shouldLoadMoreFonts,
  calculateNextVisibleCount,
  getAvailableFontWeights
} from '../utils/font-utils'
import { FONT_LOADING_CONFIG } from '../utils/ui-constants'

export function useFontSelector(selectedFont: Ref<FontConfig | null | undefined>) {
  // Search and filtering
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)

  // Lazy loading state
  const fontListContainer = ref<HTMLElement>()
  const visibleFontCount = ref(FONT_LOADING_CONFIG.INITIAL_VISIBLE_COUNT)
  const isLoadingMore = ref(false)

  // Computed filtered fonts
  const filteredFonts = computed(() => {
    return filterFonts(AVAILABLE_FONTS, searchQuery.value, selectedCategory.value)
  })

  // Visible fonts for lazy loading
  const visibleFonts = computed(() => {
    return getVisibleFonts(filteredFonts.value, visibleFontCount.value)
  })

  // Available font weights based on selected font
  const fontWeights = computed(() => {
    return getAvailableFontWeights(selectedFont.value)
  })

  // Handle scroll for lazy loading
  const handleScroll = () => {
    const container = fontListContainer.value
    if (!container || isLoadingMore.value) return

    if (shouldLoadMoreFonts(
      container,
      visibleFontCount.value,
      filteredFonts.value.length,
      FONT_LOADING_CONFIG.SCROLL_THRESHOLD
    )) {
      isLoadingMore.value = true

      // Add more fonts after a short delay
      setTimeout(() => {
        visibleFontCount.value = calculateNextVisibleCount(
          visibleFontCount.value,
          FONT_LOADING_CONFIG.LOAD_MORE_INCREMENT,
          filteredFonts.value.length
        )
        isLoadingMore.value = false
      }, FONT_LOADING_CONFIG.LOAD_DELAY)
    }
  }

  // Reset visible count when filters change
  watch([searchQuery, selectedCategory], () => {
    visibleFontCount.value = FONT_LOADING_CONFIG.INITIAL_VISIBLE_COUNT
    isLoadingMore.value = false
  })

  return {
    // State
    searchQuery,
    selectedCategory,
    fontListContainer,
    visibleFontCount,
    isLoadingMore,

    // Computed
    filteredFonts,
    visibleFonts,
    fontWeights,

    // Methods
    handleScroll
  }
}