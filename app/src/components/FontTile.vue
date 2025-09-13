<template>
  <button
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
          fontFamily: getFontFamily(font),
          color: isSelected ? '#059669' : '#374151',
          fontSize: getOptimalFontSize(font, badgeText, props.showPreview)
        }"
      >
        {{ getPreviewChar(font, badgeText, props.showPreview) }}
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
import { getFontFamily, FONT_CATEGORIES, type FontConfig } from '../config/fonts'

interface Props {
  font: FontConfig
  isSelected: boolean
  badgeText: string
  showPreview?: boolean
}

interface Emits {
  select: [font: FontConfig]
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Get preview text - font name, full text, or alternating alphabet
const getPreviewChar = (font: FontConfig, badgeText: string, showPreview?: boolean): string => {
  if (!showPreview) {
    // Show font name when preview is off
    return font.name
  }
  
  if (!badgeText || badgeText.trim() === '') {
    // Generate alternating upper/lower case alphabet (AaBbCc...) when preview is on but no text
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    return alphabet.split('').map((letter, index) => 
      index % 2 === 0 ? letter.toUpperCase() : letter
    ).join('')
  }
  return badgeText
}

// Get optimal font size based on text length
const getOptimalFontSize = (font: FontConfig, badgeText: string, showPreview?: boolean): string => {
  const text = getPreviewChar(font, badgeText, showPreview)
  const length = text.length
  
  if (length <= 3) return '20px'       // Short text or single characters
  if (length <= 10) return '14px'      // Medium text
  if (length <= 20) return '10px'      // Long text
  return '8px'                         // Very long text (alphabet)
}

// Get category color for the badge indicator
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
</script>