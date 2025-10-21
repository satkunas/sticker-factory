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

### Rendering Fallback Pattern
**Rendering components use simple, consistent fallback chains. Complex logic stays in stores/composables.**

```typescript
// ❌ FORBIDDEN - Complex conditional logic in rendering components
<text :font-family="layerData?.font?.family || template.fontFamily || 'Arial'">
<rect :fill="layer.overrideFill ? layer.fill : (template.fill ?? '#000000')">

// ✅ CORRECT - Simple fallback chain using ?? operator
// MUST be identical in Svg.vue and svg-string-generator.ts
:fill="layerData?.fillColor ?? templateLayer.fillColor"
:stroke="layerData?.strokeColor ?? templateLayer.strokeColor"
:font-family="extractFontFamily(layerData) ?? templateLayer.fontFamily"

// ✅ CORRECT - Complex logic extracted to utility functions
function extractFontFamily(layerData: FlatLayerData | undefined): string | undefined {
  // Complex extraction logic here
  return layerData?.font?.family
}
```

**Enforcement:**
- Rendering components can do **simple fallbacks** (`layerData?.prop ?? templateLayer.prop`)
- Fallback chains **MUST be identical** in Svg.vue and svg-string-generator.ts
- Use `??` not `||` (preserves "none" values)
- Extract complex logic to utils/ functions (calculateX, extractX, shouldX)
- Store handles data merging, URL sync, and state management

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

### NEVER Skip Git Hooks (ABSOLUTE RULE)
**Pre-commit hooks MUST run on every commit. Bypassing hooks is FORBIDDEN.**

```bash
# ❌ ABSOLUTELY FORBIDDEN - NEVER bypass hooks
git commit --no-verify -m "message"
git commit -n -m "message"  # Same as --no-verify
git push --no-verify

# ✅ CORRECT - Let hooks run
git add . && git commit -m "message"
# Hooks run automatically:
# 1. ESLint auto-fixes code
# 2. Tests run to verify nothing broke
# 3. Commit succeeds only if hooks pass
```

**Why this matters:**
- Pre-commit hooks catch bugs BEFORE they enter git history
- Hooks enforce code quality (linting, testing) automatically
- Bypassing hooks = shipping broken code = production bugs
- If hooks fail, it means your code has issues that MUST be fixed

**If hooks fail:**
1. ✅ **Read the error message** - hooks tell you exactly what's wrong
2. ✅ **Fix the issue** - update code to pass linting/tests
3. ✅ **Commit again** - hooks will pass this time
4. ❌ **NEVER use --no-verify** - this hides problems, doesn't fix them

**Common hook failures and fixes:**
```bash
# ESLint errors → Fix linting issues
npm run lint

# Test failures → Fix broken tests
npm run test:run

# Build errors → Fix TypeScript/build issues
npm run build
```

**Emergency exceptions (RARE):**
- Only use --no-verify if explicitly requested by the user
- Document WHY hooks were skipped in commit message
- Fix issues in immediate follow-up commit
- This should happen < 1% of the time

**Remember:** Hooks exist to help you, not slow you down. They catch mistakes before they become problems.

### Property Rendering Tests (CRITICAL)
**ALL form properties MUST work in ALL 4 rendering contexts:**

1. **Main SVG preview** (Svg.vue)
2. **Template selection icons** (TemplateSelector.vue)
3. **Download preview** (Service Worker .svg URL)
4. **Download files** (exported SVG/PNG)

**Testing Requirements:**
- **When adding a new property**: Add test to `property-rendering.test.ts`
- **When a property doesn't work in any context**: Add failing test that reproduces the issue BEFORE fixing
- **Test MUST verify**: Property flows through entire data pipeline (form → store → all 4 renderers)

**Example test structure:**
```typescript
it('should render NEW_PROPERTY in SVG string generator', () => {
  const layers = [{ id: 'test-layer', NEW_PROPERTY: 'value' }]
  const svg = generateSvgString(template, layers)

  // Verify property is applied
  expect(svg).toContain('expected-output')
  expect(svg).not.toContain('template-default') // Not default
})
```

**Why this matters:**
- Properties have failed silently in download contexts before
- Prevents "works in preview but not in download" bugs
- Ensures template selector icons show correct colors/styling
- Guards against property name normalization regressions

### Rendering Logic Synchronization (CRITICAL)
**ALL rendering contexts MUST use identical logic. Font embedding is the ONLY allowed difference.**

**The 4 Rendering Contexts:**

| Context | File | Font Handling |
|---------|------|---------------|
| **Main Preview** | `Svg.vue` | Browser loads fonts (no embedding) |
| **Template Icons** | `svg-string-generator.ts` | Embeds Google Fonts CSS |
| **Download Preview** | `svg-string-generator.ts` | Embeds Google Fonts CSS |
| **Download Files** | `svg-string-generator.ts` | Embeds Google Fonts CSS |

**Enforcement Rules:**

1. **Shape rendering logic MUST be identical**
   ```typescript
   // ✅ CORRECT - Same shouldRenderShape() in both files
   // Svg.vue and svg-string-generator.ts
   function shouldRenderShape(templateLayer, layerData) {
     const fill = layerData?.fillColor ?? templateLayer.fillColor
     const stroke = layerData?.strokeColor ?? templateLayer.strokeColor
     const hasFill = fill !== undefined && fill !== 'none'
     const hasStroke = stroke !== undefined && stroke !== 'none'
     return hasFill || hasStroke
   }

   // ❌ FORBIDDEN - Different conditions in different files
   // Svg.vue: v-if="layer.fill || layer.stroke"
   // svg-string-generator.ts: if (!hasFill && !hasStroke) return ''
   ```

2. **Property fallback chains MUST be identical**
   ```typescript
   // ✅ CORRECT - Same everywhere
   :fill="layerData?.fillColor ?? templateLayer.fillColor"
   :stroke="layerData?.strokeColor ?? templateLayer.strokeColor"

   // ❌ FORBIDDEN - Different operators
   :fill="layerData?.fillColor || templateLayer.fillColor"  // Wrong: || breaks 'none'

   // ❌ FORBIDDEN - Different property names
   :fill="layerData?.fill ?? templateLayer.fill"  // Wrong: not normalized
   ```

3. **When modifying rendering logic:**
   - ✅ Update `Svg.vue` (main preview)
   - ✅ Update `svg-string-generator.ts` (downloads/icons)
   - ✅ Run `npm run test:run` to verify property-rendering tests
   - ✅ Manually verify all 4 contexts work

4. **Common pitfalls:**
   - Using old property names (`fill`/`stroke` instead of `fillColor`/`strokeColor`)
   - Using `||` instead of `??` (breaks "none" values)
   - Copy-pasting old code without checking current patterns

**Red flags indicating divergence:**
- ❌ "Stripes show in download but not in editor"
- ❌ "Template icons don't match editor colors"
- ❌ "Downloaded file looks different from preview"
- ❌ "Property works in main app but not exported SVG"

**Debugging divergence:**
1. Compare `Svg.vue` and `svg-string-generator.ts` rendering logic
2. Look for different v-if conditions, property names, operators
3. Add test to `property-rendering.test.ts` reproducing the bug
4. Apply same fix to BOTH files
5. Verify all 4 contexts work

### Singleton Component Enforcement
**If a rendering component exists, REUSE it. Never create duplicates or alternatives.**

**Why this matters:**
- Duplicates diverge over time, causing "works here but not there" bugs
- Maintenance nightmare - every fix must be applied to multiple files
- Example: The old duplicate Svg.vue component diverged from SvgContent.vue (now consolidated into Svg.vue)

**Enforcement:**
```typescript
// ❌ FORBIDDEN - Creating duplicate renderer
// Scenario: Svg.vue exists
// Action: Create new "SvgAlt.vue" as alternative
// Result: Divergence, bugs, maintenance hell

// ✅ CORRECT - Reuse existing component
// Scenario: Svg.vue exists
// Action: Use Svg.vue everywhere
// If needed: Add props to support new use case
```

**Before creating a new component:**
1. Search for existing similar components (Grep/Glob)
2. Can existing component handle your use case with props?
3. Ask: "Why can't I reuse the existing one?"
4. Only create new if absolutely necessary AND document why

**Red flags:**
- Multiple components doing similar rendering
- Component names with "Alt", "New", "V2", "Legacy"
- Copy-pasted component code with "minor tweaks"
- Comments like "// TODO: merge with OtherComponent.vue"

**Current singleton components:**
- **SVG Rendering**: `Svg.vue` (main preview, used inside SvgViewport.vue)
- **SVG String Generation**: `svg-string-generator.ts` (downloads, template icons)

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
**Shared constants live in centralized locations. Single-use values can stay inline.**

```typescript
// ❌ FORBIDDEN - Same constant duplicated across multiple files
// File 1: const MAX_ZOOM = 50
// File 2: const MAX_ZOOM = 50
// File 3: max="50"
// Result: Hard to update, easy to drift

// ✅ CORRECT - Define shared constants in utils/ui-constants.ts
export const ZOOM_CONFIG = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 50,
  ZOOM_STEP: 0.1
} as const

export const UI_COLORS = {
  PRIMARY_BLUE: '#3b82f6',
  SUCCESS_GREEN: '#059669'
} as const

// Then import and use everywhere
import { ZOOM_CONFIG, UI_COLORS } from './utils/ui-constants'
```

**What MUST be centralized:**
- ✅ **Shared/reused values** - Used in 2+ files (zoom limits, common colors)
- ✅ **Configuration** - App behavior settings (font loading, pagination)
- ✅ **Dropdown options** - STROKE_LINEJOIN_OPTIONS, FONT_WEIGHTS
- ✅ **Magic numbers** - Non-obvious values that need explanation

**What CAN stay inline:**
- ✅ **Single-use CSS** - Colors in `<style scoped>` blocks used once
- ✅ **Input placeholders** - `placeholder="#000000"` in single input
- ✅ **Obvious values** - `border-radius: 50%` for circles
- ✅ **Component-specific** - Layout values unique to one component

**See `utils/ui-constants.ts` for examples:**
- `PRESET_COLORS` - Color palette (35 colors)
- `FONT_LOADING_CONFIG` - Lazy loading settings
- `STROKE_LINEJOIN_OPTIONS` - SVG stroke options
- `ZOOM_CONFIG` - Zoom limits and steps (add if using magic numbers)

**Decision criteria:**
1. **Is it used in 2+ files?** → Centralize it
2. **Is it non-obvious/magic?** → Centralize with explanation
3. **Might it change globally?** → Centralize it
4. **Single-use UI style?** → Can stay inline

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
- **Store**: Data merging, URL sync, state management
- **Forms**: Display FormData[], emit changes
- **SVG Renderers**: Simple fallback chains (`layerData?.prop ?? templateLayer.prop`)
- **Complex Logic**: Extracted to utils/ functions (extractX, calculateX, shouldX)

## 📂 Project Structure

```
app/
├── src/
│   ├── stores/
│   │   └── urlDrivenStore.ts       # URL-driven state management
│   ├── components/
│   │   ├── Svg.vue                 # Main SVG renderer (simple fallbacks)
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
**CRITICAL: Filename case must be consistent across the codebase. Use `git mv` for all renames.**

| File Type | Pattern | Case | Examples |
|-----------|---------|------|----------|
| **Stores** | `*Store.ts` | camelCase + suffix | `urlDrivenStore.ts`, `svgStore.ts`, `keyboardStore.ts` |
| **Utils** | `*-utils.ts` or `*.ts` | kebab-case | `font-embedding.ts`, `svg-transforms.ts`, `url-encoding.ts` |
| **Composables** | `use*.ts` | camelCase | `useSvgCentering.ts`, `useTemplateHelpers.ts`, `useFontSelector.ts` |
| **Components** | `*.vue` | PascalCase | `Modal.vue`, `DownloadModal.vue`, `FontSelector.vue` |
| **Config** | `*.ts` | kebab-case | `template-loader.ts`, `svg-library-loader.ts`, `fonts.ts` |
| **Types** | `*-types.ts` | kebab-case | `template-types.ts`, `svg-types.ts` |
| **Tests** | `*.test.ts` | Match source file | `font-embedding.test.ts`, `svg-transforms.test.ts` |

**Enforcement Rules:**
```bash
# ✅ CORRECT - Stores use camelCase + Store suffix
stores/urlDrivenStore.ts
stores/svgStore.ts
stores/keyboardStore.ts

# ❌ WRONG - Inconsistent naming
stores/url-driven-store.ts  # kebab-case not allowed for stores
stores/svg-store.ts         # kebab-case not allowed for stores
stores/keyboard.ts          # missing Store suffix

# ✅ CORRECT - Utils use kebab-case
utils/font-embedding.ts
utils/svg-transforms.ts
utils/url-encoding.ts

# ❌ WRONG - Inconsistent naming
utils/fontEmbedding.ts      # camelCase not allowed for utils
utils/svgTransforms.ts      # camelCase not allowed for utils

# ✅ CORRECT - Composables use camelCase with use prefix
composables/useSvgCentering.ts
composables/useTemplateHelpers.ts

# ❌ WRONG - Inconsistent naming
composables/use-svg-centering.ts  # kebab-case not allowed for composables
composables/svgCentering.ts       # missing use prefix
```

### Consistency Rules
1. **Same feature = same prefix**: All SVG-related → `svg-*`, all font-related → `font-*`
2. **Same verb for same operation**: Calculating bounds always uses `calculate`, never `get`/`find`/`compute`
3. **No abbreviations**: Write `transform` not `xform`, `coordinate` not `coord`
4. **CamelCase for functions**: `calculateBounds()` not `calculate_bounds()`
5. **File renaming**: Always use `git mv old-name new-name` to preserve git history
6. **Test naming**: Tests must match source filename with `.test.ts` suffix

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
