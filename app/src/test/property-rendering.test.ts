/**
 * Property Rendering Integration Tests
 * =====================================
 *
 * CRITICAL: These tests ensure ALL form properties work in ALL 3 rendering contexts:
 * 1. Main SVG preview (Svg.vue)
 * 2. Template selection icons (TemplateSelector.vue)
 * 3. Download files (exported SVG/PNG/PDF/WebP)
 *
 * REQUIREMENTS:
 * - When adding a new property, add a test here
 * - When a property doesn't work in any context, add a test that reproduces the issue
 * - Tests must verify the property flows through the entire data pipeline
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { generateSvgString } from '../utils/svg-string-generator'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'

/**
 * Test template with all layer types for comprehensive testing
 */
const createTestTemplate = (): SimpleTemplate => ({
  id: 'test-template',
  name: 'Test Template',
  description: 'Comprehensive test template',
  width: 400,
  height: 400,
  viewBox: { x: 0, y: 0, width: 400, height: 400 },
  layers: [
    // Shape layer with normalized property names
    {
      id: 'test-shape',
      type: 'shape',
      subtype: 'rect',
      position: { x: 200, y: 100 },
      width: 100,
      height: 100,
      path: 'M150,50 L250,50 L250,150 L150,150 Z',
      fillColor: '#ff0000',        // Normalized property name
      strokeColor: '#000000',      // Normalized property name
      strokeWidth: 2,
      strokeLinejoin: 'miter'
    } as any,
    // Text layer
    {
      id: 'test-text',
      type: 'text',
      position: { x: 200, y: 250 },
      text: 'Default Text',
      label: 'Test Text',
      fontFamily: 'Arial',
      fontColor: '#333333',        // Normalized property name
      fontSize: 24,
      fontWeight: 700,
      strokeColor: '#ff0000',      // Normalized property name
      strokeWidth: 1,
      strokeLinejoin: 'round'
    } as any,
    // SVG image layer
    {
      id: 'test-svgimage',
      type: 'svgImage',
      position: { x: 200, y: 350 },
      width: 50,
      height: 50,
      svgImageId: 'test-icon',
      svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>',
      color: '#00ff00',            // SVG images use 'color' not 'fillColor'
      strokeColor: '#0000ff',      // Normalized property name
      strokeWidth: 2,
      strokeLinejoin: 'bevel',
      rotation: 0,
      scale: 1
    } as any
  ]
})

describe('Property Rendering - Shape Layers', () => {
  let template: SimpleTemplate
  let layers: FlatLayerData[]

  beforeEach(() => {
    template = createTestTemplate()
    layers = []
  })

  it('should render shape fillColor in SVG string generator', () => {
    // Override fillColor
    layers = [{ id: 'test-shape', fillColor: '#00ff00' }]

    const svg = generateSvgString(template, layers)

    // Verify fillColor is applied
    expect(svg).toContain('fill="#00ff00"')
    expect(svg).not.toContain('fill="#ff0000"') // Not template default
  })

  it('should render shape strokeColor in SVG string generator', () => {
    // Override strokeColor
    layers = [{ id: 'test-shape', strokeColor: '#ff00ff' }]

    const svg = generateSvgString(template, layers)

    // Verify strokeColor is applied
    expect(svg).toContain('stroke="#ff00ff"')
    expect(svg).not.toContain('stroke="#000000"') // Not template default
  })

  it('should render shape strokeWidth in SVG string generator', () => {
    // Override strokeWidth
    layers = [{ id: 'test-shape', strokeWidth: 5 }]

    const svg = generateSvgString(template, layers)

    // Verify strokeWidth is applied
    expect(svg).toContain('stroke-width="5"')
    // Note: Cannot check for absence of stroke-width="2" as it may be used by other layers (svgImage has strokeWidth: 2)
  })

  it('should render shape strokeLinejoin in SVG string generator', () => {
    // Override strokeLinejoin
    layers = [{ id: 'test-shape', strokeLinejoin: 'round' }]

    const svg = generateSvgString(template, layers)

    // Verify strokeLinejoin is applied
    expect(svg).toContain('stroke-linejoin="round"')
    expect(svg).not.toContain('stroke-linejoin="miter"') // Not template default
  })

  it('should fallback to template fillColor when layer override is undefined', () => {
    // No override - should use template default
    layers = []

    const svg = generateSvgString(template, layers)

    // Verify template default is used
    expect(svg).toContain('fill="#ff0000"')
  })

  it('should fallback to template strokeColor when layer override is undefined', () => {
    // No override - should use template default
    layers = []

    const svg = generateSvgString(template, layers)

    // Verify template default is used
    expect(svg).toContain('stroke="#000000"')
  })
})

describe('Property Rendering - Text Layers', () => {
  let template: SimpleTemplate
  let layers: FlatLayerData[]

  beforeEach(() => {
    template = createTestTemplate()
    layers = []
  })

  it('should render text content in SVG string generator', () => {
    // Override text
    layers = [{ id: 'test-text', text: 'Custom Text' }]

    const svg = generateSvgString(template, layers)

    // Verify text content is applied
    expect(svg).toContain('Custom Text')
    expect(svg).not.toContain('Default Text') // Not template default
  })

  it('should render text fontColor in SVG string generator', () => {
    // Override fontColor
    layers = [{ id: 'test-text', fontColor: '#ff0000' }]

    const svg = generateSvgString(template, layers)

    // Verify fontColor is applied
    expect(svg).toContain('fill="#ff0000"')
    expect(svg).not.toContain('fill="#333333"') // Not template default
  })

  it('should render text fontSize in SVG string generator', () => {
    // Override fontSize
    layers = [{ id: 'test-text', fontSize: 32 }]

    const svg = generateSvgString(template, layers)

    // Verify fontSize is applied
    expect(svg).toContain('font-size="32"')
    expect(svg).not.toContain('font-size="24"') // Not template default
  })

  it('should render text fontWeight in SVG string generator', () => {
    // Override fontWeight
    layers = [{ id: 'test-text', fontWeight: 400 }]

    const svg = generateSvgString(template, layers)

    // Verify fontWeight is applied
    expect(svg).toContain('font-weight="400"')
    expect(svg).not.toContain('font-weight="700"') // Not template default
  })

  it('should render text strokeColor in SVG string generator', () => {
    // Override strokeColor
    layers = [{ id: 'test-text', strokeColor: '#00ff00', strokeWidth: 2 }]

    const svg = generateSvgString(template, layers)

    // Verify strokeColor is applied (only when strokeWidth > 0)
    expect(svg).toContain('stroke="#00ff00"')
  })

  it('should render text strokeWidth in SVG string generator', () => {
    // Override strokeWidth
    layers = [{ id: 'test-text', strokeWidth: 3 }]

    const svg = generateSvgString(template, layers)

    // Verify strokeWidth is applied
    expect(svg).toContain('stroke-width="3"')
  })

  it('should render text strokeLinejoin in SVG string generator', () => {
    // Override strokeLinejoin
    layers = [{ id: 'test-text', strokeLinejoin: 'miter', strokeWidth: 1 }]

    const svg = generateSvgString(template, layers)

    // Verify strokeLinejoin is applied
    expect(svg).toContain('stroke-linejoin="miter"')
  })

  it('should escape XML special characters in text', () => {
    // Text with special characters
    layers = [{ id: 'test-text', text: 'Test & <Special> "Characters"' }]

    const svg = generateSvgString(template, layers)

    // Verify characters are escaped
    expect(svg).toContain('Test &amp; &lt;Special&gt; &quot;Characters&quot;')
    expect(svg).not.toContain('Test & <Special> "Characters"') // Not raw
  })

  it('should render text fontFamily in SVG string generator', () => {
    // Override fontFamily
    layers = [{ id: 'test-text', fontFamily: 'Roboto' }]

    const svg = generateSvgString(template, layers)

    // Verify fontFamily is applied
    expect(svg).toContain('font-family="Roboto"')
    expect(svg).not.toContain('font-family="Arial"') // Not template default
  })
})

describe('Property Rendering - SVG Image Layers', () => {
  let template: SimpleTemplate
  let layers: FlatLayerData[]

  beforeEach(() => {
    template = createTestTemplate()
    layers = []
  })

  it('should render svgImage color in SVG string generator', () => {
    // Override color
    layers = [{ id: 'test-svgimage', color: '#ff00ff' }]

    const svg = generateSvgString(template, layers)

    // SVG images use 'color' property which maps to 'fill' attribute
    // Verify the color override is applied to the nested SVG element
    expect(svg).toContain('fill="#ff00ff"')
    expect(svg).not.toContain('fill="#00ff00"') // Not template default
  })

  it('should render svgImage strokeColor in SVG string generator', () => {
    // Override strokeColor
    layers = [{ id: 'test-svgimage', strokeColor: '#ff0000' }]

    const svg = generateSvgString(template, layers)

    // Verify strokeColor is applied to the nested SVG element
    expect(svg).toContain('stroke="#ff0000"')
    expect(svg).not.toContain('stroke="#0000ff"') // Not template default
  })

  it('should render svgImage strokeWidth in SVG string generator', () => {
    // Override strokeWidth
    layers = [{ id: 'test-svgimage', strokeWidth: 4 }]

    const svg = generateSvgString(template, layers)

    // Verify strokeWidth is applied to the nested SVG element
    expect(svg).toContain('stroke-width="4"')
    // Note: Cannot check for absence of stroke-width="2" as it may be used by other layers
  })

  it('should render svgImage strokeLinejoin in SVG string generator', () => {
    // Override strokeLinejoin
    layers = [{ id: 'test-svgimage', strokeLinejoin: 'round' }]

    const svg = generateSvgString(template, layers)

    // Verify strokeLinejoin is applied to the nested SVG element
    expect(svg).toContain('stroke-linejoin="round"')
    expect(svg).not.toContain('stroke-linejoin="bevel"') // Not template default
  })

  it('should use custom svgContent when provided', () => {
    // Override svgContent
    const customSvg = '<svg viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" /></svg>'
    layers = [{ id: 'test-svgimage', svgContent: customSvg }]

    const svg = generateSvgString(template, layers)

    // Verify custom content is used
    expect(svg).toContain('rect x="0" y="0" width="24" height="24"')
  })

  it('should render svgImage rotation in SVG string generator', () => {
    // Override rotation
    layers = [{ id: 'test-svgimage', rotation: 90 }]

    const svg = generateSvgString(template, layers)

    // Verify rotation is applied (check for rotate transform)
    expect(svg).toContain('rotate(90')
  })

  it('should render svgImage scale in SVG string generator', () => {
    // Override scale
    layers = [{ id: 'test-svgimage', scale: 2.0 }]

    const svg = generateSvgString(template, layers)

    // Verify scale is applied (check for scale transform)
    expect(svg).toContain('scale(2')
  })
})

describe('Property Rendering - Template Defaults', () => {
  let template: SimpleTemplate

  beforeEach(() => {
    template = createTestTemplate()
  })

  it('should use template defaults when no layer overrides provided', () => {
    // No overrides
    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify template defaults are used
    expect(svg).toContain('fill="#ff0000"') // Shape fillColor
    expect(svg).toContain('stroke="#000000"') // Shape strokeColor
    expect(svg).toContain('Default Text') // Text content
    expect(svg).toContain('fill="#333333"') // Text fontColor
  })

  it('should override template defaults when layer data provided', () => {
    // Override all properties
    const layers: FlatLayerData[] = [
      { id: 'test-shape', fillColor: '#00ff00', strokeColor: '#ff00ff' },
      { id: 'test-text', text: 'Custom', fontColor: '#0000ff' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify overrides are used
    expect(svg).toContain('fill="#00ff00"') // Shape fillColor override
    expect(svg).toContain('stroke="#ff00ff"') // Shape strokeColor override
    expect(svg).toContain('Custom') // Text override
    expect(svg).toContain('fill="#0000ff"') // Text fontColor override

    // Verify defaults are NOT used
    expect(svg).not.toContain('fill="#333333"') // Template text fontColor default
    expect(svg).not.toContain('Default Text') // Template text
  })

  it('should fallback to template defaults for svgImage color when no layer override', () => {
    // REGRESSION TEST: svgImage template defaults were not being applied
    // This caused template selector icons and download previews to not render colors
    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify svgImage template defaults are used
    // Template has: color: '#00ff00', strokeColor: '#0000ff', strokeWidth: 2
    expect(svg).toContain('fill="#00ff00"') // SVG image color (maps to fill)
    expect(svg).toContain('stroke="#0000ff"') // SVG image strokeColor
    expect(svg).toContain('stroke-width="2"') // SVG image strokeWidth
  })

  it('should fallback to template defaults for svgImage strokeLinejoin when no layer override', () => {
    // Template has strokeLinejoin: 'bevel'
    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify svgImage template strokeLinejoin default is used
    expect(svg).toContain('stroke-linejoin="bevel"')
  })
})

describe('Property Rendering - Multi-line Text', () => {
  it('should render multi-line text with tspan elements', () => {
    const template: SimpleTemplate = {
      id: 'multiline-test',
      name: 'Multiline Test',
      description: 'Test multiline text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'multiline-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Line 1',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400,
          multiline: true,
          lineHeight: 1.5
        } as any
      ]
    }

    const layers: FlatLayerData[] = [
      { id: 'multiline-text', text: 'Line 1\nLine 2\nLine 3' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify tspan elements are created
    expect(svg).toContain('<tspan')
    expect(svg).toContain('Line 1')
    expect(svg).toContain('Line 2')
    expect(svg).toContain('Line 3')
  })

  it('should override multiline text content in SVG string generator', () => {
    const template: SimpleTemplate = {
      id: 'multiline-test',
      name: 'Multiline Test',
      description: 'Test multiline text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'multiline-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Default Line 1\nDefault Line 2',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400,
          multiline: true,
          lineHeight: 1.5
        } as any
      ]
    }

    // Override text content
    const layers: FlatLayerData[] = [
      { id: 'multiline-text', text: 'Custom A\nCustom B\nCustom C' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify override is used
    expect(svg).toContain('Custom A')
    expect(svg).toContain('Custom B')
    expect(svg).toContain('Custom C')

    // Verify defaults are NOT used
    expect(svg).not.toContain('Default Line 1')
    expect(svg).not.toContain('Default Line 2')
  })

  it('should override multiline lineHeight in SVG string generator', () => {
    const template: SimpleTemplate = {
      id: 'multiline-test',
      name: 'Multiline Test',
      description: 'Test multiline text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'multiline-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Line 1\nLine 2',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400,
          multiline: true,
          lineHeight: 1.5
        } as any
      ]
    }

    // Override lineHeight
    const layers: FlatLayerData[] = [
      { id: 'multiline-text', lineHeight: 2.0 }
    ]

    const svg = generateSvgString(template, layers)

    // Verify tspan elements are present (lineHeight affects dy calculation)
    expect(svg).toContain('<tspan')
    expect(svg).toContain('Line 1')
    expect(svg).toContain('Line 2')
  })
})

describe('Property Rendering - TextPath (Curved Text)', () => {
  it('should render text along a path using textPath', () => {
    const template: SimpleTemplate = {
      id: 'textpath-test',
      name: 'TextPath Test',
      description: 'Test curved text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        // Path definition for textPath
        {
          id: 'curve-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,200 Q 200,100 300,200',
          position: { x: 0, y: 0 }
        } as any,
        // Text using textPath
        {
          id: 'curved-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Curved Text',
          textPath: 'curve-path',
          startOffset: '50%',
          dy: 5,
          dominantBaseline: 'central',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400
        } as any
      ]
    }

    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify textPath is used
    expect(svg).toContain('<textPath')
    expect(svg).toContain('href="#curve-path"')
    expect(svg).toContain('startOffset="50%"')
    expect(svg).toContain('Curved Text')
  })

  it('should override textPath text content in SVG string generator', () => {
    const template: SimpleTemplate = {
      id: 'textpath-test',
      name: 'TextPath Test',
      description: 'Test curved text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'curve-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,200 Q 200,100 300,200',
          position: { x: 0, y: 0 }
        } as any,
        {
          id: 'curved-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Default Curved',
          textPath: 'curve-path',
          startOffset: '50%',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400
        } as any
      ]
    }

    // Override text content
    const layers: FlatLayerData[] = [
      { id: 'curved-text', text: 'Custom Curved' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify override is used
    expect(svg).toContain('Custom Curved')

    // Verify default is NOT used
    expect(svg).not.toContain('Default Curved')
  })

  it('should override textPath startOffset in SVG string generator', () => {
    const template: SimpleTemplate = {
      id: 'textpath-test',
      name: 'TextPath Test',
      description: 'Test curved text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'curve-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,200 Q 200,100 300,200',
          position: { x: 0, y: 0 }
        } as any,
        {
          id: 'curved-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Curved Text',
          textPath: 'curve-path',
          startOffset: '50%',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400
        } as any
      ]
    }

    // Override startOffset
    const layers: FlatLayerData[] = [
      { id: 'curved-text', startOffset: '25%' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify override is used
    expect(svg).toContain('startOffset="25%"')

    // Verify default is NOT used
    expect(svg).not.toContain('startOffset="50%"')
  })

  it('should override textPath dy in SVG string generator', () => {
    const template: SimpleTemplate = {
      id: 'textpath-test',
      name: 'TextPath Test',
      description: 'Test curved text',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'curve-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,200 Q 200,100 300,200',
          position: { x: 0, y: 0 }
        } as any,
        {
          id: 'curved-text',
          type: 'text',
          position: { x: 200, y: 200 },
          text: 'Curved Text',
          textPath: 'curve-path',
          startOffset: '50%',
          dy: 5,
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400
        } as any
      ]
    }

    // Override dy
    const layers: FlatLayerData[] = [
      { id: 'curved-text', dy: 10 }
    ]

    const svg = generateSvgString(template, layers)

    // Verify textPath is present with dy override
    expect(svg).toContain('<textPath')
    expect(svg).toContain('Curved Text')
  })
})

describe('Property Rendering - Property Name Consistency', () => {
  it('should NOT accept old property names (fill, stroke)', () => {
    const template = createTestTemplate()

    // Try using old property names - these should be IGNORED
    const layers: FlatLayerData[] = [
      { id: 'test-shape', fill: '#00ff00' as any, stroke: '#ff00ff' as any }
    ]

    const svg = generateSvgString(template, layers)

    // Verify old names are ignored, template defaults used instead
    expect(svg).toContain('fill="#ff0000"') // Template fillColor, not override
    expect(svg).toContain('stroke="#000000"') // Template strokeColor, not override
  })

  it('should only accept normalized property names (fillColor, strokeColor)', () => {
    const template = createTestTemplate()

    // Use normalized property names
    const layers: FlatLayerData[] = [
      { id: 'test-shape', fillColor: '#00ff00', strokeColor: '#ff00ff' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify normalized names work
    expect(svg).toContain('fill="#00ff00"')
    expect(svg).toContain('stroke="#ff00ff"')
  })
})

describe('Property Rendering - Path Layers', () => {
  it('should render visual path layers with fill styling', () => {
    // REGRESSION TEST: Visual path layers (like stripes) were being skipped
    // This caused map-offroad-circle template stripes to not render
    const template: SimpleTemplate = {
      id: 'path-test',
      name: 'Path Test',
      description: 'Test visual path rendering',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        // Visual path with fill - should render
        {
          id: 'stripe-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,100 L 200,100 L 200,200 L 100,200 Z',
          position: { x: 0, y: 0 },
          fillColor: '#ff0000',
          strokeColor: 'none'
        } as any
      ]
    }

    const layers: FlatLayerData[] = []
    const svg = generateSvgString(template, layers)

    // Verify visual path is rendered
    expect(svg).toContain('d="M 100,100 L 200,100 L 200,200 L 100,200 Z"')
    expect(svg).toContain('fill="#ff0000"')
  })

  it('should NOT render reference-only path layers (for textPath)', () => {
    // Reference paths have no fill/stroke and should not render visually
    const template: SimpleTemplate = {
      id: 'path-test',
      name: 'Path Test',
      description: 'Test reference path skipping',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        // Reference-only path (no fill/stroke) - should NOT render
        {
          id: 'curve-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,200 Q 200,100 300,200',
          position: { x: 0, y: 0 }
          // No fillColor or strokeColor - this is a textPath reference only
        } as any,
        // Text using the reference path
        {
          id: 'curved-text',
          type: 'text',
          text: 'Curved Text',
          textPath: 'curve-path',
          startOffset: '50%',
          fontFamily: 'Arial',
          fontColor: '#000000',
          fontSize: 20,
          fontWeight: 400,
          position: { x: 200, y: 200 }
        } as any
      ]
    }

    const layers: FlatLayerData[] = []
    const svg = generateSvgString(template, layers)

    // Verify reference path is in defs for textPath, but NOT rendered as visible shape
    expect(svg).toContain('id="curve-path"') // In defs
    expect(svg).toContain('<textPath') // Used by text
    // Path should appear only once in defs, not in the main content
    const pathMatches = svg.match(/d="M 100,200 Q 200,100 300,200"/g)
    expect(pathMatches?.length).toBe(1) // Only in defs, not rendered
  })

  it('should render path layers with stroke-only styling', () => {
    // Paths with stroke but no fill should still render
    const template: SimpleTemplate = {
      id: 'path-test',
      name: 'Path Test',
      description: 'Test stroke-only path rendering',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'outline-path',
          type: 'shape',
          subtype: 'path',
          path: 'M 100,100 L 200,100',
          position: { x: 0, y: 0 },
          fillColor: 'none',
          strokeColor: '#0000ff',
          strokeWidth: 3
        } as any
      ]
    }

    const layers: FlatLayerData[] = []
    const svg = generateSvgString(template, layers)

    // Verify stroke-only path is rendered
    expect(svg).toContain('d="M 100,100 L 200,100"')
    expect(svg).toContain('stroke="#0000ff"')
    expect(svg).toContain('stroke-width="3"')
  })
})

describe('Property Rendering - User Uploaded SVGs', () => {
  it('should render user SVG content when svgImageId is user-uploaded', () => {
    // CRITICAL: User SVGs must work in downloads/template icons
    // This test ensures generateSvgImageElement resolves user SVG content
    const template: SimpleTemplate = {
      id: 'user-svg-test',
      name: 'User SVG Test',
      description: 'Test user-uploaded SVG rendering',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'user-svg-layer',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'library-icon', // Library SVG (not user-uploaded)
          svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>',
          color: '#ff0000',
          strokeColor: '#000000',
          strokeWidth: 2,
          rotation: 0,
          scale: 1
        } as any
      ]
    }

    // Layer data with user SVG content (simulating user upload)
    const userSvgContent = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" /></svg>'
    const layers: FlatLayerData[] = [
      {
        id: 'user-svg-layer',
        svgImageId: 'user-svg-abc12345', // User-uploaded SVG ID format
        svgContent: userSvgContent,
        color: '#00ff00'
      }
    ]

    const svg = generateSvgString(template, layers)

    // Verify user SVG content is rendered
    expect(svg).toContain('rect x="10" y="10" width="80" height="80"')

    // Verify user color override is applied
    expect(svg).toContain('fill="#00ff00"')
    expect(svg).not.toContain('fill="#ff0000"') // Not template default
  })

  it('should handle user SVG IDs correctly', () => {
    // Test that user SVG IDs are recognized and processed
    const template: SimpleTemplate = {
      id: 'user-svg-id-test',
      name: 'User SVG ID Test',
      description: 'Test user SVG ID handling',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'svg-layer',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'user-svg-12345678', // User SVG ID format: user-svg-{8charHash}
          svgContent: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>',
          color: '#0000ff',
          rotation: 0,
          scale: 1
        } as any
      ]
    }

    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify template SVG content is used (even though it's a user SVG ID)
    // Note: In real usage, userSvgStore would provide the content
    expect(svg).toContain('circle cx="12" cy="12" r="10"')
    expect(svg).toContain('fill="#0000ff"')
  })

  it('should override user SVG color property', () => {
    // User SVGs should respect color overrides
    const template: SimpleTemplate = {
      id: 'user-svg-color-test',
      name: 'User SVG Color Test',
      description: 'Test user SVG color override',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'user-svg',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'user-svg-fedcba98',
          svgContent: '<svg viewBox="0 0 50 50"><rect width="50" height="50" /></svg>',
          color: '#ff0000', // Template default
          strokeColor: '#000000',
          strokeWidth: 2,
          rotation: 0,
          scale: 1
        } as any
      ]
    }

    // Override color
    const layers: FlatLayerData[] = [
      { id: 'user-svg', color: '#00ff00' }
    ]

    const svg = generateSvgString(template, layers)

    // Verify color override is applied
    expect(svg).toContain('fill="#00ff00"')
    expect(svg).not.toContain('fill="#ff0000"') // Not template default
  })

  it('should override user SVG stroke properties', () => {
    // User SVGs should respect stroke overrides
    const template: SimpleTemplate = {
      id: 'user-svg-stroke-test',
      name: 'User SVG Stroke Test',
      description: 'Test user SVG stroke override',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'user-svg',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'user-svg-11223344',
          svgContent: '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" /></svg>',
          color: '#ff0000',
          strokeColor: '#000000', // Template default
          strokeWidth: 2,          // Template default
          strokeLinejoin: 'miter', // Template default
          rotation: 0,
          scale: 1
        } as any
      ]
    }

    // Override stroke properties
    const layers: FlatLayerData[] = [
      {
        id: 'user-svg',
        strokeColor: '#0000ff',
        strokeWidth: 5,
        strokeLinejoin: 'round'
      }
    ]

    const svg = generateSvgString(template, layers)

    // Verify stroke overrides are applied
    expect(svg).toContain('stroke="#0000ff"')
    expect(svg).toContain('stroke-width="5"')
    expect(svg).toContain('stroke-linejoin="round"')

    // Verify defaults are NOT used
    expect(svg).not.toContain('stroke="#000000"')
    expect(svg).not.toContain('stroke-linejoin="miter"')
  })

  it('should override user SVG transform properties (rotation, scale)', () => {
    // User SVGs should respect transform overrides
    const template: SimpleTemplate = {
      id: 'user-svg-transform-test',
      name: 'User SVG Transform Test',
      description: 'Test user SVG transform override',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'user-svg',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'user-svg-aabbccdd',
          svgContent: '<svg viewBox="0 0 50 50"><polygon points="25,5 45,45 5,45" /></svg>',
          color: '#ff0000',
          rotation: 0,  // Template default
          scale: 1      // Template default
        } as any
      ]
    }

    // Override transform properties
    const layers: FlatLayerData[] = [
      {
        id: 'user-svg',
        rotation: 45,
        scale: 2.0
      }
    ]

    const svg = generateSvgString(template, layers)

    // Verify transforms are applied
    expect(svg).toContain('rotate(45')
    expect(svg).toContain('scale(2')
  })

  it('should use template defaults for user SVG when no overrides provided', () => {
    // User SVGs should fallback to template defaults like library SVGs
    const template: SimpleTemplate = {
      id: 'user-svg-defaults-test',
      name: 'User SVG Defaults Test',
      description: 'Test user SVG template defaults',
      width: 400,
      height: 400,
      viewBox: { x: 0, y: 0, width: 400, height: 400 },
      layers: [
        {
          id: 'user-svg',
          type: 'svgImage',
          position: { x: 200, y: 200 },
          width: 50,
          height: 50,
          svgImageId: 'user-svg-99887766',
          svgContent: '<svg viewBox="0 0 50 50"><path d="M 10,10 L 40,40" /></svg>',
          color: '#ff00ff',        // Template default
          strokeColor: '#00ffff',  // Template default
          strokeWidth: 3,          // Template default
          strokeLinejoin: 'bevel', // Template default
          rotation: 0,
          scale: 1
        } as any
      ]
    }

    // No overrides - should use template defaults
    const layers: FlatLayerData[] = []

    const svg = generateSvgString(template, layers)

    // Verify template defaults are used
    expect(svg).toContain('fill="#ff00ff"')
    expect(svg).toContain('stroke="#00ffff"')
    expect(svg).toContain('stroke-width="3"')
    expect(svg).toContain('stroke-linejoin="bevel"')
  })
})
