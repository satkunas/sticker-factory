<template>
  <!-- Inline Accordion Design -->
  <div class="w-full">
    <!-- Accordion Content -->
    <div 
      v-if="isExpanded"
      class="mb-4 bg-white border border-secondary-200 rounded-lg overflow-hidden"
    >
      <!-- Text Styling Section -->
      <div class="p-4 border-b border-secondary-200 bg-secondary-25">
        <h4 class="font-medium text-secondary-900 mb-4">Text Styling</h4>
        
        <!-- Preview Display -->
        <div class="mb-4 text-center">
          <div class="inline-block p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
            <div 
              class="w-20 h-20 rounded-lg border-2 border-secondary-200 flex items-center justify-center mb-2"
              :style="{ backgroundColor: 'white' }"
            >
              <span 
                class="font-bold"
                :style="{ 
                  fontFamily: selectedFont ? getFontFamily(selectedFont) : 'Arial, sans-serif',
                  color: textColor,
                  fontSize: Math.min(fontSize, 24) + 'px',
                  fontWeight: fontWeight
                }"
              >
                {{ badgeText ? badgeText.charAt(0).toUpperCase() : 'A' }}
              </span>
            </div>
            <div class="text-xs text-secondary-600">{{ fontSize }}px • {{ fontWeight }}</div>
          </div>
        </div>
        
        <!-- Controls Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Color Section -->
          <div>
            <div class="text-sm font-medium text-secondary-700 mb-2">Color</div>
            <div class="flex items-center space-x-2 mb-2">
              <input
                :value="textColor"
                @input="$emit('update:textColor', $event.target.value)"
                type="color"
                class="w-8 h-8 rounded border border-secondary-300 cursor-pointer"
              />
              <input
                :value="textColor"
                @input="$emit('update:textColor', $event.target.value)"
                type="text"
                class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="#000000"
              />
            </div>
            <div class="grid grid-cols-8 gap-1">
              <button
                v-for="color in presetColors"
                :key="color"
                @click="$emit('update:textColor', color)"
                class="w-5 h-5 rounded border transition-all"
                :class="textColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                :style="{ backgroundColor: color }"
                :title="color"
              ></button>
            </div>
          </div>

          <!-- Size & Weight Section -->
          <div>
            <div class="text-sm font-medium text-secondary-700 mb-2">Size & Weight</div>
            
            <!-- Font Size -->
            <div class="mb-3">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-xs text-secondary-600 w-8">Size</span>
                <input
                  :value="fontSize"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || 16)"
                  type="range"
                  min="8"
                  max="200"
                  class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  :value="fontSize"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || 16)"
                  type="number"
                  min="8"
                  max="500"
                  class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <!-- Font Weight -->
            <div>
              <div class="text-xs text-secondary-600 mb-1">Weight</div>
              <div class="grid grid-cols-4 gap-1">
                <button
                  v-for="weight in fontWeights"
                  :key="weight.value"
                  @click="$emit('update:fontWeight', weight.value)"
                  class="px-2 py-1 text-xs rounded border transition-all"
                  :class="fontWeight === weight.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                >
                  {{ weight.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Font Selection Section -->
      <div class="p-4">
        <h4 class="font-medium text-secondary-900 mb-3">Font Family</h4>
        
        <!-- Search -->
        <div class="mb-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search fonts..."
            class="w-full px-3 py-2 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <!-- Categories and Preview Toggle -->
        <div class="mb-3">
          <div class="flex flex-wrap gap-1 mb-2">
            <button
              @click="selectedCategory = null"
              :class="[
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === null
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
            >
              All
            </button>
            <button
              v-for="(label, category) in FONT_CATEGORIES"
              :key="category"
              @click="selectedCategory = category"
              :class="[
                'px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1',
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
            >
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  getCategoryColor(category)
                ]"
              ></div>
              <span>{{ label }}</span>
            </button>
          </div>
        </div>
        
        <!-- Font Grid -->
        <div class="max-h-48 overflow-y-auto">
          <div class="grid grid-cols-4 gap-2">
            <FontTile
              v-for="font in filteredFonts"
              :key="font.name"
              :font="font"
              :is-selected="selectedFont?.name === font.name"
              :badge-text="badgeText || ''"
              @select="selectFont"
            />
          </div>
          
          <div v-if="filteredFonts.length === 0" class="py-4 text-center text-secondary-500">
            <p class="text-sm">No fonts found matching "{{ searchQuery }}"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, loadFont, getFontFamily, type FontConfig } from '../config/fonts'
import FontTile from './FontTile.vue'

interface Props {
  selectedFont?: FontConfig | null
  textColor?: string
  fontSize?: number
  fontWeight?: number
  badgeText?: string
  instanceId?: string
}

interface Emits {
  'update:selectedFont': [value: FontConfig | null]
  'update:textColor': [value: string]
  'update:fontSize': [value: number]
  'update:fontWeight': [value: number]
}

const props = withDefaults(defineProps<Props>(), {
  selectedFont: null,
  textColor: '#ffffff',
  fontSize: 16,
  fontWeight: 400,
  badgeText: '',
  instanceId: 'default'
})

const emit = defineEmits<Emits>()

// Global expanded state management
const expandedInstances = inject('expandedFontSelectors', ref(new Set<string>()))

// Local state
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loadedFonts = ref(new Set<string>())

// Computed expanded state
const isExpanded = computed(() => expandedInstances.value.has(props.instanceId))

// Toggle expansion
const toggleExpanded = () => {
  if (isExpanded.value) {
    expandedInstances.value.delete(props.instanceId)
  } else {
    // Close all other instances
    expandedInstances.value.clear()
    // Open this instance
    expandedInstances.value.add(props.instanceId)
  }
}

// Handle click outside
const handleClickOutside = () => {
  expandedInstances.value.delete(props.instanceId)
}

// Preset colors for quick selection
const presetColors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#dc2626', '#059669'
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

// Get category color for the badge indicators
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
    console.error('Failed to load font:', error)
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
      console.error('Failed to load font:', error)
    }
  }
}, { immediate: true })

// Handle escape key to close
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isExpanded.value) {
    expandedInstances.value.delete(props.instanceId)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  expandedInstances.value.delete(props.instanceId)
})
</script>