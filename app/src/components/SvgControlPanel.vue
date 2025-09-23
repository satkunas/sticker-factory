<template>
  <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-secondary-200">
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
        <!-- Mini SVG content will be rendered here -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-6 h-6 bg-primary-200 rounded border border-primary-400"
            :style="{ transform: `scale(${Math.min(zoomLevel, 1)})` }"
          />
        </div>
      </div>

      <!-- Zoom Percentage -->
      <span class="text-xs text-secondary-600 font-mono">{{ zoomPercentage }}%</span>
    </div>

    <!-- Zoom Controls -->
    <div class="flex items-center space-x-1">
      <!-- Zoom Out -->
      <button
        class="p-1 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canZoomOut"
        title="Zoom Out"
        @click="$emit('zoom-out')"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Zoom Range -->
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        :value="zoomLevel"
        class="w-16 h-1 bg-secondary-200 rounded-lg appearance-none slider-thumb"
        title="Zoom Level"
        @input="$emit('zoom-change', parseFloat(($event.target as HTMLInputElement).value))"
      >

      <!-- Zoom In -->
      <button
        class="p-1 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canZoomIn"
        title="Zoom In"
        @click="$emit('zoom-in')"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Reset -->
      <button
        class="p-1 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded"
        title="Reset Zoom"
        @click="$emit('reset')"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Auto Fit -->
      <button
        class="p-1 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded"
        title="Auto Fit"
        @click="$emit('auto-fit')"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  zoomLevel: number
  zoomPercentage: number
  canZoomIn: boolean
  canZoomOut: boolean
}

defineProps<Props>()

defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'zoom-change': [level: number]
  'reset': []
  'auto-fit': []
}>()
</script>

<style scoped>
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider-thumb::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>