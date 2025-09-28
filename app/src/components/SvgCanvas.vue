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
            :x="resolveTextPositionUtil(element.textInput, 'x', template?.viewBox) ?? 0"
            :y="resolveTextPositionUtil(element.textInput, 'y', template?.viewBox) ?? 0"
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
            :transform="element.outerTransform"
          >
            <!-- Inner g: user scaling and rotation around center -->
            <g :transform="element.innerTransform">
              <g v-html="getStyledSvgContent(element.svgImage)" />
            </g>
          </g>
        </template>
      </template>
    </g>

    <!-- Fallback: Show empty state when no template -->
    <g v-else>
      <text
        :x="(viewBoxWidth ?? 400) / 2"
        :y="(viewBoxHeight ?? 300) / 2"
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
import { ref } from 'vue'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../types/template-types'
import {
  getStyledSvgContent,
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

const props = defineProps<Props>()

// SVG element reference
const svgElementRef = ref<SVGElement | null>(null)

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