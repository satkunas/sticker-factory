/**
 * Service Worker Template Loader
 * ==============================
 *
 * Loads templates in Service Worker context using eager glob imports.
 * Uses shared processing logic from template-processing.ts for consistency.
 */

import yaml from 'js-yaml'
import type { SimpleTemplate, YamlTemplate } from '../types/template-types'
import { logger } from '../utils/logger'
import { processTemplateLayers } from '../utils/template-processing'

// Eagerly import all templates using Vite glob (auto-discovers new templates)
const templateModules = import.meta.glob('../../templates/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
})

// Build template map from glob results
const templateYamlMap: Record<string, string> = Object.entries(templateModules).reduce(
  (acc, [path, content]) => {
    const filename = path.split('/').pop()?.replace('.yaml', '')
    if (filename) {
      acc[filename] = content as string
    }
    return acc
  },
  {} as Record<string, string>
)

/**
 * Parse template from YAML content
 * Uses shared processing logic for shape→path conversion and coordinate resolution
 * NOTE: Does not load SVG content (svgContent should be provided in URL state)
 */
async function parseTemplate(templateId: string, yamlContent: string): Promise<SimpleTemplate> {
  const yamlTemplate = yaml.load(yamlContent) as YamlTemplate

  // Calculate viewBox (matches main template-loader.ts logic)
  const viewBox = yamlTemplate.width && yamlTemplate.height
    ? {
        x: 0,
        y: 0,
        width: yamlTemplate.width,
        height: yamlTemplate.height
      }
    : yamlTemplate.viewBox || { x: 0, y: 0, width: 400, height: 400 }

  // Process layers using shared utility (WITHOUT SVG content loader)
  // SVG content should be pre-loaded and included in URL state
  const layers = await processTemplateLayers(yamlTemplate)

  return {
    id: yamlTemplate.id,
    name: yamlTemplate.name,
    description: yamlTemplate.description,
    width: yamlTemplate.width ?? viewBox.width,
    height: yamlTemplate.height ?? viewBox.height,
    viewBox,
    layers
  }
}

/**
 * Load template by ID in Service Worker context
 */
export async function loadTemplate(templateId: string): Promise<SimpleTemplate | null> {
  const yamlContent = templateYamlMap[templateId]
  if (!yamlContent) {
    return null
  }

  try {
    return await parseTemplate(templateId, yamlContent)
  } catch (error) {
    logger.error('Failed to load template:', templateId, error)
    return null
  }
}
