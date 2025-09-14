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
        <svg
          ref="svgElementRef"
          :width="svgWidth"
          :height="svgHeight"
          :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
          xmlns="http://www.w3.org/2000/svg"
          class="max-w-full max-h-full"
        >
          <!-- Template-based rendering with ordered elements -->
          <g v-if="template">
            <template v-for="element in templateElements" :key="element.zIndex">
              <!-- Shape rendering -->
              <path
                v-if="element.type === 'shape' && element.shape"
                :d="element.shape.path"
                :fill="element.shape.fill || stickerColor"
                :stroke="element.shape.stroke || '#000000'"
                :stroke-width="element.shape.strokeWidth || 2"
              />

              <!-- Text rendering with dynamic textInputs -->
              <text
                v-if="element.type === 'text' && element.textInput"
                v-for="(textInputData, textIndex) in [getTextInputById(element.textInput.id)]"
                :key="element.textInput.id"
                :x="element.textInput.position.x"
                :y="element.textInput.position.y"
                text-anchor="middle"
                dominant-baseline="central"
                :font-family="textInputData ? getFontFamilyForTextInput(textInputData) : fontFamily"
                :font-size="textInputData ? textInputData.fontSize : fontSize"
                :font-weight="textInputData ? textInputData.fontWeight : fontWeight"
                :fill="textInputData ? textInputData.textColor : textColor"
                :stroke="(textInputData ? textInputData.strokeWidth : strokeWidth) > 0 ? (textInputData ? textInputData.strokeColor : strokeColor) : 'none'"
                :stroke-width="textInputData ? textInputData.strokeWidth : strokeWidth"
                :stroke-opacity="textInputData ? textInputData.strokeOpacity : strokeOpacity"
                class="select-none"
              >
                {{ textInputData ? textInputData.text : stickerText }}
              </text>
            </template>
          </g>

          <!-- Fallback to original rectangle -->
          <g v-else>
            <rect
              :x="2"
              :y="2"
              :width="viewBoxWidth - 4"
              :height="viewBoxHeight - 4"
              :rx="Math.min(30, viewBoxHeight / 2 - 2)"
              :ry="Math.min(30, viewBoxHeight / 2 - 2)"
              :fill="stickerColor"
              stroke="#333333"
              stroke-width="2"
            />

            <!-- Text content -->
            <text
              :x="viewBoxWidth / 2"
              :y="viewBoxHeight / 2"
              text-anchor="middle"
              dominant-baseline="central"
              :font-family="fontFamily"
              :font-size="fontSize"
              :font-weight="fontWeight"
              :fill="textColor"
              :stroke="strokeWidth > 0 ? strokeColor : 'none'"
              :stroke-width="strokeWidth"
              :stroke-opacity="strokeOpacity"
              class="select-none"
            >
              {{ stickerText }}
            </text>
          </g>
        </svg>
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
            <!-- Mini Badge -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="rounded-full"
                :style="{
                  backgroundColor: stickerColor,
                  width: '24px',
                  height: '8px'
                }"
              ></div>
            </div>

            <!-- Viewport Rectangle -->
            <div
              class="absolute border-2 border-primary-500 bg-primary-100/40"
              :style="viewportStyle"
            ></div>
          </div>

          <!-- Scale indicator -->
          <span class="text-xs text-secondary-600 font-mono">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>

        <!-- Zoom Controls -->
        <div class="flex items-center space-x-1">
          <button
            @click="zoomOut"
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Zoom out"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>

          <input
            type="range"
            v-model="zoomLevel"
            min="0.1"
            max="5"
            step="0.1"
            class="w-16 h-1.5 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
          />

          <button
            @click="zoomIn"
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Zoom in"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
          </button>

          <div class="h-4 w-px bg-secondary-300 mx-1"></div>

          <button
            @click="resetZoom"
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Reset zoom and position"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getFontFamily, type FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import { getTemplateElements } from '../config/template-loader'

interface Props {
  stickerText?: string
  stickerColor?: string
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
}

const props = withDefaults(defineProps<Props>(), {
  stickerText: '',
  stickerColor: '#22c55e',
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
  textInputs: () => []
})

// SVG element reference
const svgElementRef = ref<SVGElement | null>(null)

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

// Computed properties
const svgWidth = computed(() => Math.min(props.width, 400))
const svgHeight = computed(() => Math.min(props.height, 120))

const viewBoxWidth = computed(() => {
  if (props.template) {
    return props.template.viewBox.width
  }
  return 200 // Default rectangle width
})

const viewBoxHeight = computed(() => {
  if (props.template) {
    return props.template.viewBox.height
  }
  return 60 // Default rectangle height
})

const fontFamily = computed(() => {
  if (props.font) {
    return getFontFamily(props.font)
  }
  return 'Arial, sans-serif'
})

// Get ordered template elements
const templateElements = computed(() => {
  if (props.template) {
    return getTemplateElements(props.template)
  }
  return []
})

// Helper function to get textInput data by ID
const getTextInputById = (id: string) => {
  return props.textInputs?.find(input => input.id === id)
}

// Helper function to get font family for a specific textInput
const getFontFamilyForTextInput = (textInput: any) => {
  if (textInput?.font) {
    return getFontFamily(textInput.font)
  }
  return 'Arial, sans-serif'
}

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
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  initialPanX.value = panX.value
  initialPanY.value = panY.value
  e.preventDefault()
}

const drag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value

  panX.value = initialPanX.value + deltaX
  panY.value = initialPanY.value + deltaY
}

const endDrag = () => {
  isDragging.value = false
}

// Wheel zoom
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.min(Math.max(zoomLevel.value * delta, 0.1), 5)
}

// Download function
const downloadSvg = () => {
  if (!svgElementRef.value) return

  try {
    // Clone the SVG element
    const svgClone = svgElementRef.value.cloneNode(true) as SVGElement

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
    console.error('Error downloading SVG:', error)
  }
}

// Expose download function for parent component
defineExpose({
  downloadSvg
})
</script>