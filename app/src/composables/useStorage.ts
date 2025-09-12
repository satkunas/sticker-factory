import { useStore } from '../stores'

/**
 * Composable wrapper for the main store
 * @deprecated Use useStore() directly for better type safety and features
 */
export function useStorage() {
  const store = useStore()

  // Legacy compatibility methods
  const loadData = () => {
    const state = store.getState.value
    return {
      badgeText: state.badgeText,
      badgeColor: state.badgeColor, 
      svgContent: state.svgContent,
      timestamp: state.lastModified
    }
  }

  const saveData = async (data: {
    badgeText?: string
    badgeColor?: string
    svgContent?: string
  }) => {
    await store.updateState(data)
  }

  const clearData = async () => {
    await store.clearStorage()
  }

  const exportToFile = (filename?: string) => {
    store.exportToFile(filename)
  }

  const importFromFile = async (callback?: (data: any) => void) => {
    try {
      await store.importFromFile()
      if (callback) {
        const state = store.getState.value
        callback({
          badgeText: state.badgeText,
          badgeColor: state.badgeColor,
          svgContent: state.svgContent
        })
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import data: ' + (error as Error).message)
    }
  }

  const getStorageInfo = () => {
    return store.getStorageInfo()
  }

  return {
    data: store.getState,
    loadData,
    saveData,
    clearData,
    exportToFile,
    importFromFile,
    getStorageInfo
  }
}