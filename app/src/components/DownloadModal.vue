<template>
  <Modal :show="show" title="Download Badge" @close="$emit('close')">
    <div class="space-y-6">
      <p class="text-sm text-secondary-600">
        Choose your preferred format and options for downloading the badge.
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
            @click="selectedFormat = format.type"
            :class="[
              'p-4 border-2 rounded-lg text-left transition-colors',
              selectedFormat === format.type
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-3 h-3 rounded-full border-2',
                selectedFormat === format.type
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-secondary-300'
              ]"></div>
              <div>
                <div class="font-medium text-secondary-900">{{ format.name }}</div>
                <div class="text-sm text-secondary-500">{{ format.description }}</div>
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
            @click="selectedResolution = resolution.value"
            :class="[
              'p-3 border rounded-lg text-center transition-colors',
              selectedResolution === resolution.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-secondary-200 hover:border-secondary-300'
            ]"
          >
            <div class="font-medium">{{ resolution.label }}</div>
            <div class="text-xs text-secondary-500">{{ resolution.size }}</div>
          </button>
        </div>
      </div>
      
      <!-- Preview -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-3">
          Preview
        </label>
        <div class="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
          <BadgeSvg
            ref="badgeSvgRef"
            :text="badgeText"
            :color="badgeColor"
            :width="200"
            :height="60"
            :font-size="16"
          />
        </div>
      </div>
      
      <!-- Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          @click="viewInNewTab"
          class="btn-secondary flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
          </svg>
          <span>View</span>
        </button>
        
        <button
          @click="copyToClipboard"
          class="btn-secondary flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
          </svg>
          <span>{{ copyButtonText }}</span>
        </button>
        
        <button
          @click="downloadFile"
          class="btn-primary flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end">
        <button @click="$emit('close')" class="btn-secondary">
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import BadgeSvg from './BadgeSvg.vue'
import { jsPDF } from 'jspdf'

interface Props {
  show: boolean
  badgeText: string
  badgeColor: string
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const badgeSvgRef = ref(null)
const selectedFormat = ref('svg')
const selectedResolution = ref(2)
const copyButtonText = ref('Copy')

const formats = [
  { type: 'svg', name: 'SVG', description: 'Vector (scalable)' },
  { type: 'png', name: 'PNG', description: 'Raster image' },
  { type: 'pdf', name: 'PDF', description: 'Vector document' },
  { type: 'webp', name: 'WebP', description: 'Modern raster' }
]

const pngResolutions = [
  { value: 1, label: '1x', size: '200×60' },
  { value: 2, label: '2x', size: '400×120' },
  { value: 4, label: '4x', size: '800×240' },
  { value: 8, label: '8x', size: '1600×480' }
]

const getFileName = () => {
  const timestamp = Date.now()
  const name = props.badgeText.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'badge'
  return `${name}-${timestamp}`
}

const getSvgContent = () => {
  return badgeSvgRef.value?.getSvgContent() || ''
}

const viewInNewTab = () => {
  const svgContent = getSvgContent()
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const copyToClipboard = async () => {
  try {
    const content = selectedFormat.value === 'svg' 
      ? getSvgContent()
      : 'Copy not available for this format'
      
    await navigator.clipboard.writeText(content)
    copyButtonText.value = 'Copied!'
    setTimeout(() => {
      copyButtonText.value = 'Copy'
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
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

const downloadSVG = () => {
  const svgContent = getSvgContent()
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
  const svgContent = getSvgContent()
  const scale = selectedResolution.value
  const width = 200 * scale
  const height = 60 * scale
  
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
  const svgContent = getSvgContent()
  const scale = selectedResolution.value
  const width = 200 * scale
  const height = 60 * scale
  
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

const downloadPDF = () => {
  const svgContent = getSvgContent()
  
  // Create PDF with badge dimensions
  const pdf = new jsPDF({
    unit: 'mm',
    format: [53, 16] // 200px = ~53mm, 60px = ~16mm at 96 DPI
  })
  
  // Add SVG as image to PDF
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 60
  const ctx = canvas.getContext('2d')
  
  const img = new Image()
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 53, 16)
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