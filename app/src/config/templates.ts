// Compatibility wrapper for old template system
// This provides backward compatibility while using the new YAML-based system

import type { SimpleTemplate } from '../types/template-types'
import { getDefaultTemplate, loadAllTemplates } from './template-loader'

// Re-export types for compatibility
export type { SimpleTemplate as Template } from '../types/template-types'
export type { TemplateShape, TemplateTextInput } from '../types/template-types'

// Default template - loaded from the new YAML system
let _defaultTemplate: SimpleTemplate | null = null

export const DEFAULT_TEMPLATE: SimpleTemplate = {
  id: 'default',
  name: 'Loading...',
  description: 'Loading default template...',
  category: 'rectangle',
  viewBox: { width: 400, height: 100 },
  elements: []
}

// Initialize the default template
const initDefaultTemplate = async () => {
  if (_defaultTemplate) return _defaultTemplate

  try {
    const template = await getDefaultTemplate()
    if (template) {
      _defaultTemplate = template
      // Update the DEFAULT_TEMPLATE object
      Object.assign(DEFAULT_TEMPLATE, template)
    }
  } catch (error) {
  }

  return _defaultTemplate || DEFAULT_TEMPLATE
}

// Load default template immediately
initDefaultTemplate()

// Get all available templates (compatibility wrapper)
export const getAvailableTemplates = async () => {
  return await loadAllTemplates()
}

// Load template (compatibility wrapper)
export const loadTemplate = async (templateId: string) => {
  const { loadTemplate: loadTemplateFromLoader } = await import('./template-loader')
  return await loadTemplateFromLoader(templateId)
}

// Template validation (simplified for compatibility)
export const validateTemplate = (template: any): template is SimpleTemplate => {
  if (!template || typeof template !== 'object') return false

  const required = ['id', 'name', 'description', 'category', 'viewBox']
  for (const field of required) {
    if (!(field in template)) {
      return false
    }
  }

  return true
}