<template>
  <div ref="containerRef" class="w-full" :data-instance-id="instanceId">
    <!-- Text Input with Arrow Icon -->
    <div class="relative rounded-lg transition-all duration-300 ease-in-out" :class="{ 'ring-2 ring-primary-500': isExpanded }">
      <input
        :value="modelValue"
        type="text"
        class="input-field w-full pr-10 rounded-t-lg"
        :class="{ 'border-primary-500': isExpanded, 'rounded-b-lg': !isExpanded }"
        :placeholder="placeholder"
        :style="{
          fontFamily: selectedFont ? getFontFamily(selectedFont) : undefined
        }"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus"
      >
      <button
        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
        type="button"
        @click="_toggleExpanded"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Expandable Font Selector -->
      <ExpandableFontSelector
      :selectedFont="selectedFont"
      :textColor="textColor"
      :font-size="fontSize"
      :font-weight="fontWeight"
      :text-stroke-width="textStrokeWidth"
      :textStrokeColor="textStrokeColor"
      :text-stroke-linejoin="textStrokeLinejoin"
      :stickerText="modelValue"
      :instanceId="instanceId"
      @update:selectedFont="$emit('update:selectedFont', $event)"
      @update:textColor="$emit('update:textColor', $event)"
      @update:fontSize="$emit('update:fontSize', $event)"
      @update:fontWeight="$emit('update:fontWeight', $event)"
      @update:textStrokeWidth="$emit('update:textStrokeWidth', $event)"
      @update:textStrokeColor="$emit('update:textStrokeColor', $event)"
      @update:textStrokeLinejoin="$emit('update:textStrokeLinejoin', $event)"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import ExpandableFontSelector from './ExpandableFontSelector.vue'
import { getFontFamily, type FontConfig } from '../config/fonts' // Used in template

interface Props {
  modelValue: string
  placeholder?: string
  selectedFont?: FontConfig | null
  textColor?: string
  fontSize?: number
  fontWeight?: number
  textStrokeWidth?: number
  textStrokeColor?: string
  textStrokeLinejoin?: string
  instanceId?: string
}

interface Emits {
  'update:modelValue': [value: string]
  'update:selectedFont': [value: FontConfig | null]
  'update:textColor': [value: string]
  'update:fontSize': [value: number]
  'update:fontWeight': [value: number]
  'update:textStrokeWidth': [value: number]
  'update:textStrokeColor': [value: string]
  'update:textStrokeLinejoin': [value: string]
}

const props = defineProps<Props>()

defineEmits<Emits>()

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedInstances = inject('expandedFontSelectors', ref(new Set<string>()))

// Component container ref for scrolling
const containerRef = ref<HTMLElement>()

// Computed expanded state
const isExpanded = computed(() => {
  const id = props.instanceId
  if (!id) return false

  if (dropdownManager) {
    return dropdownManager.isExpanded(id)
  }
  // Legacy fallback
  return expandedInstances.value.has(id)
})

// Handle focus - expand the options
const handleFocus = () => {
  if (!isExpanded.value) {
    _toggleExpanded()
  }
}

// Toggle expansion
const _toggleExpanded = () => {
  const id = props.instanceId
  if (!id) return

  if (dropdownManager) {
    dropdownManager.toggle(id)
  } else {
    // Legacy fallback
    if (isExpanded.value) {
      expandedInstances.value.delete(id)
    } else {
      // Close all other instances
      expandedInstances.value.clear()
      // Open this instance
      expandedInstances.value.add(id)
    }
  }
}
</script>