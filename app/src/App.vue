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
      <div class="w-full lg:w-1/2 bg-secondary-50 relative min-h-96 lg:min-h-0">
        <!-- SVG Container -->
        <div 
          ref="svgContainer"
          class="w-full h-full bg-white rounded-lg border-2 border-dashed border-secondary-300 overflow-hidden cursor-move relative"
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
              :width="svgWidth"
              :height="svgHeight"
              :font-size="svgFontSize"
            />
          </div>

          <!-- Combined Controls & Legend -->
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-secondary-200">
            <!-- Mini Overview & Scale -->
            <div class="flex items-center space-x-2 mb-2">
              <!-- Mini SVG -->
              <div 
                class="w-32 h-10 bg-secondary-50 rounded border overflow-hidden relative flex-shrink-0"
                :style="{ 
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
                  backgroundSize: '5px 5px'
                }"
              >
                <!-- Mini Badge -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div 
                    class="rounded-full"
                    :style="{ 
                      backgroundColor: badgeColor,
                      width: '24px',
                      height: '8px'
                    }"
                  ></div>
                </div>
                
                <!-- Viewport Rectangle -->
                <div 
                  class="absolute border-2 border-primary-500 bg-primary-100/40"
                  :style="compactViewportStyle"
                ></div>
              </div>
              
              <!-- Scale indicator -->
              <span class="text-xs text-secondary-600 font-mono">{{ Math.round(zoomLevel * 100) }}%</span>
            </div>

            <!-- Zoom Controls -->
            <div class="flex items-center space-x-1">
              <button 
                @click="zoomOut"
                class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                title="Zoom out"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
              
              <input 
                type="range" 
                v-model="zoomLevel" 
                min="0.1" 
                max="5" 
                step="0.1" 
                class="w-16 h-1.5 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <button 
                @click="zoomIn"
                class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                title="Zoom in"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
              </button>
              
              <div class="h-4 w-px bg-secondary-300 mx-1"></div>
              
              <button 
                @click="resetZoom"
                class="p-1.5 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                title="Reset zoom and position"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                </svg>
              </button>
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

// SVG dimensions - responsive to viewer width
const svgWidth = computed(() => {
  // Make SVG fill most of the viewer width, accounting for padding and controls
  const containerWidth = svgContainer.value?.clientWidth || 400
  return Math.min(containerWidth * 0.8, 600) // 80% of container, max 600px
})

const svgHeight = computed(() => {
  // Maintain aspect ratio (200:60 = 10:3)
  return Math.round(svgWidth.value * 0.3)
})

const svgFontSize = computed(() => {
  // Scale font size with SVG width
  return Math.max(12, Math.round(svgWidth.value * 0.08)) // Min 12px, scale with width
})

// Viewport calculation for compact legend
const compactViewportStyle = computed(() => {
  // Compact legend container is 128px wide, 40px high (w-32 h-10)
  const legendWidth = 128
  const legendHeight = 40
  
  // Calculate viewport size based on zoom level
  // At zoom 1, viewport shows full image
  // At higher zoom, viewport shows smaller portion
  const viewportWidthPercent = Math.min(100, 100 / zoomLevel.value)
  const viewportHeightPercent = Math.min(100, 100 / zoomLevel.value)
  
  const viewportWidth = (legendWidth * viewportWidthPercent) / 100
  const viewportHeight = (legendHeight * viewportHeightPercent) / 100
  
  // Calculate position based on pan values
  // Convert pan values to percentage of viewport
  const containerRect = svgContainer.value?.getBoundingClientRect()
  if (!containerRect) {
    return {
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
      left: `${(legendWidth - viewportWidth) / 2}px`,
      top: `${(legendHeight - viewportHeight) / 2}px`
    }
  }
  
  // Calculate pan percentage relative to container size
  const panXPercent = (-panX.value / (containerRect.width * zoomLevel.value)) * 100
  const panYPercent = (-panY.value / (containerRect.height * zoomLevel.value)) * 100
  
  // Position viewport rectangle in legend
  const leftPos = (legendWidth - viewportWidth) / 2 + (panXPercent * legendWidth) / 100
  const topPos = (legendHeight - viewportHeight) / 2 + (panYPercent * legendHeight) / 100
  
  return {
    width: `${viewportWidth}px`,
    height: `${viewportHeight}px`,
    left: `${Math.max(0, Math.min(legendWidth - viewportWidth, leftPos))}px`,
    top: `${Math.max(0, Math.min(legendHeight - viewportHeight, topPos))}px`
  }
})

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