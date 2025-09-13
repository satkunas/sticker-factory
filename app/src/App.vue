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
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">Sticker Settings</h2>
          
          <div class="space-y-4">
            <!-- Background Color -->
            <div class="max-w-md">
              <FormLabel text="Background Color" />
              <ColorPicker 
                v-model="badgeColor"
              />
            </div>
            
            <!-- Text Input with Integrated Font & Color Selector -->
            <div class="w-full">
              <FormLabel text="Text" />
              <TextInputWithFontSelector
                v-model="badgeText"
                placeholder="Enter text..."
                :selected-font="selectedFont"
                :text-color="textColor"
                :font-size="fontSize"
                :font-weight="fontWeight"
                instance-id="main"
                @update:selected-font="selectedFont = $event"
                @update:text-color="textColor = $event"
                @update:font-size="fontSize = $event"
                @update:font-weight="fontWeight = $event"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Viewer Pane -->
      <SvgViewer 
        ref="svgViewerRef"
        :text="badgeText"
        :background-color="badgeColor"
        :text-color="textColor"
        :width="svgWidth"
        :height="svgHeight"
        :font-size="fontSize"
        :font-weight="fontWeight"
        :font="selectedFont"
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
      @close="showDownloadModal = false" 
    />

    <!-- Download Section -->
    <footer class="bg-white border-t border-secondary-200 p-4 flex-shrink-0">
      <div class="max-w-4xl mx-auto flex items-center justify-center">
        <button
          @click="downloadSVG"
          class="btn-primary flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>Download SVG</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useStore } from './stores'
import BadgeSvg from './components/BadgeSvg.vue'
import ExportModal from './components/ExportModal.vue'
import ImportModal from './components/ImportModal.vue'
import DownloadModal from './components/DownloadModal.vue'
import TextInput from './components/TextInput.vue'
import ColorPicker from './components/ColorPicker.vue'
import FormLabel from './components/FormLabel.vue'
import SvgViewer from './components/SvgViewer.vue'
import TextInputWithFontSelector from './components/TextInputWithFontSelector.vue'
import { getFontFamily } from './config/fonts'

// Store
const store = useStore()

// Global state for expandable font selectors
const expandedFontSelectors = ref(new Set<string>())
provide('expandedFontSelectors', expandedFontSelectors)

// Mobile menu
const showMobileMenu = ref(false)

// Form data - connected to store
const badgeText = ref('')
const badgeColor = ref('#22c55e')
const textColor = ref('#ffffff')
const selectedFont = ref(null)
const fontSize = ref(16)
const fontWeight = ref(400)

// SVG viewer ref
const svgViewerRef = ref(null)

// Modal states
const showExportModal = ref(false)
const showImportModal = ref(false)
const showDownloadModal = ref(false)

// SVG dimensions - responsive to viewer width
const svgWidth = computed(() => {
  // Make SVG fill most of the viewer width, accounting for padding and controls
  return Math.min(800, 600) // Default size since container is now in SvgViewer
})

const svgHeight = computed(() => {
  // Maintain aspect ratio (200:60 = 10:3)
  return Math.round(svgWidth.value * 0.3)
})



// Initialize from store
onMounted(async () => {
  badgeText.value = store.badgeText.value
  badgeColor.value = store.badgeColor.value
  selectedFont.value = store.badgeFont.value
})

// Watch form changes and update store
watch(badgeText, (newText) => {
  store.setBadgeText(newText)
})

watch(badgeColor, (newColor) => {
  store.setBadgeColor(newColor)
})

watch(selectedFont, (newFont) => {
  store.setBadgeFont(newFont)
})

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

const resetState = () => {
  store.resetState()
  badgeText.value = ''
  badgeColor.value = '#22c55e'
}


// Download function
const downloadSVG = () => {
  showDownloadModal.value = true
}
</script>