/**
 * SVG Drag Interaction Composable
 *
 * Native SVG coordinate-based drag interaction for viewBox pan/zoom system
 * Much cleaner than CSS coordinate conversions
 */

import { ref, type Ref } from 'vue'

export interface SvgDragState {
  isDragging: Ref<boolean>
  lastSvgX: Ref<number>
  lastSvgY: Ref<number>
}

export interface SvgDragHandlers {
  handleMouseDown: (e: MouseEvent, svgElement: SVGElement | null) => void
  handleMouseMove: (e: MouseEvent, svgElement: SVGElement | null) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void
}

export function useSvgDragInteraction(
  previewMode: Ref<boolean>,
  onPan: (deltaX: number, deltaY: number) => void,
  getCurrentZoom: () => number,
  applyConstraints?: () => void
) {
  // State
  const isDragging = ref(false)
  const lastSvgX = ref(0)
  const lastSvgY = ref(0)

  // Simple screen coordinate tracking (no complex SVG transformations)
  const getScreenCoords = (e: MouseEvent, svgElement: SVGElement): { x: number; y: number } | null => {
    if (!svgElement) return null

    const rect = svgElement.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // Event handlers
  const handleMouseDown = (e: MouseEvent, svgElement: SVGElement | null) => {
    if (previewMode.value || !svgElement) return

    e.preventDefault()
    e.stopPropagation()

    const screenCoords = getScreenCoords(e, svgElement)
    if (screenCoords) {
      isDragging.value = true
      lastSvgX.value = screenCoords.x
      lastSvgY.value = screenCoords.y
    }
  }

  const handleMouseMove = (e: MouseEvent, svgElement: SVGElement | null) => {
    if (!isDragging.value || previewMode.value || !svgElement) return

    e.preventDefault()
    e.stopPropagation()

    const screenCoords = getScreenCoords(e, svgElement)
    if (screenCoords) {
      // Calculate screen pixel delta
      const screenDeltaX = lastSvgX.value - screenCoords.x
      const screenDeltaY = lastSvgY.value - screenCoords.y

      // Convert screen delta to viewBox coordinate delta
      // Since viewBox is scaled, we need to scale the delta by current zoom
      const currentZoom = getCurrentZoom()
      const viewBoxDeltaX = screenDeltaX / currentZoom
      const viewBoxDeltaY = screenDeltaY / currentZoom

      // Apply pan delta (inverted for intuitive direction)
      onPan(viewBoxDeltaX, viewBoxDeltaY)

      // Update last position
      lastSvgX.value = screenCoords.x
      lastSvgY.value = screenCoords.y
    }
  }

  const handleMouseUp = () => {
    if (isDragging.value && applyConstraints) {
      applyConstraints()
    }
    isDragging.value = false
  }

  const handleMouseLeave = () => {
    if (isDragging.value && applyConstraints) {
      applyConstraints()
    }
    isDragging.value = false
  }

  // State and handlers
  const state: SvgDragState = {
    isDragging,
    lastSvgX,
    lastSvgY
  }

  const handlers: SvgDragHandlers = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  }

  return {
    // State
    ...state,

    // Handlers
    ...handlers
  }
}