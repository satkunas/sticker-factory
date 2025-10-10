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
        <svg
          v-if="template"
          :viewBox="`${miniViewBoxX} ${miniViewBoxY} ${miniViewBoxWidth} ${miniViewBoxHeight}`"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-full opacity-40"
        >
          <!-- Template content using SvgContent component (inner content only, no nested SVG) -->
          <SvgContent
            :template="template"
            :layers="layers"
            mode="preview"
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
        </svg>

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

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import SvgContent from './SvgContent.vue'
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
  layers?: Array<{
    id: string
    type: 'text' | 'shape' | 'svgImage'
    [key: string]: any
  }>
}

const props = defineProps<Props>()

defineEmits<{
  'zoomIn': []
  'zoomOut': []
  'zoomChange': [value: number]
}>()

// Use mini overview composable for all mini overview calculations
const {
  miniOverviewClasses,
  miniOverviewStyle,
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