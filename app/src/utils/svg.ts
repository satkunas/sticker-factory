/**
 * Pure TypeScript SVG Utilities Library
 *
 * This module contains pure functions for SVG transformations, calculations,
 * and event processing. No Vue reactivity or framework dependencies.
 *
 * @author Claude AI Assistant
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS
// ============================================================================

// Import and re-export common SVG types from central location
import type { Point, ViewBox } from '../types/svg-types'
export type { Point, ViewBox }

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Size dimensions with width and height */
export interface Size {
  width: number
  height: number
}

/** Complete transform state including translate, scale, and rotation */
export interface Transform {
  translate: Point
  scale: number
  rotate: number
}

/** Bounding box definition */
export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Coordinates that can be percentage strings or numbers */
export interface PercentageCoords {
  x: number | string
  y: number | string
}

/** Position with percentage support (alias for clarity) */
export interface PercentagePosition {
  x: number | string
  y: number | string
}

/** Position resolved to absolute coordinates */
export interface ResolvedPosition {
  x: number
  y: number
}

/** Processed wheel event data */
export interface WheelData {
  deltaX: number
  deltaY: number
  isTrackpad: boolean
  scaleFactor: number
}

/** Processed touch event data */
export interface TouchData {
  point: Point
  distance?: number
  scale?: number
}

/** Processed gesture event data */
export interface GestureData {
  scale: number
  rotation: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default zoom and pan constraints */
export const SVG_CONSTANTS = {
  /** Minimum zoom level */
  MIN_ZOOM: 0.1,
  /** Maximum zoom level */
  MAX_ZOOM: 5.0,
  /** Default zoom speed for wheel events */
  ZOOM_SPEED: 0.1,
  /** Trackpad zoom sensitivity */
  TRACKPAD_SENSITIVITY: 0.01,
  /** Mouse wheel zoom steps */
  WHEEL_ZOOM_STEP: 1.1,
  /** Pan constraint buffer in pixels */
  PAN_BUFFER: 50,
  /** Default SVG viewBox size */
  DEFAULT_VIEWBOX_SIZE: 24,
  /** Minimum distance for pinch detection */
  MIN_PINCH_DISTANCE: 10
} as const

// ============================================================================
// MATHEMATICAL CALCULATIONS
// ============================================================================

/**
 * Calculate new zoom level based on current zoom and delta
 *
 * @param currentZoom - Current zoom level
 * @param delta - Zoom delta (positive = zoom in, negative = zoom out)
 * @param isTrackpad - Whether the input is from a trackpad
 * @returns New zoom level constrained within min/max bounds
 *
 * @example
 * const newZoom = calculateZoomLevel(1.0, 0.1, false)
 * // Returns: 1.1 (zoomed in by 10%)
 */
export function calculateZoomLevel(
  currentZoom: number,
  delta: number,
  isTrackpad = false
): number {
  if (!isFinite(currentZoom) || !isFinite(delta)) {
    return SVG_CONSTANTS.MIN_ZOOM
  }

  let newZoom: number

  if (isTrackpad) {
    // Trackpad: use additive scaling
    const scaleFactor = 1 + (delta * SVG_CONSTANTS.TRACKPAD_SENSITIVITY)
    newZoom = currentZoom * scaleFactor
  } else {
    // Mouse wheel: use step-based scaling
    const step = delta > 0 ? SVG_CONSTANTS.WHEEL_ZOOM_STEP : 1 / SVG_CONSTANTS.WHEEL_ZOOM_STEP
    newZoom = currentZoom * step
  }

  return constrainValue(newZoom, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
}

/**
 * Calculate pan offset between two points
 *
 * @param startPos - Starting position
 * @param currentPos - Current position
 * @returns Offset between points
 *
 * @example
 * const offset = calculatePanOffset({ x: 0, y: 0 }, { x: 10, y: 5 })
 * // Returns: { x: 10, y: 5 }
 */
export function calculatePanOffset(startPos: Point, currentPos: Point): Point {
  return {
    x: currentPos.x - startPos.x,
    y: currentPos.y - startPos.y
  }
}

/**
 * Calculate optimal scale to fit content within container
 *
 * @param contentSize - Size of content to fit
 * @param containerSize - Size of container
 * @param padding - Padding factor (0.8 = 20% padding)
 * @returns Optimal scale factor
 *
 * @example
 * const scale = calculateOptimalScale({ width: 200, height: 100 }, { width: 400, height: 300 }, 0.9)
 * // Returns: 1.8 (90% of container with 10% padding)
 */
export function calculateOptimalScale(
  contentSize: Size,
  containerSize: Size,
  padding = 0.8
): number {
  if (contentSize.width <= 0 || contentSize.height <= 0 ||
      containerSize.width <= 0 || containerSize.height <= 0) {
    return 1
  }

  const scaleX = (containerSize.width * padding) / contentSize.width
  const scaleY = (containerSize.height * padding) / contentSize.height

  return Math.min(scaleX, scaleY)
}

/**
 * Constrain a value within specified bounds
 *
 * @param value - Value to constrain
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Constrained value
 *
 * @example
 * const constrained = constrainValue(15, 0, 10)
 * // Returns: 10 (clamped to maximum)
 */
export function constrainValue(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}

// ============================================================================
// SVG TRANSFORM STRING GENERATION
// ============================================================================

/**
 * Create SVG transform string from components
 *
 * @param translate - Translation offset
 * @param scale - Scale factor
 * @param rotate - Rotation angle in degrees (optional)
 * @returns SVG transform attribute string
 *
 * @example
 * const transform = createTransformString({ x: 10, y: 20 }, 1.5, 45)
 * // Returns: "translate(10, 20) rotate(45) scale(1.5)"
 */
export function createTransformString(
  translate: Point,
  scale = 1,
  rotate?: number
): string {
  const transforms: string[] = []

  if (translate.x !== 0 || translate.y !== 0) {
    transforms.push(`translate(${translate.x}, ${translate.y})`)
  }

  if (rotate !== undefined && rotate !== 0) {
    transforms.push(`rotate(${rotate})`)
  }

  if (scale !== 1) {
    transforms.push(`scale(${scale})`)
  }

  return transforms.join(' ')
}

/**
 * Create SVG viewBox attribute string
 *
 * @param x - ViewBox x origin
 * @param y - ViewBox y origin
 * @param width - ViewBox width
 * @param height - ViewBox height
 * @returns SVG viewBox attribute string
 *
 * @example
 * const viewBox = createViewBoxString(0, 0, 100, 50)
 * // Returns: "0 0 100 50"
 */
export function createViewBoxString(x: number, y: number, width: number, height: number): string {
  return `${x} ${y} ${width} ${height}`
}

/**
 * Create CSS style object for SVG elements
 *
 * @param fill - Fill color
 * @param stroke - Stroke color
 * @param strokeWidth - Stroke width
 * @param strokeLinejoin - Stroke line join style
 * @returns CSS properties object
 *
 * @example
 * const style = createStyleObject('#ff0000', '#000000', 2, 'round')
 * // Returns: { fill: '#ff0000', stroke: '#000000', strokeWidth: 2, strokeLinejoin: 'round' }
 */
export function createStyleObject(
  fill: string,
  stroke: string,
  strokeWidth: number,
  strokeLinejoin = 'round'
): Record<string, string | number> {
  return {
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin
  }
}

// ============================================================================
// COORDINATE CONVERSION AND RESOLUTION
// ============================================================================

/**
 * Check if a coordinate value is a percentage string
 *
 * @param value - Coordinate value to check
 * @returns True if value is a percentage string
 *
 * @example
 * const isPercent = isPercentage('50%')
 * // Returns: true
 */
export function isPercentage(value: number | string): value is string {
  return typeof value === 'string' && value.includes('%')
}

/**
 * Parse a percentage string and return the numeric value
 *
 * @param value - Percentage string
 * @returns Numeric percentage value (0.5 for "50%")
 *
 * @example
 * const numeric = parsePercentage('50%')
 * // Returns: 0.5
 */
export function parsePercentage(value: string): number {
  const numericPart = parseFloat(value.replace('%', ''))
  return isNaN(numericPart) ? 0 : numericPart / 100
}

/**
 * Resolve a single coordinate value (x or y) from percentage to absolute pixels
 *
 * @param value - Coordinate value (number or percentage string)
 * @param viewBoxDimension - ViewBox dimension (width or height)
 * @param viewBoxStart - ViewBox start offset (x or y)
 * @returns Resolved absolute coordinate
 *
 * @example
 * const x = resolveCoordinate('50%', 100, 0)
 * // Returns: 50
 */
export function resolveCoordinate(
  value: number | string,
  viewBoxDimension: number,
  viewBoxStart = 0
): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
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
 *
 * @param position - Position with percentage or absolute coordinates
 * @param viewBox - ViewBox for coordinate resolution
 * @returns Resolved position with absolute coordinates
 *
 * @example
 * const resolved = resolvePosition({ x: '50%', y: '25%' }, { x: 0, y: 0, width: 100, height: 50 })
 * // Returns: { x: 50, y: 12.5 }
 */
export function resolvePosition(
  position: PercentagePosition,
  viewBox: ViewBox
): ResolvedPosition {
  return {
    x: resolveCoordinate(position.x, viewBox.width, viewBox.x),
    y: resolveCoordinate(position.y, viewBox.height, viewBox.y)
  }
}

/**
 * Resolve line position (for line shapes with x1,y1,x2,y2)
 *
 * @param position - Line position with start and end coordinates
 * @param viewBox - ViewBox for coordinate resolution
 * @returns Resolved line position with absolute coordinates
 *
 * @example
 * const resolved = resolveLinePosition({ x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, viewBox)
 * // Returns: { x1: 0, y1: 0, x2: 100, y2: 50 }
 */
export function resolveLinePosition(
  position: { x1: number | string; y1: number | string; x2: number | string; y2: number | string },
  viewBox: ViewBox
): { x1: number; y1: number; x2: number; y2: number } {
  return {
    x1: resolveCoordinate(position.x1, viewBox.width, viewBox.x),
    y1: resolveCoordinate(position.y1, viewBox.height, viewBox.y),
    x2: resolveCoordinate(position.x2, viewBox.width, viewBox.x),
    y2: resolveCoordinate(position.y2, viewBox.height, viewBox.y)
  }
}

/**
 * Helper function to resolve any position type (regular or line)
 *
 * @param position - Position object (regular or line type)
 * @param viewBox - ViewBox for coordinate resolution
 * @returns Resolved position (regular or line type)
 *
 * @example
 * const resolved = resolveAnyPosition({ x: '50%', y: '50%' }, viewBox)
 * // Returns: { x: 50, y: 25 }
 */
export function resolveAnyPosition(
  position: PercentagePosition | { x1: number | string; y1: number | string; x2: number | string; y2: number | string },
  viewBox: ViewBox
): ResolvedPosition | { x1: number; y1: number; x2: number; y2: number } {
  // Check if it's a line position (has x1, y1, x2, y2)
  if ('x1' in position && 'y1' in position && 'x2' in position && 'y2' in position) {
    return resolveLinePosition(position, viewBox)
  }

  // Regular position with x, y
  return resolvePosition(position as PercentagePosition, viewBox)
}

/**
 * Resolve percentage coordinates to absolute coordinates
 * Enhanced version that supports viewBox offset and better error handling
 *
 * @param coords - Coordinates with percentage or absolute values
 * @param viewBox - ViewBox for percentage calculation
 * @returns Absolute coordinates
 *
 * @example
 * const absolute = resolvePercentageCoords({ x: '50%', y: 25 }, { x: 0, y: 0, width: 100, height: 50 })
 * // Returns: { x: 50, y: 25 }
 */
export function resolvePercentageCoords(coords: PercentageCoords, viewBox: ViewBox): Point {
  return {
    x: resolveCoordinate(coords.x, viewBox.width, viewBox.x),
    y: resolveCoordinate(coords.y, viewBox.height, viewBox.y)
  }
}

/**
 * Convert screen coordinates to SVG coordinate space
 * Handles translation, scaling, rotation, and viewBox offset
 *
 * @param screenPoint - Point in screen coordinates
 * @param transform - Current SVG transform state (translate, scale, rotate)
 * @param viewBox - SVG viewBox for coordinate system offset
 * @returns Point in SVG coordinate space
 *
 * @example
 * const svgPoint = convertScreenToSvg(
 *   { x: 100, y: 50 },
 *   { translate: { x: 10, y: 5 }, scale: 2, rotate: 45 },
 *   { x: 0, y: 0, width: 200, height: 100 }
 * )
 */
export function convertScreenToSvg(
  screenPoint: Point,
  transform: Transform,
  viewBox: ViewBox
): Point {
  // Apply translation (reverse)
  let point = {
    x: screenPoint.x - transform.translate.x,
    y: screenPoint.y - transform.translate.y
  }

  // Apply scaling (reverse)
  point = {
    x: point.x / transform.scale,
    y: point.y / transform.scale
  }

  // Apply rotation (reverse) if present
  if (transform.rotate !== 0) {
    const angleRad = (-transform.rotate * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    const rotatedX = point.x * cos - point.y * sin
    const rotatedY = point.x * sin + point.y * cos

    point = { x: rotatedX, y: rotatedY }
  }

  // Apply viewBox offset
  point = {
    x: point.x + viewBox.x,
    y: point.y + viewBox.y
  }

  return point
}

/**
 * Convert SVG coordinates to screen coordinate space
 * Applies translation, scaling, rotation, and viewBox offset
 *
 * @param svgPoint - Point in SVG coordinates
 * @param transform - Current SVG transform state (translate, scale, rotate)
 * @param viewBox - SVG viewBox for coordinate system offset
 * @returns Point in screen coordinate space
 *
 * @example
 * const screenPoint = convertSvgToScreen(
 *   { x: 50, y: 25 },
 *   { translate: { x: 10, y: 5 }, scale: 2, rotate: 45 },
 *   { x: 0, y: 0, width: 200, height: 100 }
 * )
 */
export function convertSvgToScreen(
  svgPoint: Point,
  transform: Transform,
  viewBox: ViewBox
): Point {
  // Apply viewBox offset (reverse)
  let point = {
    x: svgPoint.x - viewBox.x,
    y: svgPoint.y - viewBox.y
  }

  // Apply rotation if present
  if (transform.rotate !== 0) {
    const angleRad = (transform.rotate * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    const rotatedX = point.x * cos - point.y * sin
    const rotatedY = point.x * sin + point.y * cos

    point = { x: rotatedX, y: rotatedY }
  }

  // Apply scaling
  point = {
    x: point.x * transform.scale,
    y: point.y * transform.scale
  }

  // Apply translation
  point = {
    x: point.x + transform.translate.x,
    y: point.y + transform.translate.y
  }

  return point
}

/**
 * Calculate center point for given dimensions
 *
 * @param width - Width dimension
 * @param height - Height dimension
 * @returns Center point
 *
 * @example
 * const center = calculateCenterPoint(100, 50)
 * // Returns: { x: 50, y: 25 }
 */
export function calculateCenterPoint(width: number, height: number): Point {
  return {
    x: width / 2,
    y: height / 2
  }
}

// ============================================================================
// EVENT DATA PROCESSING
// ============================================================================

/**
 * Extract and process wheel event data
 *
 * @param event - Wheel event
 * @returns Processed wheel data
 *
 * @example
 * const wheelData = extractWheelData(wheelEvent)
 * // Returns: { deltaX: 0, deltaY: -100, isTrackpad: false, scaleFactor: 1.1 }
 */
export function extractWheelData(event: WheelEvent): WheelData {
  const deltaX = event.deltaX || 0
  const deltaY = event.deltaY || 0

  // Detect trackpad by checking for ctrl key (pinch gesture) or fine-grained deltas
  const isTrackpad = event.ctrlKey || (Math.abs(deltaY) < 50 && deltaY % 1 !== 0)

  let scaleFactor = 1
  if (isTrackpad) {
    scaleFactor = 1 + (deltaY * -SVG_CONSTANTS.TRACKPAD_SENSITIVITY)
    scaleFactor = Math.max(0.5, Math.min(2.0, scaleFactor))
  } else {
    scaleFactor = deltaY > 0 ? 1 / SVG_CONSTANTS.WHEEL_ZOOM_STEP : SVG_CONSTANTS.WHEEL_ZOOM_STEP
  }

  return {
    deltaX,
    deltaY,
    isTrackpad,
    scaleFactor
  }
}

/**
 * Extract touch data from touch events
 *
 * @param touches - TouchList from touch event
 * @returns Processed touch data
 *
 * @example
 * const touchData = extractTouchData(event.touches)
 * // Returns: { point: { x: 100, y: 50 }, distance: 75, scale: 1.2 }
 */
export function extractTouchData(touches: TouchList): TouchData {
  if (touches.length === 0) {
    return { point: { x: 0, y: 0 } }
  }

  const firstTouch = touches[0]
  const point = { x: firstTouch.clientX, y: firstTouch.clientY }

  if (touches.length >= 2) {
    const secondTouch = touches[1]
    const distance = calculateDistance(
      { x: firstTouch.clientX, y: firstTouch.clientY },
      { x: secondTouch.clientX, y: secondTouch.clientY }
    )

    return { point, distance }
  }

  return { point }
}

/**
 * Extract gesture data from gesture events (Safari/WebKit)
 *
 * @param event - Gesture event
 * @returns Processed gesture data
 *
 * @example
 * const gestureData = extractGestureData(gestureEvent)
 * // Returns: { scale: 1.5, rotation: 15 }
 */
export function extractGestureData(event: Event & { scale?: number; rotation?: number }): GestureData {
  return {
    scale: event.scale || 1,
    rotation: event.rotation || 0
  }
}

/**
 * Normalize event coordinates from various event types
 *
 * @param event - Mouse or touch event
 * @returns Normalized coordinates
 *
 * @example
 * const coords = normalizeEventCoordinates(mouseEvent)
 * // Returns: { x: 150, y: 75 }
 */
export function normalizeEventCoordinates(event: MouseEvent | TouchEvent): Point {
  if ('clientX' in event) {
    // Mouse event
    return { x: event.clientX, y: event.clientY }
  } else if ('touches' in event && event.touches.length > 0) {
    // Touch event
    const touch = event.touches[0]
    return { x: touch.clientX, y: touch.clientY }
  }

  return { x: 0, y: 0 }
}

// ============================================================================
// SVG CONTENT ANALYSIS
// ============================================================================

/**
 * Parse SVG dimensions from SVG content string
 *
 * @param svgContent - SVG markup string
 * @returns Extracted dimensions or null if not found
 *
 * @example
 * const size = parseSvgDimensions('<svg width="24" height="24">...</svg>')
 * // Returns: { width: 24, height: 24 }
 */
export function parseSvgDimensions(svgContent: string): Size | null {
  if (typeof svgContent !== 'string') return null

  try {
    // Try to extract width/height attributes
    const widthMatch = svgContent.match(/width="([^"]*)"/) || svgContent.match(/width='([^']*)'/)
    const heightMatch = svgContent.match(/height="([^"]*)"/) || svgContent.match(/height='([^']*)'/)

    if (widthMatch && heightMatch) {
      const width = parseFloat(widthMatch[1])
      const height = parseFloat(heightMatch[1])

      if (isFinite(width) && isFinite(height)) {
        return { width, height }
      }
    }

    // Try to extract from viewBox
    const viewBoxData = extractViewBoxFromSvg(svgContent)
    if (viewBoxData) {
      return { width: viewBoxData.width, height: viewBoxData.height }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract viewBox from SVG content
 *
 * @param svgContent - SVG markup string
 * @returns ViewBox data or null if not found
 *
 * @example
 * const viewBox = extractViewBoxFromSvg('<svg viewBox="0 0 24 24">...</svg>')
 * // Returns: { x: 0, y: 0, width: 24, height: 24 }
 */
export function extractViewBoxFromSvg(svgContent: string): ViewBox | null {
  if (typeof svgContent !== 'string') return null

  try {
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/) || svgContent.match(/viewBox='([^']*)'/)

    if (viewBoxMatch) {
      const values = viewBoxMatch[1].trim().split(/\s+/).map(Number)

      if (values.length === 4 && values.every(isFinite)) {
        return {
          x: values[0],
          y: values[1],
          width: values[2],
          height: values[3]
        }
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Validate SVG content format
 *
 * @param content - SVG content to validate
 * @returns True if content appears to be valid SVG
 *
 * @example
 * const isValid = validateSvgContent('<svg>...</svg>')
 * // Returns: true
 */
export function validateSvgContent(content: string): boolean {
  if (typeof content !== 'string' || !content.trim()) {
    return false
  }

  try {
    const trimmed = content.trim()
    return trimmed.startsWith('<svg') && trimmed.includes('</svg>')
  } catch {
    return false
  }
}

/**
 * Validate that a value is a finite number (not NaN, Infinity, or non-numeric)
 *
 * @param value - Value to validate
 * @returns True if value is a valid finite number
 *
 * @example
 * isValidNumber(42)        // Returns: true
 * isValidNumber(NaN)       // Returns: false
 * isValidNumber(Infinity)  // Returns: false
 * isValidNumber("42")      // Returns: false
 * isValidNumber(null)      // Returns: false
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

// ============================================================================
// GEOMETRY CALCULATIONS
// ============================================================================

/**
 * Calculate distance between two points
 *
 * @param point1 - First point
 * @param point2 - Second point
 * @returns Distance between points
 *
 * @example
 * const distance = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
 * // Returns: 5 (Pythagorean theorem)
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x
  const deltaY = point2.y - point1.y
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

/**
 * Calculate angle between two points in degrees
 *
 * @param point1 - First point
 * @param point2 - Second point
 * @returns Angle in degrees
 *
 * @example
 * const angle = calculateAngle({ x: 0, y: 0 }, { x: 1, y: 1 })
 * // Returns: 45 (45 degree angle)
 */
export function calculateAngle(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x
  const deltaY = point2.y - point1.y
  const radians = Math.atan2(deltaY, deltaX)
  return (radians * 180) / Math.PI
}

/**
 * Check if a point is within given bounds
 *
 * @param point - Point to check
 * @param bounds - Bounding box
 * @returns True if point is within bounds
 *
 * @example
 * const inBounds = isPointInBounds({ x: 5, y: 5 }, { minX: 0, minY: 0, maxX: 10, maxY: 10 })
 * // Returns: true
 */
export function isPointInBounds(point: Point, bounds: BoundingBox): boolean {
  return point.x >= bounds.minX && point.x <= bounds.maxX &&
         point.y >= bounds.minY && point.y <= bounds.maxY
}

/**
 * Calculate bounding box that contains all given points
 *
 * @param points - Array of points
 * @returns Bounding box containing all points
 *
 * @example
 * const bounds = calculateBoundingBoxFromPoints([{ x: 0, y: 0 }, { x: 10, y: 5 }])
 * // Returns: { minX: 0, minY: 0, maxX: 10, maxY: 5 }
 */
export function calculateBoundingBoxFromPoints(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return { minX, minY, maxX, maxY }
}

// ============================================================================
// UTILITY COLLECTIONS
// ============================================================================

/**
 * Collection of mathematical calculation utilities
 */
export const SvgCalculations = {
  calculateZoomLevel,
  calculatePanOffset,
  calculateOptimalScale,
  constrainValue
}

/**
 * Collection of SVG transform utilities
 */
export const SvgTransforms = {
  createTransformString,
  createViewBoxString,
  createStyleObject
}

/**
 * Collection of coordinate conversion utilities
 */
export const SvgCoordinates = {
  isPercentage,
  parsePercentage,
  resolveCoordinate,
  resolvePosition,
  resolveLinePosition,
  resolveAnyPosition,
  resolvePercentageCoords,
  convertScreenToSvg,
  convertSvgToScreen,
  calculateCenterPoint
}

/**
 * Collection of event processing utilities
 */
export const SvgEvents = {
  extractWheelData,
  extractTouchData,
  extractGestureData,
  normalizeEventCoordinates
}

/**
 * Collection of SVG content analysis utilities
 */
export const SvgContent = {
  parseSvgDimensions,
  extractViewBoxFromSvg,
  validateSvgContent
}

/**
 * Collection of geometry calculation utilities
 */
export const SvgGeometry = {
  calculateDistance,
  calculateAngle,
  isPointInBounds,
  calculateBoundingBoxFromPoints
}

// ============================================================================
// PERCENTAGE POSITION UTILITIES
// ============================================================================

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
 *
 * @param xPercent - X percentage value
 * @param yPercent - Y percentage value
 * @returns Position object with percentage coordinates
 *
 * @example
 * const position = createPercentagePosition(50, 25)
 * // Returns: { x: '50%', y: '25%' }
 */
export function createPercentagePosition(xPercent: number, yPercent: number): PercentagePosition {
  return {
    x: `${xPercent}%`,
    y: `${yPercent}%`
  }
}