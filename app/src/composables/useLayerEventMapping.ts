/**
 * Layer Event Mapping Composable
 *
 * Centralizes event mapping configuration for layer components.
 * Maps component events to store properties and handles both update and reset events.
 *
 * This composable provides:
 * - Event mapping configuration for text, shape, and svgImage layers
 * - Pure event mapper functions for update and reset events
 * - Type-safe event handler generation
 */

import type { Ref } from 'vue'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'
import { updateLayer } from '../stores/urlDrivenStore'
import { useTemplateHelpers } from './useTemplateHelpers'

// Layer with component information for rendering
interface RenderLayer {
  id: string
  type: 'text' | 'shape' | 'svgImage'
  component: string
  flatLayer: FlatLayerData
}

// FLAT ARCHITECTURE: Event mapping for flat property names
const eventMappings = {
  text: {
    'update:modelValue': 'text',
    'update:selectedFont': 'font',
    'update:fontSize': 'fontSize',
    'update:fontWeight': 'fontWeight',
    'update:textColor': 'fontColor',
    'update:textStrokeColor': 'strokeColor',
    'update:textStrokeWidth': 'strokeWidth',
    'update:textStrokeLinejoin': 'strokeLinejoin',
    // TextPath event mappings
    'update:startOffset': 'startOffset',
    'update:dy': 'dy',
    'update:dominantBaseline': 'dominantBaseline',
    // Multi-line text event mappings
    'update:lineHeight': 'lineHeight',
    // Rotation event mapping
    'update:rotation': 'rotation'
  },
  shape: {
    'update:fillColor': 'fillColor',       // Normalized property name
    'update:strokeColor': 'strokeColor',   // Normalized property name
    'update:strokeWidth': 'strokeWidth',
    'update:strokeLinejoin': 'strokeLinejoin'
  },
  svgImage: {
    'update:svgContent': 'svgContent',
    'update:svgId': 'svgImageId',
    'update:color': 'color',
    'update:strokeColor': 'strokeColor',
    'update:strokeWidth': 'strokeWidth',
    'update:strokeLinejoin': 'strokeLinejoin',
    'update:rotation': 'rotation',
    'update:scale': 'scale'
  }
} as const

// FLAT ARCHITECTURE: Reset event mapping - maps reset events to store properties
const resetEventMappings = {
  text: {
    'reset:selectedFont': 'font',
    'reset:textColor': 'fontColor',
    'reset:fontSize': 'fontSize',
    'reset:fontWeight': 'fontWeight',
    'reset:textStrokeWidth': 'strokeWidth',
    'reset:textStrokeColor': 'strokeColor',
    'reset:textStrokeLinejoin': 'strokeLinejoin',
    'reset:startOffset': 'startOffset',
    'reset:dy': 'dy',
    'reset:dominantBaseline': 'dominantBaseline',
    'reset:lineHeight': 'lineHeight',
    'reset:rotation': 'rotation'
  },
  shape: {
    'reset:fillColor': 'fillColor',        // Normalized property name
    'reset:strokeColor': 'strokeColor',    // Normalized property name
    'reset:strokeWidth': 'strokeWidth',
    'reset:strokeLinejoin': 'strokeLinejoin'
  },
  svgImage: {
    'reset:svgContent': 'svgContent',
    'reset:svgId': 'svgImageId',
    'reset:color': 'color',
    'reset:strokeColor': 'strokeColor',
    'reset:strokeWidth': 'strokeWidth',
    'reset:strokeLinejoin': 'strokeLinejoin',
    'reset:rotation': 'rotation',
    'reset:scale': 'scale'
  }
} as const

/**
 * Layer event mapping composable
 * Provides event mapping functions for layer components
 */
export function useLayerEventMapping(
  selectedTemplate: Ref<SimpleTemplate | null>,
  layers: Ref<FlatLayerData[]>,
  getRenderDataSvgAnalysis: (layerId: string) => unknown,
  getRenderDataCentroidAnalysis: (layerId: string) => unknown
) {
  const {
    getTextInputPlaceholder,
    getShapeLabel,
    getShapeDimensions,
    getShapeData,
    getShapePath,
    getSvgImageDisplayName,
    getSvgImageDimensions
  } = useTemplateHelpers()

  /**
   * Pure event mapper - handles both update and reset events
   */
  const getLayerEvents = (layer: RenderLayer) => {
    const mapping = eventMappings[layer.type as keyof typeof eventMappings]
    const resetMapping = resetEventMappings[layer.type as keyof typeof resetEventMappings]

    if (!mapping) return {}

    // Generate update event handlers from mapping configuration
    const updateEvents = Object.fromEntries(
      Object.entries(mapping).map(([eventName, storeProperty]) => [
        eventName,
        (value: unknown) => updateLayer(layer.id, { [storeProperty]: value })
      ])
    )

    // Generate reset event handlers - set property to undefined to use template default
    const resetEvents = resetMapping ? Object.fromEntries(
      Object.entries(resetMapping).map(([eventName, storeProperty]) => [
        eventName,
        () => updateLayer(layer.id, { [storeProperty]: undefined })
      ])
    ) : {}

    return { ...updateEvents, ...resetEvents }
  }

  /**
   * FLAT ARCHITECTURE: Pure prop mapping with flat data access
   */
  const getLayerProps = (layer: RenderLayer) => {
    const { flatLayer } = layer

    switch (layer.type) {
      case 'text':
        return {
          // Direct flat property access - no nested objects
          modelValue: flatLayer.text,
          placeholder: getTextInputPlaceholder(selectedTemplate.value, layer.id),
          selectedFont: flatLayer.font,
          fontSize: flatLayer.fontSize,
          fontWeight: flatLayer.fontWeight,
          textColor: flatLayer.fontColor,
          textStrokeColor: flatLayer.strokeColor,
          textStrokeWidth: flatLayer.strokeWidth,
          textStrokeLinejoin: flatLayer.strokeLinejoin,
          strokeOpacity: flatLayer.strokeOpacity,
          // TextPath properties for curved text
          textPath: flatLayer.textPath,
          startOffset: flatLayer.startOffset,
          dy: flatLayer.dy,
          dominantBaseline: flatLayer.dominantBaseline,
          // Multi-line text properties
          multiline: flatLayer.multiline,
          lineHeight: flatLayer.lineHeight,
          // Rotation property
          rotation: flatLayer.rotation,
          instanceId: layer.id
        }
      case 'shape':
        return {
          shapeLabel: getShapeLabel(selectedTemplate.value, layer.id),
          shapeDimensions: getShapeDimensions(selectedTemplate.value, layer.id),
          shapeData: getShapeData(selectedTemplate.value, layer.id),
          shapePath: getShapePath(selectedTemplate.value, layer.id),
          fillColor: flatLayer.fillColor,      // Use normalized property name
          strokeColor: flatLayer.strokeColor,  // Use normalized property name
          strokeWidth: flatLayer.strokeWidth,
          strokeLinejoin: flatLayer.strokeLinejoin,
          instanceId: `shape-${layer.id}`
        }
      case 'svgImage':
        return {
          imageLabel: getSvgImageDisplayName(selectedTemplate.value, layer.id, flatLayer.svgImageId),
          imageDimensions: getSvgImageDimensions(selectedTemplate.value, layer.id),
          svgContent: flatLayer.svgContent,
          svgId: flatLayer.svgImageId,
          color: flatLayer.color,
          strokeColor: flatLayer.strokeColor,
          strokeWidth: flatLayer.strokeWidth,
          strokeLinejoin: flatLayer.strokeLinejoin,
          rotation: flatLayer.rotation,
          scale: flatLayer.scale,
          instanceId: `svgImage-${layer.id}`,
          svgAnalysis: getRenderDataSvgAnalysis(layer.id),
          centroidAnalysis: getRenderDataCentroidAnalysis(layer.id)
        }
      default:
        return {}
    }
  }

  return {
    getLayerEvents,
    getLayerProps
  }
}
