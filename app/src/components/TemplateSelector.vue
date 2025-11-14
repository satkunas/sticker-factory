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

      <!-- Inline Dropdown Content with Tiled Layout -->
      <div
        v-if="isExpanded"
        class="bg-secondary-25 border-t border-secondary-200 overflow-hidden rounded-b-lg"
      >
        <!-- Search Filter -->
        <div class="p-3 bg-white border-b border-secondary-200">
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search templates..."
              class="w-full px-3 py-2 pl-9 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Tiled Grid Layout -->
        <div class="max-h-96 overflow-y-auto p-3">
          <div v-if="filteredTemplates.length === 0" class="text-center py-8 text-secondary-500">
            No templates found matching "{{ searchQuery }}"
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              v-for="template in filteredTemplates"
              :key="template.id"
              :title="template.description"
              class="group relative bg-white border-2 rounded-lg p-3 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              :class="{
                'border-primary-500 ring-2 ring-primary-200': selectedTemplate?.id === template.id,
                'border-secondary-200': selectedTemplate?.id !== template.id
              }"
              @click="selectTemplate(template)"
            >
              <!-- Template Preview -->
              <div class="aspect-[4/3] bg-secondary-50 rounded flex items-center justify-center overflow-hidden mb-2">
                <img
                  :src="getTemplateSvgUrl(template)"
                  :alt="template.name"
                  class="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              <!-- Template Name -->
              <div class="text-xs font-medium text-secondary-900 text-center truncate">
                {{ template.name }}
              </div>

              <!-- Selection Indicator -->
              <div
                v-if="selectedTemplate?.id === template.id"
                class="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, computed, inject, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { loadAllTemplates, getDefaultTemplate } from '../config/template-loader'
import { generateSvgString } from '../utils/svg-string-generator'
import type { SimpleTemplate } from '../types/template-types'

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

// Search query
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// Filtered templates based on search query
const filteredTemplates = computed(() => {
  if (!searchQuery.value.trim()) {
    return templates.value
  }

  const query = searchQuery.value.toLowerCase()
  return templates.value.filter(template =>
    template.name.toLowerCase().includes(query) ||
    template.description?.toLowerCase().includes(query) ||
    template.id.toLowerCase().includes(query)
  )
})

// Template preview URLs (blob URLs cached per template)
const templatePreviewUrls = ref<Map<string, string>>(new Map())

// Template selection handler
const selectTemplate = (template: SimpleTemplate) => {
  emit('update:selectedTemplate', template)
  // Clear search on selection
  searchQuery.value = ''
  // Close dropdown using unified manager
  if (dropdownManager) {
    dropdownManager.close(INSTANCE_ID)
  }
}

// Focus search input when expanded
watch(isExpanded, async (expanded) => {
  if (expanded) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    // Clear search when closing
    searchQuery.value = ''
  }
})

// Generate blob URL for template preview with default values
const getTemplateSvgUrl = (template: SimpleTemplate): string => {
  // Check cache first
  if (templatePreviewUrls.value.has(template.id)) {
    return templatePreviewUrls.value.get(template.id)!
  }

  // Generate SVG with template defaults (empty layers = use all defaults)
  const svgContent = generateSvgString(template, [])
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  // Cache the URL
  templatePreviewUrls.value.set(template.id, url)
  return url
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

  // Clean up blob URLs
  templatePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
  templatePreviewUrls.value.clear()
})
</script>