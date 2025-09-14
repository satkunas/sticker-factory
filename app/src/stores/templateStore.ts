import { ref, computed, readonly } from 'vue'
import { DEFAULT_FONT, type FontConfig } from '../config/fonts'
import type { SimpleTemplate, TemplateTextInput } from '../types/template-types'
import { getDefaultTemplate } from '../config/template-loader'
import { DEFAULT_TEMPLATE } from '../config/templates'

export interface AppState {
  // Template system
  selectedTemplate: SimpleTemplate
  templateTexts: string[]
  templateTextColors: string[]
  templateTextFonts: (FontConfig | null)[]
  templateTextFontSizes: number[]
  templateTextFontWeights: number[]
  templateTextRotations: number[]
  templateTextStrokeWidths: number[]
  templateTextStrokeColors: string[]
  templateTextStrokeLinejoins: string[]

  // Legacy single-text system (for backward compatibility)
  badgeText: string
  badgeColor: string
  svgContent: string
  badgeFont: FontConfig | null
  fontSize: number
  fontWeight: number
  textColor: string
  textOpacity: number
  strokeColor: string
  strokeWidth: number
  strokeOpacity: number
  lastModified: number
}

interface StorageData extends AppState {
  version: string
  timestamp: number
}

const STORAGE_KEY = 'sticker-factory-template-data'
const STORAGE_VERSION = '2.0.0'

// Mutex for localStorage operations
let isWriting = false
const writeQueue: (() => void)[] = []

// Helper function to create default arrays based on template
const createDefaultTextArrays = (template: SimpleTemplate) => {
  // Get text inputs from the new structure (elements) or legacy structure (textInputs)
  const textElements = template.elements
    ? template.elements.filter(el => el.type === 'text')
    : []
  const textInputs = template.textInputs || []

  // Use the larger of the two counts for compatibility
  const length = Math.max(textElements.length, textInputs.length, 1) // At least 1 for legacy

  return {
    texts: Array(length).fill(''),
    colors: Array(length).fill('#ffffff'),
    fonts: Array(length).fill(null),
    fontSizes: Array(length).fill(16),
    fontWeights: Array(length).fill(400),
    rotations: textElements.length > 0
      ? textElements.map(el => el.textInput?.zIndex || 0)
      : Array(length).fill(0),
    strokeWidths: Array(length).fill(0),
    strokeColors: Array(length).fill('#000000'),
    strokeLinejoins: Array(length).fill('round')
  }
}

// Private state
const _state = ref<AppState>(() => {
  const defaults = createDefaultTextArrays(DEFAULT_TEMPLATE)
  return {
    // Template system
    selectedTemplate: DEFAULT_TEMPLATE,
    templateTexts: defaults.texts,
    templateTextColors: defaults.colors,
    templateTextFonts: defaults.fonts,
    templateTextFontSizes: defaults.fontSizes,
    templateTextFontWeights: defaults.fontWeights,
    templateTextRotations: defaults.rotations,
    templateTextStrokeWidths: defaults.strokeWidths,
    templateTextStrokeColors: defaults.strokeColors,
    templateTextStrokeLinejoins: defaults.strokeLinejoins,

    // Legacy compatibility
    badgeText: '',
    badgeColor: '#4CAF50',
    svgContent: '',
    badgeFont: DEFAULT_FONT,
    fontSize: 16,
    fontWeight: 400,
    textColor: '#ffffff',
    textOpacity: 1.0,
    strokeColor: '#000000',
    strokeWidth: 0,
    strokeOpacity: 1.0,
    lastModified: 0
  }
})()

// Cache flags
const _isLoaded = ref(false)
const _isDirty = ref(false)

// Process write queue
const processWriteQueue = () => {
  if (isWriting || writeQueue.length === 0) return

  const nextWrite = writeQueue.shift()
  if (nextWrite) {
    isWriting = true
    try {
      nextWrite()
    } finally {
      isWriting = false
      // Process next in queue after a tick
      setTimeout(processWriteQueue, 0)
    }
  }
}

// Queue a localStorage write operation
const queueWrite = (writeOp: () => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeQueue.push(() => {
      try {
        writeOp()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
    processWriteQueue()
  })
}

// Load data from localStorage (cache-on-demand)
const loadFromStorage = (): AppState => {
  if (_isLoaded.value) {
    return _state.value
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data: StorageData = JSON.parse(stored)

      // Version compatibility check
      if (data.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, using defaults')
        return getDefaultState()
      }

      const loadedState: AppState = {
        // Template system
        selectedTemplate: data.selectedTemplate || DEFAULT_TEMPLATE,
        templateTexts: data.templateTexts || createDefaultTextArrays(DEFAULT_TEMPLATE).texts,
        templateTextColors: data.templateTextColors || createDefaultTextArrays(DEFAULT_TEMPLATE).colors,
        templateTextFonts: data.templateTextFonts || createDefaultTextArrays(DEFAULT_TEMPLATE).fonts,
        templateTextFontSizes: data.templateTextFontSizes || createDefaultTextArrays(DEFAULT_TEMPLATE).fontSizes,
        templateTextFontWeights: data.templateTextFontWeights || createDefaultTextArrays(DEFAULT_TEMPLATE).fontWeights,
        templateTextRotations: data.templateTextRotations || createDefaultTextArrays(DEFAULT_TEMPLATE).rotations,
        templateTextStrokeWidths: data.templateTextStrokeWidths || createDefaultTextArrays(DEFAULT_TEMPLATE).strokeWidths,
        templateTextStrokeColors: data.templateTextStrokeColors || createDefaultTextArrays(DEFAULT_TEMPLATE).strokeColors,
        templateTextStrokeLinejoins: data.templateTextStrokeLinejoins || createDefaultTextArrays(DEFAULT_TEMPLATE).strokeLinejoins,

        // Legacy compatibility
        badgeText: data.badgeText || '',
        badgeColor: data.badgeColor || '#4CAF50',
        svgContent: data.svgContent || '',
        badgeFont: data.badgeFont || DEFAULT_FONT,
        fontSize: data.fontSize || 16,
        fontWeight: data.fontWeight || 400,
        textColor: data.textColor || '#ffffff',
        textOpacity: data.textOpacity ?? 1.0,
        strokeColor: data.strokeColor || '#000000',
        strokeWidth: data.strokeWidth ?? 0,
        strokeOpacity: data.strokeOpacity ?? 1.0,
        lastModified: data.lastModified || data.timestamp || 0
      }

      _state.value = loadedState
      _isLoaded.value = true
      _isDirty.value = false

      return loadedState
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }

  const defaultState = getDefaultState()
  _state.value = defaultState
  _isLoaded.value = true
  _isDirty.value = false
  return defaultState
}

// Get default state
const getDefaultState = (): AppState => {
  const defaults = createDefaultTextArrays(DEFAULT_TEMPLATE)
  return {
    // Template system
    selectedTemplate: DEFAULT_TEMPLATE,
    templateTexts: defaults.texts,
    templateTextColors: defaults.colors,
    templateTextFonts: defaults.fonts,
    templateTextFontSizes: defaults.fontSizes,
    templateTextFontWeights: defaults.fontWeights,
    templateTextRotations: defaults.rotations,
    templateTextStrokeWidths: defaults.strokeWidths,
    templateTextStrokeColors: defaults.strokeColors,
    templateTextStrokeLinejoins: defaults.strokeLinejoins,

    // Legacy compatibility
    badgeText: '',
    badgeColor: '#4CAF50',
    svgContent: '',
    badgeFont: DEFAULT_FONT,
    fontSize: 16,
    fontWeight: 400,
    textColor: '#ffffff',
    textOpacity: 1.0,
    strokeColor: '#000000',
    strokeWidth: 0,
    strokeOpacity: 1.0,
    lastModified: 0
  }
}

// Save to localStorage with mutex
const saveToStorage = async (state: AppState): Promise<void> => {
  const storageData: StorageData = {
    ...state,
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    lastModified: Date.now()
  }

  return queueWrite(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
    _isDirty.value = false
    _state.value.lastModified = storageData.lastModified
  })
}

// Clear storage with mutex
const clearStorage = async (): Promise<void> => {
  return queueWrite(() => {
    localStorage.removeItem(STORAGE_KEY)
    _state.value = getDefaultState()
    _isDirty.value = false
    _isLoaded.value = true
  })
}

// Store interface
export const useTemplateStore = () => {

  // Template system getters
  const selectedTemplate = computed(() => {
    loadFromStorage()
    return _state.value.selectedTemplate
  })

  const templateTexts = computed(() => {
    loadFromStorage()
    return _state.value.templateTexts
  })

  const templateTextColors = computed(() => {
    loadFromStorage()
    return _state.value.templateTextColors
  })

  const templateTextFonts = computed(() => {
    loadFromStorage()
    return _state.value.templateTextFonts
  })

  const templateTextFontSizes = computed(() => {
    loadFromStorage()
    return _state.value.templateTextFontSizes
  })

  const templateTextFontWeights = computed(() => {
    loadFromStorage()
    return _state.value.templateTextFontWeights
  })

  const templateTextRotations = computed(() => {
    loadFromStorage()
    return _state.value.templateTextRotations
  })

  const templateTextStrokeWidths = computed(() => {
    loadFromStorage()
    return _state.value.templateTextStrokeWidths
  })

  const templateTextStrokeColors = computed(() => {
    loadFromStorage()
    return _state.value.templateTextStrokeColors
  })

  const templateTextStrokeLinejoins = computed(() => {
    loadFromStorage()
    return _state.value.templateTextStrokeLinejoins
  })

  // Legacy getters (for backward compatibility)
  const badgeText = computed(() => {
    loadFromStorage()
    return _state.value.badgeText
  })

  const badgeColor = computed(() => {
    loadFromStorage()
    return _state.value.badgeColor
  })

  const svgContent = computed(() => {
    loadFromStorage()
    return _state.value.svgContent
  })

  const badgeFont = computed(() => {
    loadFromStorage()
    return _state.value.badgeFont
  })

  const fontSize = computed(() => {
    loadFromStorage()
    return _state.value.fontSize
  })

  const fontWeight = computed(() => {
    loadFromStorage()
    return _state.value.fontWeight
  })

  const textColor = computed(() => {
    loadFromStorage()
    return _state.value.textColor
  })

  const strokeColor = computed(() => {
    loadFromStorage()
    return _state.value.strokeColor
  })

  const strokeWidth = computed(() => {
    loadFromStorage()
    return _state.value.strokeWidth
  })

  const lastModified = computed(() => {
    loadFromStorage()
    return _state.value.lastModified
  })

  const isLoaded = computed(() => _isLoaded.value)
  const isDirty = computed(() => _isDirty.value)

  // Get entire state (triggers load if needed)
  const getState = computed((): Readonly<AppState> => {
    loadFromStorage()
    return readonly(_state.value).value
  })

  // Template mutations
  const setSelectedTemplate = async (template: SimpleTemplate) => {
    loadFromStorage()
    _state.value.selectedTemplate = template

    // Resize arrays to match new template
    const defaults = createDefaultTextArrays(template)
    _state.value.templateTexts = defaults.texts
    _state.value.templateTextColors = defaults.colors
    _state.value.templateTextFonts = defaults.fonts
    _state.value.templateTextFontSizes = defaults.fontSizes
    _state.value.templateTextFontWeights = defaults.fontWeights
    _state.value.templateTextRotations = defaults.rotations
    _state.value.templateTextStrokeWidths = defaults.strokeWidths
    _state.value.templateTextStrokeColors = defaults.strokeColors
    _state.value.templateTextStrokeLinejoins = defaults.strokeLinejoins

    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setTemplateText = async (index: number, text: string) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTexts.length) {
      _state.value.templateTexts[index] = text
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextColor = async (index: number, color: string) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextColors.length) {
      _state.value.templateTextColors[index] = color
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextFont = async (index: number, font: FontConfig | null) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextFonts.length) {
      _state.value.templateTextFonts[index] = font
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextFontSize = async (index: number, size: number) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextFontSizes.length) {
      _state.value.templateTextFontSizes[index] = size
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextFontWeight = async (index: number, weight: number) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextFontWeights.length) {
      _state.value.templateTextFontWeights[index] = weight
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextRotation = async (index: number, rotation: number) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextRotations.length) {
      _state.value.templateTextRotations[index] = rotation
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextStrokeWidth = async (index: number, width: number) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextStrokeWidths.length) {
      _state.value.templateTextStrokeWidths[index] = width
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextStrokeColor = async (index: number, color: string) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextStrokeColors.length) {
      _state.value.templateTextStrokeColors[index] = color
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const setTemplateTextStrokeLinejoin = async (index: number, linejoin: string) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.templateTextStrokeLinejoins.length) {
      _state.value.templateTextStrokeLinejoins[index] = linejoin
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  // Legacy mutations (for backward compatibility)
  const setBadgeText = async (text: string) => {
    loadFromStorage()
    _state.value.badgeText = text
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setBadgeColor = async (color: string) => {
    loadFromStorage()
    _state.value.badgeColor = color
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Batch update
  const updateState = async (updates: Partial<AppState>) => {
    loadFromStorage()
    Object.assign(_state.value, updates)
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Reset to defaults
  const resetState = async () => {
    _state.value = getDefaultState()
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Export/Import functions remain the same...

  return {
    // Template system getters
    selectedTemplate,
    templateTexts,
    templateTextColors,
    templateTextFonts,
    templateTextFontSizes,
    templateTextFontWeights,
    templateTextRotations,
    templateTextStrokeWidths,
    templateTextStrokeColors,
    templateTextStrokeLinejoins,

    // Legacy getters
    badgeText,
    badgeColor,
    svgContent,
    badgeFont,
    fontSize,
    fontWeight,
    textColor,
    strokeColor,
    strokeWidth,
    lastModified,
    isLoaded,
    isDirty,
    getState,

    // Template mutations
    setSelectedTemplate,
    setTemplateText,
    setTemplateTextColor,
    setTemplateTextFont,
    setTemplateTextFontSize,
    setTemplateTextFontWeight,
    setTemplateTextRotation,
    setTemplateTextStrokeWidth,
    setTemplateTextStrokeColor,
    setTemplateTextStrokeLinejoin,

    // Legacy mutations
    setBadgeText,
    setBadgeColor,
    updateState,
    resetState,

    // Utilities
    clearStorage
  }
}