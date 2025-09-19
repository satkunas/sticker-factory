<template>
  <div class="svg-library-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-secondary-200">
        <h2 class="text-lg font-semibold text-secondary-900">
          Choose SVG Image
        </h2>
        <button
          class="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          title="Close"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="p-4 border-b border-secondary-200 bg-secondary-50">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search Input -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search SVGs by name or tag..."
              class="w-full px-3 py-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <!-- Category Filter -->
          <div class="sm:w-48">
            <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ categoryDisplayName(category) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Results Count -->
        <div v-if="filteredSvgs.length > 0" class="mt-3 text-sm text-secondary-600">
          {{ filteredSvgs.length }} {{ filteredSvgs.length === 1 ? 'icon' : 'icons' }} found
        </div>
      </div>

      <!-- SVG Grid -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span class="ml-3 text-secondary-600">Loading SVGs...</span>
        </div>

        <div v-else-if="filteredSvgs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.513-.73-6.291-1.971" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-secondary-900">No SVGs found</h3>
          <p class="mt-2 text-secondary-500">
            {{ searchQuery || selectedCategory ? 'Try adjusting your search or filter' : 'No SVGs available' }}
          </p>
        </div>

        <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          <div
            v-for="svg in filteredSvgs"
            :key="svg.id"
            class="svg-tile group relative aspect-square bg-white border border-secondary-200 rounded-lg p-3 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200 flex items-center justify-center"
            :title="`${svg.name} (${svg.category})`"
            @click="selectSvg(svg)"
          >
            <!-- SVG Preview -->
            <div
              class="w-full h-full flex items-center justify-center text-secondary-700 group-hover:text-primary-600 transition-colors"
              v-html="svg.svgContent"
            />

            <!-- SVG Name (on hover) -->
            <div class="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
              {{ svg.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-secondary-200 bg-secondary-50">
        <div class="text-xs text-secondary-500 text-center">
          Click an icon to select it • All icons are royalty-free and available under permissive licenses
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import { loadSvgLibrary, getSvgCategories, searchSvgs } from '../config/svg-library-loader'

interface Emits {
  select: [svg: SvgLibraryItem]
  close: []
}

// Reactive state
const loading = ref(true)
const svgLibrary = ref<SvgLibraryItem[]>([])
const categories = ref<string[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')

// Computed filtered SVGs
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

// Helper function to display category names
const categoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')
}

// Select SVG handler
const emit = defineEmits<Emits>()
const selectSvg = (svg: SvgLibraryItem) => {
  // Emit the selected SVG to parent
  emit('select', svg)
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

  } catch (error) {
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Custom scrollbar for the grid */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
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