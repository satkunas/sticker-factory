import { describe, it, expect } from 'vitest'
import { splitLines, calculateLineDy } from '../utils/text-multiline'

describe('Multi-line Text Utilities', () => {
  describe('splitLines', () => {
    it('should split on \\n', () => {
      expect(splitLines('A\nB\nC')).toEqual(['A', 'B', 'C'])
    })

    it('should handle single line', () => {
      expect(splitLines('Single')).toEqual(['Single'])
    })

    it('should handle empty string', () => {
      expect(splitLines('')).toEqual([''])
    })

    it('should handle multiple consecutive newlines', () => {
      expect(splitLines('A\n\nB')).toEqual(['A', '', 'B'])
    })

    it('should handle text with only newlines', () => {
      expect(splitLines('\n\n')).toEqual(['', '', ''])
    })
  })

  describe('calculateLineDy', () => {
    it('should offset first line upward for 3 lines', () => {
      // 3 lines, fontSize 24, lineHeight 1.2
      // totalHeight = (3-1) * 24 * 1.2 = 57.6
      // firstLineDy = -57.6 / 2 = -28.8
      expect(calculateLineDy(0, 3, 24, 1.2)).toBeCloseTo(-28.8)
    })

    it('should offset subsequent lines by lineHeight', () => {
      // fontSize 24, lineHeight 1.2
      // dy = 24 * 1.2 = 28.8
      expect(calculateLineDy(1, 3, 24, 1.2)).toBeCloseTo(28.8)
      expect(calculateLineDy(2, 3, 24, 1.2)).toBeCloseTo(28.8)
    })

    it('should handle 2 lines', () => {
      // 2 lines, fontSize 20, lineHeight 1.5
      // totalHeight = (2-1) * 20 * 1.5 = 30
      // firstLineDy = -30 / 2 = -15
      expect(calculateLineDy(0, 2, 20, 1.5)).toBeCloseTo(-15)
      expect(calculateLineDy(1, 2, 20, 1.5)).toBeCloseTo(30)
    })

    it('should handle single line (no offset)', () => {
      // 1 line should have 0 offset for first line
      // totalHeight = (1-1) * 24 * 1.2 = 0
      // firstLineDy = -0 / 2 = 0
      expect(calculateLineDy(0, 1, 24, 1.2)).toBeCloseTo(0)
    })

    it('should handle default lineHeight of 1.2', () => {
      // 3 lines, fontSize 16, lineHeight 1.2
      // totalHeight = (3-1) * 16 * 1.2 = 38.4
      // firstLineDy = -38.4 / 2 = -19.2
      expect(calculateLineDy(0, 3, 16, 1.2)).toBeCloseTo(-19.2)
      expect(calculateLineDy(1, 3, 16, 1.2)).toBeCloseTo(19.2)
    })

    it('should handle tight line spacing (lineHeight 0.8)', () => {
      // 2 lines, fontSize 20, lineHeight 0.8
      // totalHeight = (2-1) * 20 * 0.8 = 16
      // firstLineDy = -16 / 2 = -8
      expect(calculateLineDy(0, 2, 20, 0.8)).toBeCloseTo(-8)
      expect(calculateLineDy(1, 2, 20, 0.8)).toBeCloseTo(16)
    })

    it('should handle loose line spacing (lineHeight 2.5)', () => {
      // 2 lines, fontSize 20, lineHeight 2.5
      // totalHeight = (2-1) * 20 * 2.5 = 50
      // firstLineDy = -50 / 2 = -25
      expect(calculateLineDy(0, 2, 20, 2.5)).toBeCloseTo(-25)
      expect(calculateLineDy(1, 2, 20, 2.5)).toBeCloseTo(50)
    })

    it('should handle many lines (5 lines)', () => {
      // 5 lines, fontSize 18, lineHeight 1.4
      // totalHeight = (5-1) * 18 * 1.4 = 100.8
      // firstLineDy = -100.8 / 2 = -50.4
      expect(calculateLineDy(0, 5, 18, 1.4)).toBeCloseTo(-50.4)
      expect(calculateLineDy(1, 5, 18, 1.4)).toBeCloseTo(25.2)
      expect(calculateLineDy(2, 5, 18, 1.4)).toBeCloseTo(25.2)
      expect(calculateLineDy(3, 5, 18, 1.4)).toBeCloseTo(25.2)
      expect(calculateLineDy(4, 5, 18, 1.4)).toBeCloseTo(25.2)
    })
  })
})
