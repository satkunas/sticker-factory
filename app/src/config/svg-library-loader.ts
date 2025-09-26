import type { SvgLibraryItem } from '../types/template-types'
import { logger } from '../utils/logger'

// SVG library cache to avoid repeated loading
const svgLibraryCache = new Map<string, SvgLibraryItem>()
let svgLibraryListCache: SvgLibraryItem[] | null = null

// Import SVG files dynamically - this will be populated at build time
const svgModules = import.meta.glob('../../images/*.svg', {
  query: '?raw',
  import: 'default',
  eager: false
})

/**
 * Get all available SVG IDs
 */
export const getAvailableSvgIds = (): string[] => {
  return Object.keys(svgModules).map(path => {
    const filename = path.split('/').pop()?.replace('.svg', '')
    return filename || ''
  }).filter(id => id) // Filter out empty IDs
}

/**
 * Parse SVG filename to extract category and name
 */
const parseSvgFilename = (filename: string): { category: string; name: string; tags: string[] } => {
  const parts = filename.split('-')
  if (parts.length >= 2) {
    const category = parts[0]
    const name = parts.slice(1).join(' ').replace(/([A-Z])/g, ' $1').toLowerCase()
    const tags = parts.slice(1).map(part => part.toLowerCase())
    return { category, name, tags }
  }

  return {
    category: 'misc',
    name: filename.replace(/([A-Z])/g, ' $1').toLowerCase(),
    tags: [filename.toLowerCase()]
  }
}

/**
 * Load an SVG by its ID
 */
export const loadSvg = async (svgId: string): Promise<SvgLibraryItem | null> => {
  // Check cache first
  if (svgLibraryCache.has(svgId)) {
    return svgLibraryCache.get(svgId)!
  }

  try {
    const svgPath = `../../images/${svgId}.svg`

    if (!svgModules[svgPath]) {
      logger.warn(`SVG not found: ${svgId}`)
      return null
    }

    // Load SVG content
    const svgContent = await svgModules[svgPath]() as string

    if (!svgContent) {
      logger.error(`Invalid SVG content: ${svgId}`)
      return null
    }

    // Parse filename for metadata
    const { category, name, tags } = parseSvgFilename(svgId)

    // Create SVG library item
    const svgItem: SvgLibraryItem = {
      id: svgId,
      name,
      category,
      svgContent,
      tags
    }

    // Cache the SVG item
    svgLibraryCache.set(svgId, svgItem)
    return svgItem

  } catch (error) {
    logger.error(`Failed to load SVG ${svgId}:`, error)
    return null
  }
}

/**
 * Load all available SVGs
 */
export const loadSvgLibrary = async (): Promise<SvgLibraryItem[]> => {
  // Return cached library if available
  if (svgLibraryListCache) {
    return svgLibraryListCache
  }

  const svgIds = getAvailableSvgIds()
  const svgItems: SvgLibraryItem[] = []

  for (const id of svgIds) {
    const svgItem = await loadSvg(id)
    if (svgItem) {
      svgItems.push(svgItem)
    }
  }

  // Sort by category and name
  svgItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.name.localeCompare(b.name)
  })

  // Cache the library
  svgLibraryListCache = svgItems
  return svgItems
}

/**
 * Get SVGs by category
 */
export const getSvgsByCategory = async (category: string): Promise<SvgLibraryItem[]> => {
  const allSvgs = await loadSvgLibrary()
  return allSvgs.filter(svg => svg.category === category)
}

/**
 * Search SVGs by name or tags
 */
export const searchSvgs = async (query: string): Promise<SvgLibraryItem[]> => {
  if (!query.trim()) {
    return loadSvgLibrary()
  }

  const allSvgs = await loadSvgLibrary()
  const searchTerm = query.toLowerCase()

  return allSvgs.filter(svg =>
    svg.name.toLowerCase().includes(searchTerm) ||
    svg.category.toLowerCase().includes(searchTerm) ||
    svg.tags.some(tag => tag.includes(searchTerm))
  )
}

/**
 * Get all available categories
 */
export const getSvgCategories = async (): Promise<string[]> => {
  const allSvgs = await loadSvgLibrary()
  const categories = [...new Set(allSvgs.map(svg => svg.category))]
  return categories.sort()
}

/**
 * Get SVG content by ID
 */
export const getSvgContent = async (svgId: string): Promise<string | null> => {
  const svg = await loadSvg(svgId)
  const content = svg?.svgContent || null


  return content
}


/**
 * Clear SVG library cache (useful for development)
 */
export const clearSvgLibraryCache = (): void => {
  svgLibraryCache.clear()
  svgLibraryListCache = null
}