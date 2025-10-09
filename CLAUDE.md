# Sticker Factory - Development Guide

Vue 3 application for creating custom SVG badges and stickers with templates and advanced typography.

## 🚨 Critical Architectural Constraints

### NO HARDCODED VALUES
**All calculations must derive from actual measurements. Never use hardcoded defaults or fallbacks.**

```typescript
// ❌ FORBIDDEN
const rotation = svgImage.rotation || 0
const color = layer.fill || '#000000'
const maxPan = 300

// ✅ CORRECT
const rotation = svgImage.rotation  // undefined = no rotation applied
const color = layer.fill            // undefined = use inherited/template value
const maxPan = Math.max(overflowX, backgroundPanX)  // calculated from actual dimensions
```

**Enforcement:**
- No `|| 0`, `?? 1`, `|| '#000000'` patterns
- No magic numbers in pan/zoom logic
- Properties undefined by default, conditionally applied only when present

### Store-Level Data Normalization
**SVG components must be "dumb" - all conditional logic and data merging happens in the store.**

```typescript
// ❌ FORBIDDEN - Logic in SVG component
<text :font-family="layerData?.font?.family || template.fontFamily || 'Arial'">

// ✅ CORRECT - Store normalizes data, component just renders
// Store:
const svgRenderData = computed(() => {
  return layers.map(templateLayer => {
    const formLayer = formData.find(f => f.id === templateLayer.id)
    return {
      ...templateLayer,
      ...(formLayer?.fontFamily && { fontFamily: formLayer.fontFamily })
    }
  })
})

// Component:
<text :font-family="element.fontFamily">
```

## ⚡ Development Discipline

### Code Reuse - Search Before Creating
**ALWAYS search the codebase exhaustively before writing new code. Creating duplicates is a critical failure.**

```typescript
// ❌ FORBIDDEN - Creating duplicate logging
console.log('Debug message')
console.error('Error occurred')

// ✅ CORRECT - Use existing logger utility
import { logger } from './utils/logger'
logger.info('Debug message')
logger.error('Error occurred')

// ❌ FORBIDDEN - Recreating transform calculations
const transform = `translate(${x}, ${y}) scale(${scale})`

// ✅ CORRECT - Use existing svg-transforms.ts utilities
import { createTransformString } from './utils/svg-transforms'
const transform = createTransformString({ translateX: x, translateY: y, scale })
```

**Search checklist before writing new code:**
1. Check `utils/` for existing calculations/utilities
2. Check `composables/` for existing reactive patterns
3. Reference similar features in codebase
4. Break down complex functions for cross-cutting reuse
5. **Example**: `useSvgCentering.ts` wraps pure functions from `svg-centering.ts`

### Testing is Mandatory
**Tests are production code. New features without tests will not be accepted.**

```bash
# Tests live in src/test/ with matching names
src/utils/svg-transforms.ts → src/test/svg-transforms.test.ts
src/composables/useSvgCentering.ts → src/test/useSvgCentering.test.ts

# Coverage expectations
Utils: 100% coverage (pure functions, easy to test)
Composables: 80%+ coverage (reactive logic)
Components: 60%+ coverage (integration tests)
```

**After creating ANY new utility or feature:**
1. Write comprehensive unit tests IMMEDIATELY
2. Test happy paths AND edge cases
3. Test error handling and validation
4. Add tests to same commit as feature code

### Never Disable Tests
**Disabled tests = broken code. If tests fail, FIX THEM.**

```typescript
// ❌ FORBIDDEN - Disabling failing tests
it.skip('should calculate transform correctly', () => { ... })

// ✅ CORRECT - Fix the test or ask for help
it('should calculate transform correctly', () => {
  // If stuck: Ask for help debugging
  // Never commit with .skip() or .only()
})
```

**If blocked on failing tests:**
- Debug the root cause first
- Check if feature requirements changed
- Ask for help if truly stuck
- NEVER use `.skip()` or `.only()` in commits

### No Scattered Defaults or Fallbacks
**All constants and defaults live in centralized locations. No inline fallbacks.**

```typescript
// ❌ FORBIDDEN - Inline defaults littered everywhere
const color = userColor || '#000000'
const fontSize = userSize ?? 16
const padding = data.padding || 10

// ✅ CORRECT - Define in utils/ui-constants.ts
export const DEFAULT_TEXT_COLOR = '#1f2937'
export const DEFAULT_FONT_SIZE = 16
export const DEFAULT_PADDING = { top: 10, right: 10, bottom: 10, left: 10 }

// Then import and use
import { DEFAULT_TEXT_COLOR } from './utils/ui-constants'
const color = userColor || DEFAULT_TEXT_COLOR
```

**See `utils/ui-constants.ts` for examples:**
- `PRESET_COLORS` - Color palette
- `FONT_LOADING_CONFIG` - Lazy loading settings
- `STROKE_LINEJOIN_OPTIONS` - SVG stroke options

**When you need a default value:**
1. Check if it already exists in `ui-constants.ts`
2. If not, add it there with clear naming
3. Reuse across codebase - no duplication
4. Values should be computed from measurements, not guessed

### Vue Reactivity Separation
**Pure functions in utils/, Vue reactivity in composables/. NEVER mix.**

```typescript
// ❌ FORBIDDEN - Vue reactivity in utils/
// File: utils/svg-helper.ts
import { ref, computed } from 'vue'
export function useHelper() {
  const value = ref(0)  // NO! This is a util file
  return { value }
}

// ✅ CORRECT - Pure function in utils/
// File: utils/svg-helper.ts
export function calculateValue(input: number): number {
  return input * 2  // Pure calculation, no Vue
}

// ✅ CORRECT - Vue reactivity in composables/
// File: composables/useSvgHelper.ts
import { ref, computed } from 'vue'
import { calculateValue } from '../utils/svg-helper'

export function useSvgHelper() {
  const input = ref(0)
  const output = computed(() => calculateValue(input.value))
  return { input, output }
}
```

**Pattern: Composables wrap utils with reactivity**
- **utils/svg-centering.ts**: Pure functions (calculateCenteringTransform, calculateGridBounds)
- **composables/useSvgCentering.ts**: Wraps with Vue reactivity (ref, computed, watch)
- Benefits: Utils work everywhere (browser, Node.js, Service Workers)

### Component Architecture - Composition Over Fat Components
**Keep components lean. Logic belongs in composables.**

```vue
<!-- ❌ FORBIDDEN - Fat component with embedded logic -->
<script setup>
const transform = ref('')
const scale = ref(1)
const rotation = ref(0)

watch([scale, rotation], () => {
  const s = scale.value
  const r = rotation.value
  transform.value = `scale(${s}) rotate(${r})`
})
</script>

<!-- ✅ CORRECT - Lean component using composable -->
<script setup>
import { useSvgTransform } from '@/composables/useSvgTransform'

const { transform, scale, rotation } = useSvgTransform()
</script>
```

**Architecture:**
- **Components (.vue)**: Presentation, template, minimal script
- **Composables (use*.ts)**: Business logic, state management, watchers
- **Utils (*-utils.ts)**: Pure calculations, transformations
- **Stores (*Store.ts)**: Global state (Pinia)

**Use composition for complex behaviors:**
```typescript
// Compose multiple composables
export function useComplexFeature() {
  const { transform } = useSvgTransform()
  const { bounds } = useSvgBounds()
  const { center } = useSvgCentering()

  // Combine behaviors
  return { transform, bounds, center }
}
```

## 🏗️ Architecture

### URL-Driven State Management
- **Single Source of Truth**: URL controls all application state
- **Store**: `urlDrivenStore.ts` handles template loading and URL encoding/decoding
- **URL Format**: Base64-encoded JSON with debounced updates (500ms)
- **Navigation**: Browser back/forward buttons work seamlessly
- **Persistence**: State restored from URL on page reload

**Data Flow:**
```
URL → Decode → Template+Merge → FormData → Components → User Input
 ↑                                                          ↓
 └─────── Silent Update ←─── Encode ←─── Debounce ←─────────┘
```

### Component Responsibilities
- **Store**: Data merging, normalization, URL sync
- **Forms**: Display FormData[], emit changes
- **SVG**: Render from FormData[] only (no template access)
- **NO hardcoded defaults anywhere**

## 📂 Project Structure

```
app/
├── src/
│   ├── stores/
│   │   └── urlDrivenStore.ts       # URL-driven state management
│   ├── components/
│   │   ├── Svg.vue                 # Dumb SVG renderer
│   │   ├── TextInputWithFontSelector.vue
│   │   ├── TemplateObjectStyler.vue
│   │   └── SvgLibrarySelector.vue
│   ├── utils/
│   │   ├── svg.ts                  # Core SVG utilities
│   │   ├── svg-bounds.ts           # SVG analysis
│   │   ├── svg-transforms.ts       # Transform calculations
│   │   ├── url-encoding.ts         # URL state encoding
│   │   └── font-utils.ts           # Font utilities
│   ├── config/
│   │   ├── fonts.ts                # 600+ Google Fonts
│   │   ├── template-loader.ts      # Template processing
│   │   └── svg-library-loader.ts   # SVG icon library
│   └── types/
│       ├── template-types.ts       # Template interfaces
│       └── svg-types.ts            # SVG type definitions
├── templates/                      # 18 YAML templates
├── images/                         # 100+ SVG icons
└── dist/                          # Production build
```

## 🛠️ Development Commands

```bash
# Development
make dev              # Start dev server (http://localhost:3000)
make dev-open         # Start dev server + open browser

# Quality Assurance
make lint             # Run ESLint
make test-quick       # Run tests
make build            # Production build

# Git Workflow
git checkout -b feature/your-feature
git add . && git commit -m "feat: description"
git push origin feature/your-feature
```

## 📋 Template System

### Template Structure (YAML)
```yaml
name: "Template Name"
id: "template-id"
category: "circle|rectangle|square|diamond"
width: 400
height: 400
layers:
  - id: "shape-id"
    type: "shape"
    subtype: "rect|circle|polygon"
    position: { x: "50%", y: "50%" }
    width: 200
    height: 200
    fill: "#3b82f6"
    stroke: "#1e40af"
    strokeWidth: 2

  - id: "text-id"
    type: "text"
    label: "Form Label"
    default: "Default Text"
    position: { x: "50%", y: "50%" }
    maxLength: 20
    fontFamily: "Roboto"
    fontSize: 24
    fontWeight: 700
    fontColor: "#1f2937"

  - id: "icon-id"
    type: "svgImage"
    svgId: "ui-security-shield"
    position: { x: "75%", y: "25%" }
    width: 32
    height: 32
    fill: "#10b981"
```

### Coordinate System
- **Percentage**: `"50%"` = center, `"0%"` = top/left, `"100%"` = bottom/right
- **Absolute**: Pixel values (e.g., `200`)
- **Mixed**: `{ x: "50%", y: 30 }` allowed
- **Text Position**: Coordinates represent the CENTER of text (not top-left)

### Available SVG Icons
100+ icons organized by category in `app/images/`:
- UI elements (alerts, shields, checkmarks)
- Tech (code, development, devices)
- Business (charts, documents, communication)
- Nature (animals, weather, environment)
- Objects (tools, transportation, food)

Reference by `svgId` matching filename without extension.

## 🎯 Naming Conventions

**Consistency is critical. Similar functions must use the same verbs/nouns across the codebase.**

### Function Naming - Standard Verbs
| Verb | Purpose | Examples | Return |
|------|---------|----------|--------|
| `calculate*()` | Math/geometry computations | `calculateBounds()`, `calculateTransform()` | Computed value |
| `resolve*()` | Convert/normalize data | `resolveCoordinate()`, `resolvePercentage()` | Resolved value |
| `extract*()` | Pull data from structures | `extractViewBox()`, `extractFontUrls()` | Extracted data |
| `generate*()` | Create new structures | `generateSvgString()`, `generateTransform()` | New object/string |
| `create*()` | Factory/constructor | `createTransformString()`, `createElement()` | New instance |
| `analyze*()` | Inspect/measure | `analyzeSvgBounds()`, `analyzeContent()` | Metadata object |
| `validate*()` | Check correctness | `validateViewBox()`, `validateInput()` | Boolean |
| `should*()` / `is*()` / `has*()` | Boolean checks | `shouldRender()`, `isValid()`, `hasContent()` | Boolean |
| `apply*()` | Modify/transform | `applyTransform()`, `applyStyles()` | Modified value |
| `combine*()` | Merge/join | `combineTransforms()`, `combineStyles()` | Combined result |
| `format*()` | String formatting | `formatColor()`, `formatNumber()` | Formatted string |
| `parse*()` | String to data | `parseViewBox()`, `parseSvg()` | Parsed object |

**Standardize similar operations across domains:**
```typescript
// ✅ CORRECT - Consistent naming pattern
calculateSvgBounds()      // SVG domain
calculateTextBounds()     // Text domain
calculateImageBounds()    // Image domain

// ❌ WRONG - Inconsistent verbs for same concept
getSvgBounds()            // Different verb
computeTextBounds()       // Different verb
findImageBounds()         // Different verb
```

### Noun Standardization
**Use the same nouns for the same concepts:**
- **Transform/Transformation**: Use "transform" (not "xform", "tx", "transformation")
- **Coordinate/Position**: Use "position" for {x, y} (not "coord", "pos", "point" for compound)
- **Dimensions/Size**: Use "dimensions" for {width, height} (not "size", "bounds" for size-only)
- **Bounds/BBox**: Use "bounds" for {x, y, width, height} (not "bbox", "rect")
- **ViewBox**: Always "viewBox" (not "vb", "viewport")

### Component/File Naming
| Pattern | Purpose | Examples |
|---------|---------|----------|
| `use*.ts` | Vue composables | `useSvgCentering.ts`, `useFontSelector.ts` |
| `*-utils.ts` | Pure utilities | `svg-utils.ts`, `font-utils.ts` |
| `*-types.ts` | Type definitions | `svg-types.ts`, `template-types.ts` |
| `*Store.ts` | Pinia stores | `urlDrivenStore.ts`, `fontStore.ts` |
| `*Modal.vue` | Modal components | `DownloadModal.vue`, `SettingsModal.vue` |
| `*Selector.vue` | Selector components | `FontSelector.vue`, `ColorSelector.vue` |

### Consistency Rules
1. **Same feature = same prefix**: All SVG-related → `svg-*`, all font-related → `font-*`
2. **Same verb for same operation**: Calculating bounds always uses `calculate`, never `get`/`find`/`compute`
3. **No abbreviations**: Write `transform` not `xform`, `coordinate` not `coord`
4. **CamelCase for functions**: `calculateBounds()` not `calculate_bounds()`
5. **kebab-case for files**: `svg-transforms.ts` not `svgTransforms.ts` or `svg_transforms.ts`

## 🧪 Testing & Quality

```bash
# Run tests (50 SVG utility tests)
npm run test:run

# Lint (target: 1 warning or less)
npm run lint

# Production build verification
npm run build
```

**Quality Standards:**
- ESLint warnings ≤ 1
- All tests passing
- Production build successful
- No hardcoded values in pan/zoom logic

## 🔧 Technology Stack

- **Frontend**: Vue 3 (Composition API), TypeScript, Pinia
- **Build**: Vite with HMR
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (600+ families)
- **Testing**: Vitest
- **Linting**: ESLint + @typescript-eslint

## 📝 Git Commit Guidelines

```bash
# Commit format
<type>: <description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

# Types
feat:     New features
fix:      Bug fixes
refactor: Code improvements (no behavior change)
test:     Testing changes
docs:     Documentation updates
chore:    Maintenance tasks
```

## 🚀 Key Features

- **18 Professional Templates** (Circle, Rectangle, Square, Diamond)
- **600+ Google Fonts** with dynamic loading
- **100+ SVG Icons** with full styling control
- **Multi-text Input** with individual font styling
- **Shape Styling** (fill, stroke, linejoin)
- **URL-Based State** (shareable, persistent)
- **Export** (SVG, PNG, JSON)
- **Responsive Design** (desktop/mobile)

---

**Production Ready**: All 9 cleanup phases complete, 2,070+ lines of dead code removed, lint at baseline, comprehensive test coverage.
