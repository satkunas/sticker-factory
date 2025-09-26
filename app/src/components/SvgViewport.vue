<template>
  <svg
    ref="svgViewportRef"
    class="w-full h-full"
    :viewBox="viewBoxString"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    :class="previewMode ? '' : 'cursor-move'"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Background grid pattern definition -->
    <defs>
      <pattern
        id="background-grid"
        :width="gridSize"
        :height="gridSize"
        patternUnits="userSpaceOnUse"
      >
        <rect
          :width="gridSize"
          :height="gridSize"
          fill="white"
        />
        <path
          :d="`M ${gridSize} 0 L 0 0 0 ${gridSize}`"
          fill="none"
          stroke="rgba(0, 0, 0, 0.15)"
          stroke-width="1"
        />
      </pattern>
    </defs>

    <!-- Background grid with red border -->
    <g v-if="!previewMode">
      <!-- Grid background -->
      <rect
        :x="backgroundBounds.x"
        :y="backgroundBounds.y"
        :width="backgroundBounds.width"
        :height="backgroundBounds.height"
        fill="url(#background-grid)"
      />

    </g>

    <!-- Template content slot -->
    <g class="template-content">
      <slot />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SimpleTemplate } from '../types/template-types'

interface Props {
  template?: SimpleTemplate | null
  previewMode?: boolean
  viewBoxX?: number
  viewBoxY?: number
  viewBoxWidth?: number
  viewBoxHeight?: number
  gridSize?: number
  borderWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  template: null,
  previewMode: false,
  viewBoxX: 0,
  viewBoxY: 0,
  viewBoxWidth: 800,
  viewBoxHeight: 600,
  gridSize: 20,
  borderWidth: 6
})

// Event handlers (passed through from parent)
interface Emits {
  mousedown: [event: MouseEvent]
  mousemove: [event: MouseEvent]
  mouseup: [event: MouseEvent]
  mouseleave: [event: MouseEvent]
  wheel: [event: WheelEvent]
  touchstart: [event: TouchEvent]
  touchmove: [event: TouchEvent]
  touchend: [event: TouchEvent]
}

const emit = defineEmits<Emits>()

// SVG viewport reference
const svgViewportRef = ref<SVGElement | null>(null)

// Computed viewBox string
const viewBoxString = computed(() => {
  return `${props.viewBoxX} ${props.viewBoxY} ${props.viewBoxWidth} ${props.viewBoxHeight}`
})

// Background bounds - template size * 2 for grid area
const backgroundBounds = computed(() => {
  if (props.template) {
    const templateWidth = props.template.viewBox.width
    const templateHeight = props.template.viewBox.height
    const gridWidth = templateWidth * 2
    const gridHeight = templateHeight * 2

    // Center background grid around template center
    const templateCenterX = props.template.viewBox.x + templateWidth / 2
    const templateCenterY = props.template.viewBox.y + templateHeight / 2

    return {
      x: templateCenterX - gridWidth / 2,
      y: templateCenterY - gridHeight / 2,
      width: gridWidth,
      height: gridHeight
    }
  }

  // Default background bounds
  return {
    x: -400,
    y: -300,
    width: 800,
    height: 600
  }
})

// Event handler pass-through functions
const handleMouseDown = (e: MouseEvent) => emit('mousedown', e)
const handleMouseMove = (e: MouseEvent) => emit('mousemove', e)
const handleMouseUp = (e: MouseEvent) => emit('mouseup', e)
const handleMouseLeave = (e: MouseEvent) => emit('mouseleave', e)
const handleWheel = (e: WheelEvent) => emit('wheel', e)
const handleTouchStart = (e: TouchEvent) => emit('touchstart', e)
const handleTouchMove = (e: TouchEvent) => emit('touchmove', e)
const handleTouchEnd = (e: TouchEvent) => emit('touchend', e)

// Expose SVG viewport reference for coordinate calculations
defineExpose({
  svgViewportRef
})
</script>