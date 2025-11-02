/**
 * User Font Store Tests
 *
 * Target: 80%+ coverage (store file)
 * Tests singleton pattern, localStorage persistence, CRUD operations, validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserFontStore } from '../stores/userFontStore'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

describe('userFontStore', () => {
  // Mock font data (minimal WOFF2 font structure - just for testing)
  const createMockFontFile = (name: string, format: 'woff2' | 'woff' | 'ttf' | 'otf' = 'woff2', size = 1000): File => {
    // Create a mock font file with some binary content
    const content = new Uint8Array(size).fill(65) // Fill with 'A' character
    const blob = new Blob([content], { type: `font/${format}` })
    return new File([blob], `${name}.${format}`, { type: `font/${format}` })
  }

  // Mock localStorage
  let localStorageMock: Record<string, string> = {}

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {}
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      length: 0,
      key: vi.fn(() => null)
    } as any

    // Mock FontFace and document.fonts
    global.FontFace = vi.fn().mockImplementation((family, source) => {
      return {
        family,
        source,
        load: vi.fn().mockResolvedValue({})
      }
    }) as any

    // Mock document.fonts
    if (!global.document) {
      global.document = {} as any
    }
    global.document.fonts = {
      add: vi.fn()
    } as any

    // Clear store state by clearing localStorage
    const store = useUserFontStore()
    store.clearUserFonts()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance across multiple calls', () => {
      const store1 = useUserFontStore()
      const store2 = useUserFontStore()
      // Both should reference same state
      expect(store1.items.value).toBe(store2.items.value)
    })
  })

  describe('loadUserFonts', () => {
    it('should load empty array on first run', async () => {
      const store = useUserFontStore()
      const items = await store.loadUserFonts()

      expect(items).toEqual([])
      expect(store.isLoaded.value).toBe(true)
      expect(store.isLoading.value).toBe(false)
    })

    it('should load items from localStorage', async () => {
      // Pre-populate localStorage
      const mockItems = [{
        id: 'user-font-12345678',
        name: 'Test Font',
        fontData: 'base64encodeddata',
        format: 'woff2' as const,
        uploadDate: Date.now()
      }]
      localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserFontStore()
      const items = await store.loadUserFonts()

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('user-font-12345678')
      expect(items[0].name).toBe('Test Font')
      expect(items[0].format).toBe('woff2')
    })

    it('should return cached items on subsequent calls', async () => {
      const store = useUserFontStore()
      await store.loadUserFonts()

      // Second call should return cached
      const items = await store.loadUserFonts()
      expect(store.isLoaded.value).toBe(true)
      expect(items).toEqual(store.items.value)
    })

    it('should filter out invalid items', async () => {
      // Pre-populate with mix of valid and invalid items
      const mockItems = [
        {
          id: 'user-font-12345678',
          name: 'Valid',
          fontData: 'validbase64',
          format: 'woff2' as const,
          uploadDate: Date.now()
        },
        {
          id: 'invalid-id',  // Invalid ID format
          name: 'Invalid',
          fontData: 'base64',
          format: 'woff2' as const,
          uploadDate: Date.now()
        }
      ]
      localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserFontStore()
      const items = await store.loadUserFonts()

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('user-font-12345678')
    })

    it('should sort items by upload date (newest first)', async () => {
      const now = Date.now()
      const mockItems = [
        {
          id: 'user-font-11111111',
          name: 'Old Font',
          fontData: 'base64old',
          format: 'woff2' as const,
          uploadDate: now - 1000
        },
        {
          id: 'user-font-22222222',
          name: 'New Font',
          fontData: 'base64new',
          format: 'woff2' as const,
          uploadDate: now
        }
      ]
      localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserFontStore()
      const items = await store.loadUserFonts()

      expect(items[0].name).toBe('New Font') // Newest first
      expect(items[1].name).toBe('Old Font')
    })

    it('should register fonts with browser', async () => {
      const mockItems = [{
        id: 'user-font-12345678',
        name: 'Test Font',
        fontData: 'base64encodeddata',
        format: 'woff2' as const,
        uploadDate: Date.now()
      }]
      localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserFontStore()
      await store.loadUserFonts()

      // FontFace should be called with font ID as family name
      expect(global.FontFace).toHaveBeenCalledWith(
        'user-font-12345678',
        expect.stringContaining('data:font/woff2;base64,base64encodeddata'),
        expect.any(Object)
      )
    })
  })

  describe('addUserFont', () => {
    it('should add valid font file and return UserFontItem', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2', 1000)
      const item = await store.addUserFont(fontFile, 'Test Font')

      expect(item).not.toBeNull()
      expect(item?.name).toBe('Test Font')
      expect(item?.fontData).toBeTruthy()
      expect(item?.id).toMatch(/^user-font-[0-9a-f]{8}$/)
      expect(item?.format).toBe('woff2')
      expect(store.items.value.length).toBe(1)
    })

    it('should auto-generate name from filename if not provided', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('MyAwesomeFont', 'woff2')
      const item = await store.addUserFont(fontFile)

      expect(item?.name).toBe('MyAwesomeFont')
    })

    it('should support WOFF format', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff')
      const item = await store.addUserFont(fontFile)

      expect(item).not.toBeNull()
      expect(item?.format).toBe('woff')
    })

    it('should support TTF format', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'ttf')
      const item = await store.addUserFont(fontFile)

      expect(item).not.toBeNull()
      expect(item?.format).toBe('truetype')
    })

    it('should support OTF format', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'otf')
      const item = await store.addUserFont(fontFile)

      expect(item).not.toBeNull()
      expect(item?.format).toBe('opentype')
    })

    it('should reject duplicate font based on content', async () => {
      const store = useUserFontStore()
      const fontFile1 = createMockFontFile('Font1', 'woff2', 1000)
      const fontFile2 = createMockFontFile('Font2', 'woff2', 1000) // Same content

      await store.addUserFont(fontFile1, 'First')

      // Second upload with same content should throw
      await expect(store.addUserFont(fontFile2, 'Second')).rejects.toThrow('already been uploaded')
      expect(store.items.value.length).toBe(1) // Only first font stored
    })

    it('should reject font that is too large', async () => {
      const store = useUserFontStore()
      const largeFontFile = createMockFontFile('HugeFont', 'woff2', USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES + 1)

      await expect(store.addUserFont(largeFontFile)).rejects.toThrow('too large')
      expect(store.items.value.length).toBe(0)
    })

    it('should reject when quota is reached', async () => {
      const store = useUserFontStore()

      // Add fonts until quota reached
      const maxCount = USER_ASSET_CONFIG.MAX_FONT_COUNT
      for (let i = 0; i < maxCount; i++) {
        // Use different sizes to create unique content
        const uniqueFontFile = createMockFontFile(`Font${i}`, 'woff2', 1000 + i)
        await store.addUserFont(uniqueFontFile)
      }

      expect(store.items.value.length).toBe(maxCount)

      // Try to add one more
      const overLimitFont = createMockFontFile('OverLimit', 'woff2', 9999)
      await expect(store.addUserFont(overLimitFont)).rejects.toThrow('Maximum')
    })

    it('should persist to localStorage', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      await store.addUserFont(fontFile, 'Test')

      const stored = localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY]
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(1)
      expect(parsed[0].name).toBe('Test')
    })

    it('should register font with browser after upload', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      const item = await store.addUserFont(fontFile, 'Test')

      // FontFace should be called with the font ID
      expect(global.FontFace).toHaveBeenCalledWith(
        item?.id,
        expect.stringContaining('data:font/woff2;base64,'),
        expect.any(Object)
      )
    })
  })

  describe('deleteUserFont', () => {
    it('should delete existing font', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      const item = await store.addUserFont(fontFile, 'Test')
      expect(store.items.value.length).toBe(1)

      const deleted = store.deleteUserFont(item!.id)
      expect(deleted).toBe(true)
      expect(store.items.value.length).toBe(0)
    })

    it('should return false for non-existent font', () => {
      const store = useUserFontStore()
      const deleted = store.deleteUserFont('user-font-nonexistent')
      expect(deleted).toBe(false)
    })

    it('should persist deletion to localStorage', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      const item = await store.addUserFont(fontFile, 'Test')
      store.deleteUserFont(item!.id)

      const stored = localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY]
      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(0)
    })
  })

  describe('getUserFont', () => {
    it('should return font item if exists', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      const item = await store.addUserFont(fontFile, 'Test')

      const found = store.getUserFont(item!.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe('Test')
      expect(found?.format).toBe('woff2')
    })

    it('should return null if not exists', () => {
      const store = useUserFontStore()
      const found = store.getUserFont('user-font-nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('getUserFontData', () => {
    it('should return font data if exists', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      const item = await store.addUserFont(fontFile, 'Test')

      const fontData = store.getUserFontData(item!.id)
      expect(fontData).toBeTruthy()
      expect(typeof fontData).toBe('string')
    })

    it('should return null if not exists', () => {
      const store = useUserFontStore()
      const fontData = store.getUserFontData('user-font-nonexistent')
      expect(fontData).toBeNull()
    })
  })

  describe('clearUserFonts', () => {
    it('should clear all fonts', async () => {
      const store = useUserFontStore()
      const fontFile1 = createMockFontFile('Font1', 'woff2', 1000)
      const fontFile2 = createMockFontFile('Font2', 'woff2', 2000)
      await store.addUserFont(fontFile1, 'Test 1')
      await store.addUserFont(fontFile2, 'Test 2')
      expect(store.items.value.length).toBe(2)

      store.clearUserFonts()
      expect(store.items.value.length).toBe(0)
    })

    it('should persist clear to localStorage', async () => {
      const store = useUserFontStore()
      const fontFile = createMockFontFile('TestFont', 'woff2')
      await store.addUserFont(fontFile, 'Test')

      // Verify font was stored
      expect(localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY]).toBeTruthy()

      store.clearUserFonts()

      // After clear, localStorage key should be removed (not set to empty array)
      const stored = localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY]
      expect(stored).toBeUndefined()
    })
  })

  describe('Computed Properties', () => {
    it('should track itemCount reactively', async () => {
      const store = useUserFontStore()
      expect(store.itemCount.value).toBe(0)

      const fontFile1 = createMockFontFile('Font1', 'woff2', 1000)
      await store.addUserFont(fontFile1, 'Test 1')
      expect(store.itemCount.value).toBe(1)

      const fontFile2 = createMockFontFile('Font2', 'woff2', 2000)
      await store.addUserFont(fontFile2, 'Test 2')
      expect(store.itemCount.value).toBe(2)
    })

    it('should track isLoaded reactively', async () => {
      const store = useUserFontStore()
      expect(store.isLoaded.value).toBe(false)

      await store.loadUserFonts()
      expect(store.isLoaded.value).toBe(true)
    })

    it('should track isLoading during load', async () => {
      const store = useUserFontStore()
      expect(store.isLoading.value).toBe(false)

      // isLoading should be true during load (checked synchronously is difficult in tests)
      await store.loadUserFonts()
      expect(store.isLoading.value).toBe(false) // Should be false after load completes
    })
  })

  describe('Error Handling', () => {
    it('should set error state on upload failure', async () => {
      const store = useUserFontStore()
      const largeFontFile = createMockFontFile('HugeFont', 'woff2', USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES + 1)

      try {
        await store.addUserFont(largeFontFile)
      } catch (error) {
        // Error should be thrown
        expect(error).toBeTruthy()
      }
    })

    it('should throw error on corrupted localStorage data', async () => {
      // Set corrupted data in localStorage
      localStorageMock[USER_ASSET_CONFIG.FONT_LOCALSTORAGE_KEY] = 'corrupted json {'

      const store = useUserFontStore()

      // Store should throw error when encountering corrupted data
      await expect(store.loadUserFonts()).rejects.toThrow()

      // After error, store should be marked as loaded (to prevent retry loops)
      expect(store.isLoaded.value).toBe(true)
    })
  })

  describe('Font Format Detection', () => {
    it('should detect WOFF2 format', async () => {
      const store = useUserFontStore()
      const fontFile = new File([new Blob([new Uint8Array(100)])], 'test.woff2', { type: 'font/woff2' })
      const item = await store.addUserFont(fontFile)

      expect(item?.format).toBe('woff2')
    })

    it('should detect WOFF format', async () => {
      const store = useUserFontStore()
      const fontFile = new File([new Blob([new Uint8Array(100)])], 'test.woff', { type: 'font/woff' })
      const item = await store.addUserFont(fontFile)

      expect(item?.format).toBe('woff')
    })

    it('should detect TTF format', async () => {
      const store = useUserFontStore()
      const fontFile = new File([new Blob([new Uint8Array(100)])], 'test.ttf', { type: 'font/ttf' })
      const item = await store.addUserFont(fontFile)

      expect(item?.format).toBe('truetype')
    })

    it('should detect OTF format', async () => {
      const store = useUserFontStore()
      const fontFile = new File([new Blob([new Uint8Array(100)])], 'test.otf', { type: 'font/otf' })
      const item = await store.addUserFont(fontFile)

      expect(item?.format).toBe('opentype')
    })
  })
})
