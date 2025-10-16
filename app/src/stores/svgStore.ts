import { ref, computed } from 'vue'
import type { SvgLibraryItem } from '../types/template-types'
import { logger, createPerformanceTimer } from '../utils/logger'

// SVG Store - Singleton for managing 5000+ icons
interface SvgStoreState {
  isLoaded: boolean
  isLoading: boolean
  items: SvgLibraryItem[]
  categories: string[]
  error: string | null
}

// Private state - singleton
const _state = ref<SvgStoreState>({
  isLoaded: false,
  isLoading: false,
  items: [],
  categories: [],
  error: null
})

// SVG module loaders for lazy loading
const _svgModuleLoaders = new Map<string, () => Promise<string>>()

// Content cache for already loaded SVGs
const _svgContentCache = new Map<string, string>()

// Category consolidation map - merge small categories into logical groups
// Better category names that accommodate more icons
const CATEGORY_CONSOLIDATION: Record<string, string> = {
  // Sports & Recreation (consolidate all sport-related items)
  'yoga': 'sport',
  'weight': 'sport',
  'trekking': 'sport',
  'treadmill': 'sport',
  'trophy': 'sport',
  'tournament': 'sport',
  'stretching': 'sport',
  'sport': 'sport',
  'snowboarding': 'sport',
  'ski': 'sport',
  'skateboard': 'sport',
  'skateboarding': 'sport',
  'scoreboard': 'sport',
  'run': 'sport',
  'rollercoaster': 'sport',
  'pool': 'sport',
  'poker': 'sport',
  'pokeball': 'sport',
  'podium': 'sport',
  'olympics': 'sport',
  'monkeybar': 'sport',
  'medal': 'sport',
  'kayak': 'sport',
  'karate': 'sport',
  'jump': 'sport',
  'gymnastics': 'sport',
  'golf': 'sport',
  'games': 'sport',
  'cricket': 'sport',
  'curling': 'sport',
  'bowling': 'sport',
  'bat': 'sport',
  'barbell': 'sport',
  'ball': 'sport',
  'archery': 'sport',

  // Transportation & Vehicles (consolidate all transport)
  'zeppelin': 'vehicles',
  'truck': 'vehicles',
  'trolley': 'vehicles',
  'tractor': 'vehicles',
  'track': 'vehicles',
  'tir': 'vehicles',
  'tank': 'vehicles',
  'submarine': 'vehicles',
  'speedboat': 'vehicles',
  'sleigh': 'vehicles',
  'ship': 'vehicles',
  'scooter': 'vehicles',
  'rv': 'vehicles',
  'rocket': 'vehicles',
  'road': 'vehicles',
  'propeller': 'vehicles',
  'plane': 'vehicles',
  'parachute': 'vehicles',
  'motorbike': 'vehicles',
  'moped': 'vehicles',
  'lane': 'vehicles',
  'jetpack': 'vehicles',
  'helicopter': 'vehicles',
  'forklift': 'vehicles',
  'firetruck': 'vehicles',
  'engine': 'vehicles',
  'drone': 'vehicles',
  'car': 'vehicles',
  'caravan': 'vehicles',
  'camper': 'vehicles',
  'bulldozer': 'vehicles',
  'bus': 'vehicles',
  'bike': 'vehicles',
  'backhoe': 'vehicles',
  'ambulance': 'vehicles',
  'aerial': 'vehicles',
  'wiper': 'vehicles',
  'transport': 'vehicles',

  // Technology & Computing (merge tech categories)
  'webhook': 'technology',
  'versions': 'technology',
  'usb': 'technology',
  'upload': 'technology',
  'unlink': 'technology',
  'uhd': 'technology',
  'terminal': 'technology',
  'tech': 'technology',
  'source': 'technology',
  'sdk': 'technology',
  'screenshot': 'technology',
  'schema': 'technology',
  'scan': 'technology',
  'sandbox': 'technology',
  'rss': 'technology',
  'router': 'technology',
  'regex': 'technology',
  'radar': 'technology',
  'qrcode': 'technology',
  'protocol': 'technology',
  'ping': 'technology',
  'packages': 'technology',
  'outlet': 'technology',
  'nfc': 'technology',
  'network': 'technology',
  'mobiledata': 'technology',
  'macro': 'technology',
  'logs': 'technology',
  'load': 'technology',
  'headset': 'technology',
  'headphones': 'technology',
  'gizmo': 'technology',
  'function': 'technology',
  'download': 'technology',
  'container': 'technology',
  'components': 'technology',
  'command': 'technology',
  'cast': 'technology',
  'bug': 'technology',
  'blocks': 'technology',
  'barcode': 'technology',
  'automation': 'technology',
  'automatic': 'technology',
  'auth': 'technology',
  'archive': 'technology',
  'apps': 'technology',
  'app': 'technology',
  'analyze': 'technology',
  'ai': 'technology',

  // Design & Creative (merge design categories)
  'writing': 'design',
  'wallpaper': 'design',
  'ux': 'design',
  'typography': 'design',
  'typeface': 'design',
  'texture': 'design',
  'template': 'design',
  'sticker': 'design',
  'sparkles': 'design',
  'shadow': 'design',
  'scribble': 'design',
  'ripple': 'design',
  'ribbon': 'design',
  'perspective': 'design',
  'palette': 'design',
  'paint': 'design',
  'gradienter': 'design',
  'frame': 'design',
  'flare': 'design',
  'effects': 'design',
  'dimensions': 'design',
  'contrast': 'design',
  'confetti': 'design',
  'brush': 'design',
  'blur': 'design',
  'blend': 'design',
  'background': 'design',
  'artboard': 'design',

  // Files & Documents (consolidate file types)
  'zip': 'files',
  'txt': 'files',
  'toml': 'files',
  'tex': 'files',
  'svg': 'files',
  'png': 'files',
  'pdf': 'files',
  'markdown': 'files',
  'json': 'files',
  'jpg': 'files',
  'html': 'files',
  'gif': 'files',
  'csv': 'files',
  'bmp': 'files',
  'file': 'files',

  // Interface & Controls (merge UI categories)
  'tooltip': 'interface',
  'tags': 'interface',
  'subtask': 'interface',
  'status': 'interface',
  'slideshow': 'interface',
  'slice': 'interface',
  'sitemap': 'interface',
  'separator': 'interface',
  'select': 'interface',
  'selector': 'interface',
  'section': 'interface',
  'search': 'interface',
  'restore': 'interface',
  'resize': 'interface',
  'replace': 'interface',
  'repeat': 'interface',
  'reorder': 'interface',
  'reload': 'interface',
  'refresh': 'interface',
  'question': 'interface',
  'prompt': 'interface',
  'point': 'interface',
  'placeholder': 'interface',
  'pinned': 'interface',
  'page': 'interface',
  'outbound': 'interface',
  'object': 'interface',
  'notification': 'interface',
  'notes': 'interface',
  'note': 'interface',
  'new': 'interface',
  'logout': 'interface',
  'login': 'interface',
  'icons': 'interface',
  'forms': 'interface',
  'forbid': 'interface',
  'explicit': 'interface',
  'details': 'interface',
  'deselect': 'interface',
  'dashboard': 'interface',
  'cut': 'interface',
  'click': 'interface',
  'checks': 'interface',
  'checklist': 'interface',
  'checkbox': 'interface',
  'cancel': 'interface',
  'bookmarks': 'interface',
  'badges': 'interface',
  'backspace': 'interface',
  'ban': 'interface',
  'alt': 'interface',
  'activity': 'interface',
  'ui': 'interface',

  // People & Characters
  'woman': 'people',
  'walk': 'people',
  'spy': 'people',
  'pray': 'people',
  'nurse': 'people',
  'moustache': 'people',
  'man': 'people',
  'friends': 'people',
  'empathize': 'people',

  // Health & Medical
  'wheelchair': 'medical',
  'stethoscope': 'medical',
  'smoking': 'medical',
  'prescription': 'medical',
  'physotherapist': 'medical',
  'pill': 'medical',
  'pills': 'medical',
  'needle': 'medical',
  'medicine': 'medical',
  'massage': 'medical',
  'mask': 'medical',
  'lungs': 'medical',
  'heartbeat': 'medical',
  'helmet': 'medical',
  'eyeglass': 'medical',
  'ear': 'medical',
  'dental': 'medical',
  'crutches': 'medical',
  'checkup': 'medical',
  'capsule': 'medical',
  'cane': 'medical',
  'bone': 'medical',
  'body': 'medical',
  'brain': 'medical',
  'bandage': 'medical',
  'accessible': 'medical',
  'health': 'medical',

  // Food & Beverages
  'wheat': 'food',
  'vegetables': 'food',
  'teapot': 'food',
  'sausage': 'food',
  'salt': 'food',
  'salad': 'food',
  'pizza': 'food',
  'pepper': 'food',
  'milkshake': 'food',
  'milk': 'food',
  'melon': 'food',
  'meat': 'food',
  'lollipop': 'food',
  'lemon': 'food',
  'eggs': 'food',
  'dumpling': 'food',
  'cherry': 'food',
  'cheese': 'food',
  'carrot': 'food',
  'carambola': 'food',
  'candy': 'food',
  'burger': 'food',
  'bread': 'food',
  'beer': 'food',
  'baguette': 'food',
  'avocado': 'food',
  'apple': 'food',
  'soup': 'food',
  'ladle': 'food',

  // Nature & Environment
  'wood': 'nature',
  'waves': 'nature',
  'volcano': 'nature',
  'tree': 'nature',
  'trees': 'nature',
  'tent': 'nature',
  'steam': 'nature',
  'spider': 'nature',
  'seedling': 'nature',
  'pumpkin': 'nature',
  'paw': 'nature',
  'mushroom': 'nature',
  'mountain': 'nature',
  'horse': 'nature',
  'grain': 'nature',
  'flower': 'nature',
  'flame': 'nature',
  'feather': 'nature',
  'fall': 'nature',
  'droplets': 'nature',
  'drop': 'nature',
  'dog': 'nature',
  'deer': 'nature',
  'cliff': 'nature',
  'clover': 'nature',
  'cat': 'nature',
  'cannabis': 'nature',
  'campfire': 'nature',
  'butterfly': 'nature',
  'beach': 'nature',
  'cactus': 'nature',

  // Weather & Climate
  'windsock': 'weather',
  'tornado': 'weather',
  'thermometer': 'weather',
  'sunset': 'weather',
  'sunrise': 'weather',
  'storm': 'weather',
  'snowman': 'weather',
  'snowflake': 'weather',
  'rainbow': 'weather',
  'mist': 'weather',
  'haze': 'weather',
  'sun': 'weather',

  // Buildings & Architecture
  'windmill': 'buildings',
  'wall': 'buildings',
  'tower': 'buildings',
  'torii': 'buildings',
  'theater': 'buildings',
  'stairs': 'buildings',
  'prison': 'buildings',
  'hotel': 'buildings',
  'hospital': 'buildings',
  'fountain': 'buildings',
  'elevator': 'buildings',
  'door': 'buildings',
  'building': 'buildings',
  'buildings': 'buildings',

  // Symbols & Icons
  'yin': 'symbols',
  'venus': 'symbols',
  'trident': 'symbols',
  'trademark': 'symbols',
  'tilde': 'symbols',
  'sword': 'symbols',
  'swords': 'symbols',
  'stars': 'symbols',
  'spade': 'symbols',
  'skull': 'symbols',
  'slash': 'symbols',
  'slashes': 'symbols',
  'servicemark': 'symbols',
  'rings': 'symbols',
  'registered': 'symbols',
  'recycle': 'symbols',
  'radioactive': 'symbols',
  'quotes': 'symbols',
  'quote': 'symbols',
  'pentagram': 'symbols',
  'peace': 'symbols',
  'parentheses': 'symbols',
  'om': 'symbols',
  'omega': 'symbols',
  'minus': 'symbols',
  'lambda': 'symbols',
  'jewish': 'symbols',
  'infinity': 'symbols',
  'horseshoe': 'symbols',
  'hearts': 'symbols',
  'hash': 'symbols',
  'diamonds': 'symbols',
  'diamond': 'symbols',
  'crown': 'symbols',
  'cross': 'symbols',
  'copyright': 'symbols',
  'copyleft': 'symbols',
  'clubs': 'symbols',
  'ce': 'symbols',
  'braces': 'symbols',
  'beta': 'symbols',
  'backslash': 'symbols',
  'at': 'symbols',
  'asterisk': 'symbols',
  'ankh': 'symbols',
  'anchor': 'symbols',
  'ampersand': 'symbols',
  'alpha': 'symbols',
  'heart': 'symbols',
  'star': 'symbols',

  // Communication & Media
  'speakerphone': 'communication',
  'shareplay': 'communication',
  'sos': 'communication',
  'send': 'communication',
  'radio': 'communication',
  'news': 'communication',
  'messages': 'communication',
  'mailbox': 'communication',
  'inbox': 'communication',
  'dialpad': 'communication',
  'broadcast': 'communication',
  'message': 'communication',
  'mail': 'communication',

  // Business & Office
  'wallet': 'business',
  'vs': 'business',
  'vip': 'business',
  'premium': 'business',
  'paywall': 'business',
  'paperclip': 'business',
  'license': 'business',
  'invoice': 'business',
  'growth': 'business',
  'exchange': 'business',
  'discount': 'business',
  'contract': 'business',
  'businessplan': 'business',
  'asset': 'business',
  'affiliate': 'business',
  'ticket': 'business',
  'shopping': 'business',
  'receipt': 'business',
  'presentation': 'business',
  'office': 'business',
  'finance': 'business',
  'currency': 'business',
  'cash': 'business',
  'business': 'business',
  'ballpen': 'business',

  // Tools & Equipment
  'wrecking': 'tools',
  'wand': 'tools',
  'trowel': 'tools',
  'tool': 'tools',
  'spray': 'tools',
  'shovel': 'tools',
  'shredder': 'tools',
  'scissors': 'tools',
  'roller': 'tools',
  'razor': 'tools',
  'prong': 'tools',
  'pick': 'tools',
  'nut': 'tools',
  'matchstick': 'tools',
  'lighter': 'tools',
  'ladder': 'tools',
  'hammer': 'tools',
  'eraser': 'tools',
  'crane': 'tools',
  'chisel': 'tools',
  'blade': 'tools',
  'axe': 'tools',
  'tools': 'tools',

  // Home & Household
  'toilet': 'home',
  'sofa': 'home',
  'sink': 'home',
  'rug': 'home',
  'refrigerator': 'home',
  'oven': 'home',
  'microwave': 'home',
  'mug': 'home',
  'ironing': 'home',
  'fridge': 'home',
  'cup': 'home',
  'cooker': 'home',
  'chair': 'home',
  'candle': 'home',
  'bulb': 'home',
  'bottle': 'home',
  'blender': 'home',
  'bath': 'home',
  'armchair': 'home',
  'vacuum': 'home',
  'home': 'home',

  // Clothing & Accessories
  'tie': 'clothing',
  'sunglasses': 'clothing',
  'sock': 'clothing',
  'shoe': 'clothing',
  'shirt': 'clothing',
  'jacket': 'clothing',
  'clothes': 'clothing',

  // Education & Learning
  'science': 'education',
  'school': 'education',
  'library': 'education',
  'education': 'education',
  'books': 'education',
  'book': 'education',
  'bible': 'education',
  'abc': 'education',
  'vocabulary': 'education',
  'notebook': 'education',
  'manual': 'education',
  'abacus': 'education',

  // Science & Research
  'uv': 'science',
  'ufo': 'science',
  'telescope': 'science',
  'satellite': 'science',
  'microscope': 'science',
  'meteor': 'science',
  'mars': 'science',
  'magnetic': 'science',
  'magnet': 'science',
  'galaxy': 'science',
  'crystal': 'science',
  'comet': 'science',
  'atom': 'science',
  'alien': 'science',
  'universe': 'science',
  'space': 'science',

  // Shapes & Geometry
  'triangles': 'shapes',
  'spiral': 'shapes',
  'sphere': 'shapes',
  'polygon': 'shapes',
  'oval': 'shapes',
  'ikosaedr': 'shapes',
  'frustum': 'shapes',
  'cylinder': 'shapes',
  'cube': 'shapes',
  'cone': 'shapes',
  'circles': 'shapes',
  'blob': 'shapes',
  'hexagons': 'shapes',
  'hexagon': 'shapes',
  'square': 'shapes',
  'rectangle': 'shapes',
  'pentagon': 'shapes',
  'octagon': 'shapes',
  'circle': 'shapes',

  // Time & Calendar
  'timezone': 'time',
  'stopwatch': 'time',
  'clock': 'time',
  'calendar': 'time',
  'time': 'time',

  // Music & Audio
  'vinyl': 'music',
  'stereo': 'music',
  'piano': 'music',
  'metronome': 'music',
  'guitar': 'music',
  'album': 'music',
  'music': 'music',

  // Math & Numbers
  'sum': 'math',
  'percentage': 'math',
  'matrix': 'math',
  'math': 'math',
  'decimal': 'math',
  'congruent': 'math',
  'angle': 'math',
  'divide': 'math',
  'number': 'math',
  'numbers': 'math',

  // Alerts & Safety
  'urgent': 'alerts',
  'safety': 'alerts',
  'lifebuoy': 'alerts',
  'emergency': 'alerts',
  'biohazard': 'alerts',
  'alert': 'alerts',

  // Text & Typography
  'underline': 'text',
  'superscript': 'text',
  'subscript': 'text',
  'strikethrough': 'text',
  'signature': 'text',
  'spaces': 'text',
  'overline': 'text',
  'italic': 'text',
  'highlight': 'text',
  'heading': 'text',
  'emphasis': 'text',
  'bold': 'text',
  'blockquote': 'text',
  'article': 'text',
  'text': 'text',

  // Misc (catch-all for unique items)
  'zzz': 'misc',
  'whirl': 'misc',
  'tic': 'misc',
  'reserved': 'misc',
  'perfume': 'misc',
  'pacman': 'misc',
  'old': 'misc',
  'meeple': 'misc',
  'mickey': 'misc',
  'lego': 'misc',
  'joker': 'misc',
  'grave': 'misc',
  'go': 'misc',
  'dual': 'misc',
  'diaper': 'misc',
  'confucius': 'misc',
  'cards': 'misc',
  'cardboards': 'misc',
  'boom': 'misc',
  'bong': 'misc',
  'balloon': 'misc',
  'backpack': 'misc',
  'awards': 'misc',
  'award': 'misc',
  'barrel': 'misc',
  'poo': 'misc'
}

// Minimum category size threshold
const MIN_CATEGORY_SIZE = 10

/**
 * Load SVG library metadata only (lazy loading approach)
 */
export async function loadSvgLibraryStore(): Promise<SvgLibraryItem[]> {
  // Return cached if already loaded
  if (_state.value.isLoaded) {
    logger.info('SVG Store: Returning cached library', _state.value.items.length, 'items')
    return _state.value.items
  }

  // Prevent concurrent loading
  if (_state.value.isLoading) {
    logger.info('SVG Store: Already loading, waiting for completion')
    // Wait for loading to complete
    while (_state.value.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return _state.value.items
  }

  const timer = createPerformanceTimer('SVG Library Metadata Load')
  _state.value.isLoading = true
  _state.value.error = null

  try {
    logger.info('SVG Store: Loading SVG library metadata (lazy loading)...')

    // Load SVG modules references (but not content)
    const svgModules = import.meta.glob('../../images/*.svg', {
      query: '?raw',
      import: 'default',
      eager: false
    })

    const svgEntries = Object.entries(svgModules)
    logger.info(`SVG Store: Found ${svgEntries.length} SVG files`)

    // Store module loaders for lazy loading
    _svgModuleLoaders.clear()
    svgEntries.forEach(([path, loader]) => {
      const filename = path.split('/').pop()?.replace('.svg', '') || ''
      _svgModuleLoaders.set(filename, loader)
    })

    // Create metadata-only items (no SVG content loaded yet)
    const items: SvgLibraryItem[] = svgEntries.map(([path]) => {
      const filename = path.split('/').pop()?.replace('.svg', '') || ''
      return createSvgLibraryItemMetadata(filename)
    }).filter(item => item !== null) as SvgLibraryItem[]

    // Consolidate categories and sort
    const consolidatedItems = consolidateCategories(items)
    const sortedItems = sortSvgItems(consolidatedItems)

    // Extract categories
    const categories = extractCategories(sortedItems)

    // Update store state
    _state.value.items = sortedItems
    _state.value.categories = categories
    _state.value.isLoaded = true
    _state.value.isLoading = false

    const loadTime = timer.end({
      totalItems: sortedItems.length,
      totalCategories: categories.length,
      consolidatedCategories: Object.keys(CATEGORY_CONSOLIDATION).length
    })

    logger.info(`SVG Store: Successfully loaded ${sortedItems.length} items metadata in ${loadTime}ms`)
    logger.info('SVG Store: Categories:', categories.join(', '))

    return sortedItems

  } catch (error) {
    _state.value.error = error instanceof Error ? error.message : 'Unknown error'
    _state.value.isLoading = false
    logger.error('SVG Store: Error loading library:', error)
    throw error
  }
}

/**
 * Create SVG library item metadata only (no content)
 */
function createSvgLibraryItemMetadata(filename: string): SvgLibraryItem | null {
  if (!filename) return null

  const { category, name, tags } = parseSvgFilename(filename)

  return {
    id: filename,
    name,
    category,
    svgContent: '', // Empty content - will be loaded lazily
    tags
  }
}

/**
 * Parse SVG filename to extract metadata
 */
function parseSvgFilename(filename: string): { category: string; name: string; tags: string[] } {
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
 * Consolidate small categories into larger ones
 */
function consolidateCategories(items: SvgLibraryItem[]): SvgLibraryItem[] {
  // Count items per category
  const categoryCounts = new Map<string, number>()
  items.forEach(item => {
    const count = categoryCounts.get(item.category) || 0
    categoryCounts.set(item.category, count + 1)
  })

  logger.info('SVG Store: Original category distribution:', Object.fromEntries(categoryCounts))

  // Apply consolidation
  return items.map(item => {
    const originalCategory = item.category
    const newCategory = CATEGORY_CONSOLIDATION[originalCategory]

    if (newCategory) {
      return {
        ...item,
        category: newCategory,
        tags: [...item.tags, originalCategory] // Preserve original category as tag
      }
    }

    // Check if category is too small and consolidate to misc
    const categorySize = categoryCounts.get(originalCategory) || 0
    if (categorySize < MIN_CATEGORY_SIZE && originalCategory !== 'misc') {
      return {
        ...item,
        category: 'misc',
        tags: [...item.tags, originalCategory] // Preserve original category as tag
      }
    }

    return item
  })
}

/**
 * Sort SVG items by category and name
 */
function sortSvgItems(items: SvgLibraryItem[]): SvgLibraryItem[] {
  return items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.name.localeCompare(b.name)
  })
}

/**
 * Extract unique categories from items
 */
function extractCategories(items: SvgLibraryItem[]): string[] {
  const categories = [...new Set(items.map(item => item.category))]
  return categories.sort()
}

// Store interface - singleton pattern
export const useSvgStore = () => {
  const items = computed(() => _state.value.items)
  const categories = computed(() => _state.value.categories)
  const isLoaded = computed(() => _state.value.isLoaded)
  const isLoading = computed(() => _state.value.isLoading)
  const error = computed(() => _state.value.error)

  /**
   * Get SVGs by category
   */
  const getSvgsByCategory = (category: string): SvgLibraryItem[] => {
    return _state.value.items.filter(svg => svg.category === category)
  }

  /**
   * Search SVGs by query
   */
  const searchSvgs = (query: string): SvgLibraryItem[] => {
    if (!query.trim()) {
      return _state.value.items
    }

    const searchTerm = query.toLowerCase()
    return _state.value.items.filter(svg =>
      svg.name.toLowerCase().includes(searchTerm) ||
      svg.category.toLowerCase().includes(searchTerm) ||
      svg.tags.some(tag => tag.includes(searchTerm))
    )
  }

  /**
   * Get SVG by ID
   */
  const getSvgById = (id: string): SvgLibraryItem | null => {
    return _state.value.items.find(svg => svg.id === id) || null
  }

  /**
   * Get SVG content by ID (with lazy loading)
   */
  const getSvgContent = async (id: string): Promise<string | null> => {
    // Check cache first
    if (_svgContentCache.has(id)) {
      return _svgContentCache.get(id) || null
    }

    // Check if we have a loader for this SVG
    const loader = _svgModuleLoaders.get(id)
    if (!loader) {
      logger.warn(`SVG Store: No loader found for SVG: ${id}`)
      return null
    }

    try {
      // Load SVG content lazily
      const content = await loader() as string

      // Cache the content
      _svgContentCache.set(id, content)

      // Update the item in store to have content
      const item = _state.value.items.find(item => item.id === id)
      if (item) {
        item.svgContent = content
      }

      logger.debug(`SVG Store: Lazy loaded content for: ${id}`)
      return content
    } catch (error) {
      logger.warn(`SVG Store: Failed to lazy load SVG: ${id}`, error)
      return null
    }
  }

  /**
   * Clear store cache (for development)
   */
  const clearCache = (): void => {
    _state.value.isLoaded = false
    _state.value.isLoading = false
    _state.value.items = []
    _state.value.categories = []
    _state.value.error = null
    _svgModuleLoaders.clear()
    _svgContentCache.clear()
    logger.info('SVG Store: Cache cleared')
  }

  /**
   * Get store statistics
   */
  const getStats = () => {
    const categoryCounts = new Map<string, number>()
    _state.value.items.forEach(item => {
      const count = categoryCounts.get(item.category) || 0
      categoryCounts.set(item.category, count + 1)
    })

    return {
      totalItems: _state.value.items.length,
      totalCategories: _state.value.categories.length,
      categoryDistribution: Object.fromEntries(categoryCounts),
      isLoaded: _state.value.isLoaded,
      isLoading: _state.value.isLoading,
      error: _state.value.error
    }
  }

  return {
    // State
    items,
    categories,
    isLoaded,
    isLoading,
    error,

    // Actions
    loadSvgLibraryStore,
    getSvgsByCategory,
    searchSvgs,
    getSvgById,
    getSvgContent,
    clearCache,
    getStats
  }
}