<template>
  <div :class="containerClasses">
    <!-- SVG Viewport Container -->
    <div
      ref="svgContainer"
      :class="['relative', svgContainerClasses]"
    >
      <!-- Native SVG Viewport with viewBox-based pan/zoom -->
      <SvgViewport
        ref="svgViewportRef"
        :template="template"
        :previewMode="previewMode"
        :viewBoxX="viewBoxX"
        :viewBoxY="viewBoxY"
        :viewBoxWidth="viewBoxWidth"
        :view-box-height="viewBoxHeight"
        :gridSize="gridSize"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Template content rendered inside SVG viewport -->
        <SvgCanvas
          ref="svgElementRef"
          :template="template"
          :layers="layers"
          :previewMode="previewMode"
          :hasClipPaths="hasClipPaths"
          :clipPathShapes="clipPathShapes"
        />
      </SvgViewport>

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
        @autoFit="handleAutoFit"
        @resetZoom="resetZoom"
      ></ZoomPanControls>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import { useSvgViewBox } from '../composables/useSvgViewBox'
import { useSvgDragInteraction } from '../composables/useSvgDragInteraction'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import { clipPathShapes as storeClipPathShapes, hasClipPaths as storeHasClipPaths } from '../stores/urlDrivenStore'
import SvgCanvas from './SvgCanvas.vue'
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

// Use clip path data from store
const hasClipPaths = storeHasClipPaths
const clipPathShapes = storeClipPathShapes

// Component references
const svgContainer = ref<HTMLElement | null>(null)
const svgViewportRef = ref<InstanceType<typeof SvgViewport> | null>(null)
const svgElementRef = ref<InstanceType<typeof SvgCanvas> | null>(null)

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

// Convert props to refs for composable
const previewModeRef = computed(() => props.previewMode)
const templateRef = computed(() => props.template)

// Initialize SVG viewBox composable - replaces CSS transform system
const svgViewBox = useSvgViewBox(previewModeRef, templateRef, svgContainer)

// Extract state and controls from composable
const {
  // ViewBox state (replaces panX/panY/zoomLevel)
  viewBoxX,
  viewBoxY,
  viewBoxWidth,
  viewBoxHeight,

  // Controls
  zoomIn,
  zoomOut,
  resetZoom,
  setZoom,
  setPan,
  handleWheel: handleViewBoxWheel,
  autoFitTemplate,
  getZoomLevel,
  getMinZoomLevel,
  canZoomIn,
  canZoomOut,
  constrainViewBox
} = svgViewBox

// Computed properties for compatibility with existing components
const zoomLevel = computed(() => getZoomLevel())
const panX = computed(() => viewBoxX.value)
const panY = computed(() => viewBoxY.value)

// SVG drag interaction - replaces CSS coordinate drag system
const { handleMouseDown: handleSvgMouseDown, handleMouseMove: handleSvgMouseMove, handleMouseUp: handleSvgMouseUp, handleMouseLeave: handleSvgMouseLeave } = useSvgDragInteraction(
  previewModeRef,
  setPan,
  getZoomLevel,
  constrainViewBox
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

// Handle auto-fit events from ZoomPanControls
const handleAutoFit = async () => {
  if (props.template && svgContainer.value) {
    const svgCanvas = svgElementRef.value
    if (svgCanvas && (svgCanvas as any).svgElementRef) {
      await autoFitTemplate(props.template, svgContainer.value, (svgCanvas as any).svgElementRef)
    }
  }
}

// Download function
const downloadSvg = () => {
  const svgCanvas = svgElementRef.value
  if (!svgCanvas || !(svgCanvas as any).svgElementRef) return

  try {
    // Clone the SVG element from the SvgCanvas component
    const svgClone = (svgCanvas as any).svgElementRef.cloneNode(true) as SVGElement

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

// Watch for template changes and auto-fit
watch(() => props.template, (newTemplate) => {
  if (newTemplate && svgContainer.value) {
    // Use auto-fit with current container and SVG references
    nextTick(async () => {
      const svgCanvas = svgElementRef.value
      if (svgCanvas && (svgCanvas as any).svgElementRef) {
        await autoFitTemplate(newTemplate, svgContainer.value!, (svgCanvas as any).svgElementRef)
      }
    })
  }
}, { immediate: true })

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

  // Always auto-fit on mount if we have a template
  if (props.template && svgContainer.value) {
    nextTick(async () => {
      const svgCanvas = svgElementRef.value
      if (svgCanvas && (svgCanvas as any).svgElementRef) {
        await autoFitTemplate(props.template!, svgContainer.value!, (svgCanvas as any).svgElementRef)
      }
    })
  }
})

// Clean up resize listener
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerDimensions)
})

// Expose download function and SVG ref for parent component
defineExpose({
  downloadSvg,
  autoFitTemplate: async () => {
    if (props.template && svgContainer.value) {
      const svgCanvas = svgElementRef.value
      if (svgCanvas && (svgCanvas as any).svgElementRef) {
        await autoFitTemplate(props.template, svgContainer.value, (svgCanvas as any).svgElementRef)
      }
    }
  },
  svgElementRef: computed(() => {
    const svgCanvas = svgElementRef.value
    return svgCanvas ? (svgCanvas as any).svgElementRef || null : null
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