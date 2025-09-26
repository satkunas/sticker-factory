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

            <!-- Dynamic Text Inputs -->
            <div v-if="selectedTemplate && textInputs" class="space-y-4">
              <div v-for="textInput in textInputs" :key="textInput.id" class="space-y-2">
                <FormLabel :text="getTextInputLabel(selectedTemplate, textInput.id)" />
                <TextInputField
                  :modelValue="textInput.text"
                  :placeholder="getTextInputPlaceholder(selectedTemplate, textInput.id)"
                  :selectedFont="textInput.font"
                  :font-size="textInput.fontSize"
                  :font-weight="textInput.fontWeight"
                  :textColor="textInput.textColor"
                  :textStrokeColor="textInput.strokeColor"
                  :text-stroke-width="textInput.strokeWidth"
                  :textStrokeLinejoin="textInput.strokeLinejoin"
                  :stroke-opacity="textInput.strokeOpacity"
                  :instanceId="textInput.id"
                  @update:modelValue="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { text: value })"
                  @update:selectedFont="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { font: value })"
                  @update:fontSize="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontSize: value })"
                  @update:fontWeight="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontWeight: value })"
                  @update:textColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { textColor: value })"
                  @update:textStrokeColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeColor: value })"
                  @update:textStrokeWidth="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeWidth: value })"
                  @update:textStrokeLinejoin="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeLinejoin: value })"
                />
              </div>
            </div>

            <!-- Template Object Styling -->
            <div v-if="selectedTemplate && shapeStyles && shapeStyles.length > 0" class="space-y-4">
              <div v-for="(shapeStyle, index) in shapeStyles" :key="shapeStyle.id" class="space-y-2">
                <TemplateObjectStyler
                  :shapeLabel="getShapeLabel(selectedTemplate, shapeStyle.id)"
                  :shapeDimensions="getShapeDimensions(selectedTemplate, shapeStyle.id)"
                  :shapeData="getShapeData(selectedTemplate, shapeStyle.id)"
                  :shapePath="getShapePath(selectedTemplate, shapeStyle.id)"
                  :fillColor="shapeStyle.fillColor"
                  :strokeColor="shapeStyle.strokeColor"
                  :stroke-width="shapeStyle.strokeWidth"
                  :stroke-linejoin="shapeStyle.strokeLinejoin"
                  :instanceId="`shape-${index}`"
                  @update:fillColor="(value) => updateShapeStyleByIndex(index, { fillColor: value })"
                  @update:strokeColor="(value) => updateShapeStyleByIndex(index, { strokeColor: value })"
                  @update:strokeWidth="(value) => updateShapeStyleByIndex(index, { strokeWidth: value })"
                  @update:strokeLinejoin="(value) => updateShapeStyleByIndex(index, { strokeLinejoin: value })"
                />
              </div>
            </div>

            <!-- SVG Image Styling -->
            <div v-if="selectedTemplate && svgImageStyles && svgImageStyles.length > 0" class="space-y-4">
              <div v-for="(svgImageStyle, index) in svgImageStyles" :key="svgImageStyle.id" class="space-y-2">
                <TemplateImageStyler
                  :imageLabel="getSvgImageLabel(selectedTemplate, svgImageStyle.id)"
                  :imageDimensions="getSvgImageDimensions(selectedTemplate, svgImageStyle.id)"
                  :svgContent="getSvgImageContent(selectedTemplate, svgImageStyle.id)"
                  :svgId="getSvgImageId(selectedTemplate, svgImageStyle.id)"
                  :color="svgImageStyle.color"
                  :strokeColor="svgImageStyle.strokeColor"
                  :stroke-width="svgImageStyle.strokeWidth"
                  :stroke-linejoin="svgImageStyle.strokeLinejoin"
                  :rotation="svgImageStyle.rotation"
                  :scale="svgImageStyle.scale"
                  :instanceId="`svgImage-${index}`"
                  @update:svgContent="(value) => updateSvgImageContent(index, value)"
                  @update:svgId="(value) => updateSvgImageId(index, value)"
                  @update:color="(value) => updateSvgImageStyleByIndex(index, { color: value })"
                  @update:strokeColor="(value) => updateSvgImageStyleByIndex(index, { strokeColor: value })"
                  @update:strokeWidth="(value) => updateSvgImageStyleByIndex(index, { strokeWidth: value })"
                  @update:strokeLinejoin="(value) => updateSvgImageStyleByIndex(index, { strokeLinejoin: value })"
                  @update:rotation="(value) => updateSvgImageStyleByIndex(index, { rotation: value })"
                  @update:scale="(value) => updateSvgImageStyleByIndex(index, { scale: value })"
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
  getSvgImageLabel,
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