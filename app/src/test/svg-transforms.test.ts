/**
 * Tests for SVG Transform Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeSvgContent,
  getSvgImageTransformCase,
  calculateScaledTransformOrigin
} from '../utils/svg-transforms'
import type { FlatLayerData } from '../types/template-types'

describe('sanitizeSvgContent', () => {
  it('should remove XML declarations', () => {
    const input = '<?xml version="1.0" encoding="UTF-8"?>\n<svg>content</svg>'
    const expected = '<svg>content</svg>'
    expect(sanitizeSvgContent(input)).toBe(expected)
  })

  it('should remove DOCTYPE declarations', () => {
    const input = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg>content</svg>'
    const expected = '<svg>content</svg>'
    expect(sanitizeSvgContent(input)).toBe(expected)
  })

  it('should remove leading XML comments', () => {
    const input = '<!-- Created with Inkscape -->\n<svg>content</svg>'
    const expected = '<svg>content</svg>'
    expect(sanitizeSvgContent(input)).toBe(expected)
  })

  it('should remove all three at once', () => {
    const input = '<?xml version="1.0"?>\n<!DOCTYPE svg>\n<!-- Comment -->\n<svg>content</svg>'
    const expected = '<svg>content</svg>'
    expect(sanitizeSvgContent(input)).toBe(expected)
  })

  it('should preserve clean SVG content (no-op)', () => {
    const input = '<svg>content</svg>'
    expect(sanitizeSvgContent(input)).toBe(input)
  })

  it('should handle empty string', () => {
    expect(sanitizeSvgContent('')).toBe('')
  })

  it('should handle whitespace-only input', () => {
    expect(sanitizeSvgContent('   \n  ')).toBe('')
  })
})

describe('getSvgImageTransformCase', () => {
  it('should return "none" for undefined layerData', () => {
    const result = getSvgImageTransformCase(undefined)
    expect(result.case).toBe('none')
  })

  it('should detect scale-with-origin case', () => {
    const layerData: FlatLayerData = {
      id: 'test',
      type: 'svgImage',
      scale: 2,
      transformOrigin: { x: 100, y: 100 }
    }
    const result = getSvgImageTransformCase(layerData)
    expect(result.case).toBe('scale-with-origin')
    expect(result.scale).toBe(2)
    expect(result.transformOrigin).toEqual({ x: 100, y: 100 })
  })

  it('should detect scale-and-rotation case', () => {
    const layerData: FlatLayerData = {
      id: 'test',
      type: 'svgImage',
      scale: 1.5,
      rotation: 45
    }
    const result = getSvgImageTransformCase(layerData)
    expect(result.case).toBe('scale-and-rotation')
    expect(result.scale).toBe(1.5)
    expect(result.rotation).toBe(45)
  })

  it('should detect scale-only case', () => {
    const layerData: FlatLayerData = {
      id: 'test',
      type: 'svgImage',
      scale: 0.5
    }
    const result = getSvgImageTransformCase(layerData)
    expect(result.case).toBe('scale-only')
    expect(result.scale).toBe(0.5)
  })

  it('should detect rotation-only case', () => {
    const layerData: FlatLayerData = {
      id: 'test',
      type: 'svgImage',
      rotation: 90
    }
    const result = getSvgImageTransformCase(layerData)
    expect(result.case).toBe('rotation-only')
    expect(result.rotation).toBe(90)
  })

  it('should prioritize scale-with-origin over scale-and-rotation', () => {
    const layerData: FlatLayerData = {
      id: 'test',
      type: 'svgImage',
      scale: 2,
      rotation: 45,
      transformOrigin: { x: 100, y: 100 }
    }
    const result = getSvgImageTransformCase(layerData)
    expect(result.case).toBe('scale-with-origin')
  })
})

describe('calculateScaledTransformOrigin', () => {
  it('should scale transform origin from viewBox to template space (2x scale down)', () => {
    // ViewBox 200x200, template 100x100, origin at center (100, 100) in viewBox
    // Should scale to (50, 50) in template space
    const svgContent = '<svg viewBox="0 0 200 200">content</svg>'
    const result = calculateScaledTransformOrigin(svgContent, 100, 100, { x: 100, y: 100 })
    expect(result.x).toBe(50)
    expect(result.y).toBe(50)
  })

  it('should handle 1:1 viewBox to template ratio (no scaling)', () => {
    // ViewBox 100x100, template 100x100, origin at (100, 100)
    // Should remain at (100, 100)
    const svgContent = '<svg viewBox="0 0 100 100">content</svg>'
    const result = calculateScaledTransformOrigin(svgContent, 100, 100, { x: 100, y: 100 })
    expect(result.x).toBe(100)
    expect(result.y).toBe(100)
  })

  it('should handle 2x scale up (small viewBox, large template)', () => {
    // ViewBox 50x50, template 100x100 (2x scale up), origin at (100, 100) in viewBox
    // Should scale to (200, 200) in template space
    const svgContent = '<svg viewBox="0 0 50 50">content</svg>'
    const result = calculateScaledTransformOrigin(svgContent, 100, 100, { x: 100, y: 100 })
    expect(result.x).toBe(200)
    expect(result.y).toBe(200)
  })

  it('should handle asymmetric dimensions and origins', () => {
    // ViewBox 450x225, template 150x75 (3x scale down), origin at (150, 75) in viewBox
    // Should scale to (50, 25) in template space
    const svgContent = '<svg viewBox="0 0 450 225">content</svg>'
    const result = calculateScaledTransformOrigin(svgContent, 150, 75, { x: 150, y: 75 })
    expect(result.x).toBe(50)
    expect(result.y).toBe(25)
  })

  it('should handle SVG without viewBox (no scaling)', () => {
    // No viewBox means no scaling transformation
    const svgContent = '<svg width="100" height="100">content</svg>'
    const result = calculateScaledTransformOrigin(svgContent, 100, 100, { x: 75, y: 50 })
    expect(result.x).toBe(75)
    expect(result.y).toBe(50)
  })
})
