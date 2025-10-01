<template>
  <g class="background-grid">
    <!-- Grid pattern definition -->
    <defs>
      <pattern
        :id="patternId"
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

    <!-- Grid background -->
    <rect
      :x="gridBounds.x"
      :y="gridBounds.y"
      :width="gridBounds.width"
      :height="gridBounds.height"
      :fill="`url(#${patternId})`"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { calculateGridBounds, type Dimensions, type GridBounds } from '../utils/svg-centering'

// Component props
interface Props {
  /** Content dimensions to base grid size on */
  contentDimensions: Dimensions
  /** Grid cell size in SVG units */
  gridSize?: number
  /** Scale factor for grid size relative to content (default: 2.0 for 2x content size) */
  gridScale?: number
  /** Unique ID suffix for pattern (prevents conflicts with multiple grids) */
  patternId?: string
}

const props = withDefaults(defineProps<Props>(), {
  gridSize: 20,
  gridScale: 2.0,
  patternId: 'background-grid'
})

// Calculate grid bounds using utils
const gridBounds = computed<GridBounds>(() => {
  return calculateGridBounds(props.contentDimensions, props.gridScale)
})

// Expose grid bounds for parent components if needed
defineExpose({
  gridBounds
})
</script>

<style scoped>
.background-grid {
  /* Ensure grid renders behind content (natural z-index) */
  z-index: 0;
}
</style>