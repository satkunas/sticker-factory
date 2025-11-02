/**
 * SVG Validation Utilities Tests
 *
 * Target: 100% coverage (utility file)
 * Tests all validation and sanitization functions
 */

import { describe, it, expect } from 'vitest'
import {
  validateSvgFileType,
  validateSvgFileSize,
  validateSvgStructure,
  checkDangerousContent,
  validateSvgContent,
  sanitizeSvgContent,
  validateAndSanitizeSvg,
  DANGEROUS_PATTERNS
} from '../utils/svg-validation'

describe('svg-validation', () => {
  // Valid SVG for testing
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue" /></svg>'

  describe('validateSvgFileType', () => {
    it('should accept valid SVG file with correct MIME type', () => {
      const file = new File([validSvg], 'test.svg', { type: 'image/svg+xml' })
      const result = validateSvgFileType(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept SVG file with alternative MIME type', () => {
      const file = new File([validSvg], 'test.svg', { type: 'image/svg' })
      const result = validateSvgFileType(file)
      expect(result.valid).toBe(true)
    })

    it('should accept SVG file with .svg extension even if MIME type is wrong', () => {
      const file = new File([validSvg], 'test.svg', { type: 'application/octet-stream' })
      const result = validateSvgFileType(file)
      expect(result.valid).toBe(true)
    })

    it('should reject non-SVG file', () => {
      const file = new File(['not svg'], 'test.png', { type: 'image/png' })
      const result = validateSvgFileType(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should handle uppercase extension', () => {
      const file = new File([validSvg], 'test.SVG', { type: 'image/svg+xml' })
      const result = validateSvgFileType(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateSvgFileSize', () => {
    it('should accept file under size limit', () => {
      const file = new File([validSvg], 'test.svg', { type: 'image/svg+xml' })
      const result = validateSvgFileSize(file, 200000) // 200KB limit
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file over size limit', () => {
      const largeSvg = validSvg.repeat(10000) // Make it large
      const file = new File([largeSvg], 'test.svg', { type: 'image/svg+xml' })
      const result = validateSvgFileSize(file, 1000) // 1KB limit
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File too large')
      expect(result.error).toContain('KB')
    })

    it('should accept file exactly at size limit', () => {
      const file = new File([validSvg], 'test.svg', { type: 'image/svg+xml' })
      const result = validateSvgFileSize(file, file.size)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateSvgStructure', () => {
    it('should accept valid SVG', () => {
      const result = validateSvgStructure(validSvg)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid XML', () => {
      const invalidXml = '<svg><unclosed'
      const result = validateSvgStructure(invalidXml)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('parse error')
    })

    it('should reject content without <svg> element', () => {
      const noSvg = '<div>not an svg</div>'
      const result = validateSvgStructure(noSvg)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('No <svg> root element')
    })

    it('should accept SVG with nested elements', () => {
      const complexSvg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="50" cy="50" r="40" />
            <text x="50" y="50">Hello</text>
          </g>
        </svg>
      `
      const result = validateSvgStructure(complexSvg)
      expect(result.valid).toBe(true)
    })
  })

  describe('checkDangerousContent', () => {
    it('should return false for safe SVG', () => {
      const result = checkDangerousContent(validSvg)
      expect(result).toBe(false)
    })

    it('should detect <script> tags', () => {
      const maliciousSvg = '<svg><script>alert("XSS")</script></svg>'
      const result = checkDangerousContent(maliciousSvg)
      expect(result).toBe(true)
    })

    it('should detect <script> tags (case insensitive)', () => {
      const maliciousSvg = '<svg><SCRIPT>alert("XSS")</SCRIPT></svg>'
      const result = checkDangerousContent(maliciousSvg)
      expect(result).toBe(true)
    })

    it('should detect javascript: URLs', () => {
      const maliciousSvg = '<svg><a href="javascript:alert(1)">click</a></svg>'
      const result = checkDangerousContent(maliciousSvg)
      expect(result).toBe(true)
    })

    it('should detect event handlers', () => {
      const maliciousSvg = '<svg><circle onclick="alert(1)" /></svg>'
      const result = checkDangerousContent(maliciousSvg)
      expect(result).toBe(true)
    })

    it('should NOT false-positive on "font" attribute (Inkscape)', () => {
      // The \s+ prefix in pattern prevents "font" from matching
      const inkscapeSvg = '<svg><text font-family="Arial">text</text></svg>'
      const result = checkDangerousContent(inkscapeSvg)
      expect(result).toBe(false)
    })

    it('should detect onload handler', () => {
      const maliciousSvg = '<svg onload="alert(1)"></svg>'
      const result = checkDangerousContent(maliciousSvg)
      expect(result).toBe(true)
    })
  })

  describe('validateSvgContent', () => {
    const maxSize = 200000 // 200KB

    it('should accept valid SVG', () => {
      const result = validateSvgContent(validSvg, maxSize)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject SVG that is too large', () => {
      const largeSvg = validSvg.repeat(10000)
      const result = validateSvgContent(largeSvg, 1000)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('should reject SVG with invalid structure', () => {
      const invalidSvg = '<svg><unclosed'
      const result = validateSvgContent(invalidSvg, maxSize)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('parse error')
    })

    it('should reject SVG with dangerous content', () => {
      const maliciousSvg = '<svg><script>alert(1)</script></svg>'
      const result = validateSvgContent(maliciousSvg, maxSize)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('dangerous content')
    })

    it('should reject SVG without <svg> element', () => {
      const noSvg = '<div>not svg</div>'
      const result = validateSvgContent(noSvg, maxSize)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('No <svg> root element')
    })
  })

  describe('sanitizeSvgContent', () => {
    it('should not modify safe SVG', () => {
      const result = sanitizeSvgContent(validSvg)
      expect(result).toBe(validSvg)
    })

    it('should remove <script> tags', () => {
      const maliciousSvg = '<svg><script>alert("XSS")</script><circle /></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('<script')
      expect(result).not.toContain('alert')
      expect(result).toContain('<circle')
    })

    it('should remove <script> tags (case insensitive)', () => {
      const maliciousSvg = '<svg><SCRIPT>alert("XSS")</SCRIPT></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('SCRIPT')
      expect(result).not.toContain('alert')
    })

    it('should remove event handlers with double quotes', () => {
      const maliciousSvg = '<svg><circle onclick="alert(1)" cx="50" /></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('onclick')
      expect(result).toContain('cx="50"') // Preserve safe attributes
    })

    it('should remove event handlers with single quotes', () => {
      const maliciousSvg = "<svg><circle onclick='alert(1)' /></svg>"
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('onclick')
    })

    it('should remove event handlers without quotes', () => {
      const maliciousSvg = '<svg><circle onclick=doEvil() /></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('onclick')
    })

    it('should remove javascript: URLs', () => {
      const maliciousSvg = '<svg><a href="javascript:alert(1)">link</a></svg>'
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('javascript:')
    })

    it('should preserve font-family attribute (Inkscape)', () => {
      const inkscapeSvg = '<svg><text font-family="Arial">text</text></svg>'
      const result = sanitizeSvgContent(inkscapeSvg)
      expect(result).toContain('font-family="Arial"')
    })

    it('should handle multiple dangerous patterns', () => {
      const maliciousSvg = `
        <svg>
          <script>alert(1)</script>
          <circle onclick="evil()" />
          <a href="javascript:void(0)">link</a>
        </svg>
      `
      const result = sanitizeSvgContent(maliciousSvg)
      expect(result).not.toContain('<script')
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('javascript:')
    })
  })

  describe('validateAndSanitizeSvg', () => {
    const maxSize = 200000

    it('should return sanitized SVG for valid input', () => {
      const result = validateAndSanitizeSvg(validSvg, maxSize)
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe(validSvg)
      expect(result.error).toBeUndefined()
    })

    it('should sanitize dangerous content', () => {
      const maliciousSvg = '<svg><script>alert(1)</script><circle /></svg>'
      const result = validateAndSanitizeSvg(maliciousSvg, maxSize)
      expect(result.valid).toBe(true)
      expect(result.sanitized).not.toContain('<script')
      expect(result.sanitized).toContain('<circle')
    })

    it('should return error for invalid size', () => {
      const largeSvg = validSvg.repeat(10000)
      const result = validateAndSanitizeSvg(largeSvg, 1000)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('too large')
      expect(result.sanitized).toBeUndefined()
    })

    it('should return error for invalid structure', () => {
      const invalidSvg = '<svg><unclosed'
      const result = validateAndSanitizeSvg(invalidSvg, maxSize)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.sanitized).toBeUndefined()
    })

    it('should return error for missing <svg> element', () => {
      const noSvg = '<div>not svg</div>'
      const result = validateAndSanitizeSvg(noSvg, maxSize)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('No <svg> root element')
      expect(result.sanitized).toBeUndefined()
    })
  })

  describe('DANGEROUS_PATTERNS constant', () => {
    it('should export dangerous patterns array', () => {
      expect(DANGEROUS_PATTERNS).toBeDefined()
      expect(DANGEROUS_PATTERNS.length).toBe(3)
    })

    it('should contain script pattern', () => {
      const scriptPattern = DANGEROUS_PATTERNS[0]
      expect(scriptPattern.test('<script>')).toBe(true)
      expect(scriptPattern.test('<SCRIPT>')).toBe(true)
    })

    it('should contain javascript: pattern', () => {
      const jsPattern = DANGEROUS_PATTERNS[1]
      expect(jsPattern.test('javascript:alert(1)')).toBe(true)
      expect(jsPattern.test('JAVASCRIPT:alert(1)')).toBe(true)
    })

    it('should contain event handler pattern', () => {
      const eventPattern = DANGEROUS_PATTERNS[2]
      expect(eventPattern.test(' onclick=')).toBe(true)
      expect(eventPattern.test(' onload=')).toBe(true)
      // Should NOT match without leading whitespace (Inkscape "font" issue)
      expect(eventPattern.test('font-family')).toBe(false)
    })
  })
})
