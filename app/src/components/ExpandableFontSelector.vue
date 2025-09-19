<template>
  <!-- Inline Accordion Design -->
  <div ref="containerRef" class="w-full">
    <!-- Accordion Content -->
    <div 
      v-if="isExpanded"
      class="mb-4 bg-white border border-secondary-200 rounded-lg overflow-hidden"
    >
      <!-- Text Styling Section -->
      <div class="p-4 border-b border-secondary-200 bg-secondary-25">
        <h4 class="font-medium text-secondary-900 mb-3">
          Text Styling
        </h4>
        
        <!-- Compact Horizontal Layout -->
        <div class="space-y-4">
          <!-- Text Controls -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <!-- Color Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Color
              </div>
              <div class="flex items-center space-x-1 mb-2">
                <!-- Hidden color input -->
                <input
                  ref="textColorInputRef"
                  :value="textColor"
                  type="color"
                  class="sr-only"
                  @input="$emit('update:textColor', $event.target.value)"
                >
                <!-- Color picker button -->
                <button
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors"
                  :style="{ backgroundColor: textColor }"
                  :title="`Click to change text color (${textColor})`"
                  type="button"
                  @click="$refs.textColorInputRef?.click()"
                />
                <input
                  :value="textColor"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#000000"
                  @input="$emit('update:textColor', $event.target.value)"
                >
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <button
                  v-for="color in presetColors.slice(0, 12)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="textColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:textColor', color)"
                />
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                <button
                  v-for="color in presetColors.slice(12, 24)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="textColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:textColor', color)"
                />
              </div>
            </div>

            <!-- Font Size Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Size
              </div>
              <div class="flex items-center space-x-2 mb-2">
                <input
                  :value="fontSize"
                  type="range"
                  min="8"
                  max="200"
                  class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || 16)"
                >
                <input
                  :value="fontSize"
                  type="number"
                  min="8"
                  max="500"
                  class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || 16)"
                >
              </div>
              <div class="grid grid-cols-3 md:grid-cols-6 gap-1">
                <button
                  v-for="size in commonSizes"
                  :key="size"
                  class="px-1 py-1 text-xs rounded border transition-all"
                  :class="fontSize === size ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontSize', size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Font Weight Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Weight
              </div>
              <div class="grid grid-cols-2 gap-1 mb-2">
                <button
                  v-for="weight in fontWeights.slice(0, 4)"
                  :key="weight.value"
                  class="px-2 py-1 text-xs rounded border transition-all"
                  :class="fontWeight === weight.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontWeight', weight.value)"
                >
                  {{ weight.label }}
                </button>
              </div>
              <div v-if="fontWeights.length > 4" class="grid grid-cols-2 gap-1">
                <button
                  v-for="weight in fontWeights.slice(4)"
                  :key="weight.value"
                  class="px-2 py-1 text-xs rounded border transition-all"
                  :class="fontWeight === weight.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontWeight', weight.value)"
                >
                  {{ weight.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Stroke Controls -->
          <div class="border-t border-secondary-100 pt-4">
            <h5 class="text-sm font-medium text-secondary-700 mb-3">
              Text Stroke
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <!-- Stroke Color -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Color
                </div>
                <div class="flex items-center space-x-1 mb-2">
                  <!-- Hidden color input -->
                  <input
                    ref="strokeColorInputRef"
                    :value="textStrokeColor"
                    type="color"
                    class="sr-only"
                    @input="$emit('update:textStrokeColor', $event.target.value)"
                  >
                  <!-- Color picker button -->
                  <button
                    class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex-shrink-0"
                    :style="{ backgroundColor: textStrokeColor }"
                    :title="`Click to change stroke color (${textStrokeColor})`"
                    type="button"
                    @click="$refs.strokeColorInputRef?.click()"
                  />
                  <input
                    :value="textStrokeColor"
                    type="text"
                    class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="#000000"
                    @input="$emit('update:textStrokeColor', $event.target.value)"
                  >
                </div>
                <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                  <button
                    v-for="color in presetColors.slice(0, 12)"
                    :key="color"
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                    :class="textStrokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="$emit('update:textStrokeColor', color)"
                  />
                </div>
                <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                  <button
                    v-for="color in presetColors.slice(12, 24)"
                    :key="color"
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                    :class="textStrokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="$emit('update:textStrokeColor', color)"
                  />
                </div>
              </div>

              <!-- Stroke Width -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Width
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="textStrokeWidth"
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:textStrokeWidth', parseFloat($event.target.value) || 0)"
                  >
                  <input
                    :value="textStrokeWidth"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="$emit('update:textStrokeWidth', parseFloat($event.target.value) || 0)"
                  >
                </div>
              </div>

              <!-- Stroke Linejoin -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Linejoin
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <button
                    v-for="linejoin in strokeLinejoinOptions"
                    :key="linejoin.value"
                    class="px-2 py-1 text-xs rounded border transition-all text-center"
                    :class="textStrokeLinejoin === linejoin.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                    :title="linejoin.description"
                    @click="$emit('update:textStrokeLinejoin', linejoin.value)"
                  >
                    {{ linejoin.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Font Selection Section -->
      <div class="p-4">
        <h4 class="font-medium text-secondary-900 mb-3">
          Font Family
        </h4>
        
        <!-- Search -->
        <div class="mb-3 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search fonts..."
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
        
        <!-- Categories and Preview Toggle -->
        <div class="mb-3">
          <div class="flex flex-wrap gap-1 mb-2">
            <button
              :class="[
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === null
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
              @click="selectedCategory = null"
            >
              All
            </button>
            <button
              v-for="(label, category) in FONT_CATEGORIES"
              :key="category"
              :class="[
                'px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1',
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
              @click="selectedCategory = category"
            >
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  getCategoryColor(category)
                ]"
              />
              <span>{{ label }}</span>
            </button>
          </div>
        </div>
        
        <!-- Font List -->
        <div ref="fontListContainer" class="max-h-80 overflow-y-auto" @scroll="handleScroll">
          <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            <FontTile
              v-for="font in visibleFonts"
              :key="font.name"
              :ref="el => { if (selectedFont?.name === font.name && el) selectedFontTile = el }"
              :font="font"
              :isSelected="selectedFont?.name === font.name"
              :stickerText="stickerText || ''"
              @select="selectFont"
            />
          </div>
          
          <!-- Loading indicator -->
          <div v-if="isLoadingMore && visibleFonts.length < filteredFonts.length" class="py-2 text-center text-secondary-500">
            <div class="text-xs">
              Loading more fonts...
            </div>
          </div>
          
          <div v-if="filteredFonts.length === 0" class="py-4 text-center text-secondary-500">
            <p class="text-sm">
              No fonts found matching "{{ searchQuery }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject, nextTick } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, loadFont, getFontFamily, type FontConfig } from '../config/fonts'
import FontTile from './FontTile.vue'

interface Props {
  selectedFont?: FontConfig | null
  textColor?: string
  fontSize?: number
  fontWeight?: number
  textStrokeWidth?: number
  textStrokeColor?: string
  textStrokeLinejoin?: string
  stickerText?: string
  instanceId?: string
}

interface Emits {
  'update:selectedFont': [value: FontConfig | null]
  'update:textColor': [value: string]
  'update:fontSize': [value: number]
  'update:fontWeight': [value: number]
  'update:textStrokeWidth': [value: number]
  'update:textStrokeColor': [value: string]
  'update:textStrokeLinejoin': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  selectedFont: null,
  textColor: '#ffffff',
  fontSize: 16,
  fontWeight: 400,
  textStrokeWidth: 0,
  textStrokeColor: '#000000',
  textStrokeLinejoin: 'round',
  stickerText: '',
  instanceId: 'default'
})

const emit = defineEmits<Emits>()

// Color picker references
const textColorInputRef = ref<HTMLInputElement>()
const strokeColorInputRef = ref<HTMLInputElement>()

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedInstances = inject('expandedFontSelectors', ref(new Set<string>()))

// Local state
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loadedFonts = ref(new Set<string>())

// Lazy loading state
const fontListContainer = ref<HTMLElement>()
const selectedFontTile = ref<HTMLElement>()
const visibleFontCount = ref(20) // Start with 20 fonts
const isLoadingMore = ref(false)

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Computed expanded state
const isExpanded = computed(() => {
  if (dropdownManager) {
    return dropdownManager.isExpanded(props.instanceId)
  }
  // Legacy fallback
  return expandedInstances.value.has(props.instanceId)
})

// Toggle expansion
const toggleExpanded = () => {
  if (dropdownManager) {
    dropdownManager.toggle(props.instanceId, containerRef.value)
  } else {
    // Legacy fallback
    if (isExpanded.value) {
      expandedInstances.value.delete(props.instanceId)
    } else {
      // Close all other instances
      expandedInstances.value.clear()
      // Open this instance
      expandedInstances.value.add(props.instanceId)
    }
  }
}

// Handle click outside
const handleClickOutside = () => {
  if (dropdownManager) {
    dropdownManager.close(props.instanceId)
  } else {
    // Legacy fallback
    expandedInstances.value.delete(props.instanceId)
  }
}

// Preset colors for quick selection
const presetColors = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#dc2626', '#059669',
  '#1f2937', '#f3f4f6', '#7f1d1d', '#7c2d12',
  '#713f12', '#14532d', '#1e3a8a', '#581c87',
  '#831843', '#374151', '#fbbf24', '#34d399'
]

// Common font sizes for quick selection
const commonSizes = [12, 16, 20, 24, 32, 48]

// Stroke linejoin options
const strokeLinejoinOptions = [
  { value: 'round', label: 'Round', description: 'Rounded corners at line joins' },
  { value: 'miter', label: 'Miter', description: 'Sharp pointed corners at line joins' },
  { value: 'bevel', label: 'Bevel', description: 'Flat corners at line joins' },
  { value: 'arcs', label: 'Arcs', description: 'Arc corners at line joins' },
  { value: 'miter-clip', label: 'Clip', description: 'Clipped miter corners at line joins' }
]

// All possible font weight options
const allFontWeights = [
  { label: '100', value: 100 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '600', value: 600 },
  { label: '700', value: 700 },
  { label: '800', value: 800 },
  { label: '900', value: 900 }
]

// Available font weights based on selected font
const fontWeights = computed(() => {
  if (!props.selectedFont?.weights?.length) {
    return allFontWeights.filter(w => [400, 700].includes(w.value)) // Default fallback
  }
  
  return allFontWeights.filter(weight => 
    props.selectedFont.weights.includes(weight.value)
  )
})

// Get category color for the sticker indicators
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'serif': 'bg-blue-400',
    'sans-serif': 'bg-green-400', 
    'monospace': 'bg-purple-400',
    'display': 'bg-orange-400',
    'handwriting': 'bg-pink-400'
  }
  return colorMap[category] || 'bg-gray-400'
}

// Filtered fonts based on search and category
const filteredFonts = computed(() => {
  let fonts = AVAILABLE_FONTS
  
  // Filter by category
  if (selectedCategory.value) {
    fonts = fonts.filter(font => font.category === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    fonts = fonts.filter(font =>
      font.name.toLowerCase().includes(query) ||
      font.category.toLowerCase().includes(query)
    )
  }
  
  return fonts
})

// Visible fonts for lazy loading
const visibleFonts = computed(() => {
  return filteredFonts.value.slice(0, visibleFontCount.value)
})

// Handle scroll for lazy loading
const handleScroll = () => {
  const container = fontListContainer.value
  if (!container || isLoadingMore.value) return
  
  const scrollThreshold = 100 // Load more when 100px from bottom
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold
  
  if (isNearBottom && visibleFontCount.value < filteredFonts.value.length) {
    isLoadingMore.value = true
    
    // Add more fonts after a short delay
    setTimeout(() => {
      visibleFontCount.value = Math.min(
        visibleFontCount.value + 20,
        filteredFonts.value.length
      )
      isLoadingMore.value = false
    }, 100)
  }
}

// Reset visible count when filters change
watch([searchQuery, selectedCategory], () => {
  visibleFontCount.value = 20
  isLoadingMore.value = false
})

// Note: Font loading is now handled by individual FontTile components via lazy loading
// This improves performance by only loading fonts that are actually visible

// Auto-scroll to selected font
const scrollToSelectedFont = async () => {
  if (!props.selectedFont || !fontListContainer.value) return
  
  // Wait for DOM update
  await nextTick()
  
  // Find the selected font index in visible fonts
  const selectedIndex = visibleFonts.value.findIndex(font => font.name === props.selectedFont?.name)
  
  if (selectedIndex === -1) {
    // Font not visible, check if it's in filtered fonts
    const globalIndex = filteredFonts.value.findIndex(font => font.name === props.selectedFont?.name)
    if (globalIndex >= 0) {
      // Ensure the font is loaded by increasing visible count
      visibleFontCount.value = Math.max(visibleFontCount.value, globalIndex + 10)
      await nextTick()
    }
  }
  
  // Wait for the selected font tile ref to be updated
  await nextTick()
  
  // Use the selectedFontTile ref for precise scrolling if available
  if (selectedFontTile.value) {
    const container = fontListContainer.value
    const tile = selectedFontTile.value as HTMLElement
    
    // Get the position of the tile relative to the container
    const containerRect = container.getBoundingClientRect()
    const tileRect = tile.getBoundingClientRect()
    
    // Calculate how much to scroll to center the tile
    const tileRelativeTop = tileRect.top - containerRect.top + container.scrollTop
    const scrollTarget = tileRelativeTop - container.clientHeight / 2 + tile.clientHeight / 2
    
    // Smooth scroll to the target position
    container.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: 'smooth'
    })
  } else {
    // Fallback: calculate position based on index
    const updatedIndex = visibleFonts.value.findIndex(font => font.name === props.selectedFont?.name)
    if (updatedIndex >= 0) {
      const container = fontListContainer.value
      const containerWidth = container.clientWidth
      const tileWidth = 80 // approximate tile width including gap
      const columns = Math.floor(containerWidth / tileWidth)
      const row = Math.floor(updatedIndex / columns)
      const rowHeight = 80 // approximate tile height including gap
      
      // Scroll to the row containing the selected font
      container.scrollTo({
        top: Math.max(0, row * rowHeight - container.clientHeight / 2),
        behavior: 'smooth'
      })
    }
  }
}

// Watch for expansion state changes to trigger auto-scroll
watch(isExpanded, async (newExpanded) => {
  if (newExpanded && props.selectedFont) {
    // Small delay to ensure the accordion is fully expanded
    setTimeout(scrollToSelectedFont, 150)
  }
})

// Also watch for selectedFont changes when already expanded
watch(() => props.selectedFont, async () => {
  if (isExpanded.value) {
    setTimeout(scrollToSelectedFont, 150)
  }
})

// Font selection
const selectFont = async (font: FontConfig) => {
  if (font.name === props.selectedFont?.name) return
  
  try {
    // Load font if not already loaded
    if (!loadedFonts.value.has(font.name)) {
      await loadFont(font)
      loadedFonts.value.add(font.name)
    }
    
    emit('update:selectedFont', font)
  } catch (error) {
    // Still emit the font change, fallback will be used
    emit('update:selectedFont', font)
  }
}

// Load default font on mount
watch(() => props.selectedFont, async (newFont) => {
  if (newFont && !loadedFonts.value.has(newFont.name)) {
    try {
      await loadFont(newFont)
      loadedFonts.value.add(newFont.name)
    } catch (error) {
    }
  }
}, { immediate: true })

// Handle escape key to close
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isExpanded.value) {
    if (dropdownManager) {
      dropdownManager.close(props.instanceId)
    } else {
      // Legacy fallback
      expandedInstances.value.delete(props.instanceId)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (dropdownManager) {
    dropdownManager.close(props.instanceId)
  } else {
    // Legacy fallback
    expandedInstances.value.delete(props.instanceId)
  }
})
</script>