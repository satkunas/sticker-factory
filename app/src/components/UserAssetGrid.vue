<template>
  <div class="bg-white rounded-lg p-2">
    <div
      class="max-h-64 overflow-y-auto overflow-x-hidden"
      :class="gridContainerClass"
    >
      <div class="w-full min-w-0 grid gap-2 pt-2" :class="gridClass">
        <div
          v-for="item in items"
          :key="item.id"
          class="group relative bg-white border border-secondary-200 rounded-md cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all"
          :class="{
            'ring-2 ring-primary-500 border-primary-500 bg-primary-50 shadow-md shadow-primary-200': isSelected(item),
            'aspect-square p-2 flex items-center justify-center': assetType === 'svg',
            'p-3': assetType === 'font'
          }"
          :title="item.name"
          @click="$emit('select', item)"
        >
          <!-- Content Slot - Allows custom rendering for different asset types -->
          <slot name="item-content" :item="item" :isSelected="isSelected(item)"></slot>

          <!-- Selection Indicator Badge -->
          <div
            v-if="isSelected(item)"
            class="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Selected Label (for SVG type) -->
          <div
            v-if="isSelected(item) && assetType === 'svg'"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium shadow-md z-10"
          >
            Selected
          </div>

          <!-- Delete Button (on hover, hidden when selected) -->
          <button
            v-if="!isSelected(item)"
            type="button"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-700"
            title="Delete"
            @click.stop="$emit('delete', item.id)"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Name Label -->
          <!-- For SVG: show on hover -->
          <div
            v-if="assetType === 'svg'"
            class="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate"
          >
            {{ item.name }}
          </div>
          <!-- For Font: always show below preview -->
          <div
            v-else-if="assetType === 'font'"
            class="text-xs text-center text-secondary-700 truncate"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UserAssetGrid
 * =============
 * Reusable grid component for displaying user-uploaded assets (SVGs, fonts, etc.)
 *
 * Features:
 * - Grid layout with responsive columns
 * - Selection indicators
 * - Delete buttons on hover
 * - Customizable content via slots
 * - Supports both SVG and font asset types
 *
 * Used by:
 * - ExpandableSvgSelector.vue (user SVG images)
 * - ExpandableFontSelector.vue (user fonts)
 */

interface Props {
  /**
   * Array of items to display
   * Each item must have id and name properties
   */
  items: Array<{ id: string; name: string; [key: string]: any }>

  /**
   * ID of the currently selected item
   */
  selectedId?: string | null

  /**
   * Type of asset determines layout and behavior
   * - svg: Square tiles with hover name display
   * - font: Rectangular tiles with always-visible name
   */
  assetType: 'svg' | 'font'

  /**
   * Tailwind grid classes for responsive columns
   * @default 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10' (for SVG)
   */
  gridClass?: string

  /**
   * Additional classes for grid container
   */
  gridContainerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  gridClass: 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10', // Default for SVG
  gridContainerClass: ''
})

interface Emits {
  /**
   * Emitted when an item is clicked
   */
  'select': [item: any]

  /**
   * Emitted when delete button is clicked
   */
  'delete': [id: string]
}

defineEmits<Emits>()

/**
 * Check if an item is currently selected
 */
const isSelected = (item: { id: string }) => item.id === props.selectedId
</script>

<style scoped>
/* Custom scrollbar for the grid */
:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 4px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: #f1f5f9;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 2px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>
