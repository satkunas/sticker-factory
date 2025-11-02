/**
 * SVG Validation Utilities
 *
 * Single source of truth for all SVG validation and sanitization.
 * Used by: userSvgStore.ts, UploadAssetModal.vue, MissingUserAssetsModal.vue
 *
 * Architecture:
 * - Centralized validation logic (no duplication)
 * - Reusable validation functions
 * - Security-first approach (XSS prevention)
 * - Clear error messages for users
 */

import { logger } from './logger'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Dangerous patterns to check in SVG content
 * NOTE: Event handlers use \s+ prefix to avoid false positives (e.g., Inkscape's "font" attribute)
 */
export const DANGEROUS_PATTERNS = [
  /<script/i,                // Script tags
  /javascript:/i,            // JavaScript URLs
  /\s+on\w+\s*=/i           // Event handlers (with leading whitespace to avoid "font" false positives)
] as const

/**
 * Validate SVG file type
 */
export function validateSvgFileType(file: File): ValidationResult {
  const validTypes = ['image/svg+xml', 'image/svg']
  const validExtension = file.name.toLowerCase().endsWith('.svg')

  if (!validTypes.includes(file.type) && !validExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an SVG file (.svg)'
    }
  }

  return { valid: true }
}

/**
 * Validate SVG file size
 */
export function validateSvgFileSize(file: File, maxSizeBytes: number): ValidationResult {
  if (file.size > maxSizeBytes) {
    const fileSizeKB = (file.size / 1000).toFixed(1)
    const maxSizeKB = maxSizeBytes / 1000
    return {
      valid: false,
      error: `File too large: ${fileSizeKB}KB (max ${maxSizeKB}KB)`
    }
  }

  return { valid: true }
}

/**
 * Validate SVG structure (XML parsing)
 */
export function validateSvgStructure(svgContent: string): ValidationResult {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')

    // Check for parser errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      return {
        valid: false,
        error: 'Invalid SVG: XML parse error'
      }
    }

    // Check for <svg> root element
    if (!doc.querySelector('svg')) {
      return {
        valid: false,
        error: 'Invalid SVG: No <svg> root element found'
      }
    }

    return { valid: true }
  } catch (error) {
    logger.error('SVG structure validation error:', error)
    return {
      valid: false,
      error: 'Invalid SVG: Failed to parse XML'
    }
  }
}

/**
 * Check for dangerous content in SVG
 * Returns true if dangerous content found, false if safe
 */
export function checkDangerousContent(svgContent: string): boolean {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(svgContent)) {
      logger.warn('Dangerous content detected in SVG:', pattern.source)
      return true
    }
  }
  return false
}

/**
 * Validate SVG content (size + structure + security)
 */
export function validateSvgContent(svgContent: string, maxSizeBytes: number): ValidationResult {
  // Check size
  const sizeBytes = new Blob([svgContent]).size
  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `SVG too large: ${(sizeBytes / 1000).toFixed(1)}KB (max ${maxSizeBytes / 1000}KB)`
    }
  }

  // Validate structure
  const structureValidation = validateSvgStructure(svgContent)
  if (!structureValidation.valid) {
    return structureValidation
  }

  // Check for dangerous content
  if (checkDangerousContent(svgContent)) {
    return {
      valid: false,
      error: 'Invalid SVG: Contains dangerous content (scripts/event handlers)'
    }
  }

  return { valid: true }
}

/**
 * Sanitize SVG content
 * Removes dangerous content while preserving the SVG
 */
export function sanitizeSvgContent(svgContent: string): string {
  let sanitized = svgContent

  // Remove <script> tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (with leading whitespace to avoid false positives)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, ' ')
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, ' ')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:[^"']*/gi, '')

  return sanitized
}

/**
 * Validate and sanitize SVG content in one operation
 * Returns sanitized content if valid, error if invalid
 *
 * Strategy: Sanitize first, then validate the sanitized content
 * This allows us to accept SVGs with dangerous content and clean them
 */
export function validateAndSanitizeSvg(
  svgContent: string,
  maxSizeBytes: number
): { valid: boolean; sanitized?: string; error?: string } {
  // Sanitize first (remove dangerous content)
  const sanitized = sanitizeSvgContent(svgContent)

  // Then validate structure and size of sanitized content
  // Check size
  const sizeBytes = new Blob([sanitized]).size
  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `SVG too large: ${(sizeBytes / 1000).toFixed(1)}KB (max ${maxSizeBytes / 1000}KB)`
    }
  }

  // Validate structure
  const structureValidation = validateSvgStructure(sanitized)
  if (!structureValidation.valid) {
    return {
      valid: false,
      error: structureValidation.error
    }
  }

  return {
    valid: true,
    sanitized
  }
}
