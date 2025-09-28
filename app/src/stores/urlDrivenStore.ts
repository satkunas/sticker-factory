/**
 * Unified URL-Driven Store
 * ========================
 *
 * Single source of truth for application state management.
 * Data Flow: URL → Decode → Template+Merge → FormData → Components → UserInput → Silent URL Update
 *
 * Architecture Principles:
 * 1. URL is the authoritative source of truth
 * 2. Router integration handles all URL changes
 * 3. Template + URL merge creates mutable form data
 * 4. Form changes trigger debounced URL sync
 * 5. History/back navigation works seamlessly
 */

import { ref, computed, readonly } from 'vue'
import type { Router } from 'vue-router'
import { logger, reportCriticalError } from '../utils/logger'
import { encodeTemplateStateCompact, decodeTemplateStateCompact } from '../utils/url-encoding'
import { validateImportData, sanitizeTextInput } from '../utils/security'
import { URL_SYNC_TIMEOUT_MS } from '../config/constants'
import { loadTemplate } from '../config/template-loader'
import type { SimpleTemplate } from '../types/template-types'
import type { FontConfig } from '../config/fonts'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Core application state - all state is derived from URL
 */
export interface UrlDrivenState {
  // Router integration
  router: Router | null
  isInitialized: boolean

  // Current URL state
  currentUrl: string
  isLoadingFromUrl: boolean

  // Template state
  selectedTemplateId: string | null
  selectedTemplate: SimpleTemplate | null

  // Form data (mutable user state)
  formData: LayerFormData[]

  // Computed render data for components
  renderData: RenderableLayer[]
}

/**
 * Unified layer form data that users can mutate
 */
export interface LayerFormData {
  id: string
  type: 'text' | 'shape' | 'svgImage'

  // Text properties
  text?: string
  font?: FontConfig | null
  fontSize?: number
  fontWeight?: number
  textColor?: string
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string

  // Shape properties
  fillColor?: string

  // SVG image properties
  svgImageId?: string
  svgContent?: string
  color?: string
  scale?: number
  rotation?: number
}

/**
 * URL decoded state structure
 */
export interface UrlDecodedState {
  selectedTemplateId: string | null
  layers: LayerFormData[]
}

/**
 * Renderable layer for SVG components
 */
export interface RenderableLayer {
  id: string
  type: 'text' | 'shape' | 'svgImage'
  textInput?: any
  shape?: any
  svgImage?: any
}

// ============================================================================
// PRIVATE STATE
// ============================================================================

// Global singleton state
const _state = ref<UrlDrivenState>({
  router: null,
  isInitialized: false,
  currentUrl: '',
  isLoadingFromUrl: false,
  selectedTemplateId: null,
  selectedTemplate: null,
  formData: [],
  renderData: []
})

// URL sync management
let _urlSyncTimeout: ReturnType<typeof setTimeout> | null = null

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the URL-driven store with router integration
 * Must be called once during app startup
 * @param router Vue Router instance for navigation handling
 */
export function initializeUrlDrivenStore(router: Router): void {
  if (_state.value.isInitialized) {
    logger.warn('URL-driven store already initialized')
    return
  }

  _state.value.router = router
  _state.value.isInitialized = true

  // Set up router guards for URL change detection
  setupRouterGuards(router)

  logger.info('URL-driven store initialized with router integration')
}

/**
 * Set up router guards to handle URL changes and browser navigation
 */
function setupRouterGuards(router: Router): void {
  // Handle route changes (including browser back/forward)
  router.beforeEach(async (to, from, next) => {
    try {
      _state.value.currentUrl = to.path

      // Log navigation type for debugging
      const navigationType = getNavigationType(to, from)
      logger.debug(`Navigation detected: ${navigationType} (${from.path} → ${to.path})`)

      if (to.path === '/') {
        // Homepage - load defaults
        await loadDefaultState()
      } else if (to.path.endsWith('.sticker')) {
        // Sticker URL - decode and load state
        await handleUrlDecode(to.path)
      } else {
        // Unknown route - fallback to defaults
        logger.warn(`Unknown route: ${to.path}, falling back to defaults`)
        await loadDefaultState()
      }

      next()
    } catch (error) {
      logger.error('Router guard error:', error)
      // Fallback to defaults on error
      await loadDefaultState()
      next()
    }
  })

  // Handle browser navigation events (back/forward buttons)
  setupBrowserNavigationHandling(router)
}

/**
 * Set up browser navigation event handling for better UX
 */
function setupBrowserNavigationHandling(_router: Router): void {
  // Listen for popstate events (browser back/forward)
  window.addEventListener('popstate', (event) => {
    logger.debug('Browser navigation detected (popstate event)', {
      state: event.state,
      url: window.location.pathname
    })

    // The router will automatically handle the URL change via beforeEach guard
    // This is just for logging and potential future enhancements
  })

  // Listen for beforeunload to prevent data loss during navigation
  window.addEventListener('beforeunload', (_event) => {
    // Only prevent unload if user has unsaved changes
    // For now, we'll just log - future enhancement could check for pending changes
    logger.debug('Page unload detected - URL state should be preserved')
  })
}

/**
 * Determine the type of navigation for debugging and analytics
 */
function getNavigationType(to: any, from: any): string {
  if (!from.path || from.path === '/') {
    return 'initial_load'
  }

  if (to.path === '/' && from.path.endsWith('.sticker')) {
    return 'back_to_home'
  }

  if (from.path === '/' && to.path.endsWith('.sticker')) {
    return 'home_to_sticker'
  }

  if (to.path.endsWith('.sticker') && from.path.endsWith('.sticker')) {
    return 'sticker_to_sticker'
  }

  // Check if this might be browser back/forward by comparing with current URL
  if (window.location.pathname === to.path) {
    return 'browser_navigation'
  }

  return 'programmatic_navigation'
}

// ============================================================================
// URL DECODE PIPELINE
// ============================================================================

/**
 * Handle URL decoding when navigating to a .sticker URL
 */
async function handleUrlDecode(urlPath: string): Promise<void> {
  _state.value.isLoadingFromUrl = true

  try {
    // Extract encoded state from URL path
    const stickerMatch = urlPath.match(/^\/(.+)\.sticker$/)
    if (!stickerMatch) {
      logger.warn('Invalid sticker URL format:', urlPath)
      await loadDefaultState()
      return
    }

    const encodedState = stickerMatch[1]
    logger.info(`Decoding URL state: ${encodedState.substring(0, 30)}...`)

    // Decode URL state
    const decodedState = decodeTemplateStateCompact(encodedState)
    if (!decodedState) {
      logger.warn('Failed to decode URL state - invalid format')
      await loadDefaultState()
      return
    }

    // DEBUG: Log what was actually decoded
    logger.debug('Decoded state from URL:', decodedState)

    // Apply decoded state
    await applyDecodedState(decodedState)

    logger.info('Successfully loaded state from URL')

  } catch (error) {
    logger.error('Error decoding URL state:', error)
    await loadDefaultState()
  } finally {
    _state.value.isLoadingFromUrl = false
  }
}

/**
 * Apply decoded state from URL to store
 */
async function applyDecodedState(decodedState: any): Promise<void> {
  // Set template ID
  if (decodedState.selectedTemplateId) {
    _state.value.selectedTemplateId = decodedState.selectedTemplateId

    // Load template
    const template = await loadTemplate(decodedState.selectedTemplateId)
    if (template) {
      _state.value.selectedTemplate = template

      // Merge template defaults with URL overrides to create form data
      const mergedFormData = mergeTemplateWithUrlData(template, decodedState.layers || [])
      _state.value.formData = mergedFormData

      // Generate render data
      updateRenderData()
    }
  }
}

/**
 * Load default state (used for homepage or fallback)
 */
async function loadDefaultState(): Promise<void> {
  _state.value.selectedTemplateId = null
  _state.value.selectedTemplate = null
  _state.value.formData = []
  _state.value.renderData = []

  logger.info('Loaded default state')
}

// ============================================================================
// TEMPLATE + URL MERGE LOGIC
// ============================================================================

/**
 * Merge template defaults with URL overrides to create mutable form data
 */
function mergeTemplateWithUrlData(template: SimpleTemplate, urlLayers: any[]): LayerFormData[] {
  const formData: LayerFormData[] = []

  // Create URL override lookup
  const urlOverrides: Record<string, any> = {}
  urlLayers.forEach(layer => {
    urlOverrides[layer.id] = layer
  })

  // Process each template layer
  template.layers.forEach(templateLayer => {
    const urlOverride = urlOverrides[templateLayer.id] || {}

    // Create form data entry with template defaults + URL overrides
    const formEntry: LayerFormData = {
      id: templateLayer.id,
      type: templateLayer.type as 'text' | 'shape' | 'svgImage'
    }

    // Apply type-specific merging
    if (templateLayer.type === 'text' && templateLayer.textInput) {
      formEntry.text = urlOverride.text !== undefined ? urlOverride.text : templateLayer.textInput.default
      formEntry.fontSize = urlOverride.fontSize !== undefined ? urlOverride.fontSize : templateLayer.textInput.fontSize
      formEntry.fontWeight = urlOverride.fontWeight !== undefined ? urlOverride.fontWeight : templateLayer.textInput.fontWeight
      formEntry.textColor = urlOverride.textColor !== undefined ? urlOverride.textColor : templateLayer.textInput.fontColor
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : templateLayer.textInput.strokeColor
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : templateLayer.textInput.strokeWidth
      formEntry.strokeOpacity = urlOverride.strokeOpacity !== undefined ? urlOverride.strokeOpacity : templateLayer.textInput.strokeOpacity
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : templateLayer.textInput.strokeLinejoin
    } else if (templateLayer.type === 'shape' && templateLayer.shape) {
      formEntry.fillColor = urlOverride.fillColor !== undefined ? urlOverride.fillColor : templateLayer.shape.fill
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : templateLayer.shape.stroke
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : templateLayer.shape.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : templateLayer.shape.strokeLinejoin
    } else if (templateLayer.type === 'svgImage' && templateLayer.svgImage) {
      formEntry.svgImageId = urlOverride.svgImageId !== undefined ? urlOverride.svgImageId : templateLayer.svgImage.id
      formEntry.color = urlOverride.color !== undefined ? urlOverride.color : templateLayer.svgImage.fill
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : templateLayer.svgImage.stroke
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : templateLayer.svgImage.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : templateLayer.svgImage.strokeLinejoin
      formEntry.svgContent = urlOverride.svgContent !== undefined ? urlOverride.svgContent : templateLayer.svgImage.svgContent
      formEntry.scale = urlOverride.scale !== undefined ? urlOverride.scale : (templateLayer.scale || 1.0)
      formEntry.rotation = urlOverride.rotation !== undefined ? urlOverride.rotation : (templateLayer.rotation || 0)
    }

    formData.push(formEntry)
  })

  return formData
}

// ============================================================================
// FORM DATA MANAGEMENT
// ============================================================================

/**
 * Update a specific layer in the form data
 * @param layerId The ID of the layer to update
 * @param updates Partial layer data to merge with existing layer
 */
export function updateLayer(layerId: string, updates: Partial<LayerFormData>): void {
  const layerIndex = _state.value.formData.findIndex(layer => layer.id === layerId)

  if (layerIndex === -1) {
    logger.warn(`Layer not found: ${layerId}`)
    return
  }

  // Update form data
  _state.value.formData[layerIndex] = {
    ..._state.value.formData[layerIndex],
    ...updates
  }

  // Update render data
  updateRenderData()

  // Schedule URL sync
  scheduleUrlSync()

  logger.debug(`Layer ${layerId} updated:`, updates)
}

/**
 * Update the selected template and reinitialize form data
 * @param templateId The ID of the template to load
 * @returns Promise that resolves when template is loaded and form data is initialized
 */
export async function updateTemplate(templateId: string): Promise<void> {
  try {
    _state.value.isLoadingFromUrl = true

    // Load the new template
    const { loadTemplate } = await import('../config/template-loader')
    const newTemplate = await loadTemplate(templateId)

    if (!newTemplate) {
      logger.error(`Failed to load template: ${templateId}`)
      return
    }

    // Update state
    _state.value.selectedTemplateId = templateId
    _state.value.selectedTemplate = newTemplate

    // Reinitialize form data from template defaults (no URL data)
    const newFormData = mergeTemplateWithUrlData(newTemplate, [])
    _state.value.formData = newFormData

    // Update render data and schedule URL sync
    updateRenderData()
    scheduleUrlSync()

    logger.info(`Template updated to: ${templateId}`)
  } catch (error) {
    logger.error('Error updating template:', error)
  } finally {
    _state.value.isLoadingFromUrl = false
  }
}

/**
 * Update multiple layers at once (batch operation)
 */
export function updateLayers(updates: Array<{ layerId: string; updates: Partial<LayerFormData> }>): void {
  let hasChanges = false

  updates.forEach(({ layerId, updates: layerUpdates }) => {
    const layerIndex = _state.value.formData.findIndex(layer => layer.id === layerId)

    if (layerIndex !== -1) {
      _state.value.formData[layerIndex] = {
        ..._state.value.formData[layerIndex],
        ...layerUpdates
      }
      hasChanges = true
    } else {
      logger.warn(`Layer ${layerId} not found in form data`)
    }
  })

  if (hasChanges) {
    // Update render data and schedule URL sync once for all changes
    updateRenderData()
    scheduleUrlSync()
  }
}

/**
 * Update render data based on current form data and template
 */
function updateRenderData(): void {
  if (!_state.value.selectedTemplate) {
    _state.value.renderData = []
    return
  }

  // Generate render data by merging template with form data
  _state.value.renderData = _state.value.selectedTemplate.layers.map(templateLayer => {
    const formLayer = _state.value.formData.find(layer => layer.id === templateLayer.id)

    const renderLayer: RenderableLayer = {
      id: templateLayer.id,
      type: templateLayer.type as 'text' | 'shape' | 'svgImage'
    }

    if (templateLayer.type === 'text' && templateLayer.textInput) {

      renderLayer.textInput = {
        ...templateLayer.textInput,
        // Only override with form data if form data exists
        ...(formLayer?.text !== undefined && { text: formLayer.text }),
        ...(formLayer?.fontSize !== undefined && { fontSize: formLayer.fontSize }),
        ...(formLayer?.fontWeight !== undefined && { fontWeight: formLayer.fontWeight }),
        ...(formLayer?.textColor !== undefined && { fontColor: formLayer.textColor }),
        ...(formLayer?.font?.family !== undefined && { fontFamily: formLayer.font.family }),
        // Only include stroke if strokeWidth > 0
        ...(formLayer?.strokeWidth !== undefined && formLayer.strokeWidth > 0 && {
          stroke: formLayer.strokeColor,
          strokeWidth: formLayer.strokeWidth,
          ...(formLayer.strokeOpacity !== undefined && { strokeOpacity: formLayer.strokeOpacity })
        }),
        // Only include strokeLinejoin if specified
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin }),
        // Normalize clip path
        ...(templateLayer.textInput.clip && { clipPath: `url(#clip-${templateLayer.textInput.clip})` })
      }
    } else if (templateLayer.type === 'shape' && templateLayer.shape) {
      renderLayer.shape = {
        ...templateLayer.shape,
        // Only override with form data if form data exists
        ...(formLayer?.fillColor !== undefined && { fill: formLayer.fillColor }),
        ...(formLayer?.strokeColor !== undefined && { stroke: formLayer.strokeColor }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin })
      }
    } else if (templateLayer.type === 'svgImage' && templateLayer.svgImage) {
      renderLayer.svgImage = {
        ...templateLayer.svgImage,
        // Only override with form data if form data exists
        ...(formLayer?.color !== undefined && { fill: formLayer.color }),
        ...(formLayer?.strokeColor !== undefined && { stroke: formLayer.strokeColor }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin }),
        ...(formLayer?.svgContent !== undefined && { svgContent: formLayer.svgContent }),
        // Normalize clip path
        ...(templateLayer.svgImage.clip && { clipPath: `url(#clip-${templateLayer.svgImage.clip})` }),
        ...(formLayer?.scale !== undefined && { scale: formLayer.scale }),
        ...(formLayer?.rotation !== undefined && { rotation: formLayer.rotation })
      }
    }

    return renderLayer
  })

  return renderData
}

// ============================================================================
// URL SYNC SYSTEM
// ============================================================================

/**
 * Schedule a debounced URL sync
 */
function scheduleUrlSync(): void {
  if (!_state.value.isInitialized || !_state.value.router) {
    logger.warn('Cannot sync URL - store not initialized')
    return
  }

  // Clear existing timeout
  if (_urlSyncTimeout) {
    clearTimeout(_urlSyncTimeout)
  }

  // Schedule URL update
  _urlSyncTimeout = setTimeout(() => {
    try {
      syncUrlSilently()
    } catch (error) {
      logger.error('Failed to sync URL:', error)
    }
  }, URL_SYNC_TIMEOUT_MS)
}

/**
 * Sync current state to URL silently (no page reload)
 */
function syncUrlSilently(): void {
  const currentState = {
    selectedTemplateId: _state.value.selectedTemplateId,
    layers: _state.value.formData,
    lastModified: Date.now()
  }

  // Encode state
  const encodedState = encodeTemplateStateCompact(currentState)

  if (!encodedState || encodedState === 'Z') {
    logger.warn('Failed to encode state for URL')
    return
  }

  // Update URL silently
  const newUrl = `/${encodedState}.sticker`

  if (window.location.pathname !== newUrl) {
    window.history.replaceState(null, '', newUrl)
    _state.value.currentUrl = newUrl
    logger.debug(`URL silently updated: ${newUrl}`)
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Computed getters for reactive access to state
 */
export const urlDrivenStore = {
  // State getters
  get isInitialized(): boolean { return _state.value.isInitialized },
  get isLoadingFromUrl(): boolean { return _state.value.isLoadingFromUrl },
  get currentUrl(): string { return _state.value.currentUrl },
  get selectedTemplateId(): string | null { return _state.value.selectedTemplateId },
  get selectedTemplate(): SimpleTemplate | null { return _state.value.selectedTemplate },
  get formData(): readonly LayerFormData[] { return readonly(_state.value.formData) },
  get renderData(): readonly RenderableLayer[] { return readonly(_state.value.renderData) },

  // Actions
  updateLayer,
  updateTemplate,
  updateLayers,

  // Internal methods (for testing and debugging)
  _internal: {
    handleUrlDecode,
    loadDefaultState,
    mergeTemplateWithUrlData,
    syncUrlSilently
  }
}

// Export reactive refs for Vue components
export const isLoadingFromUrl = computed(() => _state.value.isLoadingFromUrl)
export const selectedTemplate = computed(() => _state.value.selectedTemplate)
export const formData = computed(() => _state.value.formData)
export const renderData = computed(() => _state.value.renderData)

// Computed render data that automatically updates when formData or selectedTemplate changes
export const computedRenderData = computed(() => {
  if (!_state.value.selectedTemplate) {
    return []
  }

  // Generate render data by merging template with current form data
  return _state.value.selectedTemplate.layers.map(templateLayer => {
    const formLayer = _state.value.formData.find(layer => layer.id === templateLayer.id)

    const renderLayer: RenderableLayer = {
      id: templateLayer.id,
      type: templateLayer.type as 'text' | 'shape' | 'svgImage'
    }

    if (templateLayer.type === 'text' && templateLayer.textInput) {
      renderLayer.textInput = {
        ...templateLayer.textInput,
        // Only override with form data if form data exists
        ...(formLayer?.text !== undefined && { text: formLayer.text }),
        ...(formLayer?.fontSize !== undefined && { fontSize: formLayer.fontSize }),
        ...(formLayer?.fontWeight !== undefined && { fontWeight: formLayer.fontWeight }),
        ...(formLayer?.textColor !== undefined && { fontColor: formLayer.textColor }),
        ...(formLayer?.font?.family !== undefined && { fontFamily: formLayer.font.family }),
        // Only include stroke if strokeWidth > 0
        ...(formLayer?.strokeWidth !== undefined && formLayer.strokeWidth > 0 && {
          stroke: formLayer.strokeColor,
          strokeWidth: formLayer.strokeWidth,
          ...(formLayer.strokeOpacity !== undefined && { strokeOpacity: formLayer.strokeOpacity })
        }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin })
      }
    } else if (templateLayer.type === 'shape' && templateLayer.shape) {
      renderLayer.shape = {
        ...templateLayer.shape,
        // Only override with form data if form data exists
        ...(formLayer?.fillColor !== undefined && { fill: formLayer.fillColor }),
        ...(formLayer?.strokeColor !== undefined && { stroke: formLayer.strokeColor }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin })
      }
    } else if (templateLayer.type === 'svgImage' && templateLayer.svgImage) {
      renderLayer.svgImage = {
        ...templateLayer.svgImage,
        // Only override with form data if form data exists
        ...(formLayer?.color !== undefined && { fill: formLayer.color }),
        ...(formLayer?.strokeColor !== undefined && { stroke: formLayer.strokeColor }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin }),
        ...(formLayer?.svgContent !== undefined && { svgContent: formLayer.svgContent }),
        ...(formLayer?.scale !== undefined && { scale: formLayer.scale }),
        ...(formLayer?.rotation !== undefined && { rotation: formLayer.rotation })
      }
    }

    return renderLayer
  })
})

// ============================================================================
// EXPORT/IMPORT FUNCTIONALITY
// ============================================================================

const STORAGE_VERSION = '2.0.0'

/**
 * Export current state as JSON string
 * @returns Serialized JSON string containing current template and form data
 */
export function exportData(): string {
  const exportData = {
    selectedTemplateId: _state.value.selectedTemplateId,
    layers: _state.value.formData,
    lastModified: Date.now(),
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
    metadata: {
      appName: 'Sticker Factory',
      exportVersion: '2.0.0'
    }
  }
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export current state to downloadable file
 */
export function exportToFile(filename?: string): void {
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

/**
 * Import data from JSON string or object
 * @param data JSON string or parsed object containing template and layer data
 * @returns Promise that resolves when data is imported and state is updated
 */
export async function importData(data: string | object): Promise<void> {
  try {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data

    // Security validation
    const validation = validateImportData(parsedData)
    if (!validation.isValid) {
      throw new Error(`Import validation failed: ${validation.errors.join(', ')}`)
    }

    // Extract and validate template ID
    const templateId = parsedData.selectedTemplateId
    if (templateId) {
      // Load template first
      const template = await loadTemplate(templateId)
      if (template) {
        _state.value.selectedTemplateId = templateId
        _state.value.selectedTemplate = template

        // Import layer data if present
        if (parsedData.layers && Array.isArray(parsedData.layers)) {
          const sanitizedLayers = parsedData.layers.map((layer: any) => ({
            ...layer,
            text: layer.text ? sanitizeTextInput(layer.text) : layer.text
          }))

          _state.value.formData = sanitizedLayers
          updateRenderData()
        }

        // Schedule URL sync to reflect imported state
        scheduleUrlSync()

        logger.info('Data imported successfully')
      } else {
        throw new Error(`Template not found: ${templateId}`)
      }
    } else {
      throw new Error('No template ID found in import data')
    }
  } catch (error) {
    logger.error('Import failed:', error)
    throw error
  }
}

// ============================================================================
// TESTING HELPER FUNCTIONS
// ============================================================================

/**
 * Get the current state for testing purposes
 * @returns Current store state (reactive)
 */
export function getUrlDrivenState() {
  return _state.value
}

/**
 * Reset the store to initial state for testing
 */
export function resetUrlDrivenStore(): void {
  _state.value = {
    router: null,
    isInitialized: false,
    currentUrl: '/',
    isLoadingFromUrl: false,
    selectedTemplateId: null,
    selectedTemplate: null,
    formData: [],
    renderData: []
  }

  // Clear any pending sync timers
  if (_urlSyncTimeout) {
    clearTimeout(_urlSyncTimeout)
    _urlSyncTimeout = null
  }
}

/**
 * Update form data for testing purposes
 */
export function updateFormData(layerId: string, updates: Partial<LayerFormData>): void {
  const layer = _state.value.formData.find(l => l.id === layerId)
  if (layer) {
    Object.assign(layer, updates)
  }
}

/**
 * Schedule URL sync for testing (wrapper around internal function)
 */
export function triggerUrlSync(): void {
  scheduleUrlSync()
}