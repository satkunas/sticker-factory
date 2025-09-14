# 🏭 Sticker Factory

A modern web application for creating custom SVG stickers with template-based design, multi-text input support, and advanced typography controls.

## ✨ Features

### 🎯 **Template-Based Design System**
- **Dynamic template selection** with automatic form generation
- **Multiple text inputs** - templates support 1-3+ text elements with individual styling
- **Template persistence** - selected templates and form data saved automatically
- **zIndex-based rendering** - proper layering with text above shapes
- **Backward compatibility** - supports both new multi-text and legacy single-text modes

### 🎨 **Advanced Typography (Per Text Input)**
- **661+ fonts** from multiple sources (Google Fonts, system fonts, web fonts, icon fonts)
- **Individual font selection** - each text input can use different fonts
- **Independent sizing** - 8px to 500px per text input with slider and keyboard input
- **Separate weight control** - only shows weights available for each font
- **Individual colors** - text color and stroke properties per input
- **Real-time preview** in both input field and SVG output
- **Smart font preloading** and performance optimization

### 🎯 **Advanced Sticker Customization**
- **Multi-text layouts** - header, middle, footer sections with independent styling
- **Individual text properties** - each text element has its own font, size, weight, color, stroke
- **Template-based shapes** - backgrounds, dividers, sections defined by templates
- **Background color** selection for entire sticker
- **Responsive design** - works on desktop and mobile

### 🖼️ **SVG Viewer**
- **Interactive pan and zoom** controls
- **Real-time rendering** of all style changes
- **Grid background** for precise positioning
- **Mini overview** with scale indicator
- **Export functionality** for downloading SVG files

### 🎛️ **User Interface**
- **Dynamic form generation** - forms automatically adapt to selected template structure
- **Per-input accordion design** - each text input has its own expandable font controls
- **Template selector** with visual previews and categories
- **Expandable font controls** with auto-scroll to selected font
- **Compact design** with efficient space usage and clear search button
- **Responsive grid layout** for font tiles with lazy loading
- **Mobile-responsive** with hamburger menu
- **Header download button** for easy access
- **Persistent settings** - templates, text inputs, and all styling saved automatically
- **Import/Export** functionality for saving complete designs

## 🛠️ Technology Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety and discriminated unions
- **Tailwind CSS** for utility-first styling
- **Pinia-style store** for reactive state management
- **YAML templates** for design structure definition
- **Google Fonts API** for dynamic font loading
- **SVG rendering** with zIndex-based layer ordering
- **localStorage** for automatic data persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sticker-factory/app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run type-check # Run TypeScript checks
```

## 📁 Project Structure

```
src/
├── components/          # Vue components
│   ├── SimpleTemplateSelector.vue     # Template selection interface
│   ├── TemplateAwareSvgViewer.vue     # Template-based SVG renderer
│   ├── TextInputWithFontSelector.vue  # Text input with font controls
│   ├── ExpandableFontSelector.vue     # Font selection accordion
│   ├── FontTile.vue            # Individual font preview tiles
│   ├── ColorPicker.vue         # Color selection component
│   └── ...                     # Modal and utility components
├── config/
│   ├── fonts.ts         # Font definitions and utilities (661+ fonts)
│   └── template-loader.ts      # YAML template processing and caching
├── stores/
│   └── index.ts         # Reactive store with multi-text input support
├── types/
│   └── template-types.ts       # TypeScript interfaces for templates
├── templates/           # YAML template definitions
│   ├── square-1.yaml    # Simple single-text template
│   ├── square-3.yaml    # Complex multi-text template
│   └── ...              # Additional template files
├── App.vue              # Main application with dynamic form generation
└── main.ts             # Application entry point
```

## 🎨 Font Categories

- **Sans Serif** (320+ fonts) - Inter, Roboto, Montserrat, Open Sans, SF Pro Display...
- **Serif** (160+ fonts) - Playfair Display, Lora, Merriweather, EB Garamond...
- **Display** (120+ fonts) - Lobster, Fredoka One, Abril Fatface, Creepster, Metal Mania...
- **Handwriting** (90+ fonts) - Dancing Script, Pacifico, Satisfy, Great Vibes, Alex Brush...
- **Monospace** (25+ fonts) - Fira Code, Source Code Pro, JetBrains Mono, Space Mono, VT323...
- **Symbols** (15+ fonts) - Material Icons, Noto Emoji variants, Font Awesome, Feather...

## 🔧 Key Components

### SimpleTemplateSelector
- Template selection interface with visual previews
- Category-based template organization
- Automatic form generation on template selection

### TextInputWithFontSelector (Multiple Instances)
- Integrates text input with expandable font controls
- Individual font, size, weight, color, and stroke properties
- Real-time preview with selected styling
- Unique instance ID for multiple text inputs

### TemplateAwareSvgViewer
- Template-based SVG rendering with proper zIndex ordering
- Multi-text input support with individual styling
- Interactive zoom and pan controls
- Real-time rendering of all style changes
- Export functionality for saving designs

### ExpandableFontSelector
- Responsive grid layout with lazy loading for performance
- Dynamic font weight filtering based on selected font
- Auto-scroll to selected font when expanded
- Clear search button and category filtering
- Smart font preloading for better user experience

### Template System
- **YAML-based templates** define shapes and text input positions
- **Flattened layers architecture** with unified shape + text arrays
- **Dynamic form generation** based on template structure
- **Backward compatibility** with legacy single-text templates

## 🎯 Usage

### Multi-Text Sticker Creation
1. **Select a template** from available designs (simple single-text or complex multi-text)
2. **Fill in text inputs** - each template shows relevant text fields (Header, Middle, Footer, etc.)
3. **Customize each text individually**:
   - Choose from 661+ fonts across 6 categories
   - Adjust size (8-500px) with slider or keyboard input
   - Set weight (100-900) based on font availability
   - Pick colors for text and stroke
   - Configure stroke width and opacity
4. **Customize background** color for entire sticker
5. **Preview in real-time** with interactive SVG viewer
6. **Export your sticker** as SVG file

### Template Examples
- **Square - Simple**: Single centered text with background
- **Square - Three Sections**: Header, middle, footer with individual styling
- **Custom layouts**: Add more templates with different arrangements

Your template selection and all text styling automatically save and restore on page reload.

## 📱 Responsive Design

- **Desktop** - Full sidebar with complete controls
- **Mobile** - Hamburger menu with overlay navigation
- **Tablet** - Responsive grid layouts
- **Touch-friendly** controls and interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Vue 3 and modern web technologies