import { ref, computed, readonly } from 'vue'
import { DEFAULT_FONT, type FontConfig } from '../config/fonts'
import type { TextInputState, ShapeStyleState, SvgImageStyleState } from '../types/template-types'
import { logger, reportCriticalError, createPerformanceTimer } from '../utils/logger'
import { validateImportData, sanitizeTextInput } from '../utils/security'
import {
  STORAGE_KEY_MAIN,
  STORAGE_VERSION,
  COLOR_DEFAULT_WHITE,
  COLOR_DEFAULT_BLACK
} from '../config/constants'

export interface AppState {
  // New multi-text input system
  textInputs: TextInputState[]
  selectedTemplateId: string | null

  // Template object styling system
  shapeStyles: ShapeStyleState[]
  svgImageStyles: SvgImageStyleState[]

  // Legacy single-text properties (for backward compatibility)
  stickerText: string
  svgContent: string
  stickerFont: FontConfig | null
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

// Use constants from config
const STORAGE_KEY = STORAGE_KEY_MAIN
const STORAGE_VERSION_STRING = '2.0.0'

// Mutex for localStorage operations
let isWriting = false
const writeQueue: (() => void)[] = []

// Private state
const _state = ref<AppState>({
  // New multi-text input system
  textInputs: [],
  selectedTemplateId: null,

  // Template object styling system
  shapeStyles: [],
  svgImageStyles: [],

  // Legacy single-text properties (for backward compatibility)
  stickerText: '',
  svgContent: '',
  stickerFont: DEFAULT_FONT,
  fontSize: 16,
  fontWeight: 400,
  textColor: COLOR_DEFAULT_WHITE,
  textOpacity: 1.0,
  strokeColor: COLOR_DEFAULT_BLACK,
  strokeWidth: 0,
  strokeOpacity: 1.0,
  lastModified: 0
})

// Cache flags
const _isLoaded = ref(false)
const _isDirty = ref(false)

// Process write queue with enhanced error handling and resource cleanup
const processWriteQueue = () => {
  if (isWriting || writeQueue.length === 0) return

  const nextWrite = writeQueue.shift()
  if (nextWrite) {
    isWriting = true
    let operationSuccess = false

    try {
      nextWrite()
      operationSuccess = true
    } catch (error) {
      reportCriticalError(error as Error, 'Write queue operation failed')

      // Retry operation once if it failed
      if (writeQueue.length < 100) { // Prevent infinite retry loops
        logger.warn('Retrying failed write operation')
        writeQueue.unshift(nextWrite)
      }
    } finally {
      isWriting = false

      // Clean up large write queues for memory management
      if (writeQueue.length > 50) {
        logger.warn(`Large write queue detected: ${writeQueue.length} operations`)
        if (typeof global !== 'undefined' && global.gc) {
          global.gc()
        }
      }

      // Process next in queue with appropriate delay
      const delay = operationSuccess ? 0 : 100 // Longer delay after failures
      setTimeout(processWriteQueue, delay)
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
      if (data.version !== STORAGE_VERSION_STRING) {
        logger.warn(`Storage version mismatch: expected ${STORAGE_VERSION_STRING}, got ${data.version}`)
        return getDefaultState()
      }

      const loadedState: AppState = {
        // New multi-text input system
        textInputs: data.textInputs || [],
        selectedTemplateId: data.selectedTemplateId || null,

        // Template object styling system
        shapeStyles: data.shapeStyles || [],

        // Legacy single-text properties (for backward compatibility)
        stickerText: data.stickerText || data.badgeText || '',
        svgContent: data.svgContent || '',
        stickerFont: data.stickerFont || data.badgeFont || DEFAULT_FONT,
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
    logger.error('Error loading from localStorage:', error)
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

  // Template object styling system
  shapeStyles: [],

  // Legacy single-text properties (for backward compatibility)
  stickerText: '',
  svgContent: '',
  stickerFont: DEFAULT_FONT,
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
  const timer = createPerformanceTimer('LocalStorage save')

  const storageData: StorageData = {
    ...state,
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    lastModified: Date.now()
  }

  const dataSize = JSON.stringify(storageData).length

  const result = await queueWrite(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
    _isDirty.value = false
    _state.value.lastModified = storageData.lastModified
  })

  timer.end({
    dataSize: `${(dataSize / 1024).toFixed(1)}KB`,
    textInputCount: state.textInputs.length,
    shapeStyleCount: state.shapeStyles.length,
    svgImageStyleCount: state.svgImageStyles.length
  })

  return result
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
  const textInputs = computed(() => _state.value.textInputs)

  const selectedTemplateId = computed(() => _state.value.selectedTemplateId)

  // Template object styling system
  const shapeStyles = computed(() => _state.value.shapeStyles)

  const svgImageStyles = computed(() => _state.value.svgImageStyles)

  // Legacy single-text getters (for backward compatibility)
  const stickerText = computed(() => _state.value.stickerText)


  const svgContent = computed(() => _state.value.svgContent)

  const stickerFont = computed(() => _state.value.stickerFont)

  const fontSize = computed(() => _state.value.fontSize)

  const fontWeight = computed(() => _state.value.fontWeight)

  const textColor = computed(() => _state.value.textColor)

  const textOpacity = computed(() => _state.value.textOpacity)

  const strokeColor = computed(() => _state.value.strokeColor)

  const strokeWidth = computed(() => _state.value.strokeWidth)

  const strokeOpacity = computed(() => _state.value.strokeOpacity)

  const lastModified = computed(() => _state.value.lastModified)

  const isLoaded = computed(() => _isLoaded.value)
  const isDirty = computed(() => _isDirty.value)

  // Get entire state (triggers load if needed)
  const getState = computed((): Readonly<AppState> => readonly(_state.value).value)

  // Mutations

  // New multi-text input mutations
  const setTextInputs = async (inputs: TextInputState[]) => {
    _state.value.textInputs = inputs
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const updateTextInput = async (index: number, updates: Partial<TextInputState>) => {
    if (index >= 0 && index < _state.value.textInputs.length) {
      // Sanitize text input if provided
      if (updates.text !== undefined) {
        updates.text = sanitizeTextInput(updates.text)
      }

      _state.value.textInputs[index] = { ..._state.value.textInputs[index], ...updates }
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const initializeTextInputsFromTemplate = async (template: any) => {
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
    _state.value.selectedTemplateId = templateId
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Template object styling mutations
  const setShapeStyles = async (styles: ShapeStyleState[]) => {
    _state.value.shapeStyles = styles
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const updateShapeStyle = async (index: number, updates: Partial<ShapeStyleState>) => {
    if (index >= 0 && index < _state.value.shapeStyles.length) {
      _state.value.shapeStyles[index] = { ..._state.value.shapeStyles[index], ...updates }
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const initializeShapeStylesFromTemplate = async (template: any) => {
    const { getTemplateElements } = await import('../config/template-loader')
    const elements = getTemplateElements(template)

    // Extract shape elements and initialize with template defaults
    const shapeElements = elements.filter(el => el.type === 'shape' && el.shape)
    const newShapeStyles: ShapeStyleState[] = shapeElements.map((element) => {
      return {
        id: element.shape!.id,
        fillColor: element.shape!.fill || '#22c55e', // Keep template default
        strokeColor: element.shape!.stroke || '#000000',
        strokeWidth: element.shape!.strokeWidth || 2,
        strokeLinejoin: 'round'
      }
    })

    _state.value.shapeStyles = newShapeStyles
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // SVG image style management functions
  const updateSvgImageStyle = async (index: number, updates: Partial<SvgImageStyleState>) => {
    if (index >= 0 && index < _state.value.svgImageStyles.length) {
      _state.value.svgImageStyles[index] = { ..._state.value.svgImageStyles[index], ...updates }
      _isDirty.value = true
      await saveToStorage(_state.value)
    }
  }

  const initializeSvgImageStylesFromTemplate = async (template: any) => {
    const { getTemplateElements } = await import('../config/template-loader')
    const elements = getTemplateElements(template)

    // Extract SVG image elements and initialize with template defaults
    const svgImageElements = elements.filter(el => el.type === 'svgImage' && el.svgImage)
    const newSvgImageStyles: SvgImageStyleState[] = svgImageElements.map((element) => {
      return {
        id: element.svgImage!.id,
        fillColor: element.svgImage!.fill || '#3b82f6', // Keep template default
        strokeColor: element.svgImage!.stroke || '#1e40af',
        strokeWidth: element.svgImage!.strokeWidth || 1,
        strokeLinejoin: element.svgImage!.strokeLinejoin || 'round'
      }
    })

    _state.value.svgImageStyles = newSvgImageStyles
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Legacy single-text mutations (for backward compatibility)
  const setStickerText = async (text: string) => {
    _state.value.stickerText = sanitizeTextInput(text)
    _isDirty.value = true
    await saveToStorage(_state.value)
  }


  const setSvgContent = async (svg: string) => {
    _state.value.svgContent = svg
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStickerFont = async (font: FontConfig | null) => {
    _state.value.stickerFont = font
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setFontSize = async (size: number) => {
    _state.value.fontSize = size
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setFontWeight = async (weight: number) => {
    _state.value.fontWeight = weight
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setTextColor = async (color: string) => {
    _state.value.textColor = color
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setTextOpacity = async (opacity: number) => {
    _state.value.textOpacity = opacity
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeColor = async (color: string) => {
    _state.value.strokeColor = color
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeWidth = async (width: number) => {
    _state.value.strokeWidth = width
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  const setStrokeOpacity = async (opacity: number) => {
    _state.value.strokeOpacity = opacity
    _isDirty.value = true
    await saveToStorage(_state.value)
  }

  // Batch update
  const updateState = async (updates: Partial<AppState>) => {
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
      reportCriticalError(error as Error, 'Export failed')
      throw new Error('Failed to export data')
    }
  }

  // Import data
  const importData = async (data: string | object): Promise<void> => {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data

      // Security validation
      const validation = validateImportData(parsedData)
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid import data format')
      }

      // Extract and sanitize state data (handle different export formats)
      const stateData: Partial<AppState> = {
        stickerText: sanitizeTextInput(parsedData.stickerText || parsedData.badgeText || ''),
        svgContent: parsedData.svgContent || '',
        stickerFont: parsedData.stickerFont || parsedData.badgeFont || DEFAULT_FONT,
        fontSize: parsedData.fontSize || 16,
        fontWeight: parsedData.fontWeight || 400,
        textColor: parsedData.textColor || '#ffffff',
        textOpacity: parsedData.textOpacity ?? 1.0,
        strokeColor: parsedData.strokeColor || '#000000',
        strokeWidth: parsedData.strokeWidth ?? 0,
        strokeOpacity: parsedData.strokeOpacity ?? 1.0
      }

      // Sanitize textInputs if they exist
      if (parsedData.textInputs && Array.isArray(parsedData.textInputs)) {
        stateData.textInputs = parsedData.textInputs.map((textInput: any) => ({
          ...textInput,
          text: sanitizeTextInput(textInput.text || '')
        }))
      }

      await updateState(stateData)
    } catch (error) {
      reportCriticalError(error as Error, 'Import failed')
      throw new Error(`Failed to import data: ${  (error as Error).message}`)
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
    shapeStyles,
    svgImageStyles,
    stickerText,
    svgContent,
    stickerFont,
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
    setShapeStyles,
    updateShapeStyle,
    initializeShapeStylesFromTemplate,
    updateSvgImageStyle,
    initializeSvgImageStylesFromTemplate,
    setStickerText,
    setSvgContent,
    setStickerFont,
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

// Initialize store by loading data from localStorage
loadFromStorage()