<template>
  <div
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
    <!-- Wrapper SVG with dynamic viewBox for zoom/pan -->
    <svg
      v-if="template && layers"
      ref="svgViewportRef"
      :viewBox="viewBoxString"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Template content without nested SVG wrapper -->
      <SvgContent
        :template="template"
        :layers="layers"
        mode="viewport"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import SvgContent from './SvgContent.vue'

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

// Computed viewBox string with fallback to template viewBox
const viewBoxString = computed(() => {
  // Use props viewBox if provided (for zoom/pan) and validate they're finite numbers
  if (props.viewBoxX !== undefined && props.viewBoxY !== undefined &&
      props.viewBoxWidth !== undefined && props.viewBoxHeight !== undefined &&
      isFinite(props.viewBoxX) && isFinite(props.viewBoxY) &&
      isFinite(props.viewBoxWidth) && isFinite(props.viewBoxHeight)) {
    return `${props.viewBoxX} ${props.viewBoxY} ${props.viewBoxWidth} ${props.viewBoxHeight}`
  }

  // Fallback to template viewBox
  if (props.template?.viewBox) {
    const vb = props.template.viewBox
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`
  }

  // Default viewBox
  return '0 0 400 400'
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
  layerClick: [layerId: string]
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

// Helper function to find layer ID from clicked element
// eslint-disable-next-line no-undef
const findLayerId = (target: EventTarget | null): string | null => {
  // eslint-disable-next-line no-undef
  if (!(target instanceof Element)) return null

  // Traverse up the DOM tree to find an element with data-layer-id
  // eslint-disable-next-line no-undef
  let element: Element | null = target
  while (element && element !== svgViewportRef.value) {
    if (element.hasAttribute && element.hasAttribute('data-layer-id')) {
      return element.getAttribute('data-layer-id')
    }
    element = element.parentElement
  }

  return null
}

// Event handler pass-through functions
const handleMouseDown = (e: MouseEvent) => {
  // Check if a layer was clicked
  const layerId = findLayerId(e.target)
  if (layerId) {
    emit('layerClick', layerId)
  }

  emit('mousedown', e)
}
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