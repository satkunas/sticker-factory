import type { SimpleTemplate } from '../types/template-types'
import { getTemplateTextInputs } from '../config/template-loader'

/**
 * Composable for template helper functions
 * Provides utility functions for extracting template metadata and layer information
 */
export function useTemplateHelpers() {

  // Text input helpers
  const getTextInputLabel = (template: SimpleTemplate | null, textInputId: string): string => {
    if (!template) return 'Text'
    const textInputs = getTemplateTextInputs(template)
    const textInput = textInputs.find(input => input.id === textInputId)
    return textInput?.label || 'Text'
  }

  const getTextInputPlaceholder = (template: SimpleTemplate | null, textInputId: string): string => {
    if (!template) return 'Enter your text...'
    const textInputs = getTemplateTextInputs(template)
    const textInput = textInputs.find(input => input.id === textInputId)
    return textInput?.placeholder || 'Enter your text...'
  }

  // Shape helpers
  const getShapeInfo = (template: SimpleTemplate | null, shapeStyleId: string) => {
    if (!template) return null
    const originalLayer = template.layers?.find(layer => layer.id === shapeStyleId && layer.type === 'shape')
    return originalLayer || null
  }

  const getShapeLabel = (template: SimpleTemplate | null, shapeStyleId: string): string => {
    if (!template || !template.layers) return 'Shape'

    const originalLayer = template.layers.find(layer =>
      layer.id === shapeStyleId && layer.type === 'shape'
    )

    if (!originalLayer || originalLayer.type !== 'shape') return 'Shape'

    const subtype = originalLayer.subtype
    if (!subtype) return 'Shape'

    return subtype.charAt(0).toUpperCase() + subtype.slice(1)
  }

  const getShapeDimensions = (template: SimpleTemplate | null, shapeStyleId: string): string => {
    if (!template || !template.layers) return ''

    const originalLayer = template.layers.find(layer =>
      layer.id === shapeStyleId && layer.type === 'shape'
    )

    if (!originalLayer || originalLayer.type !== 'shape') return ''

    const width = originalLayer.width
    const height = originalLayer.height

    if (width && height) {
      return `${width}×${height}`
    }

    return ''
  }

  const getShapeData = (template: SimpleTemplate | null, shapeStyleId: string) => {
    if (!template || !template.layers) return null

    const originalLayer = template.layers.find(layer =>
      layer.id === shapeStyleId && layer.type === 'shape'
    )

    return originalLayer || null
  }

  const getShapePath = (template: SimpleTemplate | null, shapeStyleId: string): string => {
    if (!template || !template.layers) return ''

    const processedLayer = template.layers.find(layer =>
      layer.id === shapeStyleId && layer.type === 'shape'
    )

    if (processedLayer && 'shape' in processedLayer && processedLayer.shape) {
      return processedLayer.shape.path || ''
    }

    return ''
  }

  // SVG image helpers
  const getSvgImageInfo = (template: SimpleTemplate | null, svgImageStyleId: string) => {
    if (!template) return null
    const originalLayer = template.layers?.find(layer => layer.id === svgImageStyleId && layer.type === 'svgImage')
    return originalLayer || null
  }

  const getSvgImageLabel = (template: SimpleTemplate | null, svgImageStyleId: string): string => {
    if (!template || !template.layers) return 'SVG Image'

    const originalLayer = template.layers.find(layer =>
      layer.id === svgImageStyleId && layer.type === 'svgImage'
    )

    if (!originalLayer) return 'SVG Image'

    return `SVG ${originalLayer.id.charAt(0).toUpperCase() + originalLayer.id.slice(1)}`
  }

  const getSvgImageDimensions = (template: SimpleTemplate | null, svgImageStyleId: string): string => {
    if (!template || !template.layers) return ''

    const originalLayer = template.layers.find(layer =>
      layer.id === svgImageStyleId && layer.type === 'svgImage'
    )

    if (!originalLayer || originalLayer.type !== 'svgImage') return ''

    const width = originalLayer.svgImage?.width
    const height = originalLayer.svgImage?.height

    if (width && height) {
      return `${width}×${height}`
    }

    return ''
  }

  const getSvgImageContent = (template: SimpleTemplate | null, svgImageStyleId: string): string => {
    if (!template || !template.layers) return ''

    const originalLayer = template.layers.find(layer =>
      layer.id === svgImageStyleId && layer.type === 'svgImage'
    )

    if (!originalLayer || originalLayer.type !== 'svgImage') return ''

    return originalLayer.svgContent || originalLayer.svgImage?.svgContent || ''
  }

  const getSvgImageId = (template: SimpleTemplate | null, svgImageStyleId: string): string => {
    if (!template || !template.layers) return ''

    const originalLayer = template.layers.find(layer =>
      layer.id === svgImageStyleId && layer.type === 'svgImage'
    )

    if (!originalLayer || originalLayer.type !== 'svgImage') return ''

    return originalLayer.svgId || ''
  }

  return {
    // Public methods (alphabetical order per behavioral guidelines)
    getShapeData,
    getShapeDimensions,
    getShapeInfo,
    getShapeLabel,
    getShapePath,
    getSvgImageContent,
    getSvgImageDimensions,
    getSvgImageId,
    getSvgImageInfo,
    getSvgImageLabel,
    getTextInputLabel,
    getTextInputPlaceholder
  }
}