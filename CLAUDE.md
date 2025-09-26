# Sticker Factory - SVG Badge Generator

A Vue 3 single-page application for creating custom SVG badges and stickers with multiple templates and font styling options.

## 🚨 CRITICAL: NEVER USE HARDCODED VALUES

### ABSOLUTE PROHIBITION ON HARDCODED VALUES
**NEVER EVER EVER use hardcoded values or percentages in pan, zoom, or SVG calculation logic. ALL calculations MUST be based on actual dimensions, zoom levels, and container measurements.**

#### ❌ FORBIDDEN Patterns:
```typescript
// NEVER DO THIS - Hardcoded values
const maxPanX = 300  // ❌ FORBIDDEN
const viewportPadding = 120  // ❌ FORBIDDEN
const zoomConstraint = 0.8  // ❌ FORBIDDEN
const scaleFactor = 1.2  // ❌ FORBIDDEN

// NEVER DO THIS - Hardcoded percentages
if (scaledWidth > containerWidth * 0.7) { }  // ❌ FORBIDDEN
const constraint = availableSpace * 0.9  // ❌ FORBIDDEN
```

#### ✅ REQUIRED Patterns:
```typescript
// ALWAYS DO THIS - Calculate from actual dimensions
const scaledTemplateWidth = templateSize.width * currentZoom
const scaledTemplateHeight = templateSize.height * currentZoom
const availableWidth = containerRect.width - controlsWidth
const availableHeight = containerRect.height - controlsHeight

// Calculate overflow based on actual content vs container
const overflowX = Math.max(0, (scaledTemplateWidth - availableWidth) / 2)
const overflowY = Math.max(0, (scaledTemplateHeight - availableHeight) / 2)

// Calculate background pan based on actual space difference
const backgroundPanX = Math.max(0, (availableWidth - scaledTemplateWidth) / 2)
const backgroundPanY = Math.max(0, (availableHeight - scaledTemplateHeight) / 2)

// Use real measurements for constraints
const maxPanX = Math.max(overflowX, backgroundPanX)
const minPanX = -maxPanX
```

#### Pan & Zoom Constraint Requirements:
1. **Dynamic Calculation**: All constraints MUST be recalculated on every zoom change
2. **Actual Dimensions**: Use template.viewBox.width/height * zoomLevel for content size
3. **Real Container Size**: Use containerElement.getBoundingClientRect() for available space
4. **No Magic Numbers**: Every numeric value MUST be derived from measurements
5. **Background Grid Access**: Allow panning to edges of background grid without whitespace
6. **Zoom-Responsive**: Higher zoom = more pan range, lower zoom = less pan range

#### CRITICAL Enforcement Rules:
- **Code Review**: Any PR with hardcoded values will be immediately rejected
- **Testing**: All pan/zoom functionality MUST work across zoom levels 0.1x to 10x
- **Documentation**: All calculation logic MUST include comments explaining the derivation
- **Debugging**: When debugging, log actual calculated values, never assume reasonableness

#### 🚨 MANDATORY: NO DISGUISED HARDCODED VALUES
**NEVER use "configurable factors" or "parameters" that are actually hardcoded values in disguise:**

❌ **FORBIDDEN - Disguised Hardcoded Values:**
```typescript
// NEVER DO THIS - These are still hardcoded values!
const DEFAULT_FACTORS = {
  gridExtensionFactor: 0.6,     // ❌ FORBIDDEN - Still hardcoded
  panLimitFactor: 1.2,          // ❌ FORBIDDEN - Still hardcoded
  marginFactor: 0.85            // ❌ FORBIDDEN - Still hardcoded
}

function calculateConstraints(template, container, factors = DEFAULT_FACTORS) {
  const constraint = containerWidth * factors.gridExtensionFactor  // ❌ FORBIDDEN
}
```

✅ **REQUIRED - Measured Values Only:**
```typescript
// ALWAYS DO THIS - Calculate from actual measurements
function calculateConstraints(template, container, zoomLevel) {
  // Calculate based on actual container size
  const gridVisibilitySpace = containerWidth / 2
  const contentOverflow = Math.max(0, (scaledWidth - containerWidth) / 2)
  const constraintSpace = Math.max(contentOverflow, gridVisibilitySpace)
}
```

#### 🚨 MANDATORY: VISUAL VERIFICATION PROTOCOL
**NEVER EVER make changes to SVG utilities, pan/zoom logic, or UI components without explicit user verification:**

❌ **FORBIDDEN - Assuming Changes Work:**
```typescript
// Changed pan constraint calculation
// (continues without asking user to verify)
```

✅ **REQUIRED - Always Request Manual Testing:**
```typescript
// Changed pan constraint calculation
//
// 🚨 CRITICAL: Manual User Verification Required
// Please test the following zoom levels and confirm:
// - 25% zoom: Test panning in all directions
// - 100% zoom: Test panning in all directions
// - 200% zoom: Test panning in all directions
// - 400% zoom: Test panning in all directions
//
// Please respond with ✅ PASS, ❌ FAIL, or 🤔 PARTIAL
```

**WHEN Manual Verification is MANDATORY:**
- ANY modification to `src/utils/svg.ts`, `src/utils/pan-constraints.ts`
- ANY changes to `src/composables/useZoomPan.ts`, `src/composables/useDragInteraction.ts`, `src/composables/useSvgInteraction.ts`
- ANY updates to `src/components/SvgViewer.vue`, `src/components/SvgCanvas.vue`, `src/components/ZoomPanControls.vue`
- Template system modifications affecting positioning or rendering
- Pan/zoom constraint changes or mathematical calculations
- Visual layout adjustments affecting user interaction

### Examples of Correct Implementation:
```typescript
// ✅ CORRECT: Pan constraint calculation
const calculatePanConstraints = (template, container, zoom) => {
  // Get actual template dimensions at current zoom
  const scaledWidth = template.viewBox.width * zoom
  const scaledHeight = template.viewBox.height * zoom

  // Get actual container dimensions (measured, not assumed)
  const containerRect = container.getBoundingClientRect()
  const availableWidth = containerRect.width - MEASURED_CONTROLS_WIDTH
  const availableHeight = containerRect.height - MEASURED_CONTROLS_HEIGHT

  // Calculate actual overflow (content larger than container)
  const overflowX = Math.max(0, (scaledWidth - availableWidth) / 2)
  const overflowY = Math.max(0, (scaledHeight - availableHeight) / 2)

  // Calculate background access (container larger than content)
  const backgroundX = Math.max(0, (availableWidth - scaledWidth) / 2)
  const backgroundY = Math.max(0, (availableHeight - scaledHeight) / 2)

  // Use the larger constraint to allow proper panning
  return {
    maxX: Math.max(overflowX, backgroundX),
    minX: -Math.max(overflowX, backgroundX),
    maxY: Math.max(overflowY, backgroundY),
    minY: -Math.max(overflowY, backgroundY)
  }
}
```

---

## Project Structure

```
sticker-factory/
├── app/                    # Vue 3 SPA
│   ├── src/
│   │   ├── stores/         # Pinia store for state management
│   │   │   └── index.ts    # Main store with localStorage integration
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Vue 3 composables for reusable logic
│   │   │   ├── useZoomPan.ts        # Zoom/pan state management (NO HARDCODED VALUES!)
│   │   │   ├── useDragInteraction.ts # Mouse drag handling (CALCULATED CONSTRAINTS!)
│   │   │   └── useSvgInteraction.ts  # Combined SVG interactions
│   │   ├── utils/          # Pure TypeScript utilities
│   │   │   └── svg.ts      # SVG calculation and processing utilities
│   │   ├── config/         # Configuration files
│   │   │   ├── fonts.ts    # Font definitions and loading
│   │   │   └── template-loader.ts  # Template processing
│   │   ├── types/          # TypeScript type definitions
│   │   ├── test/           # Comprehensive test suite
│   │   │   └── svg.test.ts # SVG utilities testing (85+ tests)
│   │   ├── main.ts         # App entry point
│   │   ├── App.vue         # Root component
│   │   └── style.css       # Global styles with Tailwind
│   ├── templates/          # YAML template definitions
│   ├── public/             # Static assets
│   ├── dist/               # Built app files (generated)
│   ├── index.html          # HTML template
│   └── package.json        # App dependencies
├── server.js               # Express static server
├── package.json            # Root workspace config
├── Makefile               # Build and development commands
├── vite.config.js         # Vite build configuration
└── .eslintrc.js           # ESLint configuration
```

## 🧠 Memory-Bank MCP Server Integration

Claude has access to a memory-bank MCP server that stores comprehensive project documentation and development patterns. This provides persistent context across sessions.

### Available Documentation
The memory-bank contains detailed reference documentation for:
- **Font System Reference** - Current implementation status, configuration patterns
- **Template System Reference** - Template architecture and processing patterns
- **Development Workflow** - Git strategies, commit patterns, quality assurance
- **Font Management Strategy** - Font loading, caching, and optimization patterns
- **Template Storage Strategy** - Template processing and state management
- **Project Overview** - High-level architecture and component relationships

### Using Memory-Bank for Development
```bash
# Claude can access stored documentation via MCP tools:
# - mcp__memory-bank__list_projects
# - mcp__memory-bank__list_project_files
# - mcp__memory-bank__memory_bank_read
# - mcp__memory-bank__memory_bank_write
# - mcp__memory-bank__memory_bank_update
```

### Memory-Bank Guidelines for Claude

#### When to Reference Memory-Bank
- **New session starts** - Load project context and current implementation status
- **Complex feature development** - Review architecture patterns and best practices
- **Bug investigation** - Check known patterns and previous solutions
- **Code refactoring** - Verify existing patterns before making changes
- **Quality assurance** - Reference testing and validation requirements

#### What's Stored in Memory-Bank
- **Current Implementation Status** - Up-to-date state of major features
- **Development Patterns** - Proven approaches for this specific codebase
- **Testing Requirements** - Quality standards and validation procedures
- **Architecture Decisions** - Component design and integration patterns
- **Performance Guidelines** - Optimization strategies specific to this application

#### Memory-Bank vs CLAUDE.md
- **Memory-Bank**: Detailed technical reference, implementation patterns, current status
- **CLAUDE.md**: Development workflow, commands, debugging procedures, general guidelines

#### Updating Memory-Bank Documentation
When significant changes are made to the project:
1. **Update relevant memory-bank files** with new implementation details
2. **Document new patterns** for future development reference
3. **Update status information** to reflect current capabilities
4. **Add lessons learned** from complex implementations

### Memory-Bank Project Structure
```
sticker-factory/
├── development-workflow.md      # Git workflow, commit strategy, QA commands
├── font-management-strategy.md  # Font loading, caching, optimization patterns
├── font-system-reference.md     # Current font implementation status
├── project-overview.md          # High-level architecture overview
├── template-storage-strategy.md # Template processing and state management
└── template-system-reference.md # Template implementation details
```

### Integration Benefits
- **Session Continuity** - Maintain context across multiple development sessions
- **Pattern Consistency** - Apply proven patterns from previous successful implementations
- **Quality Maintenance** - Reference established standards and requirements
- **Efficient Onboarding** - Quick context loading for complex development tasks

## 🛠️ Development Commands

### Git Workflow Commands
```bash
# Start new feature work
git checkout main && git pull origin main
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name

# Make incremental commits during development
git add .
git commit -m "feat: descriptive commit message"
git push origin feature/your-feature-name

# Integration and cleanup
git checkout main && git pull origin main
git checkout feature/your-feature-name && git rebase main
npm run test:run && npm run lint && npm run build
git checkout main && git merge feature/your-feature-name
git push origin main && git branch -d feature/your-feature-name
```

### Running the Application

#### ⚠️ IMPORTANT: Single Dev Server Policy
**CRITICAL: Only run ONE development server at a time to avoid port conflicts and ensure both Claude and user reference the same instance.**

Before starting a new dev server:
```bash
# Kill any existing dev servers
pkill -f "vite|npm.*dev"
# Or check for running processes
lsof -i :3000
```

#### Development Commands
```bash
# Start development server (ONLY ONE AT A TIME)
npm run dev

# Start development server and open browser
make dev

# Install dependencies
make install

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

#### Dev Server Management
- **Default Port**: http://localhost:3000
- **Always verify**: Only ONE server is running before starting development
- **If port conflict**: Kill existing processes or use different port
- **Claude Usage**: Always check existing servers before starting new ones
- **User Coordination**: Confirm which server instance is being used for testing

### Quality Assurance
```bash
# Run all quality checks (used by pre-commit hooks)
npm run test:run
npm run lint
npm run type-check
npm run build

# Combined quality check
npm run test:run && npm run lint && npm run type-check && npm run build
```

## 🔄 Git Workflow & Development Process

### Core Development Principles
- **Always create feature branches** for any development work
- **Never work directly on main branch**
- **One logical change per commit** with descriptive messages
- **Incremental commits** as you progress through implementation
- **Regular integration** with main branch to avoid conflicts

### 📋 Feature Branch Development

#### Branch Creation and Naming
```bash
# Always start from main branch
git checkout main
git pull origin main

# Create feature branch with descriptive name
git checkout -b feature/add-svg-image-support
git checkout -b fix/coordinate-system-alignment
git checkout -b refactor/template-loading-performance
git checkout -b docs/update-development-workflow

# Push branch to remote immediately
git push -u origin feature/add-svg-image-support
```

#### Branch Naming Conventions
- `feature/` - New functionality or enhancements
- `fix/` - Bug fixes and corrections
- `refactor/` - Code improvements without behavior changes
- `docs/` - Documentation updates
- `test/` - Test additions or improvements
- `chore/` - Maintenance tasks (dependencies, config, etc.)

### 🏗️ Incremental Commit Strategy

#### Step-by-Step Development Workflow
```bash
# 1. Plan your work (create todo list, identify steps)
# 2. Start with basic structure/scaffolding
git add .
git commit -m "feat: add basic SVG image component structure

- Create ExpandableSvgSelector.vue component shell
- Add SvgLibraryItem interface definition
- Set up basic template structure with search input

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Implement core functionality piece by piece
git add src/components/ExpandableSvgSelector.vue
git commit -m "feat: implement SVG library loading and filtering

- Add loadSvgLibrary() integration
- Implement search functionality with real-time filtering
- Add category-based filtering with preset buttons
- Display loading states and empty states

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Continue with incremental commits...
```

#### Commit Message Format
```
<type>: <description>

<detailed explanation if needed>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:**
- `feat:` - New features or functionality
- `fix:` - Bug fixes
- `refactor:` - Code refactoring without behavior changes
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Maintenance tasks

## SVG Utilities Library

### Overview
The project features a comprehensive SVG utilities library (`src/utils/svg.ts`) that centralizes all SVG-related calculations, transformations, and processing operations. This pure TypeScript library provides framework-agnostic functions with comprehensive testing and documentation.

### Architecture Principles
- **Pure TypeScript Functions**: No Vue reactivity (refs, computed, onMount) or framework dependencies
- **Mathematical Precision**: Accurate calculations for zoom, pan, scale, and coordinate transformations
- **NO HARDCODED VALUES**: All calculations derived from actual measurements
- **Comprehensive Testing**: 85+ unit tests with 100% code coverage using Vitest
- **JSDoc Documentation**: Full documentation for all functions with parameters and return types
- **Type Safety**: Complete TypeScript interfaces and type definitions
- **Performance Optimized**: Efficient algorithms for real-time SVG operations

### Core Utility Categories

#### 1. Mathematical Calculations (`src/utils/svg.ts:25-89`)
Mathematical utilities for zoom, pan, and scale operations:

```typescript
// Zoom level calculation with constraints
calculateZoomLevel(currentZoom: number, delta: number, isTrackpad?: boolean): number

// Pan offset calculation with boundary checking
calculatePanOffset(currentOffset: Point, delta: Point, constraints?: PanConstraints): Point

// Optimal scale calculation for SVG fitting
calculateOptimalScale(svgDimensions: Dimensions, containerDimensions: Dimensions): number

// Distance calculation between two points
calculateDistance(point1: Point, point2: Point): number

// Angle calculation between two points (in radians)
calculateAngle(point1: Point, point2: Point): number
```

#### 2. Transform String Generation (`src/utils/svg.ts:91-128`)
SVG transform string utilities for consistent formatting:

```typescript
// Generate SVG transform matrix string
generateTransformString(zoom: number, panX: number, panY: number): string

// Generate CSS transform string for DOM elements
generateCssTransformString(zoom: number, panX: number, panY: number): string

// Combine multiple transforms into single string
combineTransforms(transforms: string[]): string

// Parse transform string into component values
parseTransformString(transform: string): TransformComponents
```

### Constants and Configuration

```typescript
export const SVG_CONSTANTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 10.0,
  ZOOM_STEP: 0.1,
  WHEEL_ZOOM_STEP: 0.2,
  TRACKPAD_ZOOM_STEP: 0.05,
  PAN_STEP: 10
} as const;
```

### Testing Requirements

#### Test Coverage Standards
- **Minimum Coverage**: 95% line coverage for all SVG utilities
- **Test Categories**: 6 main test suites matching utility categories
- **Test Types**: Unit tests, integration tests, edge cases, error handling
- **Property-based Testing**: Mathematical functions with multiple input ranges

#### Running Tests
```bash
# Run all tests including SVG utilities
npm test

# Run only SVG utility tests
npm test src/test/svg.test.ts

# Run tests with coverage report
npm run test:coverage
```

## Technology Stack

### Frontend
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Pinia** for state management
- **LocalStorage** for data persistence
- **Tailwind CSS** for styling
- **Google Fonts** integration

### Backend
- **Express.js** static file server
- **Node.js** runtime

### Development Tools
- **ESLint** for Vue 3 + TypeScript
- **PostCSS** with Autoprefixer
- **Makefile** for command management

## Quick Start

```bash
# Install dependencies
make install

# Start development server
make dev

# Build for production
make build

# Start production server
make start
```

## Features

### Template System
- **14 Professional Templates** across 4 categories:
  - **Circle**: Quality sticker, vinyl record label, event promo sticker
  - **Rectangle**: Business card, conference badge, booklet cover, catalog page, shipping label, food packaging, concert ticket, YouTube thumbnail
  - **Square**: Social media post
  - **Diamond**: Safety warning diamond

- **Multi-text Input Support**: Templates can contain multiple text fields with individual styling
- **Shape Styling System**: Full customization of template shapes (fill, stroke, width, linejoin)
- **YAML-based Configuration**: Easy to create and modify templates

### Typography & Styling
- **600+ Google Fonts** organized by category
- **Individual Text Styling**: Each text field supports:
  - Font family selection
  - Font size (8-500px)
  - Font weight (100-900)
  - Text color picker
  - Stroke width and color
- **Shape Styling**: Each template shape supports:
  - Fill color with preset palette and custom picker
  - Stroke color with preset palette and custom picker
  - Stroke width (0-12px) with slider and number input
  - Stroke linejoin (round, miter, bevel, arcs, clip)
- **Real-time Preview**: All styling changes reflect immediately in SVG

### User Experience
- **Accordion Interface**: Expandable font selectors for each text field
- **Shape Styling Panels**: Expandable shape customization with visual previews
- **Template Persistence**: Selected template, text, and shape styling restored on page reload
- **Export/Import**: Save and load badge configurations as JSON
- **Download Options**: Export as SVG or PNG files
- **Responsive Design**: Works on desktop and mobile devices

## Available Commands

### Development
- `make dev` - Start Vite development server
- `make dev-open` - Start development server and open browser

### Production
- `make build` - Build for production
- `make start` - Start Express static server
- `make start-open` - Start production server and open browser

### Code Quality
- `make lint` - Run ESLint
- `make lint-fix` - Auto-fix ESLint issues

### Maintenance
- `make clean` - Clean all build artifacts and dependencies
- `make install` - Install all dependencies

### Utilities
- `make open` - Open app in browser (http://localhost:3000)
- `make help` - Show all available commands

## Template System & SVG Coordinate System

### Template Structure

Templates are YAML files in `app/templates/` with this structure:

```yaml
name: "Template Display Name"
id: "template-id"
description: "Brief description"
category: "circle|square|rectangle|diamond"
layers:
  - id: "shape-id"
    type: "shape"
    subtype: "circle|rect|polygon"
    position: { x: 50, y: 50 }
    width: 200
    height: 200
    fill: "#color"
    stroke: "#color"
    strokeWidth: 2

  - id: "text-id"
    type: "text"
    label: "Form Label"
    default: "Default Text"
    position: { x: 50, y: 50 }
    maxLength: 20
    fontFamily: "Font Name"
    fontSize: 16
    fontWeight: 400
    fontColor: "#color"
```

### SVG Coordinate System

**🚨 CRITICAL: Text positioning uses CENTER COORDINATES**

The template system supports both **percentage-based** and **absolute** coordinate positioning for intuitive and responsive design.

#### Percentage Coordinates (Recommended)

Use percentage strings for intuitive positioning that adapts to any viewBox size:

```yaml
position: { x: "50%", y: "50%" }    # Exact center
position: { x: "0%", y: "0%" }      # Top-left corner
position: { x: "100%", y: "100%" }  # Bottom-right corner
position: { x: "25%", y: "75%" }    # Quarter from left, three-quarters down
position: { x: "-10%", y: "110%" }  # Outside viewBox boundaries
```

## State Management

### Store Architecture
- **Pinia Store** (`src/stores/index.ts`) manages global state
- **LocalStorage Integration** with automatic persistence
- **Multi-text Input System** with individual styling per text field
- **Shape Styling System** with individual styling per template shape
- **Template State** persists selected template, text data, and shape styling

### Data Persistence
```typescript
interface AppState {
  textInputs: TextInputState[]           // Array of text inputs
  shapeStyles: ShapeStyleState[]         // Array of shape styles
  selectedTemplateId: string | null      // Current template
  badgeColor: string                     // Background color
}

interface TextInputState {
  id: string                             // Template text layer ID
  text: string                           // User input
  font: FontConfig | null                // Selected font
  fontSize: number                       // Font size
  fontWeight: number                     // Font weight
  textColor: string                      // Text color
  strokeWidth: number                    // Stroke width
  strokeColor: string                    // Stroke color
  strokeOpacity: number                  // Stroke opacity
}

interface ShapeStyleState {
  id: string                             // Template shape layer ID
  fillColor: string                      // Shape fill color
  strokeColor: string                    // Shape stroke color
  strokeWidth: number                    // Shape stroke width
  strokeLinejoin: string                 // Stroke line join style
}
```

## Font System

### Font Configuration
- **600+ Google Fonts** across 6 categories
- **Dynamic Loading** with CSS links and font-display: swap
- **Weight Validation** - only shows available weights per font
- **Fallback Handling** for loading failures

### Font Categories
- Sans-serif (Roboto, Open Sans, Nunito, etc.)
- Serif (Playfair Display, Merriweather, etc.)
- Monospace (JetBrains Mono, Source Code Pro, etc.)
- Display (Bebas Neue, Oswald, etc.)
- Handwriting (Dancing Script, Pacifico, etc.)
- Dingbats (Material Symbols, etc.)

## Component Architecture

### Key Components
- **App.vue** - Root component with dynamic form generation
- **SimpleTemplateSelector.vue** - Template selection dropdown
- **TextInputWithFontSelector.vue** - Individual text input with styling
- **ExpandableFontSelector.vue** - Font selection accordion
- **TemplateObjectStyler.vue** - Shape styling with expandable controls
- **SvgViewer.vue** - SVG rendering engine with pan/zoom (NO HARDCODED CONSTRAINTS!)
- **ExportModal.vue** - Export/download functionality

### Component Communication
- **Props/Emit** for parent-child communication
- **Provide/Inject** for font selector state management
- **Store** for global state and persistence

## 🏗️ Architecture Overview

### Component Hierarchy
```
App.vue
├── SimpleTemplateSelector.vue
├── TextInputWithFontSelector.vue (multiple instances)
│   └── ExpandableFontSelector.vue
│       └── FontTile.vue
├── SvgViewer.vue (with dynamic pan/zoom constraints)
├── ColorPicker.vue
├── ExportModal.vue
├── ImportModal.vue
└── DownloadModal.vue
```

### State Management
- **Pinia-style store** (`src/stores/index.ts`) for global state with localStorage persistence
- **Multi-text input system** with individual styling per text input
- **Template persistence** with automatic restoration on page load
- **Provide/Inject** for expandable font selector states
- **Props/Emit** pattern for component communication
- **localStorage persistence** for all form values, templates, and text input arrays

### Key Data Flow
1. User selects template → `SimpleTemplateSelector` → App updates `selectedTemplate`
2. Template selection triggers `store.initializeTextInputsFromTemplate()` → creates `textInputs[]` array
3. Dynamic form generation: App renders multiple `TextInputWithFontSelector` instances
4. Each text input manages its own: font, size, weight, color, stroke properties
5. User interactions update specific `textInputs[index]` via `store.updateTextInput()`
6. `SvgViewer` receives `textInputs` array and renders each with individual styling
7. Template and form data automatically persist to localStorage

## 🎯 Template System Architecture

### Flattened Layers Structure
```yaml
# New unified template format (app/templates/*.yaml)
name: "Square - Three Sections"
id: "square-3"
description: "Square with three horizontal sections"
category: "square"
layers:
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 50 }
    width: 200
    height: 200
    stroke: "#ea580c"
    strokeWidth: 2
    fill: "#f97316"
    zIndex: 1
  - id: "header"
    type: "textInput"
    label: "Header"
    position: { x: 50, y: 25 }
    maxLength: 10
    zIndex: 10
```

### Template Processing Pipeline
```typescript
// 1. YAML Template → SimpleTemplate (processed for rendering)
const template = await loadTemplate('square-3')

// 2. Extract text inputs from template
const textInputs = getTemplateTextInputs(template)

// 3. Initialize state for each text input
await store.initializeTextInputsFromTemplate(template)

// 4. Render ordered elements (shapes + text with proper zIndex)
const elements = getTemplateElements(template)
elements.sort((a, b) => a.zIndex - b.zIndex)
```

## 🐛 Debugging Tips

### Git-Based Debugging Workflow
- **Create debug branch**: `git checkout -b debug/investigate-font-loading`
- **Commit investigation changes**: Document findings with incremental commits
- **Test fixes incrementally**: One change per commit to isolate what works
- **Clean up debug work**: Merge successful fixes, discard failed attempts

### Font Loading Issues
- Check browser dev tools for CSS loading errors
- Verify Google Fonts API URLs in `fonts.ts`
- Test fallback fonts when Google Fonts fail
- **Debug commits**: Commit each configuration change to track what works

### State Management
- Use Vue Devtools to inspect Pinia store
- Check provide/inject context for font selector states
- Verify prop flow through component hierarchy
- **State debugging**: Create temporary logging commits to track state changes

### SVG Rendering
- Inspect SVG DOM for correct attribute values
- Check font-family, font-size, and font-weight attributes
- Test with different fonts and weights
- **Visual debugging**: Commit screenshot evidence with each attempted fix

### Pan/Zoom Debugging
- **NEVER assume**: Log all calculated constraint values
- **Test extreme cases**: 0.1x zoom, 10x zoom, tiny/huge templates
- **Verify measurements**: Use getBoundingClientRect() to confirm dimensions
- **Visual validation**: Take screenshots to confirm constraint behavior

## 🔍 Critical Visual Verification Protocol

### 🚨 MANDATORY: Manual User Verification for SVG/UI Changes
**ALL changes to SVG utilities, composables, or UI components MUST receive manual user confirmation before proceeding.**

#### When Manual Verification is Required:
- **Any modification to** `src/utils/svg.ts`, `src/utils/pan-constraints.ts`
- **Any changes to** `src/composables/useZoomPan.ts`, `src/composables/useDragInteraction.ts`, `src/composables/useSvgInteraction.ts`
- **Any updates to** `src/components/SvgViewer.vue`, `src/components/SvgCanvas.vue`, `src/components/ZoomPanControls.vue`
- **Template system modifications** affecting positioning or rendering
- **Pan/zoom constraint changes** or mathematical calculations
- **Visual layout adjustments** affecting user interaction

#### Required User Testing Protocol:

**Step 1: Zoom Level Testing**
*"Please test the following zoom levels and confirm each works correctly:"*
- **25% zoom:** Click zoom out repeatedly or drag slider to 0.25
- **50% zoom:** Drag slider to 0.5 or use controls to reach 50%
- **100% zoom:** Click reset zoom button or drag slider to 1.0
- **200% zoom:** Click zoom in repeatedly or drag slider to 2.0
- **300% zoom:** Continue zooming in to maximum comfortable level

**Step 2: Pan Testing at Each Zoom Level**
*"At each zoom level, please test panning in all directions:"*
- **Drag left:** Click and drag the SVG template as far left as possible
- **Drag right:** Click and drag the SVG template as far right as possible
- **Drag up:** Click and drag the SVG template as far up as possible
- **Drag down:** Click and drag the SVG template as far down as possible
- **Diagonal panning:** Try dragging to corners (top-left, top-right, bottom-left, bottom-right)

**Step 3: Background Grid Access Verification**
*"Please confirm you can access the background grid edges:"*
- **At 25% zoom:** "Can you see plenty of background grid around the small template?"
- **At 50% zoom:** "Can you drag far enough to see background grid edges in all directions?"
- **At 100% zoom:** "Does panning allow you to explore the full background area?"
- **At 200%+ zoom:** "Can you pan to see background grid despite the large template size?"

**Step 4: Visual Quality Check**
*"Please examine the visual behavior:"*
- **Smooth dragging:** "Does dragging feel smooth without jumping or sticking?"
- **No excessive whitespace:** "When you drag to edges, do you see appropriate background grid (not too much empty space)?"
- **Zoom responsiveness:** "Do the pan limits feel appropriate at different zoom levels?"
- **Template visibility:** "Is the template always accessible and not lost off-screen?"

**Step 5: User Feedback Collection**
*"Please respond with:"*
- **✅ PASS** - "All zoom levels and panning work as expected"
- **❌ FAIL** - "Issue found: [describe specific problem and zoom level]"
- **🤔 PARTIAL** - "Mostly works but [describe specific concern]"

#### Claude Protocol:
1. **NEVER proceed** without explicit user testing feedback
2. **WAIT for user response** before making additional changes
3. **ASK specific questions** about zoom levels and panning behavior
4. **PROVIDE clear instructions** for what to click, drag, and test
5. **REQUEST screenshots** if user reports issues
6. **ITERATE based on feedback** until user confirms ✅ PASS

### 📏 Enhanced SVG Analysis Methods

#### CRITICAL: Screenshots Miss Subtle Changes
**Screenshots alone are insufficient for precise SVG positioning and sizing verification.**

#### Required Multi-Method Analysis:
1. **Console Debug Output**: Add temporary console.log statements to log actual calculated values
   ```javascript
   console.log('Pan Constraints:', {
     scaledTemplateWidth, scaledTemplateHeight,
     viewportWidth, viewportHeight,
     overflowX, overflowY,
     backgroundPanX, backgroundPanY,
     maxPanX, minPanX, maxPanY, minPanY,
     zoomLevel: currentZoom
   });
   ```

2. **Browser Dev Tools Measurement**: Use element inspector to measure exact pixel dimensions
   - Right-click elements → Inspect Element
   - Check computed CSS width/height values
   - Compare measurements at different zoom levels

3. **Multi-State Comparison**: Test at extreme zoom levels to make differences obvious
   - 25% zoom (should show large viewport rectangle)
   - 100% zoom (baseline)
   - 400% zoom (should show very small viewport rectangle)
   - Document exact pixel measurements for each state

4. **User Feedback Verification**: Always ask user to confirm specific behaviors
   - "Can you pan to the edges of the background grid?"
   - "Does panning work differently at high vs low zoom levels?"
   - Never assume visual correctness from screenshots alone

## 🎨 Design Patterns

### Multi-Text Form Pattern
```vue
<!-- Dynamic form generation based on template -->
<div v-for="(textInput, index) in textInputs" :key="textInput.id" class="space-y-2">
  <FormLabel :text="`${getTextInputLabel(template, textInput.id)} ${textInputs.length > 1 ? '(' + (index + 1) + ')' : ''}`" />
  <TextInputWithFontSelector
    :model-value="textInput.text"
    :selected-font="textInput.font"
    :font-size="textInput.fontSize"
    :font-weight="textInput.fontWeight"
    :text-color="textInput.textColor"
    :text-stroke-width="textInput.strokeWidth"
    :text-stroke-color="textInput.strokeColor"
    :instance-id="`textInput-${index}`"
    @update:model-value="(text) => handleTextInputUpdate(index, text)"
    @update:selected-font="(font) => handleTextInputFontUpdate(index, font)"
    @update:font-size="(size) => handleTextInputFontSizeUpdate(index, size)"
    @update:font-weight="(weight) => handleTextInputFontWeightUpdate(index, weight)"
    @update:text-color="(color) => handleTextInputTextColorUpdate(index, color)"
    @update:text-stroke-width="(width) => handleTextInputStrokeWidthUpdate(index, width)"
    @update:text-stroke-color="(color) => handleTextInputStrokeColorUpdate(index, color)"
  />
</div>

<!-- Fallback for backward compatibility -->
<div v-if="(!textInputs || textInputs.length === 0) && selectedTemplate">
  <!-- Legacy single text input -->
</div>
```

## 💾 Local Storage Persistence

### Persistent State Management
- **All form values** automatically saved to localStorage on change
- **Restored on page reload** - seamless user experience
- **Version-aware storage** with migration support
- **Mutation-safe operations** with write queue system

### Storage Features
- **Automatic persistence** - No manual save/load needed
- **Error recovery** - Graceful fallback to defaults
- **Import/Export** - JSON format for backup/sharing
- **Cache optimization** - Load-on-demand pattern
- **Write queuing** - Prevents localStorage corruption

## 🎯 Component APIs

### TextInputWithFontSelector Props
```typescript
interface Props {
  modelValue: string
  placeholder?: string
  selectedFont?: FontConfig | null
  textColor?: string
  fontSize?: number
  fontWeight?: number
  instanceId?: string
}
```

### SvgViewer Props
```typescript
interface Props {
  template?: SimpleTemplate | null
  textInputs?: Array<TextInputState>
  shapeStyles?: Array<ShapeStyleState>
  previewMode?: boolean
}
```

## 📋 Testing Strategy

### Manual Testing Checklist

#### Pan/Zoom System (CRITICAL)
- [ ] Pan works at 0.1x zoom level (minimum)
- [ ] Pan works at 10x zoom level (maximum)
- [ ] Pan constraints adjust dynamically with zoom changes
- [ ] Can pan to edges of background grid at all zoom levels
- [ ] No excessive whitespace visible when panning
- [ ] Smooth drag interaction without jumping or sticking
- [ ] Zoom controls update pan constraints immediately

#### Template System
- [ ] Template selection saves to localStorage and restores on reload
- [ ] Dynamic form generation works for templates with multiple text inputs
- [ ] Template switching properly initializes new textInputs array
- [ ] zIndex ordering renders text above shapes

#### Multi-Text Input System
- [ ] Each text input has independent font selection
- [ ] Each text input has independent size control (8-500px)
- [ ] Each text input has independent weight selection
- [ ] Each text input has independent color picker
- [ ] Each text input has independent stroke width/color
- [ ] Form data persists across page reloads
- [ ] Multiple text inputs render correctly in SVG with individual styling

#### Core Functionality
- [ ] Font selection updates text input styling preview
- [ ] Font weight buttons show only available weights for selected font
- [ ] SVG viewer reflects all styling changes in real-time
- [ ] Mobile responsive design works with dynamic forms
- [ ] Export/import functionality works with new data structure

### Git-Integrated Testing Workflow
```bash
# Create testing branch for comprehensive verification
git checkout -b test/verify-latest-changes

# Run all quality checks
npm run test:run && npm run lint && npm run type-check && npm run build

# Document test results with commits
git add . && git commit -m "test: verify all manual testing checklist items pass"

# Merge back if all tests pass
git checkout main && git merge test/verify-latest-changes
git branch -d test/verify-latest-changes
```

## 🎨 Styling Guidelines

### CSS Architecture
- **Tailwind CSS** for utility-first styling
- **Component-scoped styles** where needed
- **Responsive design** with mobile-first approach
- **Consistent spacing** and color schemes

### Design Tokens
- **Colors**: Primary, secondary, accent palettes
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Consistent margin/padding scale
- **Animations**: Smooth transitions and interactions

## 🎯 Development Workflow Summary

### Key Principles
1. **Always use feature branches** - Never work directly on main
2. **Commit incrementally** - One logical change per commit
3. **Test before integration** - Quality checks must pass
4. **Document as you go** - Commit messages tell the story
5. **Clean up after merging** - Remove merged branches
6. **NEVER use hardcoded values** - All calculations must be derived from measurements

### Quick Reference Commands
```bash
# Start new work
git checkout main && git pull origin main
git checkout -b feature/your-feature-name

# Work incrementally
git add . && git commit -m "feat: descriptive message"

# Integrate safely
npm run test:run && npm run lint && npm run build
git checkout main && git merge feature/your-feature-name
git branch -d feature/your-feature-name
```

### Essential Tools
- **TodoWrite tool** for tracking implementation progress
- **Incremental commits** for safe, reviewable changes
- **Pre-commit hooks** for automatic quality assurance
- **Visual verification** with screenshots for UI changes
- **Branch-based debugging** for systematic problem solving
- **Console logging** for verifying calculated constraint values

## Server Configuration

### Development
- **Vite Dev Server**: http://localhost:3000 with HMR
- **Hot Module Replacement** for instant updates

### Production
- **Express Static Server**: http://localhost:3000
- **SPA Fallback** for client-side routing
- **Static File Serving** from `app/dist/`

## Shape Styling System

### TemplateObjectStyler Component
Provides comprehensive shape customization with an expandable interface:

#### Features
- **Visual Preview**: Shape preview showing current fill/stroke colors
- **Color Controls**: Fill and stroke color with preset palette + custom picker
- **Stroke Options**: Width slider (0-12px) and linejoin selection
- **Expandable Interface**: Click to expand/collapse styling controls
- **Real-time Updates**: Changes immediately reflected in SVG preview

#### Supported Shape Types
- **Rectangles** (rect) - Business cards, labels, badges
- **Circles** (circle) - Round stickers, record labels
- **Polygons** (polygon) - Custom shapes, starbursts, diamonds
- **Paths** - Complex SVG path definitions

#### Styling Properties
```typescript
interface ShapeStyle {
  fillColor: string      // Background color (#hex)
  strokeColor: string    // Border color (#hex)
  strokeWidth: number    // Border width (0-12px)
  strokeLinejoin: string // Corner style (round, miter, bevel, arcs, miter-clip)
}
```

#### Color Palette System
- **24 Preset Colors**: Carefully selected color palette
- **Custom Color Picker**: Native browser color picker integration
- **Hex Input**: Direct hex color code entry
- **Visual Feedback**: Selected colors highlighted with active state
- **Consistent Design**: Same palette used for text and shape styling

---

**Production Ready**: This application is fully functional with 14 professional templates, comprehensive font support, complete shape styling system, robust state management, and dynamically calculated pan/zoom constraints.

**Last Updated**: Anti-hardcoding guidelines and comprehensive documentation merge (2024)
**Maintainer**: Claude AI Assistant