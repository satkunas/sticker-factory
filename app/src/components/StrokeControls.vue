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
      <div :class="{ 'opacity-50': disabled }">
        <div class="bg-white rounded-lg p-3 min-w-0">
          <div class="text-xs font-medium text-secondary-600 mb-2">
            Linejoin
          </div>
          <ButtonGrid
            :options="STROKE_LINEJOIN_OPTIONS"
            :value="strokeLinejoin"
            :columns="2"
            :disabled="disabled"
            @update:value="$emit('update:strokeLinejoin', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STROKE_LINEJOIN_OPTIONS } from '../utils/ui-constants'
import SectionHeader from './SectionHeader.vue'
import RangeNumberInput from './RangeNumberInput.vue'
import ButtonGrid from './ButtonGrid.vue'

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
