/**
 * UI Constants - Static data used across components
 * Pure constants with no Vue dependencies
 */

// Preset colors for quick selection (used in font selector and color pickers)
// Organized by color families for intuitive selection (35 colors total)
export const PRESET_COLORS = [
  // Neutrals & Basics (8 colors)
  '#000000', '#1f2937', '#4b5563', '#6b7280',
  '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',

  // Reds (4 colors)
  '#7f1d1d', '#dc2626', '#ef4444', '#fca5a5',

  // Oranges (3 colors)
  '#7c2d12', '#ea580c', '#fb923c',

  // Yellows & Ambers (4 colors)
  '#a16207', '#d97706', '#f59e0b', '#fbbf24',

  // Greens (4 colors)
  '#14532d', '#16a34a', '#22c55e', '#86efac',

  // Blues (4 colors)
  '#1e3a8a', '#2563eb', '#3b82f6', '#93c5fd',

  // Purples (4 colors)
  '#581c87', '#7c3aed', '#8b5cf6', '#c4b5fd',

  // Pinks & Special (4 colors)
  '#be185d', '#e11d48', '#ec4899', '#06b6d4'
] as const

// Special color values
export const COLOR_NONE = 'none' as const
export const COLOR_TRANSPARENT = 'transparent' as const

// Common font sizes for quick selection
export const COMMON_FONT_SIZES = [12, 16, 20, 24, 32, 48] as const

// Stroke linejoin options
export const STROKE_LINEJOIN_OPTIONS = [
  { value: 'round', label: 'Round', description: 'Rounded corners at line joins' },
  { value: 'miter', label: 'Miter', description: 'Sharp pointed corners at line joins' },
  { value: 'bevel', label: 'Bevel', description: 'Flat corners at line joins' },
  { value: 'arcs', label: 'Arcs', description: 'Arc corners at line joins' },
  { value: 'miter-clip', label: 'Clip', description: 'Clipped miter corners at line joins' }
] as const

// Dominant baseline options for textPath
export const DOMINANT_BASELINE_OPTIONS = [
  { value: 'auto', label: 'Auto', description: 'Automatic baseline (default)' },
  { value: 'middle', label: 'Middle', description: 'Center text vertically on path' },
  { value: 'central', label: 'Central', description: 'Central baseline alignment' },
  { value: 'hanging', label: 'Hanging', description: 'Hanging baseline for Indic scripts' },
  { value: 'alphabetic', label: 'Alpha', description: 'Alphabetic baseline' },
  { value: 'text-top', label: 'Top', description: 'Top of text em box' },
  { value: 'text-bottom', label: 'Bottom', description: 'Bottom of text em box' },
  { value: 'ideographic', label: 'Ideo', description: 'Ideographic baseline for CJK' },
  { value: 'mathematical', label: 'Math', description: 'Mathematical baseline' }
] as const

// All possible font weight options
export const ALL_FONT_WEIGHTS = [
  { label: '100', value: 100 },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '600', value: 600 },
  { label: '700', value: 700 },
  { label: '800', value: 800 },
  { label: '900', value: 900 }
] as const

// Font category color mapping
export const FONT_CATEGORY_COLORS: Record<string, string> = {
  'serif': 'bg-blue-400',
  'sans-serif': 'bg-green-400',
  'monospace': 'bg-purple-400',
  'display': 'bg-orange-400',
  'handwriting': 'bg-pink-400',
  'dingbats': 'bg-red-400'
} as const

// Default fallback color for unknown categories
export const DEFAULT_CATEGORY_COLOR = 'bg-gray-400' as const

// Lazy loading configuration
export const FONT_LOADING_CONFIG = {
  INITIAL_VISIBLE_COUNT: 20,
  LOAD_MORE_INCREMENT: 20,
  SCROLL_THRESHOLD: 100, // px from bottom
  LOAD_DELAY: 100 // ms
} as const

// Textarea configuration for multi-line text input
export const MIN_TEXTAREA_ROWS = 1 as const

// Default line height for multi-line text (1.2 = 120% of font size)
export const DEFAULT_LINE_HEIGHT = 1.2 as const

// Viewport and centering configuration
export const VIEWPORT_CONFIG = {
  MIN_CONTENT_WIDTH: 400,
  MIN_CONTENT_HEIGHT: 300,
  GRID_SCALE: 2.0,
  PADDING_SCALE: 1.5
} as const