/**
 * SVG ViewBox Composable
 *
 * Native SVG-based pan/zoom using viewBox manipulation instead of CSS transforms
 * Provides pixel-perfect control and simplified coordinate calculations
 */

import { ref, nextTick, type Ref } from 'vue'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import type { SimpleTemplate } from '../types/template-types'

export interface SvgViewBoxState {
  viewBoxX: Ref<number>
  viewBoxY: Ref<number>
  viewBoxWidth: Ref<number>
  viewBoxHeight: Ref<number>
  baseViewBoxWidth: Ref<number>
  baseViewBoxHeight: Ref<number>
}

export interface SvgViewBoxControls {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setZoom: (zoomLevel: number) => void
  setPan: (x: number, y: number) => void
  resetPan: () => void
  handleWheel: (e: WheelEvent, svgElement: SVGElement | null) => void
  autoFitTemplate: (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    svgElement: SVGElement
  ) => Promise<void>
  getZoomLevel: () => number
  getMinZoomLevel: () => number
  canZoomIn: () => boolean
  canZoomOut: () => boolean
}

export function useSvgViewBox(
  previewMode: Ref<boolean>,
  template?: Ref<SimpleTemplate | null>,
  containerElement?: Ref<HTMLElement | null>
) {
  // Base viewBox dimensions (what would be 100% zoom)
  const baseViewBoxWidth = ref<number>(800)
  const baseViewBoxHeight = ref<number>(600)

  // Current viewBox state (pan/zoom applied)
  const viewBoxX = ref<number>(0)
  const viewBoxY = ref<number>(0)
  const viewBoxWidth = ref<number>(800)
  const viewBoxHeight = ref<number>(600)

  // Initialize base dimensions from container
  const initializeBaseDimensions = (containerEl: HTMLElement) => {
    const rect = containerEl.getBoundingClientRect()
    const controlPadding = SVG_VIEWER_CONSTANTS.CONTAINER_PADDING
    baseViewBoxWidth.value = rect.width - controlPadding
    baseViewBoxHeight.value = rect.height - controlPadding
    viewBoxWidth.value = baseViewBoxWidth.value
    viewBoxHeight.value = baseViewBoxHeight.value
  }

  // Computed properties
  const getZoomLevel = (): number => {
    // Zoom is inverse of viewBox size relative to base size
    return baseViewBoxWidth.value / viewBoxWidth.value
  }

  const canZoomIn = (): boolean => {
    return getZoomLevel() < SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX
  }

  const canZoomOut = (): boolean => {
    return getZoomLevel() > getMinZoomLevel()
  }

  // Calculate minimum zoom level to prevent whitespace around background grid
  const getMinZoomLevel = (): number => {
    if (!template?.value || !containerElement?.value) {
      return SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN
    }

    // Get actual container dimensions
    const containerRect = containerElement.value.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    // Calculate background grid dimensions
    const templateWidth = template.value.viewBox.width
    const templateHeight = template.value.viewBox.height
    const gridWidth = templateWidth * 2
    const gridHeight = templateHeight * 2

    // Calculate minimum zoom needed to fill viewport with background grid
    const minZoomX = containerWidth / gridWidth
    const minZoomY = containerHeight / gridHeight

    // Use the larger zoom to ensure grid fills entire viewport
    const calculatedMinZoom = Math.max(minZoomX, minZoomY)

    // Ensure we don't go below absolute minimum
    return Math.max(calculatedMinZoom, SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN)
  }

  // Zoom controls
  const zoomIn = () => {
    if (canZoomIn()) {
      const currentZoom = getZoomLevel()
      const newZoom = Math.min(
        currentZoom + SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.STEP,
        SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX
      )
      setZoom(newZoom)
    }
  }

  const zoomOut = () => {
    if (canZoomOut()) {
      const currentZoom = getZoomLevel()
      const newZoom = Math.max(
        currentZoom - SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.STEP,
        getMinZoomLevel()
      )
      setZoom(newZoom)
    }
  }

  const resetZoom = () => {
    setZoom(SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.DEFAULT)
  }

  const setZoom = (zoomLevel: number) => {
    const constrainedZoom = Math.max(
      getMinZoomLevel(),
      Math.min(zoomLevel, SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX)
    )

    // Calculate new viewBox dimensions
    const newWidth = baseViewBoxWidth.value / constrainedZoom
    const newHeight = baseViewBoxHeight.value / constrainedZoom

    // Maintain center point during zoom
    const centerX = viewBoxX.value + viewBoxWidth.value / 2
    const centerY = viewBoxY.value + viewBoxHeight.value / 2

    viewBoxWidth.value = newWidth
    viewBoxHeight.value = newHeight
    viewBoxX.value = centerX - newWidth / 2
    viewBoxY.value = centerY - newHeight / 2

    // Apply constraints after zoom change
    constrainViewBox()
  }

  // Pan controls with real-time constraint enforcement (rev limiter approach)
  const setPan = (deltaX: number, deltaY: number) => {
    // Calculate constrained deltas that respect boundaries
    const constrainedDeltas = calculateConstrainedDelta(deltaX, deltaY)

    // Apply only the allowable portion of the requested movement
    viewBoxX.value += constrainedDeltas.deltaX
    viewBoxY.value += constrainedDeltas.deltaY

    // No overshooting - smooth sliding along boundaries like a rev limiter
  }


  const resetPan = () => {
    viewBoxX.value = -viewBoxWidth.value / 2
    viewBoxY.value = -viewBoxHeight.value / 2
  }

  // Wheel zoom handling with native SVG coordinates
  const handleWheel = (e: WheelEvent, svgElement: SVGElement | null) => {
    if (previewMode.value || !svgElement) return

    e.preventDefault()
    e.stopPropagation()

    const currentZoom = getZoomLevel()
    const zoomDirection = e.deltaY > 0 ? -1 : 1
    const zoomStep = SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.WHEEL_STEP
    const newZoom = Math.max(
      getMinZoomLevel(),
      Math.min(
        currentZoom + (zoomDirection * zoomStep),
        SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MAX
      )
    )

    // Get mouse position in screen coordinates relative to SVG viewport
    const rect = svgElement.getBoundingClientRect()
    const mouseScreenX = e.clientX - rect.left
    const mouseScreenY = e.clientY - rect.top

    // Calculate mouse position as percentage of viewport
    const mousePercentX = mouseScreenX / rect.width
    const mousePercentY = mouseScreenY / rect.height

    // Calculate current mouse position in SVG coordinates
    const currentSvgX = viewBoxX.value + (mousePercentX * viewBoxWidth.value)
    const currentSvgY = viewBoxY.value + (mousePercentY * viewBoxHeight.value)

    // Apply new zoom level
    const newWidth = baseViewBoxWidth.value / newZoom
    const newHeight = baseViewBoxHeight.value / newZoom

    // Calculate new viewBox position to keep mouse point stationary
    viewBoxWidth.value = newWidth
    viewBoxHeight.value = newHeight
    viewBoxX.value = currentSvgX - (mousePercentX * newWidth)
    viewBoxY.value = currentSvgY - (mousePercentY * newHeight)

    // Apply constraints after zoom
    constrainViewBox()
  }


  // Auto-fit template to viewport
  const autoFitTemplate = async (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    _svgElement: SVGElement
  ) => {
    if (previewMode.value || !containerElement || !template) return

    await nextTick()

    // Initialize base dimensions from container
    initializeBaseDimensions(containerElement)

    // Calculate optimal zoom to fit template
    const templateWidth = template.viewBox.width
    const templateHeight = template.viewBox.height

    const scaleX = baseViewBoxWidth.value / templateWidth
    const scaleY = baseViewBoxHeight.value / templateHeight
    const optimalZoom = Math.min(scaleX, scaleY)

    // Apply zoom and center template
    setZoom(optimalZoom)

    // Center on template - position viewBox so template center is at viewport center
    // Template center in SVG coordinates
    const templateCenterX = template.viewBox.x + templateWidth / 2
    const templateCenterY = template.viewBox.y + templateHeight / 2

    // Position viewBox so template center appears in viewport center
    viewBoxX.value = templateCenterX - viewBoxWidth.value / 2
    viewBoxY.value = templateCenterY - viewBoxHeight.value / 2
  }

  // Calculate constraint bounds for the current viewBox state
  const getConstraintBounds = () => {
    if (!template?.value) return null

    // Calculate background grid bounds with reasonable limits
    const templateWidth = template.value.viewBox.width
    const templateHeight = template.value.viewBox.height

    // Limit background grid to reasonable size (2x template but with maximum bounds)
    const maxGridSize = Math.max(templateWidth, templateHeight) * 3
    const gridWidth = Math.min(templateWidth * 2, maxGridSize)
    const gridHeight = Math.min(templateHeight * 2, maxGridSize)

    // Center background grid around template center
    const templateCenterX = template.value.viewBox.x + templateWidth / 2
    const templateCenterY = template.value.viewBox.y + templateHeight / 2

    const gridMinX = templateCenterX - gridWidth / 2
    const gridMinY = templateCenterY - gridHeight / 2
    const gridMaxX = templateCenterX + gridWidth / 2
    const gridMaxY = templateCenterY + gridHeight / 2

    // Calculate maximum pan bounds (grid edges minus viewBox size)
    return {
      minX: gridMinX,
      maxX: gridMaxX - viewBoxWidth.value,
      minY: gridMinY,
      maxY: gridMaxY - viewBoxHeight.value
    }
  }

  // Calculate constrained delta that respects pan boundaries (like a rev limiter)
  const calculateConstrainedDelta = (deltaX: number, deltaY: number) => {
    const bounds = getConstraintBounds()
    if (!bounds) return { deltaX, deltaY }

    // Calculate proposed new positions
    const proposedX = viewBoxX.value + deltaX
    const proposedY = viewBoxY.value + deltaY

    // Constrain to bounds and calculate actual deltas
    const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, proposedX))
    const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, proposedY))

    return {
      deltaX: constrainedX - viewBoxX.value,
      deltaY: constrainedY - viewBoxY.value
    }
  }

  // Constrain viewBox to prevent panning outside allowed bounds
  const constrainViewBox = () => {
    const bounds = getConstraintBounds()
    if (!bounds) return

    // Apply constraints using the shared bounds calculation
    viewBoxX.value = Math.max(bounds.minX, Math.min(bounds.maxX, viewBoxX.value))
    viewBoxY.value = Math.max(bounds.minY, Math.min(bounds.maxY, viewBoxY.value))
  }

  // Combined state and controls
  const state: SvgViewBoxState = {
    viewBoxX,
    viewBoxY,
    viewBoxWidth,
    viewBoxHeight,
    baseViewBoxWidth,
    baseViewBoxHeight
  }

  const controls: SvgViewBoxControls = {
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    setPan,
    resetPan,
    handleWheel,
    autoFitTemplate,
    getZoomLevel,
    getMinZoomLevel,
    canZoomIn,
    canZoomOut
  }

  return {
    // State
    ...state,

    // Controls
    ...controls,

    // Additional functions
    constrainViewBox
  }
}