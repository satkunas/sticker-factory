# 🏭 Sticker Factory

A modern web application for creating custom SVG stickers with advanced typography controls and real-time preview.

## ✨ Features

### 🎨 **Advanced Typography**
- **661+ fonts** from multiple sources (Google Fonts, system fonts, web fonts, icon fonts)
- **Dynamic font weight selection** - only shows weights available for each font
- **Flexible font sizing** - 8px to 500px with slider and keyboard input
- **Real-time preview** in both input field and SVG output
- **Smart font preloading** and performance optimization

### 🎯 **Sticker Customization**
- **Text input** with live font styling preview
- **Color picker** with hex input and preset color palette
- **Background color** selection
- **Responsive design** - works on desktop and mobile

### 🖼️ **SVG Viewer**
- **Interactive pan and zoom** controls
- **Real-time rendering** of all style changes
- **Grid background** for precise positioning
- **Mini overview** with scale indicator
- **Export functionality** for downloading SVG files

### 🎛️ **User Interface**
- **Expandable accordion design** for font selection with auto-scroll to selected font
- **Compact controls** with efficient space usage and clear search button
- **Responsive grid layout** for font tiles with lazy loading
- **Mobile-responsive** with hamburger menu
- **Header download button** for easy access
- **Persistent settings** - all preferences saved automatically and restored on reload
- **Import/Export** functionality for saving designs

## 🛠️ Technology Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Google Fonts API** for font loading
- **SVG rendering** for scalable graphics

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
│   ├── BadgeSvg.vue            # SVG sticker renderer
│   ├── SvgViewer.vue           # Interactive SVG viewer
│   ├── TextInputWithFontSelector.vue  # Text input with font controls
│   ├── ExpandableFontSelector.vue     # Font selection accordion
│   ├── FontTile.vue            # Individual font preview tiles
│   ├── ColorPicker.vue         # Color selection component
│   └── ...                     # Modal and utility components
├── config/
│   └── fonts.ts         # Font definitions and utilities (603 fonts)
├── stores/
│   └── index.ts         # Pinia store for state management
├── App.vue              # Main application component
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

### TextInputWithFontSelector
- Integrates text input with expandable font controls
- Real-time font family, size, and weight preview
- Arrow icon for expand/collapse functionality

### ExpandableFontSelector
- Responsive grid layout with lazy loading for performance
- Dynamic font weight filtering based on selected font
- Auto-scroll to selected font when expanded
- Clear search button and category filtering
- Smart font preloading for better user experience

### SvgViewer
- Interactive zoom and pan controls
- Real-time SVG rendering with all styling applied
- Export functionality for saving designs
- Responsive layout with mobile support

## 🎯 Usage

1. **Enter your text** in the input field
2. **Select a font** from 600+ options across 6 categories
3. **Adjust styling** - color, size (8-500px), and weight
4. **Customize background** color
5. **Preview in real-time** with interactive SVG viewer
6. **Export your sticker** as SVG file

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