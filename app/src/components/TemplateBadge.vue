<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
    class="template-badge"
  >
    <!-- Define clip paths for text -->
    <defs>
      <clipPath
        v-for="textInput in template.textInputs"
        :key="`clip-${textInput.id}`"
        :id="`clip-${textInput.id}-${instanceId}`"
      >
        <path :d="getClipPathForText(textInput)" />
      </clipPath>
    </defs>

    <!-- Render template shapes -->
    <MultiShapeComposer
      :shapes="template.shapes"
      :template-width="width"
      :template-height="height"
    />

    <!-- Render text inputs -->
    <g
      v-for="(textInput, index) in template.textInputs"
      :key="`text-${textInput.id}`"
      :clip-path="`url(#clip-${textInput.id}-${instanceId})`"
    >
      <text
        :x="getTextPosition(textInput).x"
        :y="getTextPosition(textInput).y"
        :transform="getTextTransform(textInput, index)"
        text-anchor="middle"
        :fill="getTextColor(index)"
        :stroke="getTextStroke(index)"
        :stroke-width="getTextStrokeWidth(index)"
        :stroke-linejoin="getTextStrokeLinejoin(index)"
        :font-family="getTextFontFamily(index)"
        :font-size="getTextFontSize(index)"
        :font-weight="getTextFontWeight(index)"
        dominant-baseline="middle"
      >
        {{ getTextContent(index) }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import MultiShapeComposer from './MultiShapeComposer.vue'
import { getFontFamily, type FontConfig } from '../config/fonts'
import type { Template, TemplateTextInput } from '../config/templates'

interface Props {
  template: Template
  texts: string[]
  textColors: string[]
  textFonts: (FontConfig | null)[]
  textFontSizes: number[]
  textFontWeights: number[]
  textRotations: number[]
  textStrokeWidths: number[]
  textStrokeColors: string[]
  textStrokeLinejoins: string[]
  backgroundColor?: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: '#22c55e',
  width: 300,
  height: 200
})

// Generate unique instance ID for clip paths
const instance = getCurrentInstance()
const instanceId = computed(() => instance?.uid || Math.random().toString(36).substring(2))

// Calculate text position based on template definition
const getTextPosition = (textInput: TemplateTextInput) => {
  return {
    x: (textInput.position.x / 100) * props.width,
    y: (textInput.position.y / 100) * props.height
  }
}

// Generate text transform including rotation
const getTextTransform = (textInput: TemplateTextInput, index: number) => {
  const position = getTextPosition(textInput)
  const rotation = props.textRotations[index] ?? textInput.rotation ?? 0

  if (rotation === 0) return ''

  return `rotate(${rotation} ${position.x} ${position.y})`
}

// Get text content for specific input
const getTextContent = (index: number) => {
  return props.texts[index] || props.template.textInputs[index]?.label || 'Text'
}

// Get text color for specific input
const getTextColor = (index: number) => {
  return props.textColors[index] || '#ffffff'
}

// Get text font family for specific input
const getTextFontFamily = (index: number) => {
  const font = props.textFonts[index]
  return font ? getFontFamily(font) : 'Arial, sans-serif'
}

// Get text font size for specific input
const getTextFontSize = (index: number) => {
  return props.textFontSizes[index] || 16
}

// Get text font weight for specific input
const getTextFontWeight = (index: number) => {
  return props.textFontWeights[index] || 400
}

// Get text stroke for specific input
const getTextStroke = (index: number) => {
  const strokeWidth = props.textStrokeWidths[index] || 0
  return strokeWidth > 0 ? props.textStrokeColors[index] || '#000000' : 'none'
}

// Get text stroke width for specific input
const getTextStrokeWidth = (index: number) => {
  return props.textStrokeWidths[index] || 0
}

// Get text stroke linejoin for specific input
const getTextStrokeLinejoin = (index: number) => {
  const strokeWidth = props.textStrokeWidths[index] || 0
  return strokeWidth > 0 ? props.textStrokeLinejoins[index] || 'round' : undefined
}

// Convert template clip path to SVG path
const getClipPathForText = (textInput: TemplateTextInput) => {
  const clipPath = textInput.clipPath

  if (clipPath.startsWith('circle(')) {
    // Parse circle clip path: circle(90px at 100px 100px)
    const match = clipPath.match(/circle\((\d+)px at (\d+)px (\d+)px\)/)
    if (match) {
      const [, r, cx, cy] = match
      const radius = (parseFloat(r) / 100) * Math.min(props.width, props.height) / 2
      const centerX = (parseFloat(cx) / 100) * props.width
      const centerY = (parseFloat(cy) / 100) * props.height

      // Create circle path
      return `M ${centerX - radius} ${centerY}
              A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}
              A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} Z`
    }
  } else if (clipPath.startsWith('rect(')) {
    // Parse rect clip path: rect(20px, 180px, 180px, 20px)
    const match = clipPath.match(/rect\((\d+)px,?\s*(\d+)px,?\s*(\d+)px,?\s*(\d+)px\)/)
    if (match) {
      const [, top, right, bottom, left] = match
      const x1 = (parseFloat(left) / 100) * props.width
      const y1 = (parseFloat(top) / 100) * props.height
      const x2 = (parseFloat(right) / 100) * props.width
      const y2 = (parseFloat(bottom) / 100) * props.height

      return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`
    }
  } else if (clipPath.startsWith('polygon(')) {
    // Parse polygon clip path: polygon(50px 10px, 90px 50px, 50px 90px, 10px 50px)
    const match = clipPath.match(/polygon\(([^)]+)\)/)
    if (match) {
      const points = match[1].split(',').map(point => {
        const [x, y] = point.trim().split(/\s+/)
        const px = (parseFloat(x) / 100) * props.width
        const py = (parseFloat(y) / 100) * props.height
        return `${px} ${py}`
      })

      return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`
    }
  }

  // Fallback: full area
  return `M 0 0 L ${props.width} 0 L ${props.width} ${props.height} L 0 ${props.height} Z`
}

// Export SVG content for downloads
const getSvgContent = () => {
  // Build complete SVG with all shapes and text
  let svgContent = `<svg width="${props.width}" height="${props.height}" viewBox="0 0 ${props.width} ${props.height}" xmlns="http://www.w3.org/2000/svg">\n`

  // Add clip path definitions
  svgContent += '<defs>\n'
  props.template.textInputs.forEach(textInput => {
    svgContent += `  <clipPath id="clip-${textInput.id}">\n`
    svgContent += `    <path d="${getClipPathForText(textInput)}"/>\n`
    svgContent += '  </clipPath>\n'
  })
  svgContent += '</defs>\n'

  // Add shapes
  const sortedShapes = [...props.template.shapes].sort((a, b) => a.zIndex - b.zIndex)

  sortedShapes.forEach(shape => {
    const position = 'x1' in shape.position
      ? shape.position
      : {
          x: (shape.position.x / 100) * props.width,
          y: (shape.position.y / 100) * props.height
        }

    switch (shape.type) {
      case 'circle':
        svgContent += `  <circle cx="${position.x}" cy="${position.y}" r="${shape.width / 2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}"${shape.opacity ? ` opacity="${shape.opacity}"` : ''}/>\n`
        break
      case 'rect':
        svgContent += `  <rect x="${position.x - shape.width / 2}" y="${position.y - shape.height / 2}" width="${shape.width}" height="${shape.height}"${shape.rx ? ` rx="${shape.rx}"` : ''}${shape.ry ? ` ry="${shape.ry}"` : ''} stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}"${shape.opacity ? ` opacity="${shape.opacity}"` : ''}/>\n`
        break
      case 'ellipse':
        svgContent += `  <ellipse cx="${position.x}" cy="${position.y}" rx="${shape.width / 2}" ry="${shape.height / 2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}"${shape.opacity ? ` opacity="${shape.opacity}"` : ''}/>\n`
        break
      case 'polygon':
        if (shape.points) {
          const points = shape.points.split(/[\s,]+/).filter(p => p.trim()).map(p => parseFloat(p))
          const transformedPoints = []
          for (let i = 0; i < points.length; i += 2) {
            if (i + 1 < points.length) {
              transformedPoints.push(`${position.x + points[i]},${position.y + points[i + 1]}`)
            }
          }
          svgContent += `  <polygon points="${transformedPoints.join(' ')}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}"${shape.opacity ? ` opacity="${shape.opacity}"` : ''}/>\n`
        }
        break
      case 'line':
        if ('x1' in shape.position) {
          svgContent += `  <line x1="${shape.position.x1}" y1="${shape.position.y1}" x2="${shape.position.x2}" y2="${shape.position.y2}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}"/>\n`
        }
        break
    }
  })

  // Add text elements
  props.template.textInputs.forEach((textInput, index) => {
    const position = getTextPosition(textInput)
    const rotation = props.textRotations[index] ?? textInput.rotation ?? 0
    const font = props.textFonts[index]
    const fontFamily = font ? getFontFamily(font) : 'Arial, sans-serif'
    const fontSize = props.textFontSizes[index] || 16
    const fontWeight = props.textFontWeights[index] || 400
    const textColor = props.textColors[index] || '#ffffff'
    const strokeWidth = props.textStrokeWidths[index] || 0
    const strokeColor = props.textStrokeColors[index] || '#000000'
    const strokeLinejoin = props.textStrokeLinejoins[index] || 'round'
    const textContent = props.texts[index] || textInput.label || 'Text'

    const strokeAttributes = strokeWidth > 0
      ? ` stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="${strokeLinejoin}"`
      : ''

    const transform = rotation !== 0 ? ` transform="rotate(${rotation} ${position.x} ${position.y})"` : ''

    svgContent += `  <g clip-path="url(#clip-${textInput.id})">\n`
    svgContent += `    <text x="${position.x}" y="${position.y}" text-anchor="middle"${transform} fill="${textColor}"${strokeAttributes} font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" dominant-baseline="middle">${textContent}</text>\n`
    svgContent += '  </g>\n'
  })

  svgContent += '</svg>'
  return svgContent
}

defineExpose({
  getSvgContent
})
</script>

<style scoped>
.template-badge {
  /* Ensure proper rendering */
}
</style>