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
  maxLength?: number
  fontFamily?: string
  fontColor?: string
  fontSize?: number
  fontWeight?: number
}

export interface TemplateShape {
  id: string
  type: 'rect' | 'circle' | 'polygon' | 'ellipse' | 'line'
  position: { x: number | string; y: number | string } | { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
  width?: number
  height?: number
  rx?: number
  ry?: number
  points?: string
  stroke: string
  strokeWidth: number
  fill: string
  opacity?: number
}

// Base layer interface
export interface TemplateLayerBase {
  id: string
}

// Shape layer
export interface TemplateShapeLayer extends TemplateLayerBase {
  type: 'shape'
  subtype: 'rect' | 'circle' | 'polygon' | 'ellipse' | 'line'
  position: { x: number | string; y: number | string } | { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
  width?: number
  height?: number
  rx?: number
  ry?: number
  points?: string
  stroke: string
  strokeWidth: number
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
  maxLength?: number
  fontFamily?: string
  fontColor?: string
  fontSize?: number
  fontWeight?: number
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
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  viewBox?: { x: number; y: number; width: number; height: number }
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
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  viewBox: { x: number; y: number; width: number; height: number }
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