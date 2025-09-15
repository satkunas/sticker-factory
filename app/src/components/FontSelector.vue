<template>
  <div class="relative">
    <!-- Compact Font Button -->
    <div class="relative">
      <button
        class="w-10 h-10 border-2 border-secondary-300 rounded-lg cursor-pointer flex items-center justify-center transition-colors hover:border-secondary-400 bg-white"
        type="button"
        @click="showDropdown = !showDropdown"
      >
        <span 
          class="text-lg font-bold"
          :style="{ 
            fontFamily: selectedFont ? getFontFamily(selectedFont) : 'Arial, sans-serif',
            color: textColor || '#374151'
          }"
        >
          {{ badgeText ? badgeText.charAt(0).toUpperCase() : 'A' }}
        </span>
      </button>
      
      <!-- Dropdown -->
      <div 
        v-if="showDropdown"
        class="fixed inset-4 bg-white border border-secondary-300 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
      >
        <!-- Header with Close Button -->
        <div class="flex items-center justify-between p-4 border-b border-secondary-200">
          <h3 class="text-lg font-semibold text-secondary-900">
            Select Font
          </h3>
          <button
            class="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            @click="showDropdown = false"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <!-- Search -->
        <div class="p-4 border-b border-secondary-200">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search fonts..."
            class="w-full px-3 py-2 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
        
        <!-- Categories Filter -->
        <div class="p-3 border-b border-secondary-200">
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
              All
            </button>
            <button
              v-for="(label, category) in FONT_CATEGORIES"
              :key="category"
              :class="[
                'px-2 py-1 text-xs rounded transition-colors',
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              ]"
              @click="selectedCategory = category"
            >
              {{ label }}
            </button>
          </div>
        </div>
        
        <!-- Font Tiles Grid -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-8 gap-3">
            <FontTile
              v-for="font in filteredFonts"
              :key="font.name"
              :font="font"
              :is-selected="selectedFont?.name === font.name"
              :badge-text="props.badgeText || ''"
              @select="selectFont"
            />
          </div>
          
          <div v-if="filteredFonts.length === 0" class="py-8 text-center text-secondary-500">
            <div class="text-4xl mb-2">
              🔍
            </div>
            <p>No fonts found matching "{{ searchQuery }}"</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="mt-2 flex items-center space-x-2 text-sm text-secondary-600">
      <svg class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
      </svg>
      <span>Loading font...</span>
    </div>
    
    <!-- Click outside to close -->
    <div 
      v-if="showDropdown"
      class="fixed inset-0 z-0"
      @click="showDropdown = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AVAILABLE_FONTS, FONT_CATEGORIES, DEFAULT_FONT, loadFont, getFontFamily, type FontConfig } from '../config/fonts'
import FontTile from './FontTile.vue'

interface Props {
  modelValue?: FontConfig | null
  badgeText?: string
  textColor?: string
}

interface Emits {
  'update:modelValue': [value: FontConfig | null]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const showDropdown = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const loading = ref(false)
const loadedFonts = ref(new Set<string>())

// Selected font
const selectedFont = computed(() => props.modelValue || null)

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
    
    emit('update:modelValue', font)
    showDropdown.value = false
    searchQuery.value = ''
    selectedCategory.value = null
  } catch (error) {
    console.error('Failed to load font:', error)
    // Still emit the font change, fallback will be used
    emit('update:modelValue', font)
    showDropdown.value = false
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
</script>