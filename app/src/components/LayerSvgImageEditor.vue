<template>
  <ExpandableCard
    :label="layerId"
    :instanceId="instanceId"
    storageKey="expandedImageSelectors"
  >
    <template #preview>
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
      <div class="flex flex-col relative z-10">
        <span class="text-sm text-secondary-900">{{ imageLabel }}</span>
        <span v-if="svgCategory" class="text-[10px] text-secondary-500">{{ svgCategory }}</span>
      </div>
    </template>

    <template #content>
        <!-- Transform Controls Section -->
        <div class="p-4">
          <!-- SVG Centering Warning -->
          <SvgCenteringWarning
            v-if="props.svgAnalysis && props.svgAnalysis.severity !== 'none'"
            :analysis="props.svgAnalysis"
            :centroidAnalysis="props.centroidAnalysis"
            :svgContent="props.svgContent"
            class="mb-4"
            @dismiss="() => {}"
          />
          <div class="bg-secondary-500/5 rounded-lg p-3">
          <SectionHeader @reset="$emit('reset:scale'); $emit('reset:rotation')">
            Transform Controls
          </SectionHeader>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Scale Control -->
          <div class="bg-white rounded-lg p-3 min-w-0">
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

          <!-- Rotation Control -->
          <div class="bg-white rounded-lg p-3 min-w-0">
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
                @input="handleRotationSliderInput($event.target.value)"
              >
              <div class="relative">
                <input
                  :value="rotation"
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  class="w-14 px-1 py-1 pr-4 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="handleRotationTextInput($event.target.value)"
                >
                <span class="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400 pointer-events-none">°</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- SVG Image Styling Section -->
      <div class="p-4 bg-secondary-25 border-t border-secondary-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorPickerInput
            :value="color"
            label="Color"
            placeholder="#22c55e"
            noneLabel="None (invisible SVG)"
            @update:value="$emit('update:color', $event)"
            @reset="$emit('reset:color')"
          />

          <ColorPickerInput
            :value="strokeColor"
            label="Stroke Color"
            placeholder="#000000"
            noneLabel="None (no SVG stroke)"
            @update:value="$emit('update:strokeColor', $event)"
            @reset="$emit('reset:strokeColor')"
          />

          <StrokeControls
            :stroke-width="strokeWidth"
            :stroke-linejoin="strokeLinejoin"
            :disabled="strokeColor === COLOR_NONE"
            @update:strokeWidth="$emit('update:strokeWidth', $event)"
            @update:strokeLinejoin="$emit('update:strokeLinejoin', $event)"
            @reset="$emit('reset:strokeWidth'); $emit('reset:strokeLinejoin')"
          />
        </div>
      </div>

      <!-- SVG Library Section -->
      <ExpandableSvgSelector
        :selectedSvgId="svgId"
        :selectedSvgContent="svgContent"
        :instanceId="instanceId ? `svg-selector-${instanceId}` : undefined"
        @update:selectedSvgId="$emit('update:svgId', $event)"
        @update:selectedSvgContent="$emit('update:svgContent', $event)"
        @clear="clearSvg"
      />
    </template>
  </ExpandableCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExpandableSvgSelector from './ExpandableSvgSelector.vue'
import SvgCenteringWarning from './SvgCenteringWarning.vue'
import ColorPickerInput from './ColorPickerInput.vue'
import StrokeControls from './StrokeControls.vue'
import SectionHeader from './SectionHeader.vue'
import ExpandableCard from './ExpandableCard.vue'
import {
  injectSvgColors,
  applySvgStrokeProperties,
  normalizeSvgCurrentColor,
  sanitizeColorValue
} from '../utils/svg-styling'
import { COLOR_NONE } from '../utils/ui-constants'
import type { SvgViewBoxFitAnalysis, SvgCentroid } from '../utils/svg-bounds'
import { useSvgStore } from '../stores/svgStore'

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
  svgAnalysis?: SvgViewBoxFitAnalysis
  centroidAnalysis?: SvgCentroid
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
  // Reset events
  'reset:svgContent': []
  'reset:svgId': []
  'reset:color': []
  'reset:strokeColor': []
  'reset:strokeWidth': []
  'reset:strokeLinejoin': []
  'reset:rotation': []
  'reset:scale': []
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// SVG Store for category lookup
const svgStore = useSvgStore()

// Extract layer ID from instanceId (removes "svgImage-" prefix)
const layerId = computed(() => {
  if (!props.instanceId) return 'SVG Image'
  return props.instanceId.replace(/^svgImage-/, '')
})

// Get selected SVG category
const svgCategory = computed(() => {
  if (!props.svgId) return null
  const svg = svgStore.items.value.find(item => item.id === props.svgId)
  if (!svg?.category) return null
  // Capitalize and format category name
  return svg.category.charAt(0).toUpperCase() + svg.category.slice(1).replace(/([A-Z])/g, ' $1')
})

// Clear SVG selection and reset all properties to template defaults
const clearSvg = () => {
  // Emit all reset events to restore template defaults (including svgContent and svgId)
  emit('reset:svgContent')
  emit('reset:svgId')
  emit('reset:color')
  emit('reset:strokeColor')
  emit('reset:strokeWidth')
  emit('reset:strokeLinejoin')
  emit('reset:rotation')
  emit('reset:scale')
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
  const parsed = parseFloat(sliderValue)
  if (!isNaN(parsed)) {
    const newScale = sliderValueToScale(parsed)
    emit('update:scale', newScale)
  }
}

const handleScaleTextInput = (percentageValue: string) => {
  const percentage = parseFloat(percentageValue)
  if (!isNaN(percentage)) {
    const clampedPercentage = Math.max(1, Math.min(10000, percentage))
    const newScale = clampedPercentage / 100
    emit('update:scale', newScale)
  }
}

// Rotation event handlers
const handleRotationSliderInput = (value: string) => {
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) {
    emit('update:rotation', parsed)
  }
}

const handleRotationTextInput = (value: string) => {
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) {
    const clamped = Math.max(0, Math.min(360, parsed))
    emit('update:rotation', clamped)
  }
}
</script>