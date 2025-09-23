/**
 * Zoom and Pan Composable
 *
 * Handles zoom level and pan offset state management for SVG viewers
 */

import { ref, computed, type Ref } from 'vue'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'

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
}

export function useZoomPan(previewMode: Ref<boolean>) {
  // State
  const zoomLevel = ref(SVG_VIEWER_CONSTANTS.ZOOM_CONSTRAINTS.DEFAULT)
  const panX = ref(0)
  const panY = ref(0)

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
    resetPan
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