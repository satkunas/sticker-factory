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
import type { Router, RouteLocationNormalized } from 'vue-router'
import { logger } from '../utils/logger'
import { encodeTemplateStateCompact, decodeTemplateStateCompact } from '../utils/url-encoding'
import type { AppState } from '../types/app-state'
import {
  analyzeSvgViewBoxFit,
  type SvgViewBoxFitAnalysis,
  calculateOptimalTransformOrigin,
  shouldUseCentroidOrigin,
  calculateSvgCentroid,
  type Point,
  type SvgCentroid
} from '../utils/svg-bounds'
import {
  URL_SYNC_TIMEOUT_MS,
  DEFAULT_SHAPE_WIDTH,
  DEFAULT_SHAPE_HEIGHT
} from '../config/constants'
import { loadTemplate } from '../config/template-loader'

// ============================================================================
// SAFETY UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate that a number is finite and not NaN
 */
function isValidNumber(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && !isNaN(value)
}

/**
 * Ensure a number is valid, returning fallback if invalid
 */
function safeNumber(value: number, fallback = 0): number {
  return isValidNumber(value) ? value : fallback
}

/**
 * Create a safe transform string, filtering out NaN values
 */
function safeTransform(transformParts: string[]): string {
  // Filter out any transform parts that contain NaN
  const validParts = transformParts.filter(part => !part.includes('NaN'))
  return validParts.join(' ')
}
import type { SimpleTemplate, FlatLayerData, TemplateLayer, TemplateTextInput, TemplateShape } from '../types/template-types'
import { AVAILABLE_FONTS, type FontConfig } from '../config/fonts'
import { resolveCoordinate } from '../utils/svg'
import { processLayerForRendering, type ProcessedLayer } from '../utils/unified-positioning'
// Removed unused import: getStyledSvgContent
import { useSvgViewBox } from '../composables/useSvgViewBox'

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

  // Text properties (matching template property names)
  text?: string
  font?: FontConfig | null
  fontSize?: number
  fontWeight?: number
  fontColor?: string  // Matches template property name
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string

  // Shape properties (matching template property names)
  fill?: string  // Matches template property name
  stroke?: string  // Matches template property name

  // SVG image properties
  svgImageId?: string
  svgContent?: string
  color?: string
  scale?: number
  rotation?: number

  // Computed properties (added by store during merging)
  transformString?: string
  transformOrigin?: Point
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
  textInput?: TemplateTextInput
  shape?: TemplateShape
  svgImage?: {
    position: { x: string | number; y: number }
    width: number
    height: number
    svgContent: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    clip?: string
  }
  transformString?: string
  outerTransform?: string  // Positioning and base scaling
  innerTransform?: string  // User scaling and rotation
  svgAnalysis?: SvgViewBoxFitAnalysis  // SVG viewBox fit analysis for warnings

  // Enhanced centroid-based transform origin support
  transformOrigin?: Point      // Optimal transform origin (centroid or bounding box center)
  useCentroidOrigin?: boolean  // Whether this layer uses centroid-based transforms
  centroidAnalysis?: SvgCentroid  // Full centroid analysis results
}

// ============================================================================
// FLAT ARCHITECTURE: New simplified data merging functions
// ============================================================================

/**
 * Flatten template layer into flat structure (extract nested properties to root level)
 */
function flattenTemplateLayer(templateLayer: TemplateLayer): FlatLayerData {
  // NEW FLAT ARCHITECTURE: Single destructuring-based flattening
  // All template layers now have properties directly accessible (no nested objects)

  const {
    id, type,
    // Universal properties (all layer types)
    position, rotation, scale, clip, clipPath, opacity,
    // Text properties
    text, label, placeholder, maxLength, fontFamily, fontColor, fontSize, fontWeight,
    // Shape properties
    subtype, width, height, rx, ry, points, fill, stroke, strokeWidth, strokeLinejoin, path,
    // SVG Image properties
    svgImageId, svgContent, color,
    // Strip out any legacy nested objects that might still exist
    textInput: _, shape: __, svgImage: ___,
    ...otherProps
  } = templateLayer as unknown as FlatLayerData

  // Return flat structure with clean property mapping
  return {
    id, type, position, rotation, scale, clip, clipPath, opacity,
    // Text properties (directly accessible)
    text, label, placeholder, maxLength, fontFamily, fontColor, fontSize, fontWeight,
    // Shape properties (directly accessible)
    subtype, width, height, rx, ry, points, path,
    fillColor: fill, // Map 'fill' to 'fillColor' for shapes
    strokeColor: stroke, strokeWidth, strokeLinejoin,
    // SVG Image properties (directly accessible)
    svgImageId, svgContent,
    color, // SVG images use 'color' instead of 'fill' to distinguish from shapes
    // Include any other properties that might exist
    ...otherProps
  }
}

/**
 * Merge flat template defaults with flat form overrides (simple object spread)
 */
function mergeFlatLayerData(templateDefaults: FlatLayerData, formOverrides: Partial<FlatLayerData> = {}): FlatLayerData {
  // Simple object spread - no conditionals, no nested property access
  const merged = {
    ...templateDefaults,    // All template defaults
    ...formOverrides,       // User form overrides
    id: templateDefaults.id, // Always preserve template ID
    type: templateDefaults.type // Always preserve template type
  }

  // Calculate transform origin for SVG images if they have content
  if (merged.type === 'svgImage' && merged.svgContent) {
    try {
      merged.transformOrigin = calculateOptimalTransformOrigin(merged.svgContent)
    } catch (error) {
      // Fallback to geometric center of standard 24x24 viewBox
      merged.transformOrigin = { x: 12, y: 12 }
    }
  }

  return merged
}

/**
 * Create flat form data for entire template
 */
function createFlatFormData(template: SimpleTemplate, urlFormData: Partial<FlatLayerData>[] = []): FlatLayerData[] {
  return template.layers.map(templateLayer => {
    // Flatten template layer to get all defaults
    const templateDefaults = flattenTemplateLayer(templateLayer)

    // Find user overrides for this layer
    const userOverrides = urlFormData.find(layer => layer.id === templateLayer.id) || {}

    // Simple merge with object spread
    return mergeFlatLayerData(templateDefaults, userOverrides)
  })
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
function getNavigationType(to: RouteLocationNormalized, from: RouteLocationNormalized): string {
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
async function applyDecodedState(decodedState: Partial<AppState>): Promise<void> {
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
function mergeTemplateWithUrlData(template: SimpleTemplate, urlLayers: Array<{ id: string; [key: string]: unknown }>): LayerFormData[] {
  const formData: LayerFormData[] = []

  // Create URL override lookup
  const urlOverrides: Record<string, { id: string; [key: string]: unknown }> = {}
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
    // Cast to FlatLayerData since template loader flattens structure at runtime
    const flatLayer = templateLayer as unknown as FlatLayerData

    if (templateLayer.type === 'text') {
      // Template loader now flattens structure - properties are directly on layer
      formEntry.text = urlOverride.text !== undefined ? urlOverride.text : flatLayer.text
      formEntry.fontSize = urlOverride.fontSize !== undefined ? urlOverride.fontSize : flatLayer.fontSize
      formEntry.fontWeight = urlOverride.fontWeight !== undefined ? urlOverride.fontWeight : flatLayer.fontWeight
      formEntry.fontColor = urlOverride.fontColor !== undefined ? urlOverride.fontColor : flatLayer.fontColor
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : flatLayer.strokeColor
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : flatLayer.strokeWidth
      formEntry.strokeOpacity = urlOverride.strokeOpacity !== undefined ? urlOverride.strokeOpacity : flatLayer.strokeOpacity
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : flatLayer.strokeLinejoin

      // Handle fontFamily from URL - convert to font object
      if (urlOverride.fontFamily !== undefined) {
        const fontConfig = AVAILABLE_FONTS.find(f => f.family === urlOverride.fontFamily || f.name === urlOverride.fontFamily)
        if (fontConfig) {
          formEntry.font = fontConfig
        }
      }
    } else if (templateLayer.type === 'shape') {
      // Template loader now flattens structure - properties are directly on layer
      formEntry.fill = urlOverride.fill !== undefined ? urlOverride.fill : flatLayer.fill
      formEntry.stroke = urlOverride.stroke !== undefined ? urlOverride.stroke : flatLayer.stroke
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : flatLayer.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : flatLayer.strokeLinejoin
    } else if (templateLayer.type === 'svgImage') {
      // Template loader now flattens structure - properties are directly on layer
      formEntry.svgImageId = urlOverride.svgImageId !== undefined ? urlOverride.svgImageId : flatLayer.svgImageId
      formEntry.color = urlOverride.color !== undefined ? urlOverride.color : flatLayer.color
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : flatLayer.stroke
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : flatLayer.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : flatLayer.strokeLinejoin
      formEntry.svgContent = urlOverride.svgContent !== undefined ? urlOverride.svgContent : flatLayer.svgContent
      formEntry.scale = urlOverride.scale !== undefined ? urlOverride.scale : flatLayer.scale
      formEntry.rotation = urlOverride.rotation !== undefined ? urlOverride.rotation : flatLayer.rotation
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
  logger.debug(`🔄 updateRenderData called - template: ${_state.value.selectedTemplate?.id || 'none'}, layers: ${_state.value.selectedTemplate?.layers?.length || 0}`)

  if (!_state.value.selectedTemplate) {
    _state.value.renderData = []
    return
  }

  // Generate render data by merging template with form data
  _state.value.renderData = _state.value.selectedTemplate.layers.map(templateLayer => {
    logger.debug(`🏗️ Processing template layer: ${templateLayer.id} (type: ${templateLayer.type})`)

    const formLayer = _state.value.formData.find(layer => layer.id === templateLayer.id)

    const renderLayer: RenderableLayer = {
      id: templateLayer.id,
      type: templateLayer.type as 'text' | 'shape' | 'svgImage'
    }

    // Cast to FlatLayerData since template loader flattens structure at runtime
    const flatLayer = templateLayer as unknown as FlatLayerData

    if (templateLayer.type === 'text') {
      // Template loader now flattens structure - reconstruct for compatibility
      renderLayer.textInput = {
        text: flatLayer.text,
        fontSize: flatLayer.fontSize,
        fontWeight: flatLayer.fontWeight,
        fontColor: flatLayer.fontColor,
        fontFamily: flatLayer.fontFamily,
        strokeColor: flatLayer.strokeColor,
        strokeWidth: flatLayer.strokeWidth,
        strokeOpacity: flatLayer.strokeOpacity,
        strokeLinejoin: flatLayer.strokeLinejoin,
        position: flatLayer.position,
        // Only override with form data if form data exists
        ...(formLayer?.text !== undefined && { text: formLayer.text }),
        ...(formLayer?.fontSize !== undefined && { fontSize: formLayer.fontSize }),
        ...(formLayer?.fontWeight !== undefined && { fontWeight: formLayer.fontWeight }),
        ...(formLayer?.fontColor !== undefined && { fontColor: formLayer.fontColor }),
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
        ...(flatLayer.clip && { clipPath: `url(#clip-${flatLayer.clip})` })
      }
    } else if (templateLayer.type === 'shape') {
      // Template loader now flattens structure - reconstruct for compatibility
      renderLayer.shape = {
        id: flatLayer.id,
        type: 'path',
        path: flatLayer.path,
        fill: flatLayer.fill,
        stroke: flatLayer.stroke,
        strokeWidth: flatLayer.strokeWidth,
        strokeLinejoin: flatLayer.strokeLinejoin,
        // Only override with form data if form data exists
        ...(formLayer?.fill !== undefined && { fill: formLayer.fill }),
        ...(formLayer?.stroke !== undefined && { stroke: formLayer.stroke }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin })
      }
    } else if (templateLayer.type === 'svgImage') {
      logger.debug(`📊 Processing svgImage layer: ${templateLayer.id}`)

      // Template loader now flattens structure - reconstruct for compatibility
      renderLayer.svgImage = {
        id: flatLayer.svgImageId,
        svgContent: flatLayer.svgContent,
        width: flatLayer.width,
        height: flatLayer.height,
        fill: flatLayer.color,
        stroke: flatLayer.stroke,
        strokeWidth: flatLayer.strokeWidth,
        strokeLinejoin: flatLayer.strokeLinejoin,
        position: flatLayer.position,
        // Only override with form data if form data exists
        ...(formLayer?.color !== undefined && { fill: formLayer.color }),
        ...(formLayer?.strokeColor !== undefined && { stroke: formLayer.strokeColor }),
        ...(formLayer?.strokeWidth !== undefined && { strokeWidth: formLayer.strokeWidth }),
        ...(formLayer?.strokeLinejoin !== undefined && { strokeLinejoin: formLayer.strokeLinejoin }),
        ...(formLayer?.svgContent !== undefined && { svgContent: formLayer.svgContent }),
        // Normalize clip path
        ...(flatLayer.clip && { clipPath: `url(#clip-${flatLayer.clip})` }),
        ...(formLayer?.scale !== undefined && { scale: formLayer.scale }),
        ...(formLayer?.rotation !== undefined && { rotation: formLayer.rotation })
      }

      // Calculate centroid-based transform origin for this SVG layer
      const svgContent = renderLayer.svgImage.svgContent || flatLayer.svgContent
      logger.debug(`🔍 SVG content check for ${templateLayer.id}:`, {
        hasRenderLayerContent: !!renderLayer.svgImage.svgContent,
        hasTemplateLayerContent: !!flatLayer.svgContent,
        finalSvgContent: !!svgContent,
        svgContentLength: svgContent?.length || 0
      })

      if (svgContent) {
        try {
          logger.debug(`Calculating centroid for ${templateLayer.id} with SVG content length: ${svgContent.length}`)

          const centroidResult = calculateSvgCentroid(svgContent)
          const optimalOrigin = calculateOptimalTransformOrigin(svgContent)
          const useCentroid = shouldUseCentroidOrigin(svgContent)

          // Add centroid analysis to render layer
          renderLayer.centroidAnalysis = centroidResult
          renderLayer.transformOrigin = optimalOrigin
          renderLayer.useCentroidOrigin = useCentroid

          logger.debug(`Centroid calculated for ${templateLayer.id}:`, {
            shapeType: centroidResult.shapeType,
            useCentroid,
            confidence: centroidResult.confidence,
            transformOrigin: optimalOrigin,
            boundingBoxCenter: centroidResult.boundingBoxCenter,
            centroidCenter: centroidResult.centroidCenter
          })
        } catch (error) {
          logger.warn(`Failed to calculate centroid for ${templateLayer.id}:`, error)
          // Fallback to center of standard 24x24 viewBox (with safety guard)
          renderLayer.transformOrigin = { x: safeNumber(12), y: safeNumber(12) }
          renderLayer.useCentroidOrigin = false
        }
      } else {
        logger.warn(`No SVG content found for ${templateLayer.id}`)
      }
    }

    return renderLayer
  })
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

// Enhanced form data with template defaults merged
export const mergedFormData = computed(() => {
  if (!_state.value.selectedTemplate || !_state.value.formData.length) {
    return []
  }

  return _state.value.selectedTemplate.layers.map(templateLayer => {
    const formLayer = _state.value.formData.find(layer => layer.id === templateLayer.id)

    if (!formLayer) {
      // Create default form layer from template
      const defaultLayer: LayerFormData = {
        id: templateLayer.id,
        type: templateLayer.type as 'text' | 'shape' | 'svgImage'
      }

      // Cast to FlatLayerData since template loader flattens structure at runtime
      const flatLayer = templateLayer as unknown as FlatLayerData

      if (templateLayer.type === 'text') {
        // Template loader now flattens structure - properties are directly on layer
        defaultLayer.text = flatLayer.text
        defaultLayer.fontSize = flatLayer.fontSize
        defaultLayer.fontWeight = flatLayer.fontWeight
        defaultLayer.fontColor = flatLayer.fontColor
        defaultLayer.strokeColor = flatLayer.strokeColor
        defaultLayer.strokeWidth = flatLayer.strokeWidth
        defaultLayer.strokeLinejoin = flatLayer.strokeLinejoin
        defaultLayer.strokeOpacity = flatLayer.strokeOpacity
      } else if (templateLayer.type === 'shape') {
        // Template loader now flattens structure - properties are directly on layer
        defaultLayer.fill = flatLayer.fill
        defaultLayer.stroke = flatLayer.stroke
        defaultLayer.strokeWidth = flatLayer.strokeWidth
        defaultLayer.strokeLinejoin = flatLayer.strokeLinejoin
      } else if (templateLayer.type === 'svgImage') {
        // Template loader now flattens structure - properties are directly on layer
        defaultLayer.svgImageId = flatLayer.svgImageId
        defaultLayer.svgContent = flatLayer.svgContent
        defaultLayer.color = flatLayer.color
        defaultLayer.strokeColor = flatLayer.stroke
        defaultLayer.strokeWidth = flatLayer.strokeWidth
        defaultLayer.strokeLinejoin = flatLayer.strokeLinejoin
        defaultLayer.rotation = flatLayer.rotation
        defaultLayer.scale = flatLayer.scale
      }

      return defaultLayer
    }

    // Merge form data with template defaults
    const mergedLayer: LayerFormData = { ...formLayer }

    // Cast to FlatLayerData since template loader flattens structure at runtime
    const flatLayer = templateLayer as unknown as FlatLayerData

    if (templateLayer.type === 'text') {
      // Template loader now flattens structure - properties are directly on layer
      mergedLayer.text = formLayer.text !== undefined ? formLayer.text : flatLayer.text
      mergedLayer.fontSize = formLayer.fontSize !== undefined ? formLayer.fontSize : flatLayer.fontSize
      mergedLayer.fontWeight = formLayer.fontWeight !== undefined ? formLayer.fontWeight : flatLayer.fontWeight
      mergedLayer.fontColor = formLayer.fontColor !== undefined ? formLayer.fontColor : flatLayer.fontColor
      mergedLayer.strokeColor = formLayer.strokeColor !== undefined ? formLayer.strokeColor : flatLayer.strokeColor
      mergedLayer.strokeWidth = formLayer.strokeWidth !== undefined ? formLayer.strokeWidth : flatLayer.strokeWidth
      mergedLayer.strokeLinejoin = formLayer.strokeLinejoin !== undefined ? formLayer.strokeLinejoin : flatLayer.strokeLinejoin
      mergedLayer.strokeOpacity = formLayer.strokeOpacity !== undefined ? formLayer.strokeOpacity : flatLayer.strokeOpacity
    } else if (templateLayer.type === 'shape') {
      // Template loader now flattens structure - properties are directly on layer
      mergedLayer.fill = formLayer.fill !== undefined ? formLayer.fill : flatLayer.fill
      mergedLayer.stroke = formLayer.stroke !== undefined ? formLayer.stroke : flatLayer.stroke
      mergedLayer.strokeWidth = formLayer.strokeWidth !== undefined ? formLayer.strokeWidth : flatLayer.strokeWidth
      mergedLayer.strokeLinejoin = formLayer.strokeLinejoin !== undefined ? formLayer.strokeLinejoin : flatLayer.strokeLinejoin
    } else if (templateLayer.type === 'svgImage') {
      // Template loader now flattens structure - properties are directly on layer
      mergedLayer.svgImageId = formLayer.svgImageId !== undefined ? formLayer.svgImageId : flatLayer.svgImageId
      mergedLayer.svgContent = formLayer.svgContent !== undefined ? formLayer.svgContent : flatLayer.svgContent
      mergedLayer.color = formLayer.color !== undefined ? formLayer.color : flatLayer.color
      mergedLayer.strokeColor = formLayer.strokeColor !== undefined ? formLayer.strokeColor : flatLayer.stroke
      mergedLayer.strokeWidth = formLayer.strokeWidth !== undefined ? formLayer.strokeWidth : flatLayer.strokeWidth
      mergedLayer.strokeLinejoin = formLayer.strokeLinejoin !== undefined ? formLayer.strokeLinejoin : flatLayer.strokeLinejoin
      mergedLayer.rotation = formLayer.rotation !== undefined ? formLayer.rotation : flatLayer.rotation
      mergedLayer.scale = formLayer.scale !== undefined ? formLayer.scale : flatLayer.scale

      // Calculate transform origin for proper rotation/scaling around center-of-mass
      if (mergedLayer.svgContent) {
        try {
          const optimalOrigin = calculateOptimalTransformOrigin(mergedLayer.svgContent)
          mergedLayer.transformOrigin = optimalOrigin
        } catch (error) {
          // Fallback to geometric center of standard 24x24 viewBox
          mergedLayer.transformOrigin = { x: 12, y: 12 }
        }
      } else {
        // No SVG content available - use default center for standard 24x24 viewBox
        mergedLayer.transformOrigin = { x: 12, y: 12 }
      }

      // Store calculates transform string - no conditional logic in components
      const transforms = []
      const absoluteX = flatLayer.position?.x
      const absoluteY = flatLayer.position?.y
      const targetWidth = flatLayer.width
      const targetHeight = flatLayer.height
      const rotation = mergedLayer.rotation
      const scale = mergedLayer.scale

      // First translate to position if coordinates exist (with safety guards)
      if (absoluteX !== undefined && absoluteY !== undefined && isValidNumber(absoluteX) && isValidNumber(absoluteY)) {
        transforms.push(`translate(${absoluteX}, ${absoluteY})`)
      }

      // For center-based scale and rotation
      if ((scale !== undefined && scale !== 1) || (rotation !== undefined && rotation !== 0)) {
        const centerX = targetWidth ? safeNumber(targetWidth / 2) : 0
        const centerY = targetHeight ? safeNumber(targetHeight / 2) : 0

        if (centerX !== 0 || centerY !== 0) {
          transforms.push(`translate(${centerX}, ${centerY})`)
        }

        if (scale !== undefined && scale !== 1 && isValidNumber(scale)) {
          transforms.push(`scale(${scale})`)
        }

        if (rotation !== undefined && rotation !== 0 && isValidNumber(rotation)) {
          transforms.push(`rotate(${rotation})`)
        }

        if (centerX !== 0 || centerY !== 0) {
          transforms.push(`translate(${-centerX}, ${-centerY})`)
        }
      }

      mergedLayer.transformString = safeTransform(transforms)
    }

    return mergedLayer
  })
})

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
        ...(formLayer?.fontColor !== undefined && { fontColor: formLayer.fontColor }),
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
        ...(formLayer?.fill !== undefined && { fill: formLayer.fill }),
        ...(formLayer?.stroke !== undefined && { stroke: formLayer.stroke }),
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

      // Store calculates separate transforms for proper nested g structure
      // Cast to FlatLayerData since template loader flattens structure at runtime
      const flatLayer = templateLayer as unknown as FlatLayerData
      const positionX = flatLayer.position?.x
      const positionY = flatLayer.position?.y
      const targetWidth = flatLayer.width
      const targetHeight = flatLayer.height
      const rotation = formLayer?.rotation !== undefined ? formLayer.rotation : flatLayer.rotation
      const scale = formLayer?.scale !== undefined ? formLayer.scale : flatLayer.scale

      // Calculate separate transforms for proper center-based positioning and scaling
      let outerTransform = ''
      let innerTransform = ''

      if (positionX !== undefined && positionY !== undefined && _state.value.selectedTemplate?.viewBox) {
        // Resolve percentage coordinates to absolute coordinates using template viewBox
        const viewBox = _state.value.selectedTemplate.viewBox
        const absoluteX = resolveCoordinate(positionX, viewBox.width, viewBox.x)
        const absoluteY = resolveCoordinate(positionY, viewBox.height, viewBox.y)

        // Debug logging to find NaN source
        if (isNaN(absoluteX) || isNaN(absoluteY)) {
          logger.debug(`NaN detected in transform calculation for ${templateLayer.id}:`, {
            positionX, positionY,
            viewBox,
            absoluteX, absoluteY,
            resolveCoordinateResult: {
              x: resolveCoordinate(positionX, viewBox.width, viewBox.x),
              y: resolveCoordinate(positionY, viewBox.height, viewBox.y)
            }
          })
        }

        // CORRECT APPROACH: Separate base positioning from user scaling
        const svgSize = 24  // Standard SVG viewBox size
        const svgCenter = svgSize / 2  // 12

        // Base scaling to match declared template dimensions (independent of user scaling)
        const baseScaleX = targetWidth ? targetWidth / svgSize : 1
        const baseScaleY = targetHeight ? targetHeight / svgSize : 1

        // Position based ONLY on base scaling (this keeps positioning stable)
        const baseScaledWidth = svgSize * baseScaleX
        const baseScaledHeight = svgSize * baseScaleY
        const finalX = absoluteX - (baseScaledWidth / 2)
        const finalY = absoluteY - (baseScaledHeight / 2)

        // Debug logging for NaN in final calculations
        if (isNaN(finalX) || isNaN(finalY)) {
          logger.debug(`NaN detected in final position calculation for ${templateLayer.id}:`, {
            absoluteX, absoluteY,
            svgSize, baseScaleX, baseScaleY,
            baseScaledWidth, baseScaledHeight,
            finalX, finalY,
            targetWidth, targetHeight
          })
        }

        // Debug logging for NaN in outerTransform before generation
        if (isNaN(finalX) || isNaN(finalY) || isNaN(baseScaleX) || isNaN(baseScaleY)) {
          logger.debug(`🚨 NaN detected in outerTransform generation for ${templateLayer.id}:`, {
            finalX, finalY, baseScaleX, baseScaleY,
            absoluteX, absoluteY,
            svgSize, targetWidth, targetHeight,
            baseScaledWidth, baseScaledHeight,
            transforms: { finalX, finalY, baseScaleX, baseScaleY }
          })
        }

        // OUTER TRANSFORM: Position and base scaling only (high precision) - with NaN safety
        const safeFinalX = isValidNumber(finalX) ? finalX : 0
        const safeFinalY = isValidNumber(finalY) ? finalY : 0
        const safeBaseScaleX = isValidNumber(baseScaleX) ? baseScaleX : 1
        const safeBaseScaleY = isValidNumber(baseScaleY) ? baseScaleY : 1

        outerTransform = `translate(${safeFinalX.toFixed(6)}, ${safeFinalY.toFixed(6)}) scale(${safeBaseScaleX.toFixed(6)}, ${safeBaseScaleY.toFixed(6)})`

        // INNER TRANSFORM: User scaling and rotation around optimal center (high precision)
        const userScale = scale !== undefined ? scale : 1

        logger.debug(`Transform calculation for ${templateLayer.id}:`, {
          rotation,
          scale: userScale,
          hasRotation: rotation !== undefined && rotation !== 0,
          hasScale: userScale !== 1,
          willCalculateTransform: (rotation !== undefined && rotation !== 0) || (userScale !== 1)
        })

        if ((rotation !== undefined && rotation !== 0) || (userScale !== 1)) {
          // Determine optimal transform origin (centroid or geometric center)
          let transformOrigin = { x: svgCenter, y: svgCenter } // Default to geometric center

          if (renderLayer.useCentroidOrigin && renderLayer.transformOrigin) {
            transformOrigin = renderLayer.transformOrigin
            logger.debug(`Using centroid origin for ${templateLayer.id}:`, {
              centroidOrigin: transformOrigin,
              geometricCenter: { x: svgCenter, y: svgCenter },
              shapeType: renderLayer.centroidAnalysis?.shapeType
            })
          }

          // Safety guard: Ensure transform origin values are valid numbers
          const safeTransformOrigin = {
            x: safeNumber(transformOrigin.x, svgCenter),
            y: safeNumber(transformOrigin.y, svgCenter)
          }

          // Debug logging for transform origin issues
          if (!isValidNumber(transformOrigin.x) || !isValidNumber(transformOrigin.y)) {
            logger.debug(`Invalid transformOrigin detected for ${templateLayer.id} - using fallback:`, {
              originalTransformOrigin: transformOrigin,
              safeTransformOrigin,
              useCentroidOrigin: renderLayer.useCentroidOrigin,
              centroidAnalysis: renderLayer.centroidAnalysis,
              renderLayerTransformOrigin: renderLayer.transformOrigin,
              svgCenter
            })
          }

          // Build transform steps with safety guards
          const transformSteps: string[] = []

          // Move to optimal center of the SVG coordinate system
          transformSteps.push(`translate(${safeTransformOrigin.x.toFixed(6)}, ${safeTransformOrigin.y.toFixed(6)})`)

          // Apply user transformations in correct order
          if (rotation !== undefined && rotation !== 0 && isValidNumber(rotation)) {
            transformSteps.push(`rotate(${rotation.toFixed(6)})`)
          }

          if (userScale !== 1 && isValidNumber(userScale)) {
            transformSteps.push(`scale(${userScale.toFixed(6)})`)
          }

          // Move back from center
          transformSteps.push(`translate(${(-safeTransformOrigin.x).toFixed(6)}, ${(-safeTransformOrigin.y).toFixed(6)})`)

          // Create safe transform string
          innerTransform = safeTransform(transformSteps)
        }
      }

      // Analyze SVG viewBox fit for warning system
      if (renderLayer.svgImage?.svgContent) {
        try {
          renderLayer.svgAnalysis = analyzeSvgViewBoxFit(renderLayer.svgImage.svgContent)

          // Log centering issues for development
          if (renderLayer.svgAnalysis.severity === 'major') {
            logger.warn(`SVG centering issue detected for ${templateLayer.id}:`, {
              issues: renderLayer.svgAnalysis.issues,
              offset: renderLayer.svgAnalysis.offset,
              recommendedViewBox: renderLayer.svgAnalysis.recommendedViewBox
            })
          }
        } catch (error) {
          logger.warn(`Failed to analyze SVG viewBox for ${templateLayer.id}:`, error)
        }
      }

      // Store both transforms for the component to use
      renderLayer.outerTransform = outerTransform
      renderLayer.innerTransform = innerTransform
      renderLayer.transformString = outerTransform  // Keep for backward compatibility
    }

    return renderLayer
  })
})

// Generate clip path definitions from template shapes
export const clipPathShapes = computed(() => {
  if (!_state.value.selectedTemplate?.layers) return []

  const clipShapes: Array<{id: string, path: string}> = []

  // Find all layers that are referenced as clip targets
  const clipReferences = new Set<string>()

  _state.value.selectedTemplate.layers.forEach(layer => {
    if (layer.type === 'text' && layer.textInput?.clip) {
      clipReferences.add(layer.textInput.clip)
    }
    if (layer.type === 'text' && layer.clip) {
      clipReferences.add(layer.clip)
    }
    if (layer.type === 'svgImage' && layer.svgImage?.clip) {
      clipReferences.add(layer.svgImage.clip)
    }
    if (layer.type === 'svgImage' && layer.clip) {
      clipReferences.add(layer.clip)
    }
  })

  // Generate clip path definitions for referenced shapes
  clipReferences.forEach(clipId => {
    const shapeLayer = _state.value.selectedTemplate?.layers.find(layer =>
      layer.type === 'shape' && layer.id === clipId
    )

    if (shapeLayer) {
      const shape = shapeLayer  // The shape properties are directly on the layer
      let path = ''

      // Generate path based on shape type
      if (shape.subtype === 'rect') {
        // Resolve percentage coordinates for shape position
        const viewBox = _state.value.selectedTemplate?.viewBox
        if (!viewBox) return

        const x = resolveCoordinate(shape.position?.x ?? 0, viewBox.width, viewBox.x)  // Default to origin if undefined
        const y = resolveCoordinate(shape.position?.y ?? 0, viewBox.height, viewBox.y)  // Default to origin if undefined
        const width = shape.width ?? DEFAULT_SHAPE_WIDTH
        const height = shape.height ?? DEFAULT_SHAPE_HEIGHT
        const rx = shape.rx ?? 0  // No rounding if undefined
        const ry = shape.ry ?? 0  // No rounding if undefined

        if (rx || ry) {
          // Rounded rectangle
          path = `M${x + rx},${y} L${x + width - rx},${y} Q${x + width},${y} ${x + width},${y + ry} L${x + width},${y + height - ry} Q${x + width},${y + height} ${x + width - rx},${y + height} L${x + rx},${y + height} Q${x},${y + height} ${x},${y + height - ry} L${x},${y + ry} Q${x},${y} ${x + rx},${y} Z`
        } else {
          // Regular rectangle
          path = `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`
        }
      } else if (shape.subtype === 'circle') {
        // Resolve percentage coordinates for circle position
        const viewBox = _state.value.selectedTemplate?.viewBox
        if (!viewBox) return

        const cx = resolveCoordinate(shape.position?.x ?? 0, viewBox.width, viewBox.x)  // Default to origin if undefined
        const cy = resolveCoordinate(shape.position?.y ?? 0, viewBox.height, viewBox.y)  // Default to origin if undefined
        const r = (shape.width ?? DEFAULT_SHAPE_WIDTH) / 2
        path = `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy} Z`
      } else if (shape.subtype === 'polygon' && shape.points) {
        // Polygon with points
        const points = shape.points.split(' ').map(point => point.split(','))
        if (points.length > 0) {
          path = `M${points[0].join(',')} ${  points.slice(1).map(point => `L${point.join(',')}`).join(' ')  } Z`
        }
      }

      if (path) {
        clipShapes.push({ id: clipId, path })
      }
    }
  })

  return clipShapes
})

// Check if template has any clip paths
export const hasClipPaths = computed(() => {
  if (!_state.value.selectedTemplate?.layers) return false
  return _state.value.selectedTemplate.layers.some(layer =>
    (layer.type === 'text' && (layer.textInput?.clip || layer.clip)) ||
    (layer.type === 'svgImage' && (layer.svgImage?.clip || layer.clip))
  )
})



// ============================================================================
// FLAT ARCHITECTURE: New computed properties for simplified data flow
// ============================================================================

/**
 * Flat form data computed property - simple object spread merging
 */
export const flatFormData = computed(() => {
  if (!_state.value.selectedTemplate) {
    return []
  }

  // Simple flat merging - no conditionals, no nested property access
  return createFlatFormData(_state.value.selectedTemplate, _state.value.formData as FlatLayerData[])
})

/**
 * SVG render data - unified positioning for all layer types
 * All types now use the same transform-based positioning system
 */
export const svgRenderData = computed(() => {
  const template = _state.value.selectedTemplate
  if (!template) {
    return []
  }

  return flatFormData.value.map(flatLayer => {
    const templateLayer = template.layers.find(t => t.id === flatLayer.id)
    if (!templateLayer) return null

    // Calculate content dimensions (1.5x viewBox size)
    const contentDimensions = template.viewBox ? {
      width: template.viewBox.width * 1.5,
      height: template.viewBox.height * 1.5
    } : undefined

    // Use unified processing for all layer types
    const processed = processLayerForRendering(flatLayer, template.viewBox, contentDimensions)

    // Add any additional properties needed for specific types
    // Use Record to allow dynamic property assignment
    const processedWithExtras = processed as ProcessedLayer & Record<string, unknown>

    if (flatLayer.clip) {
      processedWithExtras.clipPath = `url(#clip-${flatLayer.clip})`
    }

    // Keep additional properties for compatibility
    processedWithExtras.position = flatLayer.position

    // For SVG images, add the styled content
    // TODO: Fix svgContent handling - temporarily disabled to test unified positioning
    if (processed.type === 'svgImage') {
      // Just pass through the svgContent without styling for now
      if (flatLayer.svgContent) {
        processedWithExtras.svgContent = flatLayer.svgContent
        // Skip getStyledSvgContent for now due to runtime error
        processedWithExtras.styledContent = flatLayer.svgContent
      }
    }

    return processed
  }).filter((item): item is ProcessedLayer => item !== null)
})

/**
 * Simplified clip paths computed property using flat layer references
 */
export const flatClipPaths = computed(() => {
  const template = _state.value.selectedTemplate
  if (!template) return []

  // Collect all clip references from flat data
  const clipIds = new Set(
    flatFormData.value
      .filter(layer => layer.clip)
      .map(layer => layer.clip!)
  )

  // Generate clip paths for referenced clip IDs
  return Array.from(clipIds).map(clipId => {
    const shapeLayer = flatFormData.value.find(layer => layer.id === clipId)
    if (!shapeLayer) return null

    return {
      id: `clip-${clipId}`,
      path: generateShapePath(shapeLayer)
    }
  }).filter(Boolean)
})

/**
 * Helper: Generate SVG path from flat shape properties
 */
function generateShapePath(shapeData: FlatLayerData): string {
  if (!shapeData.subtype) return ''

  const { subtype, width = 0, height = 0, points } = shapeData

  switch (subtype) {
    case 'circle': {
      const radius = Math.min(width, height) / 2
      // Generate circle path centered at origin (for clipping)
      return `M-${radius},0 A${radius},${radius} 0 1,1 ${radius},0 A${radius},${radius} 0 1,1 -${radius},0 Z`
    }
    case 'rect': {
      const halfWidth = width / 2
      const halfHeight = height / 2
      // Generate rectangle path centered at origin (for clipping)
      return `M-${halfWidth},-${halfHeight} L${halfWidth},-${halfHeight} L${halfWidth},${halfHeight} L-${halfWidth},${halfHeight} Z`
    }
    case 'polygon': {
      if (points) return points
      return ''
    }
    default:
      return ''
  }
}

// ============================================================================
// SVG VIEWPORT CALCULATIONS
// ============================================================================

// Create reactive refs for the composable
const _containerElement = ref<HTMLElement | null>(null)
const _previewMode = computed(() => false) // Default to non-preview mode
const _templateRef = computed(() => _state.value.selectedTemplate)

// Initialize SVG viewBox composable for calculations
const svgViewBox = useSvgViewBox(_previewMode, _templateRef, _containerElement)

// Export computed SVG viewport properties for components
export const svgViewBoxX = computed(() => svgViewBox.viewBoxX.value)
export const svgViewBoxY = computed(() => svgViewBox.viewBoxY.value)
export const svgViewBoxWidth = computed(() => svgViewBox.viewBoxWidth.value)
export const svgViewBoxHeight = computed(() => svgViewBox.viewBoxHeight.value)

// Export SVG controls for components
export const svgViewBoxControls = readonly({
  zoomIn: svgViewBox.zoomIn,
  zoomOut: svgViewBox.zoomOut,
  resetZoom: svgViewBox.resetZoom,
  setZoom: svgViewBox.setZoom,
  setPan: svgViewBox.setPan,
  resetPan: svgViewBox.resetPan,
  handleWheel: svgViewBox.handleWheel,
  autoFitTemplate: svgViewBox.autoFitTemplate,
  getZoomLevel: svgViewBox.getZoomLevel,
  getMinZoomLevel: svgViewBox.getMinZoomLevel,
  canZoomIn: svgViewBox.canZoomIn,
  canZoomOut: svgViewBox.canZoomOut
})

// Function to set container element for viewBox calculations
export function setSvgContainer(element: HTMLElement | null) {
  _containerElement.value = element
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