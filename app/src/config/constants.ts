// Application-wide constants following ALL_UPPERCASE naming convention

// Storage keys
export const STORAGE_KEY_MAIN = 'sticker-factory-data'
export const STORAGE_KEY_TEMPLATE = 'sticker-factory-template-data'
export const STORAGE_VERSION = 1

// Template processing
export const TEMPLATE_PADDING = 20
export const DEFAULT_VIEWBOX_WIDTH = 500
export const DEFAULT_VIEWBOX_HEIGHT = 400
export const MIN_VIEWBOX_WIDTH = 400
export const MIN_VIEWBOX_HEIGHT = 400

// Font loading and display
export const FONT_INITIAL_VISIBLE_COUNT = 20
export const FONT_SCROLL_THRESHOLD = 100
export const FONT_TILE_WIDTH = 80
export const FONT_TILE_HEIGHT = 80
export const FONT_DISPLAY_MODE = 'swap'

// Font size breakpoints for responsive display
export const FONT_SIZE_SMALL_TEXT_THRESHOLD = 10
export const FONT_SIZE_MEDIUM_TEXT_THRESHOLD = 20
export const FONT_SIZE_SMALL = '10px'
export const FONT_SIZE_MEDIUM = '12px'

// SVG viewer defaults
export const SVG_INITIAL_ZOOM = 1
export const SVG_INITIAL_PAN_X = 0
export const SVG_INITIAL_PAN_Y = 0
export const SVG_LEGEND_WIDTH = 128
export const SVG_LEGEND_HEIGHT = 40
export const SVG_MINI_HEIGHT = 32
export const SVG_PREVIEW_SIZE = 24

// URL Sync Configuration
export const URL_SYNC_DEBOUNCE_MS = 500 // Debounce delay for URL updates
export const URL_SYNC_TIMEOUT_MS = 500 // Timeout value for URL sync operations

// File handling
export const SUPPORTED_JSON_MIME_TYPE = 'application/json'
export const FILE_SIZE_KB = 1024

// Default colors
export const COLOR_DEFAULT_PRIMARY = '#22c55e'
export const COLOR_DEFAULT_BLACK = '#000000'
export const COLOR_DEFAULT_WHITE = '#ffffff'
export const COLOR_DEFAULT_STROKE = '#333333'

// Download defaults
export const DEFAULT_DOWNLOAD_RESOLUTION = 2

// Success/error messages
export const MESSAGE_IMPORT_SUCCESS = 'Data imported successfully!'
export const MESSAGE_FILE_IMPORT_SUCCESS = 'File imported successfully!'
export const MESSAGE_TEMPLATE_LOAD_ERROR = 'Failed to load templates'
export const MESSAGE_INVALID_JSON = 'Please select a valid JSON file'
export const MESSAGE_INVALID_JSON_DROP = 'Please drop a valid JSON file'

// CSS link attributes
export const CSS_LINK_REL = 'stylesheet'
export const CSS_FONT_DISPLAY_PARAM = '&display=swap'