/**
 * Test suite for useLayerEventMapping composable
 * Tests event mapping configuration and prop generation for layer components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useLayerEventMapping } from '../composables/useLayerEventMapping'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'

// Mock urlDrivenStore - create function inside factory to avoid hoisting issues
vi.mock('../stores/urlDrivenStore', () => ({
  updateLayer: vi.fn()
}))

// Mock useTemplateHelpers - create inside factory to avoid hoisting issues
vi.mock('../composables/useTemplateHelpers', () => ({
  useTemplateHelpers: () => ({
    getTextInputPlaceholder: vi.fn(() => 'Enter your text...'),
    getShapeLabel: vi.fn(() => 'Circle'),
    getShapeDimensions: vi.fn(() => '200×200'),
    getShapeData: vi.fn(() => ({ id: 'shape-1', type: 'shape' })),
    getShapePath: vi.fn(() => 'M 0 0 L 100 100'),
    getSvgImageDisplayName: vi.fn(() => 'Icon Name'),
    getSvgImageDimensions: vi.fn(() => '32×32')
  })
}))

// Import mocked updateLayer after mock setup
import { updateLayer } from '../stores/urlDrivenStore'
const mockUpdateLayer = updateLayer as unknown as ReturnType<typeof vi.fn>

// Test fixtures
const createMockTemplate = (): SimpleTemplate => ({
  id: 'test-template',
  name: 'Test Template',
  category: 'circle',
  width: 400,
  height: 400,
  viewBox: { x: 0, y: 0, width: 400, height: 400 },
  layers: [
    {
      id: 'text-1',
      type: 'text',
      text: 'Hello',
      position: { x: '50%', y: '50%' },
      fontFamily: 'Roboto',
      fontSize: 24,
      fontWeight: 400,
      fontColor: '#000000'
    },
    {
      id: 'shape-1',
      type: 'shape',
      subtype: 'circle',
      position: { x: '50%', y: '50%' },
      width: 200,
      height: 200,
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 2
    },
    {
      id: 'svg-1',
      type: 'svgImage',
      position: { x: '75%', y: '25%' },
      width: 32,
      height: 32,
      svgId: 'icon-test',
      color: '#10b981'
    }
  ]
})

const createMockFlatLayer = (type: 'text' | 'shape' | 'svgImage', id: string): FlatLayerData => {
  const base: FlatLayerData = { id, type }

  if (type === 'text') {
    return {
      ...base,
      text: 'Custom Text',
      font: { family: 'Arial', category: 'sans-serif' },
      fontSize: 32,
      fontWeight: 700,
      fontColor: '#ff0000',
      strokeColor: '#0000ff',
      strokeWidth: 2,
      strokeLinejoin: 'round'
    }
  }

  if (type === 'shape') {
    return {
      ...base,
      fillColor: '#00ff00',
      strokeColor: '#ff00ff',
      strokeWidth: 3,
      strokeLinejoin: 'bevel'
    }
  }

  // svgImage
  return {
    ...base,
    svgImageId: 'custom-icon',
    svgContent: '<svg></svg>',
    color: '#ffff00',
    strokeColor: '#00ffff',
    strokeWidth: 1,
    strokeLinejoin: 'miter',
    rotation: 45,
    scale: 1.5
  }
}

interface RenderLayer {
  id: string
  type: 'text' | 'shape' | 'svgImage'
  component: string
  flatLayer: FlatLayerData
}

const createRenderLayer = (type: 'text' | 'shape' | 'svgImage', id: string): RenderLayer => ({
  id,
  type,
  component: type === 'text' ? 'TextInputWithFontSelector' : type === 'shape' ? 'TemplateObjectStyler' : 'SvgLibrarySelector',
  flatLayer: createMockFlatLayer(type, id)
})

describe('useLayerEventMapping Composable', () => {
  let selectedTemplate: ReturnType<typeof ref<SimpleTemplate | null>>
  let layers: ReturnType<typeof ref<FlatLayerData[]>>
  let getRenderDataSvgAnalysis: (layerId: string) => unknown
  let getRenderDataCentroidAnalysis: (layerId: string) => unknown

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockUpdateLayer.mockClear()

    // Setup refs
    selectedTemplate = ref(createMockTemplate())
    layers = ref([
      createMockFlatLayer('text', 'text-1'),
      createMockFlatLayer('shape', 'shape-1'),
      createMockFlatLayer('svgImage', 'svg-1')
    ])

    // Setup analysis functions
    getRenderDataSvgAnalysis = vi.fn((layerId: string) => ({ layerId, type: 'svg' }))
    getRenderDataCentroidAnalysis = vi.fn((layerId: string) => ({ layerId, type: 'centroid' }))
  })

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      const { getLayerEvents, getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      expect(getLayerEvents).toBeDefined()
      expect(getLayerProps).toBeDefined()
      expect(typeof getLayerEvents).toBe('function')
      expect(typeof getLayerProps).toBe('function')
    })
  })

  describe('Text Layer Event Mapping', () => {
    it('should generate update events for text layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)

      // Check that update events exist
      expect(events['update:modelValue']).toBeDefined()
      expect(events['update:selectedFont']).toBeDefined()
      expect(events['update:fontSize']).toBeDefined()
      expect(events['update:fontWeight']).toBeDefined()
      expect(events['update:textColor']).toBeDefined()
      expect(events['update:textStrokeColor']).toBeDefined()
      expect(events['update:textStrokeWidth']).toBeDefined()
      expect(events['update:textStrokeLinejoin']).toBeDefined()
      expect(events['update:startOffset']).toBeDefined()
      expect(events['update:dy']).toBeDefined()
      expect(events['update:dominantBaseline']).toBeDefined()
      expect(events['update:lineHeight']).toBeDefined()
      expect(events['update:rotation']).toBeDefined()
    })

    it('should call updateLayer with correct property for text update', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)

      // Call update:modelValue event
      events['update:modelValue']('New Text')

      expect(mockUpdateLayer).toHaveBeenCalledWith('text-1', { text: 'New Text' })
    })

    it('should call updateLayer with correct property for font update', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)

      const font = { family: 'Arial', category: 'sans-serif' }
      events['update:selectedFont'](font)

      expect(mockUpdateLayer).toHaveBeenCalledWith('text-1', { font })
    })

    it('should generate reset events for text layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)

      // Check that reset events exist
      expect(events['reset:selectedFont']).toBeDefined()
      expect(events['reset:textColor']).toBeDefined()
      expect(events['reset:fontSize']).toBeDefined()
      expect(events['reset:fontWeight']).toBeDefined()
      expect(events['reset:textStrokeWidth']).toBeDefined()
      expect(events['reset:textStrokeColor']).toBeDefined()
      expect(events['reset:textStrokeLinejoin']).toBeDefined()
      expect(events['reset:startOffset']).toBeDefined()
      expect(events['reset:dy']).toBeDefined()
      expect(events['reset:dominantBaseline']).toBeDefined()
      expect(events['reset:lineHeight']).toBeDefined()
      expect(events['reset:rotation']).toBeDefined()
    })

    it('should reset property to undefined when reset event called', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)

      // Call reset:fontSize event
      events['reset:fontSize']()

      expect(mockUpdateLayer).toHaveBeenCalledWith('text-1', { fontSize: undefined })
    })
  })

  describe('Shape Layer Event Mapping', () => {
    it('should generate update events for shape layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const events = getLayerEvents(layer)

      // Check that update events exist
      expect(events['update:fillColor']).toBeDefined()
      expect(events['update:strokeColor']).toBeDefined()
      expect(events['update:strokeWidth']).toBeDefined()
      expect(events['update:strokeLinejoin']).toBeDefined()
    })

    it('should call updateLayer with correct property for fillColor update', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const events = getLayerEvents(layer)

      events['update:fillColor']('#ff0000')

      expect(mockUpdateLayer).toHaveBeenCalledWith('shape-1', { fillColor: '#ff0000' })
    })

    it('should generate reset events for shape layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const events = getLayerEvents(layer)

      // Check that reset events exist
      expect(events['reset:fillColor']).toBeDefined()
      expect(events['reset:strokeColor']).toBeDefined()
      expect(events['reset:strokeWidth']).toBeDefined()
      expect(events['reset:strokeLinejoin']).toBeDefined()
    })

    it('should reset strokeColor to undefined when reset event called', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const events = getLayerEvents(layer)

      events['reset:strokeColor']()

      expect(mockUpdateLayer).toHaveBeenCalledWith('shape-1', { strokeColor: undefined })
    })
  })

  describe('SVG Image Layer Event Mapping', () => {
    it('should generate update events for svgImage layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const events = getLayerEvents(layer)

      // Check that update events exist
      expect(events['update:svgContent']).toBeDefined()
      expect(events['update:svgId']).toBeDefined()
      expect(events['update:color']).toBeDefined()
      expect(events['update:strokeColor']).toBeDefined()
      expect(events['update:strokeWidth']).toBeDefined()
      expect(events['update:strokeLinejoin']).toBeDefined()
      expect(events['update:rotation']).toBeDefined()
      expect(events['update:scale']).toBeDefined()
    })

    it('should call updateLayer with correct property for svgId update', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const events = getLayerEvents(layer)

      events['update:svgId']('new-icon-id')

      expect(mockUpdateLayer).toHaveBeenCalledWith('svg-1', { svgImageId: 'new-icon-id' })
    })

    it('should call updateLayer with correct property for rotation update', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const events = getLayerEvents(layer)

      events['update:rotation'](90)

      expect(mockUpdateLayer).toHaveBeenCalledWith('svg-1', { rotation: 90 })
    })

    it('should generate reset events for svgImage layers', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const events = getLayerEvents(layer)

      // Check that reset events exist
      expect(events['reset:svgContent']).toBeDefined()
      expect(events['reset:svgId']).toBeDefined()
      expect(events['reset:color']).toBeDefined()
      expect(events['reset:strokeColor']).toBeDefined()
      expect(events['reset:strokeWidth']).toBeDefined()
      expect(events['reset:strokeLinejoin']).toBeDefined()
      expect(events['reset:rotation']).toBeDefined()
      expect(events['reset:scale']).toBeDefined()
    })

    it('should reset scale to undefined when reset event called', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const events = getLayerEvents(layer)

      events['reset:scale']()

      expect(mockUpdateLayer).toHaveBeenCalledWith('svg-1', { scale: undefined })
    })
  })

  describe('Text Layer Props Generation', () => {
    it('should generate correct props for text layer', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const props = getLayerProps(layer)

      expect(props.modelValue).toBe('Custom Text')
      expect(props.selectedFont).toEqual({ family: 'Arial', category: 'sans-serif' })
      expect(props.fontSize).toBe(32)
      expect(props.fontWeight).toBe(700)
      expect(props.textColor).toBe('#ff0000')
      expect(props.textStrokeColor).toBe('#0000ff')
      expect(props.textStrokeWidth).toBe(2)
      expect(props.textStrokeLinejoin).toBe('round')
      expect(props.instanceId).toBe('text-1')
    })

    it('should include placeholder from template helpers', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const props = getLayerProps(layer)

      // Verify placeholder is set (value comes from mocked helper)
      expect(props.placeholder).toBe('Enter your text...')
    })

    it('should include textPath properties when present', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const textPathLayer = createRenderLayer('text', 'text-1')
      textPathLayer.flatLayer.textPath = 'path-1'
      textPathLayer.flatLayer.startOffset = '25%'
      textPathLayer.flatLayer.dy = -5

      const props = getLayerProps(textPathLayer)

      expect(props.textPath).toBe('path-1')
      expect(props.startOffset).toBe('25%')
      expect(props.dy).toBe(-5)
    })

    it('should include multiline properties when present', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const multilineLayer = createRenderLayer('text', 'text-1')
      multilineLayer.flatLayer.multiline = true
      multilineLayer.flatLayer.lineHeight = 1.5

      const props = getLayerProps(multilineLayer)

      expect(props.multiline).toBe(true)
      expect(props.lineHeight).toBe(1.5)
    })
  })

  describe('Shape Layer Props Generation', () => {
    it('should generate correct props for shape layer', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const props = getLayerProps(layer)

      expect(props.fillColor).toBe('#00ff00')
      expect(props.strokeColor).toBe('#ff00ff')
      expect(props.strokeWidth).toBe(3)
      expect(props.strokeLinejoin).toBe('bevel')
      expect(props.instanceId).toBe('shape-shape-1')
    })

    it('should include shape helper data from template helpers', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('shape', 'shape-1')
      const props = getLayerProps(layer)

      // Verify helper values are set (values come from mocked helpers)
      expect(props.shapeLabel).toBe('Circle')
      expect(props.shapeDimensions).toBe('200×200')
      expect(props.shapeData).toEqual({ id: 'shape-1', type: 'shape' })
      expect(props.shapePath).toBe('M 0 0 L 100 100')
    })
  })

  describe('SVG Image Layer Props Generation', () => {
    it('should generate correct props for svgImage layer', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const props = getLayerProps(layer)

      expect(props.svgContent).toBe('<svg></svg>')
      expect(props.svgId).toBe('custom-icon')
      expect(props.color).toBe('#ffff00')
      expect(props.strokeColor).toBe('#00ffff')
      expect(props.strokeWidth).toBe(1)
      expect(props.strokeLinejoin).toBe('miter')
      expect(props.rotation).toBe(45)
      expect(props.scale).toBe(1.5)
      expect(props.instanceId).toBe('svgImage-svg-1')
    })

    it('should include svgImage helper data from template helpers', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const props = getLayerProps(layer)

      // Verify helper values are set (values come from mocked helpers)
      expect(props.imageLabel).toBe('Icon Name')
      expect(props.imageDimensions).toBe('32×32')
    })

    it('should include analysis data from render data functions', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('svgImage', 'svg-1')
      const props = getLayerProps(layer)

      expect(props.svgAnalysis).toEqual({ layerId: 'svg-1', type: 'svg' })
      expect(props.centroidAnalysis).toEqual({ layerId: 'svg-1', type: 'centroid' })
      expect(getRenderDataSvgAnalysis).toHaveBeenCalledWith('svg-1')
      expect(getRenderDataCentroidAnalysis).toHaveBeenCalledWith('svg-1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null template gracefully', () => {
      selectedTemplate.value = null

      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const props = getLayerProps(layer)

      // Should still return props with flat layer data
      expect(props.modelValue).toBeDefined()
      expect(props.instanceId).toBe('text-1')
    })

    it('should return empty object for unknown layer type', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const invalidLayer = {
        id: 'unknown-1',
        type: 'unknown' as any,
        component: 'UnknownComponent',
        flatLayer: { id: 'unknown-1', type: 'unknown' as any }
      }

      const props = getLayerProps(invalidLayer)

      expect(props).toEqual({})
    })

    it('should return empty object for layer with no mapping', () => {
      const { getLayerEvents } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const invalidLayer = {
        id: 'unknown-1',
        type: 'unknown' as any,
        component: 'UnknownComponent',
        flatLayer: { id: 'unknown-1', type: 'unknown' as any }
      }

      const events = getLayerEvents(invalidLayer)

      expect(events).toEqual({})
    })
  })

  describe('Event and Props Integration', () => {
    it('should have consistent property names between events and props', () => {
      const { getLayerEvents, getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const events = getLayerEvents(layer)
      const props = getLayerProps(layer)

      // Update events should correspond to prop names
      expect(events['update:modelValue']).toBeDefined()
      expect(props.modelValue).toBeDefined()

      expect(events['update:fontSize']).toBeDefined()
      expect(props.fontSize).toBeDefined()

      expect(events['update:textColor']).toBeDefined()
      expect(props.textColor).toBeDefined()
    })

    it('should maintain flat architecture in prop access', () => {
      const { getLayerProps } = useLayerEventMapping(
        selectedTemplate,
        layers,
        getRenderDataSvgAnalysis,
        getRenderDataCentroidAnalysis
      )

      const layer = createRenderLayer('text', 'text-1')
      const props = getLayerProps(layer)

      // Props should be flat, not nested
      expect(props.fontSize).toBe(32)
      expect(props.fontWeight).toBe(700)
      expect(props.textColor).toBe('#ff0000')

      // No nested objects like props.style.fontSize
      expect(props.style).toBeUndefined()
    })
  })
})
