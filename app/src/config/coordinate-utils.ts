/**
 * Coordinate processing utilities for percentage-based positioning
 */

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface PercentagePosition {
  x: number | string
  y: number | string
}

export interface ResolvedPosition {
  x: number
  y: number
}

/**
 * Check if a coordinate value is a percentage string
 */
export const isPercentage = (value: number | string): value is string => {
  return typeof value === 'string' && value.includes('%')
}

/**
 * Parse a percentage string and return the numeric value
 * Examples: "50%" -> 0.5, "-25%" -> -0.25, "150%" -> 1.5
 */
export const parsePercentage = (value: string): number => {
  const numericPart = parseFloat(value.replace('%', ''))
  return numericPart / 100
}

/**
 * Resolve a single coordinate value (x or y) from percentage to absolute pixels
 */
export const resolveCoordinate = (
  value: number | string,
  viewBoxDimension: number,
  viewBoxStart = 0
): number => {
  if (typeof value === 'number') {
    return value
  }

  if (isPercentage(value)) {
    const percentage = parsePercentage(value)
    return viewBoxStart + (viewBoxDimension * percentage)
  }

  // Fallback: try to parse as number
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Resolve a position object from percentage coordinates to absolute coordinates
 */
export const resolvePosition = (
  position: PercentagePosition,
  viewBox: ViewBox
): ResolvedPosition => {
  return {
    x: resolveCoordinate(position.x, viewBox.width, viewBox.x),
    y: resolveCoordinate(position.y, viewBox.height, viewBox.y)
  }
}

/**
 * Resolve line position (for line shapes with x1,y1,x2,y2)
 */
export const resolveLinePosition = (
  position: { x1: number | string; y1: number | string; x2: number | string; y2: number | string },
  viewBox: ViewBox
): { x1: number; y1: number; x2: number; y2: number } => {
  return {
    x1: resolveCoordinate(position.x1, viewBox.width, viewBox.x),
    y1: resolveCoordinate(position.y1, viewBox.height, viewBox.y),
    x2: resolveCoordinate(position.x2, viewBox.width, viewBox.x),
    y2: resolveCoordinate(position.y2, viewBox.height, viewBox.y)
  }
}

/**
 * Helper function to resolve any position type (regular or line)
 */
export const resolveAnyPosition = (
  position: PercentagePosition | { x1: number | string; y1: number | string; x2: number | string; y2: number | string },
  viewBox: ViewBox
): ResolvedPosition | { x1: number; y1: number; x2: number; y2: number } => {
  // Check if it's a line position (has x1, y1, x2, y2)
  if ('x1' in position && 'y1' in position && 'x2' in position && 'y2' in position) {
    return resolveLinePosition(position, viewBox)
  }

  // Regular position with x, y
  return resolvePosition(position as PercentagePosition, viewBox)
}

/**
 * Utility to create common percentage positions
 */
export const PercentagePositions = {
  // Corners
  topLeft: { x: '0%', y: '0%' },
  topRight: { x: '100%', y: '0%' },
  bottomLeft: { x: '0%', y: '100%' },
  bottomRight: { x: '100%', y: '100%' },

  // Centers
  center: { x: '50%', y: '50%' },
  topCenter: { x: '50%', y: '0%' },
  bottomCenter: { x: '50%', y: '100%' },
  leftCenter: { x: '0%', y: '50%' },
  rightCenter: { x: '100%', y: '50%' },

  // Quarters
  topLeftQuarter: { x: '25%', y: '25%' },
  topRightQuarter: { x: '75%', y: '25%' },
  bottomLeftQuarter: { x: '25%', y: '75%' },
  bottomRightQuarter: { x: '75%', y: '75%' },
} as const

/**
 * Utility to create positions at specific percentages
 */
export const createPercentagePosition = (xPercent: number, yPercent: number): PercentagePosition => {
  return {
    x: `${xPercent}%`,
    y: `${yPercent}%`
  }
}