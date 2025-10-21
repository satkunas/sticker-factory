<template>
  <div class="flex items-center justify-between mb-3">
    <component :is="headingTag" :class="headingClass">
      <slot />
    </component>
    <ResetButton v-if="showReset" @click="$emit('reset')" />
  </div>
</template>

<script setup lang="ts">
import ResetButton from './ResetButton.vue'

interface Props {
  headingTag?: 'h4' | 'h5' | 'div'
  headingClass?: string
  showReset?: boolean
}

withDefaults(defineProps<Props>(), {
  headingTag: 'h5',
  headingClass: 'text-sm font-medium text-secondary-700',
  showReset: true
})

defineEmits<{
  reset: []
}>()
</script>
