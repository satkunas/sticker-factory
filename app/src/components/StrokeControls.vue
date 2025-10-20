<template>
  <div class="bg-secondary-500/5 rounded-lg p-3 md:col-span-2">
    <div class="flex items-center justify-between mb-3">
      <h5 class="text-sm font-medium text-secondary-700">
        Stroke Options
      </h5>
      <ResetButton @click="$emit('reset')" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Stroke Width -->
      <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': disabled }">
        <div class="text-xs font-medium text-secondary-600 mb-2">
          Width
        </div>
        <div class="flex items-center space-x-2">
          <input
            :value="strokeWidth"
            type="range"
            min="0"
            max="12"
            step="0.5"
            :disabled="disabled"
            :class="{ 'cursor-not-allowed': disabled }"
            class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
            @input="handleStrokeWidthInput(($event.target as HTMLInputElement).value)"
          >
          <input
            :value="strokeWidth"
            type="number"
            min="0"
            max="12"
            step="0.5"
            :disabled="disabled"
            :class="{ 'cursor-not-allowed': disabled }"
            class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
            @input="handleStrokeWidthInput(($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- Stroke Linejoin -->
      <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': disabled }">
        <div class="text-xs font-medium text-secondary-600 mb-2">
          Linejoin
        </div>
        <div class="grid grid-cols-2 gap-1">
          <button
            v-for="linejoin in STROKE_LINEJOIN_OPTIONS"
            :key="linejoin.value"
            :disabled="disabled"
            class="px-2 py-1 text-xs rounded border transition-all text-center"
            :class="[
              strokeLinejoin === linejoin.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300',
              { 'cursor-not-allowed': disabled }
            ]"
            :title="linejoin.description"
            type="button"
            @click="$emit('update:strokeLinejoin', linejoin.value)"
          >
            {{ linejoin.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STROKE_LINEJOIN_OPTIONS } from '../utils/ui-constants'
import ResetButton from './ResetButton.vue'

interface Props {
  strokeWidth: number
  strokeLinejoin: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:strokeWidth': [value: number]
  'update:strokeLinejoin': [value: string]
  reset: []
}>()

function handleStrokeWidthInput(value: string) {
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) {
    emit('update:strokeWidth', parsed)
  }
}
</script>
