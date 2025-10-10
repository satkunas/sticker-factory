/**
 * Unified SVG String Generator
 * ============================
 *
 * Generates SVG strings from template data, reusing existing utilities.
 * Used by both Service Worker (for .svg URLs) and main app (for exports).
 * Ensures visual parity with Svg.vue component.
 */

import type { SimpleTemplate, FlatLayerData, ProcessedTemplateLayer } from '../types/template-types'
import { resolveLayerPosition } from './layer-positioning'
import { generateMaskDefinitions } from './mask-utils'
import {
  generateSvgImageHtml
} from './svg-transforms'
import { extractFontFamily } from './font-utils'
import { embedWebFonts } from './fontEmbedding'

/**
 * Generate complete SVG string from template and layer data
 * Matches the exact rendering logic of Svg.vue component
 * Optionally embeds web fonts for offline viewing
 *
 * @param template - Template definition with layers
 * @param layers - Layer data to render
 * @param embedFonts - Whether to embed web fonts as base64 (default: true for offline capability)
 * @returns Complete SVG string
 */
export async function generateSvgString(
  template: SimpleTemplate,
  layers: FlatLayerData[],
  embedFonts = true
): Promise<string> {
  const { width, height } = template

  // PHASE 1: Collect unique font families from all text layers
  const fontFamilies = new Set<string>()
  for (const templateLayer of template.layers) {
    if (templateLayer.type === 'text') {
      const layerData = layers.find(l => l.id === templateLayer.id)
      const fontFamily = extractFontFamily(layerData) ?? templateLayer.fontFamily
      if (fontFamily) {
        fontFamilies.add(fontFamily)
      }
    }
  }

  // PHASE 2: Generate font CSS (with or without embedding)
  let fontCSS = ''
  if (fontFamilies.size > 0) {
    // Generate @import statements for web fonts
    const fontImports = Array.from(fontFamilies).map(family => {
      const encodedFamily = family.replace(/ /g, '+')
      return `@import url('https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;600;700&display=swap');`
    }).join('\n      ')

    // Optionally embed fonts for offline capability
    if (embedFonts) {
      try {
        fontCSS = await embedWebFonts(fontImports)
      } catch (error) {
        // Fallback to @import if embedding fails
        fontCSS = fontImports
      }
    } else {
      fontCSS = fontImports
    }
  }

  // PHASE 3: Generate mask definitions
  const maskDefs = generateMaskDefinitions(template.layers, width, height)

  // PHASE 4: Build defs section with fonts and masks
  const defsSection = (fontCSS || maskDefs.length > 0)
    ? `  <defs>\n${fontCSS ? `    <style>\n      ${fontCSS}\n    </style>\n` : ''}${maskDefs.length > 0 ? `${maskDefs.map(mask =>
      `    <mask id="${mask.id}">
      <path d="${mask.path}" fill="white" />
    </mask>`
    ).join('\n')  }\n` : ''}  </defs>\n`
    : ''

  // PHASE 5: Generate layer content
  const layerElements: string[] = []

  for (const templateLayer of template.layers) {
    const layerData = layers.find(l => l.id === templateLayer.id)
    const element = generateLayerElement(templateLayer, layerData, template)
    if (element) {
      layerElements.push(element)
    }
  }

  // Assemble final SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
${defsSection}  ${layerElements.join('\n  ')}
</svg>`
}

/**
 * Generate SVG element for a single layer
 * Matches rendering logic in Svg.vue template
 */
function generateLayerElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string | null {
  if (templateLayer.type === 'shape') {
    return generateShapeElement(templateLayer, layerData)
  } else if (templateLayer.type === 'text') {
    return generateTextElement(templateLayer, layerData, template)
  } else if (templateLayer.type === 'svgImage') {
    return generateSvgImageElement(templateLayer, layerData, template)
  }

  return null
}

/**
 * Generate shape layer element
 */
function generateShapeElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined
): string {
  const path = (templateLayer as unknown as { path?: string }).path
  if (!path) return ''

  const fill = layerData?.fillColor ?? layerData?.fill ?? templateLayer.fill
  const stroke = layerData?.strokeColor ?? layerData?.stroke ?? templateLayer.stroke
  const strokeWidth = layerData?.strokeWidth ?? templateLayer.strokeWidth
  const strokeLinejoin = layerData?.strokeLinejoin

  const attrs: string[] = [`d="${path}"`]
  if (fill !== undefined) attrs.push(`fill="${fill}"`)
  if (stroke !== undefined) attrs.push(`stroke="${stroke}"`)
  if (strokeWidth !== undefined) attrs.push(`stroke-width="${strokeWidth}"`)
  if (strokeLinejoin !== undefined) attrs.push(`stroke-linejoin="${strokeLinejoin}"`)

  return `<g>
    <path ${attrs.join(' ')} />
  </g>`
}

/**
 * Generate text layer element with proper center-based positioning
 */
function generateTextElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string {
  const x = resolveLayerPosition(templateLayer.position?.x, template.width)
  const y = resolveLayerPosition(templateLayer.position?.y, template.height)
  const rotation = templateLayer.rotation

  const text = layerData?.text ?? templateLayer.text ?? ''
  const fontFamily = extractFontFamily(layerData) ?? templateLayer.fontFamily
  const fontSize = layerData?.fontSize ?? templateLayer.fontSize
  const fontWeight = layerData?.fontWeight ?? templateLayer.fontWeight
  const fill = layerData?.fontColor ?? layerData?.textColor ?? templateLayer.fontColor
  const stroke = layerData?.strokeWidth !== undefined && layerData.strokeWidth > 0
    ? (layerData?.strokeColor ?? templateLayer.strokeColor)
    : undefined
  const strokeWidth = layerData?.strokeWidth !== undefined && layerData.strokeWidth > 0
    ? layerData.strokeWidth
    : undefined
  const strokeOpacity = layerData?.strokeOpacity
  const strokeLinejoin = layerData?.strokeLinejoin

  // Build transform
  let transform = `translate(${x}, ${y})`
  if (rotation !== undefined) {
    transform += ` rotate(${rotation})`
  }

  // Build text attributes
  const textAttrs: string[] = [
    'text-anchor="middle"',
    'dominant-baseline="central"'
  ]
  if (fontFamily !== undefined) textAttrs.push(`font-family="${fontFamily}"`)
  if (fontSize !== undefined) textAttrs.push(`font-size="${fontSize}"`)
  if (fontWeight !== undefined) textAttrs.push(`font-weight="${fontWeight}"`)
  if (fill !== undefined) textAttrs.push(`fill="${fill}"`)
  if (stroke !== undefined) textAttrs.push(`stroke="${stroke}"`)
  if (strokeWidth !== undefined) textAttrs.push(`stroke-width="${strokeWidth}"`)
  if (strokeOpacity !== undefined) textAttrs.push(`stroke-opacity="${strokeOpacity}"`)
  if (strokeLinejoin !== undefined) textAttrs.push(`stroke-linejoin="${strokeLinejoin}"`)

  // Check if layer has clip mask
  const maskAttr = templateLayer.clip ? ` mask="url(#${templateLayer.clip})"` : ''

  return `<g${maskAttr}>
    <g transform="${transform}">
      <text ${textAttrs.join(' ')}>${escapeXml(text)}</text>
    </g>
  </g>`
}

/**
 * Generate svgImage layer element with complex transforms
 * Uses shared logic from svg-transforms.ts to ensure visual parity with Svg.vue
 */
function generateSvgImageElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string {
  return generateSvgImageHtml(templateLayer, layerData, template)
}

/**
 * Escape XML special characters in text content
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
