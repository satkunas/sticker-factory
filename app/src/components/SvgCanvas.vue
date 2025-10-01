<template>
  <svg
    ref="svgElementRef"
    :width="svgWidth"
    :height="svgHeight"
    :viewBox="viewBoxString"
    xmlns="http://www.w3.org/2000/svg"
    :class="svgClasses"
    :style="svgStyles"
  >
    <!-- FLAT ARCHITECTURE: Pure property rendering with no conditionals -->
    <g v-if="template">
      <!-- Simplified clip path definitions -->
      <defs v-if="flatClipPaths.length > 0">
        <clipPath
          v-for="clipShape in flatClipPaths"
          :id="clipShape.id"
          :key="clipShape.id"
        >
          <path :d="clipShape.path" />
        </clipPath>
      </defs>

      <template v-for="(element, index) in svgRenderData" :key="`${element.type}-${index}`">
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

        <!-- SVG Image rendering with nested transforms -->
        <template v-if="element.type === 'svgImage' && element.svgImage">
          <!-- Outer g: positioning and base scaling to match declared template size -->
          <g
            :key="element.svgImage.id"
            :clip-path="element.svgImage.clipPath"
            :transform="validateTransform(element.outerTransform, element.svgImage?.id, 'outer')"
          >
            <!-- Inner g: user scaling and rotation around center -->
            <g :transform="validateTransform(element.innerTransform, element.svgImage?.id, 'inner')">
              <g v-html="getStyledSvgContent(element.svgImage)" />
            </g>
          </g>
        </template>
      </template>
    </g>

    <!-- Fallback: Show empty state when no template -->
    <g v-else-if="viewBoxWidth && viewBoxHeight">
      <text
        :x="viewBoxWidth / 2"
        :y="viewBoxHeight / 2"
        text-anchor="middle"
        dominant-baseline="central"
        class="select-none"
      >
        No template selected
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import {
  getStyledSvgContent,
  resolveTextPosition as resolveTextPositionUtil
} from '../utils/svg-template'
import {
  svgRenderData,
  flatClipPaths
} from '../stores/urlDrivenStore'

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
  viewBoxString?: string
  svgClasses?: string
  svgStyles?: object
  svgWidth?: number
  svgHeight?: number
  templateElements?: Array<any>
  clipPathShapes?: Array<{id: string, path: string}>
  hasClipPaths?: boolean
  viewBoxWidth?: number
  viewBoxHeight?: number
}

defineProps<Props>()

// SVG element reference
const svgElementRef = ref<SVGElement | null>(null)

// Transform validation function to catch NaN values before they reach the DOM
function validateTransform(transform: string | undefined, layerId: string | undefined, transformType: string): string | undefined {
  if (!transform) return undefined

  // Check for NaN in transform string
  if (transform.includes('NaN')) {
    // eslint-disable-next-line no-console
    console.error(`🚨 CRITICAL: NaN detected in ${transformType} transform for layer ${layerId}:`, {
      originalTransform: transform,
      layerId,
      transformType
    })
    // Return empty string to prevent DOM errors
    return ''
  }

  return transform
}

// Expose the SVG element reference
defineExpose({
  svgElementRef
})

// Pure property access - no conditional logic


// Direct property access - store provides templateElements

// Enhanced: Use renderableElements directly from props (no merge logic needed)
// The layers prop now contains complete render-ready data with precedence applied

// Direct prop access - store provides clip path data

</script>