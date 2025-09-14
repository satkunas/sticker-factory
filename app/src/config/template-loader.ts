import yaml from 'js-yaml'
import type { SimpleTemplate, TemplateElement, TemplateTextInput, YamlTemplate, TemplateShape } from '../types/template-types'

// Template cache to avoid repeated loading
const templateCache = new Map<string, SimpleTemplate>()
const templateListCache: SimpleTemplate[] | null = null

// Import YAML templates dynamically - this will be populated at build time
const templateModules = import.meta.glob('../../templates/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false
})

/**
 * Get all available template IDs
 */
export const getAvailableTemplateIds = (): string[] => {
  return Object.keys(templateModules).map(path => {
    const filename = path.split('/').pop()?.replace('.yaml', '')
    return filename || ''
  }).filter(id => id) // Filter out empty IDs
}

/**
 * Load a template by its ID
 */
export const loadTemplate = async (templateId: string): Promise<SimpleTemplate | null> => {
  // Check cache first
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!
  }

  try {
    const templatePath = `../../templates/${templateId}.yaml`

    if (!templateModules[templatePath]) {
      console.warn(`Template not found: ${templateId}`)
      return null
    }

    // Load YAML content
    const yamlContent = await templateModules[templatePath]() as string
    const yamlTemplate = yaml.load(yamlContent) as YamlTemplate

    if (!yamlTemplate || !validateYamlTemplate(yamlTemplate)) {
      console.error(`Invalid YAML template: ${templateId}`)
      return null
    }

    // Convert YAML template to SimpleTemplate
    const template = convertYamlToSimpleTemplate(yamlTemplate)

    // Cache the converted template
    templateCache.set(templateId, template)
    return template

  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error)
    return null
  }
}

/**
 * Load all available templates
 */
export const loadAllTemplates = async (): Promise<SimpleTemplate[]> => {
  const templateIds = getAvailableTemplateIds()
  const templates: SimpleTemplate[] = []

  for (const id of templateIds) {
    const template = await loadTemplate(id)
    if (template) {
      templates.push(template)
    }
  }

  // Sort by category and name
  templates.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.name.localeCompare(b.name)
  })

  return templates
}

/**
 * Get the default template (first available)
 */
export const getDefaultTemplate = async (): Promise<SimpleTemplate | null> => {
  // Try to load common template names first
  const defaultNames = ['rectangle-1', 'circle-1', 'default-rectangle', 'default-circle']

  for (const name of defaultNames) {
    const template = await loadTemplate(name)
    if (template) {
      return template
    }
  }

  // Fall back to the first available template
  const templates = await loadAllTemplates()
  return templates[0] || null
}

/**
 * Validate YAML template structure
 */
const validateYamlTemplate = (template: any): template is YamlTemplate => {
  if (!template || typeof template !== 'object') {
    console.error('Template must be an object')
    return false
  }

  const required = ['id', 'name', 'description', 'category']
  for (const field of required) {
    if (!(field in template)) {
      console.error(`Template missing required field: ${field}`)
      return false
    }
  }

  if (!Array.isArray(template.shapes)) {
    console.error('Template must have shapes array')
    return false
  }

  if (!Array.isArray(template.textInputs)) {
    console.error('Template must have textInputs array')
    return false
  }

  return true
}

/**
 * Convert YAML template to SimpleTemplate format
 */
const convertYamlToSimpleTemplate = (yamlTemplate: YamlTemplate): SimpleTemplate => {
  // Calculate viewBox from shapes
  const viewBox = calculateViewBox(yamlTemplate.shapes)

  // Convert shapes and text inputs to template elements
  const elements: TemplateElement[] = []

  // Add shape elements
  yamlTemplate.shapes.forEach((shape) => {
    elements.push({
      type: 'shape',
      zIndex: shape.zIndex,
      shape: {
        id: shape.id,
        type: 'path',
        path: convertShapeToPath(shape),
        fill: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        zIndex: shape.zIndex
      }
    })
  })

  // Add text input elements
  yamlTemplate.textInputs.forEach((textInput) => {
    elements.push({
      type: 'text',
      zIndex: textInput.zIndex || 10,
      textInput: {
        id: textInput.id,
        label: textInput.label,
        placeholder: textInput.placeholder,
        position: textInput.position,
        maxLength: textInput.maxLength,
        zIndex: textInput.zIndex || 10
      }
    })
  })

  return {
    id: yamlTemplate.id,
    name: yamlTemplate.name,
    description: yamlTemplate.description,
    category: yamlTemplate.category,
    viewBox,
    elements: elements.sort((a, b) => a.zIndex - b.zIndex)
  }
}

/**
 * Calculate viewBox from shapes
 */
const calculateViewBox = (shapes: TemplateShape[]): { width: number; height: number } => {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  shapes.forEach((shape) => {
    if (shape.type === 'line') {
      const pos = shape.position as { x1: number; y1: number; x2: number; y2: number }
      minX = Math.min(minX, pos.x1, pos.x2)
      minY = Math.min(minY, pos.y1, pos.y2)
      maxX = Math.max(maxX, pos.x1, pos.x2)
      maxY = Math.max(maxY, pos.y1, pos.y2)
    } else {
      const pos = shape.position as { x: number; y: number }
      const width = shape.width || 0
      const height = shape.height || 0

      minX = Math.min(minX, pos.x - width/2)
      minY = Math.min(minY, pos.y - height/2)
      maxX = Math.max(maxX, pos.x + width/2)
      maxY = Math.max(maxY, pos.y + height/2)
    }
  })

  // Add padding
  const padding = 20
  return {
    width: Math.max(400, maxX - minX + padding * 2),
    height: Math.max(400, maxY - minY + padding * 2)
  }
}

/**
 * Convert YAML shape to SVG path
 */
const convertShapeToPath = (shape: TemplateShape): string => {
  const pos = shape.position as { x: number; y: number }

  switch (shape.type) {
    case 'rect':
      const width = shape.width || 100
      const height = shape.height || 100
      const rx = shape.rx || 0
      const ry = shape.ry || 0
      const x = pos.x - width/2
      const y = pos.y - height/2

      if (rx > 0 || ry > 0) {
        return `M${x + rx},${y} L${x + width - rx},${y} Q${x + width},${y} ${x + width},${y + ry} L${x + width},${y + height - ry} Q${x + width},${y + height} ${x + width - rx},${y + height} L${x + rx},${y + height} Q${x},${y + height} ${x},${y + height - ry} L${x},${y + ry} Q${x},${y} ${x + rx},${y} Z`
      } else {
        return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`
      }

    case 'circle':
      const radius = (shape.width || 100) / 2
      return `M${pos.x - radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x + radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x - radius},${pos.y} Z`

    case 'ellipse':
      const rWidth = (shape.width || 100) / 2
      const rHeight = (shape.height || 50) / 2
      return `M${pos.x - rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x + rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x - rWidth},${pos.y} Z`

    case 'polygon':
      if (shape.points) {
        return `M${shape.points} Z`
      }
      // Default triangle if no points specified
      return `M${pos.x},${pos.y - 50} L${pos.x + 50},${pos.y + 25} L${pos.x - 50},${pos.y + 25} Z`

    case 'line':
      const linePos = shape.position as { x1: number; y1: number; x2: number; y2: number }
      return `M${linePos.x1},${linePos.y1} L${linePos.x2},${linePos.y2}`

    default:
      // Default to rectangle
      const defWidth = shape.width || 100
      const defHeight = shape.height || 100
      const defX = pos.x - defWidth/2
      const defY = pos.y - defHeight/2
      return `M${defX},${defY} L${defX + defWidth},${defY} L${defX + defWidth},${defY + defHeight} L${defX},${defY + defHeight} Z`
  }
}

/**
 * Helper function to get ordered elements from any template (backward compatible)
 */
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

/**
 * Helper function to get main text input from any template
 */
export const getTemplateMainTextInput = (template: SimpleTemplate): TemplateTextInput | null => {
  const elements = getTemplateElements(template)
  const textElements = elements.filter(el => el.type === 'text')
  return textElements.length > 0 ? textElements[0].textInput! : null
}

/**
 * Get template by ID with caching
 */
export const getTemplateById = async (id: string): Promise<SimpleTemplate | null> => {
  return await loadTemplate(id)
}