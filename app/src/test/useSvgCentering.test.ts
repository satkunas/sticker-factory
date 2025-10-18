/**
 * Test suite for useSvgCentering composable
 * Tests Vue reactivity wrapper around svg-centering utils
 */

import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSvgCentering, calculateElementCenter } from '../composables/useSvgCentering'
import type { SimpleTemplate } from '../types/template-types'

describe('useSvgCentering Composable', () => {
  const mockTemplate = ref<SimpleTemplate>({
    id: 'test-template',
    name: 'Test Template',
    category: 'circle',
    viewBox: { x: 0, y: 0, width: 400, height: 400 },
    layers: []
  })

  describe('Composable Initialization', () => {
    it('should initialize with valid template', () => {
      const { contentDimensions, centeringTransform } = useSvgCentering(mockTemplate)

      expect(contentDimensions.value).toBeDefined()
      expect(contentDimensions.value.width).toBeGreaterThan(0)
      expect(contentDimensions.value.height).toBeGreaterThan(0)
      expect(centeringTransform.value).toBeDefined()
    })

    it('should handle null template gracefully', () => {
      const nullTemplate = ref<SimpleTemplate | null>(null)
      const { contentDimensions } = useSvgCentering(nullTemplate)

      // Should fall back to default dimensions
      expect(contentDimensions.value).toEqual({ width: 400, height: 300 })
    })

    it('should use custom content dimensions when provided', () => {
      const customDimensions = ref({ width: 500, height: 250 })
      const { contentDimensions } = useSvgCentering(mockTemplate, customDimensions)

      expect(contentDimensions.value).toEqual({ width: 500, height: 250 })
    })
  })

  describe('Grid Bounds Calculation', () => {
    it('should calculate grid bounds with default scale', () => {
      const { gridBounds } = useSvgCentering(mockTemplate)

      expect(gridBounds.value).toBeDefined()
      expect(gridBounds.value.width).toBeGreaterThan(0)
      expect(gridBounds.value.height).toBeGreaterThan(0)
    })

    it('should apply custom grid scale factor', () => {
      const defaultScale = useSvgCentering(mockTemplate, undefined, 2.0)
      const largerScale = useSvgCentering(mockTemplate, undefined, 3.0)

      expect(largerScale.gridBounds.value.width).toBeGreaterThan(defaultScale.gridBounds.value.width)
    })
  })

  describe('Image Center Tracking', () => {
    it('should track image centers', () => {
      const { updateImageCenter, imageCenters } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 150 })

      expect(imageCenters.value.has('image1')).toBe(true)
      expect(imageCenters.value.get('image1')).toEqual({ x: 100, y: 150 })
    })

    it('should update existing image center', () => {
      const { updateImageCenter, imageCenters } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 150 })
      updateImageCenter('image1', { x: 200, y: 250 })

      expect(imageCenters.value.get('image1')).toEqual({ x: 200, y: 250 })
    })

    it('should track multiple image centers', () => {
      const { updateImageCenter, imageCenters } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 150 })
      updateImageCenter('image2', { x: 200, y: 250 })

      expect(imageCenters.value.size).toBe(2)
    })

    it('should clear centers when template changes', async () => {
      const template = ref<SimpleTemplate | null>(mockTemplate.value)
      const { updateImageCenter, imageCenters } = useSvgCentering(template)

      updateImageCenter('image1', { x: 100, y: 150 })
      expect(imageCenters.value.size).toBe(1)

      // Change template
      template.value = {
        id: 'different-template',
        name: 'Different',
        category: 'rectangle',
        viewBox: { x: 0, y: 0, width: 300, height: 300 },
        layers: []
      }

      // Wait for watcher to execute
      await nextTick()

      // Centers should be cleared
      expect(imageCenters.value.size).toBe(0)
    })
  })

  describe('Image Transform Generation', () => {
    it('should return empty string for unknown image ID', () => {
      const { getImageCenterTransform } = useSvgCentering(mockTemplate)

      const transform = getImageCenterTransform('unknown-image')
      expect(transform).toBe('')
    })

    it('should generate zoom transform', () => {
      const { updateImageCenter, getImageCenterTransform } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 100 })
      const transform = getImageCenterTransform('image1', 2.0)

      expect(transform).toBeTruthy()
      expect(typeof transform).toBe('string')
    })

    it('should generate rotation transform', () => {
      const { updateImageCenter, getImageCenterTransform } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 100 })
      const transform = getImageCenterTransform('image1', undefined, 45)

      expect(transform).toBeTruthy()
      expect(typeof transform).toBe('string')
    })

    it('should combine zoom and rotation transforms', () => {
      const { updateImageCenter, getImageCenterTransform } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 100 })
      const transform = getImageCenterTransform('image1', 1.5, 30)

      expect(transform).toBeTruthy()
      expect(typeof transform).toBe('string')
    })

    it('should not generate transform for default values', () => {
      const { updateImageCenter, getImageCenterTransform } = useSvgCentering(mockTemplate)

      updateImageCenter('image1', { x: 100, y: 100 })
      const transform = getImageCenterTransform('image1', 1.0, 0)

      // No transform needed for default zoom and rotation
      expect(transform).toBe('')
    })
  })

  describe('Combined Transform Generation', () => {
    it('should combine multiple transforms', () => {
      const { getCombinedTransform } = useSvgCentering(mockTemplate)

      const combined = getCombinedTransform('translate(10, 20)', ['scale(2)', 'rotate(45)'])

      expect(combined).toBeTruthy()
      expect(typeof combined).toBe('string')
    })

    it('should handle empty additional transforms', () => {
      const { getCombinedTransform } = useSvgCentering(mockTemplate)

      const combined = getCombinedTransform('translate(10, 20)', [])

      expect(combined).toContain('translate')
    })
  })
})

describe('calculateElementCenter Helper', () => {
  const mockViewBox = { width: 400, height: 400 }

  describe('Valid Position Handling', () => {
    it('should calculate center for element with dimensions', () => {
      const element = {
        position: { x: 100, y: 100 },
        width: 50,
        height: 50
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 125, y: 125 })
    })

    it('should handle percentage positions', () => {
      const element = {
        position: { x: '50%', y: '50%' },
        width: 50,
        height: 50
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 225, y: 225 }) // 200 (50%) + 25 (half width/height)
    })

    it('should handle mixed percentage and absolute positions', () => {
      const element = {
        position: { x: '25%', y: 100 },
        width: 40,
        height: 60
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 120, y: 130 }) // 100 (25% of 400) + 20, 100 + 30
    })

    it('should handle elements without dimensions (point elements)', () => {
      const element = {
        position: { x: 100, y: 150 }
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 100, y: 150 })
    })
  })

  describe('Invalid Input Handling (NO HARDCODED FALLBACKS)', () => {
    it('should return null for missing position', () => {
      const element = {
        width: 50,
        height: 50
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toBeNull()
    })

    it('should throw error for invalid string position', () => {
      const element = {
        position: { x: 'invalid', y: '50%' }
      }

      expect(() => {
        calculateElementCenter(element, mockViewBox)
      }).toThrow(/Invalid position value/)
    })

    it('should throw error for malformed percentage', () => {
      const element = {
        position: { x: 'not-a-number%', y: 100 }
      }

      expect(() => {
        calculateElementCenter(element, mockViewBox)
      }).toThrow(/Invalid position value/)
    })

    it('should throw error for non-numeric string', () => {
      const element = {
        position: { x: 'abc', y: 100 }
      }

      expect(() => {
        calculateElementCenter(element, mockViewBox)
      }).toThrow(/Invalid position value/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero coordinates', () => {
      const element = {
        position: { x: 0, y: 0 },
        width: 50,
        height: 50
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 25, y: 25 })
    })

    it('should handle negative coordinates', () => {
      const element = {
        position: { x: -50, y: -25 },
        width: 40,
        height: 20
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: -30, y: -15 })
    })

    it('should handle 0% percentage', () => {
      const element = {
        position: { x: '0%', y: '0%' }
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('should handle 100% percentage', () => {
      const element = {
        position: { x: '100%', y: '100%' },
        width: 50,
        height: 50
      }

      const result = calculateElementCenter(element, mockViewBox)

      expect(result).toEqual({ x: 425, y: 425 }) // 400 + 25
    })
  })
})
