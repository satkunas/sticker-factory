/**
 * Central SVG Type Definitions
 * =============================
 *
 * Shared type definitions for SVG utilities to eliminate duplicate type declarations
 * across svg.ts, svg-bounds.ts, svg-centering.ts, svg-positioning.ts, and unified-positioning.ts
 */

/**
 * 2D Point coordinate
 */
export interface Point {
  x: number
  y: number
}

/**
 * SVG ViewBox parameters
 */
export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Width and height dimensions
 */
export interface Dimensions {
  width: number
  height: number
}
