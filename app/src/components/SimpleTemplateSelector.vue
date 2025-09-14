<template>
  <div class="w-full mb-6">
    <!-- Template Selector Header -->
    <div class="text-sm font-medium text-secondary-700 mb-2">Sticker Template</div>

    <!-- Dropdown -->
    <div class="relative">
      <button
        @click="isOpen = !isOpen"
        class="w-full px-4 py-3 bg-white border border-secondary-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-300 transition-colors"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isOpen }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Template Preview Icon -->
            <div class="w-8 h-6 bg-secondary-100 rounded border flex items-center justify-center overflow-hidden">
              <svg
                v-if="selectedTemplate"
                :width="Math.min(32, selectedTemplate.viewBox.width / selectedTemplate.viewBox.height * 24)"
                :height="24"
                :viewBox="`0 0 ${selectedTemplate.viewBox.width} ${selectedTemplate.viewBox.height}`"
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
                </template>
              </svg>
              <div v-else class="w-4 h-4 bg-secondary-300 rounded"></div>
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
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
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
            @click="selectTemplate(template)"
            class="w-full px-4 py-3 text-left hover:bg-secondary-50 focus:outline-none focus:bg-secondary-50 transition-colors"
            :class="{ 'bg-primary-50': selectedTemplate?.id === template.id }"
          >
            <div class="flex items-center space-x-3">
              <!-- Template Preview -->
              <div class="w-12 h-8 bg-secondary-50 border border-secondary-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <svg
                  :width="Math.min(48, template.viewBox.width / template.viewBox.height * 32)"
                  :height="32"
                  :viewBox="`0 0 ${template.viewBox.width} ${template.viewBox.height}`"
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
                  </template>
                </svg>
              </div>

              <!-- Template Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-secondary-900">{{ template.name }}</div>
                <div class="text-sm text-secondary-500 truncate">{{ template.description }}</div>
                <div class="text-xs text-secondary-400 mt-1">
                  {{ template.category }} shape
                </div>
              </div>

              <!-- Selection Indicator -->
              <div v-if="selectedTemplate?.id === template.id" class="flex-shrink-0">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  const dropdown = target.closest('.relative')

  if (!dropdown) {
    isOpen.value = false
  }
}

// Load templates on mount and initialize with default template if none selected
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  templates.value = await loadAllTemplates()

  if (!props.selectedTemplate && templates.value.length > 0) {
    const defaultTemplate = await getDefaultTemplate()
    if (defaultTemplate) {
      selectTemplate(defaultTemplate)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
button {
  position: relative;
}
</style>