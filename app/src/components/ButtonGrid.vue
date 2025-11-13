<template>
  <div class="bg-white rounded-lg p-2">
    <div
      class="grid gap-1"
      :class="gridClass"
    >
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        :disabled="disabled"
        :title="option.description"
        class="px-2 py-1 text-xs rounded border transition-all text-center"
        :class="[
          value === option.value
            ? 'bg-primary-100 border-primary-300 text-primary-700'
            : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300',
          { 'cursor-not-allowed opacity-50': disabled }
        ]"
        @click="$emit('update:value', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonOption {
  label: string
  value: any
  description?: string
}

interface Props {
  options: ButtonOption[]
  value: any
  columns?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 2,
  disabled: false
})

defineEmits<{
  'update:value': [value: any]
}>()

// Generate Tailwind grid class based on columns
const gridClass = computed(() => {
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  // Support responsive columns: "2" becomes "grid-cols-2" or "2-md:4" becomes "grid-cols-2 md:grid-cols-4"
  return colsMap[props.columns] || 'grid-cols-2'
})
</script>
