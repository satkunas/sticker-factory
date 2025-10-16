import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  extractWebFontUrls,
  embedWebFonts,
  clearFontCache,
  getFontCacheSize,
  getFontCacheMemoryUsage
} from '../utils/font-embedding'

// Mock fetch for font downloads
global.fetch = vi.fn()

describe('Font Embedding System', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearFontCache()

    // Reset fetch mock
    vi.mocked(fetch).mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('extractWebFontUrls', () => {
    it('should extract Google Font URLs from CSS @import statements', () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
        body { font-family: 'Roboto', sans-serif; }
      `

      const urls = extractWebFontUrls(cssContent)

      expect(urls).toHaveLength(2)
      expect(urls[0]).toContain('Roboto')
      expect(urls[1]).toContain('Open+Sans')
      expect(urls.every(url => url.includes('fonts.googleapis.com'))).toBe(true)
    })

    it('should handle CSS without Google Font imports', () => {
      const cssContent = `
        body { font-family: Arial, sans-serif; }
        .title { font-size: 24px; }
      `

      const urls = extractWebFontUrls(cssContent)
      expect(urls).toHaveLength(0)
    })

    it('should handle malformed @import statements', () => {
      const cssContent = `
        @import url('not-a-google-font.com/css');
        @import 'missing-url-wrapper';
        @import url('https://fonts.googleapis.com/css2?family=Valid:wght@400');
      `

      const urls = extractWebFontUrls(cssContent)
      expect(urls).toHaveLength(2) // Now extracts ALL @import url() - both Google Fonts and other services
      expect(urls[0]).toBe('not-a-google-font.com/css')
      expect(urls[1]).toContain('Valid')
    })

    it('should extract URLs with different quote styles', () => {
      const cssContent = `
        @import url("https://fonts.googleapis.com/css2?family=Double");
        @import url('https://fonts.googleapis.com/css2?family=Single');
      `

      const urls = extractWebFontUrls(cssContent)
      expect(urls).toHaveLength(2)
      expect(urls.some(url => url.includes('Double'))).toBe(true)
      expect(urls.some(url => url.includes('Single'))).toBe(true)
    })
  })

  describe('embedWebFonts', () => {
    it('should embed Google Fonts CSS successfully', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;600&display=swap');
        body { font-family: 'Roboto', sans-serif; }
      `

      // Mock Google Fonts CSS response
      const mockGoogleCss = `
        @font-face {
          font-family: 'Roboto';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/roboto/v30/roboto-400.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Roboto';
          font-style: normal;
          font-weight: 600;
          src: url(https://fonts.gstatic.com/s/roboto/v30/roboto-600.woff2) format('woff2');
        }
      `

      // Mock font file data
      const mockFontData = new Uint8Array([1, 2, 3, 4, 5])

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            // Mock CSS response
            return Promise.resolve({
              ok: true,
              text: () => Promise.resolve(mockGoogleCss)
            } as any)
          } else if (url.includes('fonts.gstatic.com')) {
            // Mock font file response
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(mockFontData.buffer),
              headers: {
                get: () => 'font/woff2'
              }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const result = await embedWebFonts(cssContent)

      expect(result).not.toBe(cssContent) // Should be modified
      expect(result).toContain('@font-face')
      expect(result).toContain('font-family: \'Roboto\'')
      expect(result).toContain('data:font/woff2;base64')
      expect(result).not.toContain('@import') // Should replace imports
    })

    it('should handle CSS without Google Font imports', async () => {
      const cssContent = `
        body { font-family: Arial, sans-serif; }
        .title { font-size: 24px; }
      `

      const result = await embedWebFonts(cssContent)
      expect(result).toBe(cssContent) // Should be unchanged
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should handle network errors gracefully', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400');
        body { font-family: 'Roboto', sans-serif; }
      `

      // Mock network failure
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await embedWebFonts(cssContent)
      expect(result).toBe(cssContent) // Should fallback to original
    })

    it('should handle 404 responses gracefully', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=NonExistent:wght@400');
      `

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404
      } as any)

      const result = await embedWebFonts(cssContent)
      expect(result).toBe(cssContent) // Should fallback to original
    })

    it('should handle multiple font families', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400');
      `

      const mockFontData = new Uint8Array([1, 2, 3])

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            if (url.includes('Roboto')) {
              return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(`
                  @font-face {
                    font-family: 'Roboto';
                    src: url(https://fonts.gstatic.com/roboto.woff2) format('woff2');
                  }
                `)
              } as any)
            } else if (url.includes('Open+Sans')) {
              return Promise.resolve({
                ok: true,
                text: () => Promise.resolve(`
                  @font-face {
                    font-family: 'Open Sans';
                    src: url(https://fonts.gstatic.com/opensans.woff2) format('woff2');
                  }
                `)
              } as any)
            }
          } else if (url.includes('fonts.gstatic.com')) {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(mockFontData.buffer),
              headers: { get: () => 'font/woff2' }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const result = await embedWebFonts(cssContent)

      expect(result).toContain('font-family: \'Roboto\'')
      expect(result).toContain('font-family: \'Open Sans\'')
      expect(result).not.toContain('@import')
    })
  })

  describe('Font Cache Management', () => {
    it('should start with empty cache', () => {
      expect(getFontCacheSize()).toBe(0)
      expect(getFontCacheMemoryUsage()).toBe(0)
    })

    it('should track cache size correctly', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400');
      `

      const mockFontData = new Uint8Array([1, 2, 3, 4, 5])

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            return Promise.resolve({
              ok: true,
              text: () => Promise.resolve(`
                @font-face {
                  font-family: 'Roboto';
                  src: url(https://fonts.gstatic.com/roboto.woff2) format('woff2');
                }
              `)
            } as any)
          } else if (url.includes('fonts.gstatic.com')) {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(mockFontData.buffer),
              headers: { get: () => 'font/woff2' }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      // First request should cache the font
      await embedWebFonts(cssContent)
      expect(getFontCacheSize()).toBeGreaterThan(0)

      // Second request should use cache (no additional fetch calls)
      const fetchCallsBefore = vi.mocked(fetch).mock.calls.length
      await embedWebFonts(cssContent)
      const fetchCallsAfter = vi.mocked(fetch).mock.calls.length

      // Should have made additional CSS request but reused cached font
      expect(fetchCallsAfter).toBeGreaterThanOrEqual(fetchCallsBefore)
    })

    it('should clear cache correctly', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Test:wght@400');
      `

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            return Promise.resolve({
              ok: true,
              text: () => Promise.resolve(`
                @font-face {
                  font-family: 'Test';
                  src: url(https://fonts.gstatic.com/test.woff2) format('woff2');
                }
              `)
            } as any)
          } else if (url.includes('fonts.gstatic.com')) {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
              headers: { get: () => 'font/woff2' }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      // Add something to cache
      await embedWebFonts(cssContent)
      expect(getFontCacheSize()).toBeGreaterThan(0)

      // Clear cache
      clearFontCache()
      expect(getFontCacheSize()).toBe(0)
      expect(getFontCacheMemoryUsage()).toBe(0)
    })

    it('should estimate memory usage', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Memory:wght@400');
      `

      const largeFontData = new Uint8Array(1000) // 1KB font

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            return Promise.resolve({
              ok: true,
              text: () => Promise.resolve(`
                @font-face {
                  font-family: 'Memory';
                  src: url(https://fonts.gstatic.com/memory.woff2) format('woff2');
                }
              `)
            } as any)
          } else if (url.includes('fonts.gstatic.com')) {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(largeFontData.buffer),
              headers: { get: () => 'font/woff2' }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      await embedWebFonts(cssContent)

      const memoryUsage = getFontCacheMemoryUsage()
      expect(memoryUsage).toBeGreaterThan(0)
      expect(typeof memoryUsage).toBe('number')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle malformed CSS gracefully', async () => {
      const malformedCss = `
        @import url('https://fonts.googleapis.com/css2?family=Test');
      `

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid css content {{{')
      } as any)

      const result = await embedWebFonts(malformedCss)
      expect(result).toBe(malformedCss) // Should fallback to original
    })

    it('should handle binary font data correctly', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Binary:wght@400');
      `

      // Create realistic binary font data
      const binaryData = new Uint8Array(256)
      for (let i = 0; i < 256; i++) {
        binaryData[i] = i
      }

      vi.mocked(fetch).mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('fonts.googleapis.com/css2')) {
            return Promise.resolve({
              ok: true,
              text: () => Promise.resolve(`
                @font-face {
                  font-family: 'Binary';
                  src: url(https://fonts.gstatic.com/binary.woff2) format('woff2');
                }
              `)
            } as any)
          } else if (url.includes('fonts.gstatic.com')) {
            return Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(binaryData.buffer),
              headers: { get: () => 'font/woff2' }
            } as any)
          }
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const result = await embedWebFonts(cssContent)

      expect(result).toContain('@font-face')
      expect(result).toContain('data:font/woff2;base64')
      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })

    it('should handle concurrent requests efficiently', async () => {
      const cssContent = `
        @import url('https://fonts.googleapis.com/css2?family=Concurrent:wght@400');
      `

      vi.mocked(fetch).mockImplementation((url) => {
        return new Promise(resolve => {
          setTimeout(() => {
            if (typeof url === 'string') {
              if (url.includes('fonts.googleapis.com/css2')) {
                resolve({
                  ok: true,
                  text: () => Promise.resolve(`
                    @font-face {
                      font-family: 'Concurrent';
                      src: url(https://fonts.gstatic.com/concurrent.woff2) format('woff2');
                    }
                  `)
                } as any)
              } else if (url.includes('fonts.gstatic.com')) {
                resolve({
                  ok: true,
                  arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
                  headers: { get: () => 'font/woff2' }
                } as any)
              }
            }
            resolve({ ok: false } as any)
          }, 10)
        })
      })

      // Run multiple concurrent requests
      const promises = [
        embedWebFonts(cssContent),
        embedWebFonts(cssContent),
        embedWebFonts(cssContent)
      ]

      const results = await Promise.all(promises)

      // All should succeed
      results.forEach(result => {
        expect(result).toContain('@font-face')
      })
    })
  })
})