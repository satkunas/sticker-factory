import { describe, it, expect } from 'vitest'
import { encodeTemplateStateCompact, decodeTemplateStateCompact } from '../utils/url-encoding'
import type { AppState } from '../types/app-state'

describe('URL Encoding v2', () => {
  describe('Basic Roundtrip Encoding', () => {
    it('should roundtrip encode/decode empty state', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded).toBeTruthy()
      expect(decoded?.selectedTemplateId).toBe('test')
      expect(decoded?.layers).toEqual([])
    })

    it('should roundtrip encode/decode with text layer', () => {
      const state: AppState = {
        selectedTemplateId: 'business-card',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Hello World',
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 700,
            fontColor: '#1f2937'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.selectedTemplateId).toBe('business-card')
      expect(decoded?.layers).toHaveLength(1)
      expect(decoded?.layers?.[0]).toMatchObject({
        id: 'text1',
        type: 'text',
        text: 'Hello World',
        fontFamily: 'Inter'
      })
    })

    it('should roundtrip encode/decode with shape layer', () => {
      const state: AppState = {
        selectedTemplateId: 'conference-sticker',
        layers: [
          {
            id: 'shape1',
            type: 'shape',
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
            strokeLinejoin: 'round'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]).toMatchObject({
        id: 'shape1',
        type: 'shape',
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        strokeLinejoin: 'round'
      })
    })

    it('should roundtrip encode/decode with svgImage layer', () => {
      const state: AppState = {
        selectedTemplateId: 'tech-company-sticker',
        layers: [
          {
            id: 'svg1',
            type: 'svgImage',
            svgImageId: 'ui-shield',
            svgContent: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7v6c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z"/></svg>',
            color: '#10b981',
            scale: 1.5,
            rotation: 45,
            strokeWidth: 1
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]).toMatchObject({
        id: 'svg1',
        type: 'svgImage',
        svgImageId: 'ui-shield',
        color: '#10b981',
        scale: 1.5,
        rotation: 45
      })

      // SVG content should be preserved
      expect(decoded?.layers?.[0]?.svgContent).toContain('<svg')
      expect(decoded?.layers?.[0]?.svgContent).toContain('viewBox')
    })
  })

  describe('Complex Multi-Layer State', () => {
    it('should handle complex state with multiple layer types', () => {
      const state: AppState = {
        selectedTemplateId: 'conference-sticker',
        layers: [
          {
            id: 'shape1',
            type: 'shape',
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            id: 'text1',
            type: 'text',
            text: 'Tech Conference 2025',
            fontFamily: 'Roboto',
            fontSize: 32,
            fontWeight: 700,
            fontColor: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 1
          },
          {
            id: 'svg1',
            type: 'svgImage',
            svgImageId: 'ui-code',
            svgContent: '<svg viewBox="0 0 24 24"><rect width="24" height="24"/></svg>',
            color: '#f59e0b',
            scale: 1.2,
            rotation: 15
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.selectedTemplateId).toBe('conference-sticker')
      expect(decoded?.layers).toHaveLength(3)
      expect(decoded?.layers?.map(l => l.type)).toEqual(['shape', 'text', 'svgImage'])
    })
  })

  describe('Version Detection', () => {
    it('should reject URLs without version header', () => {
      // Manually crafted URL without version field
      // {"t":"B","l":[]} = {"selectedTemplateId":"business-card","layers":[]}
      const oldUrl = 'eyJ0IjoiQiIsImwiOltdfQ'

      const decoded = decodeTemplateStateCompact(oldUrl)

      // Should return null for missing version
      expect(decoded).toBeNull()
    })

    it('should accept URLs with correct version header (v2 format)', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [],
        lastModified: Date.now()
      }

      // Encode with NEW encoder (includes v:2)
      const encoded = encodeTemplateStateCompact(state)

      // Decode should succeed
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded).toBeTruthy()
      expect(decoded?.selectedTemplateId).toBe('test')
    })

    it('should include version in encoded output', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Manually decode to inspect structure
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const binaryString = atob(padded)
      const utf8Bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        utf8Bytes[i] = binaryString.charCodeAt(i)
      }
      /* eslint-disable-next-line no-undef */
      const jsonString = new TextDecoder().decode(utf8Bytes)
      const parsed = JSON.parse(jsonString)

      // Should contain version field
      expect(parsed.v).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const decoded = decodeTemplateStateCompact('')
      expect(decoded).toBeNull()
    })

    it('should handle invalid Base64', () => {
      const decoded = decodeTemplateStateCompact('not-valid-base64!!!')
      expect(decoded).toBeNull()
    })

    it('should handle corrupted JSON', () => {
      // Valid Base64 but invalid JSON
      const corrupted = btoa('{"invalid json}').replace(/\+/g, '-').replace(/\//g, '_')
      const decoded = decodeTemplateStateCompact(corrupted)
      expect(decoded).toBeNull()
    })

    it('should handle special characters in text', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Hello 世界 🌍 "quotes" & <tags>',
            fontFamily: 'Inter'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.text).toBe('Hello 世界 🌍 "quotes" & <tags>')
    })

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000)
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: longText,
            fontFamily: 'Inter'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.text).toBe(longText)
    })
  })

  describe('Compression Efficiency', () => {
    it('should compress template IDs', () => {
      const state: AppState = {
        selectedTemplateId: 'business-card',
        layers: [],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Decode to inspect
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const decoded = atob(padded)

      // Should NOT contain the full string "business-card"
      expect(decoded).not.toContain('business-card')
      // Should contain compressed version 'B'
      expect(decoded).toContain('B')
    })

    it('should compress common font families', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            fontFamily: 'Inter'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Decode to inspect
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const decoded = atob(padded)

      // Should NOT contain the full string "Inter"
      expect(decoded).not.toContain('Inter')
      // Should contain compressed version 'A'
      expect(decoded).toContain('A')
    })

    it('should compress common colors', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'shape1',
            type: 'shape',
            fill: '#ffffff'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Decode to inspect
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const decoded = atob(padded)

      // Should use palette index instead of hex string
      expect(decoded).not.toContain('#ffffff')
    })
  })

  describe('Font Family Encoding', () => {
    it('should preserve font family in text layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            fontFamily: 'Roboto',
            fontSize: 18
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.fontFamily).toBe('Roboto')
    })

    it('should handle custom (non-compressed) font families', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            fontFamily: 'Custom Font Name',
            fontSize: 18
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.fontFamily).toBe('Custom Font Name')
    })
  })

  describe('Stroke Properties', () => {
    it('should preserve stroke properties for text layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            fontFamily: 'Inter',
            strokeColor: '#ff0000',
            strokeWidth: 2,
            strokeLinejoin: 'round',
            strokeOpacity: 0.8
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.strokeColor).toBe('#ff0000')
      expect(decoded?.layers?.[0]?.strokeWidth).toBe(2)
      expect(decoded?.layers?.[0]?.strokeLinejoin).toBe('round')
      expect(decoded?.layers?.[0]?.strokeOpacity).toBe(0.8)
    })

    it('should preserve stroke properties for shape layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'shape1',
            type: 'shape',
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 3,
            strokeLinejoin: 'bevel'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.stroke).toBe('#1e40af')
      expect(decoded?.layers?.[0]?.strokeWidth).toBe(3)
      expect(decoded?.layers?.[0]?.strokeLinejoin).toBe('bevel')
    })
  })

  describe('Transform Properties', () => {
    it('should preserve rotation and scale for svgImage layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'svg1',
            type: 'svgImage',
            svgImageId: 'test-icon',
            svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
            rotation: 90,
            scale: 2.5
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.rotation).toBe(90)
      expect(decoded?.layers?.[0]?.scale).toBe(2.5)
    })

    it('should preserve transformOrigin for svgImage layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'svg1',
            type: 'svgImage',
            svgImageId: 'test-icon',
            svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
            transformOrigin: { x: 15, y: 10 }
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.transformOrigin).toEqual({ x: 15, y: 10 })
    })
  })
})
