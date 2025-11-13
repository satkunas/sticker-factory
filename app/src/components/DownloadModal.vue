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
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'
import { AVAILABLE_FONTS } from '../config/fonts'
import { embedWebFonts } from '../utils/font-embedding'
import { generateSvgString } from '../utils/svg-string-generator'
import { useUserSvgStore } from '../stores/userSvgStore'
import { enhanceLayersWithUserSvgs } from '../utils/layer-enhancement'
import { logger } from '../utils/logger'
import { exportAsSvg, exportAsPng, exportAsWebP, exportAsPdf, generateFilename } from '../utils/file-export'

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
const previewSvgUrl = ref('')

/**
 * Generate preview URL when modal opens
 * Always generates blob URL with direct SVG generation
 */
watch(
  () => ({ show: props.show, template: props.template, layers: props.layers }),
  async ({ show, template, layers }) => {
    // Clean up old blob URL
    if (previewSvgUrl.value) {
      URL.revokeObjectURL(previewSvgUrl.value)
    }
    previewSvgUrl.value = ''

    if (!show || !template || !layers) {
      return
    }

    try {
      // Load user SVG store if needed
      const userSvgStore = useUserSvgStore()
      if (!userSvgStore.isLoaded.value) {
        await userSvgStore.loadUserSvgs()
      }

      // Enhance layers with user SVG content (if any)
      const enhancedLayers = enhanceLayersWithUserSvgs(
        layers,
        (id) => userSvgStore.getUserSvgContent(id)
      )

      // Generate SVG directly
      const svgContent = generateSvgString(template, enhancedLayers)

      // Create blob URL for preview
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      previewSvgUrl.value = URL.createObjectURL(blob)
    } catch (error) {
      logger.error('Error generating preview:', error)
    }
  },
  { immediate: true }
)

const formats = [
  { type: 'svg', name: 'SVG', description: 'Vector (scalable)' },
  { type: 'png', name: 'PNG', description: 'Raster image' },
  { type: 'pdf', name: 'PDF', description: 'Vector document' },
  { type: 'webp', name: 'WebP', description: 'Modern raster' }
]

/**
 * Get viewBox dimensions from template
 * Returns dimensions without fallbacks - missing viewBox is a data error
 */
const getViewBoxDimensions = () => {
  return {
    width: props.template?.viewBox?.width,
    height: props.template?.viewBox?.height
  }
}

const pngResolutions = computed(() => {
  const { width, height } = getViewBoxDimensions()

  // If viewBox missing, return empty array (resolution options require valid dimensions)
  if (!width || !height) {
    return []
  }

  return [
    { value: 1, label: '1x', size: `${width}×${height}` },
    { value: 2, label: '2x', size: `${width * 2}×${height * 2}` },
    { value: 4, label: '4x', size: `${width * 4}×${height * 4}` },
    { value: 8, label: '8x', size: `${width * 8}×${height * 8}` }
  ]
})


const getSvgContent = async (embedFonts = false) => {
  if (!props.template || !props.layers) {
    return ''
  }

  try {
    // Load user SVG store if needed
    const userSvgStore = useUserSvgStore()
    if (!userSvgStore.isLoaded.value) {
      await userSvgStore.loadUserSvgs()
    }

    // Enhance layers with user SVG content (if any)
    const enhancedLayers = enhanceLayersWithUserSvgs(
      props.layers,
      (id) => userSvgStore.getUserSvgContent(id)
    )

    // Generate SVG directly
    const svgText = generateSvgString(props.template, enhancedLayers)

    // Parse and process SVG
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgClone = svgDoc.documentElement as unknown as SVGElement

    // Collect unique fonts used in the SVG
    const usedFonts = new Set<string>()
    const textElements = svgClone.querySelectorAll('text')
    textElements.forEach(textEl => {
      const fontFamily = textEl.getAttribute('font-family')
      if (fontFamily) {
        const cleanFontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim()
        usedFonts.add(cleanFontName)
      }
    })

    logger.info('🔍 Font Detection:', {
      usedFonts: Array.from(usedFonts),
      textElementsCount: textElements.length
    })

    // Generate CSS for the fonts
    let fontCSS = ''
    const fontMatches: string[] = []
    const fontMisses: string[] = []

    usedFonts.forEach(fontName => {
      const fontConfig = AVAILABLE_FONTS.find(font =>
        font.family === fontName || font.name === fontName
      )

      if (fontConfig) {
        fontMatches.push(fontName)
        const fontUrl = fontConfig.fontUrl
        if (fontUrl && (fontConfig.source === 'google' || fontConfig.source === 'web')) {
          fontCSS += `@import url('${fontUrl}');\n`
        }

        textElements.forEach(textEl => {
          const currentFont = textEl.getAttribute('font-family')
          if (currentFont && currentFont.includes(fontName)) {
            if (fontConfig.fallback) {
              const fontWithFallback = `${fontName}, ${fontConfig.fallback}`
              textEl.setAttribute('font-family', fontWithFallback)
            }
          }
        })
      } else {
        fontMisses.push(fontName)
      }
    })

    logger.info('🎯 Font Matching:', {
      matched: fontMatches,
      missed: fontMisses,
      fontCssLength: fontCSS.length
    })

    // Add CSS styles to SVG if we have font imports
    if (fontCSS) {
      const existingStyles = svgClone.querySelectorAll('style')
      existingStyles.forEach(style => style.remove())

      logger.info('📝 Font CSS before embedding:', fontCSS.substring(0, 200))

      let finalCSS = fontCSS
      if (embedFonts) {
        try {
          finalCSS = await embedWebFonts(fontCSS)
          logger.info('✅ Font CSS after embedding:', {
            beforeLength: fontCSS.length,
            afterLength: finalCSS.length,
            preview: finalCSS.substring(0, 200)
          })
        } catch (error) {
          logger.error('❌ Font embedding failed:', error)
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
    logger.error('Error generating SVG:', error)
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

const downloadSVG = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for offline/printer use
  if (!svgContent) {
    return
  }

  await exportAsSvg(svgContent, generateFilename(props.template?.name))
}

const downloadPNG = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for PNG
  if (!svgContent) {
    return
  }

  const { width: baseWidth, height: baseHeight } = getViewBoxDimensions()

  // Require valid dimensions for PNG export
  if (!baseWidth || !baseHeight) {
    logger.error('Cannot export PNG: template missing viewBox dimensions')
    return
  }

  const scale = selectedResolution.value
  const width = baseWidth * scale
  const height = baseHeight * scale

  await exportAsPng(svgContent, generateFilename(props.template?.name), width, height)
}

const downloadWebP = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for WebP
  if (!svgContent) {
    return
  }

  const { width: baseWidth, height: baseHeight } = getViewBoxDimensions()

  // Require valid dimensions for WebP export
  if (!baseWidth || !baseHeight) {
    logger.error('Cannot export WebP: template missing viewBox dimensions')
    return
  }

  const scale = selectedResolution.value
  const width = baseWidth * scale
  const height = baseHeight * scale

  await exportAsWebP(svgContent, generateFilename(props.template?.name), width, height)
}

const downloadPDF = async () => {
  const svgContent = await getSvgContent(true) // Enable font embedding for PDF
  if (!svgContent) {
    return
  }

  const baseWidth = props.template?.viewBox?.width
  const baseHeight = props.template?.viewBox?.height

  if (!baseWidth || !baseHeight) {
    logger.error('Cannot export PDF: template missing viewBox dimensions')
    return
  }

  await exportAsPdf(svgContent, generateFilename(props.template?.name), baseWidth, baseHeight)
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