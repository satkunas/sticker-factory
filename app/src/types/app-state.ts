/**
 * Shared type definitions for application state
 * Used by URL encoding/decoding and store management
 */
import type { FontConfig } from '../config/fonts'

// Main application state interface
export interface AppState {
  selectedTemplateId: string | null
  // Store only user form overrides, not full layer data
  layers: LayerState[]
  lastModified: number
}

// Unified layer state that can be text, shape, or svgImage
export interface LayerState {
  id: string
  type: 'text' | 'shape' | 'svgImage'
  // Text layer properties
  text?: string
  font?: FontConfig | null
  fontSize?: number
  fontWeight?: number
  textColor?: string
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string
  // Shape layer properties
  fillColor?: string
  // SVG image layer properties
  svgImageId?: string
  svgContent?: string
  color?: string
  scale?: number
  rotation?: number
}