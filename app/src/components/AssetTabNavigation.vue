<template>
  <div class="px-4 pt-4">
    <div class="flex space-x-2 border-b border-secondary-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="[
          activeTabId === tab.id
            ? 'border-b-2 border-primary-600 text-primary-600'
            : 'text-secondary-600 hover:text-secondary-900',
          tab.count !== undefined ? 'flex items-center gap-1.5' : ''
        ]"
        @click="$emit('switchTab', tab.id)"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined && tab.count > 0"
          class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full"
          :class="activeTabId === tab.id ? 'bg-primary-600 text-white' : 'bg-secondary-300 text-secondary-700'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TabConfig {
  id: string
  label: string
  count?: number
}

interface Props {
  tabs: TabConfig[]
  activeTabId: string
}

defineProps<Props>()

interface Emits {
  'switchTab': [tabId: string]
}

defineEmits<Emits>()
</script>
