<template>
  <g
    ref="svgContentRef"
    :class="svgClasses"
    :style="svgStyles"
  >
    <!-- LAYER 1: CENTERED CONTENT RENDERING -->
    <!-- Pure content layer with proper centering calculations -->
    <g v-if="template" class="template-content-centered">
      <!-- Clip path definitions -->
      <defs v-if="flatClipPaths.length > 0">
        <clipPath
          v-for="clipShape in flatClipPaths"
          :id="clipShape.id"
          :key="clipShape.id"
        >
          <path :d="clipShape.path" />
        </clipPath>
      </defs>

      <!-- Content group without wrapper transform - each element handles its own positioning -->
      <template v-for="(element, index) in svgRenderData" :key="getElementKey(element, index)">
        <!-- Shape rendering with unified transform -->
        <g v-if="element.type === 'shape'" :transform="element.transform">
          <path
            :key="element.id"
            :d="element.path"
            :fill="element.fill"
            :stroke="element.stroke"
            :stroke-width="element.strokeWidth"
            :stroke-linejoin="element.strokeLinejoin as 'round' | 'miter' | 'bevel'"
          />
        </g>

        <!-- Text rendering with unified transform -->
        <g v-if="element.type === 'text'" :transform="element.transform">
          <text
            :key="element.id"
            text-anchor="middle"
            dominant-baseline="central"
            :font-family="element.fontFamily"
            :font-size="element.fontSize"
            :font-weight="element.fontWeight"
            :fill="element.fontColor"
            :stroke="element.stroke"
            :stroke-width="element.strokeWidth"
            :stroke-opacity="element.strokeOpacity"
            :clip-path="element.clipPath"
            class="select-none"
          >
            {{ element.text }}
          </text>
        </g>

        <!-- SVG Image rendering with unified transform -->
        <!-- Key includes hash of styledContent to force re-render on style changes -->
        <g v-if="element.type === 'svgImage'" :transform="element.transform">
          <g
            :key="getElementKey(element, index)"
            :clip-path="element.clipPath"
            v-html="element.styledContent || element.svgContent"
          />
        </g>
      </template>
    </g>

    <!-- Fallback: Empty state -->
    <g v-else-if="props.contentWidth && props.contentHeight" class="empty-state">
      <text
        :x="props.contentWidth && props.contentWidth / 2"
        :y="props.contentHeight && props.contentHeight / 2"
        text-anchor="middle"
        dominant-baseline="central"
        class="select-none"
      >
        No template selected
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
// No longer need these imports - using unified transform from store
import { useSvgCentering } from '../composables/useSvgCentering'
import {
  svgRenderData,
  flatClipPaths
} from '../stores/urlDrivenStore'

interface Props {
  template?: SimpleTemplate | null
  layers?: Array<{
    id: string
    type: 'text' | 'shape' | 'svgImage'
    [key: string]: any
  }>
  svgClasses?: string
  svgStyles?: object
  contentWidth?: number
  contentHeight?: number
}

const props = defineProps<Props>()

// SVG content reference (now refers to the group element)
const svgContentRef = ref<SVGElement | null>(null)

// Template reactive reference
const templateRef = computed(() => props.template)

// Use centering composable for image center tracking (no longer need centeringTransform)
const {
  updateImageCenter,
  getImageCenterTransform
} = useSvgCentering(templateRef)

// Simple hash function for generating stable keys from content
// This ensures Vue re-renders v-html when styledContent changes
const hashString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Generate Vue key that includes content hash for proper reactivity
const getElementKey = (element: any, index: number): string => {
  if (element.type === 'svgImage' && element.styledContent) {
    // Hash the styledContent to create a stable, short key
    // Any change to styling (color, stroke, strokeLinejoin, etc.) will change the hash
    const hash = hashString(element.styledContent)
    return `${element.id}-${hash}`
  }
  return `${element.type}-${index}`
}

// Transform validation is now handled in the unified positioning utility

// Expose group element reference and centering functions for parent components
defineExpose({
  svgContentRef,
  updateImageCenter,
  getImageCenterTransform
})
</script>

<style scoped>
.template-content-centered {
  /* Ensure content is properly layered */
  z-index: 10;
}

.empty-state {
  /* Style empty state appropriately */
  opacity: 0.6;
}
</style>