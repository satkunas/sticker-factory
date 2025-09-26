<template>
  <!-- Combined Controls & Legend -->
  <div v-if="!previewMode" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-secondary-200">
    <!-- Mini Overview & Scale -->
    <div class="flex items-center space-x-2 mb-2">
      <!-- Mini SVG -->
      <div
        class="bg-secondary-50 rounded border overflow-hidden relative flex-shrink-0"
        :class="miniOverviewClasses"
        :style="miniOverviewStyle"
      >
        <!-- Picture-in-Picture SVG Preview -->
        <div class="absolute inset-0" :style="miniSvgContainerStyle">
          <!-- Use the actual SvgCanvas component as picture-in-picture -->
          <SvgCanvas
            v-if="template"
            :stickerText="stickerText"
            :textColor="textColor"
            :font="font"
            :fontSize="fontSize"
            :fontWeight="fontWeight"
            :strokeColor="strokeColor"
            :strokeWidth="strokeWidth"
            :strokeOpacity="strokeOpacity"
            :width="width"
            :height="height"
            :template="template"
            :textInputs="textInputs"
            :shapeStyles="shapeStyles"
            :svgImageStyles="svgImageStyles"
            :previewMode="false"
            class="opacity-40"
            :style="miniSvgStyle"
          />
          <div
            v-else
            class="rounded-full bg-green-500"
            :style="{
              width: '24px',
              height: '8px',
              margin: 'auto'
            }"
          />
        </div>

        <!-- Viewport Rectangle -->
        <div
          class="absolute border-2 border-primary-500 bg-primary-100/40"
          :style="viewportStyle"
        />
      </div>

      <!-- Scale indicator -->
      <span class="text-xs text-secondary-600 font-mono">{{ zoomPercentage }}%</span>
    </div>

    <!-- Zoom Controls -->
    <div class="flex items-center space-x-1">
      <button
        class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        :disabled="!canZoomOut"
        title="Zoom out"
        @click="$emit('zoomOut')"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <input
        :value="zoomLevel"
        type="range"
        :min="minZoom"
        max="50"
        step="0.1"
        class="w-16 h-1.5 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
        @input="$emit('zoomChange', parseFloat(($event.target as HTMLInputElement).value))"
      >

      <button
        class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        :disabled="!canZoomIn"
        title="Zoom in"
        @click="$emit('zoomIn')"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <div class="h-4 w-px bg-secondary-300 mx-1" />

      <button
        class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        title="Fit to view"
        @click="$emit('autoFit')"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        title="Reset zoom and position"
        @click="$emit('resetZoom')"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import type { FontConfig } from '../config/fonts'
import SvgCanvas from './SvgCanvas.vue'

interface Props {
  zoomLevel: number
  panX: number
  panY: number
  zoomPercentage: number
  canZoomIn: boolean
  canZoomOut: boolean
  minZoom: number
  template?: SimpleTemplate | null
  previewMode?: boolean
  containerDimensions?: { width: number; height: number }

  // Picture-in-picture data (all the same props as SvgCanvas)
  stickerText?: string
  textColor?: string
  font?: FontConfig | null
  fontSize?: number
  fontWeight?: number
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  width?: number
  height?: number
  textInputs?: Array<{
    id: string
    text: string
    font: any | null
    fontSize: number
    fontWeight: number
    textColor: string
    strokeWidth: number
    strokeColor: string
    strokeOpacity: number
  }>
  shapeStyles?: Array<{
    id: string
    fillColor: string
    strokeColor: string
    strokeWidth: number
    strokeLinejoin: string
  }>
  svgImageStyles?: Array<{
    id: string
    color: string
    strokeColor: string
    strokeWidth: number
    strokeLinejoin: string
    svgContent?: string
    rotation: number
    scale: number
  }>
}

const props = withDefaults(defineProps<Props>(), {
  template: null,
  previewMode: false,
  containerDimensions: () => ({ width: 0, height: 0 }),

  // Picture-in-picture defaults
  stickerText: '',
  textColor: '#ffffff',
  font: null,
  fontSize: 16,
  fontWeight: 400,
  strokeColor: '#000000',
  strokeWidth: 0,
  strokeOpacity: 1.0,
  width: 400,
  height: 120,
  textInputs: () => [],
  shapeStyles: () => [],
  svgImageStyles: () => []
})

defineEmits<{
  'zoomIn': []
  'zoomOut': []
  'zoomChange': [value: number]
  'autoFit': []
  'resetZoom': []
}>()

// Calculate dynamic mini overview dimensions to match viewer pane aspect ratio
const miniOverviewDimensions = computed(() => {
  const baseWidth = 128 // Keep same width
  let height = 40 // Default height

  if (props.containerDimensions && props.containerDimensions.width > 0 && props.containerDimensions.height > 0) {
    // Calculate the viewer pane aspect ratio
    const viewerAspectRatio = props.containerDimensions.width / props.containerDimensions.height

    // Adjust height to match viewer aspect ratio, keeping width constant
    height = Math.round(baseWidth / viewerAspectRatio)

    // Constrain height to reasonable bounds
    height = Math.max(24, Math.min(80, height))
  }

  return {
    width: baseWidth,
    height: height
  }
})

const miniOverviewClasses = computed(() => {
  // Use width class for base width, height will be set via style
  return 'w-32'
})

const miniOverviewStyle = computed(() => {
  return {
    height: `${miniOverviewDimensions.value.height}px`,
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
    backgroundSize: '5px 5px'
  }
})

// Calculate mini SVG dimensions that fit within the dynamic container
const miniSvgDimensions = computed(() => {
  const legendWidth = miniOverviewDimensions.value.width
  const legendHeight = miniOverviewDimensions.value.height

  let width = legendWidth
  let height = legendHeight

  if (props.template) {
    // Keep the template aspect ratio but scale to fit the dynamic container
    const templateAspectRatio = props.template.viewBox.width / props.template.viewBox.height
    const containerAspectRatio = legendWidth / legendHeight

    if (templateAspectRatio > containerAspectRatio) {
      // Template is wider - fit to width
      width = legendWidth - 8 // Leave some padding
      height = width / templateAspectRatio
    } else {
      // Template is taller - fit to height
      height = legendHeight - 8 // Leave some padding
      width = height * templateAspectRatio
    }
  }

  return { width, height }
})

// Picture-in-picture container and SVG styling
const miniSvgContainerStyle = computed(() => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const miniSvgStyle = computed(() => {
  // Only apply scaling to fit the mini overview - NO zoom or pan from main viewer
  // The mini overview should always show the full, unzoomed template
  const scale = Math.min(
    miniOverviewDimensions.value.width / (props.width || 400),
    miniOverviewDimensions.value.height / (props.height || 120)
  )

  return {
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    maxWidth: 'none',
    maxHeight: 'none'
  }
})

// Calculate viewport style for mini overview
const viewportStyle = computed(() => {
  if (!props.template || !props.containerDimensions) return {}

  // Get mini overview dimensions
  const miniOverviewWidth = miniOverviewDimensions.value.width
  const miniOverviewHeight = miniOverviewDimensions.value.height
  const miniSvgWidth = miniSvgDimensions.value.width
  const miniSvgHeight = miniSvgDimensions.value.height

  // Center the mini SVG within the overview container
  const miniSvgOffsetX = (miniOverviewWidth - miniSvgWidth) / 2
  const miniSvgOffsetY = (miniOverviewHeight - miniSvgHeight) / 2

  // Calculate viewport rectangle size based on zoom level
  // Higher zoom = smaller viewport rectangle (showing less of the content)
  const viewportWidth = miniSvgWidth / props.zoomLevel
  const viewportHeight = miniSvgHeight / props.zoomLevel

  // Ensure viewport doesn't exceed mini SVG bounds
  const constrainedViewportWidth = Math.min(viewportWidth, miniSvgWidth)
  const constrainedViewportHeight = Math.min(viewportHeight, miniSvgHeight)

  // Calculate template dimensions in the new SVG viewBox system
  const templateWidth = props.template.viewBox.width
  const templateHeight = props.template.viewBox.height
  const templateCenterX = props.template.viewBox.x + templateWidth / 2
  const templateCenterY = props.template.viewBox.y + templateHeight / 2

  // Calculate background grid dimensions (2x template size)
  const gridWidth = templateWidth * 2
  const gridHeight = templateHeight * 2

  // Calculate the current viewBox state for positioning
  // In SVG viewBox system, panX/panY represent viewBox top-left coordinates
  const currentViewBoxX = props.panX
  const currentViewBoxY = props.panY
  const currentViewBoxWidth = props.containerDimensions.width / props.zoomLevel
  const currentViewBoxHeight = props.containerDimensions.height / props.zoomLevel

  // Calculate the current viewBox center
  const viewBoxCenterX = currentViewBoxX + currentViewBoxWidth / 2
  const viewBoxCenterY = currentViewBoxY + currentViewBoxHeight / 2

  // Map viewBox center to mini SVG coordinates
  // Grid bounds in SVG coordinates
  const gridMinX = templateCenterX - gridWidth / 2
  const gridMinY = templateCenterY - gridHeight / 2

  // Convert viewBox center position to mini SVG coordinates
  const normalizedX = (viewBoxCenterX - gridMinX) / gridWidth
  const normalizedY = (viewBoxCenterY - gridMinY) / gridHeight

  // Position viewport rectangle in mini SVG space
  const viewportCenterX = miniSvgOffsetX + normalizedX * miniSvgWidth
  const viewportCenterY = miniSvgOffsetY + normalizedY * miniSvgHeight

  // Calculate final position (center-based positioning)
  const viewportX = viewportCenterX - constrainedViewportWidth / 2
  const viewportY = viewportCenterY - constrainedViewportHeight / 2

  return {
    width: `${constrainedViewportWidth}px`,
    height: `${constrainedViewportHeight}px`,
    left: `${viewportX}px`,
    top: `${viewportY}px`
  }
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>