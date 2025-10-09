<template>
  <Modal :show="show" title="Download Image" @close="$emit('close')">
    <div class="space-y-6">
      <!-- Preview -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-3">
          Preview
        </label>
        <div class="h-48 bg-secondary-50 rounded-lg border border-secondary-200 flex items-center justify-center p-4">
          <img
            v-if="template && previewSvgUrl"
            :src="previewSvgUrl"
            :alt="`${template.name} preview`"
            class="max-w-full max-h-full object-contain drop-shadow-sm"
          />
        </div>
      </div>

      <p class="text-sm text-secondary-600">
        Choose your preferred format and options for downloading the image.
      </p>

      <!-- Format Selection -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-3">
          Format
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="format in formats"
            :key="format.type"
            :class="[
              'p-4 border-2 rounded-lg text-left transition-colors',
              selectedFormat === format.type
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            ]"
            @click="selectedFormat = format.type"
          >
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'w-3 h-3 rounded-full border-2',
                  selectedFormat === format.type
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-secondary-300'
                ]"
              />
              <div>
                <div class="font-medium text-secondary-900">
                  {{ format.name }}
                </div>
                <div class="text-sm text-secondary-500">
                  {{ format.description }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- PNG Resolution Options -->
      <div v-if="selectedFormat === 'png'">
        <label class="block text-sm font-medium text-secondary-700 mb-3">
          Resolution
        </label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="resolution in pngResolutions"
            :key="resolution.value"
            :class="[
              'p-3 border rounded-lg text-center transition-colors',
              selectedResolution === resolution.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-secondary-200 hover:border-secondary-300'
            ]"
            @click="selectedResolution = resolution.value"
          >
            <div class="font-medium">
              {{ resolution.label }}
            </div>
            <div class="text-xs text-secondary-500">
              {{ resolution.size }}
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <!-- Action buttons -->
      <div class="grid gap-3" :class="selectedFormat === 'svg' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'">
        <button
          v-if="selectedFormat === 'svg'"
          class="btn-secondary flex items-center justify-center space-x-2"
          @click="viewInNewTab"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          <span>View</span>
        </button>

        <button
          v-if="selectedFormat === 'svg'"
          class="btn-secondary flex items-center justify-center space-x-2"
          @click="copyToClipboard"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          <span>{{ copyButtonText }}</span>
        </button>

        <button
          class="btn-primary flex items-center justify-center space-x-2"
          @click="downloadFile"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import { jsPDF } from 'jspdf'
import type { SimpleTemplate, FlatLayerData, AppState } from '../types/template-types'
import { AVAILABLE_FONTS } from '../config/fonts'
import { embedWebFonts } from '../utils/fontEmbedding'
import { encodeTemplateStateCompact } from '../utils/url-encoding'

interface Props {
  show: boolean
  template?: SimpleTemplate | null
  layers?: FlatLayerData[]
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const selectedFormat = ref('svg')
const selectedResolution = ref(2)
const copyButtonText = ref('Copy')

// Generate .svg URL for preview
const previewSvgUrl = computed(() => {
  if (!props.template || !props.layers) {
    return ''
  }

  const state: AppState = {
    selectedTemplateId: props.template.id,
    layers: props.layers,
    lastModified: Date.now()
  }

  const encoded = encodeTemplateStateCompact(state)
  return `/${encoded}.svg`
})

const formats = [
  { type: 'svg', name: 'SVG', description: 'Vector (scalable)' },
  { type: 'png', name: 'PNG', description: 'Raster image' },
  { type: 'pdf', name: 'PDF', description: 'Vector document' },
  { type: 'webp', name: 'WebP', description: 'Modern raster' }
]

const pngResolutions = computed(() => {
  const baseWidth = props.template?.viewBox?.width || 200
  const baseHeight = props.template?.viewBox?.height || 60

  return [
    { value: 1, label: '1x', size: `${baseWidth}×${baseHeight}` },
    { value: 2, label: '2x', size: `${baseWidth * 2}×${baseHeight * 2}` },
    { value: 4, label: '4x', size: `${baseWidth * 4}×${baseHeight * 4}` },
    { value: 8, label: '8x', size: `${baseWidth * 8}×${baseHeight * 8}` }
  ]
})

const getFileName = () => {
  const timestamp = Date.now()
  const templateName = props.template?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'sticker'
  return `${templateName}-${timestamp}`
}

const getSvgContent = async (embedFonts = false) => {
  // Fetch SVG content from .svg URL (uses same rendering logic as preview)
  if (!previewSvgUrl.value) {
    return ''
  }

  try {
    // Fetch the SVG content from the Service Worker / middleware
    const response = await fetch(previewSvgUrl.value)
    if (!response.ok) {
      return ''
    }

    const svgText = await response.text()

    // Parse the SVG to process it
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgClone = svgDoc.documentElement as unknown as SVGElement

    // Collect unique fonts used in the SVG
    const usedFonts = new Set<string>()
    const textElements = svgClone.querySelectorAll('text')
    textElements.forEach(textEl => {
      const fontFamily = textEl.getAttribute('font-family')
      if (fontFamily) {
        // Clean up font family name (remove quotes and fallbacks)
        const cleanFontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim()
        usedFonts.add(cleanFontName)
      }
    })

    // Generate CSS for the fonts
    let fontCSS = ''
    usedFonts.forEach(fontName => {
      // Find the font config from available fonts
      const fontConfig = AVAILABLE_FONTS.find(font =>
        font.family === fontName || font.name === fontName
      )

      if (fontConfig) {
        // For web fonts (Google Fonts, etc.), include the font definition
        const fontUrl = fontConfig.fontUrl
        if (fontUrl && (fontConfig.source === 'google' || fontConfig.source === 'web')) {
          fontCSS += `@import url('${fontUrl}');\n`
        }

        // Keep the original font name and add fallbacks
        textElements.forEach(textEl => {
          const currentFont = textEl.getAttribute('font-family')
          if (currentFont && currentFont.includes(fontName)) {
            // Preserve the original font but ensure fallback is included
            if (fontConfig.fallback) {
              const fontWithFallback = `${fontName}, ${fontConfig.fallback}`
              textEl.setAttribute('font-family', fontWithFallback)
            }
          }
        })
      } else {
        // For unknown fonts, provide basic fallbacks
        const fallback = fontName === 'Arial' ? 'Arial, sans-serif' :
                        fontName === 'Times' ? 'Times, serif' :
                        fontName === 'Courier' ? 'Courier, monospace' :
                        fontName.includes('serif') ? `${fontName}, serif` :
                        fontName.includes('mono') ? `${fontName}, monospace` :
                        `${fontName}, sans-serif`

        textElements.forEach(textEl => {
          const currentFont = textEl.getAttribute('font-family')
          if (currentFont && currentFont.includes(fontName)) {
            textEl.setAttribute('font-family', fallback)
          }
        })
      }
    })

    // Add CSS styles to SVG if we have font imports
    if (fontCSS) {
      // Remove existing style elements (from Service Worker) to avoid duplicate @import statements
      const existingStyles = svgClone.querySelectorAll('style')
      existingStyles.forEach(style => style.remove())

      // If font embedding is requested, convert @import to embedded @font-face
      let finalCSS = fontCSS
      if (embedFonts) {
        try {
          finalCSS = await embedWebFonts(fontCSS)
        } catch (error) {
          // Keep original CSS as fallback
        }
      }

      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      styleElement.textContent = finalCSS
      svgClone.insertBefore(styleElement, svgClone.firstChild)
    }

    // Create clean SVG string with proper XML declaration
    const svgString = new XMLSerializer().serializeToString(svgClone)
    return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`
  } catch (error) {
    return ''
  }
}

const viewInNewTab = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for offline viewing
  if (!svgContent) {
    return
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const copyToClipboard = async () => {
  try {
    const content = selectedFormat.value === 'svg'
      ? await getSvgContent(true) // Enable font embedding for offline use
      : 'Copy not available for this format'
      
    await navigator.clipboard.writeText(content)
    copyButtonText.value = 'Copied!'
    setTimeout(() => {
      copyButtonText.value = 'Copy'
    }, 2000)
  } catch {
    // Ignore copy errors
  }
}

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

const svgToCanvas = (svgContent, width, height) => {
  return new Promise((resolve) => {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    
    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    
    img.src = url
  })
}

const downloadSVG = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for offline/printer use
  if (!svgContent) {
    return
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${getFileName()}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadPNG = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for PNG
  if (!svgContent) {
    return
  }

  const scale = selectedResolution.value
  // Use actual template dimensions instead of hardcoded values
  const baseWidth = props.template?.viewBox?.width || 200
  const baseHeight = props.template?.viewBox?.height || 60
  const width = baseWidth * scale
  const height = baseHeight * scale

  const canvas = await svgToCanvas(svgContent, width, height)
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${getFileName()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 'image/png')
}

const downloadWebP = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for WebP
  if (!svgContent) {
    return
  }

  const scale = selectedResolution.value
  // Use actual template dimensions instead of hardcoded values
  const baseWidth = props.template?.viewBox?.width || 200
  const baseHeight = props.template?.viewBox?.height || 60
  const width = baseWidth * scale
  const height = baseHeight * scale

  const canvas = await svgToCanvas(svgContent, width, height)
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${getFileName()}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 'image/webp')
}

const downloadPDF = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for PDF
  if (!svgContent) {
    return
  }

  const baseWidth = props.template?.viewBox?.width
  const baseHeight = props.template?.viewBox?.height

  if (!baseWidth || !baseHeight) {
    return
  }

  // Create PDF with actual badge dimensions (convert px to mm at 96 DPI)
  const widthMm = (baseWidth * 25.4) / 96
  const heightMm = (baseHeight * 25.4) / 96

  const pdf = new jsPDF({
    unit: 'mm',
    format: [widthMm, heightMm]
  })

  // Add SVG as image to PDF
  const canvas = document.createElement('canvas')
  canvas.width = baseWidth
  canvas.height = baseHeight
  const ctx = canvas.getContext('2d')
  
  const img = new Image()
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm)
    pdf.save(`${getFileName()}.pdf`)
    URL.revokeObjectURL(url)
  }
  
  img.src = url
}

const downloadFile = () => {
  switch (selectedFormat.value) {
  case 'svg':
    downloadSVG()
    break
  case 'png':
    downloadPNG()
    break
  case 'webp':
    downloadWebP()
    break
  case 'pdf':
    downloadPDF()
    break
  }
}
</script>