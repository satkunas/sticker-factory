/**
 * SVG Centering Utilities
 *
 * Pure TypeScript functions for SVG centering calculations.
 * No Vue dependencies - can be used in any context.
 */

import { isValidNumber } from './svg'
import type { Point, ViewBox, Dimensions } from '../types/svg-types'
import { VIEWPORT_CONFIG } from './ui-constants'

// Type definitions

export interface CenteringTransform {
  translateX: number
  translateY: number
  transformOrigin: string
  transformString: string
}

export interface GridBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Calculate transform to center template content within a content area
 *
 * @param templateViewBox - Template's original viewBox
 * @param contentDimensions - Target content area dimensions
 * @returns Transform values to center template in content area
 */
export function calculateCenteringTransform(
  templateViewBox: ViewBox,
  contentDimensions: Dimensions
): CenteringTransform {
  // Validate inputs
  if (!validateCenteringInputs(templateViewBox, contentDimensions)) {
    return {
      translateX: 0,
      translateY: 0,
      transformOrigin: 'center',
      transformString: ''
    }
  }

  // Calculate template center point
  const templateCenterX = templateViewBox.x + templateViewBox.width / 2
  const templateCenterY = templateViewBox.y + templateViewBox.height / 2

  // Calculate content center point
  const contentCenterX = contentDimensions.width / 2
  const contentCenterY = contentDimensions.height / 2

  // Calculate translation needed to move template center to content center
  const translateX = contentCenterX - templateCenterX
  const translateY = contentCenterY - templateCenterY

  return {
    translateX,
    translateY,
    transformOrigin: `${contentCenterX} ${contentCenterY}`,
    transformString: `translate(${translateX}, ${translateY})`
  }
}

/**
 * Calculate bounds for background grid based on content dimensions
 *
 * @param contentDimensions - Content area dimensions
 * @param gridScale - Scale factor for grid size (e.g., 2.0 for 2x content size)
 * @returns Grid bounds positioned around content center
 */
export function calculateGridBounds(
  contentDimensions: Dimensions,
  gridScale = VIEWPORT_CONFIG.GRID_SCALE
): GridBounds {
  // Validate inputs
  if (!isValidNumber(contentDimensions.width) ||
      !isValidNumber(contentDimensions.height) ||
      !isValidNumber(gridScale) || gridScale <= 0) {
    return {
      x: -VIEWPORT_CONFIG.MIN_CONTENT_WIDTH,
      y: -VIEWPORT_CONFIG.MIN_CONTENT_HEIGHT,
      width: VIEWPORT_CONFIG.MIN_CONTENT_WIDTH * 2,
      height: VIEWPORT_CONFIG.MIN_CONTENT_HEIGHT * 2
    }
  }

  const gridWidth = contentDimensions.width * gridScale
  const gridHeight = contentDimensions.height * gridScale

  // Center grid around content center (0,0 in content coordinates)
  const gridX = -gridWidth / 2
  const gridY = -gridHeight / 2

  return {
    x: gridX,
    y: gridY,
    width: gridWidth,
    height: gridHeight
  }
}

/**
 * Calculate content area bounds based on template dimensions
 *
 * @param templateViewBox - Template's viewBox
 * @param paddingScale - Scale factor for padding around template (e.g., 1.5 for 50% padding)
 * @returns Content dimensions that provide appropriate space around template
 */
export function calculateContentBounds(
  templateViewBox: ViewBox,
  paddingScale = VIEWPORT_CONFIG.PADDING_SCALE
): Dimensions {
  // Validate inputs
  if (!validateViewBox(templateViewBox) || !isValidNumber(paddingScale) || paddingScale < 1) {
    return {
      width: VIEWPORT_CONFIG.MIN_CONTENT_WIDTH,
      height: VIEWPORT_CONFIG.MIN_CONTENT_HEIGHT
    }
  }

  // Calculate content size with padding
  const contentWidth = Math.max(templateViewBox.width * paddingScale, VIEWPORT_CONFIG.MIN_CONTENT_WIDTH)
  const contentHeight = Math.max(templateViewBox.height * paddingScale, VIEWPORT_CONFIG.MIN_CONTENT_HEIGHT)

  return {
    width: contentWidth,
    height: contentHeight
  }
}

/**
 * Maintain image center during zoom operations
 *
 * @param currentCenter - Current center point of the image
 * @param zoomLevel - New zoom level (1.0 = 100%)
 * @param zoomOrigin - Point around which zoom is applied
 * @returns Transform to maintain center during zoom
 */
export function maintainCenterDuringZoom(
  currentCenter: Point,
  zoomLevel: number,
  zoomOrigin: Point
): CenteringTransform {
  // Validate inputs
  if (!isValidNumber(currentCenter.x) || !isValidNumber(currentCenter.y) ||
      !isValidNumber(zoomLevel) || zoomLevel <= 0 ||
      !isValidNumber(zoomOrigin.x) || !isValidNumber(zoomOrigin.y)) {
    return {
      translateX: 0,
      translateY: 0,
      transformOrigin: 'center',
      transformString: ''
    }
  }

  // Calculate offset from zoom origin to current center
  const offsetX = currentCenter.x - zoomOrigin.x
  const offsetY = currentCenter.y - zoomOrigin.y

  // Calculate new center position after zoom
  const newCenterX = zoomOrigin.x + (offsetX * zoomLevel)
  const newCenterY = zoomOrigin.y + (offsetY * zoomLevel)

  // Calculate translation needed to maintain original center
  const translateX = currentCenter.x - newCenterX
  const translateY = currentCenter.y - newCenterY

  return {
    translateX,
    translateY,
    transformOrigin: `${currentCenter.x} ${currentCenter.y}`,
    transformString: `translate(${translateX}, ${translateY})`
  }
}

/**
 * Maintain image center during rotation operations
 *
 * @param currentCenter - Current center point of the image
 * @param rotationAngle - Rotation angle in degrees
 * @param rotationOrigin - Point around which rotation is applied
 * @returns Transform to maintain center during rotation
 */
export function maintainCenterDuringRotation(
  currentCenter: Point,
  rotationAngle: number,
  rotationOrigin: Point
): CenteringTransform {
  // Validate inputs
  if (!isValidNumber(currentCenter.x) || !isValidNumber(currentCenter.y) ||
      !isValidNumber(rotationAngle) ||
      !isValidNumber(rotationOrigin.x) || !isValidNumber(rotationOrigin.y)) {
    return {
      translateX: 0,
      translateY: 0,
      transformOrigin: `${currentCenter.x} ${currentCenter.y}`,
      transformString: `rotate(${rotationAngle} ${currentCenter.x} ${currentCenter.y})`
    }
  }

  // For rotation, the transform origin should be the current center
  // This ensures the image rotates around its center point
  const transformOrigin = `${currentCenter.x} ${currentCenter.y}`
  const transformString = `rotate(${rotationAngle} ${currentCenter.x} ${currentCenter.y})`

  return {
    translateX: 0,
    translateY: 0,
    transformOrigin,
    transformString
  }
}

/**
 * Combine multiple transforms into a single transform string
 *
 * @param transforms - Array of transform strings to combine
 * @returns Combined transform string
 */
export function combineTransforms(transforms: string[]): string {
  // Filter out empty transforms and join with spaces
  const validTransforms = transforms.filter(t => t && t.trim().length > 0)
  return validTransforms.join(' ')
}

/**
 * Validate centering inputs to prevent NaN errors
 *
 * @param templateViewBox - Template viewBox to validate
 * @param contentDimensions - Content dimensions to validate
 * @returns True if inputs are valid
 */
function validateCenteringInputs(
  templateViewBox: ViewBox,
  contentDimensions: Dimensions
): boolean {
  return validateViewBox(templateViewBox) && validateDimensions(contentDimensions)
}

/**
 * Validate ViewBox object
 *
 * @param viewBox - ViewBox to validate
 * @returns True if viewBox is valid
 */
function validateViewBox(viewBox: ViewBox): boolean {
  return viewBox &&
         isValidNumber(viewBox.x) &&
         isValidNumber(viewBox.y) &&
         isValidNumber(viewBox.width) && viewBox.width > 0 &&
         isValidNumber(viewBox.height) && viewBox.height > 0
}

/**
 * Validate Dimensions object
 *
 * @param dimensions - Dimensions to validate
 * @returns True if dimensions are valid
 */
function validateDimensions(dimensions: Dimensions): boolean {
  return dimensions &&
         isValidNumber(dimensions.width) && dimensions.width > 0 &&
         isValidNumber(dimensions.height) && dimensions.height > 0
}