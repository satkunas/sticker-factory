/**
 * Mask Helpers
 *
 * Extract and generate mask definitions from template layers
 */

import type { ProcessedTemplateLayer } from '../types/template-types'

export interface MaskDefinition {
  id: string
  path: string
}

/**
 * Generate mask definitions from shape layers
 * These go in the <defs> section of the SVG
 * Note: Masks use the same coordinate space as shapes (already positioned)
 */
export function generateMaskDefinitions(
  layers: ProcessedTemplateLayer[],
  _templateWidth: number,
  _templateHeight: number
): MaskDefinition[] {
  const definitions: MaskDefinition[] = []

  for (const layer of layers) {
    if (layer.type === 'shape') {
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