<template>
  <div class="w-full lg:w-1/2 bg-secondary-50 relative min-h-96 lg:min-h-0">
    <!-- SVG Container -->
    <div 
      ref="svgContainer"
      class="w-full h-full bg-white rounded-lg border-2 border-dashed border-secondary-300 overflow-hidden cursor-move relative"
      @mousedown="startDrag"
      @mousemove="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @wheel="handleWheel"
    >
      <div 
        class="w-full h-full flex items-center justify-center grid-background"
        :style="{ 
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`
        }"
      >
        <StickerSvg
          ref="stickerSvgRef"
          :text="text"
          :color="backgroundColor"
          :textColor="textColor"
          :width="width"
          :height="height"
          :font-size="fontSize"
          :font-weight="fontWeight"
          :text-stroke-width="textStrokeWidth"
          :textStrokeColor="textStrokeColor"
          :text-stroke-linejoin="textStrokeLinejoin"
          :font="font"
        />
      </div>

      <!-- Combined Controls & Legend -->
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
            <!-- Mini Sticker -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div 
                class="rounded-full"
                :style="{ 
                  backgroundColor: backgroundColor,
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
          <span class="text-xs text-secondary-600 font-mono">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>

        <!-- Zoom Controls -->
        <div class="flex items-center space-x-1">
          <button 
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Zoom out"
            @click="zoomOut"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <input 
            v-model="zoomLevel" 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            class="w-16 h-1.5 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          >
          
          <button 
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Zoom in"
            @click="zoomIn"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div class="h-4 w-px bg-secondary-300 mx-1" />
          
          <button 
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Reset zoom and position"
            @click="resetZoom"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, computed } from 'vue'
import StickerSvg from './StickerSvg.vue'
import type { FontConfig } from '../config/fonts'

interface Props {
  text: string
  backgroundColor: string
  textColor: string
  width: number
  height: number
  fontSize: number
  fontWeight: number
  textStrokeWidth: number
  textStrokeColor: string
  textStrokeLinejoin: string
  font: FontConfig | null
}

defineProps<Props>()

// Zoom and pan state
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)

// Drag state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const initialPanX = ref(0)
const initialPanY = ref(0)

// SVG container ref
const svgContainer = ref<HTMLElement | null>(null)
const stickerSvgRef = ref(null)

// Viewport calculation for compact legend
const viewportStyle = computed(() => {
  // Compact legend container is 128px wide, 40px high (w-32 h-10)
  const legendWidth = 128
  const legendHeight = 40
  
  // Calculate viewport size based on zoom level
  // At zoom 1, viewport shows full image
  // At higher zoom, viewport shows smaller portion
  const viewportWidthPercent = Math.min(100, 100 / zoomLevel.value)
  const viewportHeightPercent = Math.min(100, 100 / zoomLevel.value)
  
  const viewportWidth = (legendWidth * viewportWidthPercent) / 100
  const viewportHeight = (legendHeight * viewportHeightPercent) / 100
  
  // Calculate position based on pan values
  // Convert pan values to percentage of viewport
  const containerRect = svgContainer.value?.getBoundingClientRect()
  if (!containerRect) {
    return {
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
      left: `${(legendWidth - viewportWidth) / 2}px`,
      top: `${(legendHeight - viewportHeight) / 2}px`
    }
  }
  
  // Calculate pan percentage relative to container size
  const panXPercent = (-panX.value / (containerRect.width * zoomLevel.value)) * 100
  const panYPercent = (-panY.value / (containerRect.height * zoomLevel.value)) * 100
  
  // Position viewport rectangle in legend
  const leftPos = (legendWidth - viewportWidth) / 2 + (panXPercent * legendWidth) / 100
  const topPos = (legendHeight - viewportHeight) / 2 + (panYPercent * legendHeight) / 100
  
  return {
    width: `${viewportWidth}px`,
    height: `${viewportHeight}px`,
    left: `${Math.max(0, Math.min(legendWidth - viewportWidth, leftPos))}px`,
    top: `${Math.max(0, Math.min(legendHeight - viewportHeight, topPos))}px`
  }
})

// Zoom functions
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
}

const resetZoom = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Drag functions
const startDrag = (e: Event) => {
  const mouseEvent = e as any
  isDragging.value = true
  dragStartX.value = mouseEvent.clientX
  dragStartY.value = mouseEvent.clientY
  initialPanX.value = panX.value
  initialPanY.value = panY.value
  e.preventDefault()
}

const drag = (e: Event) => {
  if (!isDragging.value) return
  const mouseEvent = e as any
  const deltaX = mouseEvent.clientX - dragStartX.value
  const deltaY = mouseEvent.clientY - dragStartY.value
  
  panX.value = initialPanX.value + deltaX
  panY.value = initialPanY.value + deltaY
}

const endDrag = () => {
  isDragging.value = false
}

// Wheel zoom
const handleWheel = (e: Event) => {
  e.preventDefault()
  const wheelEvent = e as any
  const delta = wheelEvent.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.min(Math.max(zoomLevel.value * delta, 0.1), 5)
}

// Expose methods if needed
defineExpose({
  stickerSvgRef
})
</script>