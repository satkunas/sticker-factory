<template>
  <!-- Inline SVG Selector (Direct Content) -->
  <div ref="containerRef" class="w-full overflow-x-hidden">
      <!-- SVG Selection Section -->
      <div class="p-4 mx-4 bg-secondary-500/5 rounded-lg mb-3 max-w-full">
        <div class="flex items-center justify-between mb-3">
          <h4 class="section-header">
            SVG Library
          </h4>
          <ResetButton @click="clearSelection" />
        </div>

        <!-- Search and Category -->
        <div class="bg-white rounded-lg p-2">
          <!-- Search -->
          <div class="mb-2 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search SVGs by name or tag..."
              class="w-full px-3 py-2 pr-8 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
            <button
              v-if="searchQuery.length > 0"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
              type="button"
              title="Clear search"
              @click="searchQuery = ''"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Category Filter and Results Count -->
          <div class="flex flex-wrap items-center gap-2">
            <CategoryDropdown
              v-model="selectedCategory"
              :categories="svgCategoryOptions"
              allLabel="All Categories"
            />
            <div v-if="filteredSvgs.length > 0" class="text-sm text-secondary-600 whitespace-nowrap">
              {{ filteredSvgs.length }} {{ filteredSvgs.length === 1 ? 'icon' : 'icons' }} found
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Grid -->
      <div class="p-4 mx-4 bg-secondary-500/5 rounded-lg max-w-full">
        <div class="bg-white rounded-lg p-2">
          <div v-if="svgStore.isLoading.value" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span class="ml-3 text-sm text-secondary-600">Loading 5000+ SVGs...</span>
          </div>

          <div v-else-if="filteredSvgs.length === 0" class="text-center py-8">
            <svg class="mx-auto h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.513-.73-6.291-1.971" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-secondary-900">No SVGs found</h3>
            <p class="mt-1 text-xs text-secondary-500">
              {{ searchQuery || selectedCategory ? 'Try adjusting your search or filter' : 'No SVGs available' }}
            </p>
          </div>

          <div v-else ref="svgGridContainer" class="max-h-64 overflow-y-auto overflow-x-hidden" @scroll="handleScroll">
          <div class="w-full min-w-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-2">
            <div
              v-for="svg in visibleSvgs"
              :key="svg.id"
              class="svg-tile group relative aspect-square bg-white border border-secondary-200 rounded-md p-2 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all duration-200 flex items-center justify-center"
              :class="{
                'ring-2 ring-primary-500 border-primary-500 bg-primary-50 shadow-md shadow-primary-200': props.selectedSvgId === svg.id
              }"
              :title="`${svg.name} (${svg.category})`"
              @click="selectSvg(svg)"
            >
              <!-- SVG Preview with Lazy Loading -->
              <div
                :ref="(el) => setTileRef(el, svg.id)"
                class="w-full h-full flex items-center justify-center text-secondary-700 transition-colors"
                :class="{ 'text-primary-600': props.selectedSvgId === svg.id }"
              >
                <!-- Loaded SVG Content -->
                <div v-if="loadedSvgContent[svg.id]" class="w-full h-full flex items-center justify-center" v-html="loadedSvgContent[svg.id]"></div>
                <!-- Loading indicator for empty SVG -->
                <div v-else class="w-4 h-4 bg-secondary-300 rounded animate-pulse"></div>
              </div>

              <!-- Selection indicator with larger badge -->
              <div
                v-if="props.selectedSvgId === svg.id"
                class="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- "Selected" Label -->
              <div
                v-if="props.selectedSvgId === svg.id"
                class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium shadow-md z-10"
              >
                Selected
              </div>

              <!-- SVG Name (on hover) -->
              <div class="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                {{ svg.name }}
              </div>
            </div>
          </div>

          <!-- Enhanced loading indicator with progress for massive collections -->
          <div v-if="isLoadingMore && visibleSvgs.length < filteredSvgs.length" class="py-3 text-center text-secondary-500">
            <div class="flex items-center justify-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              <div class="text-xs">
                Loading more icons... ({{ visibleSvgs.length }}/{{ filteredSvgs.length }})
              </div>
            </div>
            <!-- Progress bar for large collections -->
            <div v-if="filteredSvgs.length > 200" class="mt-2 w-full bg-secondary-200 rounded-full h-1">
              <div
                class="bg-primary-500 h-1 rounded-full transition-all duration-300"
                :style="{ width: (visibleSvgs.length / filteredSvgs.length * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        </div>
      </div>
  </div>
</template>

<!-- eslint-disable no-undef -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import { useSvgStore } from '../stores/svgStore'
import { logger } from '../utils/logger'
import CategoryDropdown from './CategoryDropdown.vue'
import ResetButton from './ResetButton.vue'

interface Props {
  selectedSvgId?: string
  selectedSvgContent?: string
  instanceId?: string
}

interface Emits {
  'update:selectedSvgId': [value: string]
  'update:selectedSvgContent': [value: string]
  'clear': []
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// SVG Store
const svgStore = useSvgStore()

// Component state
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

// Enhanced lazy loading state for 5000+ icons
const svgGridContainer = ref<HTMLElement>()
const visibleSvgCount = ref(60) // Optimized initial count for better UX
const isLoadingMore = ref(false)
const loadingBatchSize = ref(40) // Dynamic batch size

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Lazy loading state for SVG content
const loadedSvgContent = ref<Record<string, string>>({})
const tileRefs = new Map<string, HTMLElement>()
// eslint-disable-next-line no-undef
const intersectionObserver = ref<IntersectionObserver | null>(null)

// Filtered SVGs based on search and category
const filteredSvgs = computed(() => {
  if (searchQuery.value.trim()) {
    // Use store's search functionality
    return svgStore.searchSvgs(searchQuery.value)
  }

  if (selectedCategory.value) {
    // Use store's category filtering
    return svgStore.getSvgsByCategory(selectedCategory.value)
  }

  // Return all items
  return svgStore.items.value
})

// Visible SVGs for lazy loading
const visibleSvgs = computed(() => {
  return filteredSvgs.value.slice(0, visibleSvgCount.value)
})

// Prepare SVG categories for dropdown
const svgCategoryOptions = computed(() => {
  return svgStore.categories.value.map(category => ({
    value: category,
    label: categoryDisplayName(category)
  }))
})

// Enhanced scroll handler for massive collections (5000+ icons)
const handleScroll = () => {
  const container = svgGridContainer.value
  if (!container || isLoadingMore.value) return

  const scrollThreshold = 150 // Optimized threshold for smoother loading
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold

  if (isNearBottom && visibleSvgCount.value < filteredSvgs.value.length) {
    isLoadingMore.value = true

    // Dynamic batch sizing based on collection size and performance
    const remainingItems = filteredSvgs.value.length - visibleSvgCount.value
    const adaptiveBatchSize = Math.min(
      loadingBatchSize.value,
      remainingItems,
      Math.max(20, Math.floor(filteredSvgs.value.length / 100)) // Scale batch size with collection
    )

    // Use setTimeout for smoother loading
    setTimeout(() => {
      visibleSvgCount.value = Math.min(
        visibleSvgCount.value + adaptiveBatchSize,
        filteredSvgs.value.length
      )
      isLoadingMore.value = false
    }, 30) // Optimized delay for better perceived performance
  }
}

// Reset visible count when filters change with adaptive sizing
watch([searchQuery, selectedCategory], () => {
  // Adaptive initial count based on filtered results size
  const filteredLength = filteredSvgs.value.length
  if (filteredLength <= 100) {
    visibleSvgCount.value = Math.min(filteredLength, 60) // Show all if small collection
  } else if (filteredLength <= 500) {
    visibleSvgCount.value = 80 // Medium collection gets more initial items
  } else {
    visibleSvgCount.value = 60 // Large collection gets standard amount
  }

  // Adjust batch size based on filtered collection size
  if (filteredLength > 1000) {
    loadingBatchSize.value = 50 // Larger batches for huge collections
  } else if (filteredLength > 300) {
    loadingBatchSize.value = 40 // Standard batches for medium collections
  } else {
    loadingBatchSize.value = 20 // Smaller batches for small collections
  }

  isLoadingMore.value = false

  // Reset intersection observer when filters change
  cleanupIntersectionObserver()
  // Reset tile refs map
  tileRefs.clear()
  // Setup fresh intersection observer
  setupIntersectionObserver()
})

// Helper function to display category names
const categoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')
}

// Lazy loading helper functions
// eslint-disable-next-line no-undef
const setTileRef = (el: Element | ComponentPublicInstance | null, svgId: string) => {
  if (el && el instanceof HTMLElement) {
    tileRefs.set(svgId, el)

    // Observe the element for intersection
    if (intersectionObserver.value) {
      intersectionObserver.value.observe(el)
    }
  }
}

const loadSvgContent = async (svgId: string) => {
  if (loadedSvgContent.value[svgId]) {
    return // Already loaded
  }

  try {
    const content = await svgStore.getSvgContent(svgId)
    if (content) {
      loadedSvgContent.value[svgId] = content
    }
  } catch (error) {
    logger.warn(`Failed to load SVG content for ${svgId}:`, error)
  }
}

const setupIntersectionObserver = () => {
  // eslint-disable-next-line no-undef
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Find the SVG ID for this element
          for (const [svgId, element] of tileRefs.entries()) {
            if (element === entry.target) {
              loadSvgContent(svgId)
              break
            }
          }
        }
      })
    },
    {
      rootMargin: '50px', // Load SVGs when they're 50px away from viewport
      threshold: 0.1
    }
  )
}

const cleanupIntersectionObserver = () => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
    intersectionObserver.value = null
  }
  tileRefs.clear()
}

// Select SVG handler
const selectSvg = async (svg: SvgLibraryItem) => {
  emit('update:selectedSvgId', svg.id)

  // Ensure the SVG content is loaded before emitting
  if (!loadedSvgContent.value[svg.id]) {
    await loadSvgContent(svg.id)
  }

  emit('update:selectedSvgContent', loadedSvgContent.value[svg.id] || svg.svgContent)
}

// Clear selection - only emit clear event, parent handles reset logic
const clearSelection = () => {
  emit('clear')
}

// Load SVG library on mount using store
onMounted(async () => {
  try {
    // Load SVG library through store if not already loaded
    if (!svgStore.isLoaded.value) {
      await svgStore.loadSvgLibraryStore()
    }

    // Setup intersection observer for lazy loading
    setupIntersectionObserver()
  } catch (error) {
    logger.warn('Failed to load SVG library:', error)
    // Store handles error state internally
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupIntersectionObserver()
})

</script>

<style scoped>
/* Custom scrollbar for the grid */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure SVG icons scale properly */
.svg-tile :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>