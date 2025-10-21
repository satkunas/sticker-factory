<template>
  <div ref="containerRef" class="w-full" :data-instance-id="instanceId">
    <!-- Shape Object Label -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      {{ layerId }}
    </div>

    <!-- Arrow Button -->
    <div class="relative rounded-lg transition-all duration-300 ease-in-out" :class="{ 'ring-2 ring-primary-500': isExpanded }">
      <button
        class="w-full p-3 bg-white border border-secondary-200 rounded-t-lg text-left focus:outline-none hover:border-secondary-300 transition-colors"
        :class="{ 'border-primary-500': isExpanded, 'rounded-b-lg': !isExpanded }"
        type="button"
        @click="_toggleExpanded"
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

      <!-- Expandable Object Styling Section -->
      <Transition
        name="slide-down"
        enterActiveClass="transition-all duration-300 ease-out"
        leaveActiveClass="transition-all duration-300 ease-in"
        enterFromClass="max-h-0 opacity-0"
        enterToClass="max-h-[1000px] opacity-100"
        leaveFromClass="max-h-[1000px] opacity-100"
        leaveToClass="max-h-0 opacity-0"
      >
        <div
          v-if="isExpanded"
          class="bg-secondary-25 border-t border-secondary-200 overflow-hidden"
        >
        <!-- Path Layer Notice (disabled editing) -->
        <div v-if="isPathLayer" class="p-4 bg-amber-50 border-b border-amber-200">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-amber-800">Path Layer (Read-Only)</p>
              <p class="text-xs text-amber-700 mt-1">This layer is used as a path reference for curved text and cannot be edited directly.</p>
            </div>
          </div>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4" :class="{ 'opacity-50 pointer-events-none': isPathLayer }">
          <ColorPickerInput
            :value="fillColor"
            label="Fill Color"
            placeholder="#22c55e"
            noneLabel="None (transparent)"
            @update:value="$emit('update:fillColor', $event)"
            @reset="$emit('reset:fillColor')"
          />

          <ColorPickerInput
            :value="strokeColor"
            label="Stroke Color"
            placeholder="#000000"
            noneLabel="None (no stroke)"
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
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { COLOR_NONE } from '../utils/ui-constants'
import ColorPickerInput from './ColorPickerInput.vue'
import StrokeControls from './StrokeControls.vue'
import { useExpandable } from '../composables/useExpandable'

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
  // Reset events
  'reset:fillColor': []
  'reset:strokeColor': []
  'reset:strokeWidth': []
  'reset:strokeLinejoin': []
}

const props = defineProps<Props>()

defineEmits<Emits>()

// Expandable state management
const { isExpanded, toggle: _toggleExpanded, containerRef } = useExpandable(
  () => props.instanceId,
  'expandedObjectSelectors'
)

// Check if this is a path layer (used for textPath references, not editable)
const isPathLayer = computed(() => {
  return props.shapeData?.subtype === 'path'
})

// Extract layer ID from instanceId (removes "shape-" prefix)
const layerId = computed(() => {
  if (!props.instanceId) return 'Shape'
  return props.instanceId.replace(/^shape-/, '')
})


// SVG Preview calculations
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
      const width = shape.width
      const height = shape.height
      if (!width || !height) return '0 0 100 100'
      const totalWidth = width + strokePadding * 2
      const totalHeight = height + strokePadding * 2
      return `${-strokePadding} ${-strokePadding} ${totalWidth} ${totalHeight}`
    }

    case 'circle': {
      const width = shape.width
      if (!width) return '0 0 100 100'
      const radius = width / 2
      const totalSize = (radius + strokePadding) * 2
      return `${-(radius + strokePadding)} ${-(radius + strokePadding)} ${totalSize} ${totalSize}`
    }

    case 'ellipse': {
      const width = shape.width
      const height = shape.height
      if (!width || !height) return '0 0 100 100'
      const rWidth = width / 2
      const rHeight = height / 2
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
      const width = shape.width ?? 0
      const height = shape.height ?? 0
      if (!width && !height) return '0 0 100 100'
      const size = Math.max(width, height)
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
  const width = props.shapeData.width
  const height = props.shapeData.height
  if (!width || !height) return null
  return {
    x: -width / 2,
    y: -height / 2,
    width,
    height,
    rx: props.shapeData.rx,
    ry: props.shapeData.ry
  }
})

const circleCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'circle') return null
  const width = props.shapeData.width
  if (!width) return null
  const radius = width / 2
  return {
    cx: 0,
    cy: 0,
    r: radius
  }
})

const ellipseCoords = computed(() => {
  if (!props.shapeData || props.shapeData.subtype !== 'ellipse') return null
  const width = props.shapeData.width
  const height = props.shapeData.height
  if (!width || !height) return null
  return {
    cx: 0,
    cy: 0,
    rx: width / 2,
    ry: height / 2
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