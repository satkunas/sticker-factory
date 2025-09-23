/**
 * SVG Interaction Composable
 *
 * Combines zoom/pan, drag, and gesture handling for comprehensive
 * SVG viewer interaction support
 */

import { type Ref } from 'vue'
import { useZoomPan } from './useZoomPan'
import { useDragInteraction } from './useDragInteraction'
import { useGestureHandling } from './useGestureHandling'
import type { SimpleTemplate } from '../types/template-types'

export interface SvgInteractionHandlers {
  // Mouse events
  handleMouseDown: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void

  // Wheel events
  handleWheel: (e: WheelEvent) => void

  // Touch events
  handleTouchStart: (e: TouchEvent) => void
  handleTouchMove: (e: TouchEvent) => void
  handleTouchEnd: (e: TouchEvent) => void

  // Gesture events (Safari/WebKit)
  handleGestureStart: (e: Event) => void
  handleGestureChange: (e: Event) => void
  handleGestureEnd: (e: Event) => void
}

export interface SvgInteractionControls {
  // Zoom controls
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setZoom: (level: number) => void

  // Pan controls
  setPan: (x: number, y: number) => void
  resetPan: () => void

  // Auto-fit controls
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

export function useSvgInteraction(previewMode: Ref<boolean>) {
  // Initialize zoom/pan functionality
  const zoomPan = useZoomPan(previewMode)

  // Initialize drag interaction with zoom/pan state
  const dragInteraction = useDragInteraction(
    zoomPan.panX,
    zoomPan.panY,
    previewMode
  )

  // Initialize gesture handling with zoom state
  const gestureHandling = useGestureHandling(
    zoomPan.zoomLevel,
    previewMode
  )

  // Combine all event handlers
  const handlers: SvgInteractionHandlers = {
    // Mouse events from drag interaction
    handleMouseDown: dragInteraction.handleMouseDown,
    handleMouseMove: dragInteraction.handleMouseMove,
    handleMouseUp: dragInteraction.handleMouseUp,
    handleMouseLeave: dragInteraction.handleMouseLeave,

    // Wheel events from zoom/pan
    handleWheel: zoomPan.handleWheel,

    // Touch and gesture events from gesture handling
    handleTouchStart: gestureHandling.handleTouchStart,
    handleTouchMove: gestureHandling.handleTouchMove,
    handleTouchEnd: gestureHandling.handleTouchEnd,
    handleGestureStart: gestureHandling.handleGestureStart,
    handleGestureChange: gestureHandling.handleGestureChange,
    handleGestureEnd: gestureHandling.handleGestureEnd
  }

  // Combine all controls
  const controls: SvgInteractionControls = {
    // Zoom controls
    zoomIn: zoomPan.zoomIn,
    zoomOut: zoomPan.zoomOut,
    resetZoom: zoomPan.resetZoom,
    setZoom: zoomPan.setZoom,

    // Pan controls
    setPan: zoomPan.setPan,
    resetPan: zoomPan.resetPan,

    // Auto-fit controls
    autoFitTemplate: zoomPan.autoFitTemplate,
    altAutoFit: zoomPan.altAutoFit
  }

  return {
    // State (all reactive refs)
    zoomLevel: zoomPan.zoomLevel,
    panX: zoomPan.panX,
    panY: zoomPan.panY,
    isDragging: dragInteraction.isDragging,

    // Computed properties
    transformString: zoomPan.transformString,
    canZoomIn: zoomPan.canZoomIn,
    canZoomOut: zoomPan.canZoomOut,
    zoomPercentage: zoomPan.zoomPercentage,

    // Event handlers
    ...handlers,

    // Controls
    ...controls,

    // State objects for advanced usage
    touchState: gestureHandling.touchState,
    gestureState: gestureHandling.gestureState
  }
}