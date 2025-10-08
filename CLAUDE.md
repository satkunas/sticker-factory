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

### Function Naming
- `calculate*()` - Mathematical computations
- `resolve*()` - Coordinate/percentage resolution
- `extract*()` - Data extraction from objects
- `generate*()` - Creation of new data structures
- `analyze*()` - Analysis returning metadata
- `filter*()` - Array filtering
- `should*()` - Boolean checks

### File Naming
- `*-utils.ts` - Pure utility functions
- `*-types.ts` - TypeScript type definitions
- `use*.ts` - Vue composables
- `*Store.ts` - Pinia stores

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
