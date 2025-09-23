<template>
  <g>
    <!-- Circle -->
    <circle
      v-if="shape.type === 'circle'"
      :cx="position.x"
      :cy="position.y"
      :r="shape.width / 2"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth"
      :fill="shape.fill"
      :opacity="shape.opacity || 1"
    />

    <!-- Rectangle/Square -->
    <rect
      v-else-if="shape.type === 'rect'"
      :x="position.x - shape.width / 2"
      :y="position.y - shape.height / 2"
      :width="shape.width"
      :height="shape.height"
      :rx="shape.rx || 0"
      :ry="shape.ry || 0"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth"
      :fill="shape.fill"
      :opacity="shape.opacity || 1"
    />

    <!-- Ellipse -->
    <ellipse
      v-else-if="shape.type === 'ellipse'"
      :cx="position.x"
      :cy="position.y"
      :rx="shape.width / 2"
      :ry="shape.height / 2"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth"
      :fill="shape.fill"
      :opacity="shape.opacity || 1"
    />

    <!-- Polygon (for diamonds, triangles, etc.) -->
    <polygon
      v-else-if="shape.type === 'polygon'"
      :points="transformedPoints"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth"
      :fill="shape.fill"
      :opacity="shape.opacity || 1"
    />

    <!-- Line -->
    <line
      v-else-if="shape.type === 'line' && isLinePosition(shape.position)"
      :x1="shape.position.x1"
      :y1="shape.position.y1"
      :x2="shape.position.x2"
      :y2="shape.position.y2"
      :stroke="shape.stroke"
      :stroke-width="shape.strokeWidth"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateShape } from '../config/templates'

interface Props {
  shape: TemplateShape
  templateWidth: number
  templateHeight: number
}

const props = defineProps<Props>()

// Calculate actual position based on percentage
const position = computed(() => {
  if ('x1' in props.shape.position) {
    // Line type - return as is
    return props.shape.position
  }

  const pos = props.shape.position as { x: number; y: number }
  return {
    x: (pos.x / 100) * props.templateWidth,
    y: (pos.y / 100) * props.templateHeight
  }
})

// Transform polygon points relative to position
const transformedPoints = computed(() => {
  if (props.shape.type !== 'polygon' || !props.shape.points) return ''

  const centerX = position.value.x
  const centerY = position.value.y

  // Parse points and transform them
  const points = props.shape.points
    .split(/[\s,]+/)
    .filter(p => p.trim())
    .map(p => parseFloat(p))

  const transformedPointsArray: number[] = []
  for (let i = 0; i < points.length; i += 2) {
    if (i + 1 < points.length) {
      transformedPointsArray.push(centerX + points[i])
      transformedPointsArray.push(centerY + points[i + 1])
    }
  }

  return transformedPointsArray.join(' ')
})

// Type guard for line position
const isLinePosition = (position: any): position is { x1: number; y1: number; x2: number; y2: number } => {
  return position && typeof position.x1 === 'number' && typeof position.y1 === 'number' &&
         typeof position.x2 === 'number' && typeof position.y2 === 'number'
}
</script>