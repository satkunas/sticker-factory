import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  loadFont,
  getFontFamily,
  getFontMetrics,
  preloadPopularFonts,
  DEFAULT_FONT,
  type FontConfig
} from '../config/fonts'

// Mock DOM methods
const createMockElement = () => ({
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  rel: '',
  href: '',
  id: ''
})

describe('Font System', () => {
  let originalDocument: typeof document
  let mockHead: any

  beforeEach(() => {
    // Mock document and DOM methods
    mockHead = {
      appendChild: vi.fn(),
      querySelector: vi.fn()
    }

    global.document = {
      createElement: vi.fn(() => createMockElement()),
      head: mockHead,
      querySelector: vi.fn()
    } as any

    global.performance = {
      now: vi.fn(() => Date.now())
    } as any

    // Clear any previous state
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (originalDocument) {
      global.document = originalDocument
    }
  })

  describe('loadFont', () => {
    it('should load Google Fonts correctly', async () => {
      const mockLink = createMockElement()
      vi.mocked(document.createElement).mockReturnValue(mockLink as any)
      mockHead.querySelector.mockReturnValue(null) // Font not already loaded

      const googleFont: FontConfig = {
        name: 'Roboto',
        family: 'Roboto',
        weights: [400, 700],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
        fallback: 'Arial, sans-serif'
      }

      const loadPromise = loadFont(googleFont)

      // Simulate successful font load
      if (mockLink.onload) {
        mockLink.onload()
      }

      await loadPromise

      expect(document.createElement).toHaveBeenCalledWith('link')
      expect(mockHead.appendChild).toHaveBeenCalledWith(mockLink)
      expect(mockLink.rel).toBe('stylesheet')
      expect(mockLink.href).toContain('display=swap')
    })

    it('should handle system fonts immediately', async () => {
      const systemFont: FontConfig = {
        name: 'Arial',
        family: 'Arial',
        weights: [400, 700],
        category: 'sans-serif',
        source: 'system',
        fallback: 'sans-serif'
      }

      await loadFont(systemFont)

      expect(document.createElement).not.toHaveBeenCalled()
      expect(mockHead.appendChild).not.toHaveBeenCalled()
    })

    it('should handle fonts with custom CSS rules', async () => {
      const mockStyle = { id: '', textContent: '' }
      vi.mocked(document.createElement).mockReturnValue(mockStyle as any)
      mockHead.querySelector.mockReturnValue(null)

      const customFont: FontConfig = {
        name: 'Custom Font',
        family: 'Custom Font',
        weights: [400],
        category: 'sans-serif',
        source: 'web',
        cssRules: [
          '@font-face { font-family: "Custom Font"; src: url("custom.woff2"); }'
        ],
        fallback: 'sans-serif'
      }

      await loadFont(customFont)

      expect(document.createElement).toHaveBeenCalledWith('style')
      expect(mockStyle.id).toBe('font-custom-font')
      expect(mockStyle.textContent).toContain('@font-face')
      expect(mockHead.appendChild).toHaveBeenCalledWith(mockStyle)
    })

    it('should handle font loading failures', async () => {
      const mockLink = createMockElement()
      vi.mocked(document.createElement).mockReturnValue(mockLink as any)
      mockHead.querySelector.mockReturnValue(null)

      const failingFont: FontConfig = {
        name: 'Failing Font',
        family: 'Failing Font',
        weights: [400],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'https://fonts.googleapis.com/css2?family=NonExistent',
        fallback: 'sans-serif'
      }

      const loadPromise = loadFont(failingFont)

      // Simulate font load error
      if (mockLink.onerror) {
        mockLink.onerror()
      }

      await expect(loadPromise).rejects.toThrow('Failed to load font: Failing Font')
    })

    it('should handle system fonts without DOM operations', async () => {
      const systemFont: FontConfig = {
        name: 'Arial',
        family: 'Arial',
        weights: [400],
        category: 'sans-serif',
        source: 'system',
        fallback: 'sans-serif'
      }

      // System fonts should resolve immediately without DOM operations
      const startTime = Date.now()
      await loadFont(systemFont)
      const duration = Date.now() - startTime

      // Should complete very quickly for system fonts
      expect(duration).toBeLessThan(50)
      expect(document.createElement).not.toHaveBeenCalled()
      expect(mockHead.appendChild).not.toHaveBeenCalled()
    })

    it('should reject unsafe font URLs', async () => {
      const unsafeFont: FontConfig = {
        name: 'Unsafe Font',
        family: 'Unsafe Font',
        weights: [400],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'http://evil.com/fonts.css', // Non-HTTPS, untrusted domain
        fallback: 'sans-serif'
      }

      await expect(loadFont(unsafeFont)).rejects.toThrow('Unsafe font URL rejected')
    })
  })

  describe('getFontFamily', () => {
    it('should return correct font family string', () => {
      const font: FontConfig = {
        name: 'Test Font',
        family: 'Test Font',
        weights: [400],
        category: 'sans-serif',
        source: 'google',
        fallback: 'Arial, sans-serif'
      }

      const result = getFontFamily(font)
      expect(result).toBe('"Test Font", Arial, sans-serif')
    })

    it('should handle fonts with spaces in names', () => {
      const font: FontConfig = {
        name: 'Open Sans',
        family: 'Open Sans',
        weights: [400],
        category: 'sans-serif',
        source: 'google',
        fallback: 'Helvetica, sans-serif'
      }

      const result = getFontFamily(font)
      expect(result).toBe('"Open Sans", Helvetica, sans-serif')
    })
  })

  describe('getFontMetrics', () => {
    it('should return font loading metrics', () => {
      const metrics = getFontMetrics()

      expect(metrics).toHaveProperty('loadedFonts')
      expect(metrics).toHaveProperty('totalLoaded')
      expect(metrics).toHaveProperty('currentlyLoading')

      expect(Array.isArray(metrics.loadedFonts)).toBe(true)
      expect(typeof metrics.totalLoaded).toBe('number')
      expect(typeof metrics.currentlyLoading).toBe('number')
    })
  })

  describe('preloadPopularFonts', () => {
    it('should attempt to preload popular fonts', async () => {
      const mockLinks: any[] = []
      vi.mocked(document.createElement).mockImplementation(() => {
        const mockLink = createMockElement()
        mockLinks.push(mockLink)
        return mockLink as any
      })
      mockHead.querySelector.mockReturnValue(null)

      const preloadPromise = preloadPopularFonts()

      // Simulate successful loads for all created links
      setTimeout(() => {
        mockLinks.forEach(link => {
          if (link.onload) {
            link.onload()
          }
        })
      }, 10)

      await preloadPromise

      // Should have attempted to load multiple popular fonts
      expect(document.createElement).toHaveBeenCalled()
      expect(mockHead.appendChild).toHaveBeenCalled()
    }, 10000)

    it('should handle preload failures gracefully', async () => {
      const mockLinks: any[] = []
      vi.mocked(document.createElement).mockImplementation(() => {
        const mockLink = createMockElement()
        mockLinks.push(mockLink)
        return mockLink as any
      })
      mockHead.querySelector.mockReturnValue(null)

      const preloadPromise = preloadPopularFonts()

      // Simulate font load errors
      setTimeout(() => {
        mockLinks.forEach(link => {
          if (link.onerror) {
            link.onerror()
          }
        })
      }, 10)

      // Should not throw even if some fonts fail
      await expect(preloadPromise).resolves.toBeUndefined()
    }, 10000)
  })

  describe('DEFAULT_FONT', () => {
    it('should have a valid default font', () => {
      expect(DEFAULT_FONT).toBeDefined()
      expect(DEFAULT_FONT).toHaveProperty('name')
      expect(DEFAULT_FONT).toHaveProperty('family')
      expect(DEFAULT_FONT).toHaveProperty('weights')
      expect(DEFAULT_FONT).toHaveProperty('category')
      expect(DEFAULT_FONT).toHaveProperty('source')
      expect(DEFAULT_FONT).toHaveProperty('fallback')

      expect(Array.isArray(DEFAULT_FONT.weights)).toBe(true)
      expect(DEFAULT_FONT.weights.length).toBeGreaterThan(0)
    })

    it('should be Inter or first available font', () => {
      expect(['Inter', 'Roboto', 'Arial'].includes(DEFAULT_FONT.name)).toBe(true)
    })
  })

  describe('font caching and performance', () => {
    it('should implement font loading cache', async () => {
      const mockLink = createMockElement()
      vi.mocked(document.createElement).mockReturnValue(mockLink as any)
      mockHead.querySelector.mockReturnValue(null)

      const testFont: FontConfig = {
        name: 'Cache Test',
        family: 'Cache Test',
        weights: [400],
        category: 'sans-serif',
        source: 'google',
        fontUrl: 'https://fonts.googleapis.com/css2?family=CacheTest',
        fallback: 'sans-serif'
      }

      // First load
      const firstLoad = loadFont(testFont)
      if (mockLink.onload) {
        mockLink.onload()
      }
      await firstLoad

      // Reset mocks
      vi.clearAllMocks()

      // Second load should use cache
      await loadFont(testFont)

      // Should not create new elements for cached font
      expect(document.createElement).not.toHaveBeenCalled()
    })
  })
})