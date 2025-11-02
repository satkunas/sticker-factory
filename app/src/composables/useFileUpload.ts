/* global DragEvent */
/**
 * Generic file upload composable with drag-and-drop support
 * Handles upload state, validation, and lifecycle for any file type
 */

import { ref, computed } from 'vue'
import { logger } from '../utils/logger'

export interface UseFileUploadOptions<T> {
  /**
   * Function to upload the file and return the uploaded item
   * Should return null if upload fails
   */
  uploadFn: (file: File, customName: string) => Promise<T | null>

  /**
   * Optional callback when upload succeeds
   */
  onSuccess?: (item: T) => void

  /**
   * Optional callback when upload fails
   */
  onError?: (error: string) => void

  /**
   * Optional validation function
   * Should return { valid: true } or { valid: false, error: string }
   */
  validateFn?: (file: File) => { valid: boolean; error?: string }
}

export function useFileUpload<T>(options: UseFileUploadOptions<T>) {
  // State
  const selectedFile = ref<File | null>(null)
  const customName = ref('')
  const isProcessing = ref(false)
  const uploadedItem = ref<T | null>(null)
  const error = ref<string | null>(null)
  const isDragging = ref(false)

  // Computed
  const fileSizeKB = computed(() => {
    if (!selectedFile.value) return 0
    return (selectedFile.value.size / 1000).toFixed(1)
  })

  const uploadState = computed<'idle' | 'processing' | 'success' | 'error'>(() => {
    if (isProcessing.value) return 'processing'
    if (uploadedItem.value && !error.value) return 'success'
    if (error.value) return 'error'
    return 'idle'
  })

  // Actions
  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      selectedFile.value = input.files[0]
      error.value = null
    }
  }

  const handleDragOver = () => {
    isDragging.value = true
  }

  const handleDragLeave = () => {
    isDragging.value = false
  }

  const handleDrop = (event: DragEvent) => {
    isDragging.value = false

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      selectedFile.value = event.dataTransfer.files[0]
      error.value = null
    }
  }

  const clearFile = () => {
    selectedFile.value = null
    customName.value = ''
    error.value = null
  }

  const upload = async () => {
    if (!selectedFile.value) return

    isProcessing.value = true
    error.value = null

    try {
      // Optional validation
      if (options.validateFn) {
        const validation = options.validateFn(selectedFile.value)
        if (!validation.valid) {
          error.value = validation.error || 'Validation failed'
          options.onError?.(error.value)
          return
        }
      }

      // Upload
      const item = await options.uploadFn(
        selectedFile.value,
        customName.value || selectedFile.value.name
      )

      if (!item) {
        error.value = 'Upload failed'
        options.onError?.(error.value)
        return
      }

      // Success
      uploadedItem.value = item
      options.onSuccess?.(item)

      // Auto-reset after delay
      setTimeout(() => {
        reset()
      }, 2000)
    } catch (err) {
      logger.error('Upload error:', err)
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
      options.onError?.(error.value)
    } finally {
      isProcessing.value = false
    }
  }

  const reset = () => {
    selectedFile.value = null
    customName.value = ''
    error.value = null
    uploadedItem.value = null
    isProcessing.value = false
  }

  return {
    // State
    selectedFile,
    customName,
    isProcessing,
    uploadedItem,
    error,
    isDragging,
    // Computed
    fileSizeKB,
    uploadState,
    // Actions
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    upload,
    reset
  }
}
