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
      :fill="textColor"
      :stroke="textStrokeColor"
      :stroke-width="textStrokeWidth"
      :stroke-linejoin="textStrokeLinejoin"
      :font-family="fontFamily"
      :font-size="fontSize"
      :font-weight="fontWeight"
    >
      {{ text }}
    </text>
  </svg>
</template>

<script setup lang="ts">

interface Props {
  text?: string
  color?: string
  textColor?: string
  width?: number
  height?: number
  fontSize?: number
  fontWeight?: number
  textStrokeWidth?: number
  textStrokeColor?: string
  textStrokeLinejoin?: string
  fontFamily?: string
}

const props = defineProps<Props>()

// Export SVG content for downloads - pure property access, no conditionals
const getSvgContent = () => {
  return `<svg width="${props.width}" height="${props.height}" viewBox="0 0 ${props.width} ${props.height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${props.width}" height="${props.height}" rx="${props.height / 2}" fill="${props.color}"/>
  <text x="${props.width / 2}" y="${props.height / 2 + props.fontSize / 3}" text-anchor="middle" fill="${props.textColor}" stroke="${props.textStrokeColor}" stroke-width="${props.textStrokeWidth}" stroke-linejoin="${props.textStrokeLinejoin}" font-family="${props.fontFamily}" font-size="${props.fontSize}" font-weight="${props.fontWeight}">${props.text}</text>
</svg>`
}

defineExpose({
  getSvgContent
})
</script>