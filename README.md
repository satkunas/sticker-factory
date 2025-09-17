# Sticker Factory

> Professional SVG badge and sticker generator with multiple templates and advanced typography

A modern Vue 3 application for creating custom SVG badges, stickers, and labels with professional templates and comprehensive font styling options.

## ✨ Features

- **14 Professional Templates** across 4 categories (Circle, Rectangle, Square, Diamond)
- **600+ Google Fonts** with real-time preview
- **Multi-text Input Support** with individual styling per text field
- **Shape Styling System** with fill, stroke, and line join controls
- **Advanced Typography Controls** (size, weight, color, stroke)
- **Export Options** (SVG, PNG, JSON configuration)
- **Template Persistence** - your work saves automatically
- **Responsive Design** for desktop and mobile

## 🚀 Quick Start

```bash
# Install dependencies
make install

# Start development server
make dev

# Open in browser
make dev-open
```

Visit http://localhost:3000 to start creating!

## 📋 Template Categories

**14 Professional Templates** organized across 4 shape categories:

- **Circle Templates (3)**: Quality stickers, record labels, promotional badges
- **Rectangle Templates (8)**: Business cards, conference badges, shipping labels, tickets
- **Square Templates (1)**: Social media posts
- **Diamond Templates (2)**: Safety warnings, caution labels

Each template supports multi-text input with individual font styling and shape customization.

## 🎨 Styling System

### Typography Controls
- **Font Categories**: Sans-serif, Serif, Monospace, Display, Handwriting, Dingbats
- **Font Size**: 8-500px with slider and number input
- **Font Weight**: 100-900 (only available weights shown per font)
- **Text Color**: Color picker with preset palette
- **Text Stroke**: Width (0-12px) and color customization
- **Real-time Preview**: Text inputs show selected font styling

### Shape Styling Controls
- **Fill Color**: Background color with 24 preset colors + custom picker
- **Stroke Color**: Border color with same palette system
- **Stroke Width**: 0-12px with slider and number input
- **Stroke Linejoin**: Corner styles (round, miter, bevel, arcs, clip)
- **Visual Previews**: Shape thumbnails show current styling
- **Expandable Interface**: Click shapes to expand styling controls

## 🔧 Development Commands

```bash
# Development
make dev              # Start development server
make dev-open         # Start dev server + open browser

# Production
make build            # Build for production
make start            # Start production server
make start-open       # Start prod server + open browser

# Code Quality
make lint             # Run ESLint
make lint-fix         # Auto-fix linting issues

# Maintenance
make clean            # Clean all artifacts
make install          # Install dependencies
```

## 🏗️ Project Structure

```
sticker-factory/
├── app/
│   ├── src/
│   │   ├── stores/           # Pinia state management
│   │   ├── components/       # Vue components
│   │   │   ├── TextInputWithFontSelector.vue
│   │   │   ├── TemplateObjectStyler.vue
│   │   │   └── TemplateAwareSvgViewer.vue
│   │   ├── config/           # Fonts & template config
│   │   └── types/            # TypeScript definitions
│   ├── templates/            # YAML template definitions (14 files)
│   └── dist/                 # Production build
├── server.js                 # Express static server
└── Makefile                  # Command shortcuts
```

## 🎯 Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite, Pinia, Tailwind CSS
- **Fonts**: Google Fonts with dynamic loading
- **Backend**: Express.js static file server
- **Build**: Vite with hot module replacement
- **Styling**: Tailwind CSS with custom design system

## 📱 User Experience

- **Accordion Interface** - Expandable font controls for each text field
- **Auto-save** - Your work persists across browser sessions
- **Template Switching** - Seamlessly switch between designs
- **Export/Import** - Save and share badge configurations
- **Mobile Responsive** - Works great on all devices

## 🔄 Data Persistence

Your badges automatically save to browser localStorage:
- Selected template and all text content
- Font choices and styling for each text field
- Background colors and preferences
- Export/import configurations as JSON

## 🎨 Template Parameters

Templates are YAML files supporting these layer types and parameters:

### Shape Layer Parameters
- **id**: Unique identifier for the shape
- **type**: "shape" (indicates this is a shape layer)
- **subtype**: "rect", "circle", "polygon", or "path"
- **position**: `{ x: "50%", y: "50%" }` (percentage or absolute coordinates)
- **width/height**: Shape dimensions in pixels
- **fill**: Default fill color (#hex)
- **stroke**: Default stroke color (#hex)
- **strokeWidth**: Default stroke width (pixels)
- **points**: For polygons - SVG path coordinates

### Text Layer Parameters
- **id**: Unique identifier for the text input
- **type**: "text" (indicates this is a text input layer)
- **label**: Form label shown to user
- **default**: Default text content
- **placeholder**: Input placeholder text
- **position**: `{ x: "50%", y: "50%" }` (text center coordinates)
- **maxLength**: Maximum character limit
- **fontFamily**: Default font family
- **fontSize**: Default font size (pixels)
- **fontWeight**: Default font weight (100-900)
- **fontColor**: Default text color (#hex)
- **clip**: Optional clipping shape ID

### Coordinate System
- **Percentage**: `"50%"` = center, `"0%"` = left/top, `"100%"` = right/bottom
- **Absolute**: Pixel values (e.g., `200` for 200px from origin)
- **Mixed**: `{ x: "50%", y: 30 }` combines both systems
- **Text Positioning**: Uses center coordinates (not top-left)

## 🌐 Browser Support

- Modern browsers with ES6+ support
- SVG rendering capability required
- LocalStorage support for persistence

## 📄 License

MIT License - feel free to use in your projects!

---

**Ready to create professional badges and stickers?** Run `make dev-open` to get started! 🎨