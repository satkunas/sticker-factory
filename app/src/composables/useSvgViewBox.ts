/**
 * SVG ViewBox Composable
 *
 * Native SVG-based pan/zoom using viewBox manipulation instead of CSS transforms
 * Provides pixel-perfect control and simplified coordinate calculations
 */

import { ref, nextTick, watch, type Ref } from 'vue'
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
    svgElement: SVGElement | null
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
            autoFitTemplate(template.value!, newContainer, null)
          })
        }
      }
    }, { immediate: true })
  }

  // Update base dimensions while preserving zoom and pan position
  const updateDimensionsOnResize = (containerEl: HTMLElement) => {
    // Store current zoom level before updating base dimensions
    const currentZoom = getZoomLevel()

    // Update base dimensions from new container size
    const rect = containerEl.getBoundingClientRect()
    const controlPadding = SVG_VIEWER_CONSTANTS.CONTAINER_PADDING
    baseViewBoxWidth.value = rect.width - controlPadding
    baseViewBoxHeight.value = rect.height - controlPadding

    // Recalculate viewBox dimensions to maintain the same zoom level
    viewBoxWidth.value = baseViewBoxWidth.value / currentZoom
    viewBoxHeight.value = baseViewBoxHeight.value / currentZoom

    // Apply constraints to ensure pan position is still valid with new dimensions
    constrainViewBox()
  }

  // Add window resize listener to update dimensions (NOT re-center)
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      if (containerElement?.value) {
        // Debounce resize events to avoid excessive updates
        setTimeout(() => {
          updateDimensionsOnResize(containerElement.value!)
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

  // Calculate minimum zoom level to show entire template with margins (locks panning)
  const getMinZoomLevel = (): number => {
    if (!template?.value || !containerElement?.value) {
      return SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.MIN
    }

    // Get actual container dimensions
    const containerRect = containerElement.value.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    // Use template dimensions directly (not grid bounds)
    const templateWidth = template.value.viewBox.width
    const templateHeight = template.value.viewBox.height

    // Add margins to ensure template has breathing room at minimum zoom
    const marginSize = SVG_VIEWER_CONSTANTS.AUTO_FIT.MIN_MARGIN * 2

    // Calculate minimum zoom that fits template + margins
    // At this zoom, viewBox will be LARGER than template, locking panning
    const minZoomX = containerWidth / (templateWidth + marginSize)
    const minZoomY = containerHeight / (templateHeight + marginSize)

    // Use the smaller zoom to ensure entire template + margins fits without clipping
    const calculatedMinZoom = Math.min(minZoomX, minZoomY)

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
    _svgElement: SVGElement | null
  ) => {
    if (previewMode.value || !containerElement || !template) return

    await nextTick()

    // Initialize base dimensions from container
    initializeBaseDimensions(containerElement)

    // Calculate template content dimensions for accurate centering
    const templateWidth = template.viewBox.width
    const templateHeight = template.viewBox.height

    // Validate template dimensions
    if (!templateWidth || !templateHeight || templateWidth <= 0 || templateHeight <= 0) {
      return // Invalid template dimensions
    }

    // Get container dimensions for optimal zoom calculation
    const containerRect = containerElement.getBoundingClientRect()
    const availableWidth = containerRect.width - SVG_VIEWER_CONSTANTS.CONTAINER_PADDING
    const availableHeight = containerRect.height - SVG_VIEWER_CONSTANTS.CONTAINER_PADDING

    // Validate container dimensions
    if (!availableWidth || !availableHeight || availableWidth <= 0 || availableHeight <= 0) {
      return // Invalid container dimensions
    }

    // Calculate optimal zoom that ensures template is fully visible with consistent spacing
    const marginSize = SVG_VIEWER_CONSTANTS.AUTO_FIT.MIN_MARGIN
    const scaleX = (availableWidth - marginSize * 2) / templateWidth
    const scaleY = (availableHeight - marginSize * 2) / templateHeight

    // Validate scale calculations
    if (!isFinite(scaleX) || !isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) {
      return // Invalid scale calculations
    }

    // Use the smaller scale to ensure template fits completely, with constraint limits
    const calculatedZoom = Math.min(scaleX, scaleY)
    const optimalZoom = Math.max(
      SVG_VIEWER_CONSTANTS.AUTO_FIT.MIN_SCALE,
      Math.min(calculatedZoom, SVG_VIEWER_CONSTANTS.AUTO_FIT.MAX_SCALE)
    )

    // Validate zoom level
    if (!isFinite(optimalZoom) || optimalZoom <= 0) {
      return // Invalid zoom level
    }

    // Set base viewBox dimensions based on container, not template
    // This ensures proper aspect ratio matching the container for perfect centering
    baseViewBoxWidth.value = availableWidth
    baseViewBoxHeight.value = availableHeight

    // Apply optimal zoom level
    setZoom(optimalZoom)

    // Perfect centering: position viewBox so its center aligns with the template's center
    // Calculate the center of the template's viewBox
    const templateCenterX = template.viewBox.x + template.viewBox.width / 2
    const templateCenterY = template.viewBox.y + template.viewBox.height / 2

    // Validate center calculations
    if (!isFinite(templateCenterX) || !isFinite(templateCenterY)) {
      return // Invalid center calculations
    }

    // Position our viewBox so its center aligns with the template's center
    viewBoxX.value = templateCenterX - viewBoxWidth.value / 2
    viewBoxY.value = templateCenterY - viewBoxHeight.value / 2

    // Validate final viewBox values
    if (!isFinite(viewBoxX.value) || !isFinite(viewBoxY.value)) {
      // Reset to safe defaults if calculations failed
      viewBoxX.value = 0
      viewBoxY.value = 0
      return
    }

    // Ensure the centered view respects pan boundaries
    constrainViewBox()
  }

  // Calculate constraint bounds to keep template always in view (no whitespace)
  const getConstraintBounds = () => {
    if (!template?.value) return null

    // Use template viewBox boundaries directly
    const templateMinX = template.value.viewBox.x
    const templateMinY = template.value.viewBox.y
    const templateMaxX = templateMinX + template.value.viewBox.width
    const templateMaxY = templateMinY + template.value.viewBox.height

    // Determine bounds for each dimension independently
    const viewportLargerThanTemplateX = viewBoxWidth.value >= template.value.viewBox.width
    const viewportLargerThanTemplateY = viewBoxHeight.value >= template.value.viewBox.height

    // Calculate X bounds
    let minX, maxX
    if (viewportLargerThanTemplateX) {
      // Viewport wider than template - center horizontally (no panning)
      const centerX = templateMinX + template.value.viewBox.width / 2
      minX = maxX = centerX - viewBoxWidth.value / 2
    } else {
      // Viewport narrower than template - allow panning within template bounds
      minX = templateMinX
      maxX = templateMaxX - viewBoxWidth.value
    }

    // Calculate Y bounds
    let minY, maxY
    if (viewportLargerThanTemplateY) {
      // Viewport taller than template - center vertically (no panning)
      const centerY = templateMinY + template.value.viewBox.height / 2
      minY = maxY = centerY - viewBoxHeight.value / 2
    } else {
      // Viewport shorter than template - allow panning within template bounds
      minY = templateMinY
      maxY = templateMaxY - viewBoxHeight.value
    }

    return { minX, maxX, minY, maxY }
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