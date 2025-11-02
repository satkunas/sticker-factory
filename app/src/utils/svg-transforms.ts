/**
 * SVG Transform Utilities
 * ======================
 *
 * Pure TypeScript functions for SVG transform calculations.
 * Extracted from Svg.vue to improve separation of concerns.
 */

import type { Point } from '../types/svg-types'
import type { ProcessedTemplateLayer, FlatLayerData, SimpleTemplate } from '../types/template-types'
import { resolveLayerPosition } from './layer-positioning'

/**
 * Calculate scaled centroid coordinates for SVG images
 * Converts transform origin from viewBox space to template space
 *
 * @param svgContent - SVG content string with viewBox attribute
 * @param templateWidth - Template width in template coordinates
 * @param templateHeight - Template height in template coordinates
 * @param transformOrigin - Transform origin in viewBox coordinates
 * @returns Scaled transform origin in template space
 */
export function calculateScaledTransformOrigin(
  svgContent: string,
  templateWidth: number,
  templateHeight: number,
  transformOrigin: Point
): Point {
  // Extract viewBox from SVG content
  const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']*)["']/i)

  let scaledOriginX = transformOrigin.x
  let scaledOriginY = transformOrigin.y

  if (viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number)
    if (viewBoxValues.length === 4) {
      const [, , viewBoxWidth, viewBoxHeight] = viewBoxValues

      // Calculate scale ratio from viewBox to template dimensions
      const scaleX = templateWidth / viewBoxWidth
      const scaleY = templateHeight / viewBoxHeight

      // Scale transform origin coordinates to template space
      scaledOriginX = transformOrigin.x * scaleX
      scaledOriginY = transformOrigin.y * scaleY
    }
  }

  return { x: scaledOriginX, y: scaledOriginY }
}

/**
 * Sanitize SVG content by removing XML declarations and DOCTYPE
 * User-uploaded SVGs may have these, but they're invalid when embedded
 *
 * @param svgContent - Original SVG content string
 * @returns Sanitized SVG content
 */
export function sanitizeSvgContent(svgContent: string): string {
  if (!svgContent) return ''

  // Remove XML declaration (e.g., <?xml version="1.0" encoding="UTF-8"?>)
  let sanitized = svgContent.replace(/<\?xml[^?]*\?>\s*/gi, '')

  // Remove DOCTYPE declaration (e.g., <!DOCTYPE svg ...>)
  sanitized = sanitized.replace(/<!DOCTYPE[^>]*>\s*/gi, '')

  // Remove XML comments at the start (e.g., <!-- Created with Inkscape -->)
  sanitized = sanitized.replace(/^\s*<!--[\s\S]*?-->\s*/g, '')

  return sanitized.trim()
}

/**
 * Process SVG content to apply rendering attributes
 * Adds width/height, overflow="visible", and styling attributes
 *
 * @param svgContent - Original SVG content string
 * @param templateWidth - Optional width to set on SVG element
 * @param templateHeight - Optional height to set on SVG element
 * @param clipPath - Optional clip-path URL reference
 * @param color - Optional fill color to apply
 * @param strokeColor - Optional stroke color to apply
 * @param strokeWidth - Optional stroke width to apply
 * @returns Processed SVG content with attributes applied
 */
export function applySvgRenderingAttributes(
  svgContent: string,
  templateWidth?: number,
  templateHeight?: number,
  clipPath?: string,
  color?: string,
  strokeColor?: string,
  strokeWidth?: number,
  strokeLinejoin?: string
): string {
  if (!svgContent) return ''

  // First sanitize the content to remove XML declarations
  const sanitized = sanitizeSvgContent(svgContent)

  // Build style attributes to add/replace
  const attributesToSet: Record<string, string> = {
    overflow: 'visible'
  }

  // Add width and height to force scaling to template dimensions
  if (templateWidth !== undefined) {
    attributesToSet.width = templateWidth.toString()
  }
  if (templateHeight !== undefined) {
    attributesToSet.height = templateHeight.toString()
  }

  if (clipPath) {
    attributesToSet['clip-path'] = clipPath
  }
  if (color !== undefined) {
    attributesToSet.fill = color
  }
  if (strokeColor !== undefined) {
    attributesToSet.stroke = strokeColor
  }
  if (strokeWidth !== undefined && strokeWidth > 0) {
    attributesToSet['stroke-width'] = strokeWidth.toString()
  }
  if (strokeLinejoin !== undefined) {
    attributesToSet['stroke-linejoin'] = strokeLinejoin
  }

  // Process the SVG element (use sanitized content)
  const processed = sanitized.replace(
    /<svg([^>]*)>/i,
    (match, attrs) => {
      let updatedAttrs = attrs

      // Remove existing width and height attributes
      updatedAttrs = updatedAttrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
      updatedAttrs = updatedAttrs.replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')

      // Add/replace our attributes
      Object.entries(attributesToSet).forEach(([key, value]) => {
        // Remove existing attribute if present
        const attrRegex = new RegExp(`\\s+${key}\\s*=\\s*["'][^"']*["']`, 'gi')
        updatedAttrs = updatedAttrs.replace(attrRegex, '')
        // Add new attribute
        updatedAttrs += ` ${key}="${value}"`
      })

      return `<svg${updatedAttrs}>`
    }
  )

  return processed
}

/**
 * Calculate transform structure for svgImage layers
 * Centralizes the decision logic for which transform case to use
 * Returns a structure that both Svg.vue and svg-string-generator.ts can use
 *
 * @param layerData - User-provided layer data (overrides)
 * @returns Transform case identifier and relevant data
 */
export function getSvgImageTransformCase(layerData: FlatLayerData | undefined): {
  case: 'scale-with-origin' | 'scale-and-rotation' | 'scale-only' | 'rotation-only' | 'none'
  scale?: number
  rotation?: number
  transformOrigin?: Point
} {
  // Complex transforms: scale and/or rotation with transform origin
  // Treat undefined scale as 1 (100%) when rotation is present
  if (layerData?.transformOrigin && (layerData?.scale !== undefined || layerData?.rotation !== undefined)) {
    return {
      case: 'scale-with-origin',
      scale: layerData.scale !== undefined ? layerData.scale : 1, // Default to 1 (100%) if undefined
      rotation: layerData.rotation,
      transformOrigin: layerData.transformOrigin
    }
  }

  // Scale AND rotation (without transform origin)
  if (layerData?.scale !== undefined && layerData?.rotation !== undefined) {
    return {
      case: 'scale-and-rotation',
      scale: layerData.scale,
      rotation: layerData.rotation
    }
  }

  // Scale only (without transform origin or rotation)
  if (layerData?.scale !== undefined) {
    return {
      case: 'scale-only',
      scale: layerData.scale
    }
  }

  // Rotation only (no scale, no transform origin)
  if (layerData?.rotation !== undefined) {
    return {
      case: 'rotation-only',
      rotation: layerData.rotation
    }
  }

  // No transforms
  return { case: 'none' }
}

/**
 * Generate complete svgImage layer HTML with transforms
 * Used by svg-string-generator.ts for .svg URL generation
 * Ensures visual parity with Svg.vue component
 *
 * @param templateLayer - Template layer definition
 * @param layerData - User-provided layer data (overrides)
 * @param template - Template definition (for dimensions)
 * @returns Complete HTML string for svgImage layer with mask and transforms
 */
export function generateSvgImageHtml(
  templateLayer: ProcessedTemplateLayer,
  layerData: FlatLayerData | undefined,
  template: SimpleTemplate
): string {
  const x = resolveLayerPosition(templateLayer.position?.x, template.width)
  const y = resolveLayerPosition(templateLayer.position?.y, template.height)

  const svgContent = layerData?.svgContent || templateLayer.svgContent
  if (!svgContent) return ''

  const width = templateLayer.width
  const height = templateLayer.height

  // Apply rendering attributes to SVG content
  // Fallback to template defaults when layer data doesn't provide override
  const processedSvg = applySvgRenderingAttributes(
    svgContent,
    width,
    height,
    undefined,
    layerData?.color ?? templateLayer.color,
    layerData?.strokeColor ?? templateLayer.strokeColor,
    layerData?.strokeWidth ?? templateLayer.strokeWidth,
    layerData?.strokeLinejoin ?? templateLayer.strokeLinejoin
  )

  // Check if layer has clip mask
  const maskAttr = templateLayer.clip ? ` mask="url(#${templateLayer.clip})"` : ''

  // Base transform: translate to position, then center the SVG
  const baseTransform = `translate(${x}, ${y}) translate(${-width / 2}, ${-height / 2})`

  // Get transform case using shared logic
  const transformCase = getSvgImageTransformCase(layerData)

  switch (transformCase.case) {
    case 'scale-with-origin': {
      const origin = calculateScaledTransformOrigin(
        svgContent,
        width,
        height,
        transformCase.transformOrigin!
      )

      const rotation = transformCase.rotation !== undefined ? ` rotate(${transformCase.rotation})` : ''

      return `<g${maskAttr}>
    <g transform="${baseTransform}">
      <g transform="translate(${origin.x}, ${origin.y})">
        <g transform="scale(${transformCase.scale})${rotation}">
          <g transform="translate(${-origin.x}, ${-origin.y})">
            ${processedSvg}
          </g>
        </g>
      </g>
    </g>
  </g>`
    }

    case 'scale-and-rotation':
      return `<g${maskAttr}>
    <g transform="${baseTransform}">
      <g transform="scale(${transformCase.scale}) rotate(${transformCase.rotation})">
        ${processedSvg}
      </g>
    </g>
  </g>`

    case 'scale-only':
      return `<g${maskAttr}>
    <g transform="${baseTransform}">
      <g transform="scale(${transformCase.scale})">
        ${processedSvg}
      </g>
    </g>
  </g>`

    case 'rotation-only':
      return `<g${maskAttr}>
    <g transform="${baseTransform}">
      <g transform="rotate(${transformCase.rotation})">
        ${processedSvg}
      </g>
    </g>
  </g>`

    case 'none':
    default:
      return `<g${maskAttr}>
    <g transform="${baseTransform}">
      ${processedSvg}
    </g>
  </g>`
  }
}
