/* eslint-disable @typescript-eslint/no-explicit-any */
// Security utilities for input validation and sanitization
// Following behavioral guidelines: sanitize at entry points only

import { logger } from './logger'
import {
  SUPPORTED_JSON_MIME_TYPE,
  FILE_SIZE_KB
} from '../config/constants'

// File size limits (in bytes)
const MAX_FILE_SIZE = FILE_SIZE_KB * 1024 * 10 // 10MB max
const MAX_JSON_SIZE = FILE_SIZE_KB * 1024 * 2  // 2MB for JSON imports
const MAX_TEXT_LENGTH = 10000 // Max text input length

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = new Set([
  SUPPORTED_JSON_MIME_TYPE,
  'image/svg+xml',
  'text/plain'
])

// SVG tag whitelist for template sanitization
const ALLOWED_SVG_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'defs', 'clipPath', 'mask', 'pattern',
  'linearGradient', 'radialGradient', 'stop', 'use', 'symbol'
])

// Dangerous attributes to remove from SVG
const DANGEROUS_ATTRIBUTES = new Set([
  'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
  'javascript:', 'data:text/html', 'data:image/svg+xml'
])

/**
 * Validate file upload at entry point
 * @param file - File object from input
 * @returns {boolean} - True if file is valid
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large: ${Math.round(file.size / (FILE_SIZE_KB * 1024))}MB (max: ${Math.round(MAX_FILE_SIZE / (FILE_SIZE_KB * 1024))}MB)`
      }
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}`
      }
    }

    // Additional checks for JSON files
    if (file.type === SUPPORTED_JSON_MIME_TYPE && file.size > MAX_JSON_SIZE) {
      return {
        valid: false,
        error: `JSON file too large: ${Math.round(file.size / (FILE_SIZE_KB * 1024))}MB (max: ${Math.round(MAX_JSON_SIZE / (FILE_SIZE_KB * 1024))}MB)`
      }
    }

    logger.debug(`File validation passed: ${file.name} (${file.type}, ${file.size} bytes)`)
    return { valid: true }

  } catch (error) {
    logger.error('File validation error:', error)
    return { valid: false, error: 'File validation failed' }
  }
}

/**
 * Sanitize user text input at entry point
 * @param input - Raw user input
 * @returns {string} - Sanitized text
 */
export function sanitizeTextInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Length limit
  if (input.length > MAX_TEXT_LENGTH) {
    logger.warn(`Text input truncated: ${input.length} > ${MAX_TEXT_LENGTH}`)
    input = input.substring(0, MAX_TEXT_LENGTH)
  }

  // Remove potentially dangerous characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:(text\/html|image\/svg\+xml)/gi, '') // Remove dangerous data URLs
    .replace(/[<>'"&]/g, (char) => { // HTML entity encoding
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[char] || char
    })

  return sanitized.trim()
}

/**
 * Sanitize SVG content for template system
 * @param svgContent - Raw SVG content
 * @returns {string} - Sanitized SVG
 */
export function sanitizeSvgContent(svgContent: string): string {
  if (typeof svgContent !== 'string') {
    return ''
  }

  try {
    // Basic SVG structure validation
    if (!svgContent.trim().startsWith('<svg') || !svgContent.includes('</svg>')) {
      logger.warn('Invalid SVG structure detected')
      return ''
    }

    // Remove dangerous attributes using regex
    let sanitized = svgContent
    DANGEROUS_ATTRIBUTES.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
      sanitized = sanitized.replace(regex, '')
    })

    // Remove script tags completely
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Remove foreign object elements (can contain HTML)
    sanitized = sanitized.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')

    logger.debug('SVG content sanitized successfully')
    return sanitized

  } catch (error) {
    logger.error('SVG sanitization error:', error)
    return ''
  }
}

/**
 * Validate JSON import data structure
 * @param data - Parsed JSON data
 * @returns {boolean} - True if structure is valid
 */
export function validateImportData(data: any): { valid: boolean; error?: string } {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' }
    }

    // Check for required fields in import data
    const requiredFields = ['textInputs', 'selectedTemplateId']
    for (const field of requiredFields) {
      if (!(field in data)) {
        return { valid: false, error: `Missing required field: ${field}` }
      }
    }

    // Validate textInputs array
    if (!Array.isArray(data.textInputs)) {
      return { valid: false, error: 'textInputs must be an array' }
    }

    // Validate each text input
    for (const textInput of data.textInputs) {
      if (!textInput.id || typeof textInput.id !== 'string') {
        return { valid: false, error: 'Invalid text input ID' }
      }
      if (textInput.text && typeof textInput.text !== 'string') {
        return { valid: false, error: 'Invalid text input content' }
      }
    }

    logger.debug('Import data validation passed')
    return { valid: true }

  } catch (error) {
    logger.error('Import validation error:', error)
    return { valid: false, error: 'Data validation failed' }
  }
}

/**
 * Validate URL for font loading
 * @param url - Font URL to validate
 * @returns {boolean} - True if URL is safe
 */
export function validateFontUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)

    // Only allow HTTPS and specific trusted domains
    if (parsedUrl.protocol !== 'https:') {
      logger.warn(`Rejected non-HTTPS font URL: ${url}`)
      return false
    }

    // Allow only trusted font providers
    const trustedDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ]

    if (!trustedDomains.some(domain => parsedUrl.hostname === domain)) {
      logger.warn(`Rejected untrusted font domain: ${parsedUrl.hostname}`)
      return false
    }

    return true

  } catch (error) {
    logger.warn(`Invalid font URL: ${url}`)
    return false
  }
}

/**
 * Get security metrics for monitoring
 */
export function getSecurityMetrics() {
  return {
    maxFileSize: MAX_FILE_SIZE,
    maxJsonSize: MAX_JSON_SIZE,
    maxTextLength: MAX_TEXT_LENGTH,
    allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    allowedSvgTags: Array.from(ALLOWED_SVG_TAGS)
  }
}