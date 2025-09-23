<template>
  <!-- Combined Controls & Legend -->
  <div v-if="!previewMode" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-secondary-200">
    <!-- Mini Overview & Scale -->
    <div class="flex items-center space-x-2 mb-2">
      <!-- Mini SVG -->
      <div
        class="w-32 h-10 bg-secondary-50 rounded border overflow-hidden relative flex-shrink-0"
        :style="{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: '5px 5px'
        }"
      >
        <!-- Mini Sticker -->
        <div class="absolute inset-0 flex items-center justify-center">
          <svg
            v-if="template"
            :width="Math.min(120, template.viewBox.width / template.viewBox.height * 32)"
            :height="32"
            :viewBox="`0 0 ${template.viewBox.width} ${template.viewBox.height}`"
            class="opacity-60"
          >
            <template v-for="element in getTemplateElements(template)" :key="element.zIndex">
              <path
                v-if="element.type === 'shape' && element.shape"
                :d="element.shape.path"
                :fill="element.shape.fill || '#22c55e'"
                :stroke="element.shape.stroke || '#16a34a'"
                :stroke-width="element.shape.strokeWidth || 1"
              />
              <text
                v-if="element.type === 'text' && element.textInput"
                :x="element.textInput.position.x"
                :y="element.textInput.position.y"
                text-anchor="middle"
                dominant-baseline="central"
                :font-family="element.textInput.fontFamily"
                :font-size="Math.max(6, element.textInput.fontSize * 0.4)"
                :font-weight="element.textInput.fontWeight"
                :fill="element.textInput.fontColor"
                class="select-none"
              >
                {{ element.textInput.default }}
              </text>
              <g
                v-if="element.type === 'svgImage' && element.svgImage"
                :transform="getMiniSvgTransform(element.svgImage, template?.viewBox)"
                v-html="getMiniStyledSvgContent(element.svgImage)"
              />
            </template>
          </svg>
          <div
            v-else
            class="rounded-full"
            :style="{
              backgroundColor: '#22c55e',
              width: '24px',
              height: '8px'
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
        min="0.1"
        max="5"
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
import { getTemplateElements } from '../config/template-loader'
import {
  getMiniStyledSvgContent,
  getMiniSvgTransform
} from '../utils/svg-template'

interface Props {
  zoomLevel: number
  panX: number
  panY: number
  zoomPercentage: number
  canZoomIn: boolean
  canZoomOut: boolean
  template?: SimpleTemplate | null
  previewMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  template: null,
  previewMode: false
})

defineEmits<{
  'zoomIn': []
  'zoomOut': []
  'zoomChange': [value: number]
  'autoFit': []
  'resetZoom': []
}>()

// Calculate viewport style for mini overview
const viewportStyle = computed(() => {
  if (!props.template) return {}

  // Calculate the viewport rectangle position based on current zoom and pan
  // This represents what portion of the SVG is currently visible
  const containerWidth = 128 // Mini container width
  const containerHeight = 40 // Mini container height

  // Scale factors
  const scaleX = containerWidth / props.template.viewBox.width
  const scaleY = containerHeight / props.template.viewBox.height

  // Calculate viewport dimensions (inversely proportional to zoom)
  const viewportWidth = containerWidth / props.zoomLevel
  const viewportHeight = containerHeight / props.zoomLevel

  // Calculate viewport position (pan offset affects position)
  const viewportX = (containerWidth - viewportWidth) / 2 - (props.panX * scaleX / props.zoomLevel)
  const viewportY = (containerHeight - viewportHeight) / 2 - (props.panY * scaleY / props.zoomLevel)

  return {
    width: `${Math.max(2, viewportWidth)}px`,
    height: `${Math.max(2, viewportHeight)}px`,
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