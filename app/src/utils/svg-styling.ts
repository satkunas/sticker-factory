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

// ============================================================================
// COLOR INJECTION UTILITIES
// ============================================================================

/**
 * Inject fill and stroke colors into SVG content
 *
 * This function ALWAYS overrides hardcoded colors in SVG files to ensure
 * user-selected colors are applied. When colors are provided:
 * - SVG, path, and shape elements: colors always applied (overrides hardcoded values)
 * - Text elements: colors only applied if forceFill/forceStroke options are set
 *
 * @param svgContent - Original SVG content
 * @param fillColor - Fill color to apply (overrides all existing fills)
 * @param strokeColor - Stroke color to apply (overrides all existing strokes)
 * @param options - Control which element types to color (forceFill/forceStroke for text)
 * @returns SVG content with colors applied
 *
 * @example
 * // Color all elements including text
 * const coloredSvg = injectSvgColors(
 *   svgContent,
 *   '#ff0000',
 *   '#000000',
 *   { forceFill: true }
 * )
 *
 * @example
 * // Color shapes only, preserve text colors
 * const shapesOnlyColored = injectSvgColors(svgContent, '#ff0000')
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
      processedSvg = applyColorsToElement(processedSvg, 'svg', fillColor, strokeColor)
    }

    // Apply colors to path elements (most common)
    if (fillColor || strokeColor) {
      processedSvg = applyColorsToElement(processedSvg, 'path', fillColor, strokeColor)
    }

    // Apply colors to other shape elements
    const shapeElements = ['circle', 'rect', 'ellipse', 'polygon', 'line', 'polyline']
    shapeElements.forEach(elementType => {
      if (fillColor || strokeColor) {
        processedSvg = applyColorsToElement(processedSvg, elementType, fillColor, strokeColor)
      }
    })

    // Apply colors to text elements only if forceFill/forceStroke options are set
    // This allows selective coloring - shapes always get colored, text only when explicitly requested
    if ((fillColor && options.forceFill) || (strokeColor && options.forceStroke)) {
      processedSvg = applyColorsToElement(processedSvg, 'text', fillColor, strokeColor)
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
 * When colors are provided, this function ALWAYS removes any existing fill/stroke
 * attributes to ensure user-selected colors override hardcoded values in SVG files.
 *
 * @param svgContent - SVG content
 * @param elementType - Type of element to target
 * @param fillColor - Fill color (if provided, overrides all existing fills)
 * @param strokeColor - Stroke color (if provided, overrides all existing strokes)
 * @returns Modified SVG content
 */
function applyColorsToElement(
  svgContent: string,
  elementType: string,
  fillColor?: string,
  strokeColor?: string
): string {
  // Updated regex to match both self-closing and opening tags while preserving structure
  const regex = new RegExp(`<${elementType}([^>]*?)(/?)>`, 'gi')

  return svgContent.replace(regex, (_match, attributes, selfClosing) => {
    let modifiedAttributes = attributes

    // Handle fill color - ALWAYS remove hardcoded fills when fillColor is provided
    if (fillColor) {
      // First, ALWAYS remove any existing fill attributes when fillColor is provided
      // This ensures hardcoded fills in SVG files don't override user colors
      modifiedAttributes = modifiedAttributes.replace(/\s*fill\s*=\s*["'][^"']*["']/gi, '')

      // Then add the new fill color
      modifiedAttributes += ` fill="${fillColor}"`
    }

    // Handle stroke color - ALWAYS remove hardcoded strokes when strokeColor is provided
    if (strokeColor) {
      // First, ALWAYS remove any existing stroke attributes when strokeColor is provided
      modifiedAttributes = modifiedAttributes.replace(/\s*stroke\s*=\s*["'][^"']*["']/gi, '')

      // Then add the new stroke color
      modifiedAttributes += ` stroke="${strokeColor}"`
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
// UTILITY FUNCTIONS
// ============================================================================

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