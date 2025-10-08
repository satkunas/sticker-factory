import { describe, it, expect } from 'vitest'
import { useTemplateHelpers } from '../composables/useTemplateHelpers'
import type { SimpleTemplate } from '../types/template-types'

describe('useTemplateHelpers', () => {
  const { getTextInputLabel, getShapeLabel, getSvgImageLabel } = useTemplateHelpers()

  const mockTemplate: SimpleTemplate = {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template',
    category: 'rectangle',
    viewBox: { x: 0, y: 0, width: 400, height: 300 },
    layers: [
      {
        id: 'test-shape',
        type: 'shape',
        subtype: 'rect',
        position: { x: 0, y: 0 },
        shape: {
          id: 'test-shape',
          type: 'path',
          path: 'M0,0 L100,0 L100,100 L0,100 Z'
        }
      },
      {
        id: 'test-text',
        type: 'text',
        label: 'Test Label',
        position: { x: 50, y: 50 }
      },
      {
        id: 'test-svg',
        type: 'svgImage',
        svgContent: '<svg></svg>',
        position: { x: 100, y: 100 }
      }
    ]
  }

  describe('getTextInputLabel', () => {
    it('returns correct label for existing text input', () => {
      expect(getTextInputLabel(mockTemplate, 'test-text')).toBe('Test Label')
    })

    it('returns default label for non-existent text input', () => {
      expect(getTextInputLabel(mockTemplate, 'non-existent')).toBe('Text')
    })

    it('returns default label for null template', () => {
      expect(getTextInputLabel(null, 'test-text')).toBe('Text')
    })
  })

  describe('getShapeLabel', () => {
    it('returns capitalized shape subtype', () => {
      expect(getShapeLabel(mockTemplate, 'test-shape')).toBe('Rect')
    })

    it('returns default label for non-existent shape', () => {
      expect(getShapeLabel(mockTemplate, 'non-existent')).toBe('Shape')
    })

    it('returns default label for null template', () => {
      expect(getShapeLabel(null, 'test-shape')).toBe('Shape')
    })
  })

  describe('getSvgImageLabel', () => {
    it('returns formatted SVG image label', () => {
      expect(getSvgImageLabel(mockTemplate, 'test-svg')).toBe('SVG Test-svg')
    })

    it('returns default label for non-existent SVG image', () => {
      expect(getSvgImageLabel(mockTemplate, 'non-existent')).toBe('SVG Image')
    })

    it('returns default label for null template', () => {
      expect(getSvgImageLabel(null, 'test-svg')).toBe('SVG Image')
    })
  })
})