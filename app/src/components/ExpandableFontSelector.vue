<template>
  <!-- Inline Accordion Design -->
  <div ref="containerRef" class="w-full">
    <!-- Accordion Content -->
    <Transition
      name="slide-down"
      enterActiveClass="transition-all duration-300 ease-out"
      leaveActiveClass="transition-all duration-300 ease-in"
      enterFromClass="max-h-0 opacity-0"
      enterToClass="max-h-[1000px] opacity-100"
      leaveFromClass="max-h-[1000px] opacity-100"
      leaveToClass="max-h-0 opacity-0"
    >
      <div
        v-if="isExpanded"
        class="bg-secondary-25 border-t border-secondary-200 overflow-hidden rounded-b-lg"
      >
      <!-- Text Styling Section -->
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorPickerInput
            :value="textColor"
            label="Color"
            placeholder="#000000"
            noneLabel="None (invisible text)"
            @update:value="$emit('update:textColor', $event)"
            @reset="$emit('reset:textColor')"
          />

          <!-- Font Size & Weight Section -->
          <div class="bg-secondary-500/5 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-medium text-secondary-700">
                Size & Weight
              </div>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:fontSize'); $emit('reset:fontWeight')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
              <!-- Size Controls -->
              <div class="bg-white rounded-lg p-2 flex items-center space-x-2 mb-2">
                <input
                  :value="fontSize"
                  type="range"
                  min="8"
                  max="200"
                  class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || undefined)"
                >
                <input
                  :value="fontSize"
                  type="number"
                  min="8"
                  max="500"
                  class="w-12 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  @input="$emit('update:fontSize', parseInt($event.target.value) || undefined)"
                >
              </div>
              <div class="bg-white rounded-lg p-2 mb-2">
              <div class="grid grid-cols-3 md:grid-cols-6 gap-1">
                <button
                  v-for="size in COMMON_FONT_SIZES"
                  :key="size"
                  class="px-1 py-1 text-xs rounded border transition-all"
                  :class="fontSize === size ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontSize', size)"
                >
                  {{ size }}
                </button>
              </div>
              </div>
              <!-- Weight Controls -->
              <div class="bg-white rounded-lg p-2">
              <div class="grid grid-cols-2 gap-1 mb-2">
                <button
                  v-for="weight in fontWeights.slice(0, 4)"
                  :key="weight.value"
                  class="px-2 py-1 text-xs rounded border transition-all"
                  :class="fontWeight === weight.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontWeight', weight.value)"
                >
                  {{ weight.label }}
                </button>
              </div>
              <div v-if="fontWeights.length > 4" class="grid grid-cols-2 gap-1">
                <button
                  v-for="weight in fontWeights.slice(4)"
                  :key="weight.value"
                  class="px-2 py-1 text-xs rounded border transition-all"
                  :class="fontWeight === weight.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                  @click="$emit('update:fontWeight', weight.value)"
                >
                  {{ weight.label }}
                </button>
              </div>
              </div>
          </div>

          <!-- Line Height Control (only shown for multiline text) -->
          <div v-if="multiline" class="bg-secondary-500/5 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-secondary-700">
                Multi-line Spacing
              </h5>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:lineHeight')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1">
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Line Height
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="lineHeight ?? 1.2"
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:lineHeight', parseFloat($event.target.value))"
                  >
                  <input
                    :value="lineHeight ?? 1.2"
                    type="number"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="$emit('update:lineHeight', parseFloat($event.target.value))"
                  >
                  <span class="text-xs text-secondary-500">×</span>
                </div>
                <div class="text-xs text-secondary-500 mt-1">
                  Controls spacing between lines (1.0 = tight, 2.0 = loose)
                </div>
              </div>
            </div>
          </div>

          <!-- Rotation Control (hidden for textPath as rotation is incompatible with curved text) -->
          <div v-if="!textPath" class="bg-secondary-500/5 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-secondary-700">
                Text Rotation
              </h5>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:rotation')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1">
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Rotation
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="rotation ?? 0"
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="handleRotationInput($event.target.value)"
                  >
                  <div class="relative">
                    <input
                      :value="rotation ?? 0"
                      type="number"
                      step="1"
                      class="w-14 px-1 py-1 pr-4 text-xs border border-secondary-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
                      @input="handleRotationInput($event.target.value)"
                    >
                    <span class="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400 pointer-events-none">°</span>
                  </div>
                </div>
                <div class="text-xs text-secondary-500 mt-1">
                  Rotate text (-180 to 180 degrees, positive = clockwise)
                </div>
              </div>
            </div>
          </div>

          <!-- Stroke Controls -->
          <div class="bg-secondary-500/5 rounded-lg p-3 md:col-span-2">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-secondary-700">
                Text Stroke
              </h5>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:textStrokeColor'); $emit('reset:textStrokeWidth'); $emit('reset:textStrokeLinejoin')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Stroke Color -->
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Color
                </div>
                <div class="flex items-center space-x-1 mb-2">
                  <!-- Hidden color input -->
                  <input
                    ref="strokeColorInputRef"
                    :value="textStrokeColor"
                    type="color"
                    class="sr-only"
                    @input="$emit('update:textStrokeColor', $event.target.value)"
                  >
                  <!-- Color picker button -->
                  <button
                    class="w-7 h-7 rounded border border-secondary-300 cursor-pointer hover:border-secondary-400 transition-colors flex-shrink-0 flex items-center justify-center"
                    :style="textStrokeColor === COLOR_NONE ? { backgroundColor: 'white' } : { backgroundColor: textStrokeColor }"
                    :title="`Click to change stroke color (${textStrokeColor})`"
                    type="button"
                    @click="$refs.strokeColorInputRef?.click()"
                  >
                    <svg v-if="textStrokeColor === COLOR_NONE" class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <input
                    :value="textStrokeColor"
                    type="text"
                    class="flex-1 px-2 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="#000000"
                    @input="$emit('update:textStrokeColor', $event.target.value)"
                  >
                </div>
                <div class="grid grid-cols-6 md:grid-cols-12 gap-1">
                  <!-- None button with red cross icon -->
                  <button
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all flex items-center justify-center bg-white"
                    :class="textStrokeColor === COLOR_NONE ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :title="'None (no text stroke)'"
                    @click="$emit('update:textStrokeColor', COLOR_NONE)"
                  >
                    <svg class="w-2 h-2 md:w-3 md:h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button
                    v-for="color in PRESET_COLORS.slice(0, 11)"
                    :key="color"
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                    :class="textStrokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="$emit('update:textStrokeColor', color)"
                  />
                </div>
                <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                  <button
                    v-for="color in PRESET_COLORS.slice(11, 23)"
                    :key="color"
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                    :class="textStrokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="$emit('update:textStrokeColor', color)"
                  />
                </div>
                <div class="grid grid-cols-6 md:grid-cols-12 gap-1 mt-1">
                  <button
                    v-for="color in PRESET_COLORS.slice(23, 35)"
                    :key="color"
                    class="w-4 h-4 md:w-5 md:h-5 rounded border transition-all"
                    :class="textStrokeColor === color ? 'border-secondary-600 scale-110' : 'border-secondary-200 hover:border-secondary-400'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                    @click="$emit('update:textStrokeColor', color)"
                  />
                </div>
              </div>

              <!-- Stroke Width -->
              <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': textStrokeColor === COLOR_NONE }">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Width
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="textStrokeWidth"
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    :disabled="textStrokeColor === COLOR_NONE"
                    :class="{ 'cursor-not-allowed': textStrokeColor === COLOR_NONE }"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:textStrokeWidth', parseFloat($event.target.value) || undefined)"
                  >
                  <input
                    :value="textStrokeWidth"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    :disabled="textStrokeColor === COLOR_NONE"
                    :class="{ 'cursor-not-allowed': textStrokeColor === COLOR_NONE }"
                    class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="$emit('update:textStrokeWidth', parseFloat($event.target.value) || undefined)"
                  >
                </div>
              </div>

              <!-- Stroke Linejoin -->
              <div class="bg-white rounded-lg p-3 min-w-0" :class="{ 'opacity-50': textStrokeColor === COLOR_NONE }">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Linejoin
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <button
                    v-for="linejoin in STROKE_LINEJOIN_OPTIONS"
                    :key="linejoin.value"
                    :disabled="textStrokeColor === COLOR_NONE"
                    class="px-2 py-1 text-xs rounded border transition-all text-center"
                    :class="[
                      textStrokeLinejoin === linejoin.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300',
                      { 'cursor-not-allowed': textStrokeColor === COLOR_NONE }
                    ]"
                    :title="linejoin.description"
                    @click="$emit('update:textStrokeLinejoin', linejoin.value)"
                  >
                    {{ linejoin.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TextPath Controls (Curved Text) - Only shown when textPath exists -->
          <div v-if="textPath" class="bg-secondary-500/5 rounded-lg p-3 md:col-span-2">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-secondary-700">
                Curved Text Position
              </h5>
              <button
                type="button"
                class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                title="Reset to template default"
                @click="$emit('reset:startOffset'); $emit('reset:dy'); $emit('reset:dominantBaseline')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Start Offset -->
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Start Offset (%)
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="parseFloat(startOffset ?? '0')"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="$emit('update:startOffset', `${$event.target.value}%`)"
                  >
                  <input
                    :value="parseFloat(startOffset ?? '0')"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="$emit('update:startOffset', `${$event.target.value}%`)"
                  >
                  <span class="text-xs text-secondary-500">%</span>
                </div>
              </div>

              <!-- Vertical Offset (dy) -->
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Vertical Offset (px)
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    :value="dy ?? 0"
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    class="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="handleDyInput($event.target.value)"
                  >
                  <input
                    :value="dy ?? 0"
                    type="number"
                    min="-100"
                    max="100"
                    step="1"
                    class="w-14 px-1 py-1 text-xs border border-secondary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    @input="handleDyInput($event.target.value)"
                  >
                  <span class="text-xs text-secondary-500">px</span>
                </div>
              </div>

              <!-- Dominant Baseline (text alignment on path) -->
              <div class="bg-white rounded-lg p-3 min-w-0">
                <div class="text-xs font-medium text-secondary-600 mb-2">
                  Baseline Alignment
                </div>
                <div class="grid grid-cols-3 gap-1">
                  <button
                    v-for="baseline in DOMINANT_BASELINE_OPTIONS"
                    :key="baseline.value"
                    class="px-2 py-1 text-xs rounded border transition-all text-center"
                    :class="(dominantBaseline ?? 'auto') === baseline.value ? 'bg-primary-100 border-primary-300 text-primary-700' : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'"
                    :title="baseline.description"
                    @click="$emit('update:dominantBaseline', baseline.value)"
                  >
                    {{ baseline.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Font Selection Section -->
      <div class="p-4 mx-4 bg-secondary-500/5 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h4 class="section-header">
            Font Family
          </h4>
          <button
            type="button"
            class="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
            title="Reset to template default"
            @click="$emit('reset:selectedFont')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="mb-2 bg-white rounded-lg p-2">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search fonts..."
              class="w-full px-3 py-2 pr-8 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
            <button
              v-if="searchQuery.length > 0"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
              type="button"
              title="Clear search"
              @click="searchQuery = ''"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Category Filter and Results Count -->
          <div class="mt-2 flex items-center gap-2">
            <CategoryDropdown
              v-model="selectedCategory"
              :categories="fontCategoryOptions"
              allLabel="All Fonts"
            />
            <div v-if="filteredFonts.length > 0" class="text-sm text-secondary-600 whitespace-nowrap">
              {{ filteredFonts.length }} {{ filteredFonts.length === 1 ? 'font' : 'fonts' }} found
            </div>
          </div>
        </div>

        <!-- Font List -->
        <div class="bg-white rounded-lg p-2">
          <div ref="fontListContainer" class="max-h-80 overflow-y-auto overflow-x-hidden" @scroll="handleScroll">
            <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
              <FontTile
                v-for="font in visibleFonts"
                :key="font.name"
                :ref="el => { if (selectedFont?.name === font.name && el) selectedFontTile = el }"
                :font="font"
                :isSelected="selectedFont?.name === font.name"
                :stickerText="stickerText"
                @select="selectFont"
              />
            </div>

            <!-- Loading indicator -->
            <div v-if="isLoadingMore && visibleFonts.length < filteredFonts.length" class="py-2 text-center text-secondary-500">
              <div class="text-xs">
                Loading more fonts...
              </div>
            </div>

            <div v-if="filteredFonts.length === 0" class="py-4 text-center text-secondary-500">
              <p class="text-sm">
                No fonts found matching "{{ searchQuery }}"
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject, nextTick } from 'vue'
import { FONT_CATEGORIES, loadFont, type FontConfig } from '../config/fonts'
import FontTile from './FontTile.vue'
import CategoryDropdown from './CategoryDropdown.vue'
import ColorPickerInput from './ColorPickerInput.vue'
import { useFontSelector } from '../composables/useFontSelector'
import { getFontCategoryColor } from '../utils/font-utils'
import { PRESET_COLORS, COMMON_FONT_SIZES, STROKE_LINEJOIN_OPTIONS, DOMINANT_BASELINE_OPTIONS, COLOR_NONE } from '../utils/ui-constants'
import { logger } from '../utils/logger'

interface Props {
  selectedFont?: FontConfig | null
  textColor?: string
  fontSize?: number
  fontWeight?: number
  textStrokeWidth?: number
  textStrokeColor?: string
  textStrokeLinejoin?: string
  stickerText?: string
  instanceId?: string
  // TextPath properties for curved text
  textPath?: string
  startOffset?: string
  dy?: number
  dominantBaseline?: string
  // Multi-line text properties
  multiline?: boolean
  lineHeight?: number
  // Rotation property (for all text types)
  rotation?: number
}

interface Emits {
  'update:selectedFont': [value: FontConfig | null]
  'update:textColor': [value: string]
  'update:fontSize': [value: number]
  'update:fontWeight': [value: number]
  'update:textStrokeWidth': [value: number]
  'update:textStrokeColor': [value: string]
  'update:textStrokeLinejoin': [value: string]
  // TextPath emit events
  'update:startOffset': [value: string]
  'update:dy': [value: number]
  'update:dominantBaseline': [value: string]
  // Multi-line text emit events
  'update:lineHeight': [value: number]
  // Rotation emit event
  'update:rotation': [value: number]
  // Reset emit events
  'reset:selectedFont': []
  'reset:textColor': []
  'reset:fontSize': []
  'reset:fontWeight': []
  'reset:textStrokeWidth': []
  'reset:textStrokeColor': []
  'reset:textStrokeLinejoin': []
  'reset:startOffset': []
  'reset:dy': []
  'reset:dominantBaseline': []
  'reset:lineHeight': []
  'reset:rotation': []
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// Input handlers - validate before emitting
const handleRotationInput = (value: string) => {
  const parsed = parseFloat(value)
  if (!isNaN(parsed)) {
    emit('update:rotation', parsed)
  }
}

const handleDyInput = (value: string) => {
  const parsed = parseInt(value)
  if (!isNaN(parsed)) {
    emit('update:dy', parsed)
  }
}

// Color picker reference (for stroke color only, text color now uses ColorPickerInput component)
const strokeColorInputRef = ref<HTMLInputElement>()

// Unified dropdown management
const dropdownManager = inject('dropdownManager')

// Legacy fallback for backward compatibility
const expandedInstances = inject('expandedFontSelectors', ref(new Set<string>()))

// Local state
const loadedFonts = ref(new Set<string>())
const selectedFontTile = ref<HTMLElement>()

// Use font selector composable
const {
  searchQuery,
  selectedCategory,
  fontListContainer,
  visibleFontCount,
  isLoadingMore,
  filteredFonts,
  visibleFonts,
  fontWeights,
  handleScroll
} = useFontSelector(computed(() => props.selectedFont))

// Prepare font categories for dropdown
const fontCategoryOptions = computed(() => {
  return Object.entries(FONT_CATEGORIES).map(([value, label]) => ({
    value,
    label,
    colorClass: getFontCategoryColor(value)
  }))
})

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



// Note: Font loading is now handled by individual FontTile components via lazy loading
// This improves performance by only loading fonts that are actually visible

// Auto-scroll to selected font
const scrollToSelectedFont = async () => {
  if (!props.selectedFont || !fontListContainer.value) return
  
  // Wait for DOM update
  await nextTick()
  
  // Find the selected font index in visible fonts
  const selectedIndex = visibleFonts.value.findIndex(font => font.name === props.selectedFont?.name)
  
  if (selectedIndex === -1) {
    // Font not visible, check if it's in filtered fonts
    const globalIndex = filteredFonts.value.findIndex(font => font.name === props.selectedFont?.name)
    if (globalIndex >= 0) {
      // Ensure the font is loaded by increasing visible count
      visibleFontCount.value = Math.max(visibleFontCount.value, globalIndex + 10)
      await nextTick()
    }
  }
  
  // Wait for the selected font tile ref to be updated
  await nextTick()
  
  // Use the selectedFontTile ref for precise scrolling if available
  if (selectedFontTile.value) {
    const container = fontListContainer.value
    const tile = selectedFontTile.value as HTMLElement
    
    // Get the position of the tile relative to the container
    const containerRect = container.getBoundingClientRect()
    const tileRect = tile.getBoundingClientRect()
    
    // Calculate how much to scroll to center the tile
    const tileRelativeTop = tileRect.top - containerRect.top + container.scrollTop
    const scrollTarget = tileRelativeTop - container.clientHeight / 2 + tile.clientHeight / 2
    
    // Smooth scroll to the target position
    container.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: 'smooth'
    })
  } else {
    // Fallback: calculate position based on index
    const updatedIndex = visibleFonts.value.findIndex(font => font.name === props.selectedFont?.name)
    if (updatedIndex >= 0) {
      const container = fontListContainer.value
      const containerWidth = container.clientWidth
      const tileWidth = 80 // approximate tile width including gap
      const columns = Math.floor(containerWidth / tileWidth)
      const row = Math.floor(updatedIndex / columns)
      const rowHeight = 80 // approximate tile height including gap
      
      // Scroll to the row containing the selected font
      container.scrollTo({
        top: Math.max(0, row * rowHeight - container.clientHeight / 2),
        behavior: 'smooth'
      })
    }
  }
}

// Watch for expansion state changes to trigger auto-scroll
watch(isExpanded, async (newExpanded) => {
  if (newExpanded && props.selectedFont) {
    // Small delay to ensure the accordion is fully expanded
    setTimeout(scrollToSelectedFont, 150)
  }
})

// Also watch for selectedFont changes when already expanded
watch(() => props.selectedFont, async () => {
  if (isExpanded.value) {
    setTimeout(scrollToSelectedFont, 150)
  }
})

// Font selection
const selectFont = async (font: FontConfig) => {
  if (font.name === props.selectedFont?.name) return
  
  try {
    // Load font if not already loaded
    if (!loadedFonts.value.has(font.name)) {
      await loadFont(font)
      loadedFonts.value.add(font.name)
    }
    
    emit('update:selectedFont', font)
  } catch (error) {
    // Still emit the font change, fallback will be used
    emit('update:selectedFont', font)
  }
}

// Load default font on mount
watch(() => props.selectedFont, async (newFont) => {
  if (newFont && !loadedFonts.value.has(newFont.name)) {
    try {
      await loadFont(newFont)
      loadedFonts.value.add(newFont.name)
    } catch (error) {
      // Font loading failed, continue without error
      logger.warn('Failed to load font:', newFont.name, error)
    }
  }
}, { immediate: true })

// Handle escape key to close
const handleKeydown = (event: KeyboardEvent) => {
  const id = props.instanceId
  if (event.key === 'Escape' && isExpanded.value && id) {
    if (dropdownManager) {
      dropdownManager.close(id)
    } else {
      // Legacy fallback
      expandedInstances.value.delete(id)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (dropdownManager) {
    dropdownManager.close(props.instanceId)
  } else {
    // Legacy fallback
    expandedInstances.value.delete(props.instanceId)
  }
})
</script>