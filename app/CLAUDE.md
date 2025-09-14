# Claude Development Notes

This document contains development instructions and context for working with the Sticker Factory application.

## 🛠️ Development Commands

### Running the Application
```bash
# Start development server
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

## 🏗️ Architecture Overview

### Component Hierarchy
```
App.vue
├── TextInputWithFontSelector.vue
│   └── ExpandableFontSelector.vue
│       └── FontTile.vue
├── SvgViewer.vue
│   └── BadgeSvg.vue
├── ColorPicker.vue
├── ExportModal.vue
├── ImportModal.vue
└── DownloadModal.vue
```

### State Management
- **Pinia store** (`src/stores/index.ts`) for global state with localStorage persistence
- **Provide/Inject** for expandable font selector states
- **Props/Emit** pattern for component communication
- **localStorage persistence** for all form values including font size, weight, and color

### Key Data Flow
1. User interacts with `TextInputWithFontSelector`
2. Props flow: App → TextInput → ExpandableFontSelector → FontTile
3. Events bubble up: FontTile → ExpandableFontSelector → TextInput → App
4. App updates `SvgViewer` with new styling props
5. `SvgViewer` passes props to `BadgeSvg` for rendering

## 📝 Recent Development History

### Major Features Implemented
1. **Inline Accordion Design** - Replaced modal with expandable font selector
2. **Font Collection Expansion** - Grew from 48 to 661+ fonts across 6 categories with multiple sources
3. **Advanced Typography Controls** - Font size (8-500px), dynamic weight selection, color picker
4. **Real-time Preview** - Text input shows selected font styling
5. **Responsive Layout** - Full-width font selection with mobile support
6. **SVG Integration** - User-controlled font size and weight in SVG output
7. **Persistent Settings** - All form values saved to localStorage and restored on reload
8. **Auto-scroll Font Selection** - Automatically scrolls to selected font when expanded
9. **Enhanced UX** - Clear search button, improved loading performance, header download button

### Component Refactoring
- **Consolidated font controls** into single accordion interface
- **Removed verbose labeling** and unnecessary preview toggles
- **Optimized color selection** with compact picker and preset swatches
- **Dynamic font weight filtering** based on Google Fonts availability

## 🎨 Design Patterns

### Accordion Interface
```vue
<!-- Text input with arrow icon -->
<input class="input-field w-full pr-10" />
<button @click="toggleExpanded">
  <svg :class="{ 'rotate-180': isExpanded }">
    <!-- Arrow icon -->
  </svg>
</button>

<!-- Expandable content -->
<div v-if="isExpanded" class="accordion-content">
  <!-- Font selection interface -->
</div>
```

### Font Weight Validation
```typescript
// Only show weights available for selected font
const fontWeights = computed(() => {
  if (!props.selectedFont?.weights?.length) {
    return allFontWeights.filter(w => [400, 700].includes(w.value))
  }
  
  return allFontWeights.filter(weight => 
    props.selectedFont.weights.includes(weight.value)
  )
})
```

### Real-time Styling
```vue
<!-- Text input reflects font styling -->
<input :style="{ 
  fontFamily: selectedFont ? getFontFamily(selectedFont) : 'inherit',
  fontSize: fontSize + 'px',
  fontWeight: fontWeight
}" />
```

## 📦 Font System

### Font Configuration
- **661+ total fonts** from multiple sources (Google Fonts, system fonts, web fonts)
- **Categories**: sans-serif, serif, monospace, display, handwriting, dingbats
- **Multiple sources**: Google Fonts, system fonts, Adobe-style fonts, icon fonts
- **Dynamic loading** via CSS links with preloading and font-display: swap
- **Fallback handling** for loading failures
- **Smart preloading** of visible fonts for better performance

### Font Loading Strategy
```typescript
export const loadFont = async (font: FontConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingLink = document.querySelector(`link[href="${font.googleFontUrl}"]`)
    if (existingLink) {
      resolve()
      return
    }
    
    const link = document.createElement('link')
    link.href = font.googleFontUrl
    link.rel = 'stylesheet'
    link.onload = () => resolve()
    link.onerror = () => reject()
    document.head.appendChild(link)
  })
}
```

## 💾 Local Storage Persistence

### Persistent State Management
- **All form values** automatically saved to localStorage on change
- **Restored on page reload** - seamless user experience
- **Version-aware storage** with migration support
- **Mutation-safe operations** with write queue system

### Persisted Values
```typescript
interface AppState {
  badgeText: string        // User's text input
  badgeColor: string       // Background color
  badgeFont: FontConfig    // Selected font family
  fontSize: number         // Font size (8-500px)
  fontWeight: number       // Font weight (100-900)
  textColor: string        // Text color
  svgContent: string       // Generated SVG content
  lastModified: number     // Timestamp for sync
}
```

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

### BadgeSvg Props
```typescript
interface Props {
  text?: string
  color?: string
  textColor?: string
  width?: number
  height?: number
  fontSize?: number
  fontWeight?: number
  font?: FontConfig | null
}
```

## 🐛 Debugging Tips

### Font Loading Issues
- Check browser dev tools for CSS loading errors
- Verify Google Fonts API URLs in `fonts.ts`
- Test fallback fonts when Google Fonts fail

### State Management
- Use Vue DevTools to inspect Pinia store
- Check provide/inject context for font selector states
- Verify prop flow through component hierarchy

### SVG Rendering
- Inspect SVG DOM for correct attribute values
- Check font-family, font-size, and font-weight attributes
- Test with different fonts and weights

## 🚀 Performance Considerations

### Font Loading Optimization
- **Lazy loading** - Fonts loaded only when selected
- **Caching** - Loaded fonts cached in Set for reuse
- **Fallback handling** - Graceful degradation when fonts fail

### Component Optimization
- **Computed properties** for expensive calculations
- **Event debouncing** where appropriate
- **Minimal re-renders** with reactive optimizations

## 🔧 Build Configuration

### Vite Configuration
- TypeScript support enabled
- Tailwind CSS processing
- Vue SFC compilation
- Development server with hot reload

### TypeScript Configuration
- Strict mode enabled
- Vue component type checking
- Path aliases configured
- Build-time type validation

## 📋 Testing Strategy

### Manual Testing Checklist
- [ ] Font selection updates text input styling
- [ ] Font size slider works (8-500px range)
- [ ] Font weight buttons show only available weights
- [ ] Color picker updates both preview and SVG
- [ ] SVG viewer reflects all styling changes
- [ ] Mobile responsive design works
- [ ] Export/import functionality

### Automated Testing (Future)
- Component unit tests with Vitest
- E2E testing with Playwright
- Visual regression testing
- Performance benchmarking

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

---

**Last Updated**: Current development session
**Maintainer**: Claude AI Assistant