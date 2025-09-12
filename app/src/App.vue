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
    <main class="flex-1 flex flex-col lg:flex-row">
      <!-- Form Pane -->
      <div class="w-full lg:w-1/2 p-6 bg-white border-r border-secondary-200">
        <div class="max-w-md mx-auto lg:mx-0">
          <h2 class="text-xl font-semibold text-secondary-900 mb-6">Badge Settings</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Badge Text</label>
              <input
                v-model="badgeText"
                type="text"
                class="input-field"
                placeholder="Enter badge text..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Badge Color</label>
              <input
                v-model="badgeColor"
                type="color"
                class="w-full h-10 rounded-lg border border-secondary-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Viewer Pane -->
      <div class="w-full lg:w-1/2 p-6 bg-secondary-50">
        <div class="h-full flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-secondary-900">Preview</h2>
            
            <!-- Zoom Controls -->
            <div class="flex items-center space-x-3">
              <button 
                @click="zoomOut"
                class="p-2 rounded-md bg-white border border-secondary-300 text-secondary-600 hover:text-secondary-900"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
              
              <div class="flex items-center space-x-2">
                <span class="text-xs text-secondary-500">10%</span>
                <input 
                  type="range" 
                  v-model="zoomLevel" 
                  min="0.1" 
                  max="5" 
                  step="0.1" 
                  class="w-24 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span class="text-xs text-secondary-500">500%</span>
              </div>
              
              <span class="text-sm text-secondary-600 min-w-16 text-center font-mono">{{ Math.round(zoomLevel * 100) }}%</span>
              
              <button 
                @click="zoomIn"
                class="p-2 rounded-md bg-white border border-secondary-300 text-secondary-600 hover:text-secondary-900"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
              </button>
              
              <button 
                @click="resetZoom"
                class="p-2 rounded-md bg-white border border-secondary-300 text-secondary-600 hover:text-secondary-900"
                title="Reset zoom and position"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- SVG Container -->
          <div 
            ref="svgContainer"
            class="flex-1 bg-white rounded-lg border-2 border-dashed border-secondary-300 overflow-hidden cursor-move"
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @wheel="handleWheel"
          >
            <div 
              class="w-full h-full flex items-center justify-center grid-background"
              :style="{ 
                transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`
              }"
            >
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
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from './stores'
import BadgeSvg from './components/BadgeSvg.vue'
import ExportModal from './components/ExportModal.vue'
import ImportModal from './components/ImportModal.vue'
import DownloadModal from './components/DownloadModal.vue'

// Store
const store = useStore()

// Mobile menu
const showMobileMenu = ref(false)

// Form data - connected to store
const badgeText = ref('')
const badgeColor = ref('#22c55e')

// Zoom and pan
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)

// Drag state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const initialPanX = ref(0)
const initialPanY = ref(0)

// SVG container ref
const svgContainer = ref<HTMLElement | null>(null)
const badgeSvgRef = ref(null)

// Modal states
const showExportModal = ref(false)
const showImportModal = ref(false)
const showDownloadModal = ref(false)

// Initialize from store
onMounted(async () => {
  badgeText.value = store.badgeText.value
  badgeColor.value = store.badgeColor.value
})

// Watch form changes and update store
watch(badgeText, (newText) => {
  store.setBadgeText(newText)
})

watch(badgeColor, (newColor) => {
  store.setBadgeColor(newColor)
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

// Zoom functions
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
}

const resetZoom = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Drag functions
const startDrag = (e) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  initialPanX.value = panX.value
  initialPanY.value = panY.value
  e.preventDefault()
}

const drag = (e) => {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value
  
  panX.value = initialPanX.value + deltaX
  panY.value = initialPanY.value + deltaY
}

const endDrag = () => {
  isDragging.value = false
}

// Wheel zoom
const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.min(Math.max(zoomLevel.value * delta, 0.1), 5)
}

// Download function
const downloadSVG = () => {
  showDownloadModal.value = true
}
</script>