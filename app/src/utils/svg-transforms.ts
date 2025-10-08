/**
 * SVG Transform Utilities
 * ======================
 *
 * Pure TypeScript functions for SVG transform calculations.
 * Extracted from Svg.vue to improve separation of concerns.
 */

import type { Point } from '../types/svg-types'

/**
 * Calculate scaled centroid coordinates for SVG images
 * Converts transform origin from viewBox space to template space
 *
 * @param svgContent - SVG content string with viewBox attribute
 * @param templateWidth - Template width in template coordinates
 * @param templateHeight - Template height in template coordinates
 * @param transformOrigin - Transform origin in viewBox coordinates
 * @returns Scaled transform origin in template space
 */
export function calculateScaledTransformOrigin(
  svgContent: string,
  templateWidth: number,
  templateHeight: number,
  transformOrigin: Point
): Point {
  // Extract viewBox from SVG content
  const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']*)["']/i)

  let scaledOriginX = transformOrigin.x
  let scaledOriginY = transformOrigin.y

  if (viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number)
    if (viewBoxValues.length === 4) {
      const [, , viewBoxWidth, viewBoxHeight] = viewBoxValues

      // Calculate scale ratio from viewBox to template dimensions
      const scaleX = templateWidth / viewBoxWidth
      const scaleY = templateHeight / viewBoxHeight

      // Scale transform origin coordinates to template space
      scaledOriginX = transformOrigin.x * scaleX
      scaledOriginY = transformOrigin.y * scaleY
    }
  }

  return { x: scaledOriginX, y: scaledOriginY }
}

/**
 * Process SVG content to apply rendering attributes
 * Adds width/height, overflow="visible", and styling attributes
 *
 * @param svgContent - Original SVG content string
 * @param templateWidth - Optional width to set on SVG element
 * @param templateHeight - Optional height to set on SVG element
 * @param clipPath - Optional clip-path URL reference
 * @param color - Optional fill color to apply
 * @param strokeColor - Optional stroke color to apply
 * @param strokeWidth - Optional stroke width to apply
 * @returns Processed SVG content with attributes applied
 */
export function applySvgRenderingAttributes(
  svgContent: string,
  templateWidth?: number,
  templateHeight?: number,
  clipPath?: string,
  color?: string,
  strokeColor?: string,
  strokeWidth?: number
): string {
  if (!svgContent) return ''

  // Build style attributes to add/replace
  const attributesToSet: Record<string, string> = {
    overflow: 'visible'
  }

  // Add width and height to force scaling to template dimensions
  if (templateWidth !== undefined) {
    attributesToSet.width = templateWidth.toString()
  }
  if (templateHeight !== undefined) {
    attributesToSet.height = templateHeight.toString()
  }

  if (clipPath) {
    attributesToSet['clip-path'] = clipPath
  }
  if (color !== undefined) {
    attributesToSet.fill = color
  }
  if (strokeColor !== undefined) {
    attributesToSet.stroke = strokeColor
  }
  if (strokeWidth !== undefined && strokeWidth > 0) {
    attributesToSet['stroke-width'] = strokeWidth.toString()
  }

  // Process the SVG element
  const processed = svgContent.replace(
    /<svg([^>]*)>/i,
    (match, attrs) => {
      let updatedAttrs = attrs

      // Remove existing width and height attributes
      updatedAttrs = updatedAttrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
      updatedAttrs = updatedAttrs.replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')

      // Add/replace our attributes
      Object.entries(attributesToSet).forEach(([key, value]) => {
        // Remove existing attribute if present
        const attrRegex = new RegExp(`\\s+${key}\\s*=\\s*["'][^"']*["']`, 'gi')
        updatedAttrs = updatedAttrs.replace(attrRegex, '')
        // Add new attribute
        updatedAttrs += ` ${key}="${value}"`
      })

      return `<svg${updatedAttrs}>`
    }
  )

  return processed
}
