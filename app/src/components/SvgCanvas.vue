<template>
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

      <template v-for="(element, index) in props.layers" :key="`${element.type}-${index}`">
        <!-- Shape rendering -->
        <path
          v-if="element.type === 'shape' && element.shape"
          :key="element.shape.id"
          :d="element.shape.path"
          :fill="element.shape.fill"
          :stroke="element.shape.stroke"
          :stroke-width="element.shape.strokeWidth"
          :stroke-linejoin="element.shape.strokeLinejoin as 'round' | 'miter' | 'bevel'"
        />

        <!-- Text rendering with normalized data -->
        <template v-if="element.type === 'text' && element.textInput">
          <text
            :key="element.textInput.id"
            :x="resolveTextPositionUtil(element.textInput, 'x', template?.viewBox)"
            :y="resolveTextPositionUtil(element.textInput, 'y', template?.viewBox)"
            text-anchor="middle"
            dominant-baseline="central"
            :font-family="element.textInput.fontFamily"
            :font-size="element.textInput.fontSize"
            :font-weight="element.textInput.fontWeight"
            :fill="element.textInput.fontColor"
            :stroke="element.textInput.stroke"
            :stroke-width="element.textInput.strokeWidth"
            :stroke-opacity="element.textInput.strokeOpacity"
            :clip-path="element.textInput.clipPath"
            class="select-none"
          >
            {{ element.textInput.text }}
          </text>
        </template>

        <!-- SVG Image rendering with normalized data -->
        <template v-if="element.type === 'svgImage' && element.svgImage">
          <g
            :key="element.svgImage.id"
            :clip-path="element.svgImage.clipPath"
            :transform="getStyledSvgTransform(element.svgImage)"
          >
            <g v-html="getStyledSvgContent(element.svgImage)" />
          </g>
        </template>
      </template>
    </g>

    <!-- Fallback: Show empty state when no template -->
    <g v-else>
      <text
        :x="viewBoxWidth / 2"
        :y="viewBoxHeight / 2"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="Arial, sans-serif"
        font-size="14"
        fill="#6b7280"
        class="select-none"
      >
        No template selected
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import { createPerformanceTimer } from '../utils/logger'
import { getTemplateElements } from '../config/template-loader'
import {
  getStyledSvgContent,
  getStyledSvgTransform,
  resolveTextPosition as resolveTextPositionUtil
} from '../utils/svg-template'

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
  layers: () => [],
  previewMode: false
})

// SVG element reference
const svgElementRef = ref<SVGElement | null>(null)

// Expose the SVG element reference
defineExpose({
  svgElementRef
})

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


// Get ordered template elements merged with form data
const templateElements = computed(() => {
  if (props.template) {
    const timer = createPerformanceTimer(`SVG render: ${props.template.name}`)
    const elements = getTemplateElements(props.template)
    timer.end()
    return elements
  }
  return []
})

// Enhanced: Use renderableElements directly from props (no merge logic needed)
// The layers prop now contains complete render-ready data with precedence applied

// Get clip path shapes - implement locally since not available in utils
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
    if (element.type === 'svgImage' && element.svgImage?.clip) {
      clipIds.add(element.svgImage.clip)
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

const hasClipPaths = computed(() => {
  return clipPathShapes.value.length > 0
})

</script>