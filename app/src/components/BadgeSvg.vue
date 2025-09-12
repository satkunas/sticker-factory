<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0"
      y="0"
      :width="width"
      :height="height"
      :rx="height / 2"
      :fill="color"
    />
    <text
      :x="width / 2"
      :y="height / 2 + fontSize / 3"
      text-anchor="middle"
      fill="white"
      font-family="Arial, sans-serif"
      :font-size="fontSize"
      font-weight="bold"
    >
      {{ text || 'Badge' }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

interface Props {
  text?: string
  color?: string
  width?: number
  height?: number
  fontSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Badge',
  color: '#22c55e',
  width: 200,
  height: 60,
  fontSize: 16
})

// Export SVG content for downloads
const getSvgContent = () => {
  return `<svg width="${props.width}" height="${props.height}" viewBox="0 0 ${props.width} ${props.height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${props.width}" height="${props.height}" rx="${props.height / 2}" fill="${props.color}"/>
  <text x="${props.width / 2}" y="${props.height / 2 + props.fontSize / 3}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${props.fontSize}" font-weight="bold">${props.text || 'Badge'}</text>
</svg>`
}

defineExpose({
  getSvgContent
})
</script>