<template>
  <div :class="previewMode ? 'w-full h-full' : 'w-full lg:w-1/2 bg-secondary-50 relative min-h-96 lg:min-h-0'">
    <!-- SVG Container -->
    <div
      ref="svgContainer"
      :class="[
        'w-full h-full bg-white overflow-hidden relative',
        previewMode
          ? 'rounded border border-secondary-200'
          : 'rounded-lg border-2 border-dashed border-secondary-300 cursor-move'
      ]"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @gesturestart="handleGestureStart"
      @gesturechange="handleGestureChange"
      @gestureend="handleGestureEnd"
    >
      <div
        :class="[
          'w-full h-full flex items-center justify-center',
          previewMode ? '' : 'grid-background'
        ]"
        :style="previewMode ? {} : {
          transform: transformString,
          transformOrigin: 'center center',
          backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`
        }"
      >
        <!-- Use extracted SvgCanvas component -->
        <SvgCanvas
          ref="svgElementRef"
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
          :previewMode="previewMode"
        />
      </div>

      <!-- Use extracted ZoomPanControls component -->
      <ZoomPanControls
        :zoomLevel="zoomLevel"
        :panX="panX"
        :panY="panY"
        :zoomPercentage="Math.round(zoomLevel * 100)"
        :canZoomIn="canZoomIn"
        :canZoomOut="canZoomOut"
        :template="template"
        :previewMode="previewMode"
        @zoomIn="zoomIn"
        @zoomOut="zoomOut"
        @zoomChange="setZoom"
        @autoFit="handleAutoFit"
        @resetZoom="resetZoom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import { useSvgInteraction } from '../composables/useSvgInteraction'
import SvgCanvas from './SvgCanvas.vue'
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
    fillColor: string
    strokeColor: string
    strokeWidth: number
    strokeLinejoin: string
  }>
  previewMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
  template: null,
  textInputs: () => [],
  shapeStyles: () => [],
  svgImageStyles: () => [],
  previewMode: false
})

// SVG container ref for auto-fit functionality
const svgContainer = ref<HTMLElement | null>(null)

// SVG element reference for expose
const svgElementRef = ref<SVGElement | null>(null)

// Convert previewMode to ref for composable
const previewModeRef = computed(() => props.previewMode)

// Initialize SVG interaction composable
const svgInteraction = useSvgInteraction(previewModeRef)

// Extract state and controls from composable
const {
  // State
  zoomLevel,
  panX,
  panY,

  // Computed
  transformString,
  canZoomIn,
  canZoomOut,

  // Event handlers
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleGestureStart,
  handleGestureChange,
  handleGestureEnd,

  // Controls
  zoomIn,
  zoomOut,
  resetZoom,
  setZoom,
  autoFitTemplate
} = svgInteraction

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

// Auto-fit on mount for all modes
onMounted(() => {
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
}
</style>