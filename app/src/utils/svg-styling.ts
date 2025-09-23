/**
 * SVG Styling Utilities
 *
 * Pure TypeScript utilities for injecting colors, stroke properties,
 * and other styling into SVG content while maintaining security.
 *
 * @author Claude AI Assistant
 * @version 1.0.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** SVG color styling options */
export interface SvgColorStyling {
  /** Fill color (hex, rgb, or CSS color name) */
  fill?: string
  /** Stroke color */
  stroke?: string
  /** Whether to force fill on all elements */
  forceFill?: boolean
  /** Whether to force stroke on all elements */
  forceStroke?: boolean
}

/** SVG stroke styling options */
export interface SvgStrokeStyling {
  /** Stroke width */
  width?: number
  /** Stroke line join style */
  linejoin?: 'round' | 'miter' | 'bevel' | 'arcs' | 'miter-clip'
  /** Stroke line cap style */
  linecap?: 'butt' | 'round' | 'square'
  /** Stroke dash array */
  dasharray?: string
  /** Stroke opacity */
  opacity?: number
}

/** Complete SVG styling configuration */
export interface SvgCompleteStiling {
  colors?: SvgColorStyling
  stroke?: SvgStrokeStyling
  /** Additional CSS properties */
  additionalStyles?: Record<string, string | number>
  /** Whether to preserve original styles */
  preserveOriginal?: boolean
}

// ============================================================================
// COLOR INJECTION UTILITIES
// ============================================================================

/**
 * Inject fill and stroke colors into SVG content
 * Intelligently applies colors to appropriate elements
 *
 * @param svgContent - Original SVG content
 * @param fillColor - Fill color to apply
 * @param strokeColor - Stroke color to apply
 * @param options - Additional color styling options
 * @returns SVG content with colors applied
 *
 * @example
 * const coloredSvg = injectSvgColors(
 *   svgContent,
 *   '#ff0000',
 *   '#000000',
 *   { forceFill: true }
 * )
 */
export function injectSvgColors(
  svgContent: string,
  fillColor?: string,
  strokeColor?: string,
  options: Omit<SvgColorStyling, 'fill' | 'stroke'> = {}
): string {
  if (!svgContent) return svgContent

  let processedSvg = svgContent

  try {
    // Apply colors to the root SVG element
    if (fillColor || strokeColor) {
      processedSvg = applyColorsToElement(processedSvg, 'svg', fillColor, strokeColor, options)
    }

    // Apply colors to path elements (most common)
    if (fillColor || strokeColor) {
      processedSvg = applyColorsToElement(processedSvg, 'path', fillColor, strokeColor, options)
    }

    // Apply colors to other shape elements
    const shapeElements = ['circle', 'rect', 'ellipse', 'polygon', 'line', 'polyline']
    shapeElements.forEach(elementType => {
      if (fillColor || strokeColor) {
        processedSvg = applyColorsToElement(processedSvg, elementType, fillColor, strokeColor, options)
      }
    })

    // Apply colors to text elements if specified
    if ((fillColor && options.forceFill) || (strokeColor && options.forceStroke)) {
      processedSvg = applyColorsToElement(processedSvg, 'text', fillColor, strokeColor, options)
    }

    return processedSvg

  } catch (error) {
    // Failed to inject SVG colors
    return svgContent
  }
}

/**
 * Apply colors to specific element type in SVG
 *
 * @param svgContent - SVG content
 * @param elementType - Type of element to target
 * @param fillColor - Fill color
 * @param strokeColor - Stroke color
 * @param options - Color styling options
 * @returns Modified SVG content
 */
function applyColorsToElement(
  svgContent: string,
  elementType: string,
  fillColor?: string,
  strokeColor?: string,
  options: Omit<SvgColorStyling, 'fill' | 'stroke'> = {}
): string {
  // Updated regex to match both self-closing and opening tags while preserving structure
  const regex = new RegExp(`<${elementType}([^>]*?)(/?)>`, 'gi')

  return svgContent.replace(regex, (_match, attributes, selfClosing) => {
    let modifiedAttributes = attributes

    // Handle fill color
    if (fillColor) {
      if (options.forceFill || !attributes.includes('fill=')) {
        // Remove existing fill if forcing
        if (options.forceFill) {
          modifiedAttributes = modifiedAttributes.replace(/\s*fill=["'][^"']*["']/gi, '')
        }

        // Add fill if not present or if forcing
        if (!attributes.includes('fill=') || options.forceFill) {
          modifiedAttributes += ` fill="${fillColor}"`
        }
      } else if (attributes.includes('fill="currentColor"') || attributes.includes("fill='currentColor'")) {
        // Replace currentColor with actual color
        modifiedAttributes = modifiedAttributes.replace(/fill=["']currentColor["']/gi, `fill="${fillColor}"`)
      }
    }

    // Handle stroke color
    if (strokeColor) {
      if (options.forceStroke || !attributes.includes('stroke=')) {
        // Remove existing stroke if forcing
        if (options.forceStroke) {
          modifiedAttributes = modifiedAttributes.replace(/\s*stroke=["'][^"']*["']/gi, '')
        }

        // Add stroke if not present or if forcing
        if (!attributes.includes('stroke=') || options.forceStroke) {
          modifiedAttributes += ` stroke="${strokeColor}"`
        }
      } else if (attributes.includes('stroke="currentColor"') || attributes.includes("stroke='currentColor'")) {
        // Replace currentColor with actual color
        modifiedAttributes = modifiedAttributes.replace(/stroke=["']currentColor["']/gi, `stroke="${strokeColor}"`)
      }
    }

    // Preserve self-closing structure: add back the slash if it was there originally
    return `<${elementType}${modifiedAttributes}${selfClosing}>`
  })
}

// ============================================================================
// STROKE PROPERTIES APPLICATION
// ============================================================================

/**
 * Apply stroke width and line join to SVG elements
 *
 * @param svgContent - Original SVG content
 * @param strokeWidth - Stroke width to apply
 * @param strokeLinejoin - Stroke line join style
 * @param options - Additional stroke styling options
 * @returns SVG content with stroke properties applied
 *
 * @example
 * const styledSvg = applySvgStrokeProperties(
 *   svgContent,
 *   2,
 *   'round',
 *   { linecap: 'round', opacity: 0.8 }
 * )
 */
export function applySvgStrokeProperties(
  svgContent: string,
  strokeWidth?: number,
  strokeLinejoin?: string,
  options: Omit<SvgStrokeStyling, 'width' | 'linejoin'> = {}
): string {
  if (!svgContent) return svgContent

  let processedSvg = svgContent

  try {
    const strokeProps: Record<string, string | number> = {}

    if (strokeWidth !== undefined) {
      strokeProps['stroke-width'] = strokeWidth
    }

    if (strokeLinejoin) {
      strokeProps['stroke-linejoin'] = strokeLinejoin
    }

    if (options.linecap) {
      strokeProps['stroke-linecap'] = options.linecap
    }

    if (options.dasharray) {
      strokeProps['stroke-dasharray'] = options.dasharray
    }

    if (options.opacity !== undefined) {
      strokeProps['stroke-opacity'] = options.opacity
    }

    if (Object.keys(strokeProps).length === 0) {
      return svgContent
    }

    // Apply stroke properties to various element types
    const elementTypes = ['svg', 'path', 'circle', 'rect', 'ellipse', 'polygon', 'line', 'polyline']

    elementTypes.forEach(elementType => {
      processedSvg = applyStrokePropertiesToElement(processedSvg, elementType, strokeProps)
    })

    return processedSvg

  } catch (error) {
    // Failed to apply SVG stroke properties
    return svgContent
  }
}

/**
 * Apply stroke properties to specific element type
 *
 * @param svgContent - SVG content
 * @param elementType - Element type to target
 * @param strokeProps - Stroke properties to apply
 * @returns Modified SVG content
 */
function applyStrokePropertiesToElement(
  svgContent: string,
  elementType: string,
  strokeProps: Record<string, string | number>
): string {
  // Updated regex to match both self-closing and opening tags while preserving structure
  const regex = new RegExp(`<${elementType}([^>]*?)(/?)>`, 'gi')

  return svgContent.replace(regex, (_match, attributes, selfClosing) => {
    let modifiedAttributes = attributes

    Object.entries(strokeProps).forEach(([prop, value]) => {
      const attrRegex = new RegExp(`\\s*${prop}=["'][^"']*["']`, 'gi')

      // Remove existing property
      modifiedAttributes = modifiedAttributes.replace(attrRegex, '')

      // Add new property
      modifiedAttributes += ` ${prop}="${value}"`
    })

    // Preserve self-closing structure: add back the slash if it was there originally
    return `<${elementType}${modifiedAttributes}${selfClosing}>`
  })
}

// ============================================================================
// CURRENTCOLOR NORMALIZATION
// ============================================================================

/**
 * Ensure currentColor works correctly in SVG by normalizing inheritance
 * Adds explicit currentColor where needed for proper CSS inheritance
 *
 * @param svgContent - SVG content to normalize
 * @returns SVG content with normalized currentColor usage
 *
 * @example
 * const normalized = normalizeSvgCurrentColor('<svg><path d="..."/></svg>')
 * // Returns: '<svg><path d="..." fill="currentColor"/></svg>'
 */
export function normalizeSvgCurrentColor(svgContent: string): string {
  if (!svgContent) return svgContent

  let processedSvg = svgContent

  try {
    // Elements that should inherit color by default
    const inheritElements = ['path', 'circle', 'rect', 'ellipse', 'polygon', 'line', 'polyline']

    inheritElements.forEach(elementType => {
      // Updated regex to match both self-closing and opening tags while preserving structure
      const regex = new RegExp(`<${elementType}([^>]*?)(/?)>`, 'gi')

      processedSvg = processedSvg.replace(regex, (match, attributes, selfClosing) => {
        // If element doesn't have explicit fill and no stroke, add currentColor fill
        if (!attributes.includes('fill=') && !attributes.includes('stroke=')) {
          return `<${elementType}${attributes} fill="currentColor"${selfClosing}>`
        }

        // If element has stroke="currentColor" but no fill, ensure it inherits properly
        if (attributes.includes('stroke="currentColor"') && !attributes.includes('fill=')) {
          return `<${elementType}${attributes} fill="none"${selfClosing}>`
        }

        return match
      })
    })

    return processedSvg

  } catch (error) {
    // Failed to normalize SVG currentColor
    return svgContent
  }
}

// ============================================================================
// COMPLETE STYLING APPLICATION
// ============================================================================

/**
 * Apply complete styling configuration to SVG content
 * Combines color injection, stroke properties, and additional styles
 *
 * @param svgContent - Original SVG content
 * @param styling - Complete styling configuration
 * @returns Fully styled SVG content
 *
 * @example
 * const styled = applyCompleteSvgStyling(svgContent, {
 *   colors: { fill: '#ff0000', stroke: '#000000' },
 *   stroke: { width: 2, linejoin: 'round' },
 *   additionalStyles: { opacity: 0.9 }
 * })
 */
export function applyCompleteSvgStyling(
  svgContent: string,
  styling: SvgCompleteStiling
): string {
  if (!svgContent || !styling) return svgContent

  let processedSvg = svgContent

  try {
    // Apply color styling
    if (styling.colors) {
      processedSvg = injectSvgColors(
        processedSvg,
        styling.colors.fill,
        styling.colors.stroke,
        {
          forceFill: styling.colors.forceFill,
          forceStroke: styling.colors.forceStroke
        }
      )
    }

    // Apply stroke properties
    if (styling.stroke) {
      processedSvg = applySvgStrokeProperties(
        processedSvg,
        styling.stroke.width,
        styling.stroke.linejoin,
        {
          linecap: styling.stroke.linecap,
          dasharray: styling.stroke.dasharray,
          opacity: styling.stroke.opacity
        }
      )
    }

    // Apply additional styles via CSS
    if (styling.additionalStyles) {
      processedSvg = applyAdditionalStyles(processedSvg, styling.additionalStyles)
    }

    // Normalize currentColor if not preserving original styles
    if (!styling.preserveOriginal) {
      processedSvg = normalizeSvgCurrentColor(processedSvg)
    }

    return processedSvg

  } catch (error) {
    // Failed to apply complete SVG styling
    return svgContent
  }
}

/**
 * Apply additional CSS styles to SVG root element
 *
 * @param svgContent - SVG content
 * @param styles - Additional styles to apply
 * @returns SVG content with additional styles
 */
function applyAdditionalStyles(
  svgContent: string,
  styles: Record<string, string | number>
): string {
  const styleEntries = Object.entries(styles).map(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    return `${cssKey}: ${value}`
  })

  if (styleEntries.length === 0) return svgContent

  const styleString = styleEntries.join('; ')

  return svgContent.replace(
    /<svg([^>]*?)>/i,
    (match, attributes) => {
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
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract current colors from SVG content
 *
 * @param svgContent - SVG content to analyze
 * @returns Object with detected colors
 */
export function extractSvgColors(svgContent: string): {
  fills: string[]
  strokes: string[]
  hasCurrentColor: boolean
} {
  const fills: string[] = []
  const strokes: string[] = []
  let hasCurrentColor = false

  try {
    // Extract fill colors
    const fillMatches = svgContent.match(/fill=["']([^"']*)["']/gi) || []
    fillMatches.forEach(match => {
      const color = match.match(/fill=["']([^"']*)["']/i)?.[1]
      if (color) {
        if (color === 'currentColor') {
          hasCurrentColor = true
        } else {
          fills.push(color)
        }
      }
    })

    // Extract stroke colors
    const strokeMatches = svgContent.match(/stroke=["']([^"']*)["']/gi) || []
    strokeMatches.forEach(match => {
      const color = match.match(/stroke=["']([^"']*)["']/i)?.[1]
      if (color) {
        if (color === 'currentColor') {
          hasCurrentColor = true
        } else {
          strokes.push(color)
        }
      }
    })

    return {
      fills: Array.from(new Set(fills)), // Remove duplicates
      strokes: Array.from(new Set(strokes)),
      hasCurrentColor
    }

  } catch (error) {
    // Failed to extract SVG colors
    return { fills: [], strokes: [], hasCurrentColor: false }
  }
}

/**
 * Check if SVG content has any fill or stroke attributes
 *
 * @param svgContent - SVG content to check
 * @returns True if SVG has explicit color attributes
 */
export function hasSvgColors(svgContent: string): boolean {
  if (!svgContent) return false

  return (
    svgContent.includes('fill=') ||
    svgContent.includes('stroke=')
  )
}

/**
 * Create CSS color string that's safe for SVG
 *
 * @param color - Color value (hex, rgb, name, etc.)
 * @returns Sanitized color string
 */
export function sanitizeColorValue(color: string): string {
  if (!color || typeof color !== 'string') return 'currentColor'

  // Remove any potentially dangerous content
  const sanitized = color
    .replace(/[<>'"]/g, '') // Remove HTML/XML chars
    .replace(/javascript:/gi, '') // Remove JS protocols
    .trim()

  // Basic validation for common color formats
  if (
    sanitized.match(/^#[0-9a-fA-F]{3,8}$/) || // Hex colors
    sanitized.match(/^rgb\([\d\s,]+\)$/i) || // RGB colors
    sanitized.match(/^rgba\([\d\s,.]+\)$/i) || // RGBA colors
    sanitized.match(/^hsl\([\d\s,%]+\)$/i) || // HSL colors
    sanitized.match(/^hsla\([\d\s,%.]+\)$/i) || // HSLA colors
    sanitized === 'currentColor' ||
    sanitized === 'transparent' ||
    sanitized === 'none'
  ) {
    return sanitized
  }

  // CSS named colors (basic set)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'lime', 'navy'
  ]

  if (namedColors.includes(sanitized.toLowerCase())) {
    return sanitized.toLowerCase()
  }

  // If not recognized, return currentColor as safe fallback
  return 'currentColor'
}