/* eslint-disable @typescript-eslint/no-explicit-any */
// SVG library item interface
export interface SvgLibraryItem {
  id: string
  name: string
  category: string
  svgContent: string
  tags: string[]
}

export interface TemplateTextInput {
  id: string
  label: string
  placeholder?: string
  default?: string
  position: { x: number | string; y: number | string }
  rotation?: number
  clip?: string
  clipPath?: string
  textPath?: string      // ID of path to follow for curved text
  startOffset?: string   // Starting position on path (e.g., "0%", "50%", "100%")
  dy?: number            // Vertical offset from path baseline (-100 to 100)
  dominantBaseline?: string  // Text baseline alignment (auto, middle, central, hanging, etc.)
  maxLength?: number
  fontFamily?: string
  fontColor?: string
  fontSize?: number
  fontWeight?: number
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string
}

export interface TemplateShape {
  id: string
  type: 'rect' | 'circle' | 'polygon' | 'ellipse' | 'line' | 'path'
  position: { x: number | string; y: number | string } | { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
  width?: number
  height?: number
  rx?: number
  ry?: number
  points?: string
  stroke: string
  strokeWidth: number
  strokeLinejoin?: string
  fill: string
  opacity?: number
  path?: string
}

// Base layer interface
export interface TemplateLayerBase {
  id: string
}

// Shape layer
export interface TemplateShapeLayer extends TemplateLayerBase {
  type: 'shape'
  subtype: 'rect' | 'circle' | 'polygon' | 'ellipse' | 'line' | 'path'
  position: { x: number | string; y: number | string } | { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
  width?: number
  height?: number
  rx?: number
  ry?: number
  points?: string
  path?: string  // SVG path data for path subtype
  stroke: string
  strokeWidth: number
  strokeLinejoin?: string
  fill: string
  opacity?: number
}

// Text input layer
export interface TemplateTextInputLayer extends TemplateLayerBase {
  type: 'text'
  label: string
  placeholder?: string
  default?: string
  position: { x: number | string; y: number | string }
  rotation?: number
  clip?: string
  clipPath?: string
  textPath?: string      // ID of path to follow for curved text
  startOffset?: string   // Starting position on path (e.g., "0%", "50%", "100%")
  dy?: number            // Vertical offset from path baseline (-100 to 100)
  dominantBaseline?: string  // Text baseline alignment (auto, middle, central, hanging, etc.)
  maxLength?: number
  fontFamily?: string
  fontColor?: string
  fontSize?: number
  fontWeight?: number
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string
}

// SVG image layer
export interface TemplateSvgImageLayer extends TemplateLayerBase {
  type: 'svgImage'
  svgId?: string           // Reference to library SVG
  svgContent?: string      // Direct SVG content
  position: { x: number | string; y: number | string }
  width?: number
  height?: number
  fill: string
  stroke: string
  strokeWidth: number
  strokeLinejoin?: string
  clip?: string            // Clip path reference
  clipPath?: string        // Direct clip path
  opacity?: number
  rotation?: number        // 0-360 degrees
  scale?: number          // 0.01-100 multiplier
}

// Union type for all layer types
export type TemplateLayer = TemplateShapeLayer | TemplateTextInputLayer | TemplateSvgImageLayer

export interface YamlTemplate {
  name: string
  id: string
  description: string
  width: number   // Template width - primary dimension source
  height: number  // Template height - primary dimension source
  viewBox?: { x: number; y: number; width: number; height: number }  // Optional: legacy support
  layers: TemplateLayer[]
}


// Text input state for the store
export interface TextInputState {
  id: string
  text: string
  font: any | null // FontConfig type
  fontSize: number
  fontWeight: number
  textColor: string
  strokeWidth: number
  strokeColor: string
  strokeOpacity: number
}

// Shape style state for template object styling
export interface ShapeStyleState {
  id: string
  fillColor: string
  strokeColor: string
  strokeWidth: number
  strokeLinejoin: string
}

// SVG image style state for template image styling
export interface SvgImageStyleState {
  id: string
  color: string
  strokeColor: string
  strokeWidth: number
  strokeLinejoin: string
  svgContent?: string  // Selected SVG content that overrides template default
  rotation: number     // 0-360 degrees, default: 0
  scale: number        // 0.01-100 multiplier, default: 1.0
}

// Converted template for rendering (with SVG paths)
export interface SimpleTemplate {
  id: string
  name: string
  description: string
  width: number   // Template width - used for viewBox and positioning calculations
  height: number  // Template height - used for viewBox and positioning calculations
  viewBox: { x: number; y: number; width: number; height: number }  // Derived from width/height
  layers: ProcessedTemplateLayer[]
}

// Base processed layer
export interface ProcessedLayerBase {
  id: string
  type: 'shape' | 'text' | 'svgImage'
}

// Processed shape layer (converted to SVG path)
export interface ProcessedShapeLayer extends ProcessedLayerBase {
  type: 'shape'
  subtype?: string
  width?: number
  height?: number
  zIndex?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  svgContent?: string
  svgId?: string
  shape: {
    id: string
    type: 'path'
    path: string
    fill?: string
    stroke?: string
    strokeWidth?: number
  }
}

// Processed text input layer
export interface ProcessedTextInputLayer extends ProcessedLayerBase {
  type: 'text'
  zIndex?: number
  textInput: {
    id: string
    label: string
    placeholder?: string
    default?: string
    position: { x: number; y: number }
    rotation?: number
    clip?: string
    clipPath?: string
    textPath?: string      // ID of path to follow for curved text
    startOffset?: string   // Starting position on path (e.g., "0%", "50%", "100%")
    dy?: number            // Vertical offset from path baseline (-100 to 100)
    maxLength?: number
    fontFamily?: string
    fontColor?: string
    fontSize?: number
    fontWeight?: number
  }
}

// Processed SVG image layer
export interface ProcessedSvgImageLayer extends ProcessedLayerBase {
  type: 'svgImage'
  zIndex?: number
  svgId?: string
  svgContent?: string
  svgImage: {
    id: string
    svgContent: string
    position: { x: number; y: number }
    width?: number
    height?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    strokeLinejoin?: string
    clip?: string
    clipPath?: string
  }
}

export type ProcessedTemplateLayer = ProcessedShapeLayer | ProcessedTextInputLayer | ProcessedSvgImageLayer

// FLAT ARCHITECTURE: New simplified flat layer data structure
// This replaces the complex nested approach with a single flat structure
export interface FlatLayerData {
  id: string
  type?: 'text' | 'shape' | 'svgImage'  // Type is derived from template, not stored in form

  // Text properties
  text?: string
  label?: string
  placeholder?: string
  default?: string
  fontSize?: number
  fontWeight?: number
  fontColor?: string
  fontFamily?: string

  // TextPath properties (curved text along paths)
  textPath?: string      // ID of path to follow for curved text
  startOffset?: string   // Starting position on path (e.g., "0%", "50%", "100%")
  dy?: number            // Vertical offset from path baseline (-100 to 100)
  dominantBaseline?: string  // Text baseline alignment (auto, middle, central, hanging, etc.)

  // Shape properties
  fillColor?: string
  fill?: string  // Template uses 'fill', form uses 'fillColor' - both supported

  // SVG Image properties
  svgImageId?: string
  svgContent?: string
  color?: string
  scale?: number
  rotation?: number
  transformOrigin?: { x: number; y: number }  // Optimal center point for rotation/scale

  // Universal properties
  strokeColor?: string
  stroke?: string  // Template uses 'stroke', form uses 'strokeColor' - both supported
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string
  clip?: string
  clipPath?: string

  // Position and dimensions (from template)
  position?: { x: number | string; y: number | string }
  width?: number
  height?: number
  opacity?: number

  // Shape-specific template properties
  subtype?: 'rect' | 'circle' | 'polygon' | 'ellipse' | 'line'
  rx?: number
  ry?: number
  points?: string

  // Computed/derived properties
  transformString?: string
  font?: any  // FontConfig object for compatibility
}

// URL structure for flat architecture
export interface FlatUrlState {
  selectedTemplateId: string | null
  layers: FlatLayerData[]
}

// Legacy interface for backward compatibility
export interface TemplateElement {
  type: 'shape' | 'text' | 'svgImage'
  shape?: {
    id: string
    type: 'path'
    path: string
    fill?: string
    stroke?: string
    strokeWidth?: number
  }
  textInput?: {
    id: string
    label: string
    placeholder?: string
    position: { x: number; y: number }
    maxLength?: number
    fontFamily?: string
    fontColor?: string
    fontSize?: number
    fontWeight?: number
  }
  svgImage?: {
    id: string
    svgContent: string
    position: { x: number; y: number }
    width?: number
    height?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    strokeLinejoin?: string
    clip?: string
    clipPath?: string
  }
}