<template>
  <!-- Inline SVG Selector (Direct Content) -->
  <div ref="containerRef" class="w-full">
      <!-- SVG Selection Section -->
      <div class="p-4 border-b border-secondary-200 bg-secondary-25">
        <h4 class="font-medium text-secondary-900 mb-3">
          SVG Library
        </h4>

        <!-- Search and Filters -->
        <div class="space-y-3">
          <!-- Search Input -->
          <div class="relative">
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

          <!-- Category Filter -->
          <div class="flex flex-wrap gap-1">
            <button
              :class="[
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === null
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
              @click="selectedCategory = null"
            >
              All Categories
            </button>
            <button
              v-for="category in categories"
              :key="category"
              :class="[
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
              @click="selectedCategory = category"
            >
              {{ categoryDisplayName(category) }}
            </button>
          </div>

          <!-- Results Count -->
          <div v-if="filteredSvgs.length > 0" class="text-sm text-secondary-600">
            {{ filteredSvgs.length }} {{ filteredSvgs.length === 1 ? 'icon' : 'icons' }} found
          </div>
        </div>
      </div>

      <!-- SVG Grid -->
      <div class="p-4">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span class="ml-3 text-sm text-secondary-600">Loading SVGs...</span>
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

        <div v-else ref="svgGridContainer" class="max-h-64 overflow-y-auto" @scroll="handleScroll">
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            <div
              v-for="svg in visibleSvgs"
              :key="svg.id"
              class="svg-tile group relative aspect-square bg-white border border-secondary-200 rounded-md p-2 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all duration-200 flex items-center justify-center"
              :class="{ 'ring-2 ring-primary-500 border-primary-500': selectedSvgId === svg.id }"
              :title="`${svg.name} (${svg.category})`"
              @click="selectSvg(svg)"
            >
              <!-- SVG Preview -->
              <div
                class="w-full h-full flex items-center justify-center text-secondary-700 transition-colors"
                :class="{ 'text-primary-600': selectedSvgId === svg.id }"
                v-html="svg.svgContent"
              />

              <!-- Selection indicator -->
              <div
                v-if="selectedSvgId === svg.id"
                class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- SVG Name (on hover) -->
              <div class="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                {{ svg.name }}
              </div>
            </div>
          </div>

          <!-- Loading indicator for lazy loading -->
          <div v-if="isLoadingMore && visibleSvgs.length < filteredSvgs.length" class="py-2 text-center text-secondary-500">
            <div class="text-xs">
              Loading more icons...
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="!loading && filteredSvgs.length > 0" class="mt-4 pt-3 border-t border-secondary-100">
          <div class="flex items-center justify-between">
            <div class="text-xs text-secondary-500">
              Click an icon to select it
            </div>
            <button
              v-if="selectedSvgId"
              class="px-3 py-1 text-xs bg-red-50 border border-red-200 rounded-md text-red-600 hover:bg-red-100 transition-colors"
              type="button"
              title="Remove selected SVG"
              @click="clearSelection"
            >
              Remove SVG
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import { loadSvgLibrary, getSvgCategories } from '../config/svg-library-loader'

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

defineProps<Props>()

const emit = defineEmits<Emits>()

// Component state
const loading = ref(true)
const svgLibrary = ref<SvgLibraryItem[]>([])
const categories = ref<string[]>([])
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

// Lazy loading state
const svgGridContainer = ref<HTMLElement>()
const visibleSvgCount = ref(40) // Start with 40 SVGs
const isLoadingMore = ref(false)

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Filtered SVGs based on search and category
const filteredSvgs = computed(() => {
  let filtered = svgLibrary.value

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(svg => svg.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(svg =>
      svg.name.toLowerCase().includes(query) ||
      svg.category.toLowerCase().includes(query) ||
      svg.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Visible SVGs for lazy loading
const visibleSvgs = computed(() => {
  return filteredSvgs.value.slice(0, visibleSvgCount.value)
})

// Handle scroll for lazy loading
const handleScroll = () => {
  const container = svgGridContainer.value
  if (!container || isLoadingMore.value) return

  const scrollThreshold = 50 // Load more when 50px from bottom
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold

  if (isNearBottom && visibleSvgCount.value < filteredSvgs.value.length) {
    isLoadingMore.value = true

    // Add more SVGs after a short delay
    setTimeout(() => {
      visibleSvgCount.value = Math.min(
        visibleSvgCount.value + 20,
        filteredSvgs.value.length
      )
      isLoadingMore.value = false
    }, 100)
  }
}

// Reset visible count when filters change
watch([searchQuery, selectedCategory], () => {
  visibleSvgCount.value = 40
  isLoadingMore.value = false
})

// Helper function to display category names
const categoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')
}

// Select SVG handler
const selectSvg = (svg: SvgLibraryItem) => {
  emit('update:selectedSvgId', svg.id)
  emit('update:selectedSvgContent', svg.svgContent)
}

// Clear selection
const clearSelection = () => {
  emit('update:selectedSvgId', '')
  emit('update:selectedSvgContent', '')
  emit('clear')
}

// Load SVG library on mount
onMounted(async () => {
  try {
    loading.value = true

    // Load SVGs and categories in parallel
    const [svgs, cats] = await Promise.all([
      loadSvgLibrary(),
      getSvgCategories()
    ])

    svgLibrary.value = svgs
    categories.value = cats

  } catch {
    // Failed to load SVG library, silently handle
  } finally {
    loading.value = false
  }
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