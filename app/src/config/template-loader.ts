/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml'
import type {
  SimpleTemplate,
  TemplateElement,
  TemplateTextInput,
  YamlTemplate,
  LegacyYamlTemplate,
  TemplateShapeLayer,
  TemplateLayer,
  ProcessedTemplateLayer,
  ProcessedTextInputLayer,
  ProcessedSvgImageLayer,
  _TemplateSvgImageLayer
} from '../types/template-types'
import { resolvePosition, resolveLinePosition, type ViewBox } from './coordinate-utils'
import { getSvgContent } from './svg-library-loader'
import { logger, reportCriticalError, createPerformanceTimer } from '../utils/logger'
import {
  TEMPLATE_PADDING,
  DEFAULT_VIEWBOX_WIDTH,
  DEFAULT_VIEWBOX_HEIGHT,
  MIN_VIEWBOX_WIDTH,
  MIN_VIEWBOX_HEIGHT
} from './constants'

// Template cache to avoid repeated loading
const templateCache = new Map<string, SimpleTemplate>()

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
    logger.debug(`Template loaded from cache: ${templateId}`)
    return templateCache.get(templateId)!
  }

  const timer = createPerformanceTimer(`Template load: ${templateId}`)

  try {
    const templatePath = `../../templates/${templateId}.yaml`

    if (!templateModules[templatePath]) {
      logger.warn(`Template not found: ${templateId}`)
      return null
    }

    // Load YAML content
    const yamlContent = await templateModules[templatePath]() as string
    const yamlTemplate = yaml.load(yamlContent) as YamlTemplate

    if (!yamlTemplate || !validateYamlTemplate(yamlTemplate)) {
      logger.error(`Invalid YAML template: ${templateId}`)
      return null
    }

    // Convert YAML template to SimpleTemplate
    const template = await convertYamlToSimpleTemplate(yamlTemplate)

    // Cache the converted template
    templateCache.set(templateId, template)

    timer.end({
      templateId,
      cached: false,
      layerCount: template.layers?.length || 0,
      cacheSize: templateCache.size
    })

    return template

  } catch (error) {
    timer.end({ templateId, error: true })
    reportCriticalError(error as Error, `Failed to load template ${templateId}`)
    return null
  }
}

/**
 * Load all available templates
 */
export const loadAllTemplates = async (): Promise<SimpleTemplate[]> => {
  const templateIds = getAvailableTemplateIds()
  const templates: SimpleTemplate[] = []
  let processedTemplates = 0

  try {
    for (const id of templateIds) {
      try {
        const template = await loadTemplate(id)
        if (template) {
          templates.push(template)
        }
        processedTemplates++

        // Memory cleanup for large operations
        if (processedTemplates % 10 === 0) {
          if (typeof global !== 'undefined' && global.gc) {
            global.gc()
          }
        }
      } catch (error) {
        logger.error(`Failed to load template ${id}:`, error)
        // Continue processing other templates
      }
    }

    // Sort by category and name
    templates.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    logger.info(`Successfully loaded ${templates.length}/${templateIds.length} templates`)
    return templates

  } catch (error) {
    reportCriticalError(error as Error, 'Template batch loading failed')
    throw error
  } finally {
    // Cleanup after batch operation
    if (typeof global !== 'undefined' && global.gc) {
      global.gc()
    }
  }
}

/**
 * Get the default template (first available)
 */
export const getDefaultTemplate = async (): Promise<SimpleTemplate | null> => {
  // Get the first available template
  const templates = await loadAllTemplates()
  return templates[0] || null
}

/**
 * Validate YAML template structure (supports both new and legacy formats)
 */
const validateYamlTemplate = (template: any): template is YamlTemplate | LegacyYamlTemplate => {
  if (!template || typeof template !== 'object') {
    logger.error('Template must be an object')
    return false
  }

  const required = ['id', 'name', 'description', 'category']
  for (const field of required) {
    if (!(field in template)) {
      logger.error(`Template missing required field: ${field}`)
      return false
    }
  }

  // Check for new format (layers array)
  if (Array.isArray(template.layers)) {
    return true
  }

  // Check for legacy format (shapes + textInputs arrays)
  if (Array.isArray(template.shapes) && Array.isArray(template.textInputs)) {
    return true
  }

  logger.error('Template must have either layers array (new format) or shapes+textInputs arrays (legacy format)')
  return false
}

/**
 * Check if template uses the new layers format
 */
const isNewFormat = (template: YamlTemplate | LegacyYamlTemplate): template is YamlTemplate => {
  return 'layers' in template && Array.isArray(template.layers)
}

/**
 * Convert legacy template to new format
 */
const convertLegacyToNew = (legacy: LegacyYamlTemplate): YamlTemplate => {
  const layers: TemplateLayer[] = []

  // Add shapes as shape layers
  legacy.shapes.forEach((shape) => {
    layers.push({
      id: shape.id,
      type: 'shape',
      subtype: shape.type, // Convert legacy type to subtype
      position: shape.position,
      width: shape.width,
      height: shape.height,
      rx: shape.rx,
      ry: shape.ry,
      points: shape.points,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      fill: shape.fill,
      opacity: shape.opacity
    })
  })

  // Add textInputs as text layers
  legacy.textInputs.forEach((textInput) => {
    layers.push({
      id: textInput.id,
      type: 'text',
      label: textInput.label,
      placeholder: textInput.placeholder,
      default: textInput.default,
      position: textInput.position,
      rotation: textInput.rotation,
      clip: textInput.clip,
      clipPath: textInput.clipPath,
      maxLength: textInput.maxLength,
      fontFamily: textInput.fontFamily,
      fontColor: textInput.fontColor,
      fontSize: textInput.fontSize,
      fontWeight: textInput.fontWeight
    })
  })

  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    category: legacy.category,
    layers
  }
}

/**
 * Convert YAML template to SimpleTemplate format (supports both new and legacy formats)
 */
const convertYamlToSimpleTemplate = async (rawTemplate: YamlTemplate | LegacyYamlTemplate): Promise<SimpleTemplate> => {
  // Convert legacy format to new format if needed
  const yamlTemplate: YamlTemplate = isNewFormat(rawTemplate) ? rawTemplate : convertLegacyToNew(rawTemplate)

  // Calculate viewBox from shape layers
  const shapeLayers = yamlTemplate.layers.filter((layer): layer is TemplateShapeLayer => layer.type === 'shape')
  const viewBox = calculateViewBoxFromLayers(shapeLayers)

  // Convert layers to processed template layers
  const layers: ProcessedTemplateLayer[] = []

  // Process all layers with proper async handling
  for (const layer of yamlTemplate.layers) {
    if (layer.type === 'shape') {
      layers.push({
        id: layer.id,
        type: 'shape',
        subtype: layer.subtype,  // Preserve original subtype
        width: layer.width,      // Preserve original width
        height: layer.height,    // Preserve original height
        shape: {
          id: layer.id,
          type: 'path',
          path: convertShapeLayerToPath(layer, viewBox),
          fill: layer.fill,
          stroke: layer.stroke,
          strokeWidth: layer.strokeWidth
        }
      })
    } else if (layer.type === 'text') {
      // Resolve percentage coordinates for text inputs
      const resolvedPosition = resolvePosition(
        layer.position as { x: number | string; y: number | string },
        viewBox
      )

      layers.push({
        id: layer.id,
        type: 'text',
        textInput: {
          id: layer.id,
          label: layer.label,
          placeholder: layer.placeholder,
          default: layer.default,
          position: resolvedPosition,
          rotation: layer.rotation,
          clip: layer.clip,
          clipPath: layer.clipPath,
          maxLength: layer.maxLength,
          fontFamily: layer.fontFamily,
          fontColor: layer.fontColor,
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight
        }
      })
    } else if (layer.type === 'svgImage') {
      // Resolve percentage coordinates for SVG images
      const resolvedPosition = resolvePosition(
        layer.position as { x: number | string; y: number | string },
        viewBox
      )

      // Get SVG content from library or use direct content
      let svgContent = layer.svgContent || ''
      if (layer.svgId && !svgContent) {
        svgContent = await getSvgContent(layer.svgId) || ''
      }

      layers.push({
        id: layer.id,
        type: 'svgImage',
        svgImage: {
          id: layer.id,
          svgContent,
          position: resolvedPosition,
          width: layer.width,
          height: layer.height,
          fill: layer.fill,
          stroke: layer.stroke,
          strokeWidth: layer.strokeWidth,
          strokeLinejoin: layer.strokeLinejoin
        }
      })
    }
  }

  return {
    id: yamlTemplate.id,
    name: yamlTemplate.name,
    description: yamlTemplate.description,
    category: yamlTemplate.category,
    viewBox,
    layers
  }
}

/**
 * Calculate viewBox from shape layers (with percentage coordinate support)
 */
const calculateViewBoxFromLayers = (shapeLayers: TemplateShapeLayer[]): { x: number; y: number; width: number; height: number } => {
  // First pass: find any absolute coordinates to establish base dimensions
  let hasAbsoluteCoords = false
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  // Check for absolute coordinates first
  shapeLayers.forEach((layer) => {
    if (layer.subtype === 'line') {
      const pos = layer.position as { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
      if (typeof pos.x1 === 'number' && typeof pos.y1 === 'number' &&
          typeof pos.x2 === 'number' && typeof pos.y2 === 'number') {
        hasAbsoluteCoords = true
        minX = Math.min(minX, pos.x1, pos.x2)
        minY = Math.min(minY, pos.y1, pos.y2)
        maxX = Math.max(maxX, pos.x1, pos.x2)
        maxY = Math.max(maxY, pos.y1, pos.y2)
      }
    } else {
      const pos = layer.position as { x: number | string; y: number | string }
      if (typeof pos.x === 'number' && typeof pos.y === 'number') {
        hasAbsoluteCoords = true
        const width = layer.width || 0
        const height = layer.height || 0
        const strokeWidth = layer.strokeWidth || 0
        const halfStroke = strokeWidth / 2

        minX = Math.min(minX, pos.x - width/2 - halfStroke)
        minY = Math.min(minY, pos.y - height/2 - halfStroke)
        maxX = Math.max(maxX, pos.x + width/2 + halfStroke)
        maxY = Math.max(maxY, pos.y + height/2 + halfStroke)
      }
    }
  })

  // If no absolute coordinates found, use default dimensions
  if (!hasAbsoluteCoords || minX === Infinity) {
    return { x: 0, y: 0, width: DEFAULT_VIEWBOX_WIDTH, height: DEFAULT_VIEWBOX_HEIGHT }
  }

  // Add padding
  const x = minX - TEMPLATE_PADDING
  const y = minY - TEMPLATE_PADDING
  const width = Math.max(MIN_VIEWBOX_WIDTH, maxX - minX + TEMPLATE_PADDING * 2)
  const height = Math.max(MIN_VIEWBOX_HEIGHT, maxY - minY + TEMPLATE_PADDING * 2)

  return { x, y, width, height }
}

/**
 * Convert shape layer to SVG path (with percentage coordinate support)
 */
const convertShapeLayerToPath = (layer: TemplateShapeLayer, viewBox: ViewBox): string => {
  if (layer.subtype === 'line') {
    const linePos = layer.position as { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
    const resolvedPos = resolveLinePosition(linePos, viewBox)
    return `M${resolvedPos.x1},${resolvedPos.y1} L${resolvedPos.x2},${resolvedPos.y2}`
  }

  const pos = resolvePosition(layer.position as { x: number | string; y: number | string }, viewBox)

  switch (layer.subtype) {
    case 'rect': {
      const width = layer.width || 100
      const height = layer.height || 100
      const rx = layer.rx || 0
      const ry = layer.ry || 0
      const x = pos.x - width/2
      const y = pos.y - height/2

      if (rx > 0 || ry > 0) {
        return `M${x + rx},${y} L${x + width - rx},${y} Q${x + width},${y} ${x + width},${y + ry} L${x + width},${y + height - ry} Q${x + width},${y + height} ${x + width - rx},${y + height} L${x + rx},${y + height} Q${x},${y + height} ${x},${y + height - ry} L${x},${y + ry} Q${x},${y} ${x + rx},${y} Z`
      } else {
        return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`
      }
    }

    case 'circle': {
      const radius = (layer.width || 100) / 2
      return `M${pos.x - radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x + radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x - radius},${pos.y} Z`
    }

    case 'ellipse': {
      const rWidth = (layer.width || 100) / 2
      const rHeight = (layer.height || 50) / 2
      return `M${pos.x - rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x + rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x - rWidth},${pos.y} Z`
    }

    case 'polygon': {
      if (layer.points) {
        // Convert relative points to absolute coordinates
        const pointPairs = layer.points.split(' ')
        const absolutePoints = pointPairs.map(pair => {
          const [x, y] = pair.split(',').map(Number)
          return `${pos.x + x},${pos.y + y}`
        })
        return `M${absolutePoints.join(' L')} Z`
      }
      // Default triangle if no points specified
      return `M${pos.x},${pos.y - 50} L${pos.x + 50},${pos.y + 25} L${pos.x - 50},${pos.y + 25} Z`
    }

    default: {
      // Default to rectangle
      const defWidth = layer.width || 100
      const defHeight = layer.height || 100
      const defX = pos.x - defWidth/2
      const defY = pos.y - defHeight/2
      return `M${defX},${defY} L${defX + defWidth},${defY} L${defX + defWidth},${defY + defHeight} L${defX},${defY + defHeight} Z`
    }
  }
}


/**
 * Helper function to get ordered elements from any template (backward compatible)
 */
export const getTemplateElements = (template: SimpleTemplate): TemplateElement[] => {
  // New layers structure
  if (template.layers) {
    const elements: TemplateElement[] = []

    template.layers.forEach((layer) => {
      if (layer.type === 'shape') {
        elements.push({
          type: 'shape',
          shape: layer.shape  // Extract the nested shape data
        })
      } else if (layer.type === 'text') {
        elements.push({
          type: 'text',
          textInput: layer.textInput
        })
      } else if (layer.type === 'svgImage') {
        elements.push({
          type: 'svgImage',
          svgImage: layer.svgImage
        })
      }
    })

    return elements
  }

  // Legacy elements structure
  if ((template as any).elements) {
    return (template as any).elements
  }

  // Very old legacy structure - convert to new format
  const elements: TemplateElement[] = []

  // Add shape element
  if ((template as any).path) {
    elements.push({
      type: 'shape',
      shape: {
        id: 'legacy-shape',
        type: 'path',
        path: (template as any).path,
        fill: (template as any).fillColor,
        stroke: (template as any).strokeColor,
        strokeWidth: (template as any).strokeWidth
      }
    })
  }

  // Add text elements
  if ((template as any).textInputs) {
    (template as any).textInputs.forEach((textInput: any) => {
      elements.push({
        type: 'text',
        textInput: {
          ...textInput
        }
      })
    })
  }

  return elements
}

/**
 * Helper function to get all text inputs from any template
 */
export const getTemplateTextInputs = (template: SimpleTemplate): TemplateTextInput[] => {
  // New layers structure
  if (template.layers) {
    return template.layers
      .filter((layer): layer is ProcessedTextInputLayer => layer.type === 'text')
      .map(layer => layer.textInput)
  }

  // Legacy elements structure
  const elements = getTemplateElements(template)
  const textElements = elements.filter(el => el.type === 'text')
  return textElements.map(el => el.textInput!)
}

/**
 * Helper function to get main text input from any template
 */
export const getTemplateMainTextInput = (template: SimpleTemplate): TemplateTextInput | null => {
  const textInputs = getTemplateTextInputs(template)
  return textInputs.length > 0 ? textInputs[0] : null
}

/**
 * Get all SVG images from template layers
 */
export const getTemplateSvgImages = (template: SimpleTemplate): ProcessedSvgImageLayer[] => {
  // New layers structure
  if (template.layers) {
    return template.layers
      .filter((layer): layer is ProcessedSvgImageLayer => layer.type === 'svgImage')
  }

  return []
}

/**
 * Helper function to get SVG image data by ID
 */
export const getTemplateSvgImageById = (template: SimpleTemplate, svgImageId: string): ProcessedSvgImageLayer | null => {
  const svgImages = getTemplateSvgImages(template)
  return svgImages.find(img => img.id === svgImageId) || null
}

/**
 * Get template by ID with caching
 */
export const getTemplateById = async (id: string): Promise<SimpleTemplate | null> => {
  return await loadTemplate(id)
}