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
          <!-- Fill Color Section -->
          <div class="bg-secondary-500/5 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-secondary-700">
                Fill Color
              </div>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:fillColor')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
              <div class="bg-white rounded-lg p-2 flex items-center space-x-1 mb-2">
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
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex items-center justify-center"
                  :style="fillColor === COLOR_NONE ? { backgroundColor: 'white' } : { backgroundColor: fillColor }"
                  :title="`Click to change fill color (${fillColor})`"
                  type="button"
                  @click="$refs.fillColorInputRef?.click()"
                >
                  <svg v-if="fillColor === COLOR_NONE" class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <input
                  :value="fillColor"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#22c55e"
                  @input="$emit('update:fillColor', $event.target.value)"
                >
              </div>
              <div class="bg-white rounded-lg p-2">
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <!-- None button with red cross icon -->
                <button
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all flex items-center justify-center bg-white"
                  :class="fillColor === COLOR_NONE ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :title="'None (transparent)'"
                  @click="$emit('update:fillColor', COLOR_NONE)"
                >
                  <svg class="w-2 h-2 md:w-3 md:h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="color in PRESET_COLORS.slice(0, 11)"
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
                  v-for="color in PRESET_COLORS.slice(11, 23)"
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
                  v-for="color in PRESET_COLORS.slice(23, 35)"
                  :key="color"
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                  :class="fillColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="$emit('update:fillColor', color)"
                />
              </div>
              </div>
          </div>

          <!-- Stroke Color Section -->
          <div class="bg-secondary-500/5 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-secondary-700">
                Stroke Color
              </div>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:strokeColor')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
              <div class="bg-white rounded-lg p-2 flex items-center space-x-1 mb-2">
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
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex-shrink-0 flex items-center justify-center"
                  :style="strokeColor === COLOR_NONE ? { backgroundColor: 'white' } : { backgroundColor: strokeColor }"
                  :title="`Click to change stroke color (${strokeColor})`"
                  type="button"
                  @click="$refs.strokeColorInputRef?.click()"
                >
                  <svg v-if="strokeColor === COLOR_NONE" class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <input
                  :value="strokeColor"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#000000"
                  @input="$emit('update:strokeColor', $event.target.value)"
                >
              </div>
              <div class="bg-white rounded-lg p-2">
              <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                <!-- None button with red cross icon -->
                <button
                  class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all flex items-center justify-center bg-white"
                  :class="strokeColor === COLOR_NONE ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :title="'None (no stroke)'"
                  @click="$emit('update:strokeColor', COLOR_NONE)"
                >
                  <svg class="w-2 h-2 md:w-3 md:h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="color in PRESET_COLORS.slice(0, 11)"
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
                  v-for="color in PRESET_COLORS.slice(11, 23)"
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
                  v-for="color in PRESET_COLORS.slice(23, 35)"
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
          <div class="bg-secondary-500/5 rounded-lg p-3 md:col-span-2">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-secondary-700">
                Stroke Options
              </h5>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:strokeWidth'); $emit('reset:strokeLinejoin')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Stroke Width -->
              <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': strokeColor === COLOR_NONE }">
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
                    :disabled="strokeColor === COLOR_NONE"
                    :class="{ 'cursor-not-allowed': strokeColor === COLOR_NONE }"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="handleStrokeWidthInput($event.target.value)"
                  >
                  <input
                    :value="strokeWidth"
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    :disabled="strokeColor === COLOR_NONE"
                    :class="{ 'cursor-not-allowed': strokeColor === COLOR_NONE }"
                    class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="handleStrokeWidthInput($event.target.value)"
                  >
                </div>
              </div>

              <!-- Stroke Linejoin -->
              <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': strokeColor === COLOR_NONE }">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Linejoin
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <button
                    v-for="linejoin in STROKE_LINEJOIN_OPTIONS"
                    :key="linejoin.value"
                    :disabled="strokeColor === COLOR_NONE"
                    class="px-2 py-1 text-xs rounded border transition-all text-center"
                    :class="[
                      strokeLinejoin === linejoin.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300',
                      { 'cursor-not-allowed': strokeColor === COLOR_NONE }
                    ]"
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
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted } from 'vue'
import { PRESET_COLORS, STROKE_LINEJOIN_OPTIONS, COLOR_NONE } from '../utils/ui-constants'

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

const emit = defineEmits<Emits>()

// Stroke width event handler
const handleStrokeWidthInput = (value: string) => {
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) {
    emit('update:strokeWidth', parsed)
  }
}

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedObjectInstances = inject('expandedObjectSelectors', ref(new Set<string>()))

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Check if this is a path layer (used for textPath references, not editable)
const isPathLayer = computed(() => {
  return props.shapeData?.subtype === 'path'
})

// Extract layer ID from instanceId (removes "shape-" prefix)
const layerId = computed(() => {
  if (!props.instanceId) return 'Shape'
  return props.instanceId.replace(/^shape-/, '')
})

// Local expansion state
const isExpanded = computed(() => {
  const id = props.instanceId
  if (!id) return false

  if (dropdownManager) {
    return dropdownManager.isExpanded(id)
  }
  // Legacy fallback
  return expandedObjectInstances.value.has(id)
})

const _toggleExpanded = () => {
  const id = props.instanceId
  if (!id) return

  if (dropdownManager) {
    dropdownManager.toggle(id)
  } else {
    // Legacy fallback
    if (isExpanded.value) {
      expandedObjectInstances.value.delete(id)
    } else {
      // Close all other instances first
      expandedObjectInstances.value.clear()
      // Open this instance
      expandedObjectInstances.value.add(id)
    }
  }
}

// Escape key handler
const handleKeydown = (event: KeyboardEvent) => {
  const id = props.instanceId
  if (event.key === 'Escape' && isExpanded.value && id) {
    if (dropdownManager) {
      dropdownManager.close(id)
    } else {
      // Legacy fallback
      expandedObjectInstances.value.delete(id)
    }
  }
}

// Mount event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
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