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
          <button class="text-sm text-secondary-600 hover:text-secondary-900" @click="showExportModal = true">
            Export
          </button>
          <button class="text-sm text-secondary-600 hover:text-secondary-900" @click="showImportModal = true">
            Import
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
          <button
            class="w-full text-left px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors"
            @click="showExportModal = true; showMobileMenu = false"
          >
            Export
          </button>
          <button
            class="w-full text-left px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors"
            @click="showImportModal = true; showMobileMenu = false"
          >
            Import
          </button>
        </div>
      </div>
    </header>
    <!-- Main Content -->
    <main class="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
      <!-- SVG Viewer Pane (Now on Left) -->
      <div class="flex-shrink-0 h-64 lg:h-auto lg:w-1/2">
        <SvgViewer
          ref="svgViewerRef"
          :template="selectedTemplate"
          :layers="layers"
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
    <ExportModal
      :show="showExportModal"
      @close="showExportModal = false"
    />

    <ImportModal
      :show="showImportModal"
      @close="showImportModal = false"
    />

    <DownloadModal
      :show="showDownloadModal"
      :template="selectedTemplate"
      :layers="layers"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { ref, computed, onMounted, provide, defineAsyncComponent } from 'vue'
import {
  isLoadingFromUrl,
  selectedTemplate as storeSelectedTemplate,
  formData,
  computedRenderData,
  updateTemplate,
  updateLayer
} from './stores/urlDrivenStore'
import { logger } from './utils/logger'
const ExportModal = defineAsyncComponent(() => import('./components/ExportModal.vue'))
const ImportModal = defineAsyncComponent(() => import('./components/ImportModal.vue'))
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

// Unified dropdown management system
const expandedDropdowns = ref(new Set<string>())

const dropdownManager = {
  isExpanded: (id: string) => expandedDropdowns.value.has(id),

  toggle: (id: string) => {
    if (expandedDropdowns.value.has(id)) {
      expandedDropdowns.value.delete(id)
    } else {
      // Close all other dropdowns
      expandedDropdowns.value.clear()
      // Open this dropdown
      expandedDropdowns.value.add(id)
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
const showExportModal = ref(false)
const showImportModal = ref(false)
const showDownloadModal = ref(false)

// Use computed render data from URL-driven store (maintain reactivity)
const layers = computed(() => computedRenderData.value)

// Component mapping for dynamic rendering
const componentMap = {
  text: 'LayerTextEditor',
  shape: 'LayerShapeEditor',
  svgImage: 'LayerSvgImageEditor'
}

// Simplified layers for form rendering using store form data
const layersForRendering = computed(() => {
  if (!selectedTemplate.value?.layers || formData.value.length === 0) {
    return []
  }

  return selectedTemplate.value.layers.map((templateLayer) => {
    // Find the corresponding form layer from store
    const formLayer = formData.value.find(l => l.id === templateLayer.id && l.type === templateLayer.type)

    if (!formLayer) {
      console.warn(`Missing form layer for template layer ${templateLayer.id}:${templateLayer.type}`)
      return null
    }

    return {
      id: templateLayer.id,
      type: templateLayer.type,
      templateData: templateLayer,
      stateData: formLayer,
      component: componentMap[templateLayer.type]
    }
  }).filter(Boolean) // Remove null entries
})


// Helper functions for dynamic component props and events
const getLayerProps = (layer: any) => {
  if (!layer.stateData) return {}

  switch (layer.type) {
    case 'text':
      return {
        modelValue: layer.stateData.text !== undefined ? layer.stateData.text : (layer.templateData?.textInput?.default || ''),
        placeholder: getTextInputPlaceholder(selectedTemplate.value, layer.id),
        selectedFont: layer.stateData.font,
        fontSize: layer.stateData.fontSize !== undefined ? layer.stateData.fontSize : layer.templateData?.textInput?.fontSize,
        fontWeight: layer.stateData.fontWeight !== undefined ? layer.stateData.fontWeight : layer.templateData?.textInput?.fontWeight,
        textColor: layer.stateData.textColor !== undefined ? layer.stateData.textColor : layer.templateData?.textInput?.fontColor,
        textStrokeColor: layer.stateData.strokeColor !== undefined ? layer.stateData.strokeColor : layer.templateData?.textInput?.strokeColor,
        textStrokeWidth: layer.stateData.strokeWidth !== undefined ? layer.stateData.strokeWidth : layer.templateData?.textInput?.strokeWidth,
        textStrokeLinejoin: layer.stateData.strokeLinejoin !== undefined ? layer.stateData.strokeLinejoin : layer.templateData?.textInput?.strokeLinejoin,
        strokeOpacity: layer.stateData.strokeOpacity !== undefined ? layer.stateData.strokeOpacity : layer.templateData?.textInput?.strokeOpacity,
        instanceId: layer.id
      }
    case 'shape':
      return {
        shapeLabel: getShapeLabel(selectedTemplate.value, layer.id),
        shapeDimensions: getShapeDimensions(selectedTemplate.value, layer.id),
        shapeData: getShapeData(selectedTemplate.value, layer.id),
        shapePath: getShapePath(selectedTemplate.value, layer.id),
        fillColor: layer.stateData.fillColor !== undefined ? layer.stateData.fillColor : layer.templateData?.shape?.fill,
        strokeColor: layer.stateData.strokeColor !== undefined ? layer.stateData.strokeColor : layer.templateData?.shape?.stroke,
        strokeWidth: layer.stateData.strokeWidth !== undefined ? layer.stateData.strokeWidth : layer.templateData?.shape?.strokeWidth,
        strokeLinejoin: layer.stateData.strokeLinejoin !== undefined ? layer.stateData.strokeLinejoin : layer.templateData?.shape?.strokeLinejoin,
        instanceId: `shape-${layer.id}`
      }
    case 'svgImage':
      return {
        imageLabel: getSvgImageDisplayName(selectedTemplate.value, layer.id),
        imageDimensions: getSvgImageDimensions(selectedTemplate.value, layer.id),
        svgContent: layer.stateData.svgContent !== undefined ? layer.stateData.svgContent : (layer.templateData?.svgImage?.svgContent || ''),
        svgId: layer.stateData.svgImageId !== undefined ? layer.stateData.svgImageId : (layer.templateData?.svgImage?.id || ''),
        color: layer.stateData.color !== undefined ? layer.stateData.color : layer.templateData?.svgImage?.fill,
        strokeColor: layer.stateData.strokeColor !== undefined ? layer.stateData.strokeColor : layer.templateData?.svgImage?.stroke,
        strokeWidth: layer.stateData.strokeWidth !== undefined ? layer.stateData.strokeWidth : layer.templateData?.svgImage?.strokeWidth,
        strokeLinejoin: layer.stateData.strokeLinejoin !== undefined ? layer.stateData.strokeLinejoin : layer.templateData?.svgImage?.strokeLinejoin,
        rotation: layer.stateData.rotation !== undefined ? layer.stateData.rotation : (layer.templateData?.rotation || 0),
        scale: layer.stateData.scale !== undefined ? layer.stateData.scale : (layer.templateData?.scale || 1.0),
        instanceId: `svgImage-${layer.id}`
      }
    default:
      return {}
  }
}

const getLayerEvents = (layer: any) => {
  switch (layer.type) {
    case 'text':
      return {
        'update:modelValue': (value: string) => updateLayer(layer.id, { text: value }),
        'update:selectedFont': (value: any) => updateLayer(layer.id, { font: value }),
        'update:fontSize': (value: number) => updateLayer(layer.id, { fontSize: value }),
        'update:fontWeight': (value: number) => updateLayer(layer.id, { fontWeight: value }),
        'update:textColor': (value: string) => updateLayer(layer.id, { textColor: value }),
        'update:textStrokeColor': (value: string) => updateLayer(layer.id, { strokeColor: value }),
        'update:textStrokeWidth': (value: number) => updateLayer(layer.id, { strokeWidth: value }),
        'update:textStrokeLinejoin': (value: string) => updateLayer(layer.id, { strokeLinejoin: value })
      }
    case 'shape':
      return {
        'update:fillColor': (value: string) => updateLayer(layer.id, { fillColor: value }),
        'update:strokeColor': (value: string) => updateLayer(layer.id, { strokeColor: value }),
        'update:strokeWidth': (value: number) => updateLayer(layer.id, { strokeWidth: value }),
        'update:strokeLinejoin': (value: string) => updateLayer(layer.id, { strokeLinejoin: value })
      }
    case 'svgImage':
      return {
        'update:svgContent': (value: string) => updateLayer(layer.id, { svgContent: value }),
        'update:svgId': (value: string) => updateLayer(layer.id, { svgImageId: value }),
        'update:color': (value: string) => updateLayer(layer.id, { color: value }),
        'update:strokeColor': (value: string) => updateLayer(layer.id, { strokeColor: value }),
        'update:strokeWidth': (value: number) => updateLayer(layer.id, { strokeWidth: value }),
        'update:strokeLinejoin': (value: string) => updateLayer(layer.id, { strokeLinejoin: value }),
        'update:rotation': (value: number) => updateLayer(layer.id, { rotation: value }),
        'update:scale': (value: number) => updateLayer(layer.id, { scale: value })
      }
    default:
      return {}
  }
}

// SVG viewer ref
const svgViewerRef = ref(null)

// SVG dimensions - make it more square and appropriately sized
// const svgWidth = computed(() => 400)
// const svgHeight = computed(() => 300)

// Simplified initialization - URL-driven store handles everything
onMounted(async () => {
  try {
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
  console.log('🎯 handleTemplateSelection called with template:', template.id)
  await updateTemplate(template.id)
}


</script>