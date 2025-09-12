import { ref, computed, watch } from 'vue'
import { useStore } from '../stores'

interface BadgeConfig {
  text: string
  color: string
  backgroundColor: string
  width: number
  height: number
  borderRadius: number
  fontSize: number
  fontFamily: string
}

interface BadgeHistory {
  id: string
  config: BadgeConfig
  svg: string
  createdAt: Date
}

const defaultConfig: BadgeConfig = {
  text: 'Sample Badge',
  color: '#ffffff',
  backgroundColor: '#4CAF50',
  width: 120,
  height: 20,
  borderRadius: 3,
  fontSize: 11,
  fontFamily: 'Arial, sans-serif'
}

// Local state for badge-specific features
const badgeHistory = ref<BadgeHistory[]>([])
const isGenerating = ref(false)

export function useBadgeStore() {
  const store = useStore()
  
  // Generate SVG from config
  const generateSvg = (config: BadgeConfig): string => {
    const { text, color, backgroundColor, width, height, borderRadius, fontSize, fontFamily } = config
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="${borderRadius}"/>
      <text x="${width / 2}" y="${height / 2 + fontSize / 3}" text-anchor="middle" fill="${color}" font-family="${fontFamily}" font-size="${fontSize}">
        ${text}
      </text>
    </svg>`
  }

  // Update SVG and save to store
  const updateBadge = async (config: BadgeConfig) => {
    isGenerating.value = true
    try {
      const svg = generateSvg(config)
      await store.updateState({
        badgeText: config.text,
        badgeColor: config.backgroundColor,
        svgContent: svg
      })
    } finally {
      isGenerating.value = false
    }
  }

  // Generate badge from text and color (simplified)
  const generateBadge = async (text: string, color: string) => {
    const config = {
      ...defaultConfig,
      text,
      backgroundColor: color
    }
    await updateBadge(config)
  }

  // Add current badge to history
  const addToHistory = () => {
    const state = store.getState.value
    if (!state.svgContent || !state.badgeText) return

    const historyItem: BadgeHistory = {
      id: Date.now().toString(),
      config: {
        ...defaultConfig,
        text: state.badgeText,
        backgroundColor: state.badgeColor
      },
      svg: state.svgContent,
      createdAt: new Date()
    }
    
    badgeHistory.value.unshift(historyItem)
    
    // Keep only last 50 items
    if (badgeHistory.value.length > 50) {
      badgeHistory.value = badgeHistory.value.slice(0, 50)
    }
  }

  // Load badge from history
  const loadFromHistory = async (id: string) => {
    const item = badgeHistory.value.find(h => h.id === id)
    if (item) {
      await store.updateState({
        badgeText: item.config.text,
        badgeColor: item.config.backgroundColor,
        svgContent: item.svg
      })
    }
  }

  // Remove item from history
  const removeFromHistory = (id: string) => {
    const index = badgeHistory.value.findIndex(h => h.id === id)
    if (index > -1) {
      badgeHistory.value.splice(index, 1)
    }
  }

  // Clear history
  const clearHistory = () => {
    badgeHistory.value = []
  }

  // Reset to defaults
  const resetBadge = async () => {
    await store.updateState({
      badgeText: defaultConfig.text,
      badgeColor: defaultConfig.backgroundColor,
      svgContent: generateSvg(defaultConfig)
    })
  }

  // Computed properties
  const hasHistory = computed(() => badgeHistory.value.length > 0)
  
  const currentConfig = computed(() => {
    const state = store.getState.value
    return {
      text: state.badgeText,
      backgroundColor: state.badgeColor,
      color: defaultConfig.color,
      width: defaultConfig.width,
      height: defaultConfig.height,
      borderRadius: defaultConfig.borderRadius,
      fontSize: defaultConfig.fontSize,
      fontFamily: defaultConfig.fontFamily
    }
  })

  const configSummary = computed(() => {
    const config = currentConfig.value
    return {
      text: config.text,
      color: config.color,
      backgroundColor: config.backgroundColor,
      dimensions: `${config.width}x${config.height}`
    }
  })

  return {
    // State
    badgeHistory,
    isGenerating,
    
    // Store integration
    badgeText: store.badgeText,
    badgeColor: store.badgeColor,
    svgContent: store.svgContent,
    
    // Computed
    hasHistory,
    currentConfig,
    configSummary,
    
    // Actions
    generateBadge,
    updateBadge,
    addToHistory,
    loadFromHistory,
    removeFromHistory,
    clearHistory,
    resetBadge,
    generateSvg: (config: BadgeConfig) => generateSvg(config)
  }
}