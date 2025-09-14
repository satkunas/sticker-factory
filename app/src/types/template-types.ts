export interface TemplateTextInput {
  id: string
  label: string
  placeholder?: string
  position: { x: number; y: number }
  rotation: number
  clipPath: string
  maxLength: number
  zIndex?: number
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

export interface YamlTemplate {
  name: string
  id: string
  description: string
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  shapes: TemplateShape[]
  textInputs: TemplateTextInput[]
}

// Converted template for rendering (with SVG paths)
export interface SimpleTemplate {
  id: string
  name: string
  description: string
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  viewBox: { width: number; height: number }
  elements: TemplateElement[]
}

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