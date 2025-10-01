/**
 * Clip Path Helpers
 *
 * Extract and generate clip path definitions from template layers
 */

import type { ProcessedTemplateLayer } from '../types/template-types'

export interface ClipPathDefinition {
  id: string
  path: string
  transform: string
}

/**
 * Generate clip path definitions from shape layers
 * These go in the <defs> section of the SVG
 */
export function generateClipPathDefinitions(
  layers: ProcessedTemplateLayer[],
  templateWidth: number,
  templateHeight: number
): ClipPathDefinition[] {
  const definitions: ClipPathDefinition[] = []

  for (const layer of layers) {
    if (layer.type === 'shape' && layer.shape) {
      const posX = resolvePosition(
        (layer as any).position?.x,
        templateWidth
      )
      const posY = resolvePosition(
        (layer as any).position?.y,
        templateHeight
      )

      definitions.push({
        id: layer.shape.id,
        path: layer.shape.path,
        transform: `translate(${posX}, ${posY})`
      })
    }
  }

  return definitions
}

/**
 * Get clip path reference for a layer
 * Returns the url(#id) string or undefined
 */
export function getClipPathReference(
  layer: ProcessedTemplateLayer
): string | undefined {
  if (layer.type === 'text' && layer.textInput?.clip) {
    return `url(#${layer.textInput.clip})`
  }
  if (layer.type === 'svgImage' && layer.svgImage?.clip) {
    return `url(#${layer.svgImage.clip})`
  }
  return undefined
}

/**
 * Resolve percentage or absolute position
 */
function resolvePosition(
  value: number | string | undefined,
  dimension: number
): number {
  if (value === undefined) return dimension / 2
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * dimension
  }
  return value as number
}