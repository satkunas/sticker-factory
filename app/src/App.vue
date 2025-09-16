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
              :selected-template="selectedTemplate"
              @update:selected-template="handleTemplateSelection"
            />

            <!-- Dynamic Text Inputs -->
            <div v-if="selectedTemplate && textInputs" class="space-y-4">
              <div v-for="textInput in textInputs" :key="textInput.id" class="space-y-2">
                <FormLabel :text="getTextInputLabel(selectedTemplate, textInput.id)" />
                <TextInputWithFontSelector
                  :model-value="textInput.text"
                  :placeholder="getTextInputPlaceholder(selectedTemplate, textInput.id)"
                  :selected-font="textInput.font"
                  :font-size="textInput.fontSize"
                  :font-weight="textInput.fontWeight"
                  :text-color="textInput.textColor"
                  :text-stroke-color="textInput.strokeColor"
                  :text-stroke-width="textInput.strokeWidth"
                  :stroke-opacity="textInput.strokeOpacity"
                  :instance-id="textInput.id"
                  @update:model-value="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { text: value })"
                  @update:selectedFont="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { font: value })"
                  @update:font-size="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontSize: value })"
                  @update:font-weight="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { fontWeight: value })"
                  @update:textColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { textColor: value })"
                  @update:textStrokeColor="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeColor: value })"
                  @update:textStrokeWidth="(value) => updateTextInputByIndex(textInputs.indexOf(textInput), { strokeWidth: value })"
                />
              </div>
            </div>

            <!-- Background Color -->
            <div class="space-y-2">
              <FormLabel text="Background Color" />
              <ColorPicker
                :model-value="badgeColor"
                @update:model-value="store.setBadgeColor"
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
      :template="selectedTemplate"
      :text-inputs="textInputs"
      @close="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from './stores'
import ExportModal from './components/ExportModal.vue'
import ImportModal from './components/ImportModal.vue'
import DownloadModal from './components/DownloadModal.vue'
import SimpleTemplateSelector from './components/SimpleTemplateSelector.vue'
import TemplateAwareSvgViewer from './components/TemplateAwareSvgViewer.vue'
import TextInputWithFontSelector from './components/TextInputWithFontSelector.vue'
import ColorPicker from './components/ColorPicker.vue'
import FormLabel from './components/FormLabel.vue'
import { getDefaultTemplate, loadTemplate, getTemplateTextInputs } from './config/template-loader'
import type { SimpleTemplate } from './types/template-types'


// Store
const store = useStore()

// Global state for expandable font selectors
const expandedFontSelectors = ref(new Set<string>())
provide('expandedFontSelectors', expandedFontSelectors)

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

// SVG dimensions - make it more square and appropriately sized
const svgWidth = computed(() => 400)
const svgHeight = computed(() => 300)

// Initialize store and templates
onMounted(async () => {
  console.log('App mounted, initializing templates...')

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
  await store.setSelectedTemplateId(template.id)
  await store.initializeTextInputsFromTemplate(template)
}

// Helper function to update text input by index
const updateTextInputByIndex = async (index: number, updates: any) => {
  await store.updateTextInput(index, updates)
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
</script>