/**
 * Layer Renderer Factory Functions
 *
 * Create render-ready layer data with center-based positioning
 */

import type {
  ProcessedTemplateLayer,
  SimpleTemplate,
  FlatLayerData
} from '../types/template-types'
import { resolveLayerPosition } from './layer-positioning'

export interface RenderedShapeLayer {
  id: string
  type: 'shape'
  transform: string
  path: string
  fill: string
  stroke: string
  strokeWidth: number
  strokeLinejoin?: string
}

export interface RenderedTextLayer {
  id: string
  type: 'text'
  clipPath?: string
  transform: string
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fill: string
  stroke?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string
}

export interface RenderedSvgImageLayer {
  id: string
  type: 'svgImage'
  clipPath?: string
  transform: string
  scaleTransform?: string
  svgContent: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export type RenderedLayer = RenderedShapeLayer | RenderedTextLayer | RenderedSvgImageLayer

/**
 * Create shape renderer with center-based positioning
 */
export function createShapeRenderer(
  layer: ProcessedTemplateLayer,
  formData: FlatLayerData | undefined,
  template: SimpleTemplate
): RenderedShapeLayer | null {
  if (layer.type !== 'shape' || !layer.shape) return null

  const posX = resolveLayerPosition(
    (layer as any).position?.x,
    template.width
  )
  const posY = resolveLayerPosition(
    (layer as any).position?.y,
    template.height
  )

  return {
    id: layer.id,
    type: 'shape',
    transform: `translate(${posX}, ${posY})`,
    path: layer.shape.path,
    fill: formData?.fillColor ?? formData?.fill ?? layer.shape.fill ?? '',
    stroke: formData?.strokeColor ?? formData?.stroke ?? layer.shape.stroke ?? '',
    strokeWidth: formData?.strokeWidth ?? layer.shape.strokeWidth ?? 0,
    strokeLinejoin: formData?.strokeLinejoin
  }
}

/**
 * Create text renderer with center-based positioning
 */
export function createTextRenderer(
  layer: ProcessedTemplateLayer,
  formData: FlatLayerData | undefined,
  template: SimpleTemplate
): RenderedTextLayer | null {
  if (layer.type !== 'text' || !layer.textInput) return null

  const posX = resolveLayerPosition(
    layer.textInput.position.x,
    template.width
  )
  const posY = resolveLayerPosition(
    layer.textInput.position.y,
    template.height
  )

  const rotation = layer.textInput.rotation !== undefined
    ? ` rotate(${layer.textInput.rotation})`
    : ''

  return {
    id: layer.id,
    type: 'text',
    clipPath: layer.textInput.clip ? `url(#${layer.textInput.clip})` : undefined,
    transform: `translate(${posX}, ${posY})${rotation}`,
    text: formData?.text ?? layer.textInput.default ?? '',
    fontFamily: formData?.fontFamily ?? layer.textInput.fontFamily ?? '',
    fontSize: formData?.fontSize ?? layer.textInput.fontSize ?? 16,
    fontWeight: formData?.fontWeight ?? layer.textInput.fontWeight ?? 400,
    fill: formData?.fontColor ?? formData?.textColor ?? layer.textInput.fontColor ?? '',
    stroke: formData?.strokeWidth !== undefined && formData.strokeWidth > 0
      ? (formData?.strokeColor ?? layer.textInput.strokeColor)
      : undefined,
    strokeWidth: formData?.strokeWidth !== undefined && formData.strokeWidth > 0
      ? formData.strokeWidth
      : undefined,
    strokeOpacity: formData?.strokeOpacity,
    strokeLinejoin: formData?.strokeLinejoin
  }
}

/**
 * Create SVG image renderer with center-based positioning and double transform
 */
export function createSvgImageRenderer(
  layer: ProcessedTemplateLayer,
  formData: FlatLayerData | undefined,
  template: SimpleTemplate
): RenderedSvgImageLayer | null {
  if (layer.type !== 'svgImage' || !layer.svgImage) return null

  const posX = resolveLayerPosition(
    layer.svgImage.position.x,
    template.width
  )
  const posY = resolveLayerPosition(
    layer.svgImage.position.y,
    template.height
  )

  const rotation = formData?.rotation !== undefined
    ? ` rotate(${formData.rotation})`
    : ''

  const scaleTransform = formData?.scale !== undefined
    ? `scale(${formData.scale})`
    : undefined

  return {
    id: layer.id,
    type: 'svgImage',
    clipPath: layer.svgImage.clip ? `url(#${layer.svgImage.clip})` : undefined,
    transform: `translate(${posX}, ${posY})${rotation}`,
    scaleTransform,
    svgContent: formData?.svgContent ?? layer.svgImage.svgContent,
    fill: formData?.color ?? layer.svgImage.fill,
    stroke: formData?.strokeColor ?? layer.svgImage.stroke,
    strokeWidth: formData?.strokeWidth ?? layer.svgImage.strokeWidth
  }
}