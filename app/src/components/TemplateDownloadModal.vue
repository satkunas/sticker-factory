<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Download Image
        </h3>
        <button class="text-gray-400 hover:text-gray-600" @click="$emit('close')">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Preview -->
      <div class="mb-6 flex justify-center p-4 bg-gray-50 rounded-lg">
        <TemplateBadge
          v-if="template"
          ref="templateBadgeRef"
          :template="template"
          :texts="texts"
          :text-colors="textColors"
          :text-fonts="textFonts"
          :text-font-sizes="textFontSizes"
          :text-font-weights="textFontWeights"
          :text-rotations="textRotations"
          :text-stroke-widths="textStrokeWidths"
          :text-stroke-colors="textStrokeColors"
          :text-stroke-linejoins="textStrokeLinejoins"
          :background-color="backgroundColor"
          :width="previewWidth"
          :height="previewHeight"
        />
      </div>

      <!-- Size Options -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="size in sizeOptions"
            :key="size.label"
            class="px-3 py-2 text-sm rounded border transition-colors"
            :class="selectedSize.label === size.label
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
            @click="selectedSize = size"
          >
            {{ size.label }}
            <div class="text-xs opacity-60">
              {{ size.width }}×{{ size.height }}
            </div>
          </button>
        </div>
      </div>

      <!-- Format Options -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="format in formatOptions"
            :key="format"
            class="px-3 py-2 text-sm rounded border transition-colors"
            :class="selectedFormat === format
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
            @click="selectedFormat = format"
          >
            {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Download Button -->
      <button
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        @click="downloadImage"
      >
        Download {{ selectedFormat.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TemplateBadge from './TemplateBadge.vue'
import type { Template } from '../config/templates'
import type { FontConfig } from '../config/fonts'

interface Props {
  show: boolean
  template: Template | null
  texts: string[]
  textColors: string[]
  textFonts: (FontConfig | null)[]
  textFontSizes: number[]
  textFontWeights: number[]
  textRotations: number[]
  textStrokeWidths: number[]
  textStrokeColors: string[]
  textStrokeLinejoins: string[]
  backgroundColor: string
}

const props = defineProps<Props>()

interface Emits {
  close: []
}

defineEmits<Emits>()

// Refs
const templateBadgeRef = ref<InstanceType<typeof TemplateBadge> | null>(null)

// Size options
const sizeOptions = computed(() => {
  if (!props.template) return [{ label: 'Small', width: 200, height: 200 }]

  const base = getSizeForTemplate(props.template)
  return [
    { label: 'Small', width: Math.round(base.width * 0.5), height: Math.round(base.height * 0.5) },
    { label: 'Medium', width: base.width, height: base.height },
    { label: 'Large', width: Math.round(base.width * 1.5), height: Math.round(base.height * 1.5) },
    { label: 'Extra Large', width: Math.round(base.width * 2), height: Math.round(base.height * 2) }
  ]
})

const selectedSize = ref(sizeOptions.value?.[1] || { label: 'Medium', width: 200, height: 200 })

// Format options
const formatOptions = ['svg', 'png', 'jpg']
const selectedFormat = ref('svg')

// Preview size (smaller for modal)
const previewWidth = computed(() => {
  if (!props.template) return 150
  const base = getSizeForTemplate(props.template)
  const scale = Math.min(150 / base.width, 100 / base.height)
  return Math.round(base.width * scale)
})

const previewHeight = computed(() => {
  if (!props.template) return 100
  const base = getSizeForTemplate(props.template)
  const scale = Math.min(150 / base.width, 100 / base.height)
  return Math.round(base.height * scale)
})

// Helper function to get base size for template
function getSizeForTemplate(template: Template) {
  switch (template.category) {
  case 'rectangle':
    return { width: 350, height: 120 }
  case 'square':
    return { width: 200, height: 200 }
  case 'circle':
    return { width: 200, height: 200 }
  case 'diamond':
    return { width: 200, height: 200 }
  default:
    return { width: 200, height: 100 }
  }
}

// Download function
const downloadImage = async () => {
  if (!templateBadgeRef.value || !props.template) return

  try {
    if (selectedFormat.value === 'svg') {
      // Download SVG directly
      const svgContent = templateBadgeRef.value.getSvgContent()

      // Scale SVG to selected size
      const scaledSvgContent = svgContent
        .replace(/width="\d+"/, `width="${selectedSize.value.width}"`)
        .replace(/height="\d+"/, `height="${selectedSize.value.height}"`)
        .replace(/viewBox="[^"]*"/, `viewBox="0 0 ${selectedSize.value.width} ${selectedSize.value.height}"`)

      const blob = new Blob([scaledSvgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `sticker-${props.template.id}-${selectedSize.value.label.toLowerCase()}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      // Convert to PNG/JPG using canvas
      const svgContent = templateBadgeRef.value.getSvgContent()

      // Scale SVG to selected size
      const scaledSvgContent = svgContent
        .replace(/width="\d+"/, `width="${selectedSize.value.width}"`)
        .replace(/height="\d+"/, `height="${selectedSize.value.height}"`)
        .replace(/viewBox="[^"]*"/, `viewBox="0 0 ${selectedSize.value.width} ${selectedSize.value.height}"`)

      const svgBlob = new Blob([scaledSvgContent], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = selectedSize.value.width
        canvas.height = selectedSize.value.height
        const ctx = canvas.getContext('2d')!

        // Fill background for JPG
        if (selectedFormat.value === 'jpg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `sticker-${props.template?.id}-${selectedSize.value.label.toLowerCase()}.${selectedFormat.value}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        }, `image/${selectedFormat.value}`, 0.95)

        URL.revokeObjectURL(svgUrl)
      }
      img.src = svgUrl
    }
  } catch (error) {
    console.error('Download failed:', error)
    alert('Download failed. Please try again.')
  }
}
</script>