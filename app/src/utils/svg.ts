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


export function resolvePercentageCoords(coords: PercentageCoords, viewBox: ViewBox): Point {
  return {
    x: resolveCoordinate(coords.x, viewBox.width, viewBox.x),
    y: resolveCoordinate(coords.y, viewBox.height, viewBox.y)
  }
}




/**
 * Validate that a value is a finite number (not NaN, Infinity, or non-numeric)
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

