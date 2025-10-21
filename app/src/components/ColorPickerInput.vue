<template>
  <div class="bg-secondary-500/5 rounded-lg p-3">
    <SectionHeader headingTag="div" @reset="$emit('reset')">
      {{ label }}
    </SectionHeader>

    <div class="bg-white rounded-lg p-2 flex items-center space-x-1 mb-2">
      <!-- Hidden native color input -->
      <input
        ref="colorInputRef"
        :value="value"
        type="color"
        class="sr-only"
        @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      >

      <!-- Color picker button -->
      <button
        class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex items-center justify-center"
        :style="value === COLOR_NONE ? { backgroundColor: 'white' } : { backgroundColor: value }"
        :title="`Click to change ${label.toLowerCase()} (${value})`"
        type="button"
        @click="(colorInputRef as HTMLInputElement | undefined)?.click()"
      >
        <svg v-if="value === COLOR_NONE" class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <input
        :value="value"
        type="text"
        class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        :placeholder="placeholder"
        @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="bg-white rounded-lg p-2">
      <!-- Row 1: None button + first 11 colors -->
      <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
        <!-- None button with red cross icon -->
        <button
          class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all flex items-center justify-center bg-white"
          :class="value === COLOR_NONE ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
          :title="noneLabel"
          type="button"
          @click="$emit('update:value', COLOR_NONE)"
        >
          <svg class="w-2 h-2 md:w-3 md:h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          v-for="color in PRESET_COLORS.slice(0, 11)"
          :key="color"
          class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
          :class="value === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
          :style="{ backgroundColor: color }"
          :title="color"
          type="button"
          @click="$emit('update:value', color)"
        />
      </div>

      <!-- Row 2: Colors 11-22 -->
      <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
        <button
          v-for="color in PRESET_COLORS.slice(11, 23)"
          :key="color"
          class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
          :class="value === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
          :style="{ backgroundColor: color }"
          :title="color"
          type="button"
          @click="$emit('update:value', color)"
        />
      </div>

      <!-- Row 3: Colors 23-34 -->
      <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
        <button
          v-for="color in PRESET_COLORS.slice(23, 35)"
          :key="color"
          class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
          :class="value === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
          :style="{ backgroundColor: color }"
          :title="color"
          type="button"
          @click="$emit('update:value', color)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PRESET_COLORS, COLOR_NONE } from '../utils/ui-constants'
import SectionHeader from './SectionHeader.vue'

interface Props {
  value: string
  label: string
  placeholder?: string
  noneLabel?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: '#000000',
  noneLabel: 'None'
})

defineEmits<{
  'update:value': [value: string]
  reset: []
}>()

const colorInputRef = ref<HTMLInputElement>()
</script>
