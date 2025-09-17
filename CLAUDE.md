# Sticker Factory - SVG Badge Generator

A Vue 3 single-page application for creating custom SVG badges and stickers with multiple templates and font styling options.

## Project Structure

```
sticker-factory/
├── app/                    # Vue 3 SPA
│   ├── src/
│   │   ├── stores/         # Pinia store for state management
│   │   │   └── index.ts    # Main store with localStorage integration
│   │   ├── components/     # Vue components
│   │   ├── config/         # Configuration files
│   │   │   ├── fonts.ts    # Font definitions and loading
│   │   │   └── template-loader.ts  # Template processing
│   │   ├── types/          # TypeScript type definitions
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

**Percentage Reference System:**
- `"0%"` = Left edge / Top edge of viewBox
- `"50%"` = Horizontal center / Vertical center
- `"100%"` = Right edge / Bottom edge of viewBox
- `"-25%"` = 25% outside left/top boundary
- `"150%"` = 50% beyond right/bottom boundary

#### Absolute Coordinates (Legacy)

Traditional pixel-based positioning (fully backward compatible):

```yaml
position: { x: 200, y: 150 }        # Absolute pixel coordinates
```

#### Mixed Coordinate Systems

Combine percentage and absolute coordinates as needed:

```yaml
position: { x: "50%", y: 30 }       # Centered horizontally, 30px from top
position: { x: 100, y: "75%" }      # 100px from left, three-quarters down
```

#### Shape Positioning
- **Circles**: `position: {x: "50%", y: "50%"}` → Center of viewBox
- **Rectangles**: `position: {x: "25%", y: "25%"}` → Shape center at quarter point
- **Polygons**: `position: {x: "50%", y: "50%"}` → Polygon center reference

#### Text Positioning
All text uses `text-anchor="middle"` and `dominant-baseline="central"`:
- `position: {x: "50%", y: "50%"}` → Text center at viewBox center
- Percentage coordinates are automatically resolved to absolute pixels during rendering

#### Template Examples

**Circle Template with Percentage Coordinates:**
```yaml
layers:
  - id: "background"
    type: "shape"
    subtype: "circle"
    position: { x: "50%", y: "50%" }    # Center of viewBox
    width: 200
    height: 200
    fill: "#3b82f6"

  - id: "title"
    type: "text"
    position: { x: "50%", y: "50%" }    # Same center as circle
    default: "My Badge"
    fontFamily: "Roboto"
    fontSize: 18
```

**Rectangle Template with Percentage Layout:**
```yaml
layers:
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: "50%", y: "50%" }    # Centered rectangle
    width: 400
    height: 200
    fill: "#f8fafc"

  - id: "header"
    type: "text"
    position: { x: "50%", y: "25%" }    # Top quarter
    default: "Header Text"

  - id: "body"
    type: "text"
    position: { x: "50%", y: "50%" }    # Center
    default: "Body Text"

  - id: "footer"
    type: "text"
    position: { x: "50%", y: "75%" }    # Bottom quarter
    default: "Footer Text"
```

### Template Development Workflow

1. **Design Layout**: Plan shape and text positions using percentage coordinates for responsive design
2. **Use Percentage Coordinates** (Recommended):
   - `{ x: "50%", y: "50%" }` for center positioning
   - `{ x: "25%", y: "25%" }` for quarter positions
   - `{ x: "0%", y: "100%" }` for corners
3. **Shape Positioning**: All shapes are positioned by their center point
4. **Text Positioning**: Use same or calculated percentage coordinates for text
5. **Test in Browser**: Verify text appears centered within shapes
6. **Fine-tune**: Adjust percentages for visual balance (e.g., `"52%"` instead of `"50%"`)

#### Percentage Coordinate Benefits
- **Intuitive**: `"50%"` always means center regardless of viewBox size
- **Responsive**: Templates automatically adapt to different dimensions
- **Consistent**: No manual center calculations needed
- **Maintainable**: Easy to understand and modify coordinates

#### Migration from Absolute Coordinates
```yaml
# Old absolute coordinates
position: { x: 250, y: 150 }  # Hard to understand without context

# New percentage coordinates
position: { x: "50%", y: "50%" }  # Immediately clear this is centered
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
- **TemplateAwareSvgViewer.vue** - SVG rendering engine
- **ExportModal.vue** - Export/download functionality

### Component Communication
- **Props/Emit** for parent-child communication
- **Provide/Inject** for font selector state management
- **Store** for global state and persistence

## Tailwind CSS Configuration

### Custom Design System
- **Primary Colors**: Green-based palette (50-950)
- **Secondary Colors**: Gray-based palette (50-950)

### Custom Components
```css
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.input-field     /* Form input fields */
.card           /* Card containers */
.text-gradient  /* Gradient text effect */
```

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)

## Development Notes

### Performance Optimizations
- **Lazy Font Loading** - fonts loaded only when selected
- **Component Optimization** with computed properties
- **Minimal Re-renders** with reactive optimizations

### Browser Compatibility
- Modern browsers with ES6+ support
- SVG support required for badge rendering
- LocalStorage required for persistence

### Project Configuration
- **TypeScript** strict mode enabled
- **Vite** for fast development and building
- **ESLint** with Vue 3 + TypeScript rules
- **PostCSS** with Autoprefixer

## Server Configuration

### Development
- **Vite Dev Server**: http://localhost:3000 with HMR
- **Hot Module Replacement** for instant updates

### Production
- **Express Static Server**: http://localhost:3000
- **SPA Fallback** for client-side routing
- **Static File Serving** from `app/dist/`

---

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

**Production Ready**: This application is fully functional with 14 professional templates, comprehensive font support, complete shape styling system, and robust state management.