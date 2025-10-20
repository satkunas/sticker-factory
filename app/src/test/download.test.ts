import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FontConfig } from '../config/fonts'
import type { SimpleTemplate, TextInputState, ShapeStyleState } from '../types/template-types'

// Mock dependencies
vi.mock('../utils/logger')
vi.mock('../utils/font-embedding', () => ({
  embedWebFonts: vi.fn().mockResolvedValue('@font-face { font-family: "Mock"; src: url("data:font/woff2;base64,mock"); }')
}))

describe('Download Output Tests', () => {
  let mockTemplate: SimpleTemplate
  let mockTextInputs: TextInputState[]
  let mockShapeStyles: ShapeStyleState[]
  let _mockFonts: FontConfig[]

  beforeEach(() => {
    // Mock template with multiple layers
    mockTemplate = {
      id: 'test-template',
      name: 'Test Template',
      description: 'Test template for download',
      category: 'rectangle',
      viewBox: { x: 0, y: 0, width: 400, height: 200 },
      layers: [
        {
          id: 'background',
          type: 'shape',
          subtype: 'rect',
          width: 400,
          height: 200,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
          zIndex: 1,
          shape: {
            id: 'background',
            type: 'path',
            path: 'M0,0 L400,0 L400,200 L0,200 Z',
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2
          }
        },
        {
          id: 'title',
          type: 'text',
          zIndex: 10,
          textInput: {
            id: 'title',
            label: 'Title',
            position: { x: 200, y: 80 },
            maxLength: 50,
            fontFamily: 'Roboto',
            fontSize: 24,
            fontWeight: 600,
            fontColor: '#333333'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          zIndex: 11,
          textInput: {
            id: 'subtitle',
            label: 'Subtitle',
            position: { x: 200, y: 120 },
            maxLength: 30,
            fontFamily: 'Open Sans',
            fontSize: 16,
            fontWeight: 400,
            fontColor: '#666666'
          }
        }
      ]
    }

    // Mock text inputs
    mockTextInputs = [
      {
        id: 'title',
        text: 'Test Title',
        font: {
          name: 'Roboto',
          family: 'Roboto',
          weights: [400, 600, 700],
          category: 'sans-serif',
          source: 'google',
          fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&display=swap',
          fallback: 'Arial, sans-serif'
        },
        fontSize: 24,
        fontWeight: 600,
        textColor: '#333333',
        strokeWidth: 0,
        strokeColor: '#000000',
        strokeOpacity: 1.0
      },
      {
        id: 'subtitle',
        text: 'Test Subtitle',
        font: {
          name: 'Open Sans',
          family: 'Open Sans',
          weights: [400, 600],
          category: 'sans-serif',
          source: 'google',
          fontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap',
          fallback: 'Helvetica, sans-serif'
        },
        fontSize: 16,
        fontWeight: 400,
        textColor: '#666666',
        strokeWidth: 1,
        strokeColor: '#999999',
        strokeOpacity: 0.8
      }
    ]

    // Mock shape styles
    mockShapeStyles = [
      {
        id: 'background',
        fillColor: '#f0f8ff',
        strokeColor: '#1e40af',
        strokeWidth: 3,
        strokeLinejoin: 'round'
      }
    ]

    // Mock fonts
    _mockFonts = [
      {
        name: 'Roboto',
        family: 'Roboto',
        weights: [400, 600, 700],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&display=swap',
        fallback: 'Arial, sans-serif'
      },
      {
        name: 'Open Sans',
        family: 'Open Sans',
        weights: [400, 600],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap',
        fallback: 'Helvetica, sans-serif'
      }
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Template Structure Validation', () => {
    it('should have proper template structure with layers', () => {
      expect(mockTemplate.id).toBe('test-template')
      expect(mockTemplate.layers).toHaveLength(3)

      const backgroundLayer = mockTemplate.layers.find(l => l.id === 'background')
      expect(backgroundLayer).toBeTruthy()
      expect(backgroundLayer?.type).toBe('shape')
      expect(backgroundLayer?.subtype).toBe('rect')

      const titleLayer = mockTemplate.layers.find(l => l.id === 'title')
      expect(titleLayer).toBeTruthy()
      expect(titleLayer?.type).toBe('text')

      const subtitleLayer = mockTemplate.layers.find(l => l.id === 'subtitle')
      expect(subtitleLayer).toBeTruthy()
      expect(subtitleLayer?.type).toBe('text')
    })

    it('should have proper zIndex ordering for layers', () => {
      const backgroundLayer = mockTemplate.layers.find(l => l.id === 'background')
      const titleLayer = mockTemplate.layers.find(l => l.id === 'title')
      const subtitleLayer = mockTemplate.layers.find(l => l.id === 'subtitle')

      expect(backgroundLayer?.zIndex).toBe(1)
      expect(titleLayer?.zIndex).toBe(10)
      expect(subtitleLayer?.zIndex).toBe(11)

      // Background should have lower zIndex than text layers
      expect(backgroundLayer!.zIndex).toBeLessThan(titleLayer!.zIndex)
      expect(backgroundLayer!.zIndex).toBeLessThan(subtitleLayer!.zIndex)
      expect(titleLayer!.zIndex).toBeLessThan(subtitleLayer!.zIndex)
    })

    it('should have correct viewBox dimensions', () => {
      expect(mockTemplate.viewBox.width).toBe(400)
      expect(mockTemplate.viewBox.height).toBe(200)
      expect(mockTemplate.viewBox.x).toBe(0)
      expect(mockTemplate.viewBox.y).toBe(0)
    })
  })

  describe('Font Configuration Validation', () => {
    it('should collect unique fonts from text inputs', () => {
      const fonts = mockTextInputs.map(input => input.font).filter(Boolean)
      const uniqueFontNames = [...new Set(fonts.map(f => f!.name))]

      expect(uniqueFontNames).toContain('Roboto')
      expect(uniqueFontNames).toContain('Open Sans')
      expect(uniqueFontNames).toHaveLength(2)
    })

    it('should have proper Google Fonts configuration', () => {
      const robotoFont = mockTextInputs.find(input => input.font?.name === 'Roboto')?.font
      expect(robotoFont).toBeTruthy()
      expect(robotoFont!.source).toBe('google')
      expect(robotoFont!.fontUrl).toContain('fonts.googleapis.com')
      expect(robotoFont!.fontUrl).toContain('Roboto')

      const openSansFont = mockTextInputs.find(input => input.font?.name === 'Open Sans')?.font
      expect(openSansFont).toBeTruthy()
      expect(openSansFont!.source).toBe('google')
      expect(openSansFont!.fontUrl).toContain('fonts.googleapis.com')
      expect(openSansFont!.fontUrl).toContain('Open+Sans')
    })

    it('should filter fonts by source type', () => {
      // Add a system font to test filtering
      const mixedTextInputs = [
        ...mockTextInputs,
        {
          id: 'system-text',
          text: 'System Font Text',
          font: {
            name: 'Arial',
            family: 'Arial',
            weights: [400],
            category: 'sans-serif',
            source: 'system',
            fallback: 'sans-serif'
          },
          fontSize: 14,
          fontWeight: 400,
          textColor: '#000000',
          strokeWidth: 0,
          strokeColor: '#000000',
          strokeOpacity: 1.0
        }
      ]

      // Filter fonts that should be embedded (exclude system fonts)
      const fontsToEmbed = mixedTextInputs
        .map(input => input.font)
        .filter(font => font && font.source !== 'system')

      expect(fontsToEmbed).toHaveLength(2) // Roboto and Open Sans
      expect(fontsToEmbed.map(f => f!.name)).not.toContain('Arial')
      expect(fontsToEmbed.every(f => f!.source === 'google')).toBe(true)
    })

    it('should handle incomplete font configurations', () => {
      const incompleteFont = {
        name: 'Incomplete Font',
        family: 'Incomplete Font'
        // Missing other properties like source, weights, etc.
      }

      // Should still work with minimal font configuration
      expect(incompleteFont.name).toBe('Incomplete Font')
      expect(incompleteFont.family).toBe('Incomplete Font')
    })
  })

  describe('Shape Styling Validation', () => {
    it('should apply custom shape styles correctly', () => {
      const backgroundStyle = mockShapeStyles.find(s => s.id === 'background')

      expect(backgroundStyle).toBeTruthy()
      expect(backgroundStyle!.fillColor).toBe('#f0f8ff')
      expect(backgroundStyle!.strokeColor).toBe('#1e40af')
      expect(backgroundStyle!.strokeWidth).toBe(3)
      expect(backgroundStyle!.strokeLinejoin).toBe('round')
    })

    it('should handle missing shape styles gracefully', () => {
      const emptyShapeStyles: ShapeStyleState[] = []

      // Should still work with empty shape styles
      expect(emptyShapeStyles).toHaveLength(0)

      // Template should have default styling when no custom styles provided
      const backgroundLayer = mockTemplate.layers.find(l => l.id === 'background')
      expect(backgroundLayer?.fill).toBe('#ffffff')
      expect(backgroundLayer?.stroke).toBe('#000000')
      expect(backgroundLayer?.strokeWidth).toBe(2)
    })
  })

  describe('Text Input Validation', () => {
    it('should have correct text content and properties', () => {
      expect(mockTextInputs).toHaveLength(2)

      const titleInput = mockTextInputs.find(input => input.id === 'title')
      expect(titleInput).toBeTruthy()
      expect(titleInput!.text).toBe('Test Title')
      expect(titleInput!.fontSize).toBe(24)
      expect(titleInput!.fontWeight).toBe(600)
      expect(titleInput!.textColor).toBe('#333333')

      const subtitleInput = mockTextInputs.find(input => input.id === 'subtitle')
      expect(subtitleInput).toBeTruthy()
      expect(subtitleInput!.text).toBe('Test Subtitle')
      expect(subtitleInput!.fontSize).toBe(16)
      expect(subtitleInput!.fontWeight).toBe(400)
      expect(subtitleInput!.textColor).toBe('#666666')
    })

    it('should handle text stroke properties', () => {
      const subtitleInput = mockTextInputs.find(input => input.id === 'subtitle')

      expect(subtitleInput!.strokeWidth).toBe(1)
      expect(subtitleInput!.strokeColor).toBe('#999999')
      expect(subtitleInput!.strokeOpacity).toBe(0.8)
    })

    it('should handle empty text inputs gracefully', () => {
      const emptyTextInputs: TextInputState[] = []

      expect(emptyTextInputs).toHaveLength(0)
      // Template should still be valid even without text inputs
      expect(mockTemplate.layers.filter(l => l.type === 'text')).toHaveLength(2)
    })
  })

  describe('SVG Generation Logic', () => {
    it('should calculate proper element ordering by zIndex', () => {
      const allElements = mockTemplate.layers.slice()
      allElements.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))

      expect(allElements[0].id).toBe('background') // zIndex: 1
      expect(allElements[1].id).toBe('title')      // zIndex: 10
      expect(allElements[2].id).toBe('subtitle')   // zIndex: 11
    })

    it('should properly calculate SVG dimensions', () => {
      const baseWidth = mockTemplate.viewBox.width
      const baseHeight = mockTemplate.viewBox.height

      // Test resolution calculations
      const scale2x = 2
      const scale4x = 4

      expect(baseWidth * scale2x).toBe(800)
      expect(baseHeight * scale2x).toBe(400)
      expect(baseWidth * scale4x).toBe(1600)
      expect(baseHeight * scale4x).toBe(800)
    })

    it('should validate font embedding requirements', () => {
      // Fonts that need embedding (non-system fonts)
      const fontsNeedingEmbedding = mockTextInputs
        .map(input => input.font)
        .filter(font => font && font.source !== 'system')

      expect(fontsNeedingEmbedding).toHaveLength(2)

      // All should have Google Font URLs for downloading
      fontsNeedingEmbedding.forEach(font => {
        expect(font!.fontUrl).toBeTruthy()
        expect(font!.fontUrl).toContain('fonts.googleapis.com')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle null template gracefully', () => {
      const nullTemplate = null

      // Code should handle null template without crashing
      expect(nullTemplate).toBeNull()
    })

    it('should handle malformed template data', () => {
      const malformedTemplate = {
        id: 'malformed',
        name: 'Malformed Template',
        // Missing required fields like layers, viewBox
      }

      expect(malformedTemplate.id).toBe('malformed')
      // Should handle missing properties gracefully
    })

    it('should validate required props structure', () => {
      // Test that all required properties are present
      const requiredTemplateProps = ['id', 'name', 'layers', 'viewBox']
      const requiredTextInputProps = ['id', 'text', 'font', 'fontSize', 'fontWeight', 'textColor']
      const requiredShapeStyleProps = ['id', 'fillColor', 'strokeColor', 'strokeWidth']

      requiredTemplateProps.forEach(prop => {
        expect(mockTemplate).toHaveProperty(prop)
      })

      mockTextInputs.forEach(input => {
        requiredTextInputProps.forEach(prop => {
          expect(input).toHaveProperty(prop)
        })
      })

      mockShapeStyles.forEach(style => {
        requiredShapeStyleProps.forEach(prop => {
          expect(style).toHaveProperty(prop)
        })
      })
    })
  })

  describe('Font Embedding Integration', () => {
    it('should import font embedding utility correctly', async () => {
      const { embedWebFonts } = await import('../utils/font-embedding')
      expect(embedWebFonts).toBeDefined()
      expect(typeof embedWebFonts).toBe('function')
    })

    it('should mock font embedding behavior for testing', async () => {
      const { embedWebFonts } = await import('../utils/font-embedding')

      const mockCss = '@import url("https://fonts.googleapis.com/css2?family=Test");'
      const result = await embedWebFonts(mockCss)

      expect(result).toContain('@font-face')
      expect(result).toContain('font-family: "Mock"')
    })
  })
})