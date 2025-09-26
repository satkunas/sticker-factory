<template>
  <div ref="containerRef" class="w-full">
    <!-- SVG Image Label -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      {{ imageLabel }}
    </div>

    <!-- Arrow Button -->
    <div class="relative">
      <button
        class="expandable-header-btn"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isExpanded }"
        type="button"
        @click="_toggleExpanded"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <!-- SVG Image Preview -->
            <div
              v-if="svgContent"
              class="w-6 h-6 flex-shrink-0 flex items-center justify-center"
              :style="{
                color: props.color
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
      <!-- Inline SVG Selector -->
      <ExpandableSvgSelector
        :selectedSvgId="svgId"
        :selectedSvgContent="svgContent"
        :instanceId="`svg-selector-${instanceId}`"
        @update:selectedSvgId="$emit('update:svgId', $event)"
        @update:selectedSvgContent="$emit('update:svgContent', $event)"
        @clear="clearSvg"
      />

      <!-- SVG Image Styling Section -->
      <div class="p-4 bg-secondary-25">
        <h4 class="section-header">
          {{ imageLabel }} Styling
        </h4>

        <!-- Compact Horizontal Layout -->
        <div class="space-y-4">
          <!-- SVG Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <!-- Color Section -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Color
              </div>
              <div class="flex items-center space-x-1 mb-2">
                <!-- Hidden color input -->
                <input
                  ref="colorInputRef"
                  :value="props.color"
                  type="color"
                  class="sr-only"
                  @input="$emit('update:color', $event.target.value)"
                >
                <!-- Color picker button -->
                <button
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors"
                  :style="{ backgroundColor: props.color }"
                  :title="`Click to change color (${props.color})`"
                  type="button"
                  @click="$refs.colorInputRef?.click()"
                />
                <input
                  :value="props.color"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#22c55e"
                  @input="$emit('update:color', $event.target.value)"
                >
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <button
                  v-for="color in PRESET_COLORS.slice(0, 12)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="color === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:color', color)"
                />
              </div>
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                <button
                  v-for="color in PRESET_COLORS.slice(12, 24)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="color === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:color', color)"
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
                  v-for="color in PRESET_COLORS.slice(0, 12)"
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
                  v-for="color in PRESET_COLORS.slice(12, 24)"
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
                    v-for="linejoin in STROKE_LINEJOIN_OPTIONS"
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

          <!-- Advanced Controls Section -->
          <div class="border-t border-secondary-100 pt-4">
            <h5 class="text-sm font-medium text-secondary-700 mb-3">
              Transform Controls
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <!-- Rotation Control -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Rotation
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="rotation"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:rotation', parseFloat($event.target.value) || 0)"
                  >
                  <div class="relative">
                    <input
                      :value="rotation"
                      type="number"
                      min="0"
                      max="360"
                      step="1"
                      class="w-14 px-1 py-1 pr-4 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                      @input="$emit('update:rotation', Math.max(0, Math.min(360, parseFloat($event.target.value) || 0)))"
                    >
                    <span class="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400 pointer-events-none">°</span>
                  </div>
                </div>
              </div>

              <!-- Scale Control -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Scale
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="scaleSliderValue"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="handleScaleSliderInput($event.target.value)"
                  >
                  <div class="relative">
                    <input
                      :value="scalePercentage"
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      class="w-16 px-1 py-1 pr-5 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                      @input="handleScaleTextInput($event.target.value)"
                    >
                    <span class="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400 pointer-events-none">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import ExpandableSvgSelector from './ExpandableSvgSelector.vue'
import {
  injectSvgColors,
  applySvgStrokeProperties,
  normalizeSvgCurrentColor,
  sanitizeColorValue
} from '../utils/svg-styling'
import { PRESET_COLORS, STROKE_LINEJOIN_OPTIONS } from '../utils/ui-constants'

interface Props {
  imageLabel?: string
  imageDimensions?: string
  svgContent?: string
  svgId?: string
  color?: string
  strokeColor?: string
  strokeWidth?: number
  strokeLinejoin?: string
  rotation?: number
  scale?: number
  instanceId?: string
}

interface Emits {
  'update:svgContent': [value: string]
  'update:svgId': [value: string]
  'update:color': [value: string]
  'update:strokeColor': [value: string]
  'update:strokeWidth': [value: number]
  'update:strokeLinejoin': [value: string]
  'update:rotation': [value: number]
  'update:scale': [value: number]
}

const props = withDefaults(defineProps<Props>(), {
  imageLabel: 'SVG Image',
  imageDimensions: '',
  svgContent: '',
  svgId: '',
  color: '#22c55e',
  strokeColor: '#000000',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  rotation: 0,
  scale: 1.0,
  instanceId: 'default'
})

const emit = defineEmits<Emits>()


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

const _toggleExpanded = () => {
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


// Clear SVG selection
const clearSvg = () => {
  emit('update:svgContent', '')
  emit('update:svgId', '')
}

// Apply enhanced styling to SVG content for preview using utilities
const styledSvgContent = computed(() => {
  if (!props.svgContent) return ''

  try {
    let styledSvg = props.svgContent

    // Sanitize colors first
    const fillColor = sanitizeColorValue(props.color)
    const strokeColor = sanitizeColorValue(props.strokeColor)

    // Apply color injection using the new utilities
    styledSvg = injectSvgColors(
      styledSvg,
      fillColor,
      strokeColor,
      { forceFill: true, forceStroke: props.strokeWidth > 0 }
    )

    // Apply stroke properties
    if (props.strokeWidth > 0) {
      styledSvg = applySvgStrokeProperties(
        styledSvg,
        props.strokeWidth,
        props.strokeLinejoin
      )
    }

    // Normalize currentColor for proper inheritance
    styledSvg = normalizeSvgCurrentColor(styledSvg)

    return styledSvg
  } catch (error) {
    // Fallback to original content on error
    return props.svgContent
  }
})


// Scale handling - convert between 0.01-100x multiplier and 0-100 logarithmic slider
const scaleToSliderValue = (scale: number): number => {
  // Convert 0.01-100 scale to 0-100 slider using logarithmic mapping
  const clampedScale = Math.max(0.01, Math.min(100, scale))
  const logValue = Math.log10(clampedScale)
  // Map log range [-2, 2] to slider range [0, 100]
  return Math.round(((logValue + 2) / 4) * 100)
}

const sliderValueToScale = (sliderValue: number): number => {
  // Convert 0-100 slider to 0.01-100 scale using logarithmic mapping
  const clampedSlider = Math.max(0, Math.min(100, sliderValue))
  // Map slider range [0, 100] to log range [-2, 2]
  const logValue = ((clampedSlider / 100) * 4) - 2
  return Math.pow(10, logValue)
}

// Computed properties for scale conversion
const scaleSliderValue = computed(() => scaleToSliderValue(props.scale))
const scalePercentage = computed(() => Math.round(props.scale * 100))

// Scale event handlers
const handleScaleSliderInput = (sliderValue: string) => {
  const newScale = sliderValueToScale(parseFloat(sliderValue) || 0)
  emit('update:scale', newScale)
}

const handleScaleTextInput = (percentageValue: string) => {
  const percentage = parseFloat(percentageValue) || 100
  const clampedPercentage = Math.max(1, Math.min(10000, percentage))
  const newScale = clampedPercentage / 100
  emit('update:scale', newScale)
}
</script>