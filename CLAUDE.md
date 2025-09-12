# Sticker Factory - SVG Badge Generator

A Vue 3 single-page application with simple Express static server.

## Project Structure

```
sticker-factory/
├── app/                    # Vue 3 SPA
│   ├── src/
│   │   ├── stores/         # Vue store modules (main state management)
│   │   │   └── index.ts    # Main store with localStorage integration
│   │   ├── composables/    # Vue composition API utilities
│   │   │   ├── useStorage.ts      # Legacy localStorage wrapper
│   │   │   └── useBadgeStore.ts   # Badge-specific store logic
│   │   ├── main.ts         # App entry point
│   │   ├── App.vue         # Root component
│   │   └── style.css       # Global styles with Tailwind
│   ├── public/             # Static assets
│   ├── dist/               # Built app files (generated)
│   ├── index.html          # HTML template
│   └── package.json        # App dependencies
├── server.js               # Simple Express static server
├── package.json            # Root workspace config
├── Makefile               # Build and development commands
├── vite.config.js         # Vite build configuration
├── .eslintrc.js           # ESLint configuration
└── PLAN.md                # Implementation plan
```

## Technology Stack

### Frontend (App)
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Composition API** - Vue 3's reactive system
- **LocalStorage** - Client-side data persistence
- **Tailwind CSS** - Utility-first CSS framework with custom design system

### Backend (Server)
- **Express.js** - Simple static file server
- **Node.js** - JavaScript runtime for server

### Development Tools
- **ESLint** - Code linting for Vue 3 + TypeScript
- **Concurrently** - Run multiple npm scripts
- **PostCSS** - CSS processing with Autoprefixer
- **Makefile** - Convenient command interface

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation
```bash
# Install all dependencies
make install

# Or install app dependencies only
make install-app
```

### Development
```bash
# Start development server (Vite dev server on port 3000)
make dev

# Start development server and open browser automatically
make dev-open
```

### Building
```bash
# Build app for production
make build
```

### Production
```bash
# Start production server (Express static server on port 3000)
make start

# Start production server and open browser automatically
make start-open
```

## Available Commands

### Development
- `make dev` - Start development server (Vite)
- `make dev-open` - Start development server and open browser

### Building
- `make build` - Build app for production

### Code Quality
- `make lint` - Run ESLint on app code
- `make lint-fix` - Auto-fix linting issues

### Maintenance
- `make clean` - Clean build artifacts and dependencies
- `make clean-deps` - Remove all node_modules
- `make clean-build` - Remove build artifacts only
- `make check` - Check project health

### Browser
- `make open` - Open app in browser (http://localhost:3000)

### Utilities
- `make help` - Show all available commands
- `make status` - Show git status
- `make commit MESSAGE="message"` - Stage and commit changes
- `make push` - Push to remote repository

## Server Configuration

### Development Server
- **Vite Dev Server**: http://localhost:3000 (with hot reload)
- **Development Mode**: `make dev` or `make dev-open`

### Production Server  
- **Express Static Server**: http://localhost:3000 (serves built files)
- **Production Mode**: `make start` or `make start-open`
- **Serves**: Built Vue 3 app from `app/dist/` directory

## Features

### App Features
- Vue 3 reactive single-page application
- LocalStorage persistence with advanced store management
- Export/Import functionality with version compatibility
- Tailwind CSS with custom design system
- Responsive design with mobile-first approach
- TypeScript support with full type safety
- Hot module replacement in development

### Server Features
- Simple static file serving
- Client-side routing support (SPA fallback)
- Production-ready Express server
- Minimal configuration required

### Development Features
- ESLint configuration for Vue 3 + TypeScript
- Vite for fast builds and development
- Concurrent development servers
- TypeScript throughout the stack
- Source maps for debugging

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### Client Configuration
- Development server: http://localhost:3000
- Production build output: `client/dist/`

### Server Configuration  
- Development server: http://localhost:3001
- Production build output: `server/dist/`

## State Management & LocalStorage

### Vue Store Architecture

The client uses a centralized Vue store (`src/stores/index.ts`) with the following features:

- **Cache-on-demand**: Data is only loaded from localStorage when first accessed
- **Mutex control**: Only one localStorage operation can happen at a time (prevents race conditions)
- **Version compatibility**: Import/export includes version checking
- **Reactive getters**: All state access is through Vue computed properties
- **TypeScript interfaces**: Full type safety throughout

### LocalStorage Schema

The client uses localStorage with the key `sticker-factory-data`:

```json
{
  "badgeText": "string",
  "badgeColor": "string", 
  "svgContent": "string",
  "lastModified": "number",
  "version": "string",
  "timestamp": "number"
}
```

### Store Usage

```typescript
import { useStore } from './stores'

const store = useStore()

// Reactive getters (cache-on-demand)
const badgeText = store.badgeText
const badgeColor = store.badgeColor
const svgContent = store.svgContent

// Mutations (auto-save to localStorage)
await store.setBadgeText('New Badge')
await store.setBadgeColor('#FF0000')
await store.updateState({ badgeText: 'text', badgeColor: '#00FF00' })

// Export/Import
store.exportToFile('my-badges.json')
await store.importFromFile()
```

## Tailwind CSS Configuration

### Custom Design System

The project includes a custom Tailwind design system with:

**Custom Colors:**
- `primary`: Green-based palette (50-950) - Main brand color
- `secondary`: Gray-based palette (50-950) - UI elements and text

**Custom Components (defined in `style.css`):**
```css
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.input-field     /* Form input fields */
.card           /* Card containers */
.badge-preview  /* Badge preview areas */
```

**Custom Utilities:**
```css
.text-gradient  /* Primary gradient text */
.shadow-soft    /* Soft shadow effect */
```

**Custom Animations:**
- `fade-in`: Smooth fade-in effect
- `slide-up`: Slide up with fade
- `bounce-subtle`: Subtle bounce animation

### Usage Examples

```vue
<!-- Primary button with icon -->
<button class="btn-primary">
  <svg class="w-5 h-5 mr-2 inline">...</svg>
  Action
</button>

<!-- Input field -->
<input class="input-field" placeholder="Enter text..." />

<!-- Card container -->
<div class="card p-6">
  <h3 class="text-lg font-semibold text-secondary-900">Title</h3>
  <p class="text-secondary-600">Content</p>
</div>

<!-- Gradient text -->
<h1 class="text-4xl font-bold text-gradient">
  Sticker Factory
</h1>
```

### Responsive Design

All components use Tailwind's responsive prefixes:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

### Configuration Files

- `client/tailwind.config.js` - Main Tailwind configuration
- `client/postcss.config.js` - PostCSS configuration
- `client/src/style.css` - Custom components and utilities

## Project Commands Reference

Always run commands through Make for consistency:

```bash
# Setup
make install          # Install all dependencies
make clean           # Clean everything

# Development  
make dev             # Start full development environment
make dev-open        # Start development environment with browser
make lint            # Check code quality

# Production
make build           # Build for production
make start           # Run production server
make start-open      # Run production server with browser

# Browser
make open            # Open client in browser
make open-api        # Open API documentation

# Utilities
make help            # Show all commands
make check           # Health check
```

## Notes

- The client runs on port 3000, server on port 3001
- All TypeScript files are configured with strict type checking
- ESLint is configured for Vue 3 + TypeScript best practices
- The project uses ES modules throughout
- CORS is configured to allow client-server communication
- All build outputs include source maps for debugging
- adjust PLAN.md and CLAUDE.md when changes are made
- oonly add the requested features