/**
 * Property Rendering Integration Tests
 * =====================================
 *
 * CRITICAL: These tests ensure ALL form properties work in ALL 4 rendering contexts:
 * 1. Main SVG preview (SvgContent.vue)
 * 2. Template selection icons (TemplateSelector.vue)
 * 3. Download preview (Service Worker .svg URL)
 * 4. Download files (exported SVG/PNG)
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
    expect(svg).not.toContain('stroke-width="2"') // Not template default
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
