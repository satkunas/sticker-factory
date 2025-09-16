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
- **13 Professional Templates** across 4 categories:
  - **Circle**: Quality sticker, vinyl record label, event promo sticker
  - **Rectangle**: Business card, conference badge, booklet cover, catalog page, shipping label, food packaging, concert ticket, YouTube thumbnail
  - **Square**: Social media post
  - **Diamond**: Safety warning diamond

- **Multi-text Input Support**: Templates can contain multiple text fields with individual styling
- **YAML-based Configuration**: Easy to create and modify templates

### Typography & Styling
- **600+ Google Fonts** organized by category
- **Individual Text Styling**: Each text field supports:
  - Font family selection
  - Font size (8-500px)
  - Font weight (100-900)
  - Text color picker
  - Stroke width and color
- **Real-time Preview**: Text inputs show selected font styling

### User Experience
- **Accordion Interface**: Expandable font selectors for each text field
- **Template Persistence**: Selected template and all text restored on page reload
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

#### Shape Positioning
- **Circles**: `position: {x: 50, y: 50}` → SVG `cx="50" cy="50"` (center at 50,50)
- **Rectangles**: `position: {x: 50, y: 50}` → SVG `x="50" y="50"` (top-left at 50,50)
- **Polygons**: `position: {x: 50, y: 50}` → Center point for calculations

#### Text Positioning
All text uses `text-anchor="middle"` and `dominant-baseline="central"`:
- `position: {x: 50, y: 50}` places text CENTER at coordinate (50,50)

#### Coordinate Calculations

**Circle Example:**
```yaml
# Circle at {x: 50, y: 50} with width: 200
# Text should also be at {x: 50, y: 50} for center alignment
```

**Rectangle Example:**
```yaml
# Rectangle at {x: 50, y: 50} with width: 300, height: 200
# Rectangle center: (50 + 300/2, 50 + 200/2) = (200, 150)
# Text should be at {x: 200, y: 150} for center alignment
```

### Template Development Workflow

1. **Design Layout**: Plan shape and text positions
2. **Set Shape Positions**: Use appropriate coordinates for shape type
3. **Calculate Text Centers**:
   - Circles: Use same coordinates as shape position
   - Rectangles: Calculate center = (x + width/2, y + height/2)
   - Polygons: Use center point of polygon
4. **Test in Browser**: Verify text appears centered within shapes
5. **Fine-tune**: Adjust coordinates for visual balance

## State Management

### Store Architecture
- **Pinia Store** (`src/stores/index.ts`) manages global state
- **LocalStorage Integration** with automatic persistence
- **Multi-text Input System** with individual styling per text field
- **Template State** persists selected template and form data

### Data Persistence
```typescript
interface AppState {
  textInputs: TextInputState[]           // Array of text inputs
  selectedTemplateId: string | null      // Current template
  badgeColor: string                     // Background color
  // Individual text input styling
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

**Production Ready**: This application is fully functional with professional templates, comprehensive font support, and robust state management.