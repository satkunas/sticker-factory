# Badge to Sticker Rename Plan
**Created:** 2025-09-19 08:17:00

## Objective
Rename all instances of 'badge' to 'sticker' in templates, functions, variables, and file names while maintaining functionality and ensuring all imports work correctly.

## Analysis Scope
1. **File names** containing 'badge'
2. **Function names** and variables containing 'badge'
3. **Template files** and their content
4. **Component props** and variable names
5. **Store properties** and methods
6. **Import statements** that reference renamed items

## Planned Changes

### Phase 1: Analysis ✅
- [x] Identify all files with 'badge' in name
- [x] Find all functions/variables with 'badge' in name
- [x] Map import dependencies for renamed items

### Phase 2: File Renames ✅
- [x] Rename `BadgeSvg.vue` → `StickerSvg.vue`
- [x] Update template files: `conference-badge.yaml` → `conference-sticker.yaml`, `tech-company-badge.yaml` → `tech-company-sticker.yaml`

### Phase 3: Code Updates ✅
- [x] Rename variables: `badgeText` → `stickerText`
- [x] Rename functions: `setBadgeText` → `setStickerText`, `setBadgeFont` → `setStickerFont`
- [x] Update component names and references
- [x] Update store properties
- [x] Update template content

### Phase 4: Import Updates ✅
- [x] Update all import statements
- [x] Update component registrations in SvgViewer.vue
- [x] Update prop names and references

### Phase 5: Verification ✅
- [x] Run tests to ensure no breakage (103/103 passing)
- [x] Verify application builds successfully
- [x] Check all imports resolve correctly

## Success Criteria ✅
- [x] All 'badge' references renamed to 'sticker'
- [x] All imports work correctly
- [x] All tests pass (103/103)
- [x] Application builds and runs
- [x] No lint errors

## Completed Changes

### Files Renamed:
- `app/src/components/BadgeSvg.vue` → `app/src/components/StickerSvg.vue`
- `app/templates/conference-badge.yaml` → `app/templates/conference-sticker.yaml`
- `app/templates/tech-company-badge.yaml` → `app/templates/tech-company-sticker.yaml`

### Store Properties Updated:
- `badgeText` → `stickerText`
- `badgeFont` → `stickerFont`
- `setBadgeText()` → `setStickerText()`
- `setBadgeFont()` → `setStickerFont()`

### Component Updates:
- Updated import in `SvgViewer.vue`
- Updated prop references in `App.vue` and `DownloadModal.vue`
- Updated default text from 'Badge' to 'Sticker' in component
- Updated comments throughout codebase

### Template Content Updates:
- Updated template names and descriptions
- Updated template IDs
- Updated shape ID from `badge-background` to `sticker-background`

## Status: COMPLETED ✅
All badge-to-sticker renaming completed successfully. Application builds, all tests pass, and functionality is preserved.

## Safety Measures
- Incremental changes with test verification
- Keep import paths functional
- Maintain backward compatibility where needed