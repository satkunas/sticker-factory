/**
 * Font Validation Utilities
 *
 * Single source of truth for all font validation.
 * Used by: userFontStore.ts, UploadFontModal.vue
 *
 * Architecture:
 * - Centralized validation logic (no duplication)
 * - Reusable validation functions
 * - Clear error messages for users
 */

import { logger } from './logger'
import { USER_ASSET_CONFIG } from './ui-constants'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Supported font formats
 */
export const SUPPORTED_FONT_FORMATS = [
  'woff2',
  'woff',
  'truetype', // .ttf
  'opentype'  // .otf
] as const

export type FontFormat = typeof SUPPORTED_FONT_FORMATS[number]

/**
 * Valid font MIME types
 */
const VALID_FONT_MIME_TYPES = [
  'font/woff2',
  'font/woff',
  'font/ttf',
  'font/otf',
  'application/font-woff2',
  'application/font-woff',
  'application/x-font-woff2',
  'application/x-font-woff',
  'application/x-font-ttf',
  'application/x-font-truetype',
  'application/x-font-opentype',
  'application/vnd.ms-fontobject'
] as const

/**
 * Valid font extensions
 */
const VALID_FONT_EXTENSIONS = ['.woff2', '.woff', '.ttf', '.otf'] as const
type ValidFontExtension = typeof VALID_FONT_EXTENSIONS[number]

/**
 * Validate font file type by extension and MIME type
 */
export function validateFontFileType(file: File): ValidationResult {
  const extension = file.name.toLowerCase().match(/\.(woff2?|[ot]tf)$/)?.[0]
  const mimeType = file.type.toLowerCase()

  // Check extension
  const hasValidExtension = extension && VALID_FONT_EXTENSIONS.includes(extension as ValidFontExtension)

  // Check MIME type (can be empty or valid)
  const hasValidMimeType = !mimeType || VALID_FONT_MIME_TYPES.some(type => mimeType.includes(type))

  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a font file (.woff2, .woff, .ttf, .otf)'
    }
  }

  if (!hasValidMimeType) {
    logger.warn('Font file has unexpected MIME type:', mimeType, 'for file:', file.name)
  }

  return { valid: true }
}

/**
 * Validate font file size
 */
export function validateFontFileSize(file: File): ValidationResult {
  const maxSizeBytes = USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES

  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(0)
    return {
      valid: false,
      error: `Font too large: ${fileSizeMB}MB (max ${maxSizeMB}MB)`
    }
  }

  return { valid: true }
}

/**
 * Validate that file is not empty
 */
export function validateFontNotEmpty(file: File): ValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Font file is empty'
    }
  }

  return { valid: true }
}

/**
 * Validate font file (type + size + not empty)
 * Main validation function to use
 */
export function validateFont(file: File): ValidationResult {
  // Check not empty
  const emptyValidation = validateFontNotEmpty(file)
  if (!emptyValidation.valid) {
    return emptyValidation
  }

  // Check file type
  const typeValidation = validateFontFileType(file)
  if (!typeValidation.valid) {
    return typeValidation
  }

  // Check file size
  const sizeValidation = validateFontFileSize(file)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  return { valid: true }
}

/**
 * Detect font format from file
 * Returns the format string used for CSS @font-face
 */
export function detectFontFormat(file: File): FontFormat | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type.toLowerCase()

  // Check by extension first (most reliable)
  if (extension === 'woff2') return 'woff2'
  if (extension === 'woff') return 'woff'
  if (extension === 'ttf') return 'truetype'
  if (extension === 'otf') return 'opentype'

  // Check by MIME type as fallback
  if (mimeType.includes('woff2')) return 'woff2'
  if (mimeType.includes('woff')) return 'woff'
  if (mimeType.includes('ttf') || mimeType.includes('truetype')) return 'truetype'
  if (mimeType.includes('otf') || mimeType.includes('opentype')) return 'opentype'

  logger.warn('Unable to detect font format for file:', file.name, 'type:', file.type)
  return null
}
