/* eslint-disable no-undef */
import { describe, it, expect } from 'vitest'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

/**
 * TextPath Template Validation Tests
 *
 * These tests ensure the 3 new textPath templates are correctly structured
 * and contain all required path and textPath properties.
 */

describe('TextPath Template Validation', () => {
  describe('Template File Loading', () => {
    it('should load certification-seal.yaml template successfully', () => {
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      expect(template).toBeTruthy()
      expect(template.id).toBe('certification-seal')
      expect(template.name).toBe('Certification Seal')
      expect(template.description).toContain('curved text')
    })

    it('should load wave-rider-sticker.yaml template successfully', () => {
      const templatePath = path.join(__dirname, '../../templates/wave-rider-sticker.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      expect(template).toBeTruthy()
      expect(template.id).toBe('wave-rider-sticker')
      expect(template.name).toBe('Wave Rider')
      expect(template.description).toContain('wave')
    })

    it('should load vintage-ribbon-banner.yaml template successfully', () => {
      const templatePath = path.join(__dirname, '../../templates/vintage-ribbon-banner.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      expect(template).toBeTruthy()
      expect(template.id).toBe('vintage-ribbon-banner')
      expect(template.name).toBe('Vintage Ribbon Banner')
      expect(template.description).toContain('ribbon')
    })
  })

  describe('Path Layer Structure', () => {
    it('should have 2 path layers in certification-seal template', () => {
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const pathLayers = template.layers.filter((layer: any) => layer.subtype === 'path')
      expect(pathLayers).toHaveLength(2)

      // Check for top and bottom arc paths
      const topArcPath = pathLayers.find((layer: any) => layer.id === 'top-arc-path')
      const bottomArcPath = pathLayers.find((layer: any) => layer.id === 'bottom-arc-path')

      expect(topArcPath).toBeTruthy()
      expect(bottomArcPath).toBeTruthy()
      expect(topArcPath.path).toContain('M')
      expect(bottomArcPath.path).toContain('M')
    })

    it('should have path layer with correct properties in wave-rider-sticker template', () => {
      const templatePath = path.join(__dirname, '../../templates/wave-rider-sticker.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const pathLayers = template.layers.filter((layer: any) => layer.subtype === 'path')
      expect(pathLayers.length).toBeGreaterThanOrEqual(1)

      // Check wave path exists
      const wavePath = template.layers.find((layer: any) => layer.id === 'wave-path')
      expect(wavePath).toBeTruthy()
      expect(wavePath.subtype).toBe('path')
      expect(wavePath.path).toContain('M')
      expect(wavePath.path).toContain('Q')  // Quadratic bezier curve
    })

    it('should have ribbon path layer in vintage-ribbon-banner template', () => {
      const templatePath = path.join(__dirname, '../../templates/vintage-ribbon-banner.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const ribbonPath = template.layers.find((layer: any) => layer.id === 'ribbon-path')
      expect(ribbonPath).toBeTruthy()
      expect(ribbonPath.subtype).toBe('path')
      expect(ribbonPath.path).toContain('M')
      expect(ribbonPath.path).toContain('Q')  // Quadratic bezier curve
    })
  })

  describe('TextPath References', () => {
    it('should have text layers with textPath references in certification-seal', () => {
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const textLayersWithTextPath = template.layers.filter(
        (layer: any) => layer.type === 'text' && layer.textPath
      )

      expect(textLayersWithTextPath.length).toBeGreaterThanOrEqual(2)

      // Check top text references top-arc-path
      const topText = template.layers.find((layer: any) => layer.id === 'top-text')
      expect(topText).toBeTruthy()
      expect(topText.textPath).toBe('top-arc-path')

      // Check bottom text references bottom-arc-path
      const bottomText = template.layers.find((layer: any) => layer.id === 'bottom-text')
      expect(bottomText).toBeTruthy()
      expect(bottomText.textPath).toBe('bottom-arc-path')
    })

    it('should have text layers with textPath references in wave-rider-sticker', () => {
      const templatePath = path.join(__dirname, '../../templates/wave-rider-sticker.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const textLayersWithTextPath = template.layers.filter(
        (layer: any) => layer.type === 'text' && layer.textPath
      )

      expect(textLayersWithTextPath.length).toBeGreaterThanOrEqual(1)

      // Check wave text references wave-path
      const waveText = template.layers.find((layer: any) => layer.id === 'wave-text')
      expect(waveText).toBeTruthy()
      expect(waveText.textPath).toBe('wave-path')
    })

    it('should have text layer with textPath reference in vintage-ribbon-banner', () => {
      const templatePath = path.join(__dirname, '../../templates/vintage-ribbon-banner.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const bannerText = template.layers.find((layer: any) => layer.id === 'banner-text')
      expect(bannerText).toBeTruthy()
      expect(bannerText.textPath).toBe('ribbon-path')
    })
  })

  describe('StartOffset and Dy Properties', () => {
    it('should have startOffset values in certification-seal text layers', () => {
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const topText = template.layers.find((layer: any) => layer.id === 'top-text')
      expect(topText.startOffset).toBeDefined()
      expect(topText.startOffset).toBe('25%')

      const bottomText = template.layers.find((layer: any) => layer.id === 'bottom-text')
      expect(bottomText.startOffset).toBeDefined()
      expect(bottomText.startOffset).toBe('25%')
      expect(bottomText.dy).toBeDefined()
      expect(typeof bottomText.dy).toBe('number')
    })

    it('should have startOffset values in wave-rider-sticker text layers', () => {
      const templatePath = path.join(__dirname, '../../templates/wave-rider-sticker.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const waveText = template.layers.find((layer: any) => layer.id === 'wave-text')
      expect(waveText.startOffset).toBeDefined()
      expect(typeof waveText.startOffset).toBe('string')
      expect(waveText.dy).toBeDefined()
      expect(typeof waveText.dy).toBe('number')

      // Check subtitle has different offset
      const subtitleText = template.layers.find((layer: any) => layer.id === 'subtitle-text')
      if (subtitleText && subtitleText.textPath) {
        expect(subtitleText.startOffset).toBeDefined()
        expect(subtitleText.startOffset).not.toBe(waveText.startOffset)
      }
    })

    it('should have startOffset and dy in vintage-ribbon-banner', () => {
      const templatePath = path.join(__dirname, '../../templates/vintage-ribbon-banner.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const bannerText = template.layers.find((layer: any) => layer.id === 'banner-text')
      expect(bannerText.startOffset).toBeDefined()
      expect(typeof bannerText.startOffset).toBe('string')
      expect(bannerText.dy).toBeDefined()
      expect(typeof bannerText.dy).toBe('number')
    })
  })

  describe('Template Structure Integrity', () => {
    it('should have all required template fields in all 3 templates', () => {
      const templateIds = [
        'certification-seal',
        'wave-rider-sticker',
        'vintage-ribbon-banner'
      ]

      templateIds.forEach(templateId => {
        const templatePath = path.join(__dirname, `../../templates/${templateId}.yaml`)
        const templateContent = fs.readFileSync(templatePath, 'utf8')
        const template = yaml.load(templateContent) as any

        expect(template.id).toBe(templateId)
        expect(template.name).toBeTruthy()
        expect(template.description).toBeTruthy()
        expect(template.width).toBeGreaterThan(0)
        expect(template.height).toBeGreaterThan(0)
        expect(Array.isArray(template.layers)).toBe(true)
        expect(template.layers.length).toBeGreaterThan(0)
      })
    })

    it('should have path layers without visual properties (static reference paths)', () => {
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const template = yaml.load(templateContent) as any

      const pathLayers = template.layers.filter((layer: any) => layer.subtype === 'path')

      pathLayers.forEach((pathLayer: any) => {
        // Path layers should not have visual properties (they're static reference paths)
        expect(pathLayer.fill).toBeUndefined()
        expect(pathLayer.stroke).toBeUndefined()
        expect(pathLayer.strokeWidth).toBeUndefined()
      })
    })
  })

  describe('Path Preservation in Template Processing', () => {
    it('should preserve original path data for subtype="path" layers', async () => {
      // Import the template processing function
      const { processTemplateLayers } = await import('../utils/template-processing')
      const templatePath = path.join(__dirname, '../../templates/certification-seal.yaml')
      const templateContent = fs.readFileSync(templatePath, 'utf8')
      const yamlTemplate = yaml.load(templateContent) as any

      // Process the template layers
      const processedLayers = await processTemplateLayers(yamlTemplate)

      // Find the path layers
      const topArcPath = processedLayers.find(layer => layer.id === 'top-arc-path')
      const bottomArcPath = processedLayers.find(layer => layer.id === 'bottom-arc-path')

      // Verify the path layers exist
      expect(topArcPath).toBeTruthy()
      expect(bottomArcPath).toBeTruthy()

      // Verify the path property is preserved (not converted to a rectangle)
      expect(topArcPath?.path).toContain('M 200,200')  // Full circle path data
      expect(topArcPath?.path).toContain('a 120,120') // Arc command (lowercase = relative)
      expect(bottomArcPath?.path).toContain('M 200,200')  // Full circle path data
      expect(bottomArcPath?.path).toContain('a 120,120') // Arc command (lowercase = relative)

      // Verify they are NOT converted to rectangles (which would contain "L")
      // Arc paths should only have M/m (move) and A/a (arc) commands
      const hasOnlyMoveAndArc = (pathData: string) => {
        // Remove the path data, leaving only commands
        const commands = pathData.replace(/[0-9.,\s-]+/g, '')
        return commands.match(/^[MAma]+$/) !== null
      }

      expect(hasOnlyMoveAndArc(topArcPath!.path!)).toBe(true)
      expect(hasOnlyMoveAndArc(bottomArcPath!.path!)).toBe(true)
    })

    it('should preserve path data for wave and ribbon templates', async () => {
      const { processTemplateLayers } = await import('../utils/template-processing')

      // Test wave-rider-sticker
      const waveTemplatePath = path.join(__dirname, '../../templates/wave-rider-sticker.yaml')
      const waveTemplateContent = fs.readFileSync(waveTemplatePath, 'utf8')
      const waveYamlTemplate = yaml.load(waveTemplateContent) as any
      const waveProcessedLayers = await processTemplateLayers(waveYamlTemplate)

      const wavePath = waveProcessedLayers.find(layer => layer.id === 'wave-path')
      expect(wavePath).toBeTruthy()
      expect(wavePath?.path).toContain('M 20,150')  // Original wave path
      expect(wavePath?.path).toContain('Q')  // Quadratic bezier

      // Test vintage-ribbon-banner
      const ribbonTemplatePath = path.join(__dirname, '../../templates/vintage-ribbon-banner.yaml')
      const ribbonTemplateContent = fs.readFileSync(ribbonTemplatePath, 'utf8')
      const ribbonYamlTemplate = yaml.load(ribbonTemplateContent) as any
      const ribbonProcessedLayers = await processTemplateLayers(ribbonYamlTemplate)

      const ribbonPath = ribbonProcessedLayers.find(layer => layer.id === 'ribbon-path')
      expect(ribbonPath).toBeTruthy()
      expect(ribbonPath?.path).toContain('M 70,150')  // Original ribbon path
      expect(ribbonPath?.path).toContain('Q')  // Quadratic bezier
    })
  })
})
