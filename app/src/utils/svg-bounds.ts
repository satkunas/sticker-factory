/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SVG Bounds Analysis Utility
 *
 * Analyzes SVG content to calculate actual bounding boxes and centers
 * for precise positioning and centering calculations.
 * Includes advanced center-of-mass (centroid) calculations for improved
 * visual centering of complex shapes like stars, triangles, and arrows.
 */

import type { Point, ViewBox } from '../types/svg-types'
import { logger } from './logger'

interface SvgBounds {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface SvgViewBoxFitAnalysis {
  isProperlyFitted: boolean
  isCentered: boolean
  recommendedViewBox: string
  offset: Point
  severity: 'none' | 'minor' | 'major'
  issues: string[]
  contentBounds: SvgBounds
  currentViewBox: ViewBox | null
}

export interface SvgCentroid {
  boundingBoxCenter: Point
  centroidCenter: Point
  useCentroid: boolean
  shapeType: ShapeType
  confidence: number
}

export type ShapeType =
  | 'star'
  | 'triangle'
  | 'arrow'
  | 'circle'
  | 'rectangle'
  | 'polygon'
  | 'complex-path'
  | 'line'
  | 'unknown'

/**
 * Calculate the bounding box of all content within an SVG
 * Minimal implementation for production centroid and viewBox analysis
 */
function calculateContentBounds(svgContent: string): SvgBounds {
  // Extract viewBox as fallback bounds
  const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i)
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number)
    if (parts.length === 4) {
      const [x, y, width, height] = parts
      return {
        xMin: x,
        xMax: x + width,
        yMin: y,
        yMax: y + height,
        width,
        height,
        centerX: x + width / 2,
        centerY: y + height / 2
      }
    }
  }

  // Fallback to zero bounds if no viewBox found
  return {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0
  }
}

/**
 * Parse points attribute into coordinate pairs
 * Used by polygon centroid calculations
 */
function parsePointsAttribute(points: string): { x: number; y: number }[] {
  const coordinates: { x: number; y: number }[] = []
  const values = points.split(/[,\s]+/).filter(val => val.trim())

  for (let i = 0; i < values.length - 1; i += 2) {
    const x = parseFloat(values[i])
    const y = parseFloat(values[i + 1])

    if (!isNaN(x) && !isNaN(y)) {
      coordinates.push({ x, y })
    }
  }

  return coordinates
}

/**
 * Calculate confidence score for SVG bounds calculation accuracy
 * Returns a score from 0.0 (no confidence) to 1.0 (high confidence)
 */
function calculateBoundsConfidence(contentBounds: SvgBounds, viewBox: { x: number; y: number; width: number; height: number } | null): number {
  let confidence = 1.0

  if (!isFinite(contentBounds.width) || !isFinite(contentBounds.height) ||
      contentBounds.width < 0 || contentBounds.height < 0 ||
      !isFinite(contentBounds.xMin) || !isFinite(contentBounds.yMin)) {
    return 0.0
  }

  if (!viewBox) {
    return 0.6
  }

  const boundsToViewBoxRatio = Math.max(
    contentBounds.width / viewBox.width,
    contentBounds.height / viewBox.height
  )

  // If content bounds are more than 100x larger than viewBox, likely parsing error
  if (boundsToViewBoxRatio > 100) {
    confidence *= 0.1
  } else if (boundsToViewBoxRatio > 50) {
    confidence *= 0.3
  } else if (boundsToViewBoxRatio > 20) {
    confidence *= 0.6
  }

  const minBoundsRatio = Math.min(
    contentBounds.width / viewBox.width,
    contentBounds.height / viewBox.height
  )

  if (minBoundsRatio < 0.01) {
    confidence *= 0.5
  }

  const contentCenterX = contentBounds.centerX
  const contentCenterY = contentBounds.centerY
  const viewBoxCenterX = viewBox.x + viewBox.width / 2
  const viewBoxCenterY = viewBox.y + viewBox.height / 2

  const centerOffsetX = Math.abs(contentCenterX - viewBoxCenterX)
  const centerOffsetY = Math.abs(contentCenterY - viewBoxCenterY)

  // If content center is more than 5x viewBox size away from viewBox center
  if (centerOffsetX > viewBox.width * 5 || centerOffsetY > viewBox.height * 5) {
    confidence *= 0.2
  } else if (centerOffsetX > viewBox.width * 2 || centerOffsetY > viewBox.height * 2) {
    confidence *= 0.7
  }

  // Check for degenerate cases (zero-width or zero-height content)
  if (contentBounds.width === 0 || contentBounds.height === 0) {
    confidence *= 0.3
  }

  return Math.max(0, Math.min(1, confidence))
}

/**
 * Analyze how well an SVG's viewBox fits and centers its content
 */
export function analyzeSvgViewBoxFit(svgContent: string, padding = 2): SvgViewBoxFitAnalysis {
  // Extract viewBox
  const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i)
  let viewBox: { x: number; y: number; width: number; height: number } | null = null

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number)
    if (parts.length === 4) {
      viewBox = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
    }
  }

  // Calculate content bounds
  const contentBounds = calculateContentBounds(svgContent)

  const issues: string[] = []
  let isProperlyFitted = true
  let isCentered = true
  let severity: 'none' | 'minor' | 'major' = 'none'

  // Calculate confidence in bounds calculation
  const confidence = calculateBoundsConfidence(contentBounds, viewBox)

  // Only proceed with centering analysis if we have reasonable confidence
  if (confidence < 0.5) {
    // Use actual calculated contentBounds instead of fabricating with hardcoded defaults
    const fallbackViewBox = viewBox
      ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      : `${contentBounds.xMin} ${contentBounds.yMin} ${contentBounds.width} ${contentBounds.height}`

    return {
      isProperlyFitted: true,
      isCentered: true,
      recommendedViewBox: fallbackViewBox,
      offset: { x: 0, y: 0 },
      severity: 'none',
      issues: [`Path parsing confidence too low (${Math.round(confidence * 100)}%) - skipping analysis`],
      contentBounds, // Use actual calculated bounds - NO hardcoded defaults
      currentViewBox: viewBox
    }
  }

  // Calculate recommended viewBox with padding
  const recommendedX = contentBounds.xMin - padding
  const recommendedY = contentBounds.yMin - padding
  const recommendedWidth = contentBounds.width + (padding * 2)
  const recommendedHeight = contentBounds.height + (padding * 2)
  const recommendedViewBox = `${recommendedX} ${recommendedY} ${recommendedWidth} ${recommendedHeight}`

  // Calculate recommended center
  const _recommendedCenterX = recommendedX + recommendedWidth / 2
  const _recommendedCenterY = recommendedY + recommendedHeight / 2

  let offset = { x: 0, y: 0 }

  if (viewBox) {
    const currentCenterX = viewBox.x + viewBox.width / 2
    const currentCenterY = viewBox.y + viewBox.height / 2

    // Calculate how far the content center is from the viewBox center
    offset = {
      x: contentBounds.centerX - currentCenterX,
      y: contentBounds.centerY - currentCenterY
    }

    // Check if content is properly fitted within viewBox
    const contentExceedsLeft = contentBounds.xMin < viewBox.x
    const contentExceedsRight = contentBounds.xMax > (viewBox.x + viewBox.width)
    const contentExceedsTop = contentBounds.yMin < viewBox.y
    const contentExceedsBottom = contentBounds.yMax > (viewBox.y + viewBox.height)

    if (contentExceedsLeft || contentExceedsRight || contentExceedsTop || contentExceedsBottom) {
      isProperlyFitted = false
      issues.push('Content extends outside viewBox boundaries')
    }

    // Check if there's excessive empty space (viewBox much larger than content)
    const viewBoxArea = viewBox.width * viewBox.height
    const contentArea = contentBounds.width * contentBounds.height
    const utilization = contentArea / viewBoxArea

    if (utilization < 0.25) {
      issues.push('ViewBox is much larger than content (poor space utilization)')
    }

    // Check centering - consider minor if offset > 5% of viewBox dimension
    const offsetThresholdX = viewBox.width * 0.05
    const offsetThresholdY = viewBox.height * 0.05

    if (Math.abs(offset.x) > offsetThresholdX || Math.abs(offset.y) > offsetThresholdY) {
      isCentered = false
      issues.push(`Content is off-center by ${offset.x.toFixed(2)}, ${offset.y.toFixed(2)} units`)
    }

    // Determine severity
    const maxOffsetPercent = Math.max(
      Math.abs(offset.x) / viewBox.width,
      Math.abs(offset.y) / viewBox.height
    )

    if (!isProperlyFitted || maxOffsetPercent > 0.15) {
      severity = 'major'
    } else if (!isCentered || maxOffsetPercent > 0.05) {
      severity = 'minor'
    }

  } else {
    // No viewBox found
    issues.push('No viewBox attribute found in SVG')
    isProperlyFitted = false
    isCentered = false
    severity = 'major'
  }

  return {
    isProperlyFitted,
    isCentered,
    recommendedViewBox,
    offset,
    severity,
    issues,
    contentBounds,
    currentViewBox: viewBox
  }
}

// =============================================================================
// CENTER-OF-MASS (CENTROID) CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate the optimal transform origin for an SVG using center-of-mass analysis
 */
export function calculateOptimalTransformOrigin(svgContent: string): Point {
  const centroidAnalysis = calculateSvgCentroid(svgContent)

  let result: Point
  if (centroidAnalysis.useCentroid && centroidAnalysis.confidence > 0.7) {
    result = centroidAnalysis.centroidCenter
  } else {
    // Fallback to bounding box center for low-confidence cases
    result = centroidAnalysis.boundingBoxCenter
  }

  // Debug logging for NaN detection
  if (isNaN(result.x) || isNaN(result.y)) {
    logger.error('NaN detected in calculateOptimalTransformOrigin:', {
      result,
      centroidAnalysis,
      svgContentLength: svgContent.length,
      svgContentPreview: svgContent.substring(0, 100)
    })
  }

  return result
}

/**
 * Determine if an SVG should use centroid-based transform origin
 */
export function shouldUseCentroidOrigin(svgContent: string): boolean {
  const centroidAnalysis = calculateSvgCentroid(svgContent)
  return centroidAnalysis.useCentroid && centroidAnalysis.confidence > 0.7
}

/**
 * Calculate the center-of-mass (centroid) for an SVG
 */
export function calculateSvgCentroid(svgContent: string): SvgCentroid {
  const bounds = calculateContentBounds(svgContent)
  const boundingBoxCenter: Point = {
    x: bounds.centerX,
    y: bounds.centerY
  }

  // Detect shape type and calculate appropriate centroid
  const shapeType = detectShapeType(svgContent)
  let centroidCenter: Point = boundingBoxCenter
  let useCentroid = false
  let confidence = 0

  switch (shapeType) {
    case 'polygon': {
      const polygonResult = calculatePolygonCentroid(svgContent)
      if (polygonResult) {
        centroidCenter = polygonResult.centroid
        useCentroid = true
        confidence = polygonResult.confidence
      }
      break
    }

    case 'complex-path': {
      // Try multi-path centroid first (handles multi-element SVGs with variance-based strategy selection)
      const multiPathResult = calculateMultiPathCentroid(svgContent)
      if (multiPathResult) {
        centroidCenter = multiPathResult.centroid
        useCentroid = true
        confidence = multiPathResult.confidence
      } else {
        // Fallback: Original single-path algorithm for backward compatibility
        const pathResult = calculatePathCentroid(svgContent)
        if (pathResult) {
          centroidCenter = pathResult.centroid
          useCentroid = true
          confidence = pathResult.confidence
        }
      }
      break
    }

    default: {
      // For circles, rectangles, lines, and unknown shapes, use bounding box center
      confidence = 0.9 // High confidence in bounding box for regular shapes
      break
    }
  }

  return {
    boundingBoxCenter,
    centroidCenter,
    useCentroid,
    shapeType,
    confidence
  }
}

/**
 * Detect the primary shape type of an SVG for centroid calculation
 *
 * Uses strict detection for basic shapes only, falling back to 'complex-path'
 * for all <path> elements which use the robust general-purpose centroid algorithm.
 */
export function detectShapeType(svgContent: string): ShapeType {
  // Check for <path> elements - use general-purpose algorithm for all paths
  const pathMatch = svgContent.match(/<path[^>]*d\s*=\s*["']([^"']+)["']/i)
  if (pathMatch) {
    return 'complex-path'
  }

  // Check for basic geometric shapes
  if (svgContent.includes('<circle') || svgContent.includes('<ellipse')) {
    return 'circle'
  }

  if (svgContent.includes('<rect')) {
    return 'rectangle'
  }

  if (svgContent.includes('<polygon') || svgContent.includes('<polyline')) {
    return 'polygon'
  }

  if (svgContent.includes('<line')) {
    return 'line'
  }

  return 'unknown'
}

// Shape-specific centroid functions removed - using general-purpose calculatePathCentroid() for all paths

/**
 * Calculate centroid for general polygons
 */
function calculatePolygonCentroid(svgContent: string): { centroid: Point; confidence: number } | null {
  // Try to extract polygon points first
  const polygonMatch = svgContent.match(/<polygon[^>]*points\s*=\s*["']([^"']+)["']/i)

  if (polygonMatch) {
    const pointsStr = polygonMatch[1]
    const points = parsePointsAttribute(pointsStr)
    const centroid = calculatePolygonCentroidFromPoints(points)

    return {
      centroid,
      confidence: 0.85
    }
  }

  // Fallback to path-based polygon
  const pathMatch = svgContent.match(/<path[^>]*d\s*=\s*["']([^"']+)["']/i)
  if (!pathMatch) return null

  const pathData = pathMatch[1]
  const points = extractPathPoints(pathData)

  if (points.length < 3) return null

  const centroid = calculatePolygonCentroidFromPoints(points)

  return {
    centroid,
    confidence: 0.8
  }
}

/**
 * Calculate centroid for complex path elements
 *
 * Uses proper SVG path parsing that converts curves (A, C, Q commands) to line segments
 * by sampling points along the curves, enabling accurate centroid calculation for all path types.
 */
function calculatePathCentroid(svgContent: string): { centroid: Point; confidence: number } | null {
  const pathMatch = svgContent.match(/<path[^>]*d\s*=\s*["']([^"']+)["']/i)
  if (!pathMatch) return null

  const pathData = pathMatch[1]

  // Use proper path parser that handles curves by converting to line segments
  const points = extractPathPoints(pathData)

  if (points.length < 2) {
    // Not enough points to determine center reliably
    return null
  }

  // Use polygon centroid calculation for all path types
  const centroid = calculatePolygonCentroidFromPoints(points)

  return {
    centroid,
    confidence: 0.8 // High confidence since we now properly parse curves
  }
}

// =============================================================================
// MULTI-PATH CENTROID CALCULATION (MBR WITH VARIANCE-BASED STRATEGY SELECTION)
// =============================================================================

interface PathAnalysis {
  bbox: { x: number; y: number; width: number; height: number }
  center: Point
  area: number
  pointCount: number
}

/**
 * Extract all path data strings from SVG content
 * Returns array of path d= attribute values
 */
function extractAllPathsData(svgContent: string): string[] {
  const paths: string[] = []
  const pathRegex = /<path[^>]*d\s*=\s*["']([^"']+)["']/gi  // Global flag for all matches
  let match

  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1])
  }

  return paths
}

/**
 * Calculate bounding box for a path by sampling all curves
 * Reuses existing extractPathPoints() which handles:
 * - Floating point numbers (.5, .224, -.433)
 * - Bezier curves (C/c with 10 samples, Q/q with 8 samples)
 * - Arcs (A/a with 8 samples)
 * - All SVG commands (M, L, H, V, C, S, Q, T, A, Z and relative variants)
 */
function calculatePathBoundingBox(pathData: string): PathAnalysis {
  const points = extractPathPoints(pathData)  // Reuse existing sophisticated parser

  if (points.length === 0) {
    return {
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      center: { x: 0, y: 0 },
      area: 0,
      pointCount: 0
    }
  }

  // Calculate min/max from sampled points (curves already converted)
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

  for (const p of points) {
    xMin = Math.min(xMin, p.x)
    xMax = Math.max(xMax, p.x)
    yMin = Math.min(yMin, p.y)
    yMax = Math.max(yMax, p.y)
  }

  const width = xMax - xMin
  const height = yMax - yMin

  return {
    bbox: { x: xMin, y: yMin, width, height },
    center: { x: xMin + width / 2, y: yMin + height / 2 },
    area: width * height,
    pointCount: points.length
  }
}

/**
 * Calculate centroid using three different weighting strategies
 */
function calculateAllStrategies(paths: PathAnalysis[]): {
  equal: Point
  area: Point
  complexity: Point
} {
  // Strategy 1: Equal weight - each path gets 1 vote
  const equal = {
    x: paths.reduce((sum, p) => sum + p.center.x, 0) / paths.length,
    y: paths.reduce((sum, p) => sum + p.center.y, 0) / paths.length
  }

  // Strategy 2: Area-weighted - larger shapes have more influence
  const totalArea = paths.reduce((sum, p) => sum + p.area, 0)
  const area = totalArea > 0 ? {
    x: paths.reduce((sum, p) => sum + p.center.x * p.area, 0) / totalArea,
    y: paths.reduce((sum, p) => sum + p.center.y * p.area, 0) / totalArea
  } : equal

  // Strategy 3: Complexity-weighted - more complex shapes have more influence
  const totalPoints = paths.reduce((sum, p) => sum + p.pointCount, 0)
  const complexity = totalPoints > 0 ? {
    x: paths.reduce((sum, p) => sum + p.center.x * p.pointCount, 0) / totalPoints,
    y: paths.reduce((sum, p) => sum + p.center.y * p.pointCount, 0) / totalPoints
  } : equal

  return { equal, area, complexity }
}

/**
 * Calculate variance between strategy results
 * Low variance = strategies agree = high confidence
 * High variance = strategies disagree = uncertain
 */
function calculateStrategyVariance(strategies: Point[]): number {
  const avgX = strategies.reduce((sum, s) => sum + s.x, 0) / strategies.length
  const avgY = strategies.reduce((sum, s) => sum + s.y, 0) / strategies.length

  const variance = strategies.reduce((sum, s) => {
    const dx = s.x - avgX
    const dy = s.y - avgY
    return sum + (dx * dx + dy * dy)  // Euclidean distance squared
  }, 0) / strategies.length

  return Math.sqrt(variance)  // Standard deviation in coordinate units
}

/**
 * Select best strategy based on how well strategies agree
 */
function selectStrategyByVariance(
  equal: Point,
  area: Point,
  complexity: Point
): { centroid: Point; confidence: number } {
  const strategies = [equal, area, complexity]
  const variance = calculateStrategyVariance(strategies)

  // Variance thresholds (in SVG coordinate units)
  const LOW_VARIANCE = 2.0    // Strategies agree closely
  const MED_VARIANCE = 8.0    // Moderate disagreement

  if (variance < LOW_VARIANCE) {
    // All strategies agree - high confidence, use area (most intuitive)
    return {
      centroid: area,
      confidence: 0.9
    }
  } else if (variance < MED_VARIANCE) {
    // Moderate disagreement - use average as compromise
    const averaged = {
      x: (equal.x + area.x + complexity.x) / 3,
      y: (equal.y + area.y + complexity.y) / 3
    }
    return {
      centroid: averaged,
      confidence: 0.7
    }
  } else {
    // High disagreement - low confidence, use most conservative (equal)
    return {
      centroid: equal,
      confidence: 0.5
    }
  }
}

/**
 * Calculate centroid for multi-path SVGs using variance-based strategy selection
 * Falls back gracefully for single-path or empty SVGs
 */
function calculateMultiPathCentroid(svgContent: string): {
  centroid: Point
  confidence: number
} | null {
  // Extract all paths
  const pathsData = extractAllPathsData(svgContent)
  if (pathsData.length === 0) return null

  // Calculate bounding box for each path (reuses curve sampling)
  const pathAnalyses = pathsData
    .map(pathData => calculatePathBoundingBox(pathData))
    .filter(p => p.pointCount > 0 && p.area > 0)  // Filter empty/degenerate paths

  if (pathAnalyses.length === 0) return null

  // Single path - all strategies give same result
  if (pathAnalyses.length === 1) {
    return {
      centroid: pathAnalyses[0].center,
      confidence: 0.8
    }
  }

  // Multi-path - calculate all strategies
  const { equal, area, complexity } = calculateAllStrategies(pathAnalyses)

  // Select best strategy based on variance
  return selectStrategyByVariance(equal, area, complexity)
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Shape detection helper functions removed - using general-purpose centroid calculation for all paths

/**
 * Extract coordinate points from path data
 */
/**
 * Parse SVG path data and extract points, converting curves to line segments
 * Handles M, L, H, V, C, S, Q, T, A commands (absolute and relative)
 */
function extractPathPoints(pathData: string): Point[] {
  const points: Point[] = []
  let currentX = 0
  let currentY = 0
  let startX = 0
  let startY = 0

  // Parse path commands with their parameters
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g
  let match

  while ((match = commandRegex.exec(pathData)) !== null) {
    const command = match[1]
    const paramsStr = match[2].trim()
    // Match numbers including those starting with decimal point (e.g., .5, .224, -.433)
    const params = paramsStr.match(/-?(?:\d+\.?\d*|\.\d+)/g)?.map(Number) || []

    switch (command) {
      case 'M': // Move to (absolute)
        if (params.length >= 2) {
          currentX = params[0]
          currentY = params[1]
          startX = currentX
          startY = currentY
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'm': // Move to (relative)
        if (params.length >= 2) {
          currentX += params[0]
          currentY += params[1]
          startX = currentX
          startY = currentY
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'L': // Line to (absolute)
        for (let i = 0; i < params.length; i += 2) {
          currentX = params[i]
          currentY = params[i + 1]
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'l': // Line to (relative)
        for (let i = 0; i < params.length; i += 2) {
          currentX += params[i]
          currentY += params[i + 1]
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'H': // Horizontal line (absolute)
        for (const x of params) {
          currentX = x
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'h': // Horizontal line (relative)
        for (const dx of params) {
          currentX += dx
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'V': // Vertical line (absolute)
        for (const y of params) {
          currentY = y
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'v': // Vertical line (relative)
        for (const dy of params) {
          currentY += dy
          points.push({ x: currentX, y: currentY })
        }
        break

      case 'C': // Cubic bezier (absolute)
        for (let i = 0; i < params.length; i += 6) {
          const cp1x = params[i]
          const cp1y = params[i + 1]
          const cp2x = params[i + 2]
          const cp2y = params[i + 3]
          const x = params[i + 4]
          const y = params[i + 5]

          // Sample the curve with 10 points
          for (let t = 0.1; t <= 1; t += 0.1) {
            const mt = 1 - t
            const px = mt * mt * mt * currentX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * x
            const py = mt * mt * mt * currentY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * y
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'c': // Cubic bezier (relative)
        for (let i = 0; i < params.length; i += 6) {
          const cp1x = currentX + params[i]
          const cp1y = currentY + params[i + 1]
          const cp2x = currentX + params[i + 2]
          const cp2y = currentY + params[i + 3]
          const x = currentX + params[i + 4]
          const y = currentY + params[i + 5]

          // Sample the curve with 10 points
          for (let t = 0.1; t <= 1; t += 0.1) {
            const mt = 1 - t
            const px = mt * mt * mt * currentX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * x
            const py = mt * mt * mt * currentY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * y
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'Q': // Quadratic bezier (absolute)
        for (let i = 0; i < params.length; i += 4) {
          const cpx = params[i]
          const cpy = params[i + 1]
          const x = params[i + 2]
          const y = params[i + 3]

          // Sample the curve with 8 points
          for (let t = 0.125; t <= 1; t += 0.125) {
            const mt = 1 - t
            const px = mt * mt * currentX + 2 * mt * t * cpx + t * t * x
            const py = mt * mt * currentY + 2 * mt * t * cpy + t * t * y
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'q': // Quadratic bezier (relative)
        for (let i = 0; i < params.length; i += 4) {
          const cpx = currentX + params[i]
          const cpy = currentY + params[i + 1]
          const x = currentX + params[i + 2]
          const y = currentY + params[i + 3]

          // Sample the curve with 8 points
          for (let t = 0.125; t <= 1; t += 0.125) {
            const mt = 1 - t
            const px = mt * mt * currentX + 2 * mt * t * cpx + t * t * x
            const py = mt * mt * currentY + 2 * mt * t * cpy + t * t * y
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'A': // Arc (absolute) - Approximate with line segments
        for (let i = 0; i < params.length; i += 7) {
          const x = params[i + 5]
          const y = params[i + 6]

          // Simple approximation: create 8 intermediate points
          for (let j = 1; j <= 8; j++) {
            const t = j / 8
            const px = currentX + (x - currentX) * t
            const py = currentY + (y - currentY) * t
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'a': // Arc (relative) - Approximate with line segments
        for (let i = 0; i < params.length; i += 7) {
          const x = currentX + params[i + 5]
          const y = currentY + params[i + 6]

          // Simple approximation: create 8 intermediate points
          for (let j = 1; j <= 8; j++) {
            const t = j / 8
            const px = currentX + (x - currentX) * t
            const py = currentY + (y - currentY) * t
            points.push({ x: px, y: py })
          }

          currentX = x
          currentY = y
        }
        break

      case 'Z':
      case 'z': // Close path
        if (currentX !== startX || currentY !== startY) {
          points.push({ x: startX, y: startY })
          currentX = startX
          currentY = startY
        }
        break
    }
  }

  return points
}

/**
 * Calculate centroid of a polygon using the shoelace formula
 */
function calculatePolygonCentroidFromPoints(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]
  if (points.length === 2) return {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2
  }

  let area = 0
  let centroidX = 0
  let centroidY = 0

  // Apply shoelace formula for polygon centroid
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const cross = points[i].x * points[j].y - points[j].x * points[i].y

    area += cross
    centroidX += (points[i].x + points[j].x) * cross
    centroidY += (points[i].y + points[j].y) * cross
  }

  area = area / 2

  if (Math.abs(area) < 0.000001) {
    // Degenerate case - return average of points
    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length
    return {
      x: isFinite(avgX) ? avgX : 0,
      y: isFinite(avgY) ? avgY : 0
    }
  }

  centroidX = centroidX / (6 * area)
  centroidY = centroidY / (6 * area)

  // Safety guard against NaN/infinite values
  const safeX = isFinite(centroidX) ? centroidX : 0
  const safeY = isFinite(centroidY) ? centroidY : 0

  return { x: safeX, y: safeY }
}

// Helper functions removed - using general-purpose calculatePathCentroid() for all paths