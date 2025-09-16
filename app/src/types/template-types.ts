export interface TemplateTextInput {
  id: string
  label: string
  placeholder?: string
  default?: string
  position: { x: number; y: number }
  rotation?: number
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
  position: { x: number; y: number } | { x1: number; y1: number; x2: number; y2: number }
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
  position: { x: number; y: number } | { x1: number; y1: number; x2: number; y2: number }
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
  position: { x: number; y: number }
  rotation?: number
  clipPath?: string
  maxLength?: number
  fontFamily?: string
  fontColor?: string
  fontSize?: number
  fontWeight?: number
}

// Union type for all layer types
export type TemplateLayer = TemplateShapeLayer | TemplateTextInputLayer

export interface YamlTemplate {
  name: string
  id: string
  description: string
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  layers: TemplateLayer[]
}

// Legacy interfaces for backward compatibility
export interface LegacyYamlTemplate {
  name: string
  id: string
  description: string
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  shapes: TemplateShape[]
  textInputs: TemplateTextInput[]
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
  type: 'shape' | 'text'
}

// Processed shape layer (converted to SVG path)
export interface ProcessedShapeLayer extends ProcessedLayerBase {
  type: 'shape'
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
  textInput: {
    id: string
    label: string
    placeholder?: string
    position: { x: number; y: number }
    rotation?: number
    clipPath?: string
    maxLength?: number
    fontFamily?: string
    fontColor?: string
    fontSize?: number
    fontWeight?: number
  }
}

export type ProcessedTemplateLayer = ProcessedShapeLayer | ProcessedTextInputLayer

// Legacy interface for backward compatibility
export interface TemplateElement {
  type: 'shape' | 'text'
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
}