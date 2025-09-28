<template>
  <div v-if="analysis && analysis.severity !== 'none'" :class="warningClasses">
    <div class="flex items-start space-x-3">
      <!-- Warning Icon -->
      <div :class="iconClasses" class="flex-shrink-0 mt-0.5">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            v-if="analysis.severity === 'major'"
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
          <path
            v-else
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Warning Content -->
      <div class="flex-1 min-w-0">
        <div :class="titleClasses" class="text-sm font-medium">
          {{ warningTitle }}
        </div>

        <div class="text-xs text-secondary-600 mt-1">
          {{ warningMessage }}
        </div>

        <!-- Issues List -->
        <div v-if="showDetails && analysis.issues.length > 0" class="mt-2">
          <ul class="text-xs space-y-1">
            <li v-for="issue in analysis.issues" :key="issue" class="flex items-start space-x-1">
              <span class="text-secondary-400 mt-0.5">•</span>
              <span class="text-secondary-600">{{ issue }}</span>
            </li>
          </ul>
        </div>

        <!-- Technical Details Toggle -->
        <button
          v-if="analysis.issues.length > 0"
          class="text-xs text-secondary-500 hover:text-secondary-700 mt-1 underline focus:outline-none"
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'Hide details' : 'Show details' }}
        </button>

        <!-- Centroid vs Bounding Box Comparison -->
        <div v-if="showDetails && centroidAnalysis" class="mt-2 p-2 bg-blue-50 rounded text-xs">
          <div class="font-medium text-blue-700 mb-2">Transform Origin Analysis:</div>
          <div class="grid grid-cols-2 gap-3 text-blue-600">
            <div>
              <div class="font-medium">Bounding Box Center:</div>
              <div>({{ centroidAnalysis.boundingBoxCenter.x.toFixed(1) }}, {{ centroidAnalysis.boundingBoxCenter.y.toFixed(1) }})</div>
            </div>
            <div>
              <div class="font-medium">Visual Centroid:</div>
              <div>({{ centroidAnalysis.centroidCenter.x.toFixed(1) }}, {{ centroidAnalysis.centroidCenter.y.toFixed(1) }})</div>
            </div>
            <div>
              <div class="font-medium">Shape Type:</div>
              <div class="capitalize">{{ centroidAnalysis.shapeType }}</div>
            </div>
            <div>
              <div class="font-medium">Using Centroid:</div>
              <div :class="centroidAnalysis.useCentroid ? 'text-green-600' : 'text-orange-600'">
                {{ centroidAnalysis.useCentroid ? 'Yes' : 'No' }}
                <span v-if="centroidAnalysis.confidence" class="text-blue-500">
                  ({{ Math.round(centroidAnalysis.confidence * 100) }}%)
                </span>
              </div>
            </div>
          </div>

          <div v-if="centroidAnalysis.useCentroid" class="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            ✓ This SVG uses visual centroid for better rotation and scaling behavior
          </div>
          <div v-else class="mt-2 text-xs text-orange-700 bg-orange-50 p-2 rounded">
            ⚠ This SVG uses bounding box center (standard geometric center)
          </div>
        </div>

        <!-- ViewBox Comparison Visualization -->
        <div v-if="showDetails && analysis && svgContent" class="mt-2 p-3 bg-gray-50 rounded text-xs">
          <div class="font-medium text-gray-700 mb-3">ViewBox Comparison:</div>
          <div class="grid grid-cols-2 gap-4">
            <!-- Current ViewBox (Red Border) -->
            <div class="text-center">
              <div class="font-medium text-red-700 mb-2">Current ViewBox</div>
              <div class="bg-white border-2 border-red-500 rounded p-2">
                <svg
                  :width="100"
                  :height="75"
                  :viewBox="currentViewBoxString"
                  class="w-full h-auto"
                >
                  <g v-html="cleanSvgContent"></g>
                </svg>
              </div>
              <div class="text-red-600 mt-1">{{ currentViewBoxString }}</div>
            </div>

            <!-- Recommended ViewBox (Green Border) -->
            <div class="text-center">
              <div class="font-medium text-green-700 mb-2">Recommended ViewBox</div>
              <div class="bg-white border-2 border-green-500 rounded p-2">
                <svg
                  :width="100"
                  :height="75"
                  :viewBox="analysis.recommendedViewBox"
                  class="w-full h-auto"
                >
                  <g v-html="cleanSvgContent"></g>
                </svg>
              </div>
              <div class="text-green-600 mt-1">{{ analysis.recommendedViewBox }}</div>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-600">
            Red border shows current viewBox positioning, green shows recommended centering.
          </div>
        </div>

        <!-- Developer Info (only in development) -->
        <div v-if="showDetails && isDevelopment" class="mt-2 p-2 bg-secondary-50 rounded text-xs">
          <div class="font-medium text-secondary-700 mb-1">Developer Info:</div>
          <div class="space-y-1 text-secondary-600">
            <div>Current viewBox: {{ currentViewBoxString }}</div>
            <div>Recommended: {{ analysis.recommendedViewBox }}</div>
            <div>Offset: ({{ analysis.offset.x.toFixed(2) }}, {{ analysis.offset.y.toFixed(2) }})</div>
          </div>
        </div>
      </div>

      <!-- Dismiss Button -->
      <button
        class="flex-shrink-0 text-secondary-400 hover:text-secondary-600 focus:outline-none"
        aria-label="Dismiss warning"
        @click="$emit('dismiss')"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SvgViewBoxFitAnalysis, SvgCentroid } from '../utils/svg-bounds'

interface Props {
  analysis: SvgViewBoxFitAnalysis | null
  centroidAnalysis?: SvgCentroid | null
  svgContent?: string
}

const props = defineProps<Props>()
defineEmits<{
  dismiss: []
}>()

const showDetails = ref(false)

// Check if we're in development mode
const isDevelopment = computed(() => {
  return import.meta.env.DEV
})

// Warning styling based on severity
const warningClasses = computed(() => {
  if (!props.analysis) return ''

  const base = 'p-3 rounded-lg border'

  switch (props.analysis.severity) {
    case 'major':
      return `${base} bg-red-50 border-red-200`
    case 'minor':
      return `${base} bg-yellow-50 border-yellow-200`
    default:
      return `${base} bg-blue-50 border-blue-200`
  }
})

const iconClasses = computed(() => {
  if (!props.analysis) return ''

  switch (props.analysis.severity) {
    case 'major':
      return 'text-red-500'
    case 'minor':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
})

const titleClasses = computed(() => {
  if (!props.analysis) return ''

  switch (props.analysis.severity) {
    case 'major':
      return 'text-red-800'
    case 'minor':
      return 'text-yellow-800'
    default:
      return 'text-blue-800'
  }
})

const warningTitle = computed(() => {
  if (!props.analysis) return ''

  switch (props.analysis.severity) {
    case 'major':
      return 'SVG Centering Issue'
    case 'minor':
      return 'SVG Positioning Notice'
    default:
      return 'SVG Information'
  }
})

const warningMessage = computed(() => {
  if (!props.analysis) return ''

  // If we have centroid analysis, provide more specific messaging
  if (props.centroidAnalysis) {
    if (props.centroidAnalysis.useCentroid) {
      return 'This SVG uses visual centroid for optimal rotation and scaling around its visual center.'
    } else if (props.centroidAnalysis.shapeType === 'star') {
      return 'This star shape could benefit from centroid-based transforms for better visual rotation.'
    } else if (props.centroidAnalysis.shapeType === 'triangle') {
      return 'This triangular shape could benefit from centroid-based transforms for better balance.'
    } else if (props.centroidAnalysis.shapeType === 'arrow') {
      return 'This arrow shape could benefit from centroid-based transforms for directional accuracy.'
    }
  }

  // Fallback to original viewBox-based messaging
  if (!props.analysis.isCentered) {
    return 'This image may not scale and rotate around its perfect center due to viewBox alignment.'
  }

  if (!props.analysis.isProperlyFitted) {
    return 'This image has viewBox fitting issues that may affect positioning.'
  }

  return 'This image has minor positioning considerations.'
})

const currentViewBoxString = computed(() => {
  if (!props.analysis?.currentViewBox) return 'None'
  const vb = props.analysis.currentViewBox
  return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`
})

// Clean SVG content by removing wrapper elements and extracting just the path/shape content
// Also strips fill colors so SVGs inherit text color for better visibility
const cleanSvgContent = computed(() => {
  if (!props.svgContent) return ''

  try {
    // Parse the SVG content to extract just the inner elements
    const parser = new DOMParser()
    const doc = parser.parseFromString(props.svgContent, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) return props.svgContent

    // Extract all child elements of the SVG (paths, circles, rects, etc.)
    const children = Array.from(svgElement.children)

    return children.map(child => {
      // Clone the element to avoid modifying the original
      const clonedChild = child.cloneNode(true) as globalThis.Element

      // Remove fill attribute so it inherits text color
      clonedChild.removeAttribute('fill')

      // Ensure stroke uses currentColor for visibility
      if (clonedChild.hasAttribute('stroke')) {
        clonedChild.setAttribute('stroke', 'currentColor')
      } else {
        // If no stroke, add one to ensure visibility
        clonedChild.setAttribute('stroke', 'currentColor')
        clonedChild.setAttribute('stroke-width', '1')
        clonedChild.setAttribute('fill', 'none')
      }

      return clonedChild.outerHTML
    }).join('')
  } catch (error) {
    // Fallback to original content if parsing fails
    return props.svgContent
  }
})
</script>