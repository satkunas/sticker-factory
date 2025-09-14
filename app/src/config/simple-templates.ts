export interface TemplateTextInput {
  id: string
  label: string
  placeholder?: string
  position: { x: number; y: number }
  maxLength?: number
  zIndex: number
}

export interface TemplateShape {
  id: string
  type: 'path'
  path: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  zIndex: number
}

export interface TemplateElement {
  type: 'shape' | 'text'
  zIndex: number
  shape?: TemplateShape
  textInput?: TemplateTextInput
}

export interface SimpleTemplate {
  id: string
  name: string
  description: string
  category: 'circle' | 'square' | 'rectangle' | 'diamond' | 'hexagon'
  viewBox: { width: number; height: number }
  // Legacy support - deprecated
  path?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  textInputs?: TemplateTextInput[]
  // New unified structure
  elements: TemplateElement[]
}

// Simple template definitions without complex dependencies
export const SIMPLE_TEMPLATES: SimpleTemplate[] = [
  {
    id: 'default-rectangle',
    name: 'Classic Rectangle',
    description: 'Traditional pill-shaped sticker',
    category: 'rectangle',
    viewBox: { width: 200, height: 60 },
    elements: [
      {
        type: 'shape',
        zIndex: 1,
        shape: {
          id: 'background',
          type: 'path',
          path: 'M30,0 L170,0 Q200,0 200,30 L200,30 Q200,60 170,60 L30,60 Q0,60 0,30 L0,30 Q0,0 30,0 Z',
          fill: '#22c55e',
          stroke: '#16a34a',
          strokeWidth: 2,
          zIndex: 1
        }
      },
      {
        type: 'text',
        zIndex: 2,
        textInput: {
          id: 'main-text',
          label: 'Main Text',
          placeholder: 'Enter your text...',
          position: { x: 100, y: 30 },
          maxLength: 20,
          zIndex: 2
        }
      }
    ]
  },
  {
    id: 'simple-circle',
    name: 'Circle Sticker',
    description: 'Round circular sticker',
    category: 'circle',
    viewBox: { width: 100, height: 100 },
    path: 'M50,50 m-45,0 a45,45 0 1,0 90,0 a45,45 0 1,0 -90,0',
    fillColor: '#3b82f6',
    strokeColor: '#1d4ed8',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'center-text',
        label: 'Center Text',
        placeholder: 'Enter text...',
        position: { x: 50, y: 50 },
        maxLength: 15
      }
    ]
  },
  {
    id: 'simple-square',
    name: 'Square Sticker',
    description: 'Square with rounded corners',
    category: 'square',
    viewBox: { width: 100, height: 100 },
    path: 'M15,0 L85,0 Q100,0 100,15 L100,85 Q100,100 85,100 L15,100 Q0,100 0,85 L0,15 Q0,0 15,0 Z',
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'main-label',
        label: 'Label Text',
        placeholder: 'Enter label...',
        position: { x: 50, y: 50 },
        maxLength: 12
      }
    ]
  },
  // Additional Rectangle Templates
  {
    id: 'wide-rectangle',
    name: 'Wide Rectangle',
    description: 'Extended horizontal sticker',
    category: 'rectangle',
    viewBox: { width: 300, height: 60 },
    path: 'M30,0 L270,0 Q300,0 300,30 L300,30 Q300,60 270,60 L30,60 Q0,60 0,30 L0,30 Q0,0 30,0 Z',
    fillColor: '#10b981',
    strokeColor: '#059669',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'main-text',
        label: 'Banner Text',
        placeholder: 'Enter banner text...',
        position: { x: 150, y: 30 },
        maxLength: 30
      }
    ]
  },
  {
    id: 'narrow-rectangle',
    name: 'Narrow Rectangle',
    description: 'Compact thin sticker',
    category: 'rectangle',
    viewBox: { width: 200, height: 40 },
    path: 'M20,0 L180,0 Q200,0 200,20 L200,20 Q200,40 180,40 L20,40 Q0,40 0,20 L0,20 Q0,0 20,0 Z',
    fillColor: '#8b5cf6',
    strokeColor: '#7c3aed',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'compact-text',
        label: 'Compact Text',
        placeholder: 'Short text...',
        position: { x: 100, y: 20 },
        maxLength: 15
      }
    ]
  },
  {
    id: 'rounded-rectangle',
    name: 'Rounded Rectangle',
    description: 'Heavily rounded sticker',
    category: 'rectangle',
    viewBox: { width: 200, height: 80 },
    path: 'M40,0 L160,0 Q200,0 200,40 L200,40 Q200,80 160,80 L40,80 Q0,80 0,40 L0,40 Q0,0 40,0 Z',
    fillColor: '#ef4444',
    strokeColor: '#dc2626',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'rounded-text',
        label: 'Display Text',
        placeholder: 'Display text...',
        position: { x: 100, y: 40 },
        maxLength: 18
      }
    ]
  },
  // Additional Circle Templates
  {
    id: 'large-circle',
    name: 'Large Circle',
    description: 'Extra large circular sticker',
    category: 'circle',
    viewBox: { width: 120, height: 120 },
    path: 'M60,60 m-55,0 a55,55 0 1,0 110,0 a55,55 0 1,0 -110,0',
    fillColor: '#06b6d4',
    strokeColor: '#0891b2',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'large-center',
        label: 'Center Label',
        placeholder: 'Label...',
        position: { x: 60, y: 60 },
        maxLength: 20
      }
    ]
  },
  {
    id: 'small-circle',
    name: 'Small Circle',
    description: 'Compact circular sticker',
    category: 'circle',
    viewBox: { width: 80, height: 80 },
    path: 'M40,40 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0',
    fillColor: '#f97316',
    strokeColor: '#ea580c',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'small-center',
        label: 'Short Text',
        placeholder: 'Text',
        position: { x: 40, y: 40 },
        maxLength: 8
      }
    ]
  },
  {
    id: 'thick-circle',
    name: 'Thick Circle',
    description: 'Bold bordered circular sticker',
    category: 'circle',
    viewBox: { width: 100, height: 100 },
    path: 'M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0',
    fillColor: '#84cc16',
    strokeColor: '#65a30d',
    strokeWidth: 4,
    textInputs: [
      {
        id: 'thick-center',
        label: 'Bold Text',
        placeholder: 'Bold text...',
        position: { x: 50, y: 50 },
        maxLength: 12
      }
    ]
  },
  // Additional Square Templates
  {
    id: 'large-square',
    name: 'Large Square',
    description: 'Extra large square sticker',
    category: 'square',
    viewBox: { width: 120, height: 120 },
    path: 'M15,0 L105,0 Q120,0 120,15 L120,105 Q120,120 105,120 L15,120 Q0,120 0,105 L0,15 Q0,0 15,0 Z',
    fillColor: '#ec4899',
    strokeColor: '#db2777',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'large-label',
        label: 'Main Label',
        placeholder: 'Main label...',
        position: { x: 60, y: 60 },
        maxLength: 16
      }
    ]
  },
  {
    id: 'sharp-square',
    name: 'Sharp Square',
    description: 'Square with minimal rounding',
    category: 'square',
    viewBox: { width: 100, height: 100 },
    path: 'M5,0 L95,0 Q100,0 100,5 L100,95 Q100,100 95,100 L5,100 Q0,100 0,95 L0,5 Q0,0 5,0 Z',
    fillColor: '#6366f1',
    strokeColor: '#4f46e5',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'sharp-text',
        label: 'Sharp Text',
        placeholder: 'Sharp text...',
        position: { x: 50, y: 50 },
        maxLength: 10
      }
    ]
  },
  // Diamond Templates
  {
    id: 'classic-diamond',
    name: 'Classic Diamond',
    description: 'Traditional diamond shape',
    category: 'diamond',
    viewBox: { width: 100, height: 100 },
    path: 'M50,5 L90,50 L50,95 L10,50 Z',
    fillColor: '#f59e0b',
    strokeColor: '#d97706',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'diamond-center',
        label: 'Center Text',
        placeholder: 'Text...',
        position: { x: 50, y: 50 },
        maxLength: 8
      }
    ]
  },
  // Hexagon Templates
  {
    id: 'classic-hexagon',
    name: 'Classic Hexagon',
    description: 'Six-sided geometric shape',
    category: 'hexagon',
    viewBox: { width: 100, height: 100 },
    path: 'M25,7 L75,7 L93,35 L93,65 L75,93 L25,93 L7,65 L7,35 Z',
    fillColor: '#06b6d4',
    strokeColor: '#0891b2',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'hex-center',
        label: 'Hex Text',
        placeholder: 'Hex text...',
        position: { x: 50, y: 50 },
        maxLength: 10
      }
    ]
  },
  {
    id: 'wide-hexagon',
    name: 'Wide Hexagon',
    description: 'Wider hexagonal shape',
    category: 'hexagon',
    viewBox: { width: 120, height: 80 },
    path: 'M20,5 L100,5 L115,25 L115,55 L100,75 L20,75 L5,55 L5,25 Z',
    fillColor: '#84cc16',
    strokeColor: '#65a30d',
    strokeWidth: 2,
    textInputs: [
      {
        id: 'wide-hex-text',
        label: 'Wide Text',
        placeholder: 'Wide text...',
        position: { x: 60, y: 40 },
        maxLength: 12
      }
    ]
  }
]

export const getTemplateById = (id: string): SimpleTemplate | null => {
  return SIMPLE_TEMPLATES.find(t => t.id === id) || null
}

export const getDefaultTemplate = (): SimpleTemplate => {
  return SIMPLE_TEMPLATES[0]
}

// Helper function to get ordered elements from any template (backward compatible)
export const getTemplateElements = (template: SimpleTemplate): TemplateElement[] => {
  if (template.elements) {
    // New structure - return sorted by zIndex
    return template.elements.sort((a, b) => a.zIndex - b.zIndex)
  }

  // Legacy structure - convert to new format
  const elements: TemplateElement[] = []

  // Add shape element
  if (template.path) {
    elements.push({
      type: 'shape',
      zIndex: 1,
      shape: {
        id: 'legacy-shape',
        type: 'path',
        path: template.path,
        fill: template.fillColor,
        stroke: template.strokeColor,
        strokeWidth: template.strokeWidth,
        zIndex: 1
      }
    })
  }

  // Add text elements
  if (template.textInputs) {
    template.textInputs.forEach((textInput, index) => {
      elements.push({
        type: 'text',
        zIndex: 2 + index,
        textInput: {
          ...textInput,
          zIndex: 2 + index
        }
      })
    })
  }

  return elements.sort((a, b) => a.zIndex - b.zIndex)
}

// Helper function to get main text input from any template
export const getTemplateMainTextInput = (template: SimpleTemplate): TemplateTextInput | null => {
  const elements = getTemplateElements(template)
  const textElements = elements.filter(el => el.type === 'text')
  return textElements.length > 0 ? textElements[0].textInput! : null
}