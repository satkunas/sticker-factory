<template>
  <div class="min-w-0">
    <div class="text-xs font-medium text-secondary-600 mb-2">Rotation</div>

    <!-- Rotation Slider and Input -->
    <div class="flex items-center space-x-2 mb-2">
      <input
        :value="rotation"
        @input="updateRotation(parseFloat($event.target.value) || 0)"
        type="range"
        min="-180"
        max="180"
        step="15"
        class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <input
        :value="rotation"
        @input="updateRotation(parseFloat($event.target.value) || 0)"
        type="number"
        min="-180"
        max="180"
        step="15"
        class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <span class="text-xs text-secondary-500 font-mono w-8">°</span>
    </div>

    <!-- Quick Rotation Presets -->
    <div class="grid grid-cols-3 gap-1">
      <button
        v-for="preset in rotationPresets"
        :key="preset.value"
        @click="updateRotation(preset.value)"
        class="px-2 py-1 text-xs rounded border transition-all"
        :class="rotation === preset.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
        :title="`Set rotation to ${preset.value}°`"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Rotation Visual Indicator -->
    <div class="mt-2 flex items-center justify-center">
      <div class="relative w-8 h-8 border border-secondary-300 rounded-full bg-secondary-50">
        <!-- Rotation indicator line -->
        <div
          class="absolute inset-0 flex items-center justify-center"
          :style="{ transform: `rotate(${rotation}deg)` }"
        >
          <div class="w-0.5 h-3 bg-primary-500 rounded-full"></div>
        </div>
        <!-- Center dot -->
        <div class="absolute top-1/2 left-1/2 w-1 h-1 bg-secondary-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rotation: number
}

interface Emits {
  'update:rotation': [value: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Common rotation presets
const rotationPresets = [
  { label: '0°', value: 0 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 },
  { label: '-45°', value: -45 },
  { label: '-90°', value: -90 },
  { label: '180°', value: 180 }
]

// Update rotation with bounds checking
const updateRotation = (value: number) => {
  const clampedValue = Math.max(-180, Math.min(180, value))
  emit('update:rotation', clampedValue)
}
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: none;
}
</style>