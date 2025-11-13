<template>
  <div class="bg-white rounded-lg p-3 min-w-0">
    <!-- Label -->
    <div v-if="label" class="text-xs font-medium text-secondary-600 mb-2">
      {{ label }}
    </div>

    <!-- Range + Number Inputs -->
    <div class="flex items-center space-x-2">
      <!-- Range Slider -->
      <input
        :value="displayValue"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :class="{ 'cursor-not-allowed': disabled }"
        class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
        @input="handleInput($event.target.value)"
      >

      <!-- Number Input (with optional absolute-positioned unit) -->
      <div v-if="unitPosition === 'absolute'" class="relative">
        <input
          :value="displayValue"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :class="[numberInputClass, { 'cursor-not-allowed': disabled }]"
          class="px-1 py-1 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
          @input="handleInput($event.target.value)"
        >
        <span class="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400 pointer-events-none">{{ unit }}</span>
      </div>

      <!-- Number Input (standalone) -->
      <input
        v-else
        :value="displayValue"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :class="[numberInputClass, { 'cursor-not-allowed': disabled }]"
        class="px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        @input="handleInput($event.target.value)"
      >

      <!-- Unit Label (inline) -->
      <span v-if="unit && unitPosition === 'inline'" class="text-xs text-secondary-500">{{ unit }}</span>
    </div>

    <!-- Help Text -->
    <div v-if="helpText" class="text-xs text-secondary-500 mt-1">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number | undefined
  min: number
  max: number
  step?: number
  unit?: string                       // Unit symbol (%, px, °, ×)
  unitPosition?: 'inline' | 'absolute'     // Where to show unit
  label?: string                      // Optional label above inputs
  helpText?: string                   // Optional help text below inputs
  valueType?: 'int' | 'float'         // Parse as int or float
  numberInputWidth?: string           // Tailwind width class (w-14, w-16, etc.)
  disabled?: boolean                  // Disable inputs
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  unitPosition: 'inline',
  valueType: 'float',
  numberInputWidth: 'w-14',
  disabled: false
})

const emit = defineEmits<{
  'update:value': [value: number | undefined]
}>()

// Display value (handle undefined)
const displayValue = computed(() => {
  return props.value ?? (props.min + props.max) / 2
})

// Number input class with dynamic width
const numberInputClass = computed(() => {
  let classes = props.numberInputWidth
  // Add right padding if unit is absolute-positioned
  if (props.unitPosition === 'absolute' && props.unit) {
    classes += ' pr-5'
  }
  return classes
})

// Handle input changes
function handleInput(rawValue: string) {
  const parsed = props.valueType === 'int'
    ? parseInt(rawValue)
    : parseFloat(rawValue)

  if (isNaN(parsed)) {
    emit('update:value', undefined)
  } else {
    emit('update:value', parsed)
  }
}
</script>

<style scoped>
/* Custom slider styling (matches existing patterns) */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
