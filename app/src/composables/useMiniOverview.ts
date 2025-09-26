/**
 * Mini Overview Composable
 *
 * Handles all calculations and state for the mini overview component
 * in zoom/pan controls. Extracts complex dimension and viewport logic.
 */

import { computed, type Ref } from 'vue'
import type { SimpleTemplate } from '../types/template-types'

interface ContainerDimensions {
  width: number
  height: number
}

export function useMiniOverview(
  template: Ref<SimpleTemplate | null | undefined>,
  containerDimensions: Ref<ContainerDimensions>,
  panX: Ref<number>,
  panY: Ref<number>,
  zoomLevel: Ref<number>
) {
  // Calculate dynamic mini overview dimensions to match viewer pane aspect ratio
  const miniOverviewDimensions = computed(() => {
    const baseWidth = 128 // Keep same width
    let height = 40 // Default height

    if (containerDimensions.value && containerDimensions.value.width > 0 && containerDimensions.value.height > 0) {
      // Calculate the viewer pane aspect ratio
      const viewerAspectRatio = containerDimensions.value.width / containerDimensions.value.height

      // Adjust height to match viewer aspect ratio, keeping width constant
      height = Math.round(baseWidth / viewerAspectRatio)

      // Constrain height to reasonable bounds
      height = Math.max(24, Math.min(80, height))
    }

    return {
      width: baseWidth,
      height
    }
  })

  const miniOverviewClasses = computed(() => {
    // Use width class for base width, height will be set via style
    return 'w-32'
  })

  const miniOverviewStyle = computed(() => {
    return {
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

  // Calculate mini viewport bounds to show full background grid
  const miniViewBoxX = computed(() => {
    if (!template.value) return -200
    const templateWidth = template.value.viewBox.width
    const _templateHeight = template.value.viewBox.height
    const templateCenterX = template.value.viewBox.x + templateWidth / 2
    const gridWidth = templateWidth * 2
    return templateCenterX - gridWidth / 2
  })

  const miniViewBoxY = computed(() => {
    if (!template.value) return -150
    const _templateWidth = template.value.viewBox.width
    const templateHeight = template.value.viewBox.height
    const templateCenterY = template.value.viewBox.y + templateHeight / 2
    const gridHeight = templateHeight * 2
    return templateCenterY - gridHeight / 2
  })

  const miniViewBoxWidth = computed(() => {
    if (!template.value) return 400
    return template.value.viewBox.width * 2
  })

  const miniViewBoxHeight = computed(() => {
    if (!template.value) return 300
    return template.value.viewBox.height * 2
  })

  const miniViewBoxString = computed(() => {
    return `${miniViewBoxX.value} ${miniViewBoxY.value} ${miniViewBoxWidth.value} ${miniViewBoxHeight.value}`
  })

  // Calculate SVG viewport rectangle - direct translation from main viewer's viewBox
  const svgViewportRect = computed(() => {
    if (!template.value || !containerDimensions.value) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    // Get main viewer's viewBox dimensions - these are the exact coordinates
    // that the main SVG viewport is currently showing
    const mainViewBoxX = panX.value
    const mainViewBoxY = panY.value
    const mainViewBoxWidth = containerDimensions.value.width / zoomLevel.value
    const mainViewBoxHeight = containerDimensions.value.height / zoomLevel.value

    // Direct translation: the rectangle shows exactly what the main viewer shows
    // Both coordinate systems should be the same
    return {
      x: mainViewBoxX,
      y: mainViewBoxY,
      width: mainViewBoxWidth,
      height: mainViewBoxHeight
    }
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