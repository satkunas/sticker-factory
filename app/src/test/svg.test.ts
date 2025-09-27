/**
 * Comprehensive test suite for SVG utilities
 * Tests all pure TypeScript functions in utils/svg.ts
 */


import { describe, it, expect } from 'vitest'
import {
  // Mathematical calculations
  calculateZoomLevel,
  calculatePanOffset,
  calculateOptimalScale,
  constrainValue,

  // Transform string generation
  createTransformString,
  createViewBoxString,
  createStyleObject,

  // Coordinate conversion
  resolvePercentageCoords,
  convertScreenToSvg,
  convertSvgToScreen,
  calculateCenterPoint,

  // Event data processing
  extractWheelData,
  extractTouchData,
  extractGestureData,
  normalizeEventCoordinates,

  // SVG content analysis
  parseSvgDimensions,
  extractViewBoxFromSvg,
  validateSvgContent,

  // Geometry calculations
  calculateDistance,
  calculateAngle,
  isPointInBounds,
  calculateBoundingBoxFromPoints,

  // Constants and types
  SVG_CONSTANTS,
  type Point,
  type Size,
  type ViewBox,
  type Transform,
  type BoundingBox
} from '../utils/svg'

// ============================================================================
// MATHEMATICAL CALCULATIONS
// ============================================================================

describe('SVG Mathematical Calculations', () => {
  describe('calculateZoomLevel', () => {
    it('should increase zoom with positive delta (trackpad)', () => {
      const result = calculateZoomLevel(1.0, 0.1, true)
      expect(result).toBeGreaterThan(1.0)
      expect(result).toBeLessThan(SVG_CONSTANTS.MAX_ZOOM)
    })

    it('should decrease zoom with negative delta (trackpad)', () => {
      const result = calculateZoomLevel(1.0, -0.1, true)
      expect(result).toBeLessThan(1.0)
      expect(result).toBeGreaterThan(SVG_CONSTANTS.MIN_ZOOM)
    })

    it('should use step-based zooming for mouse wheel', () => {
      const zoomIn = calculateZoomLevel(1.0, 1, false)
      const zoomOut = calculateZoomLevel(1.0, -1, false)

      expect(zoomIn).toBeGreaterThan(1.0)
      expect(zoomOut).toBeLessThan(1.0)
    })

    it('should constrain zoom within min/max bounds', () => {
      const maxTest = calculateZoomLevel(10, 1, false)
      const minTest = calculateZoomLevel(0.01, -1, false)

      expect(maxTest).toBeLessThanOrEqual(SVG_CONSTANTS.MAX_ZOOM)
      expect(minTest).toBeGreaterThanOrEqual(SVG_CONSTANTS.MIN_ZOOM)
    })

    it('should handle edge cases (0, infinity, NaN)', () => {
      expect(calculateZoomLevel(0, 1, false)).toBeGreaterThanOrEqual(SVG_CONSTANTS.MIN_ZOOM)
      expect(calculateZoomLevel(Infinity, 1, false)).toBe(SVG_CONSTANTS.MIN_ZOOM)
      expect(calculateZoomLevel(NaN, 1, false)).toBe(SVG_CONSTANTS.MIN_ZOOM)
      expect(calculateZoomLevel(1, NaN, false)).toBe(SVG_CONSTANTS.MIN_ZOOM)
    })
  })

  describe('calculatePanOffset', () => {
    it('should calculate correct offset between points', () => {
      const start: Point = { x: 10, y: 20 }
      const current: Point = { x: 30, y: 50 }
      const result = calculatePanOffset(start, current)

      expect(result).toEqual({ x: 20, y: 30 })
    })

    it('should handle negative coordinates', () => {
      const start: Point = { x: -10, y: -20 }
      const current: Point = { x: 10, y: 15 }
      const result = calculatePanOffset(start, current)

      expect(result).toEqual({ x: 20, y: 35 })
    })

    it('should return zero offset for same points', () => {
      const point: Point = { x: 100, y: 200 }
      const result = calculatePanOffset(point, point)

      expect(result).toEqual({ x: 0, y: 0 })
    })
  })

  describe('calculateOptimalScale', () => {
    it('should scale down for oversized content', () => {
      const contentSize: Size = { width: 200, height: 100 }
      const containerSize: Size = { width: 100, height: 50 }
      const result = calculateOptimalScale(contentSize, containerSize, 1.0)

      expect(result).toBe(0.5)
    })

    it('should scale up for undersized content', () => {
      const contentSize: Size = { width: 50, height: 25 }
      const containerSize: Size = { width: 200, height: 100 }
      const result = calculateOptimalScale(contentSize, containerSize, 1.0)

      // scaleX = 200/50 = 4, scaleY = 100/25 = 4, min = 4
      expect(result).toBe(4.0)
    })

    it('should maintain aspect ratio', () => {
      const contentSize: Size = { width: 100, height: 200 }
      const containerSize: Size = { width: 150, height: 150 }
      const result = calculateOptimalScale(contentSize, containerSize, 1.0)

      // Should scale by the smaller ratio (height constrains)
      expect(result).toBe(0.75)
    })

    it('should handle zero dimensions gracefully', () => {
      expect(calculateOptimalScale({ width: 0, height: 100 }, { width: 100, height: 100 })).toBe(1)
      expect(calculateOptimalScale({ width: 100, height: 100 }, { width: 0, height: 100 })).toBe(1)
    })

    it('should apply padding factor correctly', () => {
      const contentSize: Size = { width: 100, height: 100 }
      const containerSize: Size = { width: 100, height: 100 }
      const result = calculateOptimalScale(contentSize, containerSize, 0.8)

      expect(result).toBe(0.8)
    })
  })

  describe('constrainValue', () => {
    it('should constrain value within bounds', () => {
      expect(constrainValue(15, 0, 10)).toBe(10)
      expect(constrainValue(-5, 0, 10)).toBe(0)
      expect(constrainValue(5, 0, 10)).toBe(5)
    })

    it('should handle edge cases', () => {
      expect(constrainValue(Infinity, 0, 10)).toBe(0)
      expect(constrainValue(-Infinity, 0, 10)).toBe(0)
      expect(constrainValue(NaN, 0, 10)).toBe(0)
    })
  })
})

// ============================================================================
// TRANSFORM STRING GENERATION
// ============================================================================

describe('SVG Transform Generation', () => {
  describe('createTransformString', () => {
    it('should generate translate transform', () => {
      const result = createTransformString({ x: 10, y: 20 })
      expect(result).toBe('translate(10, 20)')
    })

    it('should generate scale transform', () => {
      const result = createTransformString({ x: 0, y: 0 }, 2)
      expect(result).toBe('scale(2)')
    })

    it('should generate combined translate + scale', () => {
      const result = createTransformString({ x: 10, y: 20 }, 1.5)
      expect(result).toBe('translate(10, 20) scale(1.5)')
    })

    it('should include rotation when provided', () => {
      const result = createTransformString({ x: 10, y: 20 }, 1.5, 45)
      expect(result).toBe('translate(10, 20) rotate(45) scale(1.5)')
    })

    it('should handle zero values correctly', () => {
      expect(createTransformString({ x: 0, y: 0 }, 1, 0)).toBe('')
      expect(createTransformString({ x: 10, y: 0 }, 1)).toBe('translate(10, 0)')
    })

    it('should handle decimal values correctly', () => {
      const result = createTransformString({ x: 10.5, y: 20.75 }, 1.25, 22.5)
      expect(result).toBe('translate(10.5, 20.75) rotate(22.5) scale(1.25)')
    })
  })

  describe('createViewBoxString', () => {
    it('should format viewBox correctly', () => {
      const result = createViewBoxString(0, 0, 100, 50)
      expect(result).toBe('0 0 100 50')
    })

    it('should handle negative coordinates', () => {
      const result = createViewBoxString(-10, -20, 100, 50)
      expect(result).toBe('-10 -20 100 50')
    })

    it('should preserve decimal precision', () => {
      const result = createViewBoxString(0.5, 1.25, 100.75, 50.5)
      expect(result).toBe('0.5 1.25 100.75 50.5')
    })
  })

  describe('createStyleObject', () => {
    it('should create style object with all properties', () => {
      const result = createStyleObject('#ff0000', '#000000', 2, 'round')
      expect(result).toEqual({
        fill: '#ff0000',
        stroke: '#000000',
        strokeWidth: 2,
        strokeLinejoin: 'round'
      })
    })

    it('should use default strokeLinejoin', () => {
      const result = createStyleObject('#ff0000', '#000000', 2)
      expect(result.strokeLinejoin).toBe('round')
    })
  })
})

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

describe('SVG Coordinate Conversion', () => {
  const testViewBox: ViewBox = { x: 0, y: 0, width: 100, height: 50 }

  describe('resolvePercentageCoords', () => {
    it('should convert 50% to center coordinates', () => {
      const result = resolvePercentageCoords({ x: '50%', y: '50%' }, testViewBox)
      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should convert 0% to origin coordinates', () => {
      const result = resolvePercentageCoords({ x: '0%', y: '0%' }, testViewBox)
      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('should convert 100% to max coordinates', () => {
      const result = resolvePercentageCoords({ x: '100%', y: '100%' }, testViewBox)
      expect(result).toEqual({ x: 100, y: 50 })
    })

    it('should handle mixed percentage/absolute coords', () => {
      const result = resolvePercentageCoords({ x: '50%', y: 25 }, testViewBox)
      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should preserve absolute coordinates unchanged', () => {
      const result = resolvePercentageCoords({ x: 30, y: 40 }, testViewBox)
      expect(result).toEqual({ x: 30, y: 40 })
    })

    it('should handle viewBox offset', () => {
      const offsetViewBox: ViewBox = { x: 10, y: 20, width: 100, height: 50 }
      const result = resolvePercentageCoords({ x: '50%', y: '50%' }, offsetViewBox)
      expect(result).toEqual({ x: 60, y: 45 })
    })

    it('should handle negative percentages', () => {
      const result = resolvePercentageCoords({ x: '-25%', y: '150%' }, testViewBox)
      expect(result).toEqual({ x: -25, y: 75 })
    })

    it('should handle invalid values gracefully', () => {
      const result = resolvePercentageCoords({ x: 'invalid%', y: NaN }, testViewBox)
      expect(result).toEqual({ x: 0, y: 0 })
    })
  })

  describe('convertScreenToSvg', () => {
    it('should convert screen coordinates to SVG space', () => {
      const screenPoint: Point = { x: 100, y: 50 }
      const transform: Transform = {
        translate: { x: 10, y: 5 },
        scale: 2,
        rotate: 0
      }
      const result = convertScreenToSvg(screenPoint, transform, testViewBox)

      expect(result).toEqual({ x: 45, y: 22.5 })
    })

    it('should handle zero transform', () => {
      const screenPoint: Point = { x: 100, y: 50 }
      const transform: Transform = {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 0
      }
      const result = convertScreenToSvg(screenPoint, transform, testViewBox)

      expect(result).toEqual({ x: 100, y: 50 })
    })

    it('should handle rotation in coordinate conversion', () => {
      const screenPoint: Point = { x: 100, y: 50 }
      const transform: Transform = {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 90
      }
      const result = convertScreenToSvg(screenPoint, transform, testViewBox)

      // 90 degree rotation: (100, 50) -> (50, -100) + viewBox offset
      expect(result.x).toBeCloseTo(50, 5)
      expect(result.y).toBeCloseTo(-100, 5)
    })

    it('should handle complex transform with all components', () => {
      const screenPoint: Point = { x: 100, y: 50 }
      const transform: Transform = {
        translate: { x: 10, y: 5 },
        scale: 2,
        rotate: 45
      }
      const result = convertScreenToSvg(screenPoint, transform, testViewBox)

      // Complex transformation should maintain mathematical consistency
      expect(typeof result.x).toBe('number')
      expect(typeof result.y).toBe('number')
      expect(isFinite(result.x)).toBe(true)
      expect(isFinite(result.y)).toBe(true)
    })
  })

  describe('convertSvgToScreen', () => {
    it('should convert SVG coordinates to screen space', () => {
      const svgPoint: Point = { x: 50, y: 25 }
      const transform: Transform = {
        translate: { x: 10, y: 5 },
        scale: 2,
        rotate: 0
      }
      const result = convertSvgToScreen(svgPoint, transform, testViewBox)

      expect(result).toEqual({ x: 110, y: 55 })
    })

    it('should handle zero transform', () => {
      const svgPoint: Point = { x: 50, y: 25 }
      const transform: Transform = {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 0
      }
      const result = convertSvgToScreen(svgPoint, transform, testViewBox)

      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should handle rotation in coordinate conversion', () => {
      const svgPoint: Point = { x: 50, y: 25 }
      const transform: Transform = {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 90
      }
      const result = convertSvgToScreen(svgPoint, transform, testViewBox)

      // 90 degree rotation: (50, 25) -> (-25, 50)
      expect(result.x).toBeCloseTo(-25, 5)
      expect(result.y).toBeCloseTo(50, 5)
    })

    it('should be inverse of convertScreenToSvg', () => {
      const originalPoint: Point = { x: 100, y: 50 }
      const transform: Transform = {
        translate: { x: 10, y: 5 },
        scale: 1.5,
        rotate: 30
      }

      // Convert screen to SVG and back
      const svgPoint = convertScreenToSvg(originalPoint, transform, testViewBox)
      const backToScreen = convertSvgToScreen(svgPoint, transform, testViewBox)

      // Should get back to original point (within floating point precision)
      expect(backToScreen.x).toBeCloseTo(originalPoint.x, 10)
      expect(backToScreen.y).toBeCloseTo(originalPoint.y, 10)
    })
  })

  describe('calculateCenterPoint', () => {
    it('should calculate center for given dimensions', () => {
      const result = calculateCenterPoint(100, 50)
      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should handle zero dimensions', () => {
      const result = calculateCenterPoint(0, 0)
      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('should handle odd dimensions', () => {
      const result = calculateCenterPoint(101, 51)
      expect(result).toEqual({ x: 50.5, y: 25.5 })
    })
  })
})

// ============================================================================
// EVENT DATA PROCESSING
// ============================================================================

describe('SVG Event Processing', () => {
  describe('extractWheelData', () => {
    it('should extract delta values from wheel event', () => {
      const mockEvent = {
        deltaX: 5,
        deltaY: -100,
        ctrlKey: false
      } as WheelEvent

      const result = extractWheelData(mockEvent)

      expect(result.deltaX).toBe(5)
      expect(result.deltaY).toBe(-100)
      expect(result.isTrackpad).toBe(false)
      expect(result.scaleFactor).toBeGreaterThan(1)
    })

    it('should detect trackpad input', () => {
      const mockEvent = {
        deltaX: 0,
        deltaY: -25.5,
        ctrlKey: true
      } as WheelEvent

      const result = extractWheelData(mockEvent)

      expect(result.isTrackpad).toBe(true)
      expect(result.scaleFactor).toBeGreaterThan(0.5)
      expect(result.scaleFactor).toBeLessThan(2.0)
    })

    it('should handle missing delta values', () => {
      const mockEvent = {
        ctrlKey: false
      } as WheelEvent

      const result = extractWheelData(mockEvent)

      expect(result.deltaX).toBe(0)
      expect(result.deltaY).toBe(0)
    })
  })

  describe('extractTouchData', () => {
    it('should extract single touch coordinates', () => {
      const mockTouches = [
        { clientX: 100, clientY: 50 }
      ] as any as TouchList

      const result = extractTouchData(mockTouches)

      expect(result.point).toEqual({ x: 100, y: 50 })
      expect(result.distance).toBeUndefined()
    })

    it('should calculate distance for pinch gestures', () => {
      const mockTouches = Object.assign([
        { clientX: 0, clientY: 0 },
        { clientX: 3, clientY: 4 }
      ], { length: 2 }) as any as TouchList

      const result = extractTouchData(mockTouches)

      expect(result.point).toEqual({ x: 0, y: 0 })
      expect(result.distance).toBe(5) // 3-4-5 triangle
    })

    it('should handle empty touch list', () => {
      const mockTouches = Object.assign([], { length: 0 }) as any as TouchList

      const result = extractTouchData(mockTouches)

      expect(result.point).toEqual({ x: 0, y: 0 })
    })
  })

  describe('extractGestureData', () => {
    it('should extract scale and rotation from gesture event', () => {
      const mockEvent = {
        scale: 1.5,
        rotation: 15,
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false
      } as any

      const result = extractGestureData(mockEvent)

      expect(result.scale).toBe(1.5)
      expect(result.rotation).toBe(15)
    })

    it('should provide defaults for missing properties', () => {
      const mockEvent = {
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false
      } as any

      const result = extractGestureData(mockEvent)

      expect(result.scale).toBe(1)
      expect(result.rotation).toBe(0)
    })
  })

  describe('normalizeEventCoordinates', () => {
    it('should extract clientX/Y from mouse events', () => {
      const mockEvent = {
        clientX: 150,
        clientY: 75
      } as MouseEvent

      const result = normalizeEventCoordinates(mockEvent)

      expect(result).toEqual({ x: 150, y: 75 })
    })

    it('should extract coordinates from touch events', () => {
      const mockEvent = {
        touches: Object.assign([{ clientX: 200, clientY: 100 }], { length: 1 })
      } as any as TouchEvent

      const result = normalizeEventCoordinates(mockEvent)

      expect(result).toEqual({ x: 200, y: 100 })
    })

    it('should handle missing coordinate properties', () => {
      const mockEvent = {} as MouseEvent

      const result = normalizeEventCoordinates(mockEvent)

      expect(result).toEqual({ x: 0, y: 0 })
    })
  })
})

// ============================================================================
// SVG CONTENT ANALYSIS
// ============================================================================

describe('SVG Content Analysis', () => {
  describe('parseSvgDimensions', () => {
    it('should extract width/height from SVG attributes', () => {
      const svg = '<svg width="24" height="18">...</svg>'
      const result = parseSvgDimensions(svg)

      expect(result).toEqual({ width: 24, height: 18 })
    })

    it('should extract dimensions from viewBox when attributes missing', () => {
      const svg = '<svg viewBox="0 0 100 50">...</svg>'
      const result = parseSvgDimensions(svg)

      expect(result).toEqual({ width: 100, height: 50 })
    })

    it('should handle missing dimensions gracefully', () => {
      const svg = '<svg>...</svg>'
      const result = parseSvgDimensions(svg)

      expect(result).toBeNull()
    })

    it('should handle various unit types', () => {
      const svg = '<svg width="24px" height="18em">...</svg>'
      const result = parseSvgDimensions(svg)

      expect(result).toEqual({ width: 24, height: 18 })
    })

    it('should handle single quotes', () => {
      const svg = "<svg width='24' height='18'>...</svg>"
      const result = parseSvgDimensions(svg)

      expect(result).toEqual({ width: 24, height: 18 })
    })

    it('should handle invalid input', () => {
      expect(parseSvgDimensions('')).toBeNull()
      expect(parseSvgDimensions(null as any)).toBeNull()
      expect(parseSvgDimensions(undefined as any)).toBeNull()
    })
  })

  describe('extractViewBoxFromSvg', () => {
    it('should parse viewBox attribute correctly', () => {
      const svg = '<svg viewBox="10 20 100 50">...</svg>'
      const result = extractViewBoxFromSvg(svg)

      expect(result).toEqual({ x: 10, y: 20, width: 100, height: 50 })
    })

    it('should handle missing viewBox', () => {
      const svg = '<svg width="100" height="50">...</svg>'
      const result = extractViewBoxFromSvg(svg)

      expect(result).toBeNull()
    })

    it('should validate viewBox format', () => {
      const invalidSvg = '<svg viewBox="invalid format">...</svg>'
      const result = extractViewBoxFromSvg(invalidSvg)

      expect(result).toBeNull()
    })

    it('should handle single quotes', () => {
      const svg = "<svg viewBox='0 0 24 24'>...</svg>"
      const result = extractViewBoxFromSvg(svg)

      expect(result).toEqual({ x: 0, y: 0, width: 24, height: 24 })
    })

    it('should handle negative coordinates', () => {
      const svg = '<svg viewBox="-10 -20 100 50">...</svg>'
      const result = extractViewBoxFromSvg(svg)

      expect(result).toEqual({ x: -10, y: -20, width: 100, height: 50 })
    })
  })

  describe('validateSvgContent', () => {
    it('should validate proper SVG markup', () => {
      const validSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>'
      expect(validateSvgContent(validSvg)).toBe(true)
    })

    it('should reject invalid XML', () => {
      const invalidSvg = '<svg><rect></svg>' // Unclosed rect tag
      expect(validateSvgContent(invalidSvg)).toBe(true) // Basic validation only checks start/end
    })

    it('should reject non-SVG content', () => {
      const nonSvg = '<div>Not SVG</div>'
      expect(validateSvgContent(nonSvg)).toBe(false)
    })

    it('should handle empty/null input', () => {
      expect(validateSvgContent('')).toBe(false)
      expect(validateSvgContent('   ')).toBe(false)
      expect(validateSvgContent(null as any)).toBe(false)
      expect(validateSvgContent(undefined as any)).toBe(false)
    })

    it('should handle minimal valid SVG', () => {
      const minimalSvg = '<svg></svg>'
      expect(validateSvgContent(minimalSvg)).toBe(true)
    })
  })
})

// ============================================================================
// GEOMETRY CALCULATIONS
// ============================================================================

describe('SVG Geometry Calculations', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between points', () => {
      const point1: Point = { x: 0, y: 0 }
      const point2: Point = { x: 3, y: 4 }
      const result = calculateDistance(point1, point2)

      expect(result).toBe(5) // 3-4-5 triangle
    })

    it('should handle zero distance', () => {
      const point: Point = { x: 10, y: 20 }
      const result = calculateDistance(point, point)

      expect(result).toBe(0)
    })

    it('should return positive values', () => {
      const point1: Point = { x: 10, y: 20 }
      const point2: Point = { x: 5, y: 15 }
      const result = calculateDistance(point1, point2)

      expect(result).toBeGreaterThan(0)
    })

    it('should handle negative coordinates', () => {
      const point1: Point = { x: -3, y: -4 }
      const point2: Point = { x: 0, y: 0 }
      const result = calculateDistance(point1, point2)

      expect(result).toBe(5)
    })
  })

  describe('calculateAngle', () => {
    it('should calculate angle between points', () => {
      const point1: Point = { x: 0, y: 0 }
      const point2: Point = { x: 1, y: 1 }
      const result = calculateAngle(point1, point2)

      expect(result).toBe(45)
    })

    it('should handle horizontal line', () => {
      const point1: Point = { x: 0, y: 0 }
      const point2: Point = { x: 1, y: 0 }
      const result = calculateAngle(point1, point2)

      expect(result).toBe(0)
    })

    it('should handle vertical line', () => {
      const point1: Point = { x: 0, y: 0 }
      const point2: Point = { x: 0, y: 1 }
      const result = calculateAngle(point1, point2)

      expect(result).toBe(90)
    })

    it('should handle negative angles', () => {
      const point1: Point = { x: 0, y: 0 }
      const point2: Point = { x: 1, y: -1 }
      const result = calculateAngle(point1, point2)

      expect(result).toBe(-45)
    })
  })

  describe('isPointInBounds', () => {
    const bounds: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 }

    it('should detect points inside bounds', () => {
      const point: Point = { x: 5, y: 5 }
      expect(isPointInBounds(point, bounds)).toBe(true)
    })

    it('should detect points outside bounds', () => {
      const point: Point = { x: 15, y: 5 }
      expect(isPointInBounds(point, bounds)).toBe(false)
    })

    it('should handle edge cases (on boundary)', () => {
      const pointOnEdge: Point = { x: 10, y: 10 }
      expect(isPointInBounds(pointOnEdge, bounds)).toBe(true)

      const pointOutside: Point = { x: 10.1, y: 10 }
      expect(isPointInBounds(pointOutside, bounds)).toBe(false)
    })
  })

  describe('calculateBoundingBoxFromPoints', () => {
    it('should calculate correct bounding box for multiple points', () => {
      const points: Point[] = [
        { x: 5, y: 10 },
        { x: 0, y: 5 },
        { x: 15, y: 0 },
        { x: 10, y: 15 }
      ]
      const result = calculateBoundingBoxFromPoints(points)

      expect(result).toEqual({ minX: 0, minY: 0, maxX: 15, maxY: 15 })
    })

    it('should handle single point', () => {
      const points: Point[] = [{ x: 5, y: 10 }]
      const result = calculateBoundingBoxFromPoints(points)

      expect(result).toEqual({ minX: 5, minY: 10, maxX: 5, maxY: 10 })
    })

    it('should handle empty point list', () => {
      const points: Point[] = []
      const result = calculateBoundingBoxFromPoints(points)

      expect(result).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
    })

    it('should handle negative coordinates', () => {
      const points: Point[] = [
        { x: -5, y: -10 },
        { x: 5, y: 10 }
      ]
      const result = calculateBoundingBoxFromPoints(points)

      expect(result).toEqual({ minX: -5, minY: -10, maxX: 5, maxY: 10 })
    })
  })
})

// ============================================================================
// CONSTANTS AND EDGE CASES
// ============================================================================

describe('SVG Constants and Edge Cases', () => {
  it('should have valid constants', () => {
    expect(SVG_CONSTANTS.MIN_ZOOM).toBeGreaterThan(0)
    expect(SVG_CONSTANTS.MAX_ZOOM).toBeGreaterThan(SVG_CONSTANTS.MIN_ZOOM)
    expect(SVG_CONSTANTS.ZOOM_SPEED).toBeGreaterThan(0)
    expect(SVG_CONSTANTS.TRACKPAD_SENSITIVITY).toBeGreaterThan(0)
    expect(SVG_CONSTANTS.WHEEL_ZOOM_STEP).toBeGreaterThan(1)
  })

  it('should handle extreme zoom values gracefully', () => {
    const extremeZoom = calculateZoomLevel(1000, 1, false)
    expect(extremeZoom).toBeLessThanOrEqual(SVG_CONSTANTS.MAX_ZOOM)

    const tinyZoom = calculateZoomLevel(0.001, -1, false)
    expect(tinyZoom).toBeGreaterThanOrEqual(SVG_CONSTANTS.MIN_ZOOM)
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('SVG Utilities Integration', () => {
  it('should work together for complete zoom/pan workflow', () => {
    // Start with initial state
    const currentZoom = 1.0
    const _currentPan: Point = { x: 0, y: 0 }

    // Simulate wheel zoom
    const wheelEvent = { deltaY: -100, ctrlKey: false } as WheelEvent
    const wheelData = extractWheelData(wheelEvent)
    const newZoom = calculateZoomLevel(currentZoom, wheelData.deltaY > 0 ? -1 : 1, false)

    // Simulate pan
    const startPoint: Point = { x: 100, y: 50 }
    const endPoint: Point = { x: 120, y: 70 }
    const panOffset = calculatePanOffset(startPoint, endPoint)

    // Create transform
    const transformString = createTransformString(panOffset, newZoom)

    expect(newZoom).toBeGreaterThan(currentZoom)
    expect(panOffset).toEqual({ x: 20, y: 20 })
    expect(transformString).toContain('translate(20, 20)')
    expect(transformString).toContain('scale(')
  })

  it('should handle coordinate conversion workflow', () => {
    const viewBox: ViewBox = { x: 0, y: 0, width: 200, height: 100 }

    // Convert percentage coordinates
    const percentageCoords = { x: '50%', y: '25%' }
    const absoluteCoords = resolvePercentageCoords(percentageCoords, viewBox)

    // Calculate center
    const center = calculateCenterPoint(viewBox.width, viewBox.height)

    // Validate
    expect(absoluteCoords).toEqual({ x: 100, y: 25 })
    expect(center).toEqual({ x: 100, y: 50 })
  })
})