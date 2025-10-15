<template>
  <!-- Global Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <h2 class="text-lg font-semibold text-secondary-900 mb-2">Loading Sticker Factory</h2>
      <p class="text-sm text-secondary-600">Loading from URL...</p>
    </div>
  </div>

  <div class="h-screen bg-secondary-50 flex flex-col" @click="closeMenuOnOutsideClick">
    <header class="h-14 bg-white shadow-sm border-b border-secondary-200 flex-shrink-0">
      <div class="flex items-center justify-between px-4 h-full">
        <h1 class="text-lg font-semibold text-secondary-900">
          Sticker Factory
        </h1>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-md z-50 relative transition-colors"
          :class="showMobileMenu ? 'text-primary-600 bg-primary-50' : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'"
          @click.stop="toggleMobileMenu"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        <!-- Desktop menu -->
        <nav class="hidden lg:flex space-x-4">
          <button
            class="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            @click="showDownloadModal = true"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span>Download</span>
          </button>
        </nav>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div v-if="showMobileMenu" class="lg:hidden border-t border-secondary-200 bg-white shadow-lg relative z-40">
        <div class="px-4 py-3 space-y-2">
          <button
            class="w-full flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            @click="showDownloadModal = true; showMobileMenu = false"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    </header>
    <!-- Main Content -->
    <main class="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
      <!-- SVG Viewer Pane (Now on Left) -->
      <div class="flex-1 lg:w-1/2">
        <SvgViewer
          ref="svgViewerRef"
          :template="selectedTemplate"
          :layers="layers"
          containerClasses="h-full"
          @layerClick="handleLayerClick"
        />
      </div>

      <!-- Form Pane (Now on Right with Scrolling) -->
      <div class="flex-1 lg:w-1/2 bg-white border-t lg:border-t-0 lg:border-l border-secondary-200 flex flex-col min-h-0">

        <!-- Scrollable Form Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <!-- Template Selector -->
            <TemplateSelector
              :selectedTemplate="selectedTemplate"
              @update:selectedTemplate="handleTemplateSelection"
            />

            <!-- Dynamic Form Elements using Unified Layers -->
            <div v-if="selectedTemplate && layersForRendering.length > 0" class="space-y-4">
              <div v-for="layer in layersForRendering" :key="layer.id" class="space-y-2">
                <!-- Add FormLabel for text inputs -->
                <FormLabel
                  v-if="layer.type === 'text'"
                  :text="getTextInputLabel(selectedTemplate, layer.id)"
                />

                <!-- Dynamic Component Rendering -->
                <component
                  :is="components[layer.component as keyof typeof components]"
                  v-bind="getLayerProps(layer)"
                  v-on="getLayerEvents(layer)"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <DownloadModal
      :show="showDownloadModal"
      :template="selectedTemplate"
      :layers="layers"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide, defineAsyncComponent, nextTick } from 'vue'
import {
  isLoadingFromUrl,
  selectedTemplate as storeSelectedTemplate,
  flatFormData,
  updateTemplate,
  updateLayer
} from './stores/urlDrivenStore'
import { logger } from './utils/logger'
import { encodeTemplateStateCompact, decodeTemplateStateCompact } from './utils/url-encoding'
const DownloadModal = defineAsyncComponent(() => import('./components/DownloadModal.vue'))
import TemplateSelector from './components/TemplateSelector.vue'
import SvgViewer from './components/SvgViewer.vue'
import LayerTextEditor from './components/LayerTextEditor.vue'
import LayerShapeEditor from './components/LayerShapeEditor.vue'
import LayerSvgImageEditor from './components/LayerSvgImageEditor.vue'
import FormLabel from './components/FormLabel.vue'
import type { SimpleTemplate } from './types/template-types'
import { useTemplateHelpers } from './composables/useTemplateHelpers'

// Register components for dynamic use
const components = {
  LayerTextEditor,
  LayerShapeEditor,
  LayerSvgImageEditor
}



// Template helpers
const {
  getTextInputLabel,
  getTextInputPlaceholder,
  getShapeLabel,
  getShapeDimensions,
  getShapeData,
  getShapePath,
  getSvgImageDisplayName,
  getSvgImageDimensions
} = useTemplateHelpers()

// FLAT ARCHITECTURE: Get SVG analysis from render data
const getRenderDataSvgAnalysis = (layerId: string) => {
  const renderLayer = layers.value.find(layer => layer.id === layerId)
  return (renderLayer as any)?.svgAnalysis || null
}

const getRenderDataCentroidAnalysis = (layerId: string) => {
  const renderLayer = layers.value.find(layer => layer.id === layerId)
  return (renderLayer as any)?.centroidAnalysis || null
}

// Unified dropdown management system
const expandedDropdowns = ref(new Set<string>())

const dropdownManager = {
  isExpanded: (id: string) => expandedDropdowns.value.has(id),

  toggle: (id: string) => {
    const wasExpanded = expandedDropdowns.value.has(id)

    if (wasExpanded) {
      expandedDropdowns.value.delete(id)
    } else {
      // Close all other dropdowns
      expandedDropdowns.value.clear()
      // Open this dropdown
      expandedDropdowns.value.add(id)

      // Wait for BOTH collapse and expansion animations to complete before scrolling
      // Both animations are 300ms and run simultaneously
      // Wait 400ms to ensure both have fully completed and layout has settled
      nextTick(() => {
        setTimeout(() => {
          const element = document.querySelector(`[data-instance-id="${id}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 400)
      })
    }
  },

  close: (id: string) => {
    expandedDropdowns.value.delete(id)
  },

  closeAll: () => {
    expandedDropdowns.value.clear()
  }
}

provide('dropdownManager', dropdownManager)

// Legacy provides for backward compatibility
const expandedFontSelectors = ref(new Set<string>())
provide('expandedFontSelectors', expandedFontSelectors)

const expandedObjectSelectors = ref(new Set<string>())
provide('expandedObjectSelectors', expandedObjectSelectors)

// Use loading state from URL-driven store
const isLoading = isLoadingFromUrl

// Mobile menu
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMenuOnOutsideClick = (event: Event) => {
  // Only close if clicking outside the header area
  const target = event.target as HTMLElement
  const header = target.closest('header')
  if (!header && showMobileMenu.value) {
    showMobileMenu.value = false
  }
}

// Use URL-driven store directly
const selectedTemplate = storeSelectedTemplate

// Modal states
const showDownloadModal = ref(false)

// Use flat form data for Svg.vue component (FlatLayerData[])
const layers = computed(() => flatFormData.value)

// Component mapping for dynamic rendering
const componentMap = {
  text: 'LayerTextEditor',
  shape: 'LayerShapeEditor',
  svgImage: 'LayerSvgImageEditor'
}

// FLAT ARCHITECTURE: Clean layers for form rendering using flat data
const layersForRendering = computed(() => {
  if (!selectedTemplate.value?.layers || flatFormData.value.length === 0) {
    return []
  }

  return selectedTemplate.value.layers.map((templateLayer) => {
    // Get flat form data from store
    const flatLayer = flatFormData.value.find(l => l.id === templateLayer.id)

    if (!flatLayer) {
      logger.warn(`Missing flat layer data for template layer ${templateLayer.id}:${templateLayer.type}`)
      return null
    }

    return {
      id: templateLayer.id,
      type: templateLayer.type,
      component: componentMap[templateLayer.type],
      // Store provides flat merged data - direct property access
      flatLayer: flatLayer
    }
  }).filter((layer): layer is NonNullable<typeof layer> => layer !== null) // Remove null entries with type guard
})


// FLAT ARCHITECTURE: Pure prop mapping with flat data access
const getLayerProps = (layer: any) => {
  const { flatLayer } = layer

  switch (layer.type) {
    case 'text':
      return {
        // Direct flat property access - no nested objects
        modelValue: flatLayer.text,
        placeholder: getTextInputPlaceholder(selectedTemplate.value, layer.id),
        selectedFont: flatLayer.font,
        fontSize: flatLayer.fontSize,
        fontWeight: flatLayer.fontWeight,
        textColor: flatLayer.fontColor,
        textStrokeColor: flatLayer.strokeColor,
        textStrokeWidth: flatLayer.strokeWidth,
        textStrokeLinejoin: flatLayer.strokeLinejoin,
        strokeOpacity: flatLayer.strokeOpacity,
        // TextPath properties for curved text
        textPath: flatLayer.textPath,
        startOffset: flatLayer.startOffset,
        dy: flatLayer.dy,
        dominantBaseline: flatLayer.dominantBaseline,
        instanceId: layer.id
      }
    case 'shape':
      return {
        shapeLabel: getShapeLabel(selectedTemplate.value, layer.id),
        shapeDimensions: getShapeDimensions(selectedTemplate.value, layer.id),
        shapeData: getShapeData(selectedTemplate.value, layer.id),
        shapePath: getShapePath(selectedTemplate.value, layer.id),
        fillColor: flatLayer.fillColor,
        strokeColor: flatLayer.strokeColor,
        strokeWidth: flatLayer.strokeWidth,
        strokeLinejoin: flatLayer.strokeLinejoin,
        instanceId: `shape-${layer.id}`
      }
    case 'svgImage':
      return {
        imageLabel: getSvgImageDisplayName(selectedTemplate.value, layer.id, flatLayer.svgImageId),
        imageDimensions: getSvgImageDimensions(selectedTemplate.value, layer.id),
        svgContent: flatLayer.svgContent,
        svgId: flatLayer.svgImageId,
        color: flatLayer.color,
        strokeColor: flatLayer.strokeColor,
        strokeWidth: flatLayer.strokeWidth,
        strokeLinejoin: flatLayer.strokeLinejoin,
        rotation: flatLayer.rotation,
        scale: flatLayer.scale,
        instanceId: `svgImage-${layer.id}`,
        svgAnalysis: getRenderDataSvgAnalysis(layer.id),
        centroidAnalysis: getRenderDataCentroidAnalysis(layer.id)
      }
    default:
      return {}
  }
}

// FLAT ARCHITECTURE: Event mapping for flat property names
const eventMappings = {
  text: {
    'update:modelValue': 'text',
    'update:selectedFont': 'font',
    'update:fontSize': 'fontSize',
    'update:fontWeight': 'fontWeight',
    'update:textColor': 'fontColor',
    'update:textStrokeColor': 'strokeColor',
    'update:textStrokeWidth': 'strokeWidth',
    'update:textStrokeLinejoin': 'strokeLinejoin',
    // TextPath event mappings
    'update:startOffset': 'startOffset',
    'update:dy': 'dy',
    'update:dominantBaseline': 'dominantBaseline'
  },
  shape: {
    'update:fillColor': 'fillColor',
    'update:strokeColor': 'strokeColor',
    'update:strokeWidth': 'strokeWidth',
    'update:strokeLinejoin': 'strokeLinejoin'
  },
  svgImage: {
    'update:svgContent': 'svgContent',
    'update:svgId': 'svgImageId',
    'update:color': 'color',
    'update:strokeColor': 'strokeColor',
    'update:strokeWidth': 'strokeWidth',
    'update:strokeLinejoin': 'strokeLinejoin',
    'update:rotation': 'rotation',
    'update:scale': 'scale'
  }
} as const

// Pure event mapper - no conditional logic
const getLayerEvents = (layer: any) => {
  const mapping = eventMappings[layer.type as keyof typeof eventMappings]
  if (!mapping) return {}

  // Generate event handlers from mapping configuration
  return Object.fromEntries(
    Object.entries(mapping).map(([eventName, storeProperty]) => [
      eventName,
      (value: any) => updateLayer(layer.id, { [storeProperty]: value })
    ])
  )
}

// SVG viewer ref
const svgViewerRef = ref(null)

// SVG dimensions - make it more square and appropriately sized
// const svgWidth = computed(() => 400)
// const svgHeight = computed(() => 300)

/**
 * Encoding consistency validation
 * Detects when browser has stale cached url-encoding module
 */
function validateEncodingConsistency(): boolean {
  const testState = {
    selectedTemplateId: 'test-validation',
    layers: [],
    lastModified: Date.now()
  }

  try {
    // Roundtrip encode/decode test
    const encoded = encodeTemplateStateCompact(testState)
    const decoded = decodeTemplateStateCompact(encoded)

    // Verify roundtrip succeeded
    const isValid = decoded?.selectedTemplateId === 'test-validation'

    if (!isValid) {
      logger.error('🚨 ENCODING VALIDATION FAILED')
      logger.error('Browser cache is stale. Please:')
      logger.error('1. Clear site data (DevTools → Application → Storage → Clear site data)')
      logger.error('2. Hard refresh (Ctrl+Shift+R)')

      // Block app initialization with user-visible message
      /* eslint-disable-next-line no-undef */
      alert(
        '⚠️ Application cache is stale.\n\n' +
        'The app cannot load properly because your browser has cached outdated code.\n\n' +
        'To fix this:\n' +
        '1. Open DevTools (F12)\n' +
        '2. Go to Application → Storage\n' +
        '3. Click "Clear site data"\n' +
        '4. Hard refresh (Ctrl+Shift+R)\n\n' +
        'If this message persists, please contact support.'
      )

      return false
    }

    logger.info('✅ Encoding validation passed')
    return true

  } catch (error) {
    logger.error('Encoding validation error:', error)

    /* eslint-disable-next-line no-undef */
    alert(
      '⚠️ Application initialization failed.\n\n' +
      'Please clear your browser cache and reload:\n' +
      '1. Open DevTools (F12)\n' +
      '2. Application → Storage → Clear site data\n' +
      '3. Hard refresh (Ctrl+Shift+R)'
    )

    return false
  }
}

// Simplified initialization - URL-driven store handles everything
onMounted(async () => {
  try {
    // CRITICAL: Validate encoding consistency BEFORE any other initialization
    if (!validateEncodingConsistency()) {
      // Validation failed - block initialization
      logger.error('App initialization blocked due to encoding validation failure')
      return  // Do not proceed with initialization
    }

    // Start background tasks that don't affect initial loading
    const fontPromise = import('./config/fonts').then(({ preloadPopularFonts }) => {
      return preloadPopularFonts().catch(error => {
        logger.warn('Font preloading failed:', error)
      })
    })

    const svgStorePromise = import('./stores/svg-store').then(async ({ useSvgStore }) => {
      const svgStore = useSvgStore()
      await svgStore.loadSvgLibraryStore()
    })

    // URL-driven store handles all URL decoding, template loading, and state initialization
    // No manual intervention needed - everything is reactive and automatic

    // Wait for background tasks
    await Promise.all([fontPromise, svgStorePromise])
    logger.info('Application initialized successfully')

  } catch (error) {
    logger.error('Failed to initialize application:', error)
  }
})

// Template selection using URL-driven store
const handleTemplateSelection = async (template: SimpleTemplate) => {
  logger.debug('🎯 handleTemplateSelection called with template:', template.id)
  await updateTemplate(template.id)
}

// Handle layer click from SVG to expand corresponding form element
const handleLayerClick = (layerId: string) => {
  logger.debug('Layer clicked:', layerId)

  // Find the layer type from the template to construct the correct instanceId
  const templateLayer = selectedTemplate.value?.layers.find(l => l.id === layerId)
  if (!templateLayer) {
    logger.warn('Layer not found in template:', layerId)
    return
  }

  // Construct instanceId based on layer type (matching getLayerProps logic)
  let instanceId: string
  switch (templateLayer.type) {
    case 'text':
      instanceId = layerId
      break
    case 'shape':
      instanceId = `shape-${layerId}`
      break
    case 'svgImage':
      instanceId = `svgImage-${layerId}`
      break
    default:
      logger.warn('Unknown layer type:', templateLayer.type)
      return
  }

  // Toggle the dropdown (scroll-to-view is handled automatically by dropdownManager)
  dropdownManager.toggle(instanceId)
}


</script>