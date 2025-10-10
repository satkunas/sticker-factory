/**
 * Mini Overview Calculation Utilities
 *
 * Pure TypeScript functions for calculating mini overview dimensions,
 * viewBox, and viewport indicator positioning.
 * No Vue dependencies - can be used in any context.
 */

import type { ViewBox, Dimensions } from '../types/svg-types'

/**
 * Result of mini overview viewBox calculation
 */
export interface MiniOverviewViewBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Result of viewport indicator calculation
 */
export interface ViewportIndicatorRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Complete mini overview calculation result
 */
export interface MiniOverviewCalculation {
  viewBox: MiniOverviewViewBox
  viewportRect: ViewportIndicatorRect
}

/**
 * Calculate the mini overview viewBox that properly centers the template
 * and matches the container's aspect ratio
 *
 * @param templateViewBox - Template's viewBox
 * @param containerDimensions - Mini overview container dimensions
 * @param scale - Scale factor for area shown around template (default 2.0 = 2x template size)
 * @returns ViewBox that centers template and matches container aspect ratio
 */
export function calculateMiniOverviewViewBox(
  templateViewBox: ViewBox,
  containerDimensions: Dimensions,
  scale = 2.0
): MiniOverviewViewBox {
  // Validate inputs
  if (!templateViewBox || !containerDimensions ||
      templateViewBox.width <= 0 || templateViewBox.height <= 0 ||
      containerDimensions.width <= 0 || containerDimensions.height <= 0 ||
      scale <= 0) {
    return { x: -200, y: -150, width: 400, height: 300 }
  }

  // Calculate template center
  const templateCenterX = templateViewBox.x + templateViewBox.width / 2
  const templateCenterY = templateViewBox.y + templateViewBox.height / 2

  // Calculate the area we want to show (scale x template size)
  const showAreaWidth = templateViewBox.width * scale
  const showAreaHeight = templateViewBox.height * scale

  // Calculate aspect ratios
  const containerAspectRatio = containerDimensions.width / containerDimensions.height
  const showAreaAspectRatio = showAreaWidth / showAreaHeight

  // Adjust viewBox dimensions to match container aspect ratio
  // This ensures content is properly centered and scaled
  let viewBoxWidth = showAreaWidth
  let viewBoxHeight = showAreaHeight

  if (containerAspectRatio > showAreaAspectRatio) {
    // Container is wider than show area - expand viewBox width
    viewBoxWidth = showAreaHeight * containerAspectRatio
  } else {
    // Container is taller than show area - expand viewBox height
    viewBoxHeight = showAreaWidth / containerAspectRatio
  }

  // Center the viewBox on the template
  const viewBoxX = templateCenterX - viewBoxWidth / 2
  const viewBoxY = templateCenterY - viewBoxHeight / 2

  return {
    x: viewBoxX,
    y: viewBoxY,
    width: viewBoxWidth,
    height: viewBoxHeight
  }
}

/**
 * Calculate the viewport indicator rectangle that shows what portion
 * of the template is visible in the main viewer
 *
 * @param mainViewBoxX - Main viewer's viewBox X coordinate
 * @param mainViewBoxY - Main viewer's viewBox Y coordinate
 * @param mainViewerDimensions - Main viewer container dimensions
 * @param zoomLevel - Current zoom level
 * @returns Rectangle showing visible viewport in mini overview coordinates
 */
export function calculateViewportIndicatorRect(
  mainViewBoxX: number,
  mainViewBoxY: number,
  mainViewerDimensions: Dimensions,
  zoomLevel: number
): ViewportIndicatorRect {
  // Validate inputs
  if (!mainViewerDimensions ||
      mainViewerDimensions.width <= 0 || mainViewerDimensions.height <= 0 ||
      zoomLevel <= 0 ||
      !isFinite(mainViewBoxX) || !isFinite(mainViewBoxY)) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  // Calculate the dimensions of the main viewer's viewBox
  // This represents what portion of the SVG coordinate space is visible
  const viewBoxWidth = mainViewerDimensions.width / zoomLevel
  const viewBoxHeight = mainViewerDimensions.height / zoomLevel

  // The viewport indicator uses the same coordinate system as the mini overview
  // So we can directly use the main viewer's viewBox coordinates
  return {
    x: mainViewBoxX,
    y: mainViewBoxY,
    width: viewBoxWidth,
    height: viewBoxHeight
  }
}

/**
 * Calculate complete mini overview configuration including viewBox and viewport indicator
 *
 * @param templateViewBox - Template's viewBox
 * @param containerDimensions - Mini overview container dimensions
 * @param mainViewBoxX - Main viewer's viewBox X coordinate
 * @param mainViewBoxY - Main viewer's viewBox Y coordinate
 * @param mainViewerDimensions - Main viewer container dimensions
 * @param zoomLevel - Current zoom level
 * @param scale - Scale factor for area shown around template (default 2.0)
 * @returns Complete mini overview calculation
 */
export function calculateMiniOverview(
  templateViewBox: ViewBox,
  containerDimensions: Dimensions,
  mainViewBoxX: number,
  mainViewBoxY: number,
  mainViewerDimensions: Dimensions,
  zoomLevel: number,
  scale = 2.0
): MiniOverviewCalculation {
  const viewBox = calculateMiniOverviewViewBox(
    templateViewBox,
    containerDimensions,
    scale
  )

  const viewportRect = calculateViewportIndicatorRect(
    mainViewBoxX,
    mainViewBoxY,
    mainViewerDimensions,
    zoomLevel
  )

  return {
    viewBox,
    viewportRect
  }
}

/**
 * Calculate mini overview container dimensions based on template aspect ratio
 *
 * The mini overview shows a fixed "map" of the template, so its size is based on
 * the template aspect ratio, not the viewer dimensions. Maintains aspect ratio
 * by scaling both width and height when constrained by size limits.
 *
 * @param templateViewBox - Template's viewBox (determines aspect ratio)
 * @param baseWidth - Base width for mini overview (default 128)
 * @param minHeight - Minimum height constraint (default 24)
 * @param maxHeight - Maximum height constraint (default 80)
 * @returns Container dimensions with template aspect ratio
 */
export function calculateMiniOverviewContainerDimensions(
  templateViewBox: ViewBox,
  baseWidth = 128,
  minHeight = 24,
  maxHeight = 80
): Dimensions {
  // Validate inputs
  if (!templateViewBox ||
      templateViewBox.width <= 0 || templateViewBox.height <= 0 ||
      baseWidth <= 0) {
    return { width: baseWidth, height: 40 }
  }

  // Calculate template aspect ratio (this determines mini overview shape)
  const templateAspectRatio = templateViewBox.width / templateViewBox.height

  // Calculate ideal dimensions to match template aspect ratio
  let width = baseWidth
  let height = Math.round(baseWidth / templateAspectRatio)

  // If height exceeds maxHeight, scale both dimensions down proportionally
  if (height > maxHeight) {
    const scale = maxHeight / height
    height = maxHeight
    width = Math.round(width * scale)
  }
  // If height is below minHeight, scale both dimensions up proportionally
  else if (height < minHeight) {
    const scale = minHeight / height
    height = minHeight
    width = Math.round(width * scale)
  }

  return {
    width,
    height
  }
}
