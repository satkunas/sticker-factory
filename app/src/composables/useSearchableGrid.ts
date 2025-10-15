/**
 * Generic Searchable Grid Composable
 *
 * Reusable logic for searchable, filterable, lazy-loading grid components.
 * Used by font selector, SVG selector, and other grid-based selectors.
 */

import { ref, computed, watch, type ComputedRef } from 'vue'

export interface SearchableGridConfig {
  initialVisibleCount: number
  loadMoreIncrement: number
  scrollThreshold: number
  loadDelay: number
}

export interface SearchableGridItem {
  id: string
  [key: string]: unknown
}

export interface UseSearchableGridOptions<T extends SearchableGridItem> {
  items: T[] | ComputedRef<T[]>
  filterFunction: (items: T[], searchQuery: string, selectedCategory: string | null) => T[]
  config?: Partial<SearchableGridConfig>
}

const DEFAULT_CONFIG: SearchableGridConfig = {
  initialVisibleCount: 30,
  loadMoreIncrement: 30,
  scrollThreshold: 100,
  loadDelay: 100
}

export function useSearchableGrid<T extends SearchableGridItem>(
  options: UseSearchableGridOptions<T>
) {
  const config = { ...DEFAULT_CONFIG, ...options.config }

  // Search and filtering
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)

  // Lazy loading state
  const gridContainer = ref<HTMLElement>()
  const visibleItemCount = ref(config.initialVisibleCount)
  const isLoadingMore = ref(false)

  // Get items array (handle both array and ComputedRef)
  const itemsArray = computed(() => {
    return Array.isArray(options.items) ? options.items : options.items.value
  })

  // Filtered items based on search and category
  const filteredItems = computed(() => {
    return options.filterFunction(
      itemsArray.value,
      searchQuery.value,
      selectedCategory.value
    )
  })

  // Visible items for lazy loading
  const visibleItems = computed(() => {
    return filteredItems.value.slice(0, visibleItemCount.value)
  })

  // Check if should load more items
  const shouldLoadMore = (container: HTMLElement): boolean => {
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const scrollPosition = scrollTop + clientHeight
    const distanceFromBottom = scrollHeight - scrollPosition

    return (
      distanceFromBottom < config.scrollThreshold &&
      visibleItemCount.value < filteredItems.value.length
    )
  }

  // Calculate next visible count
  const calculateNextCount = (): number => {
    const nextCount = visibleItemCount.value + config.loadMoreIncrement
    return Math.min(nextCount, filteredItems.value.length)
  }

  // Handle scroll for lazy loading
  const handleScroll = () => {
    const container = gridContainer.value
    if (!container || isLoadingMore.value) return

    if (shouldLoadMore(container)) {
      isLoadingMore.value = true

      // Load more items after a short delay
      setTimeout(() => {
        visibleItemCount.value = calculateNextCount()
        isLoadingMore.value = false
      }, config.loadDelay)
    }
  }

  // Reset visible count when filters change
  watch([searchQuery, selectedCategory], () => {
    visibleItemCount.value = config.initialVisibleCount
    isLoadingMore.value = false
  })

  // Reset function for external use
  const reset = () => {
    searchQuery.value = ''
    selectedCategory.value = null
    visibleItemCount.value = config.initialVisibleCount
    isLoadingMore.value = false
  }

  return {
    // State
    searchQuery,
    selectedCategory,
    gridContainer,
    visibleItemCount,
    isLoadingMore,

    // Computed
    filteredItems,
    visibleItems,

    // Methods
    handleScroll,
    reset
  }
}
