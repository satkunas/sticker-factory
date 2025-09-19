<template>
  <div class="min-h-screen bg-secondary-50 flex flex-col">
    <header class="bg-white shadow-sm border-b border-secondary-200 flex-shrink-0">
      <div class="flex items-center justify-between px-4 h-14">
        <h1 class="text-lg font-semibold text-secondary-900">
          Sticker Factory
        </h1>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
          @click="showMobileMenu = !showMobileMenu"
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
      <div v-if="showMobileMenu" class="lg:hidden border-t border-secondary-200 bg-white">
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
    <main class="flex-1 flex flex-col lg:flex-row min-h-0">
      <!-- Form Pane -->
      <div class="w-full lg:w-1/2 p-6 bg-white border-r border-secondary-200 lg:min-h-0">
        <div class="w-full">
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">
            Sticker Design
          </h2>
          <div class="space-y-6">
            <!-- Template Selector -->
            <SimpleTemplateSelector
              :selectedTemplate="selectedTemplate"
              @update:selectedTemplate="handleTemplateSelection"
            />

            <!-- Dynamic Text Inputs -->
            <div v-if="selectedTemplate && textInputs" class="space-y-4">
              <div v-for="textInput in textInputs" :key="textInput.id" class="space-y-2">
                <FormLabel :text="getTextInputLabel(selectedTemplate, textInput.id)" />
                <TextInputWithFontSelector
                  :modelValue="textInput.text"
                  :placeholder="getTextInputPlaceholder(selectedTemplate, textInput.id)"
                  :selectedFont="textInput.font"
                  :font-size="textInput.fontSize"
                  :font-weight="textInput.fontWeight"
                  :textColor="textInput.textColor"
                  :textStrokeColor="textInput.strokeColor"
                  :text-stroke-width="textInput.strokeWidth"
                  :stroke-opacity="textInput.strokeOpacity"
                  :instanceId="textInput.id"
                  @update:modelValue="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { text: value })"
                  @update:selectedFont="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { font: value })"
                  @update:fontSize="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontSize: value })"
                  @update:fontWeight="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontWeight: value })"
                  @update:textColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { textColor: value })"
                  @update:textStrokeColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeColor: value })"
                  @update:textStrokeWidth="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeWidth: value })"
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
                  :fillColor="svgImageStyle.fillColor"
                  :strokeColor="svgImageStyle.strokeColor"
                  :stroke-width="svgImageStyle.strokeWidth"
                  :stroke-linejoin="svgImageStyle.strokeLinejoin"
                  :instanceId="`svgImage-${index}`"
                  @update:svgContent="(value) => updateSvgImageContent(index, value)"
                  @update:svgId="(value) => updateSvgImageId(index, value)"
                  @update:fillColor="(value) => updateSvgImageStyleByIndex(index, { fillColor: value })"
                  @update:strokeColor="(value) => updateSvgImageStyleByIndex(index, { strokeColor: value })"
                  @update:strokeWidth="(value) => updateSvgImageStyleByIndex(index, { strokeWidth: value })"
                  @update:strokeLinejoin="(value) => updateSvgImageStyleByIndex(index, { strokeLinejoin: value })"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- SVG Viewer Pane -->
      <TemplateAwareSvgViewer
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
import { ref, computed, onMounted, provide, nextTick, defineAsyncComponent } from 'vue'
import { useStore } from './stores'
import { logger } from './utils/logger'
const ExportModal = defineAsyncComponent(() => import('./components/ExportModal.vue'))
const ImportModal = defineAsyncComponent(() => import('./components/ImportModal.vue'))
const DownloadModal = defineAsyncComponent(() => import('./components/DownloadModal.vue'))
import SimpleTemplateSelector from './components/SimpleTemplateSelector.vue'
import TemplateAwareSvgViewer from './components/TemplateAwareSvgViewer.vue'
import TextInputWithFontSelector from './components/TextInputWithFontSelector.vue'
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

  toggle: (id: string, elementRef?: HTMLElement) => {
    if (expandedDropdowns.value.has(id)) {
      expandedDropdowns.value.delete(id)
    } else {
      // Close all other dropdowns
      expandedDropdowns.value.clear()
      // Open this dropdown
      expandedDropdowns.value.add(id)

      // Smooth scroll to the opened element
      if (elementRef) {
        nextTick(() => {
          elementRef.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
        })
      }
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

// Mobile menu
const showMobileMenu = ref(false)

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
  // Start font preloading in background for better performance
  import('./config/fonts').then(({ preloadPopularFonts }) => {
    preloadPopularFonts().catch(error => {
      logger.warn('Font preloading failed:', error)
    })
  })

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
  }
}

</script>