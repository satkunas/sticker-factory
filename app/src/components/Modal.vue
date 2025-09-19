<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50"
        @click="$emit('close')"
      />
      
      <!-- Modal -->
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-secondary-200">
          <h3 class="text-lg font-semibold text-secondary-900">
            {{ title }}
          </h3>
          <button 
            class="p-1 rounded-md text-secondary-400 hover:text-secondary-600"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="flex-1 p-6 overflow-y-auto">
          <slot />
        </div>
        
        <!-- Footer -->
        <div v-if="$slots.footer" class="p-6 border-t border-secondary-200">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { getKeyboardStore } from '../stores/keyboard'

interface Props {
  show: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// Get keyboard store instance
const keyboardStore = getKeyboardStore()

// Track escape key listener cleanup function
let unregisterEscape: (() => void) | null = null

// Watch for modal show/hide to register/unregister escape listener
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    // Register escape key listener when modal opens
    unregisterEscape = keyboardStore.onEscape(() => {
      emit('close')
    })
  } else {
    // Unregister escape key listener when modal closes
    if (unregisterEscape) {
      unregisterEscape()
      unregisterEscape = null
    }
  }
}, { immediate: true })

// Cleanup on component unmount
onUnmounted(() => {
  if (unregisterEscape) {
    unregisterEscape()
  }
})
</script>