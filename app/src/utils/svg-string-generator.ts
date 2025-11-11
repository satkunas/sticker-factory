/**
 * Unified SVG String Generator
 * ============================
 *
 * Generates SVG strings from template data, reusing existing utilities.
 * Used by main app for downloads, template previews, and exports.
 * Ensures visual parity with Svg.vue component.
 */

import type { SimpleTemplate, FlatLayerData, ProcessedTemplateLayer } from '../types/template-types'
import { resolveLayerPosition } from './layer-positioning'
import { generateMaskDefinitions, generateTextPathDefinitions } from './mask-utils'
import {
  generateSvgImageHtml
} from './svg-transforms'
import { extractFontFamily } from './font-utils'
import { splitLines, calculateLineDy } from './text-multiline'
import { DEFAULT_LINE_HEIGHT, DEFAULT_FONT_SIZE } from './ui-constants'

/**
 * Generate complete SVG string from template and layer data
 * Matches the exact rendering logic of Svg.vue component
 * Includes Google Fonts imports for standalone SVG viewing
 *
 * @param template - Template definition with layers
 * @param layers - Layer data to render
 * @returns Complete SVG string
 */
export function generateSvgString(
  template: SimpleTemplate,
  layers: FlatLayerData[]
): string {
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

  // PHASE 2: Generate font imports for Google Fonts
  const fontImports = Array.from(fontFamilies).map(family => {
    const encodedFamily = family.replace(/ /g, '+')
    return `@import url('https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;600;700&amp;display=swap');`
  }).join('\n    ')

  // PHASE 3: Generate mask definitions
  const maskDefs = generateMaskDefinitions(template.layers, width, height)

  // PHASE 3.5: Generate textPath path definitions
  const textPathDefs = generateTextPathDefinitions(template.layers)

  // PHASE 4: Build defs section with fonts, masks, and textPath paths
  const defsSection = (fontImports || maskDefs.length > 0 || textPathDefs.length > 0)
    ? `  <defs>\n${fontImports ? `    <style>\n      ${fontImports}\n    </style>\n` : ''}${maskDefs.length > 0 ? `${maskDefs.map(mask =>
      `    <mask id="${mask.id}">
      <path d="${mask.path}" fill="white" />
    </mask>`
    ).join('\n')  }\n` : ''}${textPathDefs.length > 0 ? `${textPathDefs.map(pathDef =>
      `    <path id="${pathDef.id}" d="${pathDef.pathData}" />`
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
 * Renders all shapes including path layers with visual styling
 */
function generateShapeElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined
): string {
  const path = (templateLayer as unknown as { path?: string }).path
  if (!path) return ''

  // Use normalized property names (fillColor, strokeColor)
  const fill = layerData?.fillColor ?? templateLayer.fillColor
  const stroke = layerData?.strokeColor ?? templateLayer.strokeColor
  const strokeWidth = layerData?.strokeWidth ?? templateLayer.strokeWidth
  const strokeLinejoin = layerData?.strokeLinejoin

  // Skip path layers with no visual styling (reference-only paths for textPath)
  // Treat "none" the same as undefined - both mean "don't render this visual property"
  const hasFill = fill !== undefined && fill !== 'none'
  const hasStroke = stroke !== undefined && stroke !== 'none'
  if (!hasFill && !hasStroke) return ''

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
 * Supports both regular text and textPath (curved text along paths)
 */
function generateTextElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string {
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

  // Check if this text uses textPath (curved text along a path) or multiline
  const flatLayer = templateLayer as unknown as FlatLayerData
  const textPath = flatLayer.textPath
  const multiline = flatLayer.multiline

  // Build text attributes
  const textAttrs: string[] = []
  // Remove any existing quotes from fontFamily to prevent double-quoting
  if (fontFamily !== undefined) {
    const cleanFontFamily = fontFamily.replace(/^["']|["']$/g, '')
    textAttrs.push(`font-family="${cleanFontFamily}"`)
  }
  if (fontSize !== undefined) textAttrs.push(`font-size="${fontSize}"`)
  if (fontWeight !== undefined) textAttrs.push(`font-weight="${fontWeight}"`)
  if (fill !== undefined) textAttrs.push(`fill="${fill}"`)
  if (stroke !== undefined) textAttrs.push(`stroke="${stroke}"`)
  if (strokeWidth !== undefined) textAttrs.push(`stroke-width="${strokeWidth}"`)
  if (strokeOpacity !== undefined) textAttrs.push(`stroke-opacity="${strokeOpacity}"`)
  if (strokeLinejoin !== undefined) textAttrs.push(`stroke-linejoin="${strokeLinejoin}"`)

  // Check if layer has clip mask
  const maskAttr = templateLayer.clip ? ` mask="url(#${templateLayer.clip})"` : ''

  // TEXT WITH TEXTPATH (curved text along a path)
  if (textPath) {
    const startOffset = layerData?.startOffset ?? flatLayer.startOffset ?? '50%'
    const dy = layerData?.dy ?? flatLayer.dy
    const dominantBaseline = layerData?.dominantBaseline ?? flatLayer.dominantBaseline

    const textPathTextAttrs = [
      'text-anchor="middle"',
      ...textAttrs
    ]
    if (dominantBaseline !== undefined) {
      textPathTextAttrs.push(`dominant-baseline="${dominantBaseline}"`)
    }

    return `<g${maskAttr}>
    <text ${textPathTextAttrs.join(' ')}>
      <textPath href="#${textPath}" startOffset="${startOffset}">
        ${dy !== undefined ? `<tspan dy="${dy}">` : ''}${escapeXml(text)}${dy !== undefined ? `</tspan>` : ''}
      </textPath>
    </text>
  </g>`
  }

  // MULTI-LINE TEXT (tspan-based line breaks)
  if (multiline && !textPath) {
    const lines = splitLines(text)
    const lineHeight = layerData?.lineHeight ?? flatLayer.lineHeight ?? DEFAULT_LINE_HEIGHT

    const x = resolveLayerPosition(layerData?.position?.x ?? templateLayer.position?.x, template.width)
    const y = resolveLayerPosition(layerData?.position?.y ?? templateLayer.position?.y, template.height)
    const rotation = layerData?.rotation ?? templateLayer.rotation

    let transform = `translate(${x}, ${y})`
    if (rotation !== undefined) {
      transform += ` rotate(${rotation})`
    }

    const tspans = lines.map((line, i) => {
      const dy = calculateLineDy(i, lines.length, fontSize ?? DEFAULT_FONT_SIZE, lineHeight)
      return `<tspan x="0" dy="${dy}">${escapeXml(line)}</tspan>`
    }).join('\n        ')

    const multilineTextAttrs = [
      'text-anchor="middle"',
      'dominant-baseline="central"',
      ...textAttrs
    ]

    return `<g${maskAttr}>
    <g transform="${transform}">
      <text ${multilineTextAttrs.join(' ')}>
        ${tspans}
      </text>
    </g>
  </g>`
  }

  // REGULAR TEXT (single-line with transform positioning)
  const x = resolveLayerPosition(layerData?.position?.x ?? templateLayer.position?.x, template.width)
  const y = resolveLayerPosition(layerData?.position?.y ?? templateLayer.position?.y, template.height)
  const rotation = layerData?.rotation ?? templateLayer.rotation

  // Build transform
  let transform = `translate(${x}, ${y})`
  if (rotation !== undefined) {
    transform += ` rotate(${rotation})`
  }

  const regularTextAttrs = [
    'text-anchor="middle"',
    'dominant-baseline="central"',
    ...textAttrs
  ]

  return `<g${maskAttr}>
    <g transform="${transform}">
      <text ${regularTextAttrs.join(' ')}>${escapeXml(text)}</text>
    </g>
  </g>`
}

/**
 * Generate svgImage layer element with complex transforms
 * Uses shared logic from svg-transforms.ts to ensure visual parity with Svg.vue
 *
 * NOTE: Caller is responsible for enhancing layers with user SVG content
 * (see layer-enhancement.ts). This function remains pure and store-agnostic.
 */
function generateSvgImageElement(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string {
  // Simple fallback: use layerData.svgContent if present, otherwise templateLayer.svgContent
  // Caller (DownloadModal, Service Worker) pre-populates svgContent for user uploads
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
