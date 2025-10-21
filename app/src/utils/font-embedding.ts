/**
 * Font Embedding Utility for PNG Export
 * Converts Google Fonts to base64 embedded @font-face declarations
 */

interface FontEmbedCache {
  [fontUrl: string]: string
}

// Cache for font data to avoid repeated downloads
const fontCache: FontEmbedCache = {}

/**
 * Extract web font URLs from CSS @import statements
 * Works with Google Fonts, Adobe Fonts, and any other web font service
 */
export function extractWebFontUrls(cssContent: string): string[] {
  // Match ANY @import url(), not just specific font services
  const importRegex = /@import\s+url\(['"]([^'"]+)['"]\);?/g
  const urls: string[] = []
  let match

  while ((match = importRegex.exec(cssContent)) !== null) {
    urls.push(match[1])
  }

  return urls
}

/**
 * Fetch web font CSS from any font service URL
 * Works with Google Fonts, Adobe Fonts, and other web font services
 * Returns CSS containing @font-face rules with font file URLs
 */
async function fetchWebFontCss(webFontUrl: string): Promise<string> {
  try {
    const response = await fetch(webFontUrl, {
      headers: {
        // Request WOFF2 format (best compression, wide support)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch web font CSS: ${response.status}`)
    }

    return await response.text()
  } catch (error) {
    // Error fetching web font CSS - fail silently in production
    return ''
  }
}

/**
 * Extract font file URLs from web font CSS @font-face rules
 * Works with CSS from Google Fonts, Adobe Fonts, and other web font services
 */
function extractFontFileUrls(css: string): Array<{ family: string; url: string; format: string }> {
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/g
  const fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/
  const srcRegex = /src:\s*url\(([^)]+)\)\s*format\(['"]([^'"]+)['"]\)/

  const fontFiles: Array<{ family: string; url: string; format: string }> = []
  let match

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const fontFaceRule = match[0]
    const familyMatch = fontFamilyRegex.exec(fontFaceRule)
    const srcMatch = srcRegex.exec(fontFaceRule)

    if (familyMatch && srcMatch) {
      fontFiles.push({
        family: familyMatch[1],
        url: srcMatch[1],
        format: srcMatch[2]
      })
    }
  }

  return fontFiles
}

/**
 * Download font file and convert to base64
 */
async function fetchAndEncodeFont(fontUrl: string): Promise<string> {
  if (fontCache[fontUrl]) {
    return fontCache[fontUrl]
  }

  try {
    const response = await fetch(fontUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = response.headers.get('content-type') || 'font/woff2'
    const dataUri = `data:${mimeType};base64,${base64}`

    fontCache[fontUrl] = dataUri

    return dataUri
  } catch (error) {
    // Error fetching font file - fail silently in production
    return ''
  }
}

/**
 * Convert web font @import statements to embedded @font-face declarations
 * Works with Google Fonts, Adobe Fonts, and any web font service that provides CSS with @font-face rules
 * Downloads font files and converts them to base64 data URIs for offline use
 */
export async function embedWebFonts(cssContent: string): Promise<string> {
  const webFontUrls = extractWebFontUrls(cssContent)

  if (webFontUrls.length === 0) {
    return cssContent
  }

  let embeddedCss = cssContent

  try {
    for (const webFontUrl of webFontUrls) {
      const webFontCss = await fetchWebFontCss(webFontUrl)

      if (!webFontCss) {
        continue
      }

      const fontFiles = extractFontFileUrls(webFontCss)

      const embeddedFontFaces: string[] = []

      for (const fontFile of fontFiles) {
        const embeddedFontData = await fetchAndEncodeFont(fontFile.url)

        if (embeddedFontData) {
          const fontFaceRule = `@font-face {
  font-family: '${fontFile.family}';
  src: url('${embeddedFontData}') format('${fontFile.format}');
  font-display: swap;
}`
          embeddedFontFaces.push(fontFaceRule)
        }
      }

      // Replace the @import with embedded @font-face rules
      if (embeddedFontFaces.length > 0) {
        const importPattern = new RegExp(`@import\\s+url\\(['"]${webFontUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\);?`, 'g')
        embeddedCss = embeddedCss.replace(importPattern, embeddedFontFaces.join('\n'))
      }
    }
  } catch (error) {
    // Error embedding web fonts - fail silently and return original CSS
    return cssContent
  }

  return embeddedCss
}

/**
 * Clear the font cache (useful for development/testing)
 * Includes proper memory cleanup
 */
export function clearFontCache(): void {
  const keys = Object.keys(fontCache)
  keys.forEach(key => {
    delete fontCache[key]
  })

  // Explicit memory cleanup for large cache operations
  if (keys.length > 50 && typeof global !== 'undefined' && global.gc) {
    global.gc()
  }
}

/**
 * Get cache size for monitoring
 */
export function getFontCacheSize(): number {
  return Object.keys(fontCache).length
}

/**
 * Get cache memory usage estimate (bytes)
 */
export function getFontCacheMemoryUsage(): number {
  let totalBytes = 0
  Object.values(fontCache).forEach(dataUri => {
    // Rough estimate: data URI length * 0.75 (base64 overhead)
    totalBytes += dataUri.length * 0.75
  })
  return totalBytes
}