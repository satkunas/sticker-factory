/**
 * Comprehensive test suite for SVG utilities
 * Tests all pure TypeScript functions in utils/svg.ts
 */


import { describe, it, expect } from 'vitest'
import {
  // Coordinate conversion
  isPercentage,
  parsePercentage,
  resolveCoordinate,
  resolvePosition,
  resolveLinePosition,
  resolvePercentageCoords,
  isValidNumber,

  // Types
  type ViewBox
} from '../utils/svg'

// ============================================================================
// COORDINATE CONVERSION AND UTILITIES
// ============================================================================

describe('SVG Coordinate Utilities', () => {
  const testViewBox: ViewBox = { x: 0, y: 0, width: 100, height: 50 }

  describe('isPercentage', () => {
    it('should detect percentage strings', () => {
      expect(isPercentage('50%')).toBe(true)
      expect(isPercentage('0%')).toBe(true)
      expect(isPercentage('100%')).toBe(true)
    })

    it('should reject non-percentage strings', () => {
      expect(isPercentage('50')).toBe(false)
      expect(isPercentage('50px')).toBe(false)
      expect(isPercentage('abc')).toBe(false)
    })

    it('should handle numbers', () => {
      expect(isPercentage(50 as any)).toBe(false)
      expect(isPercentage(0 as any)).toBe(false)
    })
  })

  describe('parsePercentage', () => {
    it('should parse valid percentage strings to decimal', () => {
      expect(parsePercentage('50%')).toBe(0.5)
      expect(parsePercentage('0%')).toBe(0)
      expect(parsePercentage('100%')).toBe(1)
    })

    it('should handle negative percentages', () => {
      expect(parsePercentage('-25%')).toBe(-0.25)
      expect(parsePercentage('-100%')).toBe(-1)
    })

    it('should handle decimal percentages', () => {
      expect(parsePercentage('33.33%')).toBeCloseTo(0.3333, 4)
      expect(parsePercentage('66.67%')).toBeCloseTo(0.6667, 4)
    })

    it('should return NaN for invalid input', () => {
      expect(isNaN(parsePercentage('invalid%'))).toBe(true)
      expect(isNaN(parsePercentage('abc'))).toBe(true)
      expect(isNaN(parsePercentage(''))).toBe(true)
    })
  })

  describe('resolveCoordinate', () => {
    it('should resolve percentage to absolute value', () => {
      expect(resolveCoordinate('50%', 100, 0)).toBe(50)
      expect(resolveCoordinate('25%', 200, 0)).toBe(50)
    })

    it('should pass through absolute numbers', () => {
      expect(resolveCoordinate(50, 100, 0)).toBe(50)
      expect(resolveCoordinate(75, 200, 0)).toBe(75)
    })

    it('should handle viewBox offset', () => {
      expect(resolveCoordinate('50%', 100, 10)).toBe(60)
      expect(resolveCoordinate('0%', 100, 20)).toBe(20)
    })

    it('should handle zero dimensions', () => {
      expect(resolveCoordinate('50%', 0, 0)).toBe(0)
      expect(resolveCoordinate('100%', 0, 0)).toBe(0)
    })
  })

  describe('resolvePosition', () => {
    it('should resolve both coordinates', () => {
      const result = resolvePosition({ x: '50%', y: '50%' }, testViewBox)
      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should handle mixed percentage/absolute', () => {
      const result = resolvePosition({ x: '50%', y: 25 }, testViewBox)
      expect(result).toEqual({ x: 50, y: 25 })
    })

    it('should handle absolute coordinates', () => {
      const result = resolvePosition({ x: 30, y: 40 }, testViewBox)
      expect(result).toEqual({ x: 30, y: 40 })
    })

    it('should handle viewBox offset', () => {
      const offsetViewBox: ViewBox = { x: 10, y: 20, width: 100, height: 50 }
      const result = resolvePosition({ x: '50%', y: '50%' }, offsetViewBox)
      expect(result).toEqual({ x: 60, y: 45 })
    })
  })

  describe('resolveLinePosition', () => {
    it('should resolve line coordinates', () => {
      const line = { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }
      const result = resolveLinePosition(line, testViewBox)
      expect(result).toEqual({ x1: 0, y1: 0, x2: 100, y2: 50 })
    })

    it('should handle mixed percentage/absolute', () => {
      const line = { x1: '50%', y1: 10, x2: 75, y2: '50%' }
      const result = resolveLinePosition(line, testViewBox)
      expect(result).toEqual({ x1: 50, y1: 10, x2: 75, y2: 25 })
    })
  })

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

    it('should propagate NaN for invalid values (no hardcoded fallbacks)', () => {
      const result = resolvePercentageCoords({ x: 'invalid%', y: NaN }, testViewBox)
      expect(isNaN(result.x)).toBe(true)
      expect(isNaN(result.y)).toBe(true)
    })
  })

  describe('isValidNumber', () => {
    it('should validate finite numbers', () => {
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(100)).toBe(true)
      expect(isValidNumber(-50)).toBe(true)
      expect(isValidNumber(3.14)).toBe(true)
    })

    it('should reject invalid numbers', () => {
      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber(-Infinity)).toBe(false)
    })

    it('should reject non-numbers', () => {
      expect(isValidNumber('100' as any)).toBe(false)
      expect(isValidNumber(null as any)).toBe(false)
      expect(isValidNumber(undefined as any)).toBe(false)
    })
  })
})