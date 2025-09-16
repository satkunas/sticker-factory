# Sticker Factory

> Professional SVG badge and sticker generator with multiple templates and advanced typography

A modern Vue 3 application for creating custom SVG badges, stickers, and labels with professional templates and comprehensive font styling options.

## ✨ Features

- **13 Professional Templates** across 4 categories (Circle, Rectangle, Square, Diamond)
- **600+ Google Fonts** with real-time preview
- **Multi-text Input Support** with individual styling per text field
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

## 📋 Available Templates

### Circle Templates
- **Quality Sticker** - Quality assurance badge
- **Vinyl Record Label** - Classic record center label
- **Event Promo Sticker** - Bold promotional design

### Rectangle Templates
- **Business Card** - Professional business card layout
- **Conference Badge** - Event attendee badge
- **Booklet Cover** - Manual/guide cover design
- **Product Catalog** - Product showcase page
- **Shipping Label** - Express shipping with tracking
- **Food Package Label** - Organic product labeling
- **Concert Ticket** - Retro ticket stub design
- **YouTube Thumbnail** - Video thumbnail layout

### Square Templates
- **Social Media Post** - Instagram/Facebook post design

### Diamond Templates
- **Safety Warning** - Diamond-shaped warning label

## 🎨 Typography System

- **Font Categories**: Sans-serif, Serif, Monospace, Display, Handwriting, Dingbats
- **Font Controls**: Size (8-500px), Weight (100-900), Color, Stroke
- **Real-time Preview**: See fonts applied instantly
- **Weight Validation**: Only show available weights per font

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
│   │   ├── config/           # Fonts & template config
│   │   └── types/            # TypeScript definitions
│   ├── templates/            # YAML template definitions
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

## 🎨 Creating Custom Templates

Templates are YAML files in `app/templates/`. Key concepts:

- **Text positioning uses CENTER coordinates** (not top-left)
- **Circles**: Text center = shape center
- **Rectangles**: Text center = (x + width/2, y + height/2)
- **Multiple text fields supported** with individual styling

Example:
```yaml
name: "My Custom Template"
id: "my-template"
description: "Custom design"
category: "rectangle"
layers:
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 50 }
    width: 300
    height: 200
    fill: "#f0f0f0"

  - id: "title"
    type: "text"
    label: "Title"
    default: "My Title"
    position: { x: 200, y: 150 }  # Center of rectangle
    fontFamily: "Roboto"
    fontSize: 24
    fontColor: "#333333"
```

## 🌐 Browser Support

- Modern browsers with ES6+ support
- SVG rendering capability required
- LocalStorage support for persistence

## 📄 License

MIT License - feel free to use in your projects!

---

**Ready to create professional badges and stickers?** Run `make dev-open` to get started! 🎨