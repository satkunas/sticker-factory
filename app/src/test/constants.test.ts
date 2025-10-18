import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_PADDING,
  DEFAULT_VIEWBOX_WIDTH,
  DEFAULT_VIEWBOX_HEIGHT
} from '../config/constants'

describe('Constants Configuration', () => {
  it('should have reasonable template dimensions', () => {
    expect(TEMPLATE_PADDING).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_WIDTH).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_HEIGHT).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_WIDTH).toBeGreaterThanOrEqual(400)
    expect(DEFAULT_VIEWBOX_HEIGHT).toBeGreaterThanOrEqual(400)
  })

  it('should maintain consistency between related constants', () => {
    // Template padding should be reasonable relative to viewbox
    expect(TEMPLATE_PADDING).toBeLessThan(DEFAULT_VIEWBOX_WIDTH / 10)
    expect(TEMPLATE_PADDING).toBeLessThan(DEFAULT_VIEWBOX_HEIGHT / 10)
  })
})
