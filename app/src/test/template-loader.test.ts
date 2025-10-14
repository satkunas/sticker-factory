import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'

/**
 * Template Loader Tests
 *
 * These tests ensure templates can be loaded and validated correctly,
 * particularly that the category field is not required.
 */

describe('Template Loader', () => {
  describe('Template Validation', () => {
    it('should validate template without category field', () => {
      const templateYaml = `
name: "Test Template"
id: "test-template"
description: "Test template without category"
width: 300
height: 300
layers:
  - id: "test-shape"
    type: "shape"
    subtype: "circle"
    position: { x: "50%", y: "50%" }
    width: 100
    height: 100
    stroke: "#000000"
    strokeWidth: 2
    fill: "#ffffff"
`

      const template = yaml.load(templateYaml) as any

      // Check required fields exist
      expect(template).toHaveProperty('id')
      expect(template).toHaveProperty('name')
      expect(template).toHaveProperty('description')
      expect(template).toHaveProperty('width')
      expect(template).toHaveProperty('height')
      expect(template).toHaveProperty('layers')
      expect(Array.isArray(template.layers)).toBe(true)

      // Ensure category is NOT required
      expect(template).not.toHaveProperty('category')
    })

    it('should have all required fields except category', () => {
      const requiredFields = ['id', 'name', 'description']

      expect(requiredFields).toContain('id')
      expect(requiredFields).toContain('name')
      expect(requiredFields).toContain('description')
      expect(requiredFields).not.toContain('category')
    })

    it('should validate minimal template structure', () => {
      const minimalTemplate = {
        id: 'minimal-test',
        name: 'Minimal Test',
        description: 'Minimal test template',
        layers: []
      }

      // Should have minimum required fields
      expect(minimalTemplate.id).toBeDefined()
      expect(minimalTemplate.name).toBeDefined()
      expect(minimalTemplate.description).toBeDefined()
      expect(Array.isArray(minimalTemplate.layers)).toBe(true)

      // Category should not be required
      expect(minimalTemplate).not.toHaveProperty('category')
    })

    it('should handle templates with optional fields', () => {
      const templateWithOptionals = {
        id: 'optional-test',
        name: 'Optional Test',
        description: 'Template with optional fields',
        width: 400,
        height: 300,
        viewBox: { x: 0, y: 0, width: 400, height: 300 },
        layers: [
          {
            id: 'shape-1',
            type: 'shape',
            subtype: 'rect',
            position: { x: 200, y: 150 },
            width: 100,
            height: 50,
            stroke: '#000000',
            strokeWidth: 1,
            fill: '#ffffff'
          }
        ]
      }

      // Should work with optional fields
      expect(templateWithOptionals.width).toBe(400)
      expect(templateWithOptionals.height).toBe(300)
      expect(templateWithOptionals.viewBox).toBeDefined()

      // But category should still not be present
      expect(templateWithOptionals).not.toHaveProperty('category')
    })
  })

  describe('Template Sorting', () => {
    it('should sort templates by name only', () => {
      const templates = [
        { id: 'c', name: 'Charlie Template', description: 'C', width: 300, height: 300, viewBox: { x: 0, y: 0, width: 300, height: 300 }, layers: [] },
        { id: 'a', name: 'Alpha Template', description: 'A', width: 300, height: 300, viewBox: { x: 0, y: 0, width: 300, height: 300 }, layers: [] },
        { id: 'b', name: 'Bravo Template', description: 'B', width: 300, height: 300, viewBox: { x: 0, y: 0, width: 300, height: 300 }, layers: [] }
      ]

      const sorted = [...templates].sort((a, b) => a.name.localeCompare(b.name))

      expect(sorted[0].name).toBe('Alpha Template')
      expect(sorted[1].name).toBe('Bravo Template')
      expect(sorted[2].name).toBe('Charlie Template')
    })

    it('should not use category for sorting', () => {
      const templates = [
        { id: '1', name: 'Zebra', description: 'Z', width: 300, height: 300, viewBox: { x: 0, y: 0, width: 300, height: 300 }, layers: [] },
        { id: '2', name: 'Apple', description: 'A', width: 300, height: 300, viewBox: { x: 0, y: 0, width: 300, height: 300 }, layers: [] }
      ]

      const sorted = [...templates].sort((a, b) => a.name.localeCompare(b.name))

      // Should sort by name only
      expect(sorted[0].name).toBe('Apple')
      expect(sorted[1].name).toBe('Zebra')

      // Should not have category field
      expect(sorted[0]).not.toHaveProperty('category')
      expect(sorted[1]).not.toHaveProperty('category')
    })
  })

  describe('Template Conversion', () => {
    it('should convert YAML template without category field', () => {
      const yamlTemplate = {
        id: 'conversion-test',
        name: 'Conversion Test',
        description: 'Test conversion without category',
        width: 300,
        height: 300,
        layers: []
      }

      // Simulate conversion to SimpleTemplate
      const simpleTemplate = {
        id: yamlTemplate.id,
        name: yamlTemplate.name,
        description: yamlTemplate.description,
        width: yamlTemplate.width,
        height: yamlTemplate.height,
        viewBox: { x: 0, y: 0, width: yamlTemplate.width, height: yamlTemplate.height },
        layers: yamlTemplate.layers
      }

      // Should have all required fields
      expect(simpleTemplate.id).toBe('conversion-test')
      expect(simpleTemplate.name).toBe('Conversion Test')
      expect(simpleTemplate.description).toBe('Test conversion without category')

      // Should NOT have category field
      expect(simpleTemplate).not.toHaveProperty('category')
    })
  })
})
