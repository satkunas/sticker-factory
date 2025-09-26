/**
 * SVG Viewport Constraints
 *
 * Simplified constraint calculations for SVG viewBox-based pan/zoom system.
 * Much cleaner than CSS transform coordinate calculations.
 */

import type { SimpleTemplate } from '../types/template-types'

export interface SvgViewBoxConstraints {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface SvgViewBoxBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Calculate viewBox constraints for SVG-based pan/zoom
 *
 * Much simpler than CSS transform constraints - everything in SVG coordinate space
 */
export function calculateSvgViewBoxConstraints(
  template: SimpleTemplate | null,
  viewBoxWidth: number,
  viewBoxHeight: number
): SvgViewBoxConstraints {
  if (!template) {
    // Default constraints when no template
    return {
      minX: -400,
      maxX: 400 - viewBoxWidth,
      minY: -300,
      maxY: 300 - viewBoxHeight
    }
  }

  // Background grid is 2x template size, centered at origin
  const templateWidth = template.viewBox.width
  const templateHeight = template.viewBox.height
  const gridWidth = templateWidth * 2
  const gridHeight = templateHeight * 2

  // Grid bounds (background with red border)
  const gridMinX = -gridWidth / 2
  const gridMinY = -gridHeight / 2
  const gridMaxX = gridWidth / 2
  const gridMaxY = gridHeight / 2

  // ViewBox constraints - can pan so grid edges are at viewport edges
  // No complex CSS coordinate conversions needed!
  return {
    minX: gridMinX,
    maxX: gridMaxX - viewBoxWidth,
    minY: gridMinY,
    maxY: gridMaxY - viewBoxHeight
  }
}

/**
 * Get background grid bounds for SVG rendering
 */
export function getBackgroundGridBounds(template: SimpleTemplate | null): SvgViewBoxBounds {
  if (!template) {
    return {
      x: -400,
      y: -300,
      width: 800,
      height: 600
    }
  }

  const templateWidth = template.viewBox.width
  const templateHeight = template.viewBox.height
  const gridWidth = templateWidth * 2
  const gridHeight = templateHeight * 2

  return {
    x: -gridWidth / 2,
    y: -gridHeight / 2,
    width: gridWidth,
    height: gridHeight
  }
}

/**
 * Check if a viewBox position is within constraints
 */
export function isViewBoxWithinConstraints(
  viewBoxX: number,
  viewBoxY: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
  template: SimpleTemplate | null
): boolean {
  const constraints = calculateSvgViewBoxConstraints(template, viewBoxWidth, viewBoxHeight)

  return (
    viewBoxX >= constraints.minX &&
    viewBoxX <= constraints.maxX &&
    viewBoxY >= constraints.minY &&
    viewBoxY <= constraints.maxY
  )
}

/**
 * Constrain a viewBox position to valid bounds
 */
export function constrainViewBoxPosition(
  viewBoxX: number,
  viewBoxY: number,
  viewBoxWidth: number,
  viewBoxHeight: number,
  template: SimpleTemplate | null
): { x: number; y: number } {
  const constraints = calculateSvgViewBoxConstraints(template, viewBoxWidth, viewBoxHeight)

  return {
    x: Math.max(constraints.minX, Math.min(constraints.maxX, viewBoxX)),
    y: Math.max(constraints.minY, Math.min(constraints.maxY, viewBoxY))
  }
}

/**
 * Calculate optimal viewBox for fitting template
 */
export function calculateOptimalViewBoxForTemplate(
  template: SimpleTemplate,
  containerWidth: number,
  containerHeight: number
): SvgViewBoxBounds {
  // Calculate scale to fit template in container
  const scaleX = containerWidth / template.viewBox.width
  const scaleY = containerHeight / template.viewBox.height
  const optimalScale = Math.min(scaleX, scaleY)

  // ViewBox dimensions at optimal scale
  const viewBoxWidth = containerWidth / optimalScale
  const viewBoxHeight = containerHeight / optimalScale

  // Center on template
  const centerX = template.viewBox.x + template.viewBox.width / 2
  const centerY = template.viewBox.y + template.viewBox.height / 2

  return {
    x: centerX - viewBoxWidth / 2,
    y: centerY - viewBoxHeight / 2,
    width: viewBoxWidth,
    height: viewBoxHeight
  }
}