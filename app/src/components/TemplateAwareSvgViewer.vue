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
      @mousedown="previewMode ? null : startDrag"
      @mousemove="previewMode ? null : drag"
      @mouseup="previewMode ? null : endDrag"
      @mouseleave="previewMode ? null : endDrag"
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
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`
        }"
      >
        <svg
          ref="svgElementRef"
          :width="svgWidth"
          :height="svgHeight"
          :viewBox="template ? `${template.viewBox.x} ${template.viewBox.y} ${template.viewBox.width} ${template.viewBox.height}` : `0 0 ${viewBoxWidth} ${viewBoxHeight}`"
          xmlns="http://www.w3.org/2000/svg"
          :class="previewMode ? 'block' : 'block max-w-full max-h-full'"
          :style="previewMode ? {
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            margin: 'auto',
            display: 'block'
          } : {}"
        >
          <!-- Template-based rendering with ordered elements -->
          <g v-if="template">
            <!-- Clip path definitions -->
            <defs v-if="hasClipPaths">
              <clipPath
                v-for="clipShape in clipPathShapes"
                :id="`clip-${clipShape.id}`"
                :key="`clip-${clipShape.id}`"
              >
                <path :d="clipShape.path" />
              </clipPath>
            </defs>

            <template v-for="(element, index) in templateElements" :key="`${element.type}-${index}`">
              <!-- Shape rendering -->
              <path
                v-for="shapeStyleData in [getShapeStyleById(element.shape.id)]"
                v-if="element.type === 'shape' && element.shape"
                :key="element.shape.id"
                :d="element.shape.path"
                :fill="shapeStyleData?.fillColor || element.shape.fill || '#22c55e'"
                :stroke="shapeStyleData?.strokeColor || element.shape.stroke || '#000000'"
                :stroke-width="shapeStyleData?.strokeWidth ?? element.shape.strokeWidth ?? 2"
                :stroke-linejoin="shapeStyleData?.strokeLinejoin || 'round'"
              />

              <!-- Text rendering with dynamic textInputs -->
              <template v-if="element.type === 'text' && element.textInput">
                <text
                  v-for="textInputData in [getTextInputById(element.textInput.id)]"
                  :key="element.textInput.id"
                  :x="element.textInput.position.x"
                  :y="element.textInput.position.y"
                  text-anchor="middle"
                  dominant-baseline="central"
                  :font-family="textInputData ? getFontFamilyForTextInput(textInputData) : fontFamily"
                  :font-size="textInputData?.fontSize || fontSize"
                  :font-weight="textInputData?.fontWeight || fontWeight"
                  :fill="textInputData?.textColor || textColor"
                  :stroke="(textInputData?.strokeWidth || strokeWidth) > 0 ? (textInputData?.strokeColor || strokeColor) : 'none'"
                  :stroke-width="textInputData?.strokeWidth || strokeWidth"
                  :stroke-opacity="textInputData?.strokeOpacity || strokeOpacity"
                  :clip-path="element.textInput.clip ? `url(#clip-${element.textInput.clip})` : (element.textInput.clipPath || undefined)"
                  class="select-none"
                >
                  {{ textInputData?.text || stickerText || 'Sample Text' }}
                </text>
              </template>

              <!-- SVG Image rendering with dynamic svgImageStyles -->
              <template v-if="element.type === 'svgImage' && element.svgImage">
                <g
                  v-for="svgImageStyleData in [getSvgImageStyleById(element.svgImage.id)]"
                  :key="element.svgImage.id"
                  :transform="`translate(${element.svgImage.position.x}, ${element.svgImage.position.y})`"
                >
                  <g
                    :style="{
                      fill: svgImageStyleData?.fillColor || element.svgImage.fill || '#22c55e',
                      stroke: svgImageStyleData?.strokeColor || element.svgImage.stroke || '#000000',
                      strokeWidth: svgImageStyleData?.strokeWidth ?? element.svgImage.strokeWidth ?? 2,
                      strokeLinejoin: svgImageStyleData?.strokeLinejoin || element.svgImage.strokeLinejoin || 'round'
                    }"
                    v-html="element.svgImage.svgContent"
                  />
                </g>
              </template>
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
              :fill="'#22c55e'"
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
                    :transform="`translate(${element.svgImage.position.x}, ${element.svgImage.position.y}) scale(0.4)`"
                    :style="{
                      fill: element.svgImage.fill || '#22c55e',
                      stroke: element.svgImage.stroke || '#000000',
                      strokeWidth: element.svgImage.strokeWidth || 1
                    }"
                    v-html="element.svgImage.svgContent"
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
            title="Fit to view"
            @click="altAutoFit"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>

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
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { getFontFamily, type FontConfig } from '../config/fonts' // Used in template
import type { SimpleTemplate } from '../types/template-types'
import { getTemplateElements } from '../config/template-loader'
import { logger, createPerformanceTimer } from '../utils/logger'

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
  svgImageStyles: () => [],
  previewMode: false
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
  // Also update SVG dimensions when container changes
  updateSvgDimensions()
}

// Computed properties - make SVG dimensions match the viewBox to avoid clipping
const svgWidth = computed(() => {
  if (props.template) {
    // Use the exact template viewBox width to prevent clipping
    return props.template.viewBox.width
  }
  return Math.min(props.width, 400)
})

const svgHeight = computed(() => {
  if (props.template) {
    // Use the exact template viewBox height to prevent clipping
    return props.template.viewBox.height
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
    return getFontFamily(props.font) // Used in template
  }
  return 'Arial, sans-serif'
})

// Get ordered template elements
const templateElements = computed(() => {
  if (props.template) {
    const timer = createPerformanceTimer(`SVG render: ${props.template.name}`)
    const elements = getTemplateElements(props.template)

    timer.end({
      templateId: props.template.id,
      elementCount: elements.length,
      textInputCount: props.textInputs?.length || 0,
      shapeStyleCount: props.shapeStyles?.length || 0
    })

    return elements
  }
  return []
})

// Helper function to get textInput data by ID
const getTextInputById = (id: string) => {
  return props.textInputs?.find(input => input.id === id)
}

// Helper function to get shape style data for a specific shape ID
const getShapeStyleById = (id: string) => {
  return props.shapeStyles?.find(style => style.id === id)
}

// Helper function to get SVG image style data for a specific SVG image ID
const getSvgImageStyleById = (id: string) => {
  return props.svgImageStyles?.find(style => style.id === id)
}

// Helper function to get font family for a specific textInput
const getFontFamilyForTextInput = (textInput: any) => { // Used in template
  if (textInput?.font) {
    return getFontFamily(textInput.font) // Used in template
  }
  return 'Arial, sans-serif'
}

// Check if template has any text elements with clipping
const hasClipPaths = computed(() => {
  if (!props.template) return false
  return templateElements.value.some(element =>
    element.type === 'text' && element.textInput?.clip
  )
})

// Get shapes that are used as clip paths
const clipPathShapes = computed(() => {
  if (!props.template) return []

  // Get all shape elements that are referenced as clip paths
  const shapeElements = templateElements.value.filter(element => element.type === 'shape')
  const clipIds = new Set<string>()

  // Find all clip references
  templateElements.value.forEach(element => {
    if (element.type === 'text' && element.textInput?.clip) {
      clipIds.add(element.textInput.clip)
    }
  })

  // Return shapes that are referenced as clips
  return shapeElements
    .filter(element => element.shape && clipIds.has(element.shape.id))
    .map(element => ({
      id: element.shape!.id,
      path: element.shape!.path
    }))
})

// Reactive SVG dimensions that update with window resize
const actualSvgDimensions = ref({ width: 0, height: 0 })

// Function to update SVG dimensions
const updateSvgDimensions = () => {
  if (svgElementRef.value && props.template) {
    const rect = svgElementRef.value.getBoundingClientRect()
    actualSvgDimensions.value = {
      width: rect.width,
      height: rect.height
    }
  }
}

// Viewport calculation for compact legend
const viewportStyle = computed(() => {
  // Compact legend container is 128px wide, 40px high (w-32 h-10)
  const legendWidth = 128
  const legendHeight = 40

  // Calculate the actual mini SVG dimensions (same logic as in template)
  let miniSvgWidth = legendWidth
  let miniSvgHeight = legendHeight

  if (props.template) {
    miniSvgWidth = Math.min(120, props.template.viewBox.width / props.template.viewBox.height * 32)
    miniSvgHeight = 32
  }

  // The viewport rectangle should represent what portion of the SVG content is visible
  // At zoom 1, the entire SVG content is visible (100%)
  // At higher zoom levels, only a portion is visible

  // Calculate how much of the content is visible based on zoom level
  const visibleWidthRatio = Math.min(1, 1 / zoomLevel.value)
  const visibleHeightRatio = Math.min(1, 1 / zoomLevel.value)

  // The viewport rectangle size should be proportional to how much is visible
  const viewportWidth = miniSvgWidth * visibleWidthRatio
  const viewportHeight = miniSvgHeight * visibleHeightRatio

  // Calculate viewport rectangle position based on pan values
  // Center the mini SVG within the legend container
  const miniSvgOffsetX = (legendWidth - miniSvgWidth) / 2
  const miniSvgOffsetY = (legendHeight - miniSvgHeight) / 2

  // When zoomed in, the viewport rectangle moves based on pan
  let viewportX = miniSvgOffsetX
  let viewportY = miniSvgOffsetY

  if (containerDimensions.value.width > 0 && containerDimensions.value.height > 0 && zoomLevel.value > 1) {
    // Calculate the maximum pan distance in each direction
    const maxPanX = (containerDimensions.value.width * (zoomLevel.value - 1)) / 2
    const maxPanY = (containerDimensions.value.height * (zoomLevel.value - 1)) / 2

    if (maxPanX > 0) {
      // Normalize pan position (-1 to 1) and map to viewport position
      const panRatioX = Math.max(-1, Math.min(1, panX.value / maxPanX))
      viewportX = miniSvgOffsetX + (miniSvgWidth - viewportWidth) * (panRatioX + 1) / 2
    }

    if (maxPanY > 0) {
      const panRatioY = Math.max(-1, Math.min(1, panY.value / maxPanY))
      viewportY = miniSvgOffsetY + (miniSvgHeight - viewportHeight) * (panRatioY + 1) / 2
    }
  }

  // Ensure the viewport rectangle stays within the mini SVG bounds
  viewportX = Math.max(miniSvgOffsetX, Math.min(miniSvgOffsetX + miniSvgWidth - viewportWidth, viewportX))
  viewportY = Math.max(miniSvgOffsetY, Math.min(miniSvgOffsetY + miniSvgHeight - viewportHeight, viewportY))

  return {
    width: `${viewportWidth}px`,
    height: `${viewportHeight}px`,
    left: `${viewportX}px`,
    top: `${viewportY}px`
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
  if (!svgContainer.value || !svgElementRef.value || !props.template) {
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

  // Get the actual content bounds within the SVG
  const svgElement = svgElementRef.value
  const contentElements = Array.from(svgElement.querySelectorAll('rect, text, circle, path, polygon'))

  if (contentElements.length === 0) {
    // Fallback to SVG element if no content found
    const svgRect = svgElement.getBoundingClientRect()
    const scaleToFitWidth = containerWidth / svgRect.width
    const scaleToFitHeight = containerHeight / svgRect.height
    const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.9
    zoomLevel.value = Math.max(0.2, Math.min(3, bestScale))
    return
  }

  // Calculate bounding box of actual content in SVG coordinates
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  contentElements.forEach(el => {
    try {
      const bbox = el.getBBox()
      minX = Math.min(minX, bbox.x)
      minY = Math.min(minY, bbox.y)
      maxX = Math.max(maxX, bbox.x + bbox.width)
      maxY = Math.max(maxY, bbox.y + bbox.height)
    } catch (e) {
      // getBBox might fail on some elements, skip them
    }
  })

  if (minX === Infinity) {
    // No valid bounding boxes found, fallback
    const svgRect = svgElement.getBoundingClientRect()
    const scaleToFitWidth = containerWidth / svgRect.width
    const scaleToFitHeight = containerHeight / svgRect.height
    const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.9
    zoomLevel.value = Math.max(0.2, Math.min(3, bestScale))
    return
  }

  // Content dimensions in SVG coordinates
  const contentWidth = maxX - minX
  const contentHeight = maxY - minY

  // Get SVG viewBox to convert to screen coordinates
  const viewBox = props.template.viewBox
  const svgRect = svgElement.getBoundingClientRect()

  // Calculate how much screen space the content actually takes
  const contentScreenWidth = (contentWidth / viewBox.width) * svgRect.width
  const contentScreenHeight = (contentHeight / viewBox.height) * svgRect.height

  // Calculate the scale needed to fit the actual content
  const scaleToFitWidth = containerWidth / contentScreenWidth
  const scaleToFitHeight = containerHeight / contentScreenHeight
  const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.85 // Leave some margin

  // Apply the scale and center the SVG
  const finalZoom = Math.max(0.2, Math.min(5, bestScale))
  zoomLevel.value = finalZoom

  // Center the SVG by resetting pan values
  panX.value = 0
  panY.value = 0
}

// Auto-fit function to scale template to fit the container
const autoFitTemplate = async () => {
  if (!svgContainer.value || !props.template) {
    return
  }

  await nextTick() // Wait for DOM updates

  const containerRect = svgContainer.value.getBoundingClientRect()
  const availableWidth = containerRect.width - 120 // Account for controls and padding
  const availableHeight = containerRect.height - 120 // Account for controls and padding

  // Get the template viewBox dimensions (this is the "natural" size of the content)
  const templateWidth = props.template.viewBox.width
  const templateHeight = props.template.viewBox.height

  logger.debug('Size calculation info:', {
    containerSize: { width: containerRect.width, height: containerRect.height },
    availableSize: { width: availableWidth, height: availableHeight },
    templateSize: { width: templateWidth, height: templateHeight }
  })

  // Calculate scale to fit both dimensions with some padding
  const scaleX = availableWidth / templateWidth
  const scaleY = availableHeight / templateHeight
  const optimalScale = Math.min(scaleX, scaleY) * 0.8 // 80% to leave breathing room


  // Apply the optimal zoom level and center
  const finalZoom = Math.max(0.2, Math.min(5, optimalScale))
  zoomLevel.value = finalZoom
  panX.value = 0 // Center horizontally
  panY.value = 0 // Center vertically

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

  const deltaX = (e as any).clientX - dragStartX.value
  const deltaY = (e as any).clientY - dragStartY.value

  panX.value = initialPanX.value + deltaX
  panY.value = initialPanY.value + deltaY
}

const endDrag = () => {
  isDragging.value = false
}

// Enhanced wheel zoom with trackpad support
const handleWheel = (e: Event) => {
  // Skip if in preview mode
  if (props.previewMode) return

  e.preventDefault()
  e.stopPropagation()

  // Detect if this is likely a trackpad by checking for ctrl key (pinch gesture)
  // or fine-grained deltaY values typical of trackpads
  const isTrackpad = e.ctrlKey || (Math.abs((e as any).deltaY) < 50 && (e as any).deltaY % 1 !== 0)

  let delta: number
  if (isTrackpad) {
    // More sensitive scaling for trackpad gestures
    const scaleFactor = 1 + ((e as any).deltaY * -0.01) // Invert and scale
    delta = Math.max(0.5, Math.min(2.0, scaleFactor)) // Clamp for smooth zooming
  } else {
    // Traditional mouse wheel
    delta = (e as any).deltaY > 0 ? 0.9 : 1.1
  }

  zoomLevel.value = Math.min(Math.max(zoomLevel.value * delta, 0.1), 5)
}

// Touch and gesture state for trackpad/touch zoom
const touchState = ref({
  initialDistance: 0,
  initialZoom: 1,
  touches: [] as Touch[]
})

// Touch event handlers for pinch-to-zoom
const handleTouchStart = (e: Event) => {
  // Skip if in preview mode
  if (props.previewMode) return

  if ((e as any).touches.length === 2) {
    e.preventDefault()
    e.stopPropagation()
    const touch1 = (e as any).touches[0]
    const touch2 = (e as any).touches[1]
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    touchState.value.initialDistance = distance
    touchState.value.initialZoom = zoomLevel.value
    touchState.value.touches = Array.from((e as any).touches)
  }
}

const handleTouchMove = (e: Event) => {
  // Skip if in preview mode
  if (props.previewMode) return

  if ((e as any).touches.length === 2 && touchState.value.initialDistance > 0) {
    e.preventDefault()
    e.stopPropagation()
    const touch1 = (e as any).touches[0]
    const touch2 = (e as any).touches[1]
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )

    const scale = distance / touchState.value.initialDistance
    const newZoom = touchState.value.initialZoom * scale
    zoomLevel.value = Math.min(Math.max(newZoom, 0.1), 5)
  }
}

const handleTouchEnd = (e: Event) => {
  // Skip if in preview mode
  if (props.previewMode) return

  if ((e as any).touches.length < 2) {
    touchState.value.initialDistance = 0
    touchState.value.touches = []
  }
}

// Gesture event handlers for trackpad zoom (Safari/WebKit)
const gestureState = ref({
  initialZoom: 1
})

const handleGestureStart = (e: any) => {
  // Skip if in preview mode
  if (props.previewMode) return

  e.preventDefault()
  e.stopPropagation()
  gestureState.value.initialZoom = zoomLevel.value
}

const handleGestureChange = (e: any) => {
  // Skip if in preview mode
  if (props.previewMode) return

  e.preventDefault()
  e.stopPropagation()
  // e.scale represents the scaling factor from the gesture
  const newZoom = gestureState.value.initialZoom * e.scale
  zoomLevel.value = Math.min(Math.max(newZoom, 0.1), 5)
}

const handleGestureEnd = (e: any) => {
  // Skip if in preview mode
  if (props.previewMode) return

  e.preventDefault()
  e.stopPropagation()
  // Keep the final zoom level
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
    // Download failed, silently handle error
    // eslint-disable-next-line no-console
    console.warn('SVG download failed:', error)
  }
}

// Watch for template changes and auto-fit
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    // Always auto-fit when template changes, regardless of mode
    nextTick(() => altAutoFit())
  }
}, { immediate: true })

// Watch for container ref changes and update dimensions
watch(svgContainer, () => {
  if (svgContainer.value) {
    nextTick(() => updateContainerDimensions())
  }
})

// Watch for SVG element changes and update dimensions
watch(svgElementRef, () => {
  if (svgElementRef.value) {
    nextTick(() => updateSvgDimensions())
  }
})

// Auto-fit on mount for all modes
onMounted(() => {
  // Initialize container dimensions
  updateContainerDimensions()

  // Add window resize listener
  window.addEventListener('resize', updateContainerDimensions)

  // Always auto-fit on mount if we have a template
  if (props.template) {
    nextTick(() => altAutoFit())
  }
})

// Clean up resize listener
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerDimensions)
})

// Expose download function and SVG ref for parent component
defineExpose({
  downloadSvg,
  autoFitTemplate,
  svgElementRef
})
</script>