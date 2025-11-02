/**
 * URL-Driven Store
 * Data Flow: URL → Decode → Template+Merge → FormData → Components → UserInput → Silent URL Update
 */

import { ref, computed, readonly } from 'vue'
import type { Router } from 'vue-router'
import { logger } from '../utils/logger'
import { encodeTemplateStateCompact, decodeTemplateStateCompact } from '../utils/url-encoding'
import type { AppState } from '../types/app-state'
import {
  analyzeSvgViewBoxFit,
  type SvgViewBoxFitAnalysis,
  calculateOptimalTransformOrigin,
  type Point,
  type SvgCentroid
} from '../utils/svg-bounds'
import {
  URL_SYNC_TIMEOUT_MS,
  DEFAULT_SHAPE_WIDTH,
  DEFAULT_SHAPE_HEIGHT
} from '../config/constants'
import { loadTemplate } from '../config/template-loader'
import type { SimpleTemplate, FlatLayerData, TemplateLayer, TemplateTextInput, TemplateShape } from '../types/template-types'
import { AVAILABLE_FONTS, type FontConfig } from '../config/fonts'
import { resolveCoordinate } from '../utils/svg'
import { processLayerForRendering, type ProcessedLayer } from '../utils/unified-positioning'
import { getStyledSvgContent } from '../utils/svg-template'
import { useSvgViewBox } from '../composables/useSvgViewBox'
import { useUserSvgStore } from './userSvgStore'
import { isUserSvgId } from '../utils/asset-hash'

// CRITICAL: Load user SVG store eagerly before URL decoding
// This prevents race condition where URL is decoded before store is loaded
const userSvgStore = useUserSvgStore()
const _userSvgLoadPromise = userSvgStore.loadUserSvgs().catch(err => {
  logger.error('Failed to load user SVGs on store init:', err)
})

export interface UrlDrivenState {
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

  // Missing assets tracking (for user uploads)
  missingSvgIds: string[]
  missingFontIds: string[]  // Future: font support
}

/**
 * Unified layer form data that users can mutate
 * PROPERTY NAMING: Standardized on longer color names (fillColor, strokeColor, fontColor)
 */
export interface LayerFormData {
  id: string
  type: 'text' | 'shape' | 'svgImage'

  // Text properties (standardized color property names)
  text?: string
  font?: FontConfig | null
  fontSize?: number
  fontWeight?: number
  fontColor?: string      // Standardized color property
  strokeColor?: string    // Standardized stroke property
  strokeWidth?: number
  strokeOpacity?: number
  strokeLinejoin?: string

  // TextPath properties (curved text along paths)
  startOffset?: string  // Position on path (percentage or absolute)
  dy?: number  // Vertical offset from path baseline
  dominantBaseline?: string  // Text baseline alignment

  // Shape properties (standardized color property names)
  fillColor?: string      // Standardized fill property (mapped from template 'fill')
  strokeColor?: string    // Same as text strokeColor (mapped from template 'stroke')

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
 * NOTE: Template loader already normalizes property names, so we just pass them through
 */
function flattenTemplateLayer(templateLayer: TemplateLayer): FlatLayerData {
  // NEW FLAT ARCHITECTURE: Single destructuring-based flattening
  // Template loader already normalized YAML properties (fill → fillColor, stroke → strokeColor)
  // We just pass through the already-normalized properties

  const {
    id, type,
    // Universal properties (all layer types)
    position, rotation, scale, clip, clipPath, opacity,
    // Text properties (already normalized)
    text, label, placeholder, maxLength, fontFamily, fontColor, fontSize, fontWeight,
    // TextPath properties (curved text along paths)
    textPath, startOffset, dy, dominantBaseline,
    // Multi-line text properties
    multiline, lineHeight,
    // Shape properties (already normalized by template loader)
    subtype, width, height, rx, ry, points, path, strokeWidth, strokeLinejoin,
    // SVG Image properties (already normalized by template loader)
    svgImageId, svgContent,
    // Strip out any legacy nested objects that might still exist
    textInput: _, shape: __, svgImage: ___,
    ...otherProps
  } = templateLayer as unknown as FlatLayerData

  // Return flat structure - properties already normalized by template loader
  return {
    id, type, position, rotation, scale, clip, clipPath, opacity,
    // Text properties (already use normalized names)
    text, label, placeholder, maxLength, fontFamily, fontColor, fontSize, fontWeight,
    // TextPath properties
    textPath, startOffset, dy, dominantBaseline,
    // Multi-line text properties
    multiline, lineHeight,
    // Shape/universal properties (already normalized)
    subtype, width, height, rx, ry, points, path, strokeWidth, strokeLinejoin,
    // SVG Image/universal properties (already normalized)
    svgImageId, svgContent,
    // Include any other properties that might exist (including fillColor, strokeColor, color)
    ...otherProps
  }
}

/**
 * Merge flat template defaults with flat form overrides (simple object spread)
 * CRITICAL: Filter out undefined values to allow resetting to template defaults
 */
function mergeFlatLayerData(templateDefaults: FlatLayerData, formOverrides: Partial<FlatLayerData> = {}): FlatLayerData {
  // Filter out undefined values from formOverrides to preserve template defaults
  const cleanedOverrides = Object.entries(formOverrides).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof FlatLayerData] = value
    }
    return acc
  }, {} as Partial<FlatLayerData>)

  const merged = {
    ...templateDefaults,
    ...cleanedOverrides,
    id: templateDefaults.id, // Always preserve template ID
    type: templateDefaults.type // Always preserve template type
  }

  // Calculate transform origin for SVG images if they have content
  if (merged.type === 'svgImage' && merged.svgContent) {
    merged.transformOrigin = calculateOptimalTransformOrigin(merged.svgContent)
  }

  return merged
}

/**
 * Create flat form data for entire template
 */
function createFlatFormData(template: SimpleTemplate, urlFormData: Partial<FlatLayerData>[] = []): FlatLayerData[] {
  return template.layers
    .map(templateLayer => {
      const templateDefaults = flattenTemplateLayer(templateLayer)
      const userOverrides = urlFormData.find(layer => layer.id === templateLayer.id) || {}

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
  renderData: [],
  missingSvgIds: [],
  missingFontIds: []
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

  setupRouterGuards(router)
}

/**
 * Set up router guards to handle URL changes and browser navigation
 */
function setupRouterGuards(router: Router): void {
  // Handle route changes (including browser back/forward)
  router.beforeEach(async (to, from, next) => {
    try {
      _state.value.currentUrl = to.path

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

function setupBrowserNavigationHandling(_router: Router): void {
  window.addEventListener('popstate', () => {
    // Router handles URL change via beforeEach guard
  })
}

async function handleUrlDecode(urlPath: string): Promise<void> {
  _state.value.isLoadingFromUrl = true

  try {
    // CRITICAL: Wait for user SVG store to load before decoding URL
    // This prevents race condition where URL is decoded before store is loaded
    await _userSvgLoadPromise

    // Extract encoded state from URL path
    const stickerMatch = urlPath.match(/^\/(.+)\.sticker$/)
    if (!stickerMatch) {
      logger.warn('Invalid sticker URL format:', urlPath)
      await loadDefaultState()

      // Clear invalid URL from browser history
      window.history.replaceState(null, '', '/')
      return
    }

    const encodedState = stickerMatch[1]
    const decodedState = decodeTemplateStateCompact(encodedState)

    if (!decodedState) {
      logger.warn('Failed to decode URL state - incompatible encoding version or corrupt data')
      await loadDefaultState()
      window.history.replaceState(null, '', '/')
      return
    }

    await applyDecodedState(decodedState)

  } catch (error) {
    logger.error('Error decoding URL state:', error)
    await loadDefaultState()
    window.history.replaceState(null, '', '/')
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
    }
  }
}

async function loadDefaultState(): Promise<void> {
  _state.value.selectedTemplateId = null
  _state.value.selectedTemplate = null
  _state.value.formData = []
  _state.value.renderData = []
}

function mergeTemplateWithUrlData(template: SimpleTemplate, urlLayers: Array<{ id: string; [key: string]: unknown }>): LayerFormData[] {
  const formData: LayerFormData[] = []

  // Reset missing assets tracking
  _state.value.missingSvgIds = []
  _state.value.missingFontIds = []

  // Create URL override lookup
  const urlOverrides: Record<string, { id: string; [key: string]: unknown }> = {}
  urlLayers.forEach(layer => {
    urlOverrides[layer.id] = layer
  })

  // Process each template layer
  template.layers.forEach(templateLayer => {
    // Skip path layers - they are static reference paths for textPath, not editable
    const flatLayer = templateLayer as unknown as FlatLayerData
    if (flatLayer.subtype === 'path') {
      return  // Don't create form entry for path layers
    }

    const urlOverride = urlOverrides[templateLayer.id] || {}

    // Create form data entry with template defaults + URL overrides
    const formEntry: LayerFormData = {
      id: templateLayer.id,
      type: templateLayer.type as 'text' | 'shape' | 'svgImage'
    }

    // Apply type-specific merging
    // Cast to FlatLayerData since template loader flattens structure at runtime

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

      // TextPath properties (curved text)
      formEntry.startOffset = urlOverride.startOffset !== undefined ? urlOverride.startOffset : flatLayer.startOffset
      formEntry.dy = urlOverride.dy !== undefined ? urlOverride.dy : flatLayer.dy
      formEntry.dominantBaseline = urlOverride.dominantBaseline !== undefined ? urlOverride.dominantBaseline : flatLayer.dominantBaseline

      // Rotation property (applies to all text types)
      formEntry.rotation = urlOverride.rotation !== undefined ? urlOverride.rotation : flatLayer.rotation

      // Handle fontFamily - convert string to font object
      // Priority: URL override > template default
      const fontFamilyToUse = urlOverride.fontFamily !== undefined ? urlOverride.fontFamily : flatLayer.fontFamily
      if (fontFamilyToUse) {
        const fontConfig = AVAILABLE_FONTS.find(f => f.family === fontFamilyToUse || f.name === fontFamilyToUse)
        if (fontConfig) {
          formEntry.font = fontConfig
        }
      }
    } else if (templateLayer.type === 'shape') {
      // Template loader now flattens structure - properties use normalized names
      formEntry.fillColor = urlOverride.fillColor !== undefined ? urlOverride.fillColor : flatLayer.fillColor
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : flatLayer.strokeColor
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : flatLayer.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : flatLayer.strokeLinejoin
    } else if (templateLayer.type === 'svgImage') {
      // Template loader now flattens structure - properties use normalized names
      formEntry.svgImageId = urlOverride.svgImageId !== undefined ? urlOverride.svgImageId : flatLayer.svgImageId
      formEntry.color = urlOverride.color !== undefined ? urlOverride.color : flatLayer.color
      formEntry.strokeColor = urlOverride.strokeColor !== undefined ? urlOverride.strokeColor : flatLayer.strokeColor
      formEntry.strokeWidth = urlOverride.strokeWidth !== undefined ? urlOverride.strokeWidth : flatLayer.strokeWidth
      formEntry.strokeLinejoin = urlOverride.strokeLinejoin !== undefined ? urlOverride.strokeLinejoin : flatLayer.strokeLinejoin
      formEntry.scale = urlOverride.scale !== undefined ? urlOverride.scale : flatLayer.scale
      formEntry.rotation = urlOverride.rotation !== undefined ? urlOverride.rotation : flatLayer.rotation

      // CRITICAL: Resolve user SVG content
      // Check if this layer uses a user-uploaded SVG
      const svgId = formEntry.svgImageId
      if (svgId && isUserSvgId(svgId)) {
        // Try to load user SVG content from store
        const userSvgContent = userSvgStore.getUserSvgContent(svgId)

        if (userSvgContent) {
          // User SVG found - use its content
          formEntry.svgContent = userSvgContent
          logger.debug('URL Store: Loaded user SVG:', svgId)
        } else {
          // User SVG missing - track it and fallback to URL content
          _state.value.missingSvgIds.push(svgId)
          formEntry.svgContent = urlOverride.svgContent !== undefined ? urlOverride.svgContent : flatLayer.svgContent
          logger.warn('URL Store: User SVG not found, marked as missing:', svgId)
        }
      } else {
        // Regular SVG (from library) - use URL or template default
        formEntry.svgContent = urlOverride.svgContent !== undefined ? urlOverride.svgContent : flatLayer.svgContent
      }
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

  // CRITICAL FIX: Replace entire array to trigger Vue reactivity
  // Mutating array[index] doesn't trigger computed properties that depend on the array
  _state.value.formData = _state.value.formData.map((layer, index) =>
    index === layerIndex ? { ...layer, ...updates } : layer
  )

  scheduleUrlSync()
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

    scheduleUrlSync()
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
    scheduleUrlSync()
  }
}

function scheduleUrlSync(): void {
  if (!_state.value.isInitialized || !_state.value.router) {
    logger.warn('Cannot sync URL - store not initialized')
    return
  }

  if (_urlSyncTimeout) {
    clearTimeout(_urlSyncTimeout)
  }

  _urlSyncTimeout = setTimeout(() => {
    try {
      syncUrlSilently()
    } catch (error) {
      logger.error('Failed to sync URL:', error)
    }
  }, URL_SYNC_TIMEOUT_MS)
}

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
  }
}

export const urlDrivenStore = {
  // State getters
  get isInitialized(): boolean { return _state.value.isInitialized },
  get isLoadingFromUrl(): boolean { return _state.value.isLoadingFromUrl },
  get currentUrl(): string { return _state.value.currentUrl },
  get selectedTemplateId(): string | null { return _state.value.selectedTemplateId },
  get selectedTemplate(): SimpleTemplate | null { return _state.value.selectedTemplate },
  get formData(): readonly LayerFormData[] { return readonly(_state.value.formData) },
  get renderData(): readonly RenderableLayer[] { return readonly(_state.value.renderData) },
  get missingSvgIds(): readonly string[] { return readonly(_state.value.missingSvgIds) },
  get missingFontIds(): readonly string[] { return readonly(_state.value.missingFontIds) },

  // Actions
  updateLayer,
  updateTemplate,
  updateLayers,
  clearMissingAssets: () => {
    _state.value.missingSvgIds = []
    _state.value.missingFontIds = []
  },

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
export const missingSvgIds = computed(() => _state.value.missingSvgIds)
export const missingFontIds = computed(() => _state.value.missingFontIds)

// Export clearMissingAssets action
export const clearMissingAssets = urlDrivenStore.clearMissingAssets

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
        // Template loader now flattens structure - properties use normalized names
        defaultLayer.fillColor = flatLayer.fillColor
        defaultLayer.strokeColor = flatLayer.strokeColor
        defaultLayer.strokeWidth = flatLayer.strokeWidth
        defaultLayer.strokeLinejoin = flatLayer.strokeLinejoin
      } else if (templateLayer.type === 'svgImage') {
        // Template loader now flattens structure - properties use normalized names
        defaultLayer.svgImageId = flatLayer.svgImageId
        defaultLayer.svgContent = flatLayer.svgContent
        defaultLayer.color = flatLayer.color
        defaultLayer.strokeColor = flatLayer.strokeColor  // Already normalized by flattenTemplateLayer
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
      // Template loader now flattens structure - properties use normalized names
      mergedLayer.fillColor = formLayer.fillColor !== undefined ? formLayer.fillColor : flatLayer.fillColor
      mergedLayer.strokeColor = formLayer.strokeColor !== undefined ? formLayer.strokeColor : flatLayer.strokeColor
      mergedLayer.strokeWidth = formLayer.strokeWidth !== undefined ? formLayer.strokeWidth : flatLayer.strokeWidth
      mergedLayer.strokeLinejoin = formLayer.strokeLinejoin !== undefined ? formLayer.strokeLinejoin : flatLayer.strokeLinejoin
    } else if (templateLayer.type === 'svgImage') {
      // Template loader now flattens structure - properties use normalized names
      mergedLayer.svgImageId = formLayer.svgImageId !== undefined ? formLayer.svgImageId : flatLayer.svgImageId
      mergedLayer.svgContent = formLayer.svgContent !== undefined ? formLayer.svgContent : flatLayer.svgContent
      mergedLayer.color = formLayer.color !== undefined ? formLayer.color : flatLayer.color
      mergedLayer.strokeColor = formLayer.strokeColor !== undefined ? formLayer.strokeColor : flatLayer.strokeColor  // Already normalized
      mergedLayer.strokeWidth = formLayer.strokeWidth !== undefined ? formLayer.strokeWidth : flatLayer.strokeWidth
      mergedLayer.strokeLinejoin = formLayer.strokeLinejoin !== undefined ? formLayer.strokeLinejoin : flatLayer.strokeLinejoin
      mergedLayer.rotation = formLayer.rotation !== undefined ? formLayer.rotation : flatLayer.rotation
      mergedLayer.scale = formLayer.scale !== undefined ? formLayer.scale : flatLayer.scale

      // Calculate transform origin for proper rotation/scaling around center-of-mass
      if (mergedLayer.svgContent) {
        mergedLayer.transformOrigin = calculateOptimalTransformOrigin(mergedLayer.svgContent)
      }

      // Store calculates transform string - no conditional logic in components
      const transforms = []
      const absoluteX = flatLayer.position?.x
      const absoluteY = flatLayer.position?.y
      const targetWidth = flatLayer.width
      const targetHeight = flatLayer.height
      const rotation = mergedLayer.rotation
      const scale = mergedLayer.scale

      // First translate to position if coordinates exist
      if (absoluteX !== undefined && absoluteY !== undefined) {
        transforms.push(`translate(${absoluteX}, ${absoluteY})`)
      }

      // For center-based scale and rotation
      if ((scale !== undefined && scale !== 1) || (rotation !== undefined && rotation !== 0)) {
        const centerX = targetWidth ? targetWidth / 2 : undefined
        const centerY = targetHeight ? targetHeight / 2 : undefined

        if (centerX !== undefined && centerY !== undefined) {
          transforms.push(`translate(${centerX}, ${centerY})`)

          if (scale !== undefined && scale !== 1) {
            transforms.push(`scale(${scale})`)
          }

          if (rotation !== undefined && rotation !== 0) {
            transforms.push(`rotate(${rotation})`)
          }

          transforms.push(`translate(${-centerX}, ${-centerY})`)
        }
      }

      mergedLayer.transformString = transforms.join(' ')
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
        // Only override with form data if form data exists (using normalized names)
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

        // OUTER TRANSFORM: Position and base scaling only (high precision)
        outerTransform = `translate(${finalX.toFixed(6)}, ${finalY.toFixed(6)}) scale(${baseScaleX.toFixed(6)}, ${baseScaleY.toFixed(6)})`

        const userScale = scale !== undefined ? scale : 1

        if ((rotation !== undefined && rotation !== 0) || (userScale !== 1)) {
          let transformOrigin = { x: svgCenter, y: svgCenter }

          if (renderLayer.useCentroidOrigin && renderLayer.transformOrigin) {
            transformOrigin = renderLayer.transformOrigin
          }

          const transformSteps: string[] = []

          // Move to optimal center of the SVG coordinate system
          transformSteps.push(`translate(${transformOrigin.x.toFixed(6)}, ${transformOrigin.y.toFixed(6)})`)

          // Apply user transformations in correct order
          if (rotation !== undefined && rotation !== 0) {
            transformSteps.push(`rotate(${rotation.toFixed(6)})`)
          }

          if (userScale !== 1) {
            transformSteps.push(`scale(${userScale.toFixed(6)})`)
          }

          // Move back from center
          transformSteps.push(`translate(${(-transformOrigin.x).toFixed(6)}, ${(-transformOrigin.y).toFixed(6)})`)

          innerTransform = transformSteps.join(' ')
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
        if (shape.position?.x === undefined || shape.position?.y === undefined) return

        const x = resolveCoordinate(shape.position.x, viewBox.width, viewBox.x)
        const y = resolveCoordinate(shape.position.y, viewBox.height, viewBox.y)
        const width = shape.width ?? DEFAULT_SHAPE_WIDTH
        const height = shape.height ?? DEFAULT_SHAPE_HEIGHT
        const rx = shape.rx !== undefined ? shape.rx : 0
        const ry = shape.ry !== undefined ? shape.ry : 0

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
        if (shape.position?.x === undefined || shape.position?.y === undefined) return

        const cx = resolveCoordinate(shape.position.x, viewBox.width, viewBox.x)
        const cy = resolveCoordinate(shape.position.y, viewBox.height, viewBox.y)
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

// Generate textPath path definitions from template shapes
export const textPathDefinitions = computed(() => {
  if (!_state.value.selectedTemplate?.layers) return []

  const pathDefinitions: Array<{id: string, pathData: string}> = []

  // Find all text layers that reference textPath
  const textPathReferences = new Set<string>()

  _state.value.selectedTemplate.layers.forEach(layer => {
    // Check for textPath property in text layers
    if (layer.type === 'text' && layer.textInput?.textPath) {
      textPathReferences.add(layer.textInput.textPath)
    }
    // Also check for direct textPath property (flat architecture)
    // Cast to FlatLayerData to access textPath property
    const flatLayer = layer as unknown as FlatLayerData
    if (layer.type === 'text' && flatLayer.textPath) {
      textPathReferences.add(flatLayer.textPath)
    }
  })

  // Generate path definitions for referenced paths
  textPathReferences.forEach(pathId => {
    const pathLayer = _state.value.selectedTemplate?.layers.find(layer =>
      layer.type === 'shape' && layer.id === pathId
    )

    if (pathLayer) {
      // Cast to FlatLayerData to access path property
      const flatPathLayer = pathLayer as unknown as FlatLayerData

      // Only include path layers with subtype='path' and path data
      if (flatPathLayer.subtype === 'path' && flatPathLayer.path) {
        pathDefinitions.push({
          id: pathId,
          pathData: flatPathLayer.path
        })
      }
    }
  })

  return pathDefinitions
})

// Check if template has any textPath paths
export const hasTextPaths = computed(() => {
  if (!_state.value.selectedTemplate?.layers) return false
  return _state.value.selectedTemplate.layers.some(layer => {
    if (layer.type === 'text') {
      // Check nested textInput property
      if (layer.textInput?.textPath) return true
      // Check flat property
      const flatLayer = layer as unknown as FlatLayerData
      if (flatLayer.textPath) return true
    }
    return false
  })
})

export const flatFormData = computed(() => {
  if (!_state.value.selectedTemplate) {
    return []
  }

  return createFlatFormData(_state.value.selectedTemplate, _state.value.formData as FlatLayerData[])
})

export const svgRenderData = computed(() => {
  const template = _state.value.selectedTemplate
  if (!template) {
    return []
  }

  const layers = _state.value.formData
  layers.forEach(layer => {
    void layer.strokeLinejoin
    void layer.strokeWidth
    void layer.color
    void layer.stroke
  })

  const flatData = createFlatFormData(template, layers as FlatLayerData[])

  return flatData.map(flatLayer => {
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

    if (processed.type === 'svgImage' && flatLayer.svgContent) {
      const styledContent = getStyledSvgContent({
        svgContent: flatLayer.svgContent,
        fill: flatLayer.color,
        stroke: flatLayer.stroke,
        strokeWidth: flatLayer.strokeWidth,
        strokeLinejoin: flatLayer.strokeLinejoin
      })

      processedWithExtras.svgContent = flatLayer.svgContent
      processedWithExtras.styledContent = styledContent
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

