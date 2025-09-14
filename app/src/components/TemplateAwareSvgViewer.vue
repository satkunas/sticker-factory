<template>
  <div class="w-full lg:w-1/2 p-6 bg-secondary-50 flex flex-col items-center justify-center overflow-hidden">
    <div class="w-full max-w-md">
      <!-- SVG Preview -->
      <div class="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 flex items-center justify-center min-h-[200px]">
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

              <!-- Text rendering -->
              <text
                v-if="element.type === 'text' && element.textInput"
                :x="element.textInput.position.x"
                :y="element.textInput.position.y"
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getFontFamily, type FontConfig } from '../config/fonts'
import type { SimpleTemplate } from '../../templates/types'
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
  template: null
})

// SVG element reference
const svgElementRef = ref<SVGElement | null>(null)

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