# Vue 3 SPA + Express Server Project Setup Plan

**Project Structure:**
```
sticker-factory/
├── app/              # Vue 3 SPA
│   ├── src/
│   │   ├── stores/   # Vue store modules
│   │   ├── composables/ # Vue composition utilities
│   │   └── ...
│   ├── public/
│   └── package.json
├── server.js         # Simple Express static server
├── package.json      # Root workspace
├── Makefile         # NPM script targets
├── .eslintrc.js     # ESLint config
├── vite.config.js   # Vite build config
└── CLAUDE.md        # Updated project docs
```

**Implementation Steps:**

1. **Project Foundation** ✅
   - Initialize root package.json with workspaces
   - Set up monorepo structure with client/server folders
   - Configure ESLint for Vue 3 + TypeScript

2. **Vue 3 App Setup** ✅
   - Initialize Vue 3 project with Vite
   - Configure Tailwind CSS with custom design system
   - Implement Vue store module with localStorage persistence
   - Add export/import functionality with cache-on-demand
   - Create reactive stores using Vue's composition API

3. **Simple Express Server Setup** ✅
   - Create simple Express static server
   - Serve built app files from dist directory
   - Handle client-side routing with fallback to index.html

4. **Build & Development Tools** ✅
   - Configure Vite for optimal Vue 3 builds
   - Set up development server with hot reload
   - Configure production build optimization

5. **Makefile Integration** ✅
   - Create targets: `install`, `dev`, `build`, `lint`, `start`
   - Add convenience commands for client/server operations

6. **Documentation** ✅
   - Update CLAUDE.md with project setup, commands, and architecture
   - Document localStorage schema and API endpoints

**Key Features:**
- Vue 3 Composition API with reactive state management
- Advanced Vue store module with mutex-controlled localStorage
- Cache-on-demand getters for optimal performance
- Export/Import functionality with version compatibility
- Simple Express static server for production hosting
- Tailwind CSS with custom design system
- ESLint with Vue 3 + TypeScript rules
- Vite for fast development and optimized builds
- Makefile for easy command execution

**Recent Updates:**
- ✅ Implemented Vue store module with cache-on-demand
- ✅ Added mutex control for localStorage operations
- ✅ Enhanced export/import with version compatibility
- ✅ Updated composables to use centralized store
- ✅ Added proper TypeScript interfaces throughout
- ✅ Implemented Tailwind CSS with custom design system
- ✅ Created custom component classes and utilities
- ✅ Updated App.vue with modern Tailwind-based UI
- ✅ Added npm scripts to launch servers and open browser automatically
- ✅ Enhanced Makefile with browser opening targets
- ✅ Cross-platform browser opening support (macOS, Windows, Linux)
- ✅ Simplified server architecture to static Express server
- ✅ Renamed client directory to app for clarity
- ✅ Updated all references and configuration files