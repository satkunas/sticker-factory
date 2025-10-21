/**
 * Mask and TextPath Helpers
 *
 * Extract and generate mask and textPath definitions from template layers
 */

import type { ProcessedTemplateLayer, FlatLayerData } from '../types/template-types'

export interface MaskDefinition {
  id: string
  path: string
}

export interface TextPathDefinition {
  id: string
  pathData: string
}

/**
 * Generate mask definitions from shape layers
 * These go in the <defs> section of the SVG
 * Note: Masks use the same coordinate space as shapes (already positioned)
 * Excludes path layers (subtype='path') which are used for textPath references
 */
export function generateMaskDefinitions(
  layers: ProcessedTemplateLayer[],
  _templateWidth: number,
  _templateHeight: number
): MaskDefinition[] {
  const definitions: MaskDefinition[] = []

  for (const layer of layers) {
    if (layer.type === 'shape') {
      // Skip path layers - these are for textPath references, not masks
      const subtype = (layer as unknown as { subtype?: string }).subtype
      if (subtype === 'path') continue

      // Access path directly on layer (runtime structure differs from TypeScript interface)
      const path = (layer as unknown as { path?: string }).path
      if (!path) continue

      definitions.push({
        id: layer.id,
        path
      })
    }
  }

  return definitions
}

/**
 * Generate textPath path definitions from shape layers
 * These go in the <defs> section of the SVG
 * Only includes path layers (subtype='path') that are referenced by text layers
 */
export function generateTextPathDefinitions(
  layers: ProcessedTemplateLayer[]
): TextPathDefinition[] {
  const definitions: TextPathDefinition[] = []

  const textPathReferences = new Set<string>()

  for (const layer of layers) {
    if (layer.type === 'text') {
      const flatLayer = layer as unknown as FlatLayerData
      if (flatLayer.textPath) {
        textPathReferences.add(flatLayer.textPath)
      }
    }
  }

  for (const layer of layers) {
    if (layer.type === 'shape') {
      // Access path data using runtime structure (differs from TypeScript types)
      const subtype = (layer as unknown as { subtype?: string }).subtype
      const path = (layer as unknown as { path?: string }).path

      if (subtype === 'path' && textPathReferences.has(layer.id) && path) {
        definitions.push({
          id: layer.id,
          pathData: path
        })
      }
    }
  }

  return definitions
}