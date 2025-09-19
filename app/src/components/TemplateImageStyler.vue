<template>
  <div ref="containerRef" class="w-full">
    <!-- SVG Image Label -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      {{ imageLabel }}
    </div>

    <!-- Arrow Button -->
    <div class="relative">
      <button
        class="w-full p-3 bg-white border border-secondary-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-300 transition-colors"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isExpanded }"
        type="button"
        @click="toggleExpanded"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <!-- SVG Image Preview -->
            <div
              v-if="svgContent"
              class="w-6 h-6 flex-shrink-0 flex items-center justify-center"
              :style="{
                color: fillColor
              }"
              v-html="styledSvgContent"
            />

            <!-- Fallback placeholder for missing SVG -->
            <div
              v-else
              class="w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center text-xs text-secondary-400"
              :style="{
                backgroundColor: '#f3f4f6',
                borderColor: strokeColor,
                borderWidth: Math.max(1, strokeWidth) + 'px'
              }"
            >
              SVG
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-secondary-900">{{ imageLabel }}</span>
              <span v-if="imageDimensions" class="text-xs text-secondary-500">{{ imageDimensions }}</span>
            </div>
          </div>
          <svg
            class="w-5 h-5 text-secondary-400 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Expandable SVG Image Styling Section -->
    <div
      v-if="isExpanded"
      class="mt-4 bg-white border border-secondary-200 rounded-lg overflow-hidden"
    >
      <!-- SVG Selection Section -->
      <div class="p-4 bg-secondary-25 border-b border-secondary-200">
        <h4 class="font-medium text-secondary-900 mb-3">
          SVG Selection
        </h4>
        <div class="flex items-center space-x-2">
          <button
            class="flex-1 px-3 py-2 bg-white border border-secondary-200 rounded-md text-sm text-secondary-700 hover:border-secondary-300 transition-colors flex items-center justify-center space-x-2"
            type="button"
            @click="showSvgSelector = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ svgContent ? 'Change SVG' : 'Select SVG' }}</span>
          </button>
          <button
            v-if="svgContent"
            class="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-100 transition-colors"
            type="button"
            title="Remove SVG"
            @click="clearSvg"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- SVG Image Styling Section -->
      <div class="p-4 bg-secondary-25">
        <h4 class="font-medium text-secondary-900 mb-3">
          {{ imageLabel }} Styling
        </h4>

        <!-- Compact Horizontal Layout -->
        <div class="space-y-4">
          <!-- SVG Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <!-- Fill Color Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Fill Color
              </div>
              <div class="flex items-center space-x-1 mb-2">
                <!-- Hidden color input -->
                <input
                  ref="fillColorInputRef"
                  :value="fillColor"
                  type="color"
                  class="sr-only"
                  @input="$emit('update:fillColor', $event.target.value)"
                >
                <!-- Color picker button -->
                <button
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors"
                  :style="{ backgroundColor: fillColor }"
                  :title="`Click to change fill color (${fillColor})`"
                  type="button"
                  @click="$refs.fillColorInputRef?.click()"
                />
                <input
                  :value="fillColor"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#22c55e"
                  @input="$emit('update:fillColor', $event.target.value)"
                >
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <button
                  v-for="color in presetColors.slice(0, 12)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="fillColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:fillColor', color)"
                />
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                <button
                  v-for="color in presetColors.slice(12, 24)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="fillColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:fillColor', color)"
                />
              </div>
            </div>

            <!-- Stroke Color Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Stroke Color
              </div>
              <div class="flex items-center space-x-1 mb-2">
                <!-- Hidden color input -->
                <input
                  ref="strokeColorInputRef"
                  :value="strokeColor"
                  type="color"
                  class="sr-only"
                  @input="$emit('update:strokeColor', $event.target.value)"
                >
                <!-- Color picker button -->
                <button
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex-shrink-0"
                  :style="{ backgroundColor: strokeColor }"
                  :title="`Click to change stroke color (${strokeColor})`"
                  type="button"
                  @click="$refs.strokeColorInputRef?.click()"
                />
                <input
                  :value="strokeColor"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#000000"
                  @input="$emit('update:strokeColor', $event.target.value)"
                >
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <button
                  v-for="color in presetColors.slice(0, 12)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="strokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:strokeColor', color)"
                />
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                <button
                  v-for="color in presetColors.slice(12, 24)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="strokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:strokeColor', color)"
                />
              </div>
            </div>
          </div>

          <!-- Stroke Controls Section -->
          <div class="border-t border-secondary-100 pt-4">
            <h5 class="text-sm font-medium text-secondary-700 mb-3">
              Stroke Options
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <!-- Stroke Width -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Width
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="strokeWidth"
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:strokeWidth', parseFloat($event.target.value) || 0)"
                  >
                  <input
                    :value="strokeWidth"
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="$emit('update:strokeWidth', parseFloat($event.target.value) || 0)"
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
                    :class="strokeLinejoin === linejoin.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                    :title="linejoin.description"
                    @click="$emit('update:strokeLinejoin', linejoin.value)"
                  >
                    {{ linejoin.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG Library Selector Modal -->
    <SvgLibrarySelector
      v-if="showSvgSelector"
      @select="handleSvgSelect"
      @close="showSvgSelector = false"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import SvgLibrarySelector from './SvgLibrarySelector.vue'

interface Props {
  imageLabel?: string
  imageDimensions?: string
  svgContent?: string
  svgId?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  strokeLinejoin?: string
  instanceId?: string
}

interface Emits {
  'update:svgContent': [value: string]
  'update:svgId': [value: string]
  'update:fillColor': [value: string]
  'update:strokeColor': [value: string]
  'update:strokeWidth': [value: number]
  'update:strokeLinejoin': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  imageLabel: 'SVG Image',
  imageDimensions: '',
  svgContent: '',
  svgId: '',
  fillColor: '#22c55e',
  strokeColor: '#000000',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  instanceId: 'default'
})

const emit = defineEmits<Emits>()

// SVG Library Selector modal state
const showSvgSelector = ref(false)

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedImageInstances = inject('expandedImageSelectors', ref(new Set<string>()))

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Local expansion state
const isExpanded = computed(() => {
  if (dropdownManager) {
    return dropdownManager.isExpanded(props.instanceId)
  }
  // Legacy fallback
  return expandedImageInstances.value.has(props.instanceId)
})

const toggleExpanded = () => {
  if (dropdownManager) {
    dropdownManager.toggle(props.instanceId, containerRef.value)
  } else {
    // Legacy fallback
    if (isExpanded.value) {
      expandedImageInstances.value.delete(props.instanceId)
    } else {
      expandedImageInstances.value.add(props.instanceId)
    }
  }
}

// Handle SVG selection from library
const handleSvgSelect = (svg: SvgLibraryItem) => {
  emit('update:svgContent', svg.svgContent)
  emit('update:svgId', svg.id)
  showSvgSelector.value = false
}

// Clear SVG selection
const clearSvg = () => {
  emit('update:svgContent', '')
  emit('update:svgId', '')
}

// Apply styling to SVG content for preview
const styledSvgContent = computed(() => {
  if (!props.svgContent) return ''

  // Apply fill and stroke styling to the SVG content
  let styledSvg = props.svgContent

  // Add styles to existing SVG elements
  styledSvg = styledSvg.replace(/<svg([^>]*)>/i, (match, attributes) => {
    return `<svg${attributes} style="fill: ${props.fillColor}; stroke: ${props.strokeColor}; stroke-width: ${props.strokeWidth}; stroke-linejoin: ${props.strokeLinejoin};">`
  })

  // Also apply to path elements if they don't have explicit fill/stroke
  styledSvg = styledSvg.replace(/<path([^>]*?)>/gi, (match, attributes) => {
    if (!attributes.includes('fill=') && !attributes.includes('style=')) {
      return `<path${attributes} fill="currentColor">`
    }
    return match
  })

  return styledSvg
})

// Preset color palette (same as used in shape styling)
const presetColors = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6',
  '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#ec4899', '#f43f5e'
]

// Stroke linejoin options (same as TemplateObjectStyler)
const strokeLinejoinOptions = [
  { value: 'round', label: 'Round', description: 'Rounded corners at line joins' },
  { value: 'miter', label: 'Miter', description: 'Sharp pointed corners at line joins' },
  { value: 'bevel', label: 'Bevel', description: 'Flat corners at line joins' },
  { value: 'arcs', label: 'Arcs', description: 'Arc corners at line joins' },
  { value: 'miter-clip', label: 'Clip', description: 'Clipped miter corners at line joins' }
]
</script>