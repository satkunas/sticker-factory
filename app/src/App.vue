<template>
  <!-- Global Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <h2 class="text-lg font-semibold text-secondary-900 mb-2">Loading Sticker Factory</h2>
      <p class="text-sm text-secondary-600">{{ loadingMessage }}</p>
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
          :stickerText="stickerText"
          :textColor="textColor"
          :font="selectedFont"
          :font-size="fontSize"
          :font-weight="fontWeight"
          :strokeColor="strokeColor"
          :stroke-width="strokeWidth"
          :stroke-opacity="strokeOpacity"
          :width="svgWidth"
          :height="svgHeight"
          :template="selectedTemplate"
          :textInputs="textInputs"
          :shapeStyles="shapeStyles"
          :svgImageStyles="svgImageStyles"
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

            <!-- Dynamic Form Elements in Template Layer Order -->
            <div v-if="selectedTemplate && orderedFormElements.length > 0" class="space-y-4">
              <div v-for="element in orderedFormElements" :key="element.id" class="space-y-2">

                <!-- Text Input -->
                <template v-if="element.type === 'text'">
                  <FormLabel :text="getTextInputLabel(selectedTemplate, element.id)" />
                  <TextInputField
                    :modelValue="element.data.text"
                    :placeholder="getTextInputPlaceholder(selectedTemplate, element.id)"
                    :selectedFont="element.data.font"
                    :font-size="element.data.fontSize"
                    :font-weight="element.data.fontWeight"
                    :textColor="element.data.textColor"
                    :textStrokeColor="element.data.strokeColor"
                    :text-stroke-width="element.data.strokeWidth"
                    :textStrokeLinejoin="element.data.strokeLinejoin"
                    :stroke-opacity="element.data.strokeOpacity"
                    :instanceId="element.id"
                    @update:modelValue="(value) => updateTextInputByIndex(element.index, { text: value })"
                    @update:selectedFont="(value) => updateTextInputByIndex(element.index, { font: value })"
                    @update:fontSize="(value) => updateTextInputByIndex(element.index, { fontSize: value })"
                    @update:fontWeight="(value) => updateTextInputByIndex(element.index, { fontWeight: value })"
                    @update:textColor="(value) => updateTextInputByIndex(element.index, { textColor: value })"
                    @update:textStrokeColor="(value) => updateTextInputByIndex(element.index, { strokeColor: value })"
                    @update:textStrokeWidth="(value) => updateTextInputByIndex(element.index, { strokeWidth: value })"
                    @update:textStrokeLinejoin="(value) => updateTextInputByIndex(element.index, { strokeLinejoin: value })"
                  />
                </template>

                <!-- Shape Styling -->
                <template v-else-if="element.type === 'shape'">
                  <TemplateObjectStyler
                    :shapeLabel="getShapeLabel(selectedTemplate, element.id)"
                    :shapeDimensions="getShapeDimensions(selectedTemplate, element.id)"
                    :shapeData="getShapeData(selectedTemplate, element.id)"
                    :shapePath="getShapePath(selectedTemplate, element.id)"
                    :fillColor="element.data.fillColor"
                    :strokeColor="element.data.strokeColor"
                    :stroke-width="element.data.strokeWidth"
                    :stroke-linejoin="element.data.strokeLinejoin"
                    :instanceId="`shape-${element.index}`"
                    @update:fillColor="(value) => updateShapeStyleByIndex(element.index, { fillColor: value })"
                    @update:strokeColor="(value) => updateShapeStyleByIndex(element.index, { strokeColor: value })"
                    @update:strokeWidth="(value) => updateShapeStyleByIndex(element.index, { strokeWidth: value })"
                    @update:strokeLinejoin="(value) => updateShapeStyleByIndex(element.index, { strokeLinejoin: value })"
                  />
                </template>

                <!-- SVG Image Styling -->
                <template v-else-if="element.type === 'svgImage'">
                  <TemplateImageStyler
                    :imageLabel="getSvgImageDisplayName(selectedTemplate, element.id)"
                    :imageDimensions="getSvgImageDimensions(selectedTemplate, element.id)"
                    :svgContent="getSvgImageContent(selectedTemplate, element.id)"
                    :svgId="getSvgImageId(selectedTemplate, element.id)"
                    :color="element.data.color"
                    :strokeColor="element.data.strokeColor"
                    :stroke-width="element.data.strokeWidth"
                    :stroke-linejoin="element.data.strokeLinejoin"
                    :rotation="element.data.rotation"
                    :scale="element.data.scale"
                    :instanceId="`svgImage-${element.index}`"
                    @update:svgContent="(value) => updateSvgImageContent(element.index, value)"
                    @update:svgId="(value) => updateSvgImageId(element.index, value)"
                    @update:color="(value) => updateSvgImageStyleByIndex(element.index, { color: value })"
                    @update:strokeColor="(value) => updateSvgImageStyleByIndex(element.index, { strokeColor: value })"
                    @update:strokeWidth="(value) => updateSvgImageStyleByIndex(element.index, { strokeWidth: value })"
                    @update:strokeLinejoin="(value) => updateSvgImageStyleByIndex(element.index, { strokeLinejoin: value })"
                    @update:rotation="(value) => updateSvgImageStyleByIndex(element.index, { rotation: value })"
                    @update:scale="(value) => updateSvgImageStyleByIndex(element.index, { scale: value })"
                  />
                </template>

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
      :stickerText="stickerText"
      :textColor="textColor"
      :font-size="fontSize"
      :font-weight="fontWeight"
      :text-stroke-width="strokeWidth"
      :textStrokeColor="strokeColor"
      :font="selectedFont"
      :template="selectedTemplate"
      :textInputs="textInputs"
      :shapeStyles="shapeStyles"
      :svgImageStyles="svgImageStyles"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide, defineAsyncComponent } from 'vue'
import { useStore } from './stores'
import { logger } from './utils/logger'
const ExportModal = defineAsyncComponent(() => import('./components/ExportModal.vue'))
const ImportModal = defineAsyncComponent(() => import('./components/ImportModal.vue'))
const DownloadModal = defineAsyncComponent(() => import('./components/DownloadModal.vue'))
import TemplateSelector from './components/TemplateSelector.vue'
import SvgViewer from './components/SvgViewer.vue'
import TextInputField from './components/TextInputField.vue'
import TemplateObjectStyler from './components/TemplateObjectStyler.vue'
import TemplateImageStyler from './components/TemplateImageStyler.vue'
import FormLabel from './components/FormLabel.vue'
import { getDefaultTemplate, loadTemplate } from './config/template-loader'
import type { SimpleTemplate } from './types/template-types'
import { useTemplateHelpers } from './composables/useTemplateHelpers'


// Store
const store = useStore()

// Template helpers
const {
  getTextInputLabel,
  getTextInputPlaceholder,
  getShapeLabel,
  getShapeDimensions,
  getShapeData,
  getShapePath,
  getSvgImageDisplayName,
  getSvgImageDimensions,
  getSvgImageContent,
  getSvgImageId
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

// Loading state
const isLoading = ref(true)
const loadingMessage = ref('Initializing...')

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

// Template system
const selectedTemplate = ref<SimpleTemplate | null>(null)

// Modal states
const showExportModal = ref(false)
const showImportModal = ref(false)
const showDownloadModal = ref(false)

// Form data - connected to store
const textInputs = computed(() => store.textInputs.value)
const selectedTemplateId = computed(() => store.selectedTemplateId.value)
const shapeStyles = computed(() => store.shapeStyles.value)
const svgImageStyles = computed(() => store.svgImageStyles.value)
const stickerText = computed(() => store.stickerText.value)
const textColor = computed(() => store.textColor.value)
const selectedFont = computed(() => store.stickerFont.value)
const fontSize = computed(() => store.fontSize.value)
const fontWeight = computed(() => store.fontWeight.value)
const strokeColor = computed(() => store.strokeColor.value)
const strokeWidth = computed(() => store.strokeWidth.value)
const strokeOpacity = computed(() => store.strokeOpacity.value)

// Computed property for form elements in template layer order
const orderedFormElements = computed(() => {
  if (!selectedTemplate.value?.layers) return []

  const elements: Array<{
    type: 'text' | 'shape' | 'svgImage'
    id: string
    data: any
    index: number
  }> = []

  selectedTemplate.value.layers.forEach((layer) => {
    if (layer.type === 'text') {
      const textInputIndex = textInputs.value?.findIndex(t => t.id === layer.id) ?? -1
      if (textInputIndex >= 0 && textInputs.value?.[textInputIndex]) {
        elements.push({
          type: 'text',
          id: layer.id,
          data: textInputs.value[textInputIndex],
          index: textInputIndex
        })
      }
    } else if (layer.type === 'shape') {
      const shapeStyleIndex = shapeStyles.value?.findIndex(s => s.id === layer.id) ?? -1
      if (shapeStyleIndex >= 0 && shapeStyles.value?.[shapeStyleIndex]) {
        elements.push({
          type: 'shape',
          id: layer.id,
          data: shapeStyles.value[shapeStyleIndex],
          index: shapeStyleIndex
        })
      }
    } else if (layer.type === 'svgImage') {
      const svgImageStyleIndex = svgImageStyles.value?.findIndex(s => s.id === layer.id) ?? -1
      if (svgImageStyleIndex >= 0 && svgImageStyles.value?.[svgImageStyleIndex]) {
        elements.push({
          type: 'svgImage',
          id: layer.id,
          data: svgImageStyles.value[svgImageStyleIndex],
          index: svgImageStyleIndex
        })
      }
    }
  })

  return elements
})

// SVG viewer ref
const svgViewerRef = ref(null)

// SVG dimensions - make it more square and appropriately sized
const svgWidth = computed(() => 400)
const svgHeight = computed(() => 300)

// Initialize store and templates
onMounted(async () => {
  try {
    // Step 1: Start font preloading
    loadingMessage.value = 'Loading fonts...'
    const fontPromise = import('./config/fonts').then(({ preloadPopularFonts }) => {
      return preloadPopularFonts().catch(error => {
        logger.warn('Font preloading failed:', error)
      })
    })

    // Step 2: Load template
    loadingMessage.value = 'Loading templates...'

    // Try to restore template from localStorage
    if (selectedTemplateId.value) {
      selectedTemplate.value = await loadTemplate(selectedTemplateId.value)
    }

    // If no template or template failed to load, use default
    if (!selectedTemplate.value) {
      selectedTemplate.value = await getDefaultTemplate()
      // Save the default template ID to store
      if (selectedTemplate.value) {
        await store.setSelectedTemplateId(selectedTemplate.value.id)
      }
    }

    // Step 3: Initialize template data
    loadingMessage.value = 'Initializing template data...'

    // Initialize textInputs array from template if they don't exist
    if (selectedTemplate.value && (!textInputs.value || textInputs.value.length === 0)) {
      await store.initializeTextInputsFromTemplate(selectedTemplate.value)
    }

    // Initialize shapeStyles array from template if they don't exist
    if (selectedTemplate.value && (!shapeStyles.value || shapeStyles.value.length === 0)) {
      await store.initializeShapeStylesFromTemplate(selectedTemplate.value)
    }

    // Initialize svgImageStyles array from template if they don't exist
    if (selectedTemplate.value && (!svgImageStyles.value || svgImageStyles.value.length === 0)) {
      await store.initializeSvgImageStylesFromTemplate(selectedTemplate.value)
    }

    // Step 4: Initialize SVG library metadata (no content loading)
    loadingMessage.value = 'Loading SVG library...'
    const { useSvgStore } = await import('./stores/svg-store')
    const svgStore = useSvgStore()

    // This only loads metadata now, not the actual SVG content
    await svgStore.loadSvgLibraryStore()

    // Step 5: Wait for fonts to complete
    loadingMessage.value = 'Finalizing...'
    await fontPromise

    // Step 6: Small delay to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 200))

    // Loading complete
    isLoading.value = false

  } catch (error) {
    logger.error('Failed to initialize application:', error)
    loadingMessage.value = 'Error loading application. Please refresh the page.'
    // Don't hide loading on error - show error message
  }
})

// Template handlers
const handleTemplateSelection = async (template: SimpleTemplate) => {
  selectedTemplate.value = template
  await store.setSelectedTemplateId(template.id)
  await store.initializeTextInputsFromTemplate(template)
  await store.initializeShapeStylesFromTemplate(template)
  await store.initializeSvgImageStylesFromTemplate(template)
}

// Helper function to update text input by index
const updateTextInputByIndex = async (index: number, updates: any) => {
  await store.updateTextInput(index, updates)
}

// Helper function to update shape style by index
const updateShapeStyleByIndex = async (index: number, updates: any) => {
  await store.updateShapeStyle(index, updates)
}

// Helper function to update SVG image style by index
const updateSvgImageStyleByIndex = async (index: number, updates: any) => {
  await store.updateSvgImageStyle(index, updates)
}

// Helper functions to update SVG image content and ID
const updateSvgImageContent = async (index: number, svgContent: string) => {
  if (!selectedTemplate.value || !selectedTemplate.value.layers) return

  // Find the SVG image layer by index
  const svgImageLayers = selectedTemplate.value.layers.filter(layer => layer.type === 'svgImage')
  if (index >= 0 && index < svgImageLayers.length) {
    const svgImageLayer = svgImageLayers[index]
    // Update the template layer content
    svgImageLayer.svgContent = svgContent

    // CRITICAL FIX: Also update the svgImageStyles to store the selected content
    // This ensures the preview updates when SVG selection changes
    store.updateSvgImageStyle(index, { svgContent })
  }
}

const updateSvgImageId = async (index: number, svgId: string) => {
  if (!selectedTemplate.value || !selectedTemplate.value.layers) return

  // Find the SVG image layer by index
  const svgImageLayers = selectedTemplate.value.layers.filter(layer => layer.type === 'svgImage')
  if (index >= 0 && index < svgImageLayers.length) {
    const svgImageLayer = svgImageLayers[index]


    // Update the template layer ID
    svgImageLayer.svgId = svgId

    // CRITICAL FIX: Load new SVG content when svgId changes
    const { getSvgContent } = await import('./config/svg-library-loader')
    const newSvgContent = await getSvgContent(svgId)

    if (newSvgContent) {
      // Update the template layer's SVG content
      svgImageLayer.svgContent = newSvgContent

    }
  }
}

</script>