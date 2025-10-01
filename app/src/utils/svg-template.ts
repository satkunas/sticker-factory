/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from './logger'
import {
  injectSvgColors,
  applySvgStrokeProperties,
  normalizeSvgCurrentColor,
  sanitizeColorValue
} from './svg-styling'
import { resolveCoordinate } from './svg'
import { getSvgCenterOffset } from './svg-bounds'

/**
 * Enhanced SVG styling with proper color injection and positioning
 * Pure function that doesn't depend on reactive state
 */
export const getStyledSvgContent = (svgImage: any) => {
  const svgContent = svgImage.svgContent
  if (!svgContent) return ''

  try {
    let styledContent = svgContent

    // Get styling properties directly from svgImage object - no hardcoded fallbacks
    const fillColor = svgImage.fill ? sanitizeColorValue(svgImage.fill) : undefined
    const strokeColor = svgImage.stroke ? sanitizeColorValue(svgImage.stroke) : undefined
    const strokeWidth = svgImage.strokeWidth
    const strokeLinejoin = svgImage.strokeLinejoin

    // Apply color injection only if colors are defined
    if (fillColor || strokeColor) {
      styledContent = injectSvgColors(
        styledContent,
        fillColor,
        strokeColor,
        { forceFill: !!fillColor, forceStroke: !!(strokeColor && strokeWidth) }
      )
    }

    // Apply stroke properties only if defined
    if (strokeWidth !== undefined && strokeLinejoin) {
      styledContent = applySvgStrokeProperties(
        styledContent,
        strokeWidth,
        strokeLinejoin
      )
    }

    // Normalize currentColor for proper inheritance
    styledContent = normalizeSvgCurrentColor(styledContent)

    // CRITICAL FIX: Extract inner content while preserving coordinate system
    // Strip outer <svg> wrapper but maintain proper scaling context
    const svgMatch = styledContent.match(/<svg[^>]*viewBox="([^"]*)"[^>]*>(.*?)<\/svg>/s)
    if (svgMatch && svgMatch[2]) {
      const viewBox = svgMatch[1] // e.g., "0 0 24 24"
      const innerContent = svgMatch[2].trim()

      // Extract viewBox dimensions to ensure proper coordinate system
      const viewBoxParts = viewBox.split(/\s+/)
      if (viewBoxParts.length === 4) {
        const [minX, minY, _width, _height] = viewBoxParts.map(Number)

        // Calculate dynamic offset to center the actual content within the viewBox
        // Use SVG bounds analysis to find the true center of any SVG content
        const centerOffset = getSvgCenterOffset(styledContent)

        // Apply safety validation to prevent NaN in transforms
        const safeOffsetX = isFinite(centerOffset.x) ? centerOffset.x : 0
        const safeOffsetY = isFinite(centerOffset.y) ? centerOffset.y : 0
        const safeMinX = isFinite(minX) ? minX : 0
        const safeMinY = isFinite(minY) ? minY : 0

        // Wrap inner content with precise centering compensation
        return `<g transform="translate(${-safeMinX + safeOffsetX}, ${-safeMinY + safeOffsetY})">
          <g transform="scale(1, 1)">
            ${innerContent}
          </g>
        </g>`
      }

      // Fallback: return inner content as-is
      return innerContent
    }

    // Fallback: try to extract without viewBox
    const fallbackMatch = styledContent.match(/<svg[^>]*>(.*?)<\/svg>/s)
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim()
    }

    return styledContent
  } catch (error) {
    logger.warn('Failed to style SVG content:', error)
    return svgImage.svgContent
  }
}


/**
 * Mini SVG preview helper for scaled-down previews
 * Pure function that doesn't depend on reactive state
 */
export const getMiniStyledSvgContent = (svgImage: any) => {
  if (!svgImage.svgContent) return ''

  try {
    let styledContent = svgImage.svgContent

    // Apply basic styling for mini preview - no hardcoded fallbacks
    const fillColor = svgImage.fill ? sanitizeColorValue(svgImage.fill) : undefined
    const strokeColor = svgImage.stroke ? sanitizeColorValue(svgImage.stroke) : undefined

    // Apply simple color injection for mini preview only if colors are defined
    if (fillColor || strokeColor) {
      styledContent = injectSvgColors(
        styledContent,
        fillColor,
        strokeColor,
        { forceFill: !!fillColor }
      )
    }

    return styledContent
  } catch (error) {
    // Fallback to original content
    return svgImage.svgContent
  }
}

/**
 * Calculate mini SVG transform for small previews
 * Pure function that doesn't depend on reactive state
 */
export const getMiniSvgTransform = (
  svgImage: any,
  templateViewBox?: { width: number; height: number },
  scale?: number
) => {
  try {
    // For mini preview, use a simple approach with coordinate resolution
    const containerBounds = {
      x: 0,
      y: 0,
      width: templateViewBox?.width,
      height: templateViewBox?.height
    }

    // Only proceed if we have required data
    if (!containerBounds.width || !containerBounds.height) {
      return ''
    }

    const resolvedX = resolveCoordinate(svgImage.position.x, containerBounds.width, 0)
    const resolvedY = resolveCoordinate(svgImage.position.y, containerBounds.height, 0)

    const transforms = [`translate(${resolvedX}, ${resolvedY})`]

    // Add scale only if provided
    if (scale !== undefined) {
      transforms.push(`scale(${scale})`)
    }

    return transforms.join(' ')
  } catch (error) {
    // Return empty string on error - no hardcoded fallbacks
    return ''
  }
}

/**
 * Resolve text position coordinates (percentage or absolute)
 * Pure function that doesn't depend on reactive state
 */
export const resolveTextPosition = (
  textInput: any,
  axis: 'x' | 'y',
  templateViewBox?: { x: number; y: number; width: number; height: number }
) => {
  try {
    const containerBounds = {
      x: templateViewBox?.x,
      y: templateViewBox?.y,
      width: templateViewBox?.width,
      height: templateViewBox?.height
    }

    // Return undefined if we don't have required container bounds
    if (containerBounds.width === undefined || containerBounds.height === undefined) {
      return undefined
    }

    const coordinate = textInput.position[axis]
    const containerSize = axis === 'x' ? containerBounds.width : containerBounds.height
    const offset = axis === 'x' ? (containerBounds.x ?? 0) : (containerBounds.y ?? 0)

    return resolveCoordinate(coordinate, containerSize, offset)
  } catch (error) {
    // Return undefined on error - no hardcoded fallbacks
    return undefined
  }
}