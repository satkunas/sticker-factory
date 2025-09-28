<template>
  <!-- Combined Controls & Legend -->
  <div v-if="!previewMode" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-secondary-200">
    <!-- Mini Overview & Scale -->
    <div class="flex items-center space-x-2 mb-2">
      <!-- Mini SVG Overview (Proper aspect ratio container) -->
      <div
        class="bg-secondary-50 rounded border overflow-hidden relative flex-shrink-0"
        :class="miniOverviewClasses"
        :style="miniOverviewStyle"
      >
        <SvgViewport
          v-if="template"
          :template="template"
          :previewMode="false"
          :viewBoxX="miniViewBoxX"
          :viewBoxY="miniViewBoxY"
          :viewBoxWidth="miniViewBoxWidth"
          :view-box-height="miniViewBoxHeight"
          :gridSize="miniGridSize"
          :borderWidth="1"
          class="w-full h-full opacity-40"
        >
          <!-- Template content -->
          <SvgCanvas
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
            :layers="layers"
            :previewMode="true"
          />

          <!-- Viewport Rectangle -->
          <rect
            :x="svgViewportRect.x"
            :y="svgViewportRect.y"
            :width="svgViewportRect.width"
            :height="svgViewportRect.height"
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgb(59, 130, 246)"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </SvgViewport>

        <!-- Fallback for no template -->
        <div
          v-else
          class="flex items-center justify-center h-full"
        >
          <div class="rounded-full bg-green-500 w-6 h-2" />
        </div>
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
import SvgViewport from './SvgViewport.vue'
import { useMiniOverview } from '../composables/useMiniOverview'

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
  layers?: Array<{
    id: string
    type: 'text' | 'shape' | 'svgImage'
    [key: string]: any
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
  layers: () => []
})

defineEmits<{
  'zoomIn': []
  'zoomOut': []
  'zoomChange': [value: number]
  'autoFit': []
  'resetZoom': []
}>()

// Use mini overview composable for all mini overview calculations
const {
  miniOverviewClasses,
  miniOverviewStyle,
  miniGridSize,
  miniViewBoxX,
  miniViewBoxY,
  miniViewBoxWidth,
  miniViewBoxHeight,
  svgViewportRect
} = useMiniOverview(
  computed(() => props.template),
  computed(() => props.containerDimensions),
  computed(() => props.panX),
  computed(() => props.panY),
  computed(() => props.zoomLevel)
)

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