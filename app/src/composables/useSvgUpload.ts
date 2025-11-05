/**
 * SVG Upload Composable
 *
 * Provides SVG-specific file upload functionality with validation,
 * preview state, and sanitization.
 *
 * Built on top of the generic useFileUpload composable with SVG-specific logic:
 * - SVG file validation (format, size, structure, security)
 * - SVG sanitization (remove dangerous content)
 * - SVG preview state management
 * - Integration with userSvgStore
 */

import { ref, computed, watch } from 'vue'
import { useFileUpload } from './useFileUpload'
import { useUserSvgStore, type UserSvgItem } from '../stores/userSvgStore'
import { validateSvgFile } from '../utils/svg-validation'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

interface UseSvgUploadOptions {
  /**
   * Callback fired after successful SVG upload
   */
  onSuccess?: (item: UserSvgItem) => void
}

/**
 * SVG upload composable
 * Wraps useFileUpload with SVG-specific validation, sanitization, preview, and storage
 */
export function useSvgUpload(options: UseSvgUploadOptions = {}) {
  const userSvgStore = useUserSvgStore()

  // SVG preview state (unique to SVG uploads)
  const svgPreviewReady = ref(false)
  const svgPreviewId = ref<string | null>(null)

  // Use generic file upload with SVG-specific behavior
  const fileUpload = useFileUpload<UserSvgItem>({
    uploadFn: async (file: File, name: string) => {
      // Validate and sanitize SVG file
      const validation = await validateSvgFile(file, USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES)
      if (!validation.valid) {
        throw new Error(validation.error || 'SVG validation failed')
      }

      // Upload to user SVG store with sanitized content
      // Remove .svg extension from name for cleaner display
      const cleanName = name.replace(/\.svg$/i, '')
      const item = await userSvgStore.addUserSvg(validation.sanitized!, cleanName)

      if (!item) {
        throw new Error(userSvgStore.error.value || 'Failed to upload SVG')
      }

      // Setup SVG preview
      svgPreviewId.value = item.id
      svgPreviewReady.value = true

      return item
    },
    onSuccess: (item) => {
      options.onSuccess?.(item)
    }
  })

  // Watch selectedFile to reset preview when file changes
  watch(fileUpload.selectedFile, () => {
    svgPreviewReady.value = false
    svgPreviewId.value = null
  })

  // Computed properties for SVG-specific UI
  const maxSvgSizeKB = computed(() =>
    (USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES / 1000).toFixed(0)
  )

  return {
    // File upload state
    ...fileUpload,

    // SVG-specific state
    svgPreviewReady,
    svgPreviewId,

    // SVG-specific computed
    maxSvgSizeKB
  }
}
