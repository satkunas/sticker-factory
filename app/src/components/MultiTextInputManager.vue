<template>
  <div class="space-y-4">
    <!-- Text Input Sections -->
    <div
      v-for="(textInput, index) in template.textInputs"
      :key="`text-input-${textInput.id}`"
      class="border border-secondary-200 rounded-lg p-4 bg-white"
    >
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-secondary-900">
          {{ textInput.label }}
        </h3>
        <span class="text-xs text-secondary-500">{{ index + 1 }} of {{ template.textInputs.length }}</span>
      </div>

      <!-- Text Input -->
      <div class="mb-4">
        <input
          :value="texts[index] || ''"
          type="text"
          class="input-field w-full"
          :placeholder="`Enter ${textInput.label.toLowerCase()}...`"
          :maxlength="textInput.maxLength"
          :style="{
            fontFamily: textFonts[index] ? getFontFamily(textFonts[index]) : 'inherit',
            fontSize: (textFontSizes[index] || 16) + 'px',
            fontWeight: textFontWeights[index] || 400,
            color: textColors[index] || '#000000'
          }"
          @input="updateText(index, $event.target.value)"
        >
        <div class="text-xs text-secondary-500 mt-1">
          {{ (texts[index] || '').length }} / {{ textInput.maxLength }} characters
        </div>
      </div>

      <!-- Expandable Controls -->
      <div class="border-t border-secondary-100 pt-4">
        <button
          class="flex items-center justify-between w-full text-left p-2 rounded hover:bg-secondary-50 transition-colors"
          @click="toggleExpanded(index)"
        >
          <span class="text-sm font-medium text-secondary-700">Text Styling & Effects</span>
          <svg
            class="w-4 h-4 text-secondary-400 transition-transform duration-200"
            :class="{ 'rotate-180': expandedInputs.has(index) }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Expanded Controls -->
        <div
          v-if="expandedInputs.has(index)"
          class="mt-3 p-3 bg-secondary-25 rounded-lg"
        >
          <!-- Font and Styling Controls -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <!-- Text Color -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Color
              </div>
              <div class="flex items-center space-x-1 mb-2">
                <input
                  :ref="el => textColorRefs[index] = el"
                  :value="textColors[index] || '#ffffff'"
                  type="color"
                  class="sr-only"
                  @input="updateTextColor(index, $event.target.value)"
                >
                <button
                  class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors"
                  :style="{ backgroundColor: textColors[index] || '#ffffff' }"
                  :title="`Click to change color (${textColors[index] || '#ffffff'})`"
                  type="button"
                  @click="textColorRefs[index]?.click()"
                />
                <input
                  :value="textColors[index] || '#ffffff'"
                  type="text"
                  class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="#ffffff"
                  @input="updateTextColor(index, $event.target.value)"
                >
              </div>
              <div class="grid grid-cols-6 gap-1">
                <button
                  v-for="color in presetColors.slice(0, 6)"
                  :key="color"
                  class="w-4 h-4 rounded border transition-all"
                  :class="(textColors[index] || '#ffffff') === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  @click="updateTextColor(index, color)"
                />
              </div>
            </div>

            <!-- Font Size -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Size
              </div>
              <div class="flex items-center space-x-2">
                <input
                  :value="textFontSizes[index] || 16"
                  type="range"
                  min="8"
                  max="72"
                  class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                  @input="updateTextFontSize(index, parseInt($event.target.value) || 16)"
                >
                <input
                  :value="textFontSizes[index] || 16"
                  type="number"
                  min="8"
                  max="200"
                  class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="updateTextFontSize(index, parseInt($event.target.value) || 16)"
                >
              </div>
            </div>

            <!-- Font Weight -->
            <div class="min-w-0">
              <div class="text-sm font-medium text-secondary-700 mb-2">
                Weight
              </div>
              <select
                :value="textFontWeights[index] || 400"
                class="w-full px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                @change="updateTextFontWeight(index, parseInt($event.target.value))"
              >
                <option value="300">
                  Light (300)
                </option>
                <option value="400">
                  Regular (400)
                </option>
                <option value="500">
                  Medium (500)
                </option>
                <option value="600">
                  Semi Bold (600)
                </option>
                <option value="700">
                  Bold (700)
                </option>
                <option value="800">
                  Extra Bold (800)
                </option>
              </select>
            </div>

            <!-- Text Rotation -->
            <TextRotationControl
              :rotation="textRotations[index] || textInput.rotation || 0"
              @update:rotation="updateTextRotation(index, $event)"
            />
          </div>

          <!-- Stroke Controls -->
          <div class="border-t border-secondary-200 pt-4">
            <h5 class="text-sm font-medium text-secondary-700 mb-3">
              Text Stroke
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Stroke Color -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Stroke Color
                </div>
                <div class="flex items-center space-x-1">
                  <input
                    :ref="el => strokeColorRefs[index] = el"
                    :value="textStrokeColors[index] || '#000000'"
                    type="color"
                    class="sr-only"
                    @input="updateTextStrokeColor(index, $event.target.value)"
                  >
                  <button
                    class="w-6 h-6 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors"
                    :style="{ backgroundColor: textStrokeColors[index] || '#000000' }"
                    type="button"
                    @click="strokeColorRefs[index]?.click()"
                  />
                </div>
              </div>

              <!-- Stroke Width -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Stroke Width
                </div>
                <input
                  :value="textStrokeWidths[index] || 0"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  class="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                  @input="updateTextStrokeWidth(index, parseFloat($event.target.value) || 0)"
                >
              </div>

              <!-- Stroke Linejoin -->
              <div class="min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Stroke Style
                </div>
                <select
                  :value="textStrokeLinejoins[index] || 'round'"
                  class="w-full px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @change="updateTextStrokeLinejoin(index, $event.target.value)"
                >
                  <option value="round">
                    Round
                  </option>
                  <option value="miter">
                    Miter
                  </option>
                  <option value="bevel">
                    Bevel
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TextRotationControl from './TextRotationControl.vue'
import { getFontFamily, type FontConfig } from '../config/fonts'
import type { Template } from '../config/templates'

interface Props {
  template: Template
  texts: string[]
  textColors: string[]
  textFonts: (FontConfig | null)[]
  textFontSizes: number[]
  textFontWeights: number[]
  textRotations: number[]
  textStrokeWidths: number[]
  textStrokeColors: string[]
  textStrokeLinejoins: string[]
}

interface Emits {
  'update:text': [index: number, value: string]
  'update:textColor': [index: number, value: string]
  'update:textFont': [index: number, value: FontConfig | null]
  'update:textFontSize': [index: number, value: number]
  'update:textFontWeight': [index: number, value: number]
  'update:textRotation': [index: number, value: number]
  'update:textStrokeWidth': [index: number, value: number]
  'update:textStrokeColor': [index: number, value: string]
  'update:textStrokeLinejoin': [index: number, value: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs for color pickers
const textColorRefs = ref<(HTMLInputElement | null)[]>([])
const strokeColorRefs = ref<(HTMLInputElement | null)[]>([])

// Expanded state for each text input
const expandedInputs = ref(new Set<number>())

// Preset colors for quick selection
const presetColors = [
  '#ffffff', '#000000', '#ef4444', '#22c55e', '#3b82f6', '#fbbf24',
  '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#f59e0b'
]

// Toggle expansion for text input controls
const toggleExpanded = (index: number) => {
  if (expandedInputs.value.has(index)) {
    expandedInputs.value.delete(index)
  } else {
    expandedInputs.value.add(index)
  }
}

// Update functions
const updateText = (index: number, value: string) => {
  emit('update:text', index, value)
}

const updateTextColor = (index: number, value: string) => {
  emit('update:textColor', index, value)
}

const updateTextFont = (index: number, value: FontConfig | null) => {
  emit('update:textFont', index, value)
}

const updateTextFontSize = (index: number, value: number) => {
  emit('update:textFontSize', index, value)
}

const updateTextFontWeight = (index: number, value: number) => {
  emit('update:textFontWeight', index, value)
}

const updateTextRotation = (index: number, value: number) => {
  emit('update:textRotation', index, value)
}

const updateTextStrokeWidth = (index: number, value: number) => {
  emit('update:textStrokeWidth', index, value)
}

const updateTextStrokeColor = (index: number, value: string) => {
  emit('update:textStrokeColor', index, value)
}

const updateTextStrokeLinejoin = (index: number, value: string) => {
  emit('update:textStrokeLinejoin', index, value)
}
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: none;
}
</style>