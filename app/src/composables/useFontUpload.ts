/**
 * Font Upload Composable
 *
 * Provides font-specific file upload functionality with validation,
 * preview state, and format detection.
 *
 * Built on top of the generic useFileUpload composable with font-specific logic:
 * - Font file validation (format, size, structure)
 * - Font format detection (WOFF2, WOFF, TTF, OTF)
 * - Font preview state management
 * - Integration with userFontStore
 */

import { ref, computed, watch } from 'vue'
import { useFileUpload } from './useFileUpload'
import { useUserFontStore, type UserFontItem } from '../stores/userFontStore'
import { validateFont, detectFontFormat } from '../utils/font-validation'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

interface UseFontUploadOptions {
  /**
   * Callback fired after successful font upload
   */
  onSuccess?: (item: UserFontItem) => void
}

/**
 * Font upload composable
 * Wraps useFileUpload with font-specific validation, preview, and storage
 */
export function useFontUpload(options: UseFontUploadOptions = {}) {
  const userFontStore = useUserFontStore()

  // Font preview state (unique to font uploads)
  const fontPreviewReady = ref(false)
  const fontPreviewId = ref<string | null>(null)

  // Use generic file upload with font-specific behavior
  const fileUpload = useFileUpload<UserFontItem>({
    uploadFn: async (file: File, name: string) => {
      // Validate font file
      const validation = validateFont(file)
      if (!validation.valid) {
        throw new Error(validation.error || 'Font validation failed')
      }

      // Upload to user font store
      // Remove file extension from name for cleaner display
      const cleanName = name.replace(/\.(woff2?|[ot]tf)$/i, '')
      const item = await userFontStore.addUserFont(file, cleanName)

      if (!item) {
        throw new Error('Failed to upload font')
      }

      // Setup font preview
      fontPreviewId.value = item.id
      fontPreviewReady.value = true

      return item
    },
    onSuccess: (item) => {
      options.onSuccess?.(item)
    }
  })

  // Watch selectedFile to reset preview when file changes
  watch(fileUpload.selectedFile, () => {
    fontPreviewReady.value = false
    fontPreviewId.value = null
  })

  // Computed properties for font-specific UI
  const maxFontSizeMB = computed(() =>
    (USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES / 1024 / 1024).toFixed(0)
  )

  const fontFormat = computed(() => {
    if (!fileUpload.selectedFile.value) return ''
    const format = detectFontFormat(fileUpload.selectedFile.value)
    return format ? format.toUpperCase() : 'Unknown'
  })

  return {
    // File upload state
    ...fileUpload,

    // Font-specific state
    fontPreviewReady,
    fontPreviewId,

    // Font-specific computed
    maxFontSizeMB,
    fontFormat
  }
}
