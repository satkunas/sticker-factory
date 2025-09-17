<template>
  <div ref="containerRef" class="w-full">
    <!-- Shape Object Label -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      {{ shapeLabel }}
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
            <!-- Shape Preview -->
            <svg
              v-if="shapeData"
              class="w-6 h-6 flex-shrink-0"
              :viewBox="calculatedViewBox"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Rectangle with rounded corners support -->
              <rect
                v-if="shapeData.subtype === 'rect' && rectCoords"
                :x="rectCoords.x"
                :y="rectCoords.y"
                :width="rectCoords.width"
                :height="rectCoords.height"
                :rx="rectCoords.rx"
                :ry="rectCoords.ry"
                :fill="fillColor"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linejoin="strokeLinejoin"
              />

              <!-- Perfect circles -->
              <circle
                v-else-if="shapeData.subtype === 'circle' && circleCoords"
                :cx="circleCoords.cx"
                :cy="circleCoords.cy"
                :r="circleCoords.r"
                :fill="fillColor"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linejoin="strokeLinejoin"
              />

              <!-- Ellipses -->
              <ellipse
                v-else-if="shapeData.subtype === 'ellipse' && ellipseCoords"
                :cx="ellipseCoords.cx"
                :cy="ellipseCoords.cy"
                :rx="ellipseCoords.rx"
                :ry="ellipseCoords.ry"
                :fill="fillColor"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linejoin="strokeLinejoin"
              />

              <!-- Lines -->
              <line
                v-else-if="shapeData.subtype === 'line' && lineCoords"
                :x1="lineCoords.x1"
                :y1="lineCoords.y1"
                :x2="lineCoords.x2"
                :y2="lineCoords.y2"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linecap="strokeLinejoin"
                fill="none"
              />

              <!-- Complex shapes (polygons, paths) -->
              <path
                v-else-if="shapePath"
                :d="shapePath"
                :fill="fillColor"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linejoin="strokeLinejoin"
              />

              <!-- Fallback for unknown shapes -->
              <rect
                v-else
                x="-50" y="-50" width="100" height="100"
                :fill="fillColor"
                :stroke="strokeColor"
                :stroke-width="adjustedStrokeWidth"
                :stroke-linejoin="strokeLinejoin"
              />
            </svg>

            <!-- Fallback square for missing shape data -->
            <div
              v-else
              class="w-6 h-6 rounded border flex-shrink-0"
              :style="{
                backgroundColor: fillColor,
                borderColor: strokeColor,
                borderWidth: Math.max(1, strokeWidth) + 'px'
              }"
            />
            <div class="flex flex-col">
              <span class="text-sm text-secondary-900">{{ shapeLabel }}</span>
              <span v-if="shapeDimensions" class="text-xs text-secondary-500">{{ shapeDimensions }}</span>
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

    <!-- Expandable Object Styling Section -->
    <div
      v-if="isExpanded"
      class="mt-4 bg-white border border-secondary-200 rounded-lg overflow-hidden"
    >
      <!-- Object Styling Section -->
      <div class="p-4 bg-secondary-25">
        <h4 class="font-medium text-secondary-900 mb-3">
          {{ shapeLabel }} Styling
        </h4>

        <!-- Compact Horizontal Layout -->
        <div class="space-y-4">
          <!-- Object Controls -->
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
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue'

interface Props {
  shapeLabel?: string
  shapeDimensions?: string
  shapeData?: any // Original template shape layer data
  shapePath?: string // Processed SVG path
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  strokeLinejoin?: string
  instanceId?: string
}

interface Emits {
  'update:fillColor': [value: string]
  'update:strokeColor': [value: string]
  'update:strokeWidth': [value: number]
  'update:strokeLinejoin': [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  shapeLabel: 'Shape',
  shapeDimensions: '',
  shapeData: null,
  shapePath: '',
  fillColor: '#22c55e',
  strokeColor: '#000000',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  instanceId: 'default'
})

defineEmits<Emits>()

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedObjectInstances = inject('expandedObjectSelectors', ref(new Set<string>()))

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Local expansion state
const isExpanded = computed(() => {
  if (dropdownManager) {
    return dropdownManager.isExpanded(props.instanceId)
  }
  // Legacy fallback
  return expandedObjectInstances.value.has(props.instanceId)
})

const toggleExpanded = () => {
  if (dropdownManager) {
    dropdownManager.toggle(props.instanceId, containerRef.value)
  } else {
    // Legacy fallback
    if (isExpanded.value) {
      expandedObjectInstances.value.delete(props.instanceId)
    } else {
      expandedObjectInstances.value.add(props.instanceId)
    }
  }
}

// Preset color palette (same as used in text styling)
const presetColors = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6',
  '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#ec4899', '#f43f5e'
]

// Stroke linejoin options (copied from ExpandableFontSelector)
const strokeLinejoinOptions = [
  { value: 'round', label: 'Round', description: 'Rounded corners at line joins' },
  { value: 'miter', label: 'Miter', description: 'Sharp pointed corners at line joins' },
  { value: 'bevel', label: 'Bevel', description: 'Flat corners at line joins' },
  { value: 'arcs', label: 'Arcs', description: 'Arc corners at line joins' },
  { value: 'miter-clip', label: 'Clip', description: 'Clipped miter corners at line joins' }
]

// SVG Preview calculations
const svgPreviewSize = 24 // 24x24px (w-6 h-6)
const padding = 2

// Calculate optimal viewBox for different shape types
const calculatedViewBox = computed(() => {
  if (!props.shapeData) {
    return '0 0 100 100' // Default fallback
  }

  const shape = props.shapeData
  const strokePadding = Math.max(1, props.strokeWidth) + padding

  switch (shape.subtype) {
    case 'rect': {
      const width = shape.width || 100
      const height = shape.height || 100
      const totalWidth = width + strokePadding * 2
      const totalHeight = height + strokePadding * 2
      return `${-strokePadding} ${-strokePadding} ${totalWidth} ${totalHeight}`
    }

    case 'circle': {
      const radius = (shape.width || 100) / 2
      const totalSize = (radius + strokePadding) * 2
      return `${-(radius + strokePadding)} ${-(radius + strokePadding)} ${totalSize} ${totalSize}`
    }

    case 'ellipse': {
      const rWidth = (shape.width || 100) / 2
      const rHeight = (shape.height || 50) / 2
      const totalWidth = (rWidth + strokePadding) * 2
      const totalHeight = (rHeight + strokePadding) * 2
      return `${-(rWidth + strokePadding)} ${-(rHeight + strokePadding)} ${totalWidth} ${totalHeight}`
    }

    case 'line': {
      const pos = shape.position as { x1: number; y1: number; x2: number; y2: number }
      const minX = Math.min(pos.x1, pos.x2)
      const minY = Math.min(pos.y1, pos.y2)
      const maxX = Math.max(pos.x1, pos.x2)
      const maxY = Math.max(pos.y1, pos.y2)
      const width = maxX - minX + strokePadding * 2
      const height = maxY - minY + strokePadding * 2
      return `${minX - strokePadding} ${minY - strokePadding} ${width} ${height}`
    }

    case 'polygon':
    default: {
      // For polygons and complex shapes, try to calculate bounds from path
      if (props.shapePath) {
        const bounds = calculatePathBounds(props.shapePath)
        if (bounds) {
          const width = bounds.maxX - bounds.minX + strokePadding * 2
          const height = bounds.maxY - bounds.minY + strokePadding * 2
          return `${bounds.minX - strokePadding} ${bounds.minY - strokePadding} ${width} ${height}`
        }
      }
      // Fallback for complex shapes
      const size = Math.max(shape.width || 100, shape.height || 100)
      const totalSize = size + strokePadding * 2
      return `${-totalSize/2} ${-totalSize/2} ${totalSize} ${totalSize}`
    }
  }
})

// Adjusted stroke width for preview - make strokes more visible in small preview
const adjustedStrokeWidth = computed(() => {
  if (props.strokeWidth === 0) return 0 // No stroke if width is 0

  // Use a more generous scaling that ensures strokes are clearly visible
  // For small previews, we want strokes to be proportionally larger so they're visible
  const minVisibleStroke = 1 // Minimum visible stroke in preview
  const scaledStroke = props.strokeWidth * 0.5 // More generous scaling than 0.24

  return Math.max(minVisibleStroke, scaledStroke)
})

// Shape-specific coordinate calculations
const rectCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'rect') return null
  const width = props.shapeData.width || 100
  const height = props.shapeData.height || 100
  return {
    x: -width / 2,
    y: -height / 2,
    width,
    height,
    rx: props.shapeData.rx || 0,
    ry: props.shapeData.ry || 0
  }
})

const circleCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'circle') return null
  const radius = (props.shapeData.width || 100) / 2
  return {
    cx: 0,
    cy: 0,
    r: radius
  }
})

const ellipseCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'ellipse') return null
  return {
    cx: 0,
    cy: 0,
    rx: (props.shapeData.width || 100) / 2,
    ry: (props.shapeData.height || 50) / 2
  }
})

const lineCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'line') return null
  const pos = props.shapeData.position as { x1: number; y1: number; x2: number; y2: number }
  return {
    x1: pos.x1,
    y1: pos.y1,
    x2: pos.x2,
    y2: pos.y2
  }
})

// Helper function to calculate bounds from SVG path
function calculatePathBounds(path: string): { minX: number; minY: number; maxX: number; maxY: number } | null {
  try {
    // Simple regex to extract coordinate pairs from path
    const coords = path.match(/[0-9.-]+/g)
    if (!coords || coords.length < 2) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    for (let i = 0; i < coords.length - 1; i += 2) {
      const x = parseFloat(coords[i])
      const y = parseFloat(coords[i + 1])

      if (!isNaN(x) && !isNaN(y)) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }

    return minX !== Infinity ? { minX, minY, maxX, maxY } : null
  } catch (error) {
    return null
  }
}
</script>