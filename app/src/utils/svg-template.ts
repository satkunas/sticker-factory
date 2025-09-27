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
export const getStyledSvgContent = (
  svgImage: any,
  styleData: any,
  fallbackFill = '#22c55e',
  fallbackStroke = '#000000',
  fallbackStrokeWidth = 2
) => {
  // Use selected SVG content from styleData if available, otherwise fall back to template default
  const svgContent = styleData?.svgContent || svgImage.svgContent
  if (!svgContent) return ''

  try {
    let styledContent = svgContent

    // Sanitize colors first
    const fillColor = sanitizeColorValue(styleData?.color || svgImage.fill || fallbackFill)
    const strokeColor = sanitizeColorValue(styleData?.strokeColor || svgImage.stroke || fallbackStroke)
    const strokeWidth = styleData?.strokeWidth ?? svgImage.strokeWidth ?? fallbackStrokeWidth
    const strokeLinejoin = styleData?.strokeLinejoin || svgImage.strokeLinejoin || 'round'

    // Apply color injection using the new utilities - force fill to override fill="none" in SVG templates
    styledContent = injectSvgColors(
      styledContent,
      fillColor,
      strokeColor,
      { forceFill: true, forceStroke: strokeWidth > 0 }
    )

    // Apply stroke properties
    if (strokeWidth > 0) {
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
export const getStyledSvgTransform = (
  svgImage: any,
  styleData?: any,
  fallbackRotation = 0,
  fallbackScale = 1.0
) => {
  try {
    // SVG image coordinates are already resolved to absolute values during template loading
    // Do NOT call resolveCoordinate() again to avoid double coordinate resolution
    const absoluteX = svgImage.position.x
    const absoluteY = svgImage.position.y

    // Get target size from template
    const targetWidth = svgImage.width || 24
    const targetHeight = svgImage.height || 24

    // Get style data for rotation and scale
    const rotation = styleData?.rotation || fallbackRotation
    const userScale = styleData?.scale || fallbackScale


    // Calculate base scale to fit the target size
    // SVG images have viewBox="0 0 24 24", so their intrinsic size is 24x24
    const svgIntrinsicSize = 24
    const scaleX = targetWidth / svgIntrinsicSize
    const scaleY = targetHeight / svgIntrinsicSize
    const autoScale = Math.min(scaleX, scaleY)

    // Apply user scale multiplier to the auto scale
    const finalScale = autoScale * userScale

    // Ensure final scale is reasonable (not too big or too small)
    const clampedScale = Math.max(0.01, Math.min(100, finalScale))

    // Apply transforms with proper center-point rotation and scaling:
    // The correct approach for SVG center-point transforms is:
    // 1. Translate to center point
    // 2. Rotate and scale (both happen around origin after translate)
    // 3. Offset by half the base size to center the content

    const centerX = absoluteX
    const centerY = absoluteY

    // For proper centering, we need to offset by half the SVG's intrinsic size
    // The SVG content is in its native 24x24 coordinate space, so we offset by half of that
    // This offset happens AFTER scaling, so it needs to be in the SVG's native dimensions
    const svgCenterOffsetX = -svgIntrinsicSize / 2  // -12
    const svgCenterOffsetY = -svgIntrinsicSize / 2  // -12

    // Apply the transforms: translate to position, scale and rotate at origin,
    // then translate to center the SVG content properly
    return `translate(${centerX}, ${centerY}) scale(${clampedScale}) rotate(${rotation}) translate(${svgCenterOffsetX}, ${svgCenterOffsetY})`
  } catch (error) {
    logger.warn('Failed to calculate SVG transform:', error)
    // Simple fallback - use coordinates as absolute values
    const absoluteX = svgImage.position.x || 0
    const absoluteY = svgImage.position.y || 0
    return `translate(${absoluteX - 12}, ${absoluteY - 12})`
  }
}

/**
 * Mini SVG preview helper for scaled-down previews
 * Pure function that doesn't depend on reactive state
 */
export const getMiniStyledSvgContent = (
  svgImage: any,
  fallbackFill = '#22c55e',
  fallbackStroke = '#000000'
) => {
  if (!svgImage.svgContent) return ''

  try {
    let styledContent = svgImage.svgContent

    // Apply basic styling for mini preview
    const fillColor = sanitizeColorValue(svgImage.fill || fallbackFill)
    const strokeColor = sanitizeColorValue(svgImage.stroke || fallbackStroke)

    // Apply simple color injection for mini preview
    styledContent = injectSvgColors(
      styledContent,
      fillColor,
      strokeColor,
      { forceFill: true }
    )

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
  scale = 0.4
) => {
  try {
    // For mini preview, use a simple approach with coordinate resolution
    const containerBounds = {
      x: 0,
      y: 0,
      width: templateViewBox?.width || 200,
      height: templateViewBox?.height || 200
    }

    const resolvedX = resolveCoordinate(svgImage.position.x, containerBounds.width, 0)
    const resolvedY = resolveCoordinate(svgImage.position.y, containerBounds.height, 0)

    // Use a fixed scale for mini preview
    return `translate(${resolvedX}, ${resolvedY}) scale(${scale})`
  } catch (error) {
    // Fallback to original positioning
    return `translate(${svgImage.position.x}, ${svgImage.position.y}) scale(${scale})`
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
      x: templateViewBox?.x || 0,
      y: templateViewBox?.y || 0,
      width: templateViewBox?.width || 200,
      height: templateViewBox?.height || 200
    }

    const coordinate = textInput.position[axis]
    const containerSize = axis === 'x' ? containerBounds.width : containerBounds.height
    const offset = axis === 'x' ? containerBounds.x : containerBounds.y

    return resolveCoordinate(coordinate, containerSize, offset)
  } catch (error) {
    // Fallback to original coordinate if resolution fails
    return textInput.position[axis] || 0
  }
}