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
          transformOrigin: 'center center',
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
            <template v-for="(element, index) in templateElements" :key="`${element.type}-${index}`">
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
            @click="altAutoFit"
            class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            title="Fit to view"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
          </button>

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
import { computed, ref, watch, nextTick } from 'vue'
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

// Computed properties - make SVG responsive to container and template size
const svgWidth = computed(() => {
  if (props.template) {
    // Use template viewBox width, but ensure reasonable size
    return Math.max(300, Math.min(props.template.viewBox.width, 800))
  }
  return Math.min(props.width, 400)
})

const svgHeight = computed(() => {
  if (props.template) {
    // Use template viewBox height, but ensure reasonable size
    return Math.max(200, Math.min(props.template.viewBox.height, 600))
  }
  return Math.min(props.height, 120)
})

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

// Alternative auto-fit that uses a different approach
const altAutoFit = async () => {
  if (!svgContainer.value || !props.template) {
    return
  }

  // Reset first
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0

  await nextTick()

  const container = svgContainer.value
  const containerWidth = container.offsetWidth - 120 // Account for padding and controls
  const containerHeight = container.offsetHeight - 120

  // Use template viewBox dimensions
  const templateWidth = props.template.viewBox.width
  const templateHeight = props.template.viewBox.height

  // Calculate the scale needed to fit
  const scaleToFitWidth = containerWidth / templateWidth
  const scaleToFitHeight = containerHeight / templateHeight
  const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.8

  // Apply the scale
  zoomLevel.value = Math.max(0.2, Math.min(3, bestScale))

  console.log('Alt AutoFit:', {
    container: { w: containerWidth, h: containerHeight },
    template: { w: templateWidth, h: templateHeight },
    scale: bestScale,
    finalZoom: zoomLevel.value
  })
}

// Auto-fit function to scale template to fit the container
const autoFitTemplate = async () => {
  if (!svgContainer.value || !props.template) {
    console.log('AutoFit: Missing container or template')
    return
  }

  await nextTick() // Wait for DOM updates

  const containerRect = svgContainer.value.getBoundingClientRect()
  const availableWidth = containerRect.width - 120 // Account for controls and padding
  const availableHeight = containerRect.height - 120 // Account for controls and padding

  // Get the template viewBox dimensions (this is the "natural" size of the content)
  const templateWidth = props.template.viewBox.width
  const templateHeight = props.template.viewBox.height

  console.log('AutoFit Debug:', {
    containerSize: { width: containerRect.width, height: containerRect.height },
    availableSize: { width: availableWidth, height: availableHeight },
    templateSize: { width: templateWidth, height: templateHeight }
  })

  // Calculate scale to fit both dimensions with some padding
  const scaleX = availableWidth / templateWidth
  const scaleY = availableHeight / templateHeight
  const optimalScale = Math.min(scaleX, scaleY) * 0.8 // 80% to leave breathing room

  console.log('AutoFit Scale:', { scaleX, scaleY, optimalScale })

  // Apply the optimal zoom level and center
  const finalZoom = Math.max(0.2, Math.min(5, optimalScale))
  zoomLevel.value = finalZoom
  panX.value = 0 // Center horizontally
  panY.value = 0 // Center vertically

  console.log('AutoFit Applied:', { zoom: finalZoom, panX: 0, panY: 0 })
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

// Watch for template changes and auto-fit
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    altAutoFit()
  }
}, { immediate: true })

// Expose download function for parent component
defineExpose({
  downloadSvg,
  autoFitTemplate
})
</script>