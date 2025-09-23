/**
 * SVG Auto-Fit Utilities
 *
 * Utilities for calculating optimal zoom and pan values to fit SVG content
 * within container boundaries with proper margins and scaling
 */

import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import type { SimpleTemplate } from '../types/template-types'

export interface AutoFitResult {
  zoom: number
  panX: number
  panY: number
}

export interface ContainerDimensions {
  width: number
  height: number
}

export interface SvgDimensions {
  width: number
  height: number
  viewBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Calculate optimal fit for SVG content within container
 */
export function calculateOptimalFit(
  svgDimensions: SvgDimensions,
  containerDimensions: ContainerDimensions,
  template?: SimpleTemplate
): AutoFitResult {
  const { AUTO_FIT } = SVG_VIEWER_CONSTANTS

  // Use template viewBox if available, otherwise use SVG dimensions
  const contentWidth = template?.viewBox?.width || svgDimensions.viewBox.width || svgDimensions.width
  const contentHeight = template?.viewBox?.height || svgDimensions.viewBox.height || svgDimensions.height

  // Calculate available space (container minus margins)
  const availableWidth = containerDimensions.width - (AUTO_FIT.MIN_MARGIN * 2)
  const availableHeight = containerDimensions.height - (AUTO_FIT.MIN_MARGIN * 2)

  // Calculate scale to fit both dimensions
  const scaleX = availableWidth / contentWidth
  const scaleY = availableHeight / contentHeight
  const optimalScale = Math.min(scaleX, scaleY)

  // Constrain scale within limits
  const finalScale = Math.max(
    AUTO_FIT.MIN_SCALE,
    Math.min(optimalScale, AUTO_FIT.MAX_SCALE)
  )

  // Calculate centering offsets
  const scaledWidth = contentWidth * finalScale
  const scaledHeight = contentHeight * finalScale

  const panX = (containerDimensions.width - scaledWidth) / 2
  const panY = (containerDimensions.height - scaledHeight) / 2

  return {
    zoom: finalScale,
    panX,
    panY
  }
}

/**
 * Calculate auto-fit for template with element considerations
 */
export function calculateTemplateAutoFit(
  template: SimpleTemplate,
  containerDimensions: ContainerDimensions,
  svgElement?: SVGElement
): AutoFitResult {
  // If we have an SVG element, try to get its actual bounding box
  if (svgElement) {
    try {
      const bbox = svgElement.getBBox()
      if (bbox.width > 0 && bbox.height > 0) {
        return calculateOptimalFit(
          {
            width: bbox.width,
            height: bbox.height,
            viewBox: {
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height
            }
          },
          containerDimensions,
          template
        )
      }
    } catch (error) {
      // Fallback to template viewBox if getBBox fails
    }
  }

  // Fallback to template viewBox
  return calculateOptimalFit(
    {
      width: template.viewBox.width,
      height: template.viewBox.height,
      viewBox: template.viewBox
    },
    containerDimensions,
    template
  )
}

/**
 * Calculate smart zoom level based on content complexity
 */
export function calculateSmartZoom(
  template: SimpleTemplate,
  containerDimensions: ContainerDimensions
): number {
  const baseAutoFit = calculateTemplateAutoFit(template, containerDimensions)

  // For very small templates, ensure minimum readable size
  const minReadableZoom = 0.5

  // For large templates, prevent over-zooming
  const maxComfortableZoom = 2

  return Math.max(
    minReadableZoom,
    Math.min(baseAutoFit.zoom, maxComfortableZoom)
  )
}

/**
 * Get container dimensions from DOM element
 */
export function getContainerDimensions(container: HTMLElement): ContainerDimensions {
  const rect = container.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

/**
 * Get SVG dimensions from SVG element
 */
export function getSvgDimensions(svgElement: SVGElement): SvgDimensions {
  const rect = svgElement.getBoundingClientRect()
  const viewBox = svgElement.viewBox.baseVal

  return {
    width: rect.width,
    height: rect.height,
    viewBox: {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height
    }
  }
}