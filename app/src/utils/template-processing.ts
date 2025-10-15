/**
 * Shared Template Processing Utilities
 * =====================================
 *
 * Core template processing logic shared between main app and Service Worker.
 * Extracts shape→path conversion and coordinate resolution logic.
 */

import { resolvePosition, resolveLinePosition, type ViewBox } from './svg'
import type {
  TemplateShapeLayer,
  ProcessedTemplateLayer,
  YamlTemplate
} from '../types/template-types'
import {
  DEFAULT_VIEWBOX_WIDTH,
  DEFAULT_VIEWBOX_HEIGHT
} from '../config/constants'

/**
 * Convert YAML template layers to processed template layers
 * Works in both main app and Service Worker contexts
 *
 * @param yamlTemplate - Raw YAML template
 * @param svgContentLoader - Optional function to load SVG content (not available in SW)
 * @returns Array of processed template layers
 */
export async function processTemplateLayers(
  yamlTemplate: YamlTemplate,
  svgContentLoader?: (svgId: string) => Promise<string | null>
): Promise<ProcessedTemplateLayer[]> {
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

  const layers: ProcessedTemplateLayer[] = []

  // Process all layers
  for (const layer of yamlTemplate.layers) {
    if (layer.type === 'shape') {
      layers.push(processShapeLayer(layer, viewBox))
    } else if (layer.type === 'text') {
      layers.push(processTextLayer(layer, viewBox))
    } else if (layer.type === 'svgImage') {
      layers.push(await processSvgImageLayer(layer, viewBox, svgContentLoader))
    }
  }

  return layers
}

/**
 * Process shape layer: resolve coordinates, convert to path
 */
function processShapeLayer(
  layer: TemplateShapeLayer,
  viewBox: ViewBox
): ProcessedTemplateLayer {
  const {
    id, subtype, position, width, height, rx, ry, points,
    fill, stroke, strokeWidth, strokeLinejoin, opacity,
    rotation, scale, clip, clipPath,
    ...otherProps
  } = layer

  // Resolve percentage coordinates
  const resolvedPosition = resolvePosition(
    position as { x: number | string; y: number | string },
    viewBox
  )

  // Convert shape to SVG path
  const path = convertShapeLayerToPath(layer, viewBox)

  return {
    id,
    type: 'shape',
    subtype,
    position: resolvedPosition,
    width,
    height,
    rx,
    ry,
    points,
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin,
    opacity,
    ...(rotation !== undefined && { rotation }),
    ...(scale !== undefined && { scale }),
    ...(clip !== undefined && { clip }),
    ...(clipPath !== undefined && { clipPath }),
    path,
    ...otherProps
  } as ProcessedTemplateLayer
}

/**
 * Process text layer: resolve coordinates
 */
function processTextLayer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layer: any,
  viewBox: ViewBox
): ProcessedTemplateLayer {
  const {
    id, position, label, placeholder,
    fontFamily, fontColor, fontSize, fontWeight, maxLength,
    rotation, clip, clipPath, opacity,
    default: defaultText,
    ...otherProps
  } = layer

  // Resolve percentage coordinates
  const resolvedPosition = resolvePosition(
    position as { x: number | string; y: number | string },
    viewBox
  )

  return {
    id,
    type: 'text',
    position: resolvedPosition,
    text: defaultText,
    label,
    placeholder,
    maxLength,
    fontFamily,
    fontColor,
    fontSize,
    fontWeight,
    ...(rotation !== undefined && { rotation }),
    ...(clip !== undefined && { clip }),
    ...(clipPath !== undefined && { clipPath }),
    ...(opacity !== undefined && { opacity }),
    ...otherProps
  } as ProcessedTemplateLayer
}

/**
 * Process SVG image layer: preserve position strings, optionally load content
 */
async function processSvgImageLayer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layer: any,
  viewBox: ViewBox,
  svgContentLoader?: (svgId: string) => Promise<string | null>
): Promise<ProcessedTemplateLayer> {
  const {
    id, position, width, height,
    fill, stroke, strokeWidth, strokeLinejoin, opacity,
    scale, rotation, clip, clipPath,
    svgId, svgContent: layerSvgContent,
    ...otherProps
  } = layer

  // Preserve original position strings for center-based positioning
  const originalPosition = position as { x: number | string; y: number | string }

  // Load SVG content if loader provided and content not already present
  let svgContent = layerSvgContent || ''
  if (svgId && !svgContent && svgContentLoader) {
    svgContent = await svgContentLoader(svgId) || ''
  }

  return {
    id,
    type: 'svgImage',
    position: originalPosition,
    svgImageId: svgId,
    svgContent,
    width,
    height,
    color: fill,
    stroke,
    strokeWidth,
    strokeLinejoin,
    opacity,
    ...(scale !== undefined && { scale }),
    ...(rotation !== undefined && { rotation }),
    ...(clip !== undefined && { clip }),
    ...(clipPath !== undefined && { clipPath }),
    ...otherProps
  } as ProcessedTemplateLayer
}

/**
 * Convert shape layer to SVG path
 * Handles path, rect, circle, ellipse, polygon, line subtypes
 * For path subtype, preserves the original path data (used for textPath references)
 */
export function convertShapeLayerToPath(
  layer: TemplateShapeLayer,
  viewBox: ViewBox
): string {
  // Handle path subtype - use the path as-is (for textPath references)
  if (layer.subtype === 'path') {
    // Access path using runtime structure (differs from TypeScript types)
    const pathData = (layer as unknown as { path?: string }).path
    return pathData || ''
  }

  if (layer.subtype === 'line') {
    const linePos = layer.position as { x1: number | string; y1: number | string; x2: number | string; y2: number | string }
    const resolvedPos = resolveLinePosition(linePos, viewBox)
    return `M${resolvedPos.x1},${resolvedPos.y1} L${resolvedPos.x2},${resolvedPos.y2}`
  }

  const pos = resolvePosition(layer.position as { x: number | string; y: number | string }, viewBox)

  switch (layer.subtype) {
    case 'rect': {
      if (!layer.width || !layer.height) return ''

      const width = layer.width
      const height = layer.height
      const rx = layer.rx
      const ry = layer.ry
      const x = pos.x - width/2
      const y = pos.y - height/2

      if (rx && ry && (rx > 0 || ry > 0)) {
        return `M${x + rx},${y} L${x + width - rx},${y} Q${x + width},${y} ${x + width},${y + ry} L${x + width},${y + height - ry} Q${x + width},${y + height} ${x + width - rx},${y + height} L${x + rx},${y + height} Q${x},${y + height} ${x},${y + height - ry} L${x},${y + ry} Q${x},${y} ${x + rx},${y} Z`
      } else {
        return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`
      }
    }

    case 'circle': {
      if (!layer.width) return ''
      const radius = layer.width / 2
      return `M${pos.x - radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x + radius},${pos.y} A${radius},${radius} 0 1,0 ${pos.x - radius},${pos.y} Z`
    }

    case 'ellipse': {
      if (!layer.width || !layer.height) return ''
      const rWidth = layer.width / 2
      const rHeight = layer.height / 2
      return `M${pos.x - rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x + rWidth},${pos.y} A${rWidth},${rHeight} 0 1,0 ${pos.x - rWidth},${pos.y} Z`
    }

    case 'polygon': {
      if (layer.points) {
        // Points are absolute coordinates within viewBox
        const pointPairs = layer.points.split(' ')
        const absolutePoints = pointPairs.map(pair => {
          const [x, y] = pair.split(',').map(Number)
          return `${x},${y}`
        })
        return `M${absolutePoints.join(' L')} Z`
      }
      return ''
    }

    default: {
      // Unknown subtype - no default shape
      return ''
    }
  }
}
