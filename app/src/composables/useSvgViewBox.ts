/**
 * SVG ViewBox Composable
 *
 * Native SVG-based pan/zoom using viewBox manipulation instead of CSS transforms
 * Provides pixel-perfect control and simplified coordinate calculations
 */

import { ref, nextTick, watch, type Ref } from 'vue'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import type { SimpleTemplate } from '../types/template-types'
import { calculateContentBounds, calculateGridBounds } from '../utils/svg-centering'

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

  // Watch for container element changes and initialize dimensions
  if (containerElement) {
    watch(containerElement, (newContainer) => {
      if (newContainer) {
        initializeBaseDimensions(newContainer)

        // Trigger auto-centering when container becomes available
        if (template?.value) {
          nextTick(() => {
            autoFitTemplate(template.value!, newContainer, null as any)
          })
        }
      }
    }, { immediate: true })
  }

  // Add window resize listener for automatic re-centering
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      if (containerElement?.value && template?.value) {
        // Debounce resize events to avoid excessive re-centering
        setTimeout(() => {
          autoFitTemplate(template.value!, containerElement.value!, null as any)
        }, 150)
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function would need to be handled by the component using this composable
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

    // Use centering utils to calculate grid dimensions
    const contentDimensions = calculateContentBounds(template.value.viewBox, 1.5)
    const gridBounds = calculateGridBounds(contentDimensions, 2.0)

    // Calculate minimum zoom needed to fill viewport with background grid
    const minZoomX = containerWidth / gridBounds.width
    const minZoomY = containerHeight / gridBounds.height

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


  // Auto-center template with perfect visual centering and optimal spacing
  const autoFitTemplate = async (
    template: SimpleTemplate,
    containerElement: HTMLElement,
    _svgElement: SVGElement
  ) => {
    if (previewMode.value || !containerElement || !template) return

    await nextTick()

    // Initialize base dimensions from container
    initializeBaseDimensions(containerElement)

    // Calculate template content dimensions for accurate centering
    const templateWidth = template.viewBox.width
    const templateHeight = template.viewBox.height

    // Get container dimensions for optimal zoom calculation
    const containerRect = containerElement.getBoundingClientRect()
    const availableWidth = containerRect.width - SVG_VIEWER_CONSTANTS.CONTAINER_PADDING
    const availableHeight = containerRect.height - SVG_VIEWER_CONSTANTS.CONTAINER_PADDING

    // Calculate optimal zoom that ensures template is fully visible with consistent spacing
    const marginSize = SVG_VIEWER_CONSTANTS.AUTO_FIT.MIN_MARGIN
    const scaleX = (availableWidth - marginSize * 2) / templateWidth
    const scaleY = (availableHeight - marginSize * 2) / templateHeight

    // Use the smaller scale to ensure template fits completely, with constraint limits
    const calculatedZoom = Math.min(scaleX, scaleY)
    const optimalZoom = Math.max(
      SVG_VIEWER_CONSTANTS.AUTO_FIT.MIN_SCALE,
      Math.min(calculatedZoom, SVG_VIEWER_CONSTANTS.AUTO_FIT.MAX_SCALE)
    )

    // Set base viewBox dimensions based on container, not template
    // This ensures proper aspect ratio matching the container for perfect centering
    baseViewBoxWidth.value = availableWidth
    baseViewBoxHeight.value = availableHeight

    // Apply optimal zoom level
    setZoom(optimalZoom)

    // Perfect centering: position viewBox so template content is exactly centered
    // Template content is centered at (0,0) by the content layer centering system
    // So we center the viewBox on origin (0,0) to achieve perfect visual centering
    viewBoxX.value = -viewBoxWidth.value / 2
    viewBoxY.value = -viewBoxHeight.value / 2

    // Ensure the centered view respects pan boundaries
    constrainViewBox()
  }

  // Calculate constraint bounds for the current viewBox state
  const getConstraintBounds = () => {
    if (!template?.value) return null

    // Use centering utils to calculate content and grid bounds
    const contentDimensions = calculateContentBounds(template.value.viewBox, 1.5)
    const gridBounds = calculateGridBounds(contentDimensions, 2.0)

    // Calculate maximum pan bounds (grid edges - allow panning to edges but no whitespace)
    // Grid is centered at (0,0) in content coordinate system
    const gridMinX = gridBounds.x
    const gridMinY = gridBounds.y
    const gridMaxX = gridBounds.x + gridBounds.width
    const gridMaxY = gridBounds.y + gridBounds.height

    // Ensure viewBox can access grid edges but not beyond (prevents whitespace)
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