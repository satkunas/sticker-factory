<template>
  <div class="bg-secondary-500/5 rounded-lg p-3 md:col-span-2">
    <SectionHeader @reset="$emit('reset')">
      Stroke Options
    </SectionHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Stroke Width -->
      <div :class="{ 'opacity-50': disabled }">
        <RangeNumberInput
          :value="strokeWidth"
          :min="0"
          :max="12"
          :step="0.5"
          :disabled="disabled"
          label="Width"
          numberInputWidth="w-12"
          @update:value="$emit('update:strokeWidth', $event)"
        />
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
import SectionHeader from './SectionHeader.vue'
import RangeNumberInput from './RangeNumberInput.vue'

interface Props {
  strokeWidth: number
  strokeLinejoin: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

defineEmits<{
  'update:strokeWidth': [value: number]
  'update:strokeLinejoin': [value: string]
  reset: []
}>()
</script>
