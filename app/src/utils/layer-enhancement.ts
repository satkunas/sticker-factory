/**
 * Layer Enhancement Utilities
 * ===========================
 *
 * Pure functions for enhancing layers with additional data
 * (e.g., user-uploaded SVG content from stores)
 */

import type { FlatLayerData } from '../types/template-types'
import { isUserSvgId } from './asset-hash'

/**
 * Enhance layers with user-uploaded SVG content
 * Pure function - caller provides content accessor function
 *
 * @param layers - Original layer data
 * @param getUserSvgContent - Function to retrieve user SVG content by ID
 * @returns Enhanced layers with svgContent populated for user SVGs
 */
export function enhanceLayersWithUserSvgs(
  layers: FlatLayerData[],
  getUserSvgContent: (id: string) => string | null
): FlatLayerData[] {
  return layers.map(layer => {
    if (layer.svgImageId && isUserSvgId(layer.svgImageId)) {
      const userContent = getUserSvgContent(layer.svgImageId)
      if (userContent) {
        return { ...layer, svgContent: userContent }
      }
    }
    return layer
  })
}

/**
 * Check if any layers use user-uploaded SVGs
 *
 * @param layers - Layer data to check
 * @returns True if any layer has a user SVG ID
 */
export function hasUserSvgLayers(layers: FlatLayerData[]): boolean {
  return layers.some(layer =>
    layer.svgImageId && isUserSvgId(layer.svgImageId)
  )
}
