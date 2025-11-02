<template>
  <div ref="containerRef" class="w-full" :data-instance-id="instanceId">
    <!-- Optional Label -->
    <div v-if="label" class="text-sm font-medium text-secondary-700 mb-1">
      {{ label }}
    </div>

    <!-- Expandable Card Wrapper -->
    <div class="relative rounded-lg transition-all duration-300 ease-in-out" :class="{ 'ring-2 ring-primary-500': isExpanded }">
      <!-- Toggle Button -->
      <button
        class="w-full py-2 px-3 bg-white border border-secondary-200 rounded-t-lg text-left focus:outline-none hover:border-secondary-300 transition-colors overflow-hidden"
        :class="{ 'border-primary-500': isExpanded, 'rounded-b-lg': !isExpanded }"
        type="button"
        style="max-height: 60px;"
        @click="toggle"
      >
        <div class="flex items-center justify-between" style="max-height: 40px;">
          <!-- Preview Content Slot -->
          <div class="flex items-center space-x-2 overflow-hidden" style="max-height: 40px;">
            <slot name="preview" :isExpanded="isExpanded"></slot>
          </div>

          <!-- Arrow Icon (identical across all expandable cards) -->
          <svg
            class="w-5 h-5 text-secondary-400 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>

      <!-- Expandable Content Section (identical transition configuration) -->
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
          class="bg-secondary-25 border-t border-secondary-200 overflow-hidden"
        >
          <!-- Expanded Content Slot -->
          <slot name="content"></slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExpandable } from '../composables/useExpandable'

interface Props {
  label?: string
  instanceId?: string
  storageKey: string
}

const props = defineProps<Props>()

// Expandable state management
const { isExpanded, toggle, containerRef } = useExpandable(
  () => props.instanceId,
  props.storageKey
)
</script>
