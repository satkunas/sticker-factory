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
          :stroke-linejoin="(shapeStyleData?.strokeLinejoin as 'round' | 'miter' | 'bevel') || 'round'"
        />

        <!-- Text rendering with dynamic textInputs -->
        <template v-if="element.type === 'text' && element.textInput">
          <text
            v-for="textInputData in [getTextInputById(element.textInput.id)]"
            :key="element.textInput.id"
            :x="resolveTextPositionUtil(element.textInput, 'x', template?.viewBox)"
            :y="resolveTextPositionUtil(element.textInput, 'y', template?.viewBox)"
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

        <!-- SVG Image rendering with color attribute on parent SVG -->
        <template v-if="element.type === 'svgImage' && element.svgImage">
          <g
            v-for="svgImageStyleData in [getSvgImageStyleById(element.svgImage.id)]"
            :key="element.svgImage.id"
            :transform="getStyledSvgTransform(element.svgImage, svgImageStyleData)"
          >
            <g
              v-html="getStyledSvgContent(element.svgImage, svgImageStyleData, element.svgImage.fill, element.svgImage.stroke, element.svgImage.strokeWidth)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FontConfig } from '../config/fonts'
import { getFontFamily } from '../config/fonts'
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

// SVG element reference
const svgElementRef = defineExpose({ svgElementRef })

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
    return getFontFamily(props.font)
  }
  return 'Arial, sans-serif'
})

// Get ordered template elements
const templateElements = computed(() => {
  if (props.template) {
    const timer = createPerformanceTimer(`SVG render: ${props.template.name}`)
    const elements = getTemplateElements(props.template)
    timer.end()
    return elements
  }
  return []
})

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

// Helper functions for data retrieval
const getTextInputById = (id: string) => {
  return props.textInputs?.find(input => input.id === id)
}

const getShapeStyleById = (id: string) => {
  return props.shapeStyles?.find(style => style.id === id)
}

const getSvgImageStyleById = (id: string) => {
  return props.svgImageStyles?.find(style => style.id === id)
}

const getFontFamilyForTextInput = (textInputData: any) => {
  if (textInputData.font) {
    return getFontFamily(textInputData.font)
  }
  return fontFamily.value
}
</script>