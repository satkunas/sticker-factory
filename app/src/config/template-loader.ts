/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml'
import type {
  SimpleTemplate,
  TemplateElement,
  TemplateTextInput,
  YamlTemplate,
  TemplateShapeLayer,
  ProcessedSvgImageLayer
} from '../types/template-types'
import { getSvgContent } from './svg-library-loader'
import { logger, reportCriticalError, createPerformanceTimer } from '../utils/logger'
import { processTemplateLayers } from '../utils/template-processing'
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
 * Validate YAML template structure
 */
const validateYamlTemplate = (template: any): template is YamlTemplate => {
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

  // Check for layers array
  if (Array.isArray(template.layers)) {
    return true
  }

  logger.error('Template must have layers array')
  return false
}


/**
 * Convert YAML template to SimpleTemplate format
 * Uses shared processing logic from template-processing.ts
 */
const convertYamlToSimpleTemplate = async (yamlTemplate: YamlTemplate): Promise<SimpleTemplate> => {
  // Calculate viewBox
  const viewBox = yamlTemplate.width && yamlTemplate.height
    ? {
        x: 0,
        y: 0,
        width: yamlTemplate.width,
        height: yamlTemplate.height
      }
    : yamlTemplate.viewBox
      ? yamlTemplate.viewBox
      : {
          x: 0,
          y: 0,
          width: DEFAULT_VIEWBOX_WIDTH,
          height: DEFAULT_VIEWBOX_HEIGHT
        }

  // Process layers using shared utility (with SVG content loader)
  const layers = await processTemplateLayers(yamlTemplate, getSvgContent)

  return {
    id: yamlTemplate.id,
    name: yamlTemplate.name,
    description: yamlTemplate.description,
    category: yamlTemplate.category,
    width: yamlTemplate.width ?? viewBox.width,
    height: yamlTemplate.height ?? viewBox.height,
    viewBox,
    layers
  }
}

/**
 * Calculate viewBox from shape layers (with percentage coordinate support)
 */
const _calculateViewBoxFromLayers = (shapeLayers: TemplateShapeLayer[]): { x: number; y: number; width: number; height: number } => {
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
        const width = layer.width ?? 0  // No width = no contribution to bounds
        const height = layer.height ?? 0  // No height = no contribution to bounds
        const strokeWidth = layer.strokeWidth ?? 0  // No stroke = 0 stroke width
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
 * Helper function to get ordered elements from any template (backward compatible)
 */
export const getTemplateElements = (template: SimpleTemplate): TemplateElement[] => {
  // New flat layers structure - return layers directly as elements
  if (template.layers) {
    return template.layers.map((layer) => {
      // Each flat layer is now a complete element with all properties accessible
      if (layer.type === 'shape') {
        return {
          type: 'shape',
          // All properties are now directly on the layer (flat structure)
          ...layer
        }
      } else if (layer.type === 'text') {
        return {
          type: 'text',
          // All properties are now directly on the layer (flat structure)
          ...layer
        }
      } else if (layer.type === 'svgImage') {
        return {
          type: 'svgImage',
          // All properties are now directly on the layer (flat structure)
          ...layer
        }
      }
      return layer
    }) as TemplateElement[]
  }

  return []
}

/**
 * Helper function to get all text inputs from any template
 */
export const getTemplateTextInputs = (template: SimpleTemplate): TemplateTextInput[] => {
  // New flat layers structure - text properties are directly on the layer
  if (template.layers) {
    return template.layers
      .filter((layer): layer is any => layer.type === 'text')
      .map(layer => ({
        // All text properties are now directly accessible (flat structure)
        id: layer.id,
        label: layer.label,
        placeholder: layer.placeholder,
        default: layer.text, // 'text' is the flattened version of 'default'
        position: layer.position,
        rotation: layer.rotation,
        clip: layer.clip,
        clipPath: layer.clipPath,
        maxLength: layer.maxLength,
        fontFamily: layer.fontFamily,
        fontColor: layer.fontColor,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight
      }))
  }

  return []
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
export const getTemplateSvgImages = (template: SimpleTemplate): any[] => {
  // New flat layers structure - SVG properties are directly on the layer
  if (template.layers) {
    return template.layers
      .filter((layer): layer is any => layer.type === 'svgImage')
      // Return the flat layer directly since all properties are accessible
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

/**
 * Get all available templates
 */
export const getAllTemplates = async (): Promise<SimpleTemplate[]> => {
  const templateIds = getAvailableTemplateIds()
  const templates: SimpleTemplate[] = []

  for (const id of templateIds) {
    const template = await loadTemplate(id)
    if (template) {
      templates.push(template)
    }
  }

  return templates
}