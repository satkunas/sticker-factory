<template>
  <div class="bg-white rounded-lg p-4">
    <!-- File Drop Zone -->
    <div
      class="border-2 border-dashed rounded-lg transition-colors cursor-pointer"
      :class="{
        'border-primary-400 bg-primary-50': isDragging,
        'border-secondary-300 hover:border-primary-400': !isDragging
      }"
      @click="triggerFileInput"
      @dragover.prevent="$emit('dragover')"
      @dragleave.prevent="$emit('dragleave')"
      @drop.prevent="$emit('drop', $event)"
    >
      <div class="p-4 text-center">
        <!-- Upload Icon -->
        <slot name="icon">
          <svg class="mx-auto h-10 w-10 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </slot>

        <!-- File Input -->
        <div class="mt-2">
          <label
            :for="inputId"
            class="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <span>Choose {{ fileTypeLabel }}</span>
            <input
              :id="inputId"
              ref="fileInputRef"
              type="file"
              :accept="accept"
              class="sr-only"
              @change="$emit('fileSelect', $event)"
            >
          </label>
          <span class="text-sm text-secondary-600"> or drag and drop</span>
        </div>

        <!-- Help Text -->
        <p class="mt-1 text-xs text-secondary-500">
          {{ helpText }}
        </p>
      </div>
    </div>

    <!-- Selected File Info -->
    <div v-if="selectedFile" class="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-secondary-900 truncate">
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-secondary-500">
            {{ fileSizeKB }} KB
            <slot name="file-extra-info"></slot>
          </p>
        </div>
        <button
          type="button"
          class="ml-2 text-secondary-400 hover:text-secondary-600"
          @click="$emit('clearFile')"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Custom Name Input -->
      <div class="mt-3">
        <input
          :value="customName"
          type="text"
          placeholder="Enter a name (optional)"
          class="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="$emit('update:customName', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Additional Content Slot (e.g., preview) -->
      <slot name="file-extra-content"></slot>

      <!-- Upload Button -->
      <button
        type="button"
        class="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :disabled="isProcessing"
        @click="$emit('upload')"
      >
        {{ isProcessing ? uploadingText : uploadText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/* global DragEvent */
import { ref } from 'vue'

interface Props {
  inputId: string
  accept: string
  fileTypeLabel: string
  helpText: string
  selectedFile: File | null
  fileSizeKB: string
  customName: string
  isProcessing: boolean
  isDragging: boolean
  uploadText?: string
  uploadingText?: string
}

withDefaults(defineProps<Props>(), {
  uploadText: 'Upload',
  uploadingText: 'Uploading...'
})

interface Emits {
  'fileSelect': [event: Event]
  'clearFile': []
  'upload': []
  'dragover': []
  'dragleave': []
  'drop': [event: DragEvent]
  'update:customName': [value: string]
}

defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()

/**
 * Trigger file input when clicking anywhere on the drop zone
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

defineExpose({
  fileInputRef
})
</script>
