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
├── SimpleTemplateSelector.vue
├── TextInputWithFontSelector.vue (multiple instances)
│   └── ExpandableFontSelector.vue
│       └── FontTile.vue
├── TemplateAwareSvgViewer.vue
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
6. `TemplateAwareSvgViewer` receives `textInputs` array and renders each with individual styling
7. Template and form data automatically persist to localStorage

## 📝 Recent Development History

### Major Features Implemented
1. **Flattened Template System** - Unified `layers` array replacing separate `shapes` + `textInputs`
2. **Multi-Text Input Support** - Dynamic form generation for templates with multiple text inputs
3. **Individual Text Styling** - Each text input has independent font, size, weight, color, stroke properties
4. **Template Persistence** - Selected templates and form data saved/restored from localStorage
5. **zIndex-Based Rendering** - Proper layering with text above shapes based on template configuration
6. **Dynamic Form Generation** - Forms automatically adapt to template structure
7. **Backward Compatibility** - Legacy single-text mode still supported
8. **Inline Accordion Design** - Expandable font selector for each text input
9. **Font Collection Expansion** - 661+ fonts across 6 categories with multiple sources
10. **Advanced Typography Controls** - Font size (8-500px), dynamic weight selection, color picker
11. **Real-time Preview** - Text input shows selected font styling
12. **Responsive Layout** - Full-width font selection with mobile support
13. **Auto-scroll Font Selection** - Automatically scrolls to selected font when expanded
14. **Enhanced UX** - Clear search button, improved loading performance, header download button

### Recent Architecture Changes (Latest)
- **Template System Overhaul** - Flattened architecture with unified layers
- **Multi-Text Input Store** - Array-based state management for multiple text inputs
- **Dynamic Component Rendering** - Form components generated based on template structure
- **Enhanced Persistence** - Template selection and multi-text state persistence
- **zIndex Ordering Fixes** - Proper text-above-shapes rendering

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

### Multi-Text Input State Management
```typescript
interface TextInputState {
  id: string           // Matches textInput layer ID
  text: string         // User's input text
  font: FontConfig     // Selected font
  fontSize: number     // Individual font size
  fontWeight: number   // Individual font weight
  textColor: string    // Individual text color
  strokeWidth: number  // Individual stroke width
  strokeColor: string  // Individual stroke color
  strokeOpacity: number
}

// Store manages array of text inputs
textInputs: TextInputState[] = [
  { id: 'header', text: 'Hello', font: roboto, fontSize: 18, ... },
  { id: 'middle', text: 'World', font: arial, fontSize: 16, ... },
  { id: 'footer', text: '2024', font: mono, fontSize: 12, ... }
]
```

### Dynamic Form Generation
```vue
<!-- App.vue generates forms dynamically -->
<div v-for="(textInput, index) in textInputs" :key="textInput.id">
  <FormLabel :text="`${getTextInputLabel(template, textInput.id)} (${index + 1})`" />
  <TextInputWithFontSelector
    :model-value="textInput.text"
    @update:model-value="(text) => handleTextInputUpdate(index, text)"
    :selected-font="textInput.font"
    :font-size="textInput.fontSize"
    :font-weight="textInput.fontWeight"
    :text-color="textInput.textColor"
    :text-stroke-width="textInput.strokeWidth"
    :text-stroke-color="textInput.strokeColor"
    @update:selected-font="(font) => handleTextInputFontUpdate(index, font)"
    @update:font-size="(size) => handleTextInputFontSizeUpdate(index, size)"
    <!-- ... other individual property handlers ... -->
  />
</div>
```

### SVG Rendering with Individual Styling
```vue
<!-- TemplateAwareSvgViewer.vue renders each text with its own properties -->
<text v-for="element in templateElements"
      v-if="element.type === 'text' && element.textInput"
      :x="element.textInput.position.x"
      :y="element.textInput.position.y"
      :font-family="getTextInputData(element.textInput.id)?.font"
      :font-size="getTextInputData(element.textInput.id)?.fontSize"
      :font-weight="getTextInputData(element.textInput.id)?.fontWeight"
      :fill="getTextInputData(element.textInput.id)?.textColor"
      :stroke="getTextInputData(element.textInput.id)?.strokeColor">
  {{ getTextInputData(element.textInput.id)?.text }}
</text>
```

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

### Accordion Interface

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
  // New multi-text input system
  textInputs: TextInputState[]    // Array of text inputs with individual styling
  selectedTemplateId: string | null  // Selected template for restoration

  // Legacy single-text properties (for backward compatibility)
  badgeText: string               // User's text input
  badgeColor: string              // Background color
  badgeFont: FontConfig           // Selected font family
  fontSize: number                // Font size (8-500px)
  fontWeight: number              // Font weight (100-900)
  textColor: string               // Text color
  svgContent: string              // Generated SVG content
  lastModified: number            // Timestamp for sync
}

interface TextInputState {
  id: string                      // Matches template textInput layer ID
  text: string                    // User's input text
  font: FontConfig | null         // Individual font selection
  fontSize: number                // Individual font size
  fontWeight: number              // Individual font weight
  textColor: string               // Individual text color
  strokeWidth: number             // Individual stroke width
  strokeColor: string             // Individual stroke color
  strokeOpacity: number           // Individual stroke opacity
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
- Use Vue Devtools to inspect Pinia store
- Check provide/inject context for font selector states
- Verify prop flow through component hierarchy

### SVG Rendering
- Inspect SVG DOM for correct attribute values
- Check font-family, font-size, and font-weight attributes
- Test with different fonts and weights

## 🔍 Critical Visual Verification Protocol

### MANDATORY: Always Take Screenshots for Layout Verification
**NEVER assume positioning/alignment is correct based on console logs, DOM elements, or code inspection alone.**

#### Required Steps for Any Layout/Positioning Work:
1. **Take full-page screenshots** after making positioning changes
2. **Examine screenshots in extreme detail** - zoom in on specific areas if needed
3. **Verify actual visual alignment** of all elements (text, shapes, SVG icons)
4. **Check for invisible/missing elements** that should be visible
5. **Compare before/after screenshots** to confirm improvements

#### Common Failure Patterns to Watch For:
- **SVG icons positioned outside template bounds** (common with coordinate mapping issues)
- **Elements positioned at (0,0) or extreme coordinates** indicating calculation errors
- **Invisible elements with 0 scale/size** due to scaling problems
- **Z-index layering issues** where elements render behind others
- **Viewport clipping** where elements are positioned but cut off

#### Screenshot Analysis Checklist:
- [ ] Are all intended SVG icons/shapes visible within template boundaries?
- [ ] Do text elements align properly with their container shapes?
- [ ] Are coordinate calculations producing reasonable visual results?
- [ ] Do percentage-based positions map correctly to actual template areas?
- [ ] Are elements scaled appropriately for their containers?

#### Never Trust These Indicators Alone:
- ❌ Console log coordinates (e.g., "finalX=223.75, finalY=179")
- ❌ DOM element presence in HTML snapshots
- ❌ Successful function execution without errors
- ❌ Calculated values that "look reasonable" mathematically

#### Always Verify With:
- ✅ Full-page screenshot showing actual rendered output
- ✅ Element visibility and positioning in preview area
- ✅ Visual comparison of template requirements vs actual output
- ✅ Browser developer tools element inspection if needed

### SVG Icon Positioning Debugging
- **Problem**: SVG icons not visible despite console logs showing coordinates
- **Root Cause**: Usually coordinate system misalignment or scaling issues
- **Solution**: Take screenshot first, then debug coordinate mapping logic
- **Verification**: Icons must be visually present within template boundaries

### CRITICAL: SVG Coordinate System Alignment Requirements

**MANDATORY: SVG Images Must Use Same Origin/Center as Text Elements**

#### Core Coordinate System Rule
All template elements (text, SVG images, shapes) MUST use the same coordinate system origin for proper visual alignment within template boundaries.

#### Required Coordinate System Consistency:
1. **Text Elements**: Use SVG coordinate attributes (e.g., `x="250", y="176"`)
2. **SVG Images**: Must use SAME coordinate space as text, not separate transform space
3. **Shapes**: Position using same coordinate system as text and SVG images
4. **Reference Origin**: All elements should reference the same center point within template viewBox

#### Debugging Checklist for SVG Coordinate Issues:
- [ ] **Text Coordinates**: Check `x=` and `y=` attributes on text elements
- [ ] **SVG Image Coordinates**: Verify SVG images use same coordinate space, not `transform="translate()"`
- [ ] **Same Origin Validation**: Text at `x="250"` and SVG at `x="250"` should align horizontally
- [ ] **Visual Alignment**: Screenshot verification shows elements properly positioned within template shapes
- [ ] **Transform Analysis**: If using transforms, ensure they map to same coordinate space as text

#### Common Coordinate System Failures:
- ❌ **Mixed Coordinate Systems**: Text using SVG coordinates while SVG images use transform coordinates
- ❌ **Origin Mismatch**: Text centered at template center while SVG images use different origin point
- ❌ **Scale Conflicts**: Transform scaling causing SVG images to render outside template bounds
- ❌ **Percentage vs Absolute**: Inconsistent use of percentage vs absolute positioning between element types

#### Fix Requirements:
1. **Unified Coordinate System**: All elements must use same coordinate calculation method
2. **Consistent Origin**: SVG images must reference same center point as text elements
3. **No Transform Isolation**: Avoid separate coordinate spaces for different element types
4. **Template Boundary Respect**: All elements must render within template shape boundaries

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

#### Legacy Compatibility
- [ ] Single-text templates still work (backward compatibility)
- [ ] Legacy localStorage data migrates properly
- [ ] Fallback rendering works when no textInputs exist

#### Core Functionality
- [ ] Font selection updates text input styling preview
- [ ] Font weight buttons show only available weights for selected font
- [ ] SVG viewer reflects all styling changes in real-time
- [ ] Mobile responsive design works with dynamic forms
- [ ] Export/import functionality works with new data structure

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