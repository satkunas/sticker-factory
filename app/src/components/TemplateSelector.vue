<template>
  <div class="w-full mb-6">
    <FormLabel text="Template" />

    <!-- Template Dropdown -->
    <div class="relative">
      <button
        @click="isOpen = !isOpen"
        class="w-full px-4 py-3 bg-white border border-secondary-200 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-secondary-300 transition-colors"
        :class="{ 'ring-2 ring-primary-500 border-primary-500': isOpen }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Template Preview Icon -->
            <div class="w-8 h-8 bg-secondary-100 rounded border flex items-center justify-center overflow-hidden">
              <svg
                v-if="selectedTemplate"
                :width="24"
                :height="24"
                :viewBox="`0 0 ${previewSize.width} ${previewSize.height}`"
                class="text-xs"
              >
                <MultiShapeComposer
                  :shapes="selectedTemplate.shapes"
                  :template-width="previewSize.width"
                  :template-height="previewSize.height"
                />
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
        <!-- Loading State -->
        <div v-if="isLoading" class="p-4 text-center text-secondary-500">
          <div class="text-sm">Loading templates...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-4 text-center text-red-500">
          <div class="text-sm">{{ error }}</div>
        </div>

        <!-- Template Options -->
        <div v-else class="py-2">
          <button
            v-for="template in availableTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
            class="w-full px-4 py-3 text-left hover:bg-secondary-50 focus:outline-none focus:bg-secondary-50 transition-colors"
            :class="{ 'bg-primary-50': selectedTemplate?.id === template.id }"
          >
            <div class="flex items-center space-x-3">
              <!-- Template Preview -->
              <div class="w-12 h-12 bg-secondary-50 border border-secondary-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <svg
                  :width="40"
                  :height="40"
                  :viewBox="`0 0 ${getTemplateViewBox(template).width} ${getTemplateViewBox(template).height}`"
                  class="w-full h-full"
                >
                  <MultiShapeComposer
                    :shapes="template.shapes"
                    :template-width="getTemplateViewBox(template).width"
                    :template-height="getTemplateViewBox(template).height"
                  />
                </svg>
              </div>

              <!-- Template Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-secondary-900">{{ template.name }}</div>
                <div class="text-sm text-secondary-500 truncate">{{ template.description }}</div>
                <div class="text-xs text-secondary-400 mt-1">
                  {{ template.category }} • {{ template.textInputs.length }} text{{ template.textInputs.length !== 1 ? 's' : '' }}
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
import FormLabel from './FormLabel.vue'
import MultiShapeComposer from './MultiShapeComposer.vue'
import type { Template } from '../config/templates'
import { getAvailableTemplates, DEFAULT_TEMPLATE } from '../config/templates'

interface Props {
  selectedTemplate: Template | null
}

interface Emits {
  'update:selectedTemplate': [template: Template]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Component state
const isOpen = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const availableTemplates = ref<Template[]>([])

// Preview dimensions for different template types
const getTemplateViewBox = (template: Template) => {
  switch (template.category) {
    case 'rectangle':
      return { width: 300, height: 100 }
    case 'square':
      return { width: 200, height: 200 }
    case 'circle':
      return { width: 200, height: 200 }
    case 'diamond':
      return { width: 200, height: 200 }
    default:
      return { width: 200, height: 100 }
  }
}

// Preview size for selected template in button
const previewSize = computed(() => {
  if (!props.selectedTemplate) return { width: 24, height: 24 }
  const viewBox = getTemplateViewBox(props.selectedTemplate)
  // Scale to fit in 24x24
  const scale = Math.min(24 / viewBox.width, 24 / viewBox.height)
  return {
    width: Math.round(viewBox.width * scale),
    height: Math.round(viewBox.height * scale)
  }
})

// Load templates on mount
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    const templates = await getAvailableTemplates()

    // Add default template at the beginning
    availableTemplates.value = [DEFAULT_TEMPLATE, ...templates]

    // If no template is selected, select the default
    if (!props.selectedTemplate) {
      emit('update:selectedTemplate', DEFAULT_TEMPLATE)
    }
  } catch (err) {
    error.value = 'Failed to load templates'
    console.error('Error loading templates:', err)
  } finally {
    isLoading.value = false
  }
})

// Handle template selection
const selectTemplate = (template: Template) => {
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>