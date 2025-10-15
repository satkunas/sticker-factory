/**
 * Tests for useSearchableGrid composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSearchableGrid, type SearchableGridItem } from '../composables/useSearchableGrid'

interface TestItem extends SearchableGridItem {
  name: string
  category: string
}

describe('useSearchableGrid', () => {
  const createTestItems = (): TestItem[] => [
    { id: '1', name: 'Apple', category: 'fruit' },
    { id: '2', name: 'Banana', category: 'fruit' },
    { id: '3', name: 'Carrot', category: 'vegetable' },
    { id: '4', name: 'Broccoli', category: 'vegetable' },
    { id: '5', name: 'Cherry', category: 'fruit' }
  ]

  const testFilterFunction = (
    items: TestItem[],
    searchQuery: string,
    selectedCategory: string | null
  ): TestItem[] => {
    let filtered = items

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      expect(grid.searchQuery.value).toBe('')
      expect(grid.selectedCategory.value).toBeNull()
      expect(grid.visibleItemCount.value).toBe(30) // default
      expect(grid.isLoadingMore.value).toBe(false)
    })

    it('should accept custom config', () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: {
          initialVisibleCount: 10,
          loadMoreIncrement: 5,
          scrollThreshold: 50,
          loadDelay: 50
        }
      })

      expect(grid.visibleItemCount.value).toBe(10)
    })
  })

  describe('Filtering', () => {
    it('should return all items when no filters applied', () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      expect(grid.filteredItems.value).toHaveLength(5)
      expect(grid.filteredItems.value).toEqual(items)
    })

    it('should filter by search query', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      grid.searchQuery.value = 'app'
      await nextTick()

      expect(grid.filteredItems.value).toHaveLength(1)
      expect(grid.filteredItems.value[0].name).toBe('Apple')
    })

    it('should filter by category', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      grid.selectedCategory.value = 'fruit'
      await nextTick()

      expect(grid.filteredItems.value).toHaveLength(3)
      expect(grid.filteredItems.value.every(item => item.category === 'fruit')).toBe(true)
    })

    it('should filter by both search and category', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      grid.searchQuery.value = 'c'
      grid.selectedCategory.value = 'fruit'
      await nextTick()

      expect(grid.filteredItems.value).toHaveLength(1)
      expect(grid.filteredItems.value[0].name).toBe('Cherry')
    })
  })

  describe('Lazy Loading', () => {
    it('should limit visible items', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: { initialVisibleCount: 2 }
      })

      expect(grid.visibleItems.value).toHaveLength(2)
      expect(grid.filteredItems.value).toHaveLength(5)
    })

    it('should reset visible count when filters change', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: { initialVisibleCount: 2 }
      })

      // Manually increase visible count
      grid.visibleItemCount.value = 5

      // Change filter
      grid.searchQuery.value = 'test'
      await nextTick()

      // Should reset to initial
      expect(grid.visibleItemCount.value).toBe(2)
    })

    it('should not exceed total filtered items', () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: { initialVisibleCount: 10 }
      })

      // Initial count is higher than total items
      expect(grid.visibleItems.value).toHaveLength(5) // Only 5 items total
    })
  })

  describe('Scroll Handling', () => {
    it('should handle scroll with proper container', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `Item ${i}`,
        category: 'test'
      }))

      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: {
          initialVisibleCount: 10,
          loadMoreIncrement: 10,
          loadDelay: 10
        }
      })

      // Verify initial state
      expect(grid.visibleItemCount.value).toBe(10)

      // Mock container element near bottom
      // scrollTop (900) + clientHeight (100) = 1000 (scrollHeight)
      // distanceFromBottom = 1000 - 1000 = 0, which is < threshold (100)
      const mockContainer = {
        scrollTop: 900,
        scrollHeight: 1000,
        clientHeight: 100
      }
      grid.gridContainer.value = mockContainer as unknown as HTMLElement

      // Trigger scroll
      grid.handleScroll()

      // Verify loading started
      expect(grid.isLoadingMore.value).toBe(true)

      // Wait for the delayed load completion
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify more items loaded
      expect(grid.visibleItemCount.value).toBe(20)
      expect(grid.isLoadingMore.value).toBe(false)
    })

    it('should not load more when already loading', () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      grid.isLoadingMore.value = true

      const mockContainer = {
        scrollTop: 800,
        scrollHeight: 1000,
        clientHeight: 100
      }
      grid.gridContainer.value = mockContainer as unknown as HTMLElement

      const initialCount = grid.visibleItemCount.value
      grid.handleScroll()

      expect(grid.visibleItemCount.value).toBe(initialCount)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all state', async () => {
      const items = createTestItems()
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction,
        config: { initialVisibleCount: 2 }
      })

      // Modify state
      grid.searchQuery.value = 'test'
      grid.selectedCategory.value = 'fruit'
      grid.visibleItemCount.value = 10
      grid.isLoadingMore.value = true

      // Reset
      grid.reset()

      expect(grid.searchQuery.value).toBe('')
      expect(grid.selectedCategory.value).toBeNull()
      expect(grid.visibleItemCount.value).toBe(2)
      expect(grid.isLoadingMore.value).toBe(false)
    })
  })

  describe('Reactive Items', () => {
    it('should handle reactive item arrays', async () => {
      const items = ref(createTestItems())
      const grid = useSearchableGrid({
        items,
        filterFunction: testFilterFunction
      })

      expect(grid.filteredItems.value).toHaveLength(5)

      // Update items
      items.value = items.value.slice(0, 3)
      await nextTick()

      expect(grid.filteredItems.value).toHaveLength(3)
    })
  })
})
