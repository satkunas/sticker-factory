<template>
  <!-- Wrapper with display: contents makes it transparent to flexbox layout -->
  <div ref="dropdownRef" style="display: contents">
    <!-- Collapsed: Pill Button -->
    <button
      v-if="!isOpen"
      type="button"
      :class="[
        'px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1 whitespace-nowrap',
        'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
      ]"
      @click.stop="toggleDropdown"
    >
      <!-- Color dot (optional, for font categories) -->
      <div
        v-if="colorClass"
        :class="['w-2 h-2 rounded-full', colorClass]"
      />
      <span>{{ displayLabel }}</span>
      <!-- Chevron Icon -->
      <svg
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Expanded: Inline Pills -->
    <template v-else>
      <!-- All option -->
      <button
        type="button"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors whitespace-nowrap',
          modelValue === null
            ? 'bg-primary-100 text-primary-700'
            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
        ]"
        @click="selectCategory(null)"
      >
        {{ allLabel }}
      </button>

      <!-- Category options -->
      <button
        v-for="category in categories"
        :key="category.value"
        type="button"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1 whitespace-nowrap',
          modelValue === category.value
            ? 'bg-primary-100 text-primary-700'
            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
        ]"
        @click="selectCategory(category.value)"
      >
        <!-- Color dot (optional) -->
        <div
          v-if="category.colorClass"
          :class="['w-2 h-2 rounded-full', category.colorClass]"
        />
        <span>{{ category.label }}</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Category {
  value: string
  label: string
  colorClass?: string
}

interface Props {
  modelValue: string | null
  categories: Category[]
  allLabel?: string
}

interface Emits {
  'update:modelValue': [value: string | null]
}

const props = withDefaults(defineProps<Props>(), {
  allLabel: 'All'
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

// Display label for selected category
const displayLabel = computed(() => {
  if (props.modelValue === null) {
    return props.allLabel
  }

  const category = props.categories.find(c => c.value === props.modelValue)
  return category?.label || props.allLabel
})

// Get color class for currently selected category
const colorClass = computed(() => {
  if (props.modelValue === null) {
    return null
  }

  const category = props.categories.find(c => c.value === props.modelValue)
  return category?.colorClass || null
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectCategory = (value: string | null) => {
  emit('update:modelValue', value)
  // Keep expanded when selecting a category (pills stay visible)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
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
