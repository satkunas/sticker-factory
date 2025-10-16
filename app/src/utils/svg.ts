/**
 * SVG Utilities
 * Pure TypeScript functions for SVG transformations and calculations
 */

import type { Point, ViewBox } from '../types/svg-types'
export type { Point, ViewBox }

export interface Size {
  width: number
  height: number
}

export interface Transform {
  translate: Point
  scale: number
  rotate: number
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface PercentageCoords {
  x: number | string
  y: number | string
}

export interface PercentagePosition {
  x: number | string
  y: number | string
}

export interface ResolvedPosition {
  x: number
  y: number
}

export interface WheelData {
  deltaX: number
  deltaY: number
  isTrackpad: boolean
  scaleFactor: number
}

export interface TouchData {
  point: Point
  distance?: number
  scale?: number
}

export interface GestureData {
  scale: number
  rotation: number
}

export const SVG_CONSTANTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0,
  ZOOM_SPEED: 0.1,
  TRACKPAD_SENSITIVITY: 0.01,
  WHEEL_ZOOM_STEP: 1.1,
  PAN_BUFFER: 50,
  DEFAULT_VIEWBOX_SIZE: 24,
  MIN_PINCH_DISTANCE: 10
} as const

/**
 * Calculate new zoom level based on current zoom and delta
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
    const scaleFactor = 1 + (delta * SVG_CONSTANTS.TRACKPAD_SENSITIVITY)
    newZoom = currentZoom * scaleFactor
  } else {
    const step = delta > 0 ? SVG_CONSTANTS.WHEEL_ZOOM_STEP : 1 / SVG_CONSTANTS.WHEEL_ZOOM_STEP
    newZoom = currentZoom * step
  }

  return constrainValue(newZoom, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
}

export function calculatePanOffset(startPos: Point, currentPos: Point): Point {
  return {
    x: currentPos.x - startPos.x,
    y: currentPos.y - startPos.y
  }
}

/**
 * Calculate optimal scale to fit content within container
 * @param padding - Padding factor (0.8 = 20% padding)
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

export function constrainValue(value: number, min: number, max: number): number {
  if (!isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}

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

export function createViewBoxString(x: number, y: number, width: number, height: number): string {
  return `${x} ${y} ${width} ${height}`
}

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

export function isPercentage(value: number | string): value is string {
  return typeof value === 'string' && value.includes('%')
}

export function parsePercentage(value: string): number {
  const numericPart = parseFloat(value.replace('%', ''))
  return numericPart / 100
}

/**
 * Resolve coordinate from percentage to absolute pixels
 */
export function resolveCoordinate(
  value: number | string,
  viewBoxDimension: number,
  viewBoxStart = 0
): number {
  if (typeof value === 'number') {
    return value
  }

  if (isPercentage(value)) {
    const percentage = parsePercentage(value)
    return viewBoxStart + (viewBoxDimension * percentage)
  }

  return parseFloat(value)
}

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
 * Resolve line position for line shapes (x1,y1,x2,y2)
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
 * Resolve any position type (regular or line)
 */
export function resolveAnyPosition(
  position: PercentagePosition | { x1: number | string; y1: number | string; x2: number | string; y2: number | string },
  viewBox: ViewBox
): ResolvedPosition | { x1: number; y1: number; x2: number; y2: number } {
  if ('x1' in position && 'y1' in position && 'x2' in position && 'y2' in position) {
    return resolveLinePosition(position, viewBox)
  }

  return resolvePosition(position as PercentagePosition, viewBox)
}

export function resolvePercentageCoords(coords: PercentageCoords, viewBox: ViewBox): Point {
  return {
    x: resolveCoordinate(coords.x, viewBox.width, viewBox.x),
    y: resolveCoordinate(coords.y, viewBox.height, viewBox.y)
  }
}

/**
 * Convert screen coordinates to SVG coordinate space
 * Handles translation, scaling, rotation, and viewBox offset
 */
export function convertScreenToSvg(
  screenPoint: Point,
  transform: Transform,
  viewBox: ViewBox
): Point {
  let point = {
    x: screenPoint.x - transform.translate.x,
    y: screenPoint.y - transform.translate.y
  }

  point = {
    x: point.x / transform.scale,
    y: point.y / transform.scale
  }

  if (transform.rotate !== 0) {
    const angleRad = (-transform.rotate * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    const rotatedX = point.x * cos - point.y * sin
    const rotatedY = point.x * sin + point.y * cos

    point = { x: rotatedX, y: rotatedY }
  }

  point = {
    x: point.x + viewBox.x,
    y: point.y + viewBox.y
  }

  return point
}

/**
 * Convert SVG coordinates to screen coordinate space
 * Applies translation, scaling, rotation, and viewBox offset
 */
export function convertSvgToScreen(
  svgPoint: Point,
  transform: Transform,
  viewBox: ViewBox
): Point {
  let point = {
    x: svgPoint.x - viewBox.x,
    y: svgPoint.y - viewBox.y
  }

  if (transform.rotate !== 0) {
    const angleRad = (transform.rotate * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)

    const rotatedX = point.x * cos - point.y * sin
    const rotatedY = point.x * sin + point.y * cos

    point = { x: rotatedX, y: rotatedY }
  }

  point = {
    x: point.x * transform.scale,
    y: point.y * transform.scale
  }

  point = {
    x: point.x + transform.translate.x,
    y: point.y + transform.translate.y
  }

  return point
}

export function calculateCenterPoint(width: number, height: number): Point {
  return {
    x: width / 2,
    y: height / 2
  }
}

/**
 * Extract and process wheel event data
 * Detects trackpad vs mouse wheel input
 */
export function extractWheelData(event: WheelEvent): WheelData {
  const deltaX = event.deltaX ?? 0
  const deltaY = event.deltaY ?? 0

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
 * Extract gesture data for Safari/WebKit gesture events
 */
export function extractGestureData(event: Event & { scale?: number; rotation?: number }): GestureData {
  return {
    scale: event.scale ?? 1,
    rotation: event.rotation ?? 0
  }
}

export function normalizeEventCoordinates(event: MouseEvent | TouchEvent): Point {
  if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY }
  } else if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0]
    return { x: touch.clientX, y: touch.clientY }
  }

  return { x: 0, y: 0 }
}

export function parseSvgDimensions(svgContent: string): Size | null {
  if (typeof svgContent !== 'string') return null

  try {
    const widthMatch = svgContent.match(/width="([^"]*)"/) || svgContent.match(/width='([^']*)'/)
    const heightMatch = svgContent.match(/height="([^"]*)"/) || svgContent.match(/height='([^']*)'/)

    if (widthMatch && heightMatch) {
      const width = parseFloat(widthMatch[1])
      const height = parseFloat(heightMatch[1])

      if (isFinite(width) && isFinite(height)) {
        return { width, height }
      }
    }

    const viewBoxData = extractViewBoxFromSvg(svgContent)
    if (viewBoxData) {
      return { width: viewBoxData.width, height: viewBoxData.height }
    }

    return null
  } catch {
    return null
  }
}

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
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function calculateDistance(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x
  const deltaY = point2.y - point1.y
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

export function calculateAngle(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x
  const deltaY = point2.y - point1.y
  const radians = Math.atan2(deltaY, deltaX)
  return (radians * 180) / Math.PI
}

export function isPointInBounds(point: Point, bounds: BoundingBox): boolean {
  return point.x >= bounds.minX && point.x <= bounds.maxX &&
         point.y >= bounds.minY && point.y <= bounds.maxY
}

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

export function createPercentagePosition(xPercent: number, yPercent: number): PercentagePosition {
  return {
    x: `${xPercent}%`,
    y: `${yPercent}%`
  }
}
