/**
 * SVG Viewer Constants
 *
 * Centralized constants for SVG viewer component configuration
 */

export const SVG_VIEWER_CONSTANTS = {
  // Container and layout dimensions
  CONTAINER_PADDING: 120,
  MINI_SVG_WIDTH: 120,
  MINI_SVG_HEIGHT: 32,
  LEGEND_WIDTH: 128,
  LEGEND_HEIGHT: 40,
  GRID_SIZE: 20,

  // Zoom configuration
  ZOOM_CONSTRAINTS: {
    MIN: 0.1,
    MAX: 5,
    STEP: 0.1,
    DEFAULT: 1
  },

  // Auto-fit calculation defaults
  AUTO_FIT: {
    MIN_MARGIN: 40,
    MAX_SCALE: 3,
    MIN_SCALE: 0.1
  },

  // Touch/gesture sensitivity
  TOUCH: {
    MIN_PINCH_THRESHOLD: 0.1,
    MAX_GESTURE_SCALE: 3
  }
} as const

export type SvgViewerConstants = typeof SVG_VIEWER_CONSTANTS