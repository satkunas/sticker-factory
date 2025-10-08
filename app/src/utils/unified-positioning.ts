/**
 * Unified positioning system for all layer types
 * Pure functions without Vue reactivity - only raw calculations
 */

import { resolveCoordinate } from './svg'
import type { FlatLayerData } from '../types/template-types'

/**
 * Layer position data structure
 */
export interface LayerPosition {
  x: number | string
  y: number | string
}

/**
 * ViewBox dimensions for coordinate resolution
 */
export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Unified layer transform data
 */
export interface LayerTransform {
  translate?: { x: number; y: number }
  scale?: number
  rotation?: number
}

/**
 * Calculate unified position transform for any layer type
 * This is the single code path for all positioning
 * Includes viewBox centering that was previously done by wrapper transform
 * For svgImage type, includes additional centering offset
 */
export function calculateLayerTransform(
  position: LayerPosition | undefined,
  viewBox: ViewBox | undefined,
  scale?: number,
  rotation?: number,
  layerType?: string,
  width?: number,
  height?: number,
  contentDimensions?: { width: number; height: number }
): string {
  const transforms: string[] = []

  // Step 1: Center the viewBox within the content area (replaces wrapper centeringTransform)
  // This was previously done by the wrapper transform in SvgContentLayer
  if (viewBox && contentDimensions) {
    // Calculate template center point
    const templateCenterX = viewBox.x + viewBox.width / 2
    const templateCenterY = viewBox.y + viewBox.height / 2

    // Calculate content center point (default content is 1.5x viewBox size)
    const contentCenterX = contentDimensions.width / 2
    const contentCenterY = contentDimensions.height / 2

    // Translation to center template in content area
    const centeringX = contentCenterX - templateCenterX
    const centeringY = contentCenterY - templateCenterY

    if (isFinite(centeringX) && isFinite(centeringY)) {
      transforms.push(`translate(${centeringX}, ${centeringY})`)
    }
  }

  // Step 2: Position translation within viewBox coordinates
  if (position && viewBox) {
    const x = resolveCoordinate(position.x, viewBox.width, viewBox.x)
    const y = resolveCoordinate(position.y, viewBox.height, viewBox.y)

    if (isFinite(x) && isFinite(y)) {
      transforms.push(`translate(${x}, ${y})`)
    }
  }

  // Step 3: Center offset for SVG images (they render from top-left, not center)
  if (layerType === 'svgImage' && width && height) {
    transforms.push(`translate(${-width / 2}, ${-height / 2})`)
  }

  // Step 4: Scale (if provided)
  if (scale !== undefined && scale !== 1 && isFinite(scale)) {
    transforms.push(`scale(${scale})`)
  }

  // Step 5: Rotation (if provided)
  if (rotation !== undefined && rotation !== 0 && isFinite(rotation)) {
    transforms.push(`rotate(${rotation})`)
  }

  return transforms.join(' ')
}

/**
 * Generate shape path centered at origin (for transform-based positioning)
 */
export function generateCenteredShapePath(
  subtype: string,
  width: number,
  height: number,
  rx?: number,
  ry?: number,
  points?: string
): string {
  switch (subtype) {
    case 'circle': {
      const radius = Math.min(width, height) / 2
      // Circle centered at origin
      return `M-${radius},0 A${radius},${radius} 0 1,1 ${radius},0 A${radius},${radius} 0 1,1 -${radius},0 Z`
    }

    case 'rect': {
      const halfWidth = width / 2
      const halfHeight = height / 2

      // Rectangle with optional rounded corners, centered at origin
      if (rx !== undefined || ry !== undefined) {
        // SVG spec: if one radius is missing, use the other one's value (no hardcoded fallbacks)
        const radiusX = rx !== undefined ? rx : ry as number
        const radiusY = ry !== undefined ? ry : rx as number
        return `M${-halfWidth + radiusX},-${halfHeight} L${halfWidth - radiusX},-${halfHeight} Q${halfWidth},-${halfHeight} ${halfWidth},${-halfHeight + radiusY} L${halfWidth},${halfHeight - radiusY} Q${halfWidth},${halfHeight} ${halfWidth - radiusX},${halfHeight} L${-halfWidth + radiusX},${halfHeight} Q-${halfWidth},${halfHeight} -${halfWidth},${halfHeight - radiusY} L-${halfWidth},${-halfHeight + radiusY} Q-${halfWidth},-${halfHeight} ${-halfWidth + radiusX},-${halfHeight} Z`
      }

      // Simple rectangle centered at origin
      return `M-${halfWidth},-${halfHeight} L${halfWidth},-${halfHeight} L${halfWidth},${halfHeight} L-${halfWidth},${halfHeight} Z`
    }

    case 'ellipse': {
      const rx = width / 2
      const ry = height / 2
      // Ellipse centered at origin
      return `M-${rx},0 A${rx},${ry} 0 1,1 ${rx},0 A${rx},${ry} 0 1,1 -${rx},0 Z`
    }

    case 'polygon': {
      // Use provided points or empty path
      return points || ''
    }

    default:
      return ''
  }
}

/**
 * Process any layer type to get its render properties
 * This is the unified processing function for all types
 */
export interface ProcessedLayer {
  id: string
  type: 'text' | 'shape' | 'svgImage'
  transform: string
  // Shape-specific
  path?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeLinejoin?: string
  // Text-specific
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  fontColor?: string
  // SVG Image-specific
  svgContent?: string
  svgImageScale?: number
  svgImageRotation?: number
  width?: number
  height?: number
}

/**
 * Process a layer for rendering with unified positioning
 */
export function processLayerForRendering(
  layer: FlatLayerData,
  viewBox: ViewBox | undefined,
  contentDimensions?: { width: number; height: number }
): ProcessedLayer {
  const processed: ProcessedLayer = {
    id: layer.id,
    type: layer.type,
    transform: ''
  }

  // Calculate content dimensions if not provided (1.5x viewBox size by default)
  const effectiveContentDims = contentDimensions || (viewBox ? {
    width: viewBox.width * 1.5,
    height: viewBox.height * 1.5
  } : undefined)

  // Calculate unified transform for all types
  processed.transform = calculateLayerTransform(
    layer.position,
    viewBox,
    layer.scale,
    layer.rotation,
    layer.type,
    layer.width,
    layer.height,
    effectiveContentDims
  )

  // Add type-specific properties
  switch (layer.type) {
    case 'shape':
      // Generate path centered at origin for transform-based positioning
      // Only generate path if width and height are defined (no hardcoded fallbacks)
      if (layer.width !== undefined && layer.height !== undefined) {
        processed.path = generateCenteredShapePath(
          layer.subtype,
          layer.width,
          layer.height,
          layer.rx,
          layer.ry,
          layer.points
        )
      } else {
        processed.path = ''
      }
      processed.fill = layer.fill || layer.fillColor
      processed.stroke = layer.stroke || layer.strokeColor
      processed.strokeWidth = layer.strokeWidth
      processed.strokeLinejoin = layer.strokeLinejoin
      break

    case 'text':
      processed.text = layer.text
      processed.fontFamily = layer.fontFamily
      processed.fontSize = layer.fontSize
      processed.fontWeight = layer.fontWeight
      processed.fontColor = layer.fontColor || layer.fill
      // Text might need stroke too
      if (layer.strokeWidth && layer.strokeWidth > 0) {
        processed.stroke = layer.strokeColor || layer.stroke
        processed.strokeWidth = layer.strokeWidth
      }
      break

    case 'svgImage':
      processed.svgContent = layer.svgContent
      processed.svgImageScale = layer.scale
      processed.svgImageRotation = layer.rotation
      processed.width = layer.width
      processed.height = layer.height
      break
  }

  return processed
}

/**
 * Check if all required positioning data is available
 */
export function hasValidPosition(layer: FlatLayerData, viewBox: ViewBox | undefined): boolean {
  return !!(
    layer &&
    layer.position &&
    layer.position.x !== undefined &&
    layer.position.y !== undefined &&
    viewBox &&
    viewBox.width > 0 &&
    viewBox.height > 0
  )
}