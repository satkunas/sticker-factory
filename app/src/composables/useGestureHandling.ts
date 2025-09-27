/**
 * Gesture Handling Composable
 *
 * Handles touch and gesture interactions for pinch-to-zoom and
 * trackpad gestures on SVG viewers
 */

import { ref, type Ref } from 'vue'
import {
  calculateDistance,
  constrainValue,
  SVG_CONSTANTS
} from '../utils/svg'

export interface TouchState {
  initialDistance: number
  initialZoom: number
  touches: { clientX: number; clientY: number; identifier: number }[]
}

export interface GestureState {
  initialZoom: number
}

export interface GestureHandlers {
  handleTouchStart: (e: TouchEvent) => void
  handleTouchMove: (e: TouchEvent) => void
  handleTouchEnd: (e: TouchEvent) => void
  handleGestureStart: (e: Event) => void
  handleGestureChange: (e: Event) => void
  handleGestureEnd: (e: Event) => void
}

export function useGestureHandling(
  zoomLevel: Ref<number>,
  previewMode: Ref<boolean>
) {
  // Touch state for pinch-to-zoom
  const touchState = ref<TouchState>({
    initialDistance: 0,
    initialZoom: 1,
    touches: []
  })

  // Gesture state for trackpad zoom (Safari/WebKit)
  const gestureState = ref<GestureState>({
    initialZoom: 1
  })

  // Touch event handlers for pinch-to-zoom using SVG utilities
  const handleTouchStart = (e: TouchEvent) => {
    if (previewMode.value) return

    if (e.touches.length === 2) {
      e.preventDefault()
      e.stopPropagation()

      const touches = e.touches
      const touch1 = { x: touches[0].clientX, y: touches[0].clientY }
      const touch2 = { x: touches[1].clientX, y: touches[1].clientY }
      const distance = calculateDistance(touch1, touch2)

      touchState.value.initialDistance = distance
      touchState.value.initialZoom = zoomLevel.value
      touchState.value.touches = Array.from(touches)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (previewMode.value) return

    if (e.touches.length === 2 && touchState.value.initialDistance > 0) {
      e.preventDefault()
      e.stopPropagation()

      const touches = e.touches
      const touch1 = { x: touches[0].clientX, y: touches[0].clientY }
      const touch2 = { x: touches[1].clientX, y: touches[1].clientY }
      const distance = calculateDistance(touch1, touch2)

      const scale = distance / touchState.value.initialDistance
      const newZoom = touchState.value.initialZoom * scale
      zoomLevel.value = constrainValue(newZoom, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (previewMode.value) return

    if (e.touches.length < 2) {
      touchState.value.initialDistance = 0
      touchState.value.touches = []
    }
  }

  // Gesture event handlers for trackpad zoom (Safari/WebKit)
  const handleGestureStart = (e: Event) => {
    if (previewMode.value) return

    e.preventDefault()
    e.stopPropagation()
    gestureState.value.initialZoom = zoomLevel.value
  }

  const handleGestureChange = (e: Event) => {
    if (previewMode.value) return

    e.preventDefault()
    e.stopPropagation()

    // e.scale represents the scaling factor from the gesture
    const gestureEvent = e as TouchEvent & { scale: number }
    const newZoom = gestureState.value.initialZoom * gestureEvent.scale
    zoomLevel.value = constrainValue(newZoom, SVG_CONSTANTS.MIN_ZOOM, SVG_CONSTANTS.MAX_ZOOM)
  }

  const handleGestureEnd = (e: Event) => {
    if (previewMode.value) return

    e.preventDefault()
    e.stopPropagation()
    // Keep the final zoom level - no additional action needed
  }

  const handlers: GestureHandlers = {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleGestureStart,
    handleGestureChange,
    handleGestureEnd
  }

  return {
    // State
    touchState,
    gestureState,

    // Handlers
    ...handlers
  }
}