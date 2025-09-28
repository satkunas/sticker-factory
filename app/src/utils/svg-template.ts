/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from './logger'
import {
  injectSvgColors,
  applySvgStrokeProperties,
  normalizeSvgCurrentColor,
  sanitizeColorValue
} from './svg-styling'
import { resolveCoordinate } from './svg'

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

    // CRITICAL FIX: Strip outer <svg> wrapper to prevent nested SVG scaling issues
    // Extract only the inner content (polyline, polygon, path, etc.) for proper scaling
    const svgMatch = styledContent.match(/<svg[^>]*>(.*?)<\/svg>/s)
    if (svgMatch && svgMatch[1]) {
      // Return only the inner SVG content without the <svg> wrapper
      return svgMatch[1].trim()
    }

    return styledContent
  } catch (error) {
    logger.warn('Failed to style SVG content:', error)
    return svgImage.svgContent
  }
}

/**
 * Calculate proper SVG transform using SAME coordinate system as text elements
 * Pure function that doesn't depend on reactive state
 */
export const getStyledSvgTransform = (svgImage: any) => {
  try {
    // SVG image coordinates are already resolved to absolute values during template loading
    // Do NOT call resolveCoordinate() again to avoid double coordinate resolution
    const absoluteX = svgImage.position.x
    const absoluteY = svgImage.position.y

    // Get target size from template - no hardcoded fallbacks
    const _targetWidth = svgImage.width
    const _targetHeight = svgImage.height

    // Get style data for rotation and scale directly from svgImage - no hardcoded fallbacks
    const rotation = svgImage.rotation
    const userScale = svgImage.scale


    // Build transform string only with defined properties
    const transforms = []

    // Always translate to position if coordinates exist
    if (absoluteX !== undefined && absoluteY !== undefined) {
      transforms.push(`translate(${absoluteX}, ${absoluteY})`)
    }

    // Add scale if defined
    if (userScale !== undefined) {
      transforms.push(`scale(${userScale})`)
    }

    // Add rotation if defined
    if (rotation !== undefined) {
      transforms.push(`rotate(${rotation})`)
    }

    // Return combined transform or empty string if no transforms
    return transforms.length > 0 ? transforms.join(' ') : ''
  } catch (error) {
    logger.warn('Failed to calculate SVG transform:', error)
    // Return empty string on error - no hardcoded fallbacks
    return ''
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