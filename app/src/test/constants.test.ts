import { describe, it, expect } from 'vitest'
import {
  STORAGE_KEY_MAIN,
  STORAGE_KEY_TEMPLATE,
  TEMPLATE_PADDING,
  DEFAULT_VIEWBOX_WIDTH,
  DEFAULT_VIEWBOX_HEIGHT,
  COLOR_DEFAULT_PRIMARY,
  COLOR_DEFAULT_BLACK,
  COLOR_DEFAULT_WHITE
} from '../config/constants'

describe('Constants Configuration', () => {
  it('should have valid storage keys', () => {
    expect(STORAGE_KEY_MAIN).toBe('sticker-factory-data')
    expect(STORAGE_KEY_TEMPLATE).toBe('sticker-factory-template-data')
    expect(typeof STORAGE_KEY_MAIN).toBe('string')
    expect(STORAGE_KEY_MAIN.length).toBeGreaterThan(0)
  })

  it('should have reasonable template dimensions', () => {
    expect(TEMPLATE_PADDING).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_WIDTH).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_HEIGHT).toBeGreaterThan(0)
    expect(DEFAULT_VIEWBOX_WIDTH).toBeGreaterThanOrEqual(400)
    expect(DEFAULT_VIEWBOX_HEIGHT).toBeGreaterThanOrEqual(400)
  })

  it('should have valid color constants', () => {
    expect(COLOR_DEFAULT_PRIMARY).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(COLOR_DEFAULT_BLACK).toBe('#000000')
    expect(COLOR_DEFAULT_WHITE).toBe('#ffffff')
  })

  it('should maintain consistency between related constants', () => {
    // Template padding should be reasonable relative to viewbox
    expect(TEMPLATE_PADDING).toBeLessThan(DEFAULT_VIEWBOX_WIDTH / 10)
    expect(TEMPLATE_PADDING).toBeLessThan(DEFAULT_VIEWBOX_HEIGHT / 10)
  })
})