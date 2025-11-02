<template>
  <!-- Processing State -->
  <div v-if="state === 'processing'" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
    <div class="flex items-center">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
      <p class="text-sm text-blue-800">{{ processingMessage }}</p>
    </div>
  </div>

  <!-- Success State -->
  <div v-if="state === 'success'" class="text-center py-4">
    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 class="text-sm font-medium text-secondary-900 mb-1">
      {{ successTitle }}
    </h3>
    <p class="text-xs text-secondary-600 mb-3">
      {{ successMessage }}
    </p>
    <button
      type="button"
      class="text-sm font-medium text-primary-600 hover:text-primary-700"
      @click="$emit('uploadAnother')"
    >
      {{ uploadAnotherText }}
    </button>
  </div>

  <!-- Error State -->
  <div v-if="state === 'error'" class="py-4">
    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
      <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <h3 class="text-sm font-medium text-secondary-900 mb-2 text-center">
      {{ errorTitle }}
    </h3>
    <p class="text-sm text-red-600 mb-3 text-center bg-red-50 p-3 rounded-md">
      {{ errorMessage }}
    </p>
    <div class="flex justify-center space-x-3">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50"
        @click="$emit('retry')"
      >
        {{ retryText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  state: 'idle' | 'processing' | 'success' | 'error'
  processingMessage?: string
  successTitle?: string
  successMessage?: string
  uploadAnotherText?: string
  errorTitle?: string
  errorMessage?: string
  retryText?: string
}

withDefaults(defineProps<Props>(), {
  processingMessage: 'Processing...',
  successTitle: 'Upload Successful!',
  successMessage: 'Your file is now available below',
  uploadAnotherText: 'Upload Another',
  errorTitle: 'Upload Failed',
  errorMessage: 'An error occurred during upload',
  retryText: 'Try Again'
})

interface Emits {
  'uploadAnother': []
  'retry': []
}

defineEmits<Emits>()
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
