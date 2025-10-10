/**
 * Comprehensive test suite for mini overview utilities
 * Tests all pure TypeScript functions in utils/mini-overview.ts
 */

import { describe, it, expect } from 'vitest'
import {
  calculateMiniOverviewViewBox,
  calculateViewportIndicatorRect,
  calculateMiniOverview,
  calculateMiniOverviewContainerDimensions
} from '../utils/mini-overview'
import type { ViewBox, Dimensions } from '../types/svg-types'

// ============================================================================
// MINI OVERVIEW VIEWBOX CALCULATIONS
// ============================================================================

describe('Mini Overview ViewBox Calculations', () => {
  describe('calculateMiniOverviewViewBox', () => {
    const squareTemplate: ViewBox = { x: 0, y: 0, width: 400, height: 400 }
    const rectangleTemplate: ViewBox = { x: 0, y: 0, width: 600, height: 400 }
    const tallTemplate: ViewBox = { x: 0, y: 0, width: 300, height: 600 }

    it('should center square template in square container', () => {
      const containerDimensions: Dimensions = { width: 128, height: 128 }
      const result = calculateMiniOverviewViewBox(squareTemplate, containerDimensions, 2.0)

      // Template center: (200, 200)
      // Show area: 800x800 (2x template)
      // Container aspect: 1:1, show area aspect: 1:1 (match!)
      // ViewBox: 800x800, centered on (200, 200)
      expect(result.x).toBe(-200) // 200 - 800/2
      expect(result.y).toBe(-200) // 200 - 800/2
      expect(result.width).toBe(800)
      expect(result.height).toBe(800)
    })

    it('should center square template in wide container', () => {
      const containerDimensions: Dimensions = { width: 128, height: 64 }
      const result = calculateMiniOverviewViewBox(squareTemplate, containerDimensions, 2.0)

      // Template center: (200, 200)
      // Show area: 800x800 (2x template)
      // Container aspect: 2:1 (wide), show area aspect: 1:1
      // Need to expand viewBox width to match 2:1 aspect
      // ViewBox height stays 800, width becomes 1600
      expect(result.x).toBe(-600) // 200 - 1600/2
      expect(result.y).toBe(-200) // 200 - 800/2
      expect(result.width).toBe(1600)
      expect(result.height).toBe(800)
    })

    it('should center square template in tall container', () => {
      const containerDimensions: Dimensions = { width: 128, height: 256 }
      const result = calculateMiniOverviewViewBox(squareTemplate, containerDimensions, 2.0)

      // Template center: (200, 200)
      // Show area: 800x800 (2x template)
      // Container aspect: 1:2 (tall), show area aspect: 1:1
      // Need to expand viewBox height to match 1:2 aspect
      // ViewBox width stays 800, height becomes 1600
      expect(result.x).toBe(-200) // 200 - 800/2
      expect(result.y).toBe(-600) // 200 - 1600/2
      expect(result.width).toBe(800)
      expect(result.height).toBe(1600)
    })

    it('should center wide template in wide container', () => {
      const containerDimensions: Dimensions = { width: 128, height: 64 }
      const result = calculateMiniOverviewViewBox(rectangleTemplate, containerDimensions, 2.0)

      // Template center: (300, 200)
      // Show area: 1200x800 (2x template)
      // Container aspect: 2:1, show area aspect: 1.5:1
      // ViewBox height stays 800, width becomes 1600
      expect(result.x).toBe(-500) // 300 - 1600/2
      expect(result.y).toBe(-200) // 200 - 800/2
      expect(result.width).toBe(1600)
      expect(result.height).toBe(800)
    })

    it('should center tall template in square container', () => {
      const containerDimensions: Dimensions = { width: 128, height: 128 }
      const result = calculateMiniOverviewViewBox(tallTemplate, containerDimensions, 2.0)

      // Template center: (150, 300)
      // Show area: 600x1200 (2x template)
      // Container aspect: 1:1, show area aspect: 0.5:1
      // ViewBox height stays 1200, width becomes 1200
      expect(result.x).toBe(-450) // 150 - 1200/2
      expect(result.y).toBe(-300) // 300 - 1200/2
      expect(result.width).toBe(1200)
      expect(result.height).toBe(1200)
    })

    it('should handle different scale factors', () => {
      const containerDimensions: Dimensions = { width: 128, height: 128 }

      // Scale 1.5
      const result1 = calculateMiniOverviewViewBox(squareTemplate, containerDimensions, 1.5)
      expect(result1.width).toBe(600) // 400 * 1.5
      expect(result1.height).toBe(600)

      // Scale 3.0
      const result2 = calculateMiniOverviewViewBox(squareTemplate, containerDimensions, 3.0)
      expect(result2.width).toBe(1200) // 400 * 3
      expect(result2.height).toBe(1200)
    })

    it('should handle template with offset viewBox', () => {
      const offsetTemplate: ViewBox = { x: 100, y: 50, width: 400, height: 400 }
      const containerDimensions: Dimensions = { width: 128, height: 128 }
      const result = calculateMiniOverviewViewBox(offsetTemplate, containerDimensions, 2.0)

      // Template center: (300, 250) = (100 + 400/2, 50 + 400/2)
      // Show area: 800x800
      // ViewBox: 800x800, centered on (300, 250)
      expect(result.x).toBe(-100) // 300 - 800/2
      expect(result.y).toBe(-150) // 250 - 800/2
      expect(result.width).toBe(800)
      expect(result.height).toBe(800)
    })

    it('should handle invalid inputs gracefully', () => {
      const validTemplate: ViewBox = { x: 0, y: 0, width: 400, height: 400 }
      const validContainer: Dimensions = { width: 128, height: 128 }

      // Invalid template dimensions
      const result1 = calculateMiniOverviewViewBox(
        { x: 0, y: 0, width: 0, height: 400 },
        validContainer,
        2.0
      )
      expect(result1).toEqual({ x: -200, y: -150, width: 400, height: 300 })

      // Invalid container dimensions
      const result2 = calculateMiniOverviewViewBox(
        validTemplate,
        { width: 0, height: 128 },
        2.0
      )
      expect(result2).toEqual({ x: -200, y: -150, width: 400, height: 300 })

      // Invalid scale
      const result3 = calculateMiniOverviewViewBox(
        validTemplate,
        validContainer,
        0
      )
      expect(result3).toEqual({ x: -200, y: -150, width: 400, height: 300 })

      // Null inputs
      const result4 = calculateMiniOverviewViewBox(
        null as any,
        validContainer,
        2.0
      )
      expect(result4).toEqual({ x: -200, y: -150, width: 400, height: 300 })
    })
  })
})

// ============================================================================
// VIEWPORT INDICATOR CALCULATIONS
// ============================================================================

describe('Viewport Indicator Calculations', () => {
  describe('calculateViewportIndicatorRect', () => {
    const mainViewerDimensions: Dimensions = { width: 800, height: 600 }

    it('should calculate viewport rect at 1x zoom', () => {
      const result = calculateViewportIndicatorRect(0, 0, mainViewerDimensions, 1.0)

      // At 1x zoom, viewport dimensions = container dimensions
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('should calculate viewport rect at 2x zoom', () => {
      const result = calculateViewportIndicatorRect(100, 50, mainViewerDimensions, 2.0)

      // At 2x zoom, viewport dimensions = container dimensions / 2
      expect(result.x).toBe(100)
      expect(result.y).toBe(50)
      expect(result.width).toBe(400) // 800 / 2
      expect(result.height).toBe(300) // 600 / 2
    })

    it('should calculate viewport rect at 0.5x zoom', () => {
      const result = calculateViewportIndicatorRect(-200, -150, mainViewerDimensions, 0.5)

      // At 0.5x zoom, viewport dimensions = container dimensions / 0.5 = 2x
      expect(result.x).toBe(-200)
      expect(result.y).toBe(-150)
      expect(result.width).toBe(1600) // 800 / 0.5
      expect(result.height).toBe(1200) // 600 / 0.5
    })

    it('should handle different container aspect ratios', () => {
      const wideContainer: Dimensions = { width: 1200, height: 600 }
      const result = calculateViewportIndicatorRect(0, 0, wideContainer, 1.0)

      expect(result.width).toBe(1200)
      expect(result.height).toBe(600)
    })

    it('should handle pan offsets', () => {
      const result1 = calculateViewportIndicatorRect(250, 180, mainViewerDimensions, 1.5)
      expect(result1.x).toBe(250)
      expect(result1.y).toBe(180)

      const result2 = calculateViewportIndicatorRect(-100, -50, mainViewerDimensions, 1.0)
      expect(result2.x).toBe(-100)
      expect(result2.y).toBe(-50)
    })

    it('should handle invalid inputs gracefully', () => {
      const validDimensions: Dimensions = { width: 800, height: 600 }

      // Invalid dimensions
      const result1 = calculateViewportIndicatorRect(
        0,
        0,
        { width: 0, height: 600 },
        1.0
      )
      expect(result1).toEqual({ x: 0, y: 0, width: 0, height: 0 })

      // Invalid zoom
      const result2 = calculateViewportIndicatorRect(0, 0, validDimensions, 0)
      expect(result2).toEqual({ x: 0, y: 0, width: 0, height: 0 })

      // Invalid pan coordinates
      const result3 = calculateViewportIndicatorRect(NaN, Infinity, validDimensions, 1.0)
      expect(result3).toEqual({ x: 0, y: 0, width: 0, height: 0 })

      // Null dimensions
      const result4 = calculateViewportIndicatorRect(0, 0, null as any, 1.0)
      expect(result4).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
  })
})

// ============================================================================
// COMPLETE MINI OVERVIEW CALCULATIONS
// ============================================================================

describe('Complete Mini Overview Calculations', () => {
  describe('calculateMiniOverview', () => {
    const template: ViewBox = { x: 0, y: 0, width: 400, height: 400 }
    const containerDimensions: Dimensions = { width: 128, height: 64 }
    const mainViewerDimensions: Dimensions = { width: 800, height: 600 }

    it('should calculate both viewBox and viewport rect', () => {
      const result = calculateMiniOverview(
        template,
        containerDimensions,
        0,
        0,
        mainViewerDimensions,
        1.0,
        2.0
      )

      // Verify viewBox calculation
      expect(result.viewBox).toBeDefined()
      expect(result.viewBox.x).toBe(-600) // Square template in wide container
      expect(result.viewBox.y).toBe(-200)
      expect(result.viewBox.width).toBe(1600)
      expect(result.viewBox.height).toBe(800)

      // Verify viewport rect calculation
      expect(result.viewportRect).toBeDefined()
      expect(result.viewportRect.x).toBe(0)
      expect(result.viewportRect.y).toBe(0)
      expect(result.viewportRect.width).toBe(800)
      expect(result.viewportRect.height).toBe(600)
    })

    it('should handle zoomed viewport', () => {
      const result = calculateMiniOverview(
        template,
        containerDimensions,
        100,
        50,
        mainViewerDimensions,
        2.0,
        2.0
      )

      // ViewBox should be unchanged (based on template and container)
      expect(result.viewBox.width).toBe(1600)
      expect(result.viewBox.height).toBe(800)

      // Viewport rect should be smaller (zoomed in)
      expect(result.viewportRect.x).toBe(100)
      expect(result.viewportRect.y).toBe(50)
      expect(result.viewportRect.width).toBe(400) // 800 / 2
      expect(result.viewportRect.height).toBe(300) // 600 / 2
    })

    it('should handle panned viewport', () => {
      const result = calculateMiniOverview(
        template,
        containerDimensions,
        -200,
        -150,
        mainViewerDimensions,
        0.5,
        2.0
      )

      // Viewport rect should reflect pan position
      expect(result.viewportRect.x).toBe(-200)
      expect(result.viewportRect.y).toBe(-150)

      // And larger size (zoomed out)
      expect(result.viewportRect.width).toBe(1600) // 800 / 0.5
      expect(result.viewportRect.height).toBe(1200) // 600 / 0.5
    })

    it('should work with different scale factors', () => {
      const result1 = calculateMiniOverview(
        template,
        containerDimensions,
        0,
        0,
        mainViewerDimensions,
        1.0,
        1.5
      )

      const result2 = calculateMiniOverview(
        template,
        containerDimensions,
        0,
        0,
        mainViewerDimensions,
        1.0,
        3.0
      )

      // Different scale should affect viewBox size
      expect(result1.viewBox.width).toBeLessThan(result2.viewBox.width)
      expect(result1.viewBox.height).toBeLessThan(result2.viewBox.height)

      // But not viewport rect (depends on zoom, not scale)
      expect(result1.viewportRect).toEqual(result2.viewportRect)
    })
  })
})

// ============================================================================
// MINI OVERVIEW CONTAINER DIMENSIONS
// ============================================================================

describe('Mini Overview Container Dimensions', () => {
  describe('calculateMiniOverviewContainerDimensions', () => {
    it('should match template aspect ratio for square template', () => {
      const squareTemplate: ViewBox = { x: 0, y: 0, width: 400, height: 400 }
      const result = calculateMiniOverviewContainerDimensions(squareTemplate, 128, 24, 80)

      // Aspect ratio 1:1 would give height=128, but clamped to maxHeight=80
      // Both width and height should scale proportionally: 128 * (80/128) = 80
      expect(result.width).toBe(80)
      expect(result.height).toBe(80)

      // Verify aspect ratio is maintained
      const resultAspect = result.width / result.height
      const templateAspect = squareTemplate.width / squareTemplate.height
      expect(resultAspect).toBeCloseTo(templateAspect, 2)
    })

    it('should match template aspect ratio for wide template', () => {
      const wideTemplate: ViewBox = { x: 0, y: 0, width: 800, height: 400 }
      const result = calculateMiniOverviewContainerDimensions(wideTemplate, 128, 24, 80)

      // Aspect ratio 2:1
      // Height = 128 / 2 = 64
      expect(result.width).toBe(128)
      expect(result.height).toBe(64)
    })

    it('should match template aspect ratio for tall template', () => {
      const tallTemplate: ViewBox = { x: 0, y: 0, width: 300, height: 600 }
      const result = calculateMiniOverviewContainerDimensions(tallTemplate, 128, 24, 80)

      // Aspect ratio 0.5:1 (tall)
      // Height would be 128 / 0.5 = 256, but clamped to maxHeight 80
      // Both dimensions scaled: width = 128 * (80/256) = 40
      expect(result.width).toBe(40)
      expect(result.height).toBe(80)

      // Verify aspect ratio is maintained
      const resultAspect = result.width / result.height
      const templateAspect = tallTemplate.width / tallTemplate.height
      expect(resultAspect).toBeCloseTo(templateAspect, 2)
    })

    it('should constrain height to minimum', () => {
      const veryWideTemplate: ViewBox = { x: 0, y: 0, width: 1920, height: 400 }
      const result = calculateMiniOverviewContainerDimensions(veryWideTemplate, 128, 24, 80)

      // Aspect ratio 4.8:1 (very wide)
      // Height would be 128 / 4.8 = 26.67, rounds to 27 (above minHeight, no scaling needed)
      expect(result.width).toBe(128)
      expect(result.height).toBe(27)

      // Verify aspect ratio is close (rounding affects precision)
      const resultAspect = result.width / result.height
      const templateAspect = veryWideTemplate.width / veryWideTemplate.height
      expect(Math.abs(resultAspect - templateAspect)).toBeLessThan(0.1)
    })

    it('should constrain height to maximum', () => {
      const veryTallTemplate: ViewBox = { x: 0, y: 0, width: 200, height: 960 }
      const result = calculateMiniOverviewContainerDimensions(veryTallTemplate, 128, 24, 80)

      // Aspect ratio 0.208:1 (very tall)
      // Height would be 128 / 0.208 = 615, clamped to maxHeight 80
      // Width scaled: 128 * (80/615) = 17 (rounded)
      expect(result.width).toBe(17)
      expect(result.height).toBe(80)

      // Verify aspect ratio is maintained
      const resultAspect = result.width / result.height
      const templateAspect = veryTallTemplate.width / veryTallTemplate.height
      expect(resultAspect).toBeCloseTo(templateAspect, 1)
    })

    it('should handle different base widths', () => {
      const template: ViewBox = { x: 0, y: 0, width: 400, height: 300 }

      const result1 = calculateMiniOverviewContainerDimensions(template, 100, 24, 80)
      const result2 = calculateMiniOverviewContainerDimensions(template, 150, 24, 80)

      // Aspect ratio 4:3
      // result1: height = 100 / (4/3) = 75
      // result2: height = 150 / (4/3) = 112.5 rounds to 113, clamped to 80, width scaled to 106
      expect(result1.width).toBe(100)
      expect(result1.height).toBe(75)
      expect(result2.width).toBe(106) // 150 * (80/113) ≈ 106
      expect(result2.height).toBe(80)

      // Both should maintain template aspect ratio
      const templateAspect = template.width / template.height
      expect(result1.width / result1.height).toBeCloseTo(templateAspect, 1)
      expect(result2.width / result2.height).toBeCloseTo(templateAspect, 1)
    })

    it('should handle invalid inputs gracefully', () => {
      // Invalid template dimensions
      const result1 = calculateMiniOverviewContainerDimensions(
        { x: 0, y: 0, width: 0, height: 600 },
        128,
        24,
        80
      )
      expect(result1).toEqual({ width: 128, height: 40 })

      // Invalid base width
      const result2 = calculateMiniOverviewContainerDimensions(
        { x: 0, y: 0, width: 400, height: 300 },
        0,
        24,
        80
      )
      expect(result2).toEqual({ width: 0, height: 40 })

      // Null input
      const result3 = calculateMiniOverviewContainerDimensions(
        null as any,
        128,
        24,
        80
      )
      expect(result3).toEqual({ width: 128, height: 40 })
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Mini Overview Integration', () => {
  it('should work together for complete mini overview setup', () => {
    // Real-world scenario: Square template in wide viewer
    const template: ViewBox = { x: 0, y: 0, width: 400, height: 400 }
    const mainViewerDimensions: Dimensions = { width: 1200, height: 600 }

    // Calculate mini overview container dimensions (based on template, not viewer!)
    const containerDimensions = calculateMiniOverviewContainerDimensions(
      template,
      128,
      24,
      80
    )

    // Verify container matches TEMPLATE aspect ratio (not viewer)
    const templateAspect = template.width / template.height
    const containerAspect = containerDimensions.width / containerDimensions.height
    expect(containerAspect).toBeCloseTo(templateAspect, 1)

    // Calculate complete mini overview
    const overview = calculateMiniOverview(
      template,
      containerDimensions,
      0,
      0,
      mainViewerDimensions,
      1.0,
      2.0
    )

    // Verify viewBox shows template + padding
    expect(overview.viewBox.width).toBeGreaterThanOrEqual(template.width * 2)
    expect(overview.viewBox.height).toBeGreaterThanOrEqual(template.height * 2)

    // Verify viewport indicator shows correct viewer area
    expect(overview.viewportRect.width).toBe(mainViewerDimensions.width)
    expect(overview.viewportRect.height).toBe(mainViewerDimensions.height)
  })

  it('should handle window resize scenario', () => {
    const template: ViewBox = { x: 0, y: 0, width: 400, height: 400 }

    // Initial viewport dimensions (wide aspect ratio)
    const initialViewerDimensions: Dimensions = { width: 1600, height: 800 }
    // Mini overview container is based on template, so it stays CONSTANT
    const initialContainer = calculateMiniOverviewContainerDimensions(
      template,
      128,
      24,
      80
    )
    const initialOverview = calculateMiniOverview(
      template,
      initialContainer,
      0,
      0,
      initialViewerDimensions,
      1.5,
      2.0
    )

    // After window resize (very wide aspect ratio)
    const resizedViewerDimensions: Dimensions = { width: 1920, height: 600 }
    // Mini overview container is STILL based on template, so it's THE SAME
    const resizedContainer = calculateMiniOverviewContainerDimensions(
      template,
      128,
      24,
      80
    )
    const resizedOverview = calculateMiniOverview(
      template,
      resizedContainer,
      0,
      0,
      resizedViewerDimensions,
      1.5,
      2.0
    )

    // Container should stay the same (based on template, not viewer!)
    expect(resizedContainer).toEqual(initialContainer)

    // ViewBox should also stay the same (based on template and container)
    expect(resizedOverview.viewBox).toEqual(initialOverview.viewBox)

    // Viewport rect should reflect new viewer size (this is the dynamic part!)
    expect(resizedOverview.viewportRect.width).toBeGreaterThan(
      initialOverview.viewportRect.width
    )
    expect(resizedOverview.viewportRect.height).toBeLessThan(
      initialOverview.viewportRect.height
    )
  })
})
