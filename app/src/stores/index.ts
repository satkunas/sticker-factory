import { ref, computed, readonly } from 'vue'

export interface AppState {
  badgeText: string
  badgeColor: string
  svgContent: string
  lastModified: number
}

interface StorageData extends AppState {
  version: string
  timestamp: number
}

const STORAGE_KEY = 'sticker-factory-data'
const STORAGE_VERSION = '1.0.0'

// Mutex for localStorage operations
let isWriting = false
const writeQueue: (() => void)[] = []

// Private state
const _state = ref<AppState>({
  badgeText: '',
  badgeColor: '#4CAF50',
  svgContent: '',
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
        badgeText: data.badgeText || '',
        badgeColor: data.badgeColor || '#4CAF50',
        svgContent: data.svgContent || '',
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
  badgeText: '',
  badgeColor: '#4CAF50', 
  svgContent: '',
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
        svgContent: importData.svgContent || ''
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
    badgeText,
    badgeColor,
    svgContent,
    lastModified,
    isLoaded,
    isDirty,
    getState,

    // Mutations
    setBadgeText,
    setBadgeColor,
    setSvgContent,
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