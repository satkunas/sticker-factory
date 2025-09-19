import { describe, it, expect } from 'vitest'
import {
  validateFileUpload,
  sanitizeTextInput,
  sanitizeSvgContent,
  validateImportData,
  validateFontUrl,
  getSecurityMetrics
} from '../utils/security'

describe('Security Utilities', () => {
  describe('validateFileUpload', () => {
    it('should accept valid JSON files', () => {
      const validFile = new File(['{"test": true}'], 'test.json', {
        type: 'application/json'
      })

      const result = validateFileUpload(validFile)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject files that are too large', () => {
      // Create a large buffer (>10MB)
      const largeContent = 'x'.repeat(11 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.json', {
        type: 'application/json'
      })

      const result = validateFileUpload(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('should reject unsupported file types', () => {
      const invalidFile = new File(['content'], 'test.exe', {
        type: 'application/x-executable'
      })

      const result = validateFileUpload(invalidFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unsupported file type')
    })

    it('should handle large JSON files specifically', () => {
      // Create JSON file larger than 2MB
      const largeJsonContent = JSON.stringify({ data: 'x'.repeat(3 * 1024 * 1024) })
      const largeJsonFile = new File([largeJsonContent], 'large.json', {
        type: 'application/json'
      })

      const result = validateFileUpload(largeJsonFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('JSON file too large')
    })
  })

  describe('sanitizeTextInput', () => {
    it('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello'
      const result = sanitizeTextInput(maliciousInput)
      expect(result).toBe('Hello')
    })

    it('should remove javascript: protocols', () => {
      const maliciousInput = 'javascript:alert("xss")'
      const result = sanitizeTextInput(maliciousInput)
      expect(result).toBe('alert(&quot;xss&quot;)') // javascript: removed, quotes encoded
    })

    it('should encode HTML entities', () => {
      const htmlInput = '<div>Hello & "World"</div>'
      const result = sanitizeTextInput(htmlInput)
      expect(result).toBe('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;')
    })

    it('should truncate long inputs', () => {
      const longInput = 'x'.repeat(15000)
      const result = sanitizeTextInput(longInput)
      expect(result.length).toBeLessThanOrEqual(10000)
    })

    it('should handle non-string inputs', () => {
      expect(sanitizeTextInput(null as any)).toBe('')
      expect(sanitizeTextInput(undefined as any)).toBe('')
      expect(sanitizeTextInput(123 as any)).toBe('')
    })
  })

  describe('sanitizeSvgContent', () => {
    it('should preserve valid SVG content', () => {
      const validSvg = '<svg><rect fill="#ff0000" /></svg>'
      const result = sanitizeSvgContent(validSvg)
      expect(result).toContain('<svg>')
      expect(result).toContain('<rect')
    })

    it('should remove script tags from SVG', () => {
      const maliciousSvg = '<svg><script>alert("xss")</script><rect /></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<rect')
    })

    it('should remove dangerous event handlers', () => {
      const dangerousSvg = '<svg><rect onclick="alert(\'xss\')" fill="#ff0000" /></svg>'
      const result = sanitizeSvgContent(dangerousSvg)
      expect(result).not.toContain('onclick')
      expect(result).toContain('fill')
    })

    it('should remove foreignObject elements', () => {
      const dangerousSvg = '<svg><foreignObject><div>malicious</div></foreignObject><rect /></svg>'
      const result = sanitizeSvgContent(dangerousSvg)
      expect(result).not.toContain('foreignObject')
      expect(result).toContain('<rect')
    })

    it('should reject invalid SVG structure', () => {
      expect(sanitizeSvgContent('not svg content')).toBe('')
      expect(sanitizeSvgContent('<div>not svg</div>')).toBe('')
    })
  })

  describe('validateImportData', () => {
    it('should accept valid import data', () => {
      const validData = {
        textInputs: [
          { id: 'test', text: 'Hello' }
        ],
        selectedTemplateId: 'business-card'
      }

      const result = validateImportData(validData)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid data types', () => {
      expect(validateImportData(null).valid).toBe(false)
      expect(validateImportData('string').valid).toBe(false)
      expect(validateImportData(123).valid).toBe(false)
    })

    it('should require essential fields', () => {
      const missingFields = { textInputs: [] }
      const result = validateImportData(missingFields)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('selectedTemplateId')
    })

    it('should validate textInputs array', () => {
      const invalidTextInputs = {
        textInputs: 'not an array',
        selectedTemplateId: 'test'
      }
      const result = validateImportData(invalidTextInputs)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('must be an array')
    })

    it('should validate individual text input structure', () => {
      const invalidTextInput = {
        textInputs: [{ id: 123, text: 'valid' }],
        selectedTemplateId: 'test'
      }
      const result = validateImportData(invalidTextInput)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid text input ID')
    })
  })

  describe('validateFontUrl', () => {
    it('should accept trusted Google Fonts URLs', () => {
      const googleUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
      expect(validateFontUrl(googleUrl)).toBe(true)
    })

    it('should accept Google Fonts static URLs', () => {
      const staticUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2'
      expect(validateFontUrl(staticUrl)).toBe(true)
    })

    it('should reject non-HTTPS URLs', () => {
      const httpUrl = 'http://fonts.googleapis.com/css?family=Roboto'
      expect(validateFontUrl(httpUrl)).toBe(false)
    })

    it('should reject untrusted domains', () => {
      const maliciousUrl = 'https://evil.com/fonts.css'
      expect(validateFontUrl(maliciousUrl)).toBe(false)
    })

    it('should handle invalid URLs gracefully', () => {
      expect(validateFontUrl('not-a-url')).toBe(false)
      expect(validateFontUrl('')).toBe(false)
    })
  })

  describe('getSecurityMetrics', () => {
    it('should return security configuration', () => {
      const metrics = getSecurityMetrics()

      expect(metrics).toHaveProperty('maxFileSize')
      expect(metrics).toHaveProperty('maxJsonSize')
      expect(metrics).toHaveProperty('maxTextLength')
      expect(metrics).toHaveProperty('allowedMimeTypes')
      expect(metrics).toHaveProperty('allowedSvgTags')

      expect(Array.isArray(metrics.allowedMimeTypes)).toBe(true)
      expect(Array.isArray(metrics.allowedSvgTags)).toBe(true)
      expect(typeof metrics.maxFileSize).toBe('number')
    })
  })
})