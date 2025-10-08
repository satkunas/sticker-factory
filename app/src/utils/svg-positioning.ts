/**
 * SVG Positioning Utilities
 *
 * Pure TypeScript utilities for calculating SVG positioning, centering,
 * and coordinate transformations between template and SVG coordinate systems.
 *
 * @author Claude AI Assistant
 * @version 1.0.0
 */

import type { SvgMetadata } from './svg-content'
import type { Point, Dimensions } from '../types/svg-types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Size dimensions (alias for Dimensions for backwards compatibility) */
export type Size = Dimensions

/** Template positioning data */
export interface TemplatePosition {
  /** Position coordinates (can be percentage strings or numbers) */
  position: { x: string | number; y: string | number }
  /** Target dimensions */
  width: number
  height: number
}

/** Container bounds for positioning */
export interface ContainerBounds {
  x: number
  y: number
  width: number
  height: number
}

// ============================================================================
// COORDINATE RESOLUTION
// ============================================================================

/**
 * Resolve percentage or absolute coordinates to absolute pixels
 *
 * @param value - Coordinate value (percentage string or number)
 * @param containerSize - Container dimension for percentage calculation
 * @param offset - Optional offset for coordinate system
 * @returns Absolute coordinate value
 *
 * @example
 * const x = resolveCoordinate('50%', 200, 0)  // Returns: 100
 * const y = resolveCoordinate(50, 200, 10)    // Returns: 50
 */
export function resolveCoordinate(
  value: string | number,
  containerSize: number,
  offset = 0
): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value) / 100
    if (!isFinite(percentage)) return offset
    return offset + (containerSize * percentage)
  }

  const numValue = Number(value)
  return isFinite(numValue) ? numValue : offset
}

/**
 * Resolve template position to absolute coordinates
 *
 * @param position - Template position with percentage/absolute values
 * @param containerBounds - Container dimensions and offset
 * @returns Absolute point coordinates
 *
 * @example
 * const point = resolveTemplatePosition(
 *   { position: { x: '50%', y: '25%' }, width: 32, height: 32 },
 *   { x: 0, y: 0, width: 200, height: 100 }
 * )
 * // Returns: { x: 100, y: 25 }
 */
export function resolveTemplatePosition(
  position: TemplatePosition,
  containerBounds: ContainerBounds
): Point {
  return {
    x: resolveCoordinate(position.position.x, containerBounds.width, containerBounds.x),
    y: resolveCoordinate(position.position.y, containerBounds.height, containerBounds.y)
  }
}

// ============================================================================
// SVG CENTERING CALCULATIONS
// ============================================================================

/**
 * Calculate centered position for SVG based on its metadata and target position
 * Accounts for SVG viewBox and ensures the SVG visual center aligns with target
 *
 * @param metadata - SVG metadata from parseSvgContent
 * @param targetPosition - Where the SVG center should be positioned
 * @param targetSize - Target size for the SVG
 * @returns Calculated position for SVG element
 *
 * @example
 * const centeredPos = calculateSvgCenterPosition(
 *   metadata,
 *   { x: 100, y: 50 },
 *   { width: 32, height: 32 }
 * )
 */
export function calculateSvgCenterPosition(
  metadata: SvgMetadata,
  targetPosition: Point,
  targetSize: Size
): Point {
  if (!metadata) {
    // Fallback: position top-left at target minus half size
    return {
      x: targetPosition.x - targetSize.width / 2,
      y: targetPosition.y - targetSize.height / 2
    }
  }

  const { viewBox } = metadata

  // Calculate the visual center of the SVG content
  const svgVisualCenterX = viewBox.x + viewBox.width / 2
  const svgVisualCenterY = viewBox.y + viewBox.height / 2

  // Calculate scale factor for the target size
  const scaleX = targetSize.width / viewBox.width
  const scaleY = targetSize.height / viewBox.height
  const uniformScale = Math.min(scaleX, scaleY) // Maintain aspect ratio

  // Calculate the position where the SVG element should be placed
  // so its visual center aligns with the target position
  const elementX = targetPosition.x - (svgVisualCenterX * uniformScale)
  const elementY = targetPosition.y - (svgVisualCenterY * uniformScale)

  return {
    x: elementX,
    y: elementY
  }
}

/**
 * Calculate optimal scale for SVG to fit within target size
 *
 * @param metadata - SVG metadata
 * @param targetSize - Target size constraints
 * @param maintainAspectRatio - Whether to maintain aspect ratio
 * @returns Scale factor
 *
 * @example
 * const scale = calculateSvgScale(metadata, { width: 64, height: 64 }, true)
 * // Returns: 0.8 (if SVG is 80x80 and target is 64x64)
 */
export function calculateSvgScale(
  metadata: SvgMetadata,
  targetSize: Size,
  maintainAspectRatio = true
): number {
  if (!metadata || metadata.viewBox.width === 0 || metadata.viewBox.height === 0) {
    return 1
  }

  // Handle edge cases where target size is 0 or negative
  if (targetSize.width <= 0 || targetSize.height <= 0) {
    return 0.1 // Minimum scale to keep SVG visible
  }

  const scaleX = targetSize.width / metadata.viewBox.width
  const scaleY = targetSize.height / metadata.viewBox.height

  if (maintainAspectRatio) {
    // Use the smaller scale to ensure the SVG fits within the target size
    const scale = Math.min(scaleX, scaleY)
    // Ensure scale is reasonable (not too small or too large)
    return Math.max(0.01, Math.min(10, scale))
  }

  // If not maintaining aspect ratio, use average scale with bounds
  const averageScale = (scaleX + scaleY) / 2
  return Math.max(0.01, Math.min(10, averageScale))
}

// ============================================================================
// COORDINATE SYSTEM TRANSFORMATIONS
// ============================================================================

/**
 * Transform template coordinates to SVG coordinate space
 * Handles the conversion between template positioning and SVG internal coordinates
 *
 * @param templateCoords - Coordinates in template space
 * @param metadata - SVG metadata for coordinate system info
 * @param scale - Current scale factor applied to SVG
 * @returns Coordinates in SVG space
 *
 * @example
 * const svgCoords = transformTemplateToSvgCoords(
 *   { x: 100, y: 50 },
 *   metadata,
 *   0.8
 * )
 */
export function transformTemplateToSvgCoords(
  templateCoords: Point,
  metadata: SvgMetadata,
  scale = 1
): Point {
  if (!metadata) return templateCoords

  const { viewBox } = metadata

  // Transform template coordinates to SVG viewBox coordinates
  const svgX = (templateCoords.x / scale) + viewBox.x
  const svgY = (templateCoords.y / scale) + viewBox.y

  return { x: svgX, y: svgY }
}

/**
 * Transform SVG coordinates to template coordinate space
 * Reverse transformation from SVG internal coordinates to template positioning
 *
 * @param svgCoords - Coordinates in SVG space
 * @param metadata - SVG metadata for coordinate system info
 * @param scale - Current scale factor applied to SVG
 * @returns Coordinates in template space
 *
 * @example
 * const templateCoords = transformSvgToTemplateCoords(
 *   { x: 12, y: 12 },
 *   metadata,
 *   0.8
 * )
 */
export function transformSvgToTemplateCoords(
  svgCoords: Point,
  metadata: SvgMetadata,
  scale = 1
): Point {
  if (!metadata) return svgCoords

  const { viewBox } = metadata

  // Transform SVG viewBox coordinates to template coordinates
  const templateX = (svgCoords.x - viewBox.x) * scale
  const templateY = (svgCoords.y - viewBox.y) * scale

  return { x: templateX, y: templateY }
}

// ============================================================================
// ADVANCED POSITIONING CALCULATIONS
// ============================================================================

/**
 * Calculate bounding box for positioned SVG
 *
 * @param position - SVG position
 * @param size - SVG size
 * @param metadata - SVG metadata
 * @returns Bounding box coordinates
 */
export function calculateSvgBoundingBox(
  position: Point,
  size: Size,
  metadata: SvgMetadata
): { x: number; y: number; width: number; height: number } {
  if (!metadata) {
    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    }
  }

  const scale = calculateSvgScale(metadata, size)

  return {
    x: position.x,
    y: position.y,
    width: metadata.viewBox.width * scale,
    height: metadata.viewBox.height * scale
  }
}

/**
 * Check if a point is inside an SVG element
 *
 * @param point - Point to test
 * @param svgPosition - SVG element position
 * @param svgSize - SVG element size
 * @param metadata - SVG metadata
 * @returns True if point is inside SVG bounds
 */
export function isPointInSvg(
  point: Point,
  svgPosition: Point,
  svgSize: Size,
  metadata: SvgMetadata
): boolean {
  const bounds = calculateSvgBoundingBox(svgPosition, svgSize, metadata)

  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

/**
 * Calculate optimal positioning for multiple SVG elements to avoid overlap
 *
 * @param svgElements - Array of SVG elements with positions and sizes
 * @param containerBounds - Container bounds
 * @param minSpacing - Minimum spacing between elements
 * @returns Adjusted positions for elements
 */
export function calculateNonOverlappingPositions(
  svgElements: Array<{
    id: string
    position: Point
    size: Size
    metadata: SvgMetadata
  }>,
  containerBounds: ContainerBounds,
  minSpacing = 5
): Map<string, Point> {
  const adjustedPositions = new Map<string, Point>()

  // Start with original positions
  svgElements.forEach(element => {
    adjustedPositions.set(element.id, { ...element.position })
  })

  // Simple collision detection and resolution
  for (let i = 0; i < svgElements.length; i++) {
    for (let j = i + 1; j < svgElements.length; j++) {
      const element1 = svgElements[i]
      const element2 = svgElements[j]

      const pos1 = adjustedPositions.get(element1.id)!
      const pos2 = adjustedPositions.get(element2.id)!

      const bounds1 = calculateSvgBoundingBox(pos1, element1.size, element1.metadata)
      const bounds2 = calculateSvgBoundingBox(pos2, element2.size, element2.metadata)

      // Check for overlap
      const overlap = !(
        bounds1.x + bounds1.width + minSpacing < bounds2.x ||
        bounds2.x + bounds2.width + minSpacing < bounds1.x ||
        bounds1.y + bounds1.height + minSpacing < bounds2.y ||
        bounds2.y + bounds2.height + minSpacing < bounds1.y
      )

      if (overlap) {
        // Simple resolution: move element2 to the right
        const newX = bounds1.x + bounds1.width + minSpacing
        if (newX + bounds2.width <= containerBounds.x + containerBounds.width) {
          adjustedPositions.set(element2.id, { x: newX, y: pos2.y })
        }
      }
    }
  }

  return adjustedPositions
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points
 *
 * @param point1 - First point
 * @param point2 - Second point
 * @returns Distance between points
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Clamp a point within bounds
 *
 * @param point - Point to clamp
 * @param bounds - Bounds to clamp within
 * @returns Clamped point
 */
export function clampPointToBounds(point: Point, bounds: ContainerBounds): Point {
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
  }
}

/**
 * Calculate the center point of a size
 *
 * @param size - Size dimensions
 * @returns Center point relative to origin
 */
export function calculateSizeCenter(size: Size): Point {
  return {
    x: size.width / 2,
    y: size.height / 2
  }
}

/**
 * Convert template position object to absolute coordinates
 *
 * @param templatePos - Template position configuration
 * @param containerBounds - Container for percentage resolution
 * @returns Absolute point and size
 */
export function resolveTemplatePositioning(
  templatePos: TemplatePosition,
  containerBounds: ContainerBounds
): { position: Point; size: Size } {
  const position = resolveTemplatePosition(templatePos, containerBounds)
  const size = { width: templatePos.width, height: templatePos.height }

  return { position, size }
}