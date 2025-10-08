<template>
  <div :class="containerClasses">
    <!-- SVG Viewport Container -->
    <div
      ref="svgContainer"
      :class="['relative', 'h-full', svgContainerClasses]"
    >
      <!-- Native SVG Viewport with viewBox-based pan/zoom -->
      <SvgViewport
        ref="svgViewportRef"
        :template="template"
        :layers="layers"
        :previewMode="previewMode"
        :viewBoxX="viewBoxX"
        :viewBoxY="viewBoxY"
        :viewBoxWidth="viewBoxWidth"
        :viewBoxHeight="viewBoxHeight"
        :gridSize="gridSize"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      />

      <ZoomPanControls
        :zoomLevel="zoomLevel"
        :panX="panX"
        :panY="panY"
        :zoomPercentage="Math.round(zoomLevel * 100)"
        :canZoomIn="canZoomIn()"
        :canZoomOut="canZoomOut()"
        :minZoom="getMinZoomLevel()"
        :template="template"
        :previewMode="previewMode"
        :containerDimensions="containerDimensions"
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
        :layers="layers"
        @zoomIn="zoomIn"
        @zoomOut="zoomOut"
        @zoomChange="setZoom"
      ></ZoomPanControls>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, watchEffect } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import { useSvgDragInteraction } from '../composables/useSvgDragInteraction'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import {
  svgViewBoxX,
  svgViewBoxY,
  svgViewBoxWidth,
  svgViewBoxHeight,
  svgViewBoxControls,
  setSvgContainer
} from '../stores/urlDrivenStore'
import SvgViewport from './SvgViewport.vue'
import ZoomPanControls from './ZoomPanControls.vue'

interface Props {
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
  template?: SimpleTemplate | null
  layers?: Array<{
    id: string
    type: 'text' | 'shape' | 'svgImage'
    [key: string]: any
  }>
  previewMode?: boolean
  containerClasses?: string
  svgContainerClasses?: string
}

const props = defineProps<Props>()

// Direct class access - no conditional logic

// Grid size for background pattern
const gridSize = SVG_VIEWER_CONSTANTS.GRID_SIZE

// Clip path data available from store if needed in future

// Component references
const svgContainer = ref<HTMLElement | null>(null)
const svgViewportRef = ref<InstanceType<typeof SvgViewport> | null>(null)

// Reactive container dimensions for viewport calculation
const containerDimensions = ref({ width: 0, height: 0 })

// Update container dimensions
const updateContainerDimensions = () => {
  if (svgContainer.value) {
    const rect = svgContainer.value.getBoundingClientRect()
    containerDimensions.value = {
      width: rect.width,
      height: rect.height
    }
  }
}

// Preview mode available if needed for future enhancements

// Use SVG viewBox calculations from store (composable is handled there)
const viewBoxX = svgViewBoxX
const viewBoxY = svgViewBoxY
const viewBoxWidth = svgViewBoxWidth
const viewBoxHeight = svgViewBoxHeight

// Set container element for store calculations and initialize viewBox
watchEffect(() => {
  setSvgContainer(svgContainer.value)

  // Force viewBox initialization when container becomes available
  if (svgContainer.value && props.template) {
    nextTick(async () => {
      // TEMPORARY FIX: Force proper viewBox dimensions if they are too small
      const currentWidth = viewBoxWidth.value
      const currentHeight = viewBoxHeight.value

      if (currentWidth <= 50 || currentHeight <= 50) {
        // Auto-centering will be handled by the store automatically
      }
    })
  }
})

// Extract controls from store
const {
  zoomIn,
  zoomOut,
  setZoom,
  setPan,
  handleWheel: handleViewBoxWheel,
  getZoomLevel,
  getMinZoomLevel,
  canZoomIn,
  canZoomOut,
} = svgViewBoxControls

// Computed properties for compatibility with existing components
const zoomLevel = computed(() => getZoomLevel())
const panX = computed(() => viewBoxX.value)
const panY = computed(() => viewBoxY.value)

// SVG drag interaction - replaces CSS coordinate drag system
const previewModeRef = computed(() => props.previewMode)
const { handleMouseDown: handleSvgMouseDown, handleMouseMove: handleSvgMouseMove, handleMouseUp: handleSvgMouseUp, handleMouseLeave: handleSvgMouseLeave } = useSvgDragInteraction(
  previewModeRef,
  setPan,
  getZoomLevel
)

// Event handler wrappers that pass SVG element to drag handlers
const handleMouseDown = (e: MouseEvent) => {
  const svgElement = svgViewportRef.value?.svgViewportRef || null
  handleSvgMouseDown(e, svgElement)
}

const handleMouseMove = (e: MouseEvent) => {
  const svgElement = svgViewportRef.value?.svgViewportRef || null
  handleSvgMouseMove(e, svgElement)
}

const handleMouseUp = () => {
  handleSvgMouseUp()
}

const handleMouseLeave = () => {
  handleSvgMouseLeave()
}

const handleWheel = (e: WheelEvent) => {
  const svgElement = svgViewportRef.value?.svgViewportRef || null
  handleViewBoxWheel(e, svgElement)
}

// Touch event handlers (pass-through for now, can be enhanced later)
const handleTouchStart = () => {
  // Touch events for future enhancement
}

const handleTouchMove = () => {
  // Touch events for future enhancement
}

const handleTouchEnd = () => {
  // Touch events for future enhancement
}


// Download function
const downloadSvg = () => {
  const svgElement = svgViewportRef.value?.svgViewportRef
  if (!svgElement) return

  try {
    // Clone the SVG element from the SvgViewport component
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Create SVG string
    const svgString = new XMLSerializer().serializeToString(svgClone)
    const fullSvgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`

    // Create blob and download
    const blob = new Blob([fullSvgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `sticker-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    // Download failed, silently handle error
    // eslint-disable-next-line no-console
  }
}

// Template changes are handled automatically by the store's auto-centering system

// Watch for container ref changes and update dimensions
watch(svgContainer, () => {
  if (svgContainer.value) {
    nextTick(() => updateContainerDimensions())
  }
})

// Auto-fit on mount for all modes
onMounted(() => {
  // Initialize container dimensions
  updateContainerDimensions()

  // Add window resize listener
  window.addEventListener('resize', updateContainerDimensions)

  // Auto-centering on mount is handled automatically by the store
})

// Clean up resize listener
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerDimensions)
})

// Expose download function and SVG ref for parent component
defineExpose({
  downloadSvg,
  svgElementRef: computed(() => {
    return svgViewportRef.value?.svgViewportRef || null
  })
})
</script>

<style scoped>
.grid-background {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  /* Red border that zooms and pans with the background grid */
  border: 6px solid #ef4444;
  box-sizing: border-box;
}
</style>