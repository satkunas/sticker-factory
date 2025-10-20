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
            fillColor: '#3b82f6',
            strokeColor: '#1e40af',
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
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
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
            fillColor: '#3b82f6',
            strokeColor: '#1e40af',
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
    it('should preserve template IDs for URL stability', () => {
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

      // Template IDs are NOT compressed to ensure URL stability when adding new templates
      // Should contain the full template filename
      expect(decoded).toContain('business-card')
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
            fillColor: '#ffffff'
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
            fillColor: '#3b82f6',
            strokeColor: '#1e40af',
            strokeWidth: 3,
            strokeLinejoin: 'bevel'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.fillColor).toBe('#3b82f6')
      expect(decoded?.layers?.[0]?.strokeColor).toBe('#1e40af')
      expect(decoded?.layers?.[0]?.strokeWidth).toBe(3)
      expect(decoded?.layers?.[0]?.strokeLinejoin).toBe('bevel')
    })

    it('should preserve fillColor in URL encoding/decoding for shape layers', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'shape1',
            type: 'shape',
            fillColor: '#10b981',
            strokeColor: '#059669'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      // Explicit test: fillColor must survive URL round-trip
      expect(decoded?.layers?.[0]?.fillColor).toBe('#10b981')
      expect(decoded?.layers?.[0]?.strokeColor).toBe('#059669')
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

  describe('TextPath Properties', () => {
    it('should roundtrip encode/decode text layer with textPath', () => {
      const state: AppState = {
        selectedTemplateId: 'certification-seal',
        layers: [
          {
            id: 'curved-text',
            type: 'text',
            text: 'CURVED TEXT',
            fontFamily: 'Oswald',
            fontSize: 24,
            fontColor: '#1e40af',
            textPath: 'arc-path',
            startOffset: '50%',
            dy: -10
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.textPath).toBe('arc-path')
      expect(decoded?.layers?.[0]?.startOffset).toBe('50%')
      expect(decoded?.layers?.[0]?.dy).toBe(-10)
    })

    it('should preserve textPath, startOffset, and dy properties', () => {
      const state: AppState = {
        selectedTemplateId: 'wave-rider-sticker',
        layers: [
          {
            id: 'wave-text',
            type: 'text',
            text: 'RIDE THE WAVE',
            fontFamily: 'Oswald',
            textPath: 'wave-path',
            startOffset: '25%',
            dy: 5
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded).toBeTruthy()
      expect(decoded?.layers).toHaveLength(1)
      expect(decoded?.layers?.[0]).toMatchObject({
        id: 'wave-text',
        type: 'text',
        text: 'RIDE THE WAVE',
        textPath: 'wave-path',
        startOffset: '25%',
        dy: 5
      })
    })

    it('should handle textPath without startOffset/dy (optional)', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'simple-curved-text',
            type: 'text',
            text: 'Simple Curve',
            fontFamily: 'Inter',
            textPath: 'simple-path'
            // No startOffset or dy provided
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.textPath).toBe('simple-path')
      expect(decoded?.layers?.[0]?.startOffset).toBeUndefined()
      expect(decoded?.layers?.[0]?.dy).toBeUndefined()
    })

    it('should compress textPath properties using PROP_MAP', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            textPath: 'path1',
            startOffset: '50%',
            dy: -5
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Decode to inspect compressed structure
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

      // Should use compressed keys: p, q, d
      expect(parsed.l[0].p).toBe('path1')       // textPath -> 'p'
      expect(parsed.l[0].q).toBe('50%')         // startOffset -> 'q'
      expect(parsed.l[0].d).toBe(-5)            // dy -> 'd'
    })

    it('should handle multiple text layers with different textPath configurations', () => {
      const state: AppState = {
        selectedTemplateId: 'certification-seal',
        layers: [
          {
            id: 'top-text',
            type: 'text',
            text: 'TOP',
            textPath: 'top-arc',
            startOffset: '50%',
            dy: 0
          },
          {
            id: 'bottom-text',
            type: 'text',
            text: 'BOTTOM',
            textPath: 'bottom-arc',
            startOffset: '50%',
            dy: -5
          },
          {
            id: 'regular-text',
            type: 'text',
            text: 'CENTER'
            // No textPath - regular text
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers).toHaveLength(3)

      // First layer has textPath
      expect(decoded?.layers?.[0]?.textPath).toBe('top-arc')
      expect(decoded?.layers?.[0]?.startOffset).toBe('50%')
      expect(decoded?.layers?.[0]?.dy).toBe(0)

      // Second layer has different textPath
      expect(decoded?.layers?.[1]?.textPath).toBe('bottom-arc')
      expect(decoded?.layers?.[1]?.dy).toBe(-5)

      // Third layer has no textPath
      expect(decoded?.layers?.[2]?.textPath).toBeUndefined()
      expect(decoded?.layers?.[2]?.text).toBe('CENTER')
    })

    it('should handle dy with negative, zero, and positive values', () => {
      const testCases = [
        { dy: -100, description: 'maximum negative offset' },
        { dy: -50, description: 'negative offset' },
        { dy: 0, description: 'zero offset' },
        { dy: 50, description: 'positive offset' },
        { dy: 100, description: 'maximum positive offset' }
      ]

      testCases.forEach(({ dy, description }) => {
        const state: AppState = {
          selectedTemplateId: 'test',
          layers: [
            {
              id: 'text1',
              type: 'text',
              text: 'Test',
              textPath: 'path1',
              dy
            }
          ],
          lastModified: Date.now()
        }

        const encoded = encodeTemplateStateCompact(state)
        const decoded = decodeTemplateStateCompact(encoded)

        expect(decoded?.layers?.[0]?.dy).toBe(dy, description)
      })
    })

    it('should handle startOffset with various percentage values', () => {
      const testCases = ['0%', '25%', '50%', '75%', '100%']

      testCases.forEach(startOffset => {
        const state: AppState = {
          selectedTemplateId: 'test',
          layers: [
            {
              id: 'text1',
              type: 'text',
              text: 'Test',
              textPath: 'path1',
              startOffset
            }
          ],
          lastModified: Date.now()
        }

        const encoded = encodeTemplateStateCompact(state)
        const decoded = decodeTemplateStateCompact(encoded)

        expect(decoded?.layers?.[0]?.startOffset).toBe(startOffset)
      })
    })

    it('should preserve dominantBaseline property', () => {
      const state: AppState = {
        selectedTemplateId: 'certification-seal',
        layers: [
          {
            id: 'curved-text',
            type: 'text',
            text: 'CERTIFICATION',
            fontFamily: 'Oswald',
            textPath: 'arc-path',
            startOffset: '50%',
            dy: -10,
            dominantBaseline: 'central'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]?.dominantBaseline).toBe('central')
    })

    it('should handle various dominantBaseline values', () => {
      const testCases = ['auto', 'text-bottom', 'alphabetic', 'ideographic', 'middle', 'central', 'mathematical', 'hanging', 'text-top']

      testCases.forEach(dominantBaseline => {
        const state: AppState = {
          selectedTemplateId: 'test',
          layers: [
            {
              id: 'text1',
              type: 'text',
              text: 'Test',
              textPath: 'path1',
              dominantBaseline
            }
          ],
          lastModified: Date.now()
        }

        const encoded = encodeTemplateStateCompact(state)
        const decoded = decodeTemplateStateCompact(encoded)

        expect(decoded?.layers?.[0]?.dominantBaseline).toBe(dominantBaseline)
      })
    })

    it('should compress dominantBaseline using PROP_MAP (key: b)', () => {
      const state: AppState = {
        selectedTemplateId: 'test',
        layers: [
          {
            id: 'text1',
            type: 'text',
            text: 'Test',
            textPath: 'path1',
            dominantBaseline: 'central'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)

      // Decode to inspect compressed structure
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

      // Should use compressed key: 'b' for dominantBaseline
      expect(parsed.l[0].b).toBe('central')
    })

    it('should handle all textPath properties together', () => {
      const state: AppState = {
        selectedTemplateId: 'certification-seal',
        layers: [
          {
            id: 'top-seal-text',
            type: 'text',
            text: 'PREMIUM QUALITY',
            fontFamily: 'Oswald',
            fontSize: 18,
            fontWeight: 600,
            fontColor: '#1e40af',
            textPath: 'top-arc',
            startOffset: '50%',
            dy: -8,
            dominantBaseline: 'central'
          }
        ],
        lastModified: Date.now()
      }

      const encoded = encodeTemplateStateCompact(state)
      const decoded = decodeTemplateStateCompact(encoded)

      expect(decoded?.layers?.[0]).toMatchObject({
        id: 'top-seal-text',
        type: 'text',
        text: 'PREMIUM QUALITY',
        fontFamily: 'Oswald',
        fontSize: 18,
        fontWeight: 600,
        fontColor: '#1e40af',
        textPath: 'top-arc',
        startOffset: '50%',
        dy: -8,
        dominantBaseline: 'central'
      })
    })
  })
})
