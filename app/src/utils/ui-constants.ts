/**
 * UI Constants - Static data used across components
 * Pure constants with no Vue dependencies
 */

// Preset colors for quick selection (used in font selector and color pickers)
export const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#dc2626', '#059669',
  '#1f2937', '#f3f4f6', '#7f1d1d', '#7c2d12',
  '#713f12', '#14532d', '#1e3a8a', '#581c87',
  '#831843', '#374151', '#fbbf24', '#34d399'
] as const

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
  'handwriting': 'bg-pink-400'
} as const

// Lazy loading configuration
export const FONT_LOADING_CONFIG = {
  INITIAL_VISIBLE_COUNT: 20,
  LOAD_MORE_INCREMENT: 20,
  SCROLL_THRESHOLD: 100, // px from bottom
  LOAD_DELAY: 100 // ms
} as const