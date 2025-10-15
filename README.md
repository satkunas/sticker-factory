# Sticker Factory

> Professional SVG badge and sticker generator with 18 templates and advanced typography

Create custom SVG badges, stickers, and labels with professional templates, 600+ Google Fonts, and 100+ icons.

## ✨ Features

- **21 Professional Templates** - Circle, Rectangle, Square, Diamond shapes
- **100+ SVG Icons** - Royalty-free graphics with full styling control
- **600+ Google Fonts** - Real-time preview with dynamic loading
- **Multi-text Support** - Individual font styling per text field
- **Curved Text (TextPath)** - Text that follows curved paths and shapes
- **Shape Styling** - Fill, stroke, width, and linejoin controls
- **Advanced Typography** - Size, weight, color, and stroke customization
- **URL-Based State** - Share designs via URL, state persists automatically
- **Export Options** - Download as SVG, PNG, or JSON configuration
- **Responsive Design** - Works on desktop and mobile

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

## 📋 Available Templates

### Circle Templates (6)
- Quality Sticker - Premium quality badges
- Vinyl Record Label - Retro record designs
- Event Promo Sticker - Event announcements
- Wellness Sticker - Health and wellness badges
- Organic Product Seal - Certified organic labels
- Certification Seal - Award badges with curved text

### Rectangle Templates (11)
- Business Card - Professional contact cards
- Conference Badge - Event identification
- Shipping Label - Package labels with details
- Food Packaging Label - Product nutrition info
- Concert Ticket - Event admission tickets
- YouTube Thumbnail - Video preview graphics
- Booklet Cover - Publication covers
- Catalog Page - Product catalog layouts
- Tech Company Sticker - Modern tech badges
- Wave Rider - Dynamic wave design with curved text
- Vintage Ribbon Banner - Classic ribbon with elegant curves

### Square Templates (2)
- Social Media Post - Instagram-ready graphics
- Announcement Card - General announcements

### Diamond Templates (2)
- Safety Warning Diamond - Caution labels
- Safety Alert Diamond - Alert signage

## 🎨 Creating Templates

Templates are YAML files in `app/templates/` that define shapes, text, and icons.

### Basic Template Structure

```yaml
name: "My Custom Template"
id: "my-template"
description: "Short description of the template"
category: "circle"  # circle | rectangle | square | diamond
width: 400
height: 400
layers:
  # Layers render in order (first = back, last = front)
  - id: "background"
    type: "shape"
    # ... shape configuration

  - id: "title"
    type: "text"
    # ... text configuration

  - id: "icon"
    type: "svgImage"
    # ... SVG icon configuration
```

### Shape Layers

```yaml
- id: "background"
  type: "shape"
  subtype: "rect"              # rect | circle | polygon
  position: { x: "50%", y: "50%" }
  width: 400
  height: 400
  rx: 20                       # corner radius (rect only)
  ry: 20
  fill: "#3b82f6"             # background color
  stroke: "#1e40af"           # border color
  strokeWidth: 2              # border width
```

**Polygon Example:**
```yaml
- id: "diamond-shape"
  type: "shape"
  subtype: "polygon"
  position: { x: "50%", y: "50%" }
  points: "100,10 190,100 100,190 10,100"  # SVG path coordinates
  fill: "#fef2f2"
  stroke: "#dc2626"
  strokeWidth: 4
```

### Text Layers

```yaml
- id: "title"
  type: "text"
  label: "Title"              # Form label shown to user
  default: "Your Text Here"   # Default text content
  position: { x: "50%", y: "30%" }
  clip: "background"          # Optional: clip to shape ID
  maxLength: 25               # Character limit
  fontFamily: "Roboto"
  fontSize: 24
  fontWeight: 700             # 100-900
  fontColor: "#1f2937"
```

### TextPath (Curved Text)

Use the `textPath` property to make text follow a curved path:

```yaml
layers:
  # Define a path for text to follow
  - id: "curve-path"
    type: "shape"
    subtype: "path"
    path: "M 50,200 Q 200,100 350,200"  # SVG path commands
    position: { x: 0, y: 0 }
    fill: "none"
    stroke: "none"
    strokeWidth: 0

  # Text follows the path
  - id: "curved-text"
    type: "text"
    label: "Curved Text"
    default: "FOLLOW THE CURVE"
    textPath: "curve-path"          # Reference to path ID
    startOffset: "50%"               # Start at path midpoint (0-100%)
    dy: -10                          # Offset above path (-100 to 100)
    position: { x: "50%", y: "50%" }
    fontFamily: "Oswald"
    fontSize: 24
    fontColor: "#1f2937"
```

**TextPath Properties:**
- `textPath`: ID of the path layer to follow
- `startOffset`: Starting position on path (default: "0%")
  - "0%" = path start, "50%" = midpoint, "100%" = end
- `dy`: Vertical offset in pixels (default: 0)
  - Negative = above path, Positive = below path

**Examples:** See certification-seal, wave-rider-sticker, and vintage-ribbon-banner templates

### SVG Icon Layers

```yaml
- id: "icon"
  type: "svgImage"
  svgId: "ui-security-shield"  # Filename without .svg extension
  position: { x: "75%", y: "25%" }
  width: 32
  height: 32
  fill: "#10b981"
  stroke: "#059669"
  strokeWidth: 2
  strokeLinejoin: "round"      # round | miter | bevel
```

**Available Icons:** 100+ icons in `app/images/`
- UI: `ui-*` (alerts, shields, checkmarks, stars)
- Tech: `tech-*` (code, devices, cloud, database)
- Business: `business-*` (charts, documents, communication)
- Nature: `nature-*` (animals, weather, plants)
- Objects: `objects-*` (tools, food, transportation)

### Position System

**Percentage Coordinates** (recommended):
- `x: "50%"` - Horizontal center
- `x: "0%"` - Left edge
- `x: "100%"` - Right edge
- `y: "50%"` - Vertical center
- `y: "0%"` - Top edge
- `y: "100%"` - Bottom edge

**Absolute Coordinates:**
- `x: 200` - 200 pixels from left
- `y: 100` - 100 pixels from top

**Mixed:**
- `{ x: "50%", y: 100 }` - Centered horizontally, 100px from top

**Important:** Text positions represent the **center** of the text, not top-left corner.

### Clipping Text to Shapes

Use the `clip` property to constrain text within a shape:

```yaml
layers:
  - id: "title-box"
    type: "shape"
    subtype: "rect"
    position: { x: "50%", y: "30%" }
    width: 360
    height: 60
    fill: "rgba(0, 0, 0, 0.7)"

  - id: "title-text"
    type: "text"
    position: { x: "50%", y: "30%" }
    clip: "title-box"           # Clips to shape above
    default: "Clipped Text"
```

### Complete Example

```yaml
name: "Custom Badge"
id: "custom-badge"
description: "A simple badge with icon, title, and subtitle"
category: "rectangle"
width: 320
height: 200
layers:
  # Background rectangle
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: "50%", y: "50%" }
    width: 320
    height: 200
    rx: 12
    ry: 12
    fill: "#ffffff"
    stroke: "#3b82f6"
    strokeWidth: 2

  # Header bar
  - id: "header"
    type: "shape"
    subtype: "rect"
    position: { x: "50%", y: "20%" }
    width: 320
    height: 40
    fill: "#3b82f6"

  # Icon
  - id: "badge-icon"
    type: "svgImage"
    svgId: "ui-security-shield"
    position: { x: "20%", y: "20%" }
    width: 24
    height: 24
    fill: "#ffffff"
    clip: "background"

  # Title text
  - id: "title"
    type: "text"
    label: "Title"
    default: "Badge Title"
    position: { x: "60%", y: "20%" }
    clip: "background"
    maxLength: 20
    fontFamily: "Roboto"
    fontSize: 18
    fontWeight: 700
    fontColor: "#ffffff"

  # Subtitle text
  - id: "subtitle"
    type: "text"
    label: "Subtitle"
    default: "Subtitle text"
    position: { x: "50%", y: "60%" }
    clip: "background"
    maxLength: 30
    fontFamily: "Inter"
    fontSize: 16
    fontWeight: 400
    fontColor: "#1f2937"
```

### Testing Your Template

1. Save YAML file in `app/templates/`
2. Restart dev server (`make dev`)
3. Template appears in dropdown automatically
4. Test all text inputs, shapes, and icons
5. Verify clipping and positioning at different zoom levels

## 🔧 Development Commands

```bash
# Development
make dev              # Start dev server
make dev-open         # Start dev server + open browser

# Production
make build            # Build for production
make start            # Start production server
make start-open       # Start prod server + open browser

# Code Quality
make lint             # Run ESLint
make lint-fix         # Auto-fix linting issues

# Testing
make test-quick       # Run fast tests
make test-full        # Run comprehensive tests

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
│   │   ├── config/           # Fonts, templates, SVG library
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript definitions
│   ├── templates/            # YAML template definitions
│   ├── images/               # SVG icon library (100+ icons)
│   └── dist/                 # Production build
├── server.js                 # Express static server
└── Makefile                  # Command shortcuts
```

## 🎯 Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite, Pinia, Tailwind CSS
- **Fonts**: Google Fonts with dynamic loading
- **State**: URL-driven (shareable links, automatic persistence)
- **Build**: Vite with hot module replacement
- **Testing**: Vitest with 50+ SVG utility tests

## 🔒 Security & Performance

### Security
- Input validation and sanitization
- XSS protection with HTML encoding
- SVG sanitization (dangerous elements removed)
- HTTPS-only font loading
- MIME type validation for uploads

See [SECURITY.md](./SECURITY.md) for details.

### Performance
- **Code Splitting**: Separate chunks for templates, fonts, components
- **Lazy Loading**: On-demand component and font loading
- **Bundle Size**: 75KB main bundle (89% reduction)
- **Font Chunk**: 138KB (separated)
- **Template Chunks**: 1-3KB each (dynamically loaded)
- **Cache Hit Rate**: 95%+ for fonts and templates

## 🌐 Browser Support

- Modern browsers with ES6+ support
- SVG rendering capability required
- LocalStorage for temporary data

## 📄 License

MIT License - free to use in your projects!

---

**Ready to create?** Run `make dev-open` and start designing! 🎨
