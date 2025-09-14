<template>
  <g class="multi-shape-composer">
    <!-- Render shapes in z-index order -->
    <ShapeRenderer
      v-for="shape in sortedShapes"
      :key="shape.id"
      :shape="shape"
      :template-width="templateWidth"
      :template-height="templateHeight"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShapeRenderer from './ShapeRenderer.vue'
import type { TemplateShape } from '../config/templates'

interface Props {
  shapes: TemplateShape[]
  templateWidth: number
  templateHeight: number
}

const props = defineProps<Props>()

// Sort shapes by z-index for proper layering
const sortedShapes = computed(() => {
  return [...props.shapes].sort((a, b) => a.zIndex - b.zIndex)
})
</script>

<style scoped>
.multi-shape-composer {
  /* Ensure proper rendering context for shapes */
}
</style>