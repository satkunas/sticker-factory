<template>
  <button
    ref="tileRef"
    @click="$emit('select', font)"
    :class="[
      'relative aspect-square rounded-lg border-2 transition-all duration-200 group',
      isSelected
        ? 'border-primary-500 bg-primary-50'
        : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
    ]"
    :title="font.name"
  >
    <!-- Font Preview Character -->
    <div class="absolute inset-1 flex items-center justify-center overflow-hidden">
      <span 
        class="font-bold leading-none select-none overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-center"
        :style="{ 
          fontFamily: fontLoaded ? getFontFamily(font) : font.fallback,
          color: isSelected ? '#059669' : '#374151',
          fontSize: getOptimalFontSize(font, stickerText, props.showPreview)
        }"
      >
        {{ getPreviewChar(font, stickerText, props.showPreview) }}
      </span>
    </div>
    
    <!-- Selection Indicator -->
    <div 
      v-if="isSelected"
      class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center"
    >
      <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
    </div>
    
    <!-- Font Name on Hover -->
    <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
      {{ font.name }}
    </div>
    
    <!-- Category Badge -->
    <div class="absolute bottom-0.5 left-0.5">
      <div 
        :class="[
          'w-2 h-2 rounded-full',
          getCategoryColor(font.category)
        ]"
        :title="FONT_CATEGORIES[font.category]"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getFontFamily, FONT_CATEGORIES, loadFont, type FontConfig } from '../config/fonts'

interface Props {
  font: FontConfig
  isSelected: boolean
  stickerText: string
  showPreview?: boolean
}

interface Emits {
  select: [font: FontConfig]
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Font loading state
const fontLoaded = ref(false)
const tileRef = ref<HTMLElement>()

// Intersection Observer for lazy loading
let observer: IntersectionObserver | null = null

// Get preview text - font name, full text, or alternating alphabet
const getPreviewChar = (font: FontConfig, stickerText: string, showPreview?: boolean): string => {
  if (!showPreview) {
    // Show font name when preview is off
    return font.name
  }
  
  if (!stickerText || stickerText.trim() === '') {
    // Show 'Aa' sample for empty badge text
    return 'Aa'
  }
  return stickerText
}

// Get optimal font size based on text length
const getOptimalFontSize = (font: FontConfig, stickerText: string, showPreview?: boolean): string => {
  const text = getPreviewChar(font, stickerText, showPreview)
  const length = text.length
  
  if (length <= 3) return '16px'       // Short text like 'Aa'
  if (length <= 10) return '12px'      // Medium text
  if (length <= 20) return '10px'      // Long text
  return '8px'                         // Very long text
}

// Get category color for the badge indicator
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'serif': 'bg-blue-400',
    'sans-serif': 'bg-green-400', 
    'monospace': 'bg-purple-400',
    'display': 'bg-orange-400',
    'handwriting': 'bg-pink-400',
    'dingbats': 'bg-red-400'
  }
  return colorMap[category] || 'bg-gray-400'
}

// Load font when tile becomes visible
const loadFontLazily = async () => {
  if (fontLoaded.value) return
  
  try {
    // System fonts are always available
    if (props.font.source === 'system') {
      fontLoaded.value = true
      return
    }
    
    // Load the font
    await loadFont(props.font)
    fontLoaded.value = true
  } catch (error) {
    console.warn(`Failed to load font ${props.font.name}:`, error)
    // Still mark as loaded to prevent retry loops, will use fallback
    fontLoaded.value = true
  }
}

// Setup intersection observer
onMounted(() => {
  if (!tileRef.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadFontLazily()
          // Stop observing once we've started loading
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before tile is visible
      threshold: 0.1
    }
  )
  
  observer.observe(tileRef.value)
})

// Cleanup observer
onUnmounted(() => {
  if (observer && tileRef.value) {
    observer.unobserve(tileRef.value)
    observer.disconnect()
  }
})
</script>