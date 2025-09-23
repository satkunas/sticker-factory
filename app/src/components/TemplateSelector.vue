<template>
  <div class="w-full mb-6">
    <!-- Template Selector Header -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      Sticker Template
    </div>

    <!-- Dropdown -->
    <div class="relative">
      <button
        class="w-full px-4 py-3 bg-white border border-secondary-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-300 transition-colors"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isOpen }"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Template Preview Icon -->
            <div class="w-8 h-6 bg-secondary-100 rounded border flex items-center justify-center overflow-hidden">
              <svg
                v-if="selectedTemplate"
                :width="32"
                :height="24"
                :viewBox="getOptimalViewBox(selectedTemplate, 32, 24)"
                class="drop-shadow-sm"
              >
                <template v-for="element in getTemplateElements(selectedTemplate)" :key="element.zIndex">
                  <path
                    v-if="element.type === 'shape' && element.shape"
                    :d="element.shape.path"
                    :fill="element.shape.fill || '#22c55e'"
                    :stroke="element.shape.stroke || '#16a34a'"
                    :stroke-width="element.shape.strokeWidth || 2"
                  />
                  <text
                    v-if="element.type === 'text' && element.textInput"
                    :x="element.textInput.position.x"
                    :y="element.textInput.position.y"
                    text-anchor="middle"
                    dominant-baseline="central"
                    :font-family="element.textInput.fontFamily"
                    :font-size="Math.max(8, element.textInput.fontSize * 0.6)"
                    :font-weight="element.textInput.fontWeight"
                    :fill="element.textInput.fontColor"
                    class="select-none"
                  >
                    {{ element.textInput.default }}
                  </text>
                </template>
              </svg>
              <div v-else class="w-4 h-4 bg-secondary-300 rounded" />
            </div>

            <!-- Template Info -->
            <div>
              <div class="font-medium text-secondary-900">
                {{ selectedTemplate?.name || 'Select Template' }}
              </div>
              <div v-if="selectedTemplate" class="text-xs text-secondary-500">
                {{ selectedTemplate.description }}
              </div>
            </div>
          </div>

          <!-- Dropdown Arrow -->
          <svg
            class="w-5 h-5 text-secondary-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>

      <!-- Dropdown Content -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      >
        <div class="py-2">
          <button
            v-for="template in templates"
            :key="template.id"
            class="w-full px-4 py-3 text-left hover:bg-secondary-50 focus:outline-none focus:bg-secondary-50 transition-colors"
            :class="{ 'bg-primary-50': selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="flex items-center space-x-3">
              <!-- Template Preview -->
              <div class="w-12 h-8 bg-secondary-50 border border-secondary-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <svg
                  :width="48"
                  :height="32"
                  :viewBox="getOptimalViewBox(template, 48, 32)"
                  class="drop-shadow-sm"
                >
                  <template v-for="element in getTemplateElements(template)" :key="element.zIndex">
                    <path
                      v-if="element.type === 'shape' && element.shape"
                      :d="element.shape.path"
                      :fill="element.shape.fill || '#22c55e'"
                      :stroke="element.shape.stroke || '#16a34a'"
                      :stroke-width="element.shape.strokeWidth || 2"
                    />
                    <text
                      v-if="element.type === 'text' && element.textInput"
                      :x="element.textInput.position.x"
                      :y="element.textInput.position.y"
                      text-anchor="middle"
                      dominant-baseline="central"
                      :font-family="element.textInput.fontFamily"
                      :font-size="Math.max(6, element.textInput.fontSize * 0.4)"
                      :font-weight="element.textInput.fontWeight"
                      :fill="element.textInput.fontColor"
                      class="select-none"
                    >
                      {{ element.textInput.default }}
                    </text>
                  </template>
                </svg>
              </div>

              <!-- Template Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-secondary-900">
                  {{ template.name }}
                </div>
                <div class="text-sm text-secondary-500 truncate">
                  {{ template.description }}
                </div>
                <div class="text-xs text-secondary-400 mt-1">
                  {{ template.category }} shape
                </div>
              </div>

              <!-- Selection Indicator -->
              <div v-if="selectedTemplate?.id === template.id" class="flex-shrink-0">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted } from 'vue'
import { loadAllTemplates, getTemplateElements, getDefaultTemplate } from '../config/template-loader'
import type { SimpleTemplate } from '../types/template-types'

interface Props {
  selectedTemplate?: SimpleTemplate | null
}

interface Emits {
  'update:selectedTemplate': [template: SimpleTemplate]
}

const props = withDefaults(defineProps<Props>(), {
  selectedTemplate: null
})

const emit = defineEmits<Emits>()

// Dropdown state
const isOpen = ref(false)

// Available templates (loaded dynamically)
const templates = ref<SimpleTemplate[]>([])

// Template selection handler
const selectTemplate = (template: SimpleTemplate) => {
  emit('update:selectedTemplate', template)
  isOpen.value = false
}

// Calculate optimal viewBox for content-aware fit
const getOptimalViewBox = (template: SimpleTemplate, targetWidth: number, targetHeight: number): string => {
  if (!template?.viewBox) return `0 0 ${targetWidth} ${targetHeight}`

  // Use the template's actual viewBox but scale to fit the target dimensions
  const { x, y, width, height } = template.viewBox

  // Calculate scale to fit target dimensions while maintaining aspect ratio
  const scaleX = targetWidth / width
  const scaleY = targetHeight / height
  const scale = Math.min(scaleX, scaleY) * 0.9 // 90% to leave some margin

  // Calculate the viewBox dimensions that will fit in the target size
  const viewBoxWidth = targetWidth / scale
  const viewBoxHeight = targetHeight / scale

  // Center the content in the viewBox
  const centerX = x + width / 2
  const centerY = y + height / 2
  const viewBoxX = centerX - viewBoxWidth / 2
  const viewBoxY = centerY - viewBoxHeight / 2

  return `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
}

// Close dropdown when clicking outside
const _handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')

  if (!dropdown) {
    isOpen.value = false
  }
}

// Load templates on mount and initialize with default template if none selected
onMounted(async () => {
  document.addEventListener("click", _handleClickOutside)

  templates.value = await loadAllTemplates()

  if (!props.selectedTemplate && templates.value.length > 0) {
    const defaultTemplate = await getDefaultTemplate()
    if (defaultTemplate) {
      selectTemplate(defaultTemplate)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener("click", _handleClickOutside)
})
</script>

<style scoped>
button {
  position: relative;
}
</style>