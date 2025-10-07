/**
 * Clip Path Helpers
 *
 * Extract and generate clip path definitions from template layers
 */

import type { ProcessedTemplateLayer } from '../types/template-types'

export interface ClipPathDefinition {
  id: string
  path: string
}

/**
 * Generate clip path definitions from shape layers
 * These go in the <defs> section of the SVG
 * Note: Clip paths use the same coordinate space as shapes (already positioned)
 */
export function generateClipPathDefinitions(
  layers: ProcessedTemplateLayer[],
  _templateWidth: number,
  _templateHeight: number
): ClipPathDefinition[] {
  const definitions: ClipPathDefinition[] = []

  for (const layer of layers) {
    if (layer.type === 'shape') {
      const path = (layer as any).path
      if (!path) continue

      definitions.push({
        id: layer.id,
        path
      })
    }
  }

  return definitions
}