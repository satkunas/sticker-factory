/**
 * Zoom and Pan Composable
 *
 * Handles zoom level and pan offset state management for SVG viewers
 * with wheel handling and auto-fit functionality
 */

import { ref, computed, nextTick, type Ref } from 'vue'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import {
  calculateZoomLevel,
  calculateOptimalScale,
  constrainValue,
  extractWheelData,
  SVG_CONSTANTS,
  type Size
} from '../utils/svg'
import type { SimpleTemplate } from '../types/template-types'
import { logger } from '../utils/logger'

export interface ZoomPanState {
  zoomLevel: Ref<number>
  panX: Ref<number>
  panY: Ref<number>
}

export interface ZoomPanControls {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setZoom: (level: number) => void
  setPan: (x: number, y: number) => void
  resetPan: () => void
  handleWheel: (e: WheelEvent) => void
  autoFitTemplate: (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    svgElement: SVGElement
  ) => Promise<void>
  altAutoFit: (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    svgElement: SVGElement
  ) => Promise<void>
}

export function useZoomPan(previewMode: Ref<boolean>) {
  // State
  const zoomLevel = ref<number>(SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.DEFAULT)
  const panX = ref<number>(0)
  const panY = ref<number>(0)

  // Computed properties
  const transformString = computed(() => {
    if (previewMode.value) return ''
    return `translate(${panX.value}px, ${panY.value}px) scale(${zoomLevel.value})`
  })

  const canZoomIn = computed(() =>
    zoomLevel.value < SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX
  )

  const canZoomOut = computed(() =>
    zoomLevel.value > SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN
  )

  const zoomPercentage = computed(() =>
    Math.round(zoomLevel.value * 100)
  )

  // Controls
  const zoomIn = () => {
    if (canZoomIn.value) {
      zoomLevel.value = Math.min(
        zoomLevel.value + SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.STEP,
        SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX
      )
    }
  }

  const zoomOut = () => {
    if (canZoomOut.value) {
      zoomLevel.value = Math.max(
        zoomLevel.value - SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.STEP,
        SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN
      )
    }
  }

  const resetZoom = () => {
    zoomLevel.value = SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.DEFAULT
  }

  const setZoom = (level: number) => {
    zoomLevel.value = Math.max(
      SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN,
      Math.min(level, SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX)
    )
  }

  const setPan = (x: number, y: number) => {
    panX.value = x
    panY.value = y
  }

  const resetPan = () => {
    panX.value = 0
    panY.value = 0
  }

  // Enhanced wheel zoom with trackpad support using SVG utilities
  const handleWheel = (e: WheelEvent) => {
    if (previewMode.value) return

    e.preventDefault()
    e.stopPropagation()

    // Extract wheel data using SVG utilities
    const wheelData = extractWheelData(e)

    // Calculate new zoom level using SVG utilities
    if (wheelData.isTrackpad) {
      zoomLevel.value = constrainValue(
        zoomLevel.value * wheelData.scaleFactor,
        SVG_CONSTANTS.MIN_ZOOM,
        SVG_CONSTANTS.MAX_ZOOM
      )
    } else {
      const direction = wheelData.deltaY > 0 ? -1 : 1
      zoomLevel.value = calculateZoomLevel(zoomLevel.value, direction, false)
    }
  }

  // Auto-fit function to scale template to fit the container
  const autoFitTemplate = async (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    _svgElement: SVGElement
  ) => {
    if (previewMode.value || !containerElement || !template) {
      return
    }

    await nextTick() // Wait for DOM updates

    const containerRect = containerElement.getBoundingClientRect()
    const availableWidth = containerRect.width - 120 // Account for controls and padding
    const availableHeight = containerRect.height - 120 // Account for controls and padding

    // Get the template viewBox dimensions (this is the "natural" size of the content)
    const templateWidth = template.viewBox.width
    const templateHeight = template.viewBox.height

    logger.debug('Size calculation info:', {
      containerSize: { width: containerRect.width, height: containerRect.height },
      availableSize: { width: availableWidth, height: availableHeight },
      templateSize: { width: templateWidth, height: templateHeight }
    })

    // Calculate scale to fit both dimensions with some padding using SVG utilities
    const contentSize: Size = { width: templateWidth, height: templateHeight }
    const containerSize: Size = { width: availableWidth, height: availableHeight }
    const optimalScale = calculateOptimalScale(contentSize, containerSize, 0.8)

    // Apply the optimal zoom level and center
    const finalZoom = constrainValue(optimalScale, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
    zoomLevel.value = finalZoom
    panX.value = 0 // Center horizontally
    panY.value = 0 // Center vertically
  }

  // Alternative auto-fit that uses content bounding box approach
  const altAutoFit = async (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    svgElement: SVGElement
  ) => {
    if (previewMode.value || !containerElement || !svgElement || !template) {
      return
    }

    // Reset first
    zoomLevel.value = 1
    panX.value = 0
    panY.value = 0

    await nextTick()

    const containerWidth = containerElement.offsetWidth - 120 // Account for padding and controls
    const containerHeight = containerElement.offsetHeight - 120

    // Get the actual content bounds within the SVG
    const contentElements = Array.from(svgElement.querySelectorAll('rect, text, circle, path, polygon'))

    if (contentElements.length === 0) {
      // Fallback to SVG element if no content found
      const svgRect = svgElement.getBoundingClientRect()
      const contentSize: Size = { width: svgRect.width, height: svgRect.height }
      const containerSize: Size = { width: containerWidth, height: containerHeight }
      const bestScale = calculateOptimalScale(contentSize, containerSize, 0.9)
      zoomLevel.value = constrainValue(bestScale, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
      return
    }

    // Calculate bounding box of actual content in SVG coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    contentElements.forEach(el => {
      try {
        const bbox = el.getBBox()
        minX = Math.min(minX, bbox.x)
        minY = Math.min(minY, bbox.y)
        maxX = Math.max(maxX, bbox.x + bbox.width)
        maxY = Math.max(maxY, bbox.y + bbox.height)
      } catch (e) {
        // getBBox might fail on some elements, skip them
      }
    })

    if (minX === Infinity) {
      // No valid bounding boxes found, fallback
      const svgRect = svgElement.getBoundingClientRect()
      const scaleToFitWidth = containerWidth / svgRect.width
      const scaleToFitHeight = containerHeight / svgRect.height
      const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.9
      zoomLevel.value = constrainValue(bestScale, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
      return
    }

    // Content dimensions in SVG coordinates
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    // Get SVG viewBox to convert to screen coordinates
    const viewBox = template.viewBox
    const svgRect = svgElement.getBoundingClientRect()

    // Calculate how much screen space the content actually takes
    const contentScreenWidth = (contentWidth / viewBox.width) * svgRect.width
    const contentScreenHeight = (contentHeight / viewBox.height) * svgRect.height

    // Calculate the scale needed to fit the actual content using SVG utilities
    const contentSize: Size = { width: contentScreenWidth, height: contentScreenHeight }
    const containerSize: Size = { width: containerWidth, height: containerHeight }
    const bestScale = calculateOptimalScale(contentSize, containerSize, 0.85)

    // Apply the scale and center the SVG
    const finalZoom = constrainValue(bestScale, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
    zoomLevel.value = finalZoom

    // Center the SVG by resetting pan values
    panX.value = 0
    panY.value = 0
  }

  // Combined state and controls
  const state: ZoomPanState = {
    zoomLevel,
    panX,
    panY
  }

  const controls: ZoomPanControls = {
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    setPan,
    resetPan,
    handleWheel,
    autoFitTemplate,
    altAutoFit
  }

  return {
    // State
    ...state,

    // Controls
    ...controls,

    // Computed
    transformString,
    canZoomIn,
    canZoomOut,
    zoomPercentage
  }
}