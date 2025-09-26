/**
 * SVG Content Processing Utilities
 *
 * Pure TypeScript utilities for parsing, manipulating, and processing SVG content.
 * Handles SVG styling injection, sanitization, and content analysis.
 *
 * @author Claude AI Assistant
 * @version 1.0.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** SVG metadata extracted from content */
export interface SvgMetadata {
  /** Original viewBox values */
  viewBox: {
    x: number
    y: number
    width: number
    height: number
  }
  /** Intrinsic width and height */
  dimensions: {
    width: number
    height: number
  }
  /** Whether the SVG has explicit dimensions */
  hasExplicitDimensions: boolean
  /** Whether the SVG has a viewBox */
  hasViewBox: boolean
  /** Center point based on viewBox or dimensions */
  center: {
    x: number
    y: number
  }
}

/** SVG styling properties to apply */
export interface SvgStyling {
  /** Fill color */
  fill?: string
  /** Stroke color */
  stroke?: string
  /** Stroke width */
  strokeWidth?: number
  /** Stroke line join */
  strokeLinejoin?: string
  /** Additional CSS properties */
  additionalStyles?: Record<string, string | number>
}

/** Bounds for centering SVG content */
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// ============================================================================
// SVG PARSING AND METADATA EXTRACTION
// ============================================================================

/**
 * Parse SVG content and extract comprehensive metadata
 *
 * @param svgContent - Raw SVG markup string
 * @returns Extracted SVG metadata or null if invalid
 *
 * @example
 * const metadata = parseSvgContent('<svg viewBox="0 0 24 24">...</svg>')
 * // Returns: { viewBox: { x: 0, y: 0, width: 24, height: 24 }, ... }
 */
export function parseSvgContent(svgContent: string): SvgMetadata | null {
  if (!svgContent || typeof svgContent !== 'string') {
    return null
  }

  try {
    // Create a temporary DOM element to parse SVG
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) {
      return null
    }

    // Extract viewBox
    const viewBoxAttr = svgElement.getAttribute('viewBox')
    let viewBox = { x: 0, y: 0, width: 24, height: 24 } // Default
    let hasViewBox = false

    if (viewBoxAttr) {
      const viewBoxValues = viewBoxAttr.trim().split(/\s+/).map(Number)
      if (viewBoxValues.length === 4 && viewBoxValues.every(v => isFinite(v))) {
        viewBox = {
          x: viewBoxValues[0],
          y: viewBoxValues[1],
          width: viewBoxValues[2],
          height: viewBoxValues[3]
        }
        hasViewBox = true
      }
    }

    // Extract explicit dimensions
    const widthAttr = svgElement.getAttribute('width')
    const heightAttr = svgElement.getAttribute('height')
    let dimensions = { width: viewBox.width, height: viewBox.height }
    let hasExplicitDimensions = false

    if (widthAttr && heightAttr) {
      const width = parseFloat(widthAttr)
      const height = parseFloat(heightAttr)
      if (isFinite(width) && isFinite(height)) {
        dimensions = { width, height }
        hasExplicitDimensions = true
      }
    }

    // Calculate center point
    const center = {
      x: viewBox.x + viewBox.width / 2,
      y: viewBox.y + viewBox.height / 2
    }

    return {
      viewBox,
      dimensions,
      hasExplicitDimensions,
      hasViewBox,
      center
    }

  } catch (error) {
    // Failed to parse SVG content
    return null
  }
}

/**
 * Extract viewBox from SVG content as string values
 *
 * @param svgContent - SVG markup string
 * @returns ViewBox string or null if not found
 *
 * @example
 * const viewBox = extractViewBoxString('<svg viewBox="0 0 100 100">...</svg>')
 * // Returns: "0 0 100 100"
 */
export function extractViewBoxString(svgContent: string): string | null {
  if (!svgContent) return null

  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i)
  return viewBoxMatch ? viewBoxMatch[1] : null
}

// ============================================================================
// SVG STYLING APPLICATION
// ============================================================================

/**
 * Apply styling properties to SVG content
 * Injects styles into SVG elements to override defaults
 *
 * @param svgContent - Original SVG content
 * @param styling - Styling properties to apply
 * @returns Styled SVG content
 *
 * @example
 * const styled = applySvgStyling(svgContent, {
 *   fill: '#ff0000',
 *   stroke: '#000000',
 *   strokeWidth: 2
 * })
 */
export function applySvgStyling(svgContent: string, styling: SvgStyling): string {
  if (!svgContent || !styling) return svgContent

  let processedSvg = svgContent

  try {
    // Build style string
    const styleProps: string[] = []

    if (styling.fill !== undefined) {
      styleProps.push(`fill: ${styling.fill}`)
    }

    if (styling.stroke !== undefined) {
      styleProps.push(`stroke: ${styling.stroke}`)
    }

    if (styling.strokeWidth !== undefined) {
      styleProps.push(`stroke-width: ${styling.strokeWidth}`)
    }

    if (styling.strokeLinejoin !== undefined) {
      styleProps.push(`stroke-linejoin: ${styling.strokeLinejoin}`)
    }

    // Add additional styles
    if (styling.additionalStyles) {
      Object.entries(styling.additionalStyles).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        styleProps.push(`${cssKey}: ${value}`)
      })
    }

    if (styleProps.length === 0) return svgContent

    const styleString = styleProps.join('; ')

    // Apply styles to the root SVG element
    processedSvg = processedSvg.replace(
      /<svg([^>]*?)>/i,
      (match, attributes) => {
        // Check if style attribute already exists
        if (attributes.includes('style=')) {
          return match.replace(
            /style=["']([^"']*)["']/i,
            `style="$1; ${styleString}"`
          )
        } else {
          return `<svg${attributes} style="${styleString}">`
        }
      }
    )

    // Also apply currentColor to path elements that don't have explicit fill
    processedSvg = processedSvg.replace(
      /<path([^>]*?)>/gi,
      (match, attributes) => {
        // If path doesn't have fill or has fill="currentColor", ensure it inherits
        if (!attributes.includes('fill=') || attributes.includes('fill="currentColor"')) {
          if (!attributes.includes('fill=')) {
            return `<path${attributes} fill="currentColor">`
          }
        }
        return match
      }
    )

    // Apply to other shape elements (circle, rect, ellipse, polygon)
    const shapeElements = ['circle', 'rect', 'ellipse', 'polygon', 'line', 'polyline']
    shapeElements.forEach(element => {
      const regex = new RegExp(`<${element}([^>]*?)>`, 'gi')
      processedSvg = processedSvg.replace(regex, (match, attributes) => {
        if (!attributes.includes('fill=')) {
          return `<${element}${attributes} fill="currentColor">`
        }
        return match
      })
    })

    return processedSvg

  } catch (error) {
    // Failed to apply SVG styling
    return svgContent
  }
}

// ============================================================================
// SVG POSITIONING AND CENTERING
// ============================================================================

/**
 * Calculate transform for centering SVG content within bounds
 *
 * @param metadata - SVG metadata from parseSvgContent
 * @param bounds - Target bounds for centering
 * @returns Transform string for centering
 *
 * @example
 * const transform = calculateCenterTransform(metadata, { x: 0, y: 0, width: 100, height: 100 })
 * // Returns: "translate(25, 25) scale(0.8)"
 */
export function calculateCenterTransform(metadata: SvgMetadata, bounds: Bounds): string {
  if (!metadata) return ''

  const { viewBox } = metadata

  // Calculate target center
  const targetCenterX = bounds.x + bounds.width / 2
  const targetCenterY = bounds.y + bounds.height / 2

  // Calculate scale to fit within bounds while maintaining aspect ratio
  const scaleX = bounds.width / viewBox.width
  const scaleY = bounds.height / viewBox.height
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up

  // Calculate translation to center the scaled SVG
  // Calculate scaled dimensions for reference
  // const scaledWidth = viewBox.width * scale
  // const scaledHeight = viewBox.height * scale

  const translateX = targetCenterX - (viewBox.x + viewBox.width / 2) * scale
  const translateY = targetCenterY - (viewBox.y + viewBox.height / 2) * scale

  const transforms = []

  if (translateX !== 0 || translateY !== 0) {
    transforms.push(`translate(${translateX.toFixed(2)}, ${translateY.toFixed(2)})`)
  }

  if (scale !== 1) {
    transforms.push(`scale(${scale.toFixed(3)})`)
  }

  return transforms.join(' ')
}

/**
 * Center SVG content within specified bounds by wrapping in a group
 *
 * @param svgContent - Original SVG content
 * @param bounds - Bounds for centering
 * @returns SVG content wrapped with centering transform
 *
 * @example
 * const centered = centerSvgContent(svgContent, { x: 0, y: 0, width: 100, height: 100 })
 */
export function centerSvgContent(svgContent: string, bounds: Bounds): string {
  if (!svgContent) return svgContent

  const metadata = parseSvgContent(svgContent)
  if (!metadata) return svgContent

  const transform = calculateCenterTransform(metadata, bounds)
  if (!transform) return svgContent

  // Wrap the SVG content in a group with the centering transform
  const wrappedContent = svgContent.replace(
    /(<svg[^>]*>)([\s\S]*?)(<\/svg>)/i,
    `$1<g transform="${transform}">$2</g>$3`
  )

  return wrappedContent
}

// ============================================================================
// SVG NORMALIZATION
// ============================================================================

/**
 * Normalize SVG viewBox for consistent scaling
 * Ensures all SVGs have a proper viewBox attribute
 *
 * @param svgContent - Original SVG content
 * @returns SVG with normalized viewBox
 *
 * @example
 * const normalized = normalizeSvgViewBox('<svg width="24" height="24">...</svg>')
 * // Returns: '<svg width="24" height="24" viewBox="0 0 24 24">...</svg>'
 */
export function normalizeSvgViewBox(svgContent: string): string {
  if (!svgContent) return svgContent

  const metadata = parseSvgContent(svgContent)
  if (!metadata) return svgContent

  // If SVG already has a viewBox, return as-is
  if (metadata.hasViewBox) {
    return svgContent
  }

  // Add viewBox based on dimensions
  const { width, height } = metadata.dimensions
  const viewBoxValue = `0 0 ${width} ${height}`

  const normalizedSvg = svgContent.replace(
    /<svg([^>]*?)>/i,
    `<svg$1 viewBox="${viewBoxValue}">`
  )

  return normalizedSvg
}

/**
 * Remove explicit width/height attributes to allow flexible sizing
 *
 * @param svgContent - SVG content with explicit dimensions
 * @returns SVG content without width/height attributes
 *
 * @example
 * const flexible = removeExplicitDimensions('<svg width="24" height="24" viewBox="0 0 24 24">...</svg>')
 * // Returns: '<svg viewBox="0 0 24 24">...</svg>'
 */
export function removeExplicitDimensions(svgContent: string): string {
  if (!svgContent) return svgContent

  return svgContent.replace(
    /<svg([^>]*?)\s*(width|height)=["'][^"']*["']([^>]*?)>/gi,
    (match, _before, _attr, _after) => {
      // Remove both width and height
      let cleaned = match
      cleaned = cleaned.replace(/\s*width=["'][^"']*["']/gi, '')
      cleaned = cleaned.replace(/\s*height=["'][^"']*["']/gi, '')
      return cleaned
    }
  )
}

// ============================================================================
// SVG VALIDATION AND SANITIZATION
// ============================================================================


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the aspect ratio of SVG content
 *
 * @param metadata - SVG metadata
 * @returns Aspect ratio (width / height)
 */
export function getSvgAspectRatio(metadata: SvgMetadata): number {
  if (!metadata || metadata.viewBox.height === 0) return 1
  return metadata.viewBox.width / metadata.viewBox.height
}

/**
 * Check if SVG is square (aspect ratio close to 1:1)
 *
 * @param metadata - SVG metadata
 * @param tolerance - Tolerance for aspect ratio comparison
 * @returns True if SVG is approximately square
 */
export function isSvgSquare(metadata: SvgMetadata, tolerance = 0.1): boolean {
  const aspectRatio = getSvgAspectRatio(metadata)
  return Math.abs(aspectRatio - 1) <= tolerance
}

/**
 * Calculate optimal size for SVG within constraints
 *
 * @param metadata - SVG metadata
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Optimal dimensions
 */
export function calculateOptimalSvgSize(
  metadata: SvgMetadata,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (!metadata) return { width: maxWidth, height: maxHeight }

  const aspectRatio = getSvgAspectRatio(metadata)

  let width = maxWidth
  let height = width / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return { width: Math.round(width), height: Math.round(height) }
}