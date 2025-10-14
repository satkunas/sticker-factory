<template>
  <div class="w-full mb-6" data-instance-id="template-selector">
    <!-- Template Selector Header -->
    <div class="text-sm font-medium text-secondary-700 mb-2">
      Sticker Template
    </div>

    <!-- Expandable Container -->
    <div class="relative rounded-lg transition-all duration-300 ease-in-out" :class="{ 'ring-2 ring-primary-500': isExpanded }">
      <button
        class="w-full px-4 py-3 bg-white border border-secondary-200 rounded-t-lg text-left focus:outline-none hover:border-secondary-300 transition-colors"
        :class="{ 'border-primary-500': isExpanded, 'rounded-b-lg': !isExpanded }"
        @click="toggleExpanded"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Template Preview Icon -->
            <div class="w-8 h-6 bg-secondary-100 rounded border flex items-center justify-center overflow-hidden">
              <img
                v-if="selectedTemplate"
                :src="getTemplateSvgUrl(selectedTemplate)"
                :alt="selectedTemplate.name"
                class="w-full h-full object-contain drop-shadow-sm"
              />
              <div v-else class="w-4 h-4 bg-secondary-300 rounded" />
            </div>

            <!-- Template Info -->
            <div>
              <div class="font-medium text-secondary-900">
                {{ selectedTemplate?.name ? selectedTemplate.name : 'Select Template' }}
              </div>
              <div v-if="selectedTemplate" class="text-xs text-secondary-500">
                {{ selectedTemplate.description }}
              </div>
            </div>
          </div>

          <!-- Dropdown Arrow -->
          <svg
            class="w-5 h-5 text-secondary-400 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>

      <!-- Inline Dropdown Content -->
      <div
        v-if="isExpanded"
        class="bg-secondary-25 border-t border-secondary-200 overflow-hidden rounded-b-lg"
      >
        <div class="max-h-96 overflow-y-auto">
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
                <img
                  :src="getTemplateSvgUrl(template)"
                  :alt="template.name"
                  class="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              <!-- Template Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-secondary-900">
                  {{ template.name }}
                </div>
                <div class="text-sm text-secondary-500 truncate">
                  {{ template.description }}
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
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { loadAllTemplates, getDefaultTemplate } from '../config/template-loader'
import { encodeTemplateStateCompact } from '../utils/url-encoding'
import type { SimpleTemplate } from '../types/template-types'
import type { AppState } from '../types/app-state'

interface Props {
  selectedTemplate?: SimpleTemplate | null
}

interface Emits {
  'update:selectedTemplate': [template: SimpleTemplate]
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// Unified dropdown management
const dropdownManager = inject('dropdownManager')
const INSTANCE_ID = 'template-selector'

// Computed expanded state
const isExpanded = computed(() => {
  if (dropdownManager) {
    return dropdownManager.isExpanded(INSTANCE_ID)
  }
  return false
})

// Toggle expansion
const toggleExpanded = () => {
  if (dropdownManager) {
    dropdownManager.toggle(INSTANCE_ID)
  }
}

// Available templates (loaded dynamically)
const templates = ref<SimpleTemplate[]>([])

// Template selection handler
const selectTemplate = (template: SimpleTemplate) => {
  emit('update:selectedTemplate', template)
  // Close dropdown using unified manager
  if (dropdownManager) {
    dropdownManager.close(INSTANCE_ID)
  }
}

// Generate .svg URL for template preview with default values
const getTemplateSvgUrl = (template: SimpleTemplate): string => {
  // Create minimal state with just template defaults (no user overrides)
  const state: AppState = {
    selectedTemplateId: template.id,
    layers: [], // Empty layers = use all template defaults
    lastModified: Date.now()
  }

  const encoded = encodeTemplateStateCompact(state)
  return `/${encoded}.svg`
}

// Escape key handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isExpanded.value && dropdownManager) {
    dropdownManager.close(INSTANCE_ID)
  }
}

// Load templates on mount and initialize with default template if none selected
onMounted(async () => {
  // Add Escape key listener
  document.addEventListener('keydown', handleKeydown)

  templates.value = await loadAllTemplates()

  if (!props.selectedTemplate && templates.value.length > 0) {
    const defaultTemplate = await getDefaultTemplate()
    if (defaultTemplate) {
      selectTemplate(defaultTemplate)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>