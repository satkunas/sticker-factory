<template>
  <div class="relative">
    <!-- Compact Button -->
    <div class="relative">
      <button
        @click="showModal = !showModal"
        class="w-10 h-10 border-2 border-secondary-300 rounded-lg cursor-pointer flex items-center justify-center transition-colors hover:border-secondary-400 bg-white"
        type="button"
      >
        <span 
          class="text-lg font-bold"
          :style="{ 
            fontFamily: selectedFont ? getFontFamily(selectedFont) : 'Arial, sans-serif',
            color: textColor 
          }"
        >
          {{ badgeText ? badgeText.charAt(0).toUpperCase() : 'A' }}
        </span>
      </button>
    </div>
    
    <!-- Combined Modal -->
    <div 
      v-if="showModal"
      class="fixed inset-4 bg-white border border-secondary-300 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
    >
      <!-- Header with Close Button -->
      <div class="flex items-center justify-between p-4 border-b border-secondary-200 flex-shrink-0">
        <h3 class="text-lg font-semibold text-secondary-900">Font & Color Selection</h3>
        <button
          @click="showModal = false"
          class="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      
      <!-- Split Content Area -->
      <div class="flex-1 flex flex-col lg:flex-row min-h-0">
        <!-- Color Selection Side -->
        <div class="w-full lg:w-80 flex flex-col bg-secondary-25 border-b lg:border-b-0 lg:border-r border-secondary-200">
          
          <div class="flex-1 p-6">
            <!-- Current Color Display -->
            <div class="mb-6 text-center">
              <div class="inline-block p-4 bg-white border border-secondary-200 rounded-lg shadow-sm">
                <div 
                  class="w-20 h-20 rounded-lg border-2 border-secondary-200 flex items-center justify-center mb-3"
                  :style="{ backgroundColor: 'white' }"
                >
                  <span 
                    class="text-3xl font-bold"
                    :style="{ 
                      fontFamily: selectedFont ? getFontFamily(selectedFont) : 'Arial, sans-serif',
                      color: textColor 
                    }"
                  >
                    {{ badgeText ? badgeText.charAt(0).toUpperCase() : 'A' }}
                  </span>
                </div>
                <div class="text-sm text-secondary-600">{{ textColor }}</div>
              </div>
            </div>
            
            <!-- Color Picker -->
            <div class="mb-6">
              <input
                v-model="textColor"
                type="color"
                class="w-full h-12 rounded-lg border border-secondary-300 cursor-pointer"
              />
            </div>
            
            <!-- Preset Colors -->
            <div>
              <div class="text-sm font-medium text-secondary-700 mb-3">Quick Colors</div>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="color in presetColors"
                  :key="color"
                  @click="textColor = color"
                  class="w-8 h-8 rounded border-2 transition-all"
                  :class="textColor === color ? 'border-secondary-400 scale-110' : 'border-secondary-200 hover:border-secondary-300'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                ></button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Font Selection Side -->
        <div class="flex-1 flex flex-col">
          <div class="p-4 border-b border-secondary-200 bg-secondary-50">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search fonts..."
              class="w-full px-3 py-2 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <!-- Categories Filter -->
          <div class="p-4 border-b border-secondary-200 bg-secondary-50">
            <div class="flex flex-wrap gap-1 mb-3">
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
            <div class="flex items-center justify-end space-x-3">
              <span class="text-sm text-secondary-700">Preview</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="showPreview"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
          
          <!-- Font Tiles Grid -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="grid grid-cols-6 lg:grid-cols-4 gap-3">
              <FontTile
                v-for="font in filteredFonts"
                :key="font.name"
                :font="font"
                :is-selected="selectedFont?.name === font.name"
                :badge-text="badgeText || ''"
                :show-preview="showPreview"
                @select="selectFont"
              />
            </div>
            
            <div v-if="filteredFonts.length === 0" class="py-8 text-center text-secondary-500">
              <div class="text-4xl mb-2">🔍</div>
              <p>No fonts found matching "{{ searchQuery }}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Click outside to close -->
    <div 
      v-if="showModal"
      class="fixed inset-0 z-40"
      @click="showModal = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, DEFAULT_FONT, loadFont, getFontFamily, type FontConfig } from '../config/fonts'
import FontTile from './FontTile.vue'

interface Props {
  selectedFont?: FontConfig | null
  textColor?: string
  badgeText?: string
}

interface Emits {
  'update:selectedFont': [value: FontConfig | null]
  'update:textColor': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  selectedFont: null,
  textColor: '#ffffff',
  badgeText: ''
})

const emit = defineEmits<Emits>()

// Local state
const showModal = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loading = ref(false)
const loadedFonts = ref(new Set<string>())
const showPreview = ref(false)

// Internal reactive values
const selectedFont = computed(() => props.selectedFont)
const textColor = computed({
  get: () => props.textColor,
  set: (value) => emit('update:textColor', value)
})

// Preset colors for quick selection
const presetColors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#dc2626', '#059669'
]

// Get category color for the badge indicators (same as FontTile)
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
  if (font.name === selectedFont.value?.name) return
  
  try {
    loading.value = true
    
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
  } finally {
    loading.value = false
  }
}

// Load default font on mount
watch(() => selectedFont.value, async (newFont) => {
  if (newFont && !loadedFonts.value.has(newFont.name)) {
    try {
      await loadFont(newFont)
      loadedFonts.value.add(newFont.name)
    } catch (error) {
      console.error('Failed to load font:', error)
    }
  }
}, { immediate: true })

// Handle escape key to close modal
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showModal.value) {
    showModal.value = false
  }
}

// Add/remove event listener when modal state changes
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>