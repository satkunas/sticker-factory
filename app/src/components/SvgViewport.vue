<template>
  <div
    ref="svgViewportRef"
    class="w-full h-full relative"
    :class="cursorClass"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Template content using Svg.vue singleton -->
    <Svg
      v-if="template && layers"
      :template="template"
      :layers="layers"
      mode="viewport"
      class="absolute inset-0"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import Svg from './Svg.vue'

interface Props {
  template?: SimpleTemplate | null
  previewMode?: boolean
  viewBoxX?: number
  viewBoxY?: number
  viewBoxWidth?: number
  viewBoxHeight?: number
  gridSize?: number
  gridScale?: number
  borderWidth?: number
  cursorClass?: string
  layers?: Array<{
    id: string
    type: 'text' | 'shape' | 'svgImage'
    [key: string]: any
  }>
}

const props = defineProps<Props>()

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

// Content dimensions for BackgroundGrid component
const contentDimensions = computed(() => {
  if (props.template) {
    return {
      width: props.template.width,
      height: props.template.height
    }
  }
  return undefined
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
  svgViewportRef,
  contentDimensions
})
</script>