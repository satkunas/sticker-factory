/**
 * Mini Overview Composable
 *
 * Handles all calculations and state for the mini overview component
 * in zoom/pan controls. Wraps pure utility functions with Vue reactivity.
 */

import { computed, type Ref } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import { SVG_VIEWER_CONSTANTS } from '../config/svg-viewer-constants'
import {
  calculateMiniOverviewContainerDimensions,
  calculateMiniOverviewViewBox,
  calculateViewportIndicatorRect
} from '../utils/mini-overview'

interface ContainerDimensions {
  width: number
  height: number
}

export function useMiniOverview(
  template: Ref<SimpleTemplate | null | undefined>,
  containerDimensions: Ref<ContainerDimensions | undefined>,
  panX: Ref<number>,
  panY: Ref<number>,
  zoomLevel: Ref<number>
) {
  // Calculate mini overview dimensions based on template aspect ratio
  // The mini overview shows a fixed "map" of the template, so it's sized based on
  // template dimensions, not viewer dimensions
  const miniOverviewDimensions = computed(() => {
    if (!template.value || !template.value.viewBox) {
      return {
        width: SVG_VIEWER_CONSTANTS.MINI_OVERVIEW.BASE_WIDTH,
        height: SVG_VIEWER_CONSTANTS.LEGEND_HEIGHT
      }
    }

    return calculateMiniOverviewContainerDimensions(
      template.value.viewBox,
      SVG_VIEWER_CONSTANTS.MINI_OVERVIEW.BASE_WIDTH,
      SVG_VIEWER_CONSTANTS.MINI_OVERVIEW.MIN_HEIGHT,
      SVG_VIEWER_CONSTANTS.MINI_OVERVIEW.MAX_HEIGHT
    )
  })

  const miniOverviewClasses = computed(() => {
    // No fixed width class - width is set dynamically via style
    return ''
  })

  const miniOverviewStyle = computed(() => {
    return {
      width: `${miniOverviewDimensions.value.width}px`,
      height: `${miniOverviewDimensions.value.height}px`,
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
      backgroundSize: '5px 5px'
    }
  })

  // Calculate mini SVG dimensions that fit within the dynamic container
  const miniSvgDimensions = computed(() => {
    const legendWidth = miniOverviewDimensions.value.width
    const legendHeight = miniOverviewDimensions.value.height

    let width = legendWidth
    let height = legendHeight

    if (template.value) {
      // Use the template aspect ratio for mini overview
      const templateAspectRatio = template.value.viewBox.width / template.value.viewBox.height
      const legendContainerAspectRatio = legendWidth / legendHeight

      if (templateAspectRatio > legendContainerAspectRatio) {
        // Template is wider - fit to width
        width = legendWidth - 8 // Leave some padding
        height = width / templateAspectRatio
      } else {
        // Template is taller - fit to height
        height = legendHeight - 8 // Leave some padding
        width = height * templateAspectRatio
      }
    }

    return { width, height }
  })

  // Mini viewport parameters for SvgViewport component
  const miniGridSize = computed(() => 2) // Smaller grid for mini view

  // Calculate mini overview viewBox using utility function
  const miniViewBox = computed(() => {
    if (!template.value) {
      return { x: -200, y: -150, width: 400, height: 300 }
    }

    return calculateMiniOverviewViewBox(
      template.value.viewBox,
      miniOverviewDimensions.value,
      SVG_VIEWER_CONSTANTS.MINI_OVERVIEW.SCALE_FACTOR
    )
  })

  // Extract individual viewBox properties for backwards compatibility
  const miniViewBoxX = computed(() => miniViewBox.value.x)
  const miniViewBoxY = computed(() => miniViewBox.value.y)
  const miniViewBoxWidth = computed(() => miniViewBox.value.width)
  const miniViewBoxHeight = computed(() => miniViewBox.value.height)

  const miniViewBoxString = computed(() => {
    return `${miniViewBox.value.x} ${miniViewBox.value.y} ${miniViewBox.value.width} ${miniViewBox.value.height}`
  })

  // Calculate SVG viewport rectangle using utility function
  const svgViewportRect = computed(() => {
    if (!template.value || !containerDimensions.value) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    return calculateViewportIndicatorRect(
      panX.value,
      panY.value,
      containerDimensions.value,
      zoomLevel.value
    )
  })

  return {
    miniOverviewDimensions,
    miniOverviewClasses,
    miniOverviewStyle,
    miniSvgDimensions,
    miniGridSize,
    miniViewBoxX,
    miniViewBoxY,
    miniViewBoxWidth,
    miniViewBoxHeight,
    miniViewBoxString,
    svgViewportRect
  }
}