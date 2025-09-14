<template>
  <div id="app" class="min-h-screen bg-secondary-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-secondary-200 flex-shrink-0">
      <div class="flex items-center justify-between px-4 h-14">
        <h1 class="text-lg font-semibold text-secondary-900">Sticker Factory</h1>

        <!-- Mobile menu button -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </button>

        <!-- Desktop menu -->
        <nav class="hidden lg:flex space-x-4">
          <button
            @click="downloadSVG"
            class="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>Download</span>
          </button>
          <button @click="exportToFile" class="text-sm text-secondary-600 hover:text-secondary-900">Export</button>
          <button @click="importFromFile" class="text-sm text-secondary-600 hover:text-secondary-900">Import</button>
          <button @click="resetState" class="text-sm text-secondary-600 hover:text-secondary-900">Reset</button>
        </nav>
      </div>

      <!-- Mobile menu overlay -->
      <div v-if="showMobileMenu" class="lg:hidden fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black bg-opacity-25" @click="showMobileMenu = false"></div>
        <div class="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
          <div class="p-4 border-b border-secondary-200">
            <button @click="showMobileMenu = false" class="p-2 rounded-md text-secondary-600 hover:text-secondary-900">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          <nav class="p-4 space-y-4">
            <button
              @click="downloadSVG; showMobileMenu = false"
              class="flex items-center space-x-2 w-full px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <span>Download SVG</span>
            </button>
            <button @click="exportToFile; showMobileMenu = false" class="block w-full text-left py-2 text-secondary-700 hover:text-secondary-900">Export</button>
            <button @click="importFromFile; showMobileMenu = false" class="block w-full text-left py-2 text-secondary-700 hover:text-secondary-900">Import</button>
            <button @click="resetState; showMobileMenu = false" class="block w-full text-left py-2 text-secondary-700 hover:text-secondary-900">Reset</button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col lg:flex-row min-h-0">
      <!-- Form Pane -->
      <div class="w-full lg:w-1/2 p-6 bg-white border-r border-secondary-200 lg:min-h-0">
        <div class="w-full">
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">Sticker Design</h2>

          <div class="space-y-6">
            <!-- Template Selector -->
            <SimpleTemplateSelector
              :selected-template="selectedTemplate"
              @update:selectedTemplate="handleTemplateSelection"
            />

            <!-- Dynamic Text Inputs -->
            <div v-for="(textInput, index) in textInputs" :key="textInput.id" class="space-y-2">
              <FormLabel :text="`${getTextInputLabel(selectedTemplate, textInput.id)} ${textInputs.length > 1 ? '(' + (index + 1) + ')' : ''}`" />
              <TextInputWithFontSelector
                :model-value="textInput.text"
                @update:model-value="(text) => handleTextInputUpdate(index, text)"
                :selected-font="textInput.font"
                :font-size="textInput.fontSize"
                :font-weight="textInput.fontWeight"
                :text-color="textInput.textColor"
                :text-stroke-width="textInput.strokeWidth"
                :text-stroke-color="textInput.strokeColor"
                :text-stroke-linejoin="'round'"
                @update:selected-font="(font) => handleTextInputFontUpdate(index, font)"
                @update:font-size="(size) => handleTextInputFontSizeUpdate(index, size)"
                @update:font-weight="(weight) => handleTextInputFontWeightUpdate(index, weight)"
                @update:text-color="(color) => handleTextInputTextColorUpdate(index, color)"
                @update:text-stroke-width="(width) => handleTextInputStrokeWidthUpdate(index, width)"
                @update:text-stroke-color="(color) => handleTextInputStrokeColorUpdate(index, color)"
                @update:text-stroke-linejoin="() => {}"
                :placeholder="getTextInputPlaceholder(selectedTemplate, textInput.id)"
                :instance-id="`textInput-${index}`"
              />
            </div>

            <!-- Fallback single text input for backward compatibility -->
            <div v-if="(!textInputs || textInputs.length === 0) && selectedTemplate && getTemplateMainTextInput(selectedTemplate)">
              <FormLabel :text="getTemplateMainTextInput(selectedTemplate)?.label || 'Text'" />
              <TextInputWithFontSelector
                :model-value="badgeText"
                @update:model-value="handleTextUpdate"
                :selected-font="selectedFont"
                :font-size="fontSize"
                :font-weight="fontWeight"
                :text-color="textColor"
                :text-stroke-width="strokeWidth"
                :text-stroke-color="strokeColor"
                :text-stroke-linejoin="'round'"
                @update:selected-font="handleFontUpdate"
                @update:font-size="handleFontSizeUpdate"
                @update:font-weight="handleFontWeightUpdate"
                @update:text-color="handleTextColorUpdate"
                @update:text-stroke-width="handleStrokeWidthUpdate"
                @update:text-stroke-color="handleStrokeColorUpdate"
                @update:text-stroke-linejoin="() => {}"
                :placeholder="getTemplateMainTextInput(selectedTemplate)?.placeholder || 'Enter your text...'"
              />
            </div>

            <!-- Background Color -->
            <div class="max-w-md">
              <FormLabel text="Background Color" />
              <ColorPicker
                v-model="badgeColor"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Viewer Pane -->
      <TemplateAwareSvgViewer
        ref="svgViewerRef"
        :sticker-text="badgeText"
        :sticker-color="badgeColor"
        :text-color="textColor"
        :font="selectedFont"
        :font-size="fontSize"
        :font-weight="fontWeight"
        :stroke-color="strokeColor"
        :stroke-width="strokeWidth"
        :stroke-opacity="strokeOpacity"
        :width="svgWidth"
        :height="svgHeight"
        :template="selectedTemplate"
        :text-inputs="textInputs"
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
      :badge-text="badgeText"
      :badge-color="badgeColor"
      :text-color="textColor"
      :font-size="fontSize"
      :font-weight="fontWeight"
      :text-stroke-width="strokeWidth"
      :text-stroke-color="strokeColor"
      :font="selectedFont"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useStore } from './stores'
import ExportModal from './components/ExportModal.vue'
import ImportModal from './components/ImportModal.vue'
import DownloadModal from './components/DownloadModal.vue'
import TextInputWithFontSelector from './components/TextInputWithFontSelector.vue'
import ColorPicker from './components/ColorPicker.vue'
import FormLabel from './components/FormLabel.vue'
import SvgViewer from './components/SvgViewer.vue'
import SimpleTemplateSelector from './components/SimpleTemplateSelector.vue'
import TemplateAwareSvgViewer from './components/TemplateAwareSvgViewer.vue'
import { getDefaultTemplate, getTemplateMainTextInput, getTemplateTextInputs, loadTemplate } from './config/template-loader'
import type { SimpleTemplate } from './types/template-types'

// Store
const store = useStore()

// Global state for expandable font selectors
const expandedFontSelectors = ref(new Set<string>())
provide('expandedFontSelectors', expandedFontSelectors)

// Mobile menu
const showMobileMenu = ref(false)

// Template system (always enabled)
const selectedTemplate = ref<SimpleTemplate | null>(null)

// Form data - connected to store
const textInputs = computed(() => store.textInputs.value)
const selectedTemplateId = computed(() => store.selectedTemplateId.value)
const badgeText = computed(() => store.badgeText.value)
const badgeColor = computed(() => store.badgeColor.value)
const textColor = computed(() => store.textColor.value)
const selectedFont = computed(() => store.badgeFont.value)
const fontSize = computed(() => store.fontSize.value)
const fontWeight = computed(() => store.fontWeight.value)
const strokeColor = computed(() => store.strokeColor.value)
const strokeWidth = computed(() => store.strokeWidth.value)
const strokeOpacity = computed(() => store.strokeOpacity.value)

// SVG viewer ref
const svgViewerRef = ref(null)

// Modal states
const showExportModal = ref(false)
const showImportModal = ref(false)
const showDownloadModal = ref(false)

// SVG dimensions - responsive to viewer width
const svgWidth = computed(() => {
  return Math.min(800, 600)
})

const svgHeight = computed(() => {
  return Math.round(svgWidth.value * 0.3)
})

// Initialize store and templates
onMounted(async () => {
  // Store initialization happens automatically through computed properties

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
})

// Template handlers
const handleTemplateSelection = async (template: SimpleTemplate) => {
  selectedTemplate.value = template
  // Save template ID to localStorage
  await store.setSelectedTemplateId(template.id)
  // Initialize textInputs array from template
  await store.initializeTextInputsFromTemplate(template)
}

// Text input handlers
const handleTextUpdate = async (text: string) => {
  await store.setBadgeText(text)
}

const handleFontUpdate = async (font: any) => {
  await store.updateState({ badgeFont: font })
}

const handleFontSizeUpdate = async (size: number) => {
  await store.updateState({ fontSize: size })
}

const handleFontWeightUpdate = async (weight: number) => {
  await store.updateState({ fontWeight: weight })
}

const handleTextColorUpdate = async (color: string) => {
  await store.updateState({ textColor: color })
}

const handleStrokeWidthUpdate = async (width: number) => {
  await store.updateState({ strokeWidth: width })
}

const handleStrokeColorUpdate = async (color: string) => {
  await store.updateState({ strokeColor: color })
}

// Multi-text input handlers
const handleTextInputUpdate = async (index: number, text: string) => {
  await store.updateTextInput(index, { text })
}

const handleTextInputFontUpdate = async (index: number, font: any) => {
  await store.updateTextInput(index, { font })
}

const handleTextInputFontSizeUpdate = async (index: number, fontSize: number) => {
  await store.updateTextInput(index, { fontSize })
}

const handleTextInputFontWeightUpdate = async (index: number, fontWeight: number) => {
  await store.updateTextInput(index, { fontWeight })
}

const handleTextInputTextColorUpdate = async (index: number, textColor: string) => {
  await store.updateTextInput(index, { textColor })
}

const handleTextInputStrokeWidthUpdate = async (index: number, strokeWidth: number) => {
  await store.updateTextInput(index, { strokeWidth })
}

const handleTextInputStrokeColorUpdate = async (index: number, strokeColor: string) => {
  await store.updateTextInput(index, { strokeColor })
}

// Helper functions for template text inputs
const getTextInputLabel = (template: SimpleTemplate | null, textInputId: string): string => {
  if (!template) return 'Text'
  const textInputs = getTemplateTextInputs(template)
  const textInput = textInputs.find(input => input.id === textInputId)
  return textInput?.label || 'Text'
}

const getTextInputPlaceholder = (template: SimpleTemplate | null, textInputId: string): string => {
  if (!template) return 'Enter your text...'
  const textInputs = getTemplateTextInputs(template)
  const textInput = textInputs.find(input => input.id === textInputId)
  return textInput?.placeholder || 'Enter your text...'
}

// Menu functions
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const exportToFile = () => {
  showExportModal.value = true
}

const importFromFile = () => {
  showImportModal.value = true
}

const resetState = async () => {
  await store.resetState()
  // Store values will update automatically through computed properties
}

// Download function
const downloadSVG = () => {
  showDownloadModal.value = true
}
</script>