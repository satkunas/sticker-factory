export interface TemplateTextInput {
  id: string
  label: string
  placeholder?: string
  position: { x: number; y: number }
  rotation?: number
  clipPath?: string
  maxLength?: number
  zIndex: number
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
  zIndex: number
}

// Base layer interface
export interface TemplateLayerBase {
  id: string
  zIndex: number
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
  type: 'textInput'
  label: string
  placeholder?: string
  position: { x: number; y: number }
  rotation?: number
  clipPath?: string
  maxLength?: number
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
  viewBox: { width: number; height: number }
  layers: ProcessedTemplateLayer[]
}

// Base processed layer
export interface ProcessedLayerBase {
  id: string
  type: 'shape' | 'textInput'
  zIndex: number
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
    zIndex: number
  }
}

// Processed text input layer
export interface ProcessedTextInputLayer extends ProcessedLayerBase {
  type: 'textInput'
  textInput: {
    id: string
    label: string
    placeholder?: string
    position: { x: number; y: number }
    rotation?: number
    clipPath?: string
    maxLength?: number
    zIndex: number
  }
}

export type ProcessedTemplateLayer = ProcessedShapeLayer | ProcessedTextInputLayer

// Legacy interface for backward compatibility
export interface TemplateElement {
  type: 'shape' | 'text'
  zIndex: number
  shape?: {
    id: string
    type: 'path'
    path: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    zIndex: number
  }
  textInput?: {
    id: string
    label: string
    placeholder?: string
    position: { x: number; y: number }
    maxLength?: number
    zIndex: number
  }
}