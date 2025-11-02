/**
 * Tests for Layer Enhancement Utilities
 */

import { describe, it, expect } from 'vitest'
import { enhanceLayersWithUserSvgs, hasUserSvgLayers } from '../utils/layer-enhancement'
import type { FlatLayerData } from '../types/template-types'

describe('Layer Enhancement Utilities', () => {
  describe('enhanceLayersWithUserSvgs', () => {
    it('should enhance layers with user SVG content', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'user-svg-12345678' },
        { id: 'layer2', type: 'text', text: 'Hello' }
      ]

      const getUserSvgContent = (id: string) => {
        if (id === 'user-svg-12345678') {
          return '<svg><circle r="10"/></svg>'
        }
        return null
      }

      const enhanced = enhanceLayersWithUserSvgs(layers, getUserSvgContent)

      expect(enhanced[0].svgContent).toBe('<svg><circle r="10"/></svg>')
      expect(enhanced[1].svgContent).toBeUndefined()
    })

    it('should not modify layers without user SVG IDs', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'ui-star' },
        { id: 'layer2', type: 'text', text: 'Hello' }
      ]

      const getUserSvgContent = () => null

      const enhanced = enhanceLayersWithUserSvgs(layers, getUserSvgContent)

      expect(enhanced[0].svgContent).toBeUndefined()
      expect(enhanced[1].svgContent).toBeUndefined()
    })

    it('should handle layers where user SVG content is not found', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'user-svg-missing' }
      ]

      const getUserSvgContent = () => null

      const enhanced = enhanceLayersWithUserSvgs(layers, getUserSvgContent)

      expect(enhanced[0].svgContent).toBeUndefined()
    })

    it('should be a pure function (not mutate original layers)', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'user-svg-12345678' }
      ]

      const getUserSvgContent = () => '<svg></svg>'

      const enhanced = enhanceLayersWithUserSvgs(layers, getUserSvgContent)

      expect(layers[0].svgContent).toBeUndefined()
      expect(enhanced[0].svgContent).toBe('<svg></svg>')
      expect(enhanced[0]).not.toBe(layers[0]) // New object
    })
  })

  describe('hasUserSvgLayers', () => {
    it('should return true if any layer has user SVG ID', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'ui-star' },
        { id: 'layer2', type: 'svgImage', svgImageId: 'user-svg-12345678' }
      ]

      expect(hasUserSvgLayers(layers)).toBe(true)
    })

    it('should return false if no layers have user SVG IDs', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'svgImage', svgImageId: 'ui-star' },
        { id: 'layer2', type: 'text', text: 'Hello' }
      ]

      expect(hasUserSvgLayers(layers)).toBe(false)
    })

    it('should return false for empty layers array', () => {
      expect(hasUserSvgLayers([])).toBe(false)
    })

    it('should handle layers without svgImageId', () => {
      const layers: FlatLayerData[] = [
        { id: 'layer1', type: 'shape', fillColor: '#000000' },
        { id: 'layer2', type: 'text', text: 'Hello' }
      ]

      expect(hasUserSvgLayers(layers)).toBe(false)
    })
  })
})
