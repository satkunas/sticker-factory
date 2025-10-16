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
  logger.info('🎨 getStyledSvgContent CALLED with:', {
    hasSvgContent: !!svgImage.svgContent,
    strokeWidth: svgImage.strokeWidth,
    strokeLinejoin: svgImage.strokeLinejoin,
    fill: svgImage.fill,
    stroke: svgImage.stroke
  })

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

    // Normalize currentColor for proper inheritance
    styledContent = normalizeSvgCurrentColor(styledContent)

    // CRITICAL: Apply stroke properties to outer <svg> element BEFORE extraction
    // This ensures stroke-linejoin is on the <svg> tag that gets rendered
    if (strokeWidth !== undefined || strokeLinejoin) {
      logger.info('Applying stroke properties to SVG:', { strokeWidth, strokeLinejoin })
      logger.info('Before stroke application:', styledContent.substring(0, 200))

      styledContent = applySvgStrokeProperties(
        styledContent,
        strokeWidth,
        strokeLinejoin
      )

      logger.info('After stroke application:', styledContent.substring(0, 200))
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