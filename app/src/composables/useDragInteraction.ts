/**
 * Drag Interaction Composable
 *
 * Handles mouse drag interaction for panning SVG viewers
 */

import { ref, type Ref } from 'vue'

export interface DragState {
  isDragging: Ref<boolean>
  lastMouseX: Ref<number>
  lastMouseY: Ref<number>
}

export interface DragHandlers {
  handleMouseDown: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void
}

export function useDragInteraction(
  panX: Ref<number>,
  panY: Ref<number>,
  previewMode: Ref<boolean>
) {
  // State
  const isDragging = ref(false)
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)

  // Handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (previewMode.value) return

    isDragging.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY

    // Prevent text selection
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || previewMode.value) return

    const deltaX = e.clientX - lastMouseX.value
    const deltaY = e.clientY - lastMouseY.value

    panX.value += deltaX
    panY.value += deltaY

    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY

    e.preventDefault()
  }

  const handleMouseUp = () => {
    isDragging.value = false
  }

  const handleMouseLeave = () => {
    isDragging.value = false
  }

  // State and handlers
  const state: DragState = {
    isDragging,
    lastMouseX,
    lastMouseY
  }

  const handlers: DragHandlers = {
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