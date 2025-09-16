import { ref, computed, readonly } from 'vue'
import { DEFAULT_FONT, type FontConfig } from '../config/fonts'
import type { TextInputState } from '../types/template-types'

export interface AppState {
  // New multi-text input system
  textInputs: TextInputState[]
  selectedTemplateId: string | null

  // Legacy single-text properties (for backward compatibility)
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

const STORAGE_KEY = 'sticker-factory-data'
const STORAGE_VERSION = '2.0.0'

// Mutex for localStorage operations
let isWriting = false
const writeQueue: (() => void)[] = []

// Private state
const _state = ref<AppState>({
  // New multi-text input system
  textInputs: [],
  selectedTemplateId: null,

  // Legacy single-text properties (for backward compatibility)
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
})

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
        // New multi-text input system
        textInputs: data.textInputs || [],
        selectedTemplateId: data.selectedTemplateId || null,

        // Legacy single-text properties (for backward compatibility)
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
const getDefaultState = (): AppState => ({
  // New multi-text input system
  textInputs: [],
  selectedTemplateId: null,

  // Legacy single-text properties (for backward compatibility)
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
})

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
export const useStore = () => {

  // Getters with cache-on-demand

  // New multi-text input system
  const textInputs = computed(() => {
    loadFromStorage()
    return _state.value.textInputs
  })

  const selectedTemplateId = computed(() => {
    loadFromStorage()
    return _state.value.selectedTemplateId
  })

  // Legacy single-text getters (for backward compatibility)
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

  const textOpacity = computed(() => {
    loadFromStorage()
    return _state.value.textOpacity
  })

  const strokeColor = computed(() => {
    loadFromStorage()
    return _state.value.strokeColor
  })

  const strokeWidth = computed(() => {
    loadFromStorage()
    return _state.value.strokeWidth
  })

  const strokeOpacity = computed(() => {
    loadFromStorage()
    return _state.value.strokeOpacity
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

  // Mutations

  // New multi-text input mutations
  const setTextInputs = async (inputs: TextInputState[]) => {
    loadFromStorage()
    _state.value.textInputs = inputs
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const updateTextInput = async (index: number, updates: Partial<TextInputState>) => {
    loadFromStorage()
    if (index >= 0 && index < _state.value.textInputs.length) {
      _state.value.textInputs[index] = { ..._state.value.textInputs[index], ...updates }
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const initializeTextInputsFromTemplate = async (template: any) => {
    loadFromStorage()
    const { getTemplateTextInputs } = await import('../config/template-loader')
    const { AVAILABLE_FONTS } = await import('../config/fonts')
    const templateTextInputs = getTemplateTextInputs(template)

    // Check if we already have textInputs for this template (preserve existing data)
    const existingTextInputs = _state.value.textInputs
    const newTextInputs: TextInputState[] = templateTextInputs.map((textInput) => {
      // Find existing text input with same ID to preserve user data
      const existing = existingTextInputs.find(input => input.id === textInput.id)

      if (existing) {
        return existing
      }

      // Find font by name from template, fallback to DEFAULT_FONT
      let templateFont = DEFAULT_FONT
      if (textInput.fontFamily) {
        const foundFont = AVAILABLE_FONTS.find(font => font.name === textInput.fontFamily || font.family === textInput.fontFamily)
        if (foundFont) {
          templateFont = foundFont
        }
      }

      return {
        id: textInput.id,
        text: textInput.default || '',
        font: templateFont,
        fontSize: textInput.fontSize || 16,
        fontWeight: textInput.fontWeight || 400,
        textColor: textInput.fontColor || '#ffffff',
        strokeWidth: 0,
        strokeColor: '#000000',
        strokeOpacity: 1.0
      }
    })

    _state.value.textInputs = newTextInputs
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setSelectedTemplateId = async (templateId: string | null) => {
    loadFromStorage()
    _state.value.selectedTemplateId = templateId
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Legacy single-text mutations (for backward compatibility)
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

  const setSvgContent = async (svg: string) => {
    loadFromStorage()
    _state.value.svgContent = svg
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setBadgeFont = async (font: FontConfig | null) => {
    loadFromStorage()
    _state.value.badgeFont = font
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setFontSize = async (size: number) => {
    loadFromStorage()
    _state.value.fontSize = size
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setFontWeight = async (weight: number) => {
    loadFromStorage()
    _state.value.fontWeight = weight
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setTextColor = async (color: string) => {
    loadFromStorage()
    _state.value.textColor = color
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setTextOpacity = async (opacity: number) => {
    loadFromStorage()
    _state.value.textOpacity = opacity
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeColor = async (color: string) => {
    loadFromStorage()
    _state.value.strokeColor = color
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeWidth = async (width: number) => {
    loadFromStorage()
    _state.value.strokeWidth = width
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeOpacity = async (opacity: number) => {
    loadFromStorage()
    _state.value.strokeOpacity = opacity
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

  // Export data
  const exportData = (): string => {
    loadFromStorage()
    const exportData = {
      ..._state.value,
      exportedAt: new Date().toISOString(),
      version: STORAGE_VERSION,
      metadata: {
        appName: 'Sticker Factory',
        exportVersion: '1.0.0'
      }
    }
    return JSON.stringify(exportData, null, 2)
  }

  // Export to file
  const exportToFile = (filename?: string) => {
    try {
      const data = exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `sticker-factory-export-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export data')
    }
  }

  // Import data
  const importData = async (data: string | object): Promise<void> => {
    try {
      const importData = typeof data === 'string' ? JSON.parse(data) : data
      
      // Validate import data
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid import data format')
      }

      // Extract state data (handle different export formats)
      const stateData: Partial<AppState> = {
        badgeText: importData.badgeText || '',
        badgeColor: importData.badgeColor || '#4CAF50',
        svgContent: importData.svgContent || '',
        badgeFont: importData.badgeFont || DEFAULT_FONT,
        fontSize: importData.fontSize || 16,
        fontWeight: importData.fontWeight || 400,
        textColor: importData.textColor || '#ffffff',
        textOpacity: importData.textOpacity ?? 1.0,
        strokeColor: importData.strokeColor || '#000000',
        strokeWidth: importData.strokeWidth ?? 0,
        strokeOpacity: importData.strokeOpacity ?? 1.0
      }

      await updateState(stateData)
    } catch (error) {
      console.error('Import failed:', error)
      throw new Error('Failed to import data: ' + (error as Error).message)
    }
  }

  // Import from file
  const importFromFile = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.onchange = async (event) => {
          try {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (!file) {
              reject(new Error('No file selected'))
              return
            }
            
            const text = await file.text()
            await importData(text)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        
        input.onerror = () => reject(new Error('File selection cancelled'))
        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  // Storage info
  const getStorageInfo = () => {
    loadFromStorage()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return {
        hasData: !!stored,
        size: stored ? new Blob([stored]).size : 0,
        lastModified: _state.value.lastModified ? new Date(_state.value.lastModified) : null,
        isDirty: _isDirty.value,
        isLoaded: _isLoaded.value
      }
    } catch (error) {
      return {
        hasData: false,
        size: 0,
        lastModified: null,
        isDirty: false,
        isLoaded: false
      }
    }
  }

  return {
    // Getters
    textInputs,
    selectedTemplateId,
    badgeText,
    badgeColor,
    svgContent,
    badgeFont,
    fontSize,
    fontWeight,
    textColor,
    textOpacity,
    strokeColor,
    strokeWidth,
    strokeOpacity,
    lastModified,
    isLoaded,
    isDirty,
    getState,

    // Mutations
    setTextInputs,
    updateTextInput,
    initializeTextInputsFromTemplate,
    setSelectedTemplateId,
    setBadgeText,
    setBadgeColor,
    setSvgContent,
    setBadgeFont,
    setFontSize,
    setFontWeight,
    setTextColor,
    setTextOpacity,
    setStrokeColor,
    setStrokeWidth,
    setStrokeOpacity,
    updateState,
    resetState,

    // Import/Export
    exportData,
    exportToFile,
    importData,
    importFromFile,

    // Utilities
    clearStorage,
    getStorageInfo
  }
}