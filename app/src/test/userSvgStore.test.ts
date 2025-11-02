/**
 * User SVG Store Tests
 *
 * Target: 80%+ coverage (store file)
 * Tests singleton pattern, localStorage persistence, CRUD operations, validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUserSvgStore } from '../stores/userSvgStore'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

describe('userSvgStore', () => {
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue" /></svg>'
  const validSvg2 = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect x="50" y="50" width="100" height="100" fill="red" /></svg>'

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

    // Clear store state by clearing localStorage
    const store = useUserSvgStore()
    store.clearAllUserSvgs()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance across multiple calls', () => {
      const store1 = useUserSvgStore()
      const store2 = useUserSvgStore()
      // Both should reference same state
      expect(store1.items.value).toBe(store2.items.value)
    })
  })

  describe('loadUserSvgs', () => {
    it('should load empty array on first run', async () => {
      const store = useUserSvgStore()
      const items = await store.loadUserSvgs()

      expect(items).toEqual([])
      expect(store.isLoaded.value).toBe(true)
      expect(store.isLoading.value).toBe(false)
    })

    it('should load items from localStorage', async () => {
      // Pre-populate localStorage
      const mockItems = [{
        id: 'user-svg-12345678',
        hash: '12345678',
        name: 'Test SVG',
        svgContent: validSvg,
        category: 'user-uploads',
        tags: ['user-upload'],
        uploadedAt: Date.now(),
        sizeBytes: 100
      }]
      localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserSvgStore()
      const items = await store.loadUserSvgs()

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('user-svg-12345678')
    })

    it('should return cached items on subsequent calls', async () => {
      const store = useUserSvgStore()
      await store.loadUserSvgs()

      // Second call should return cached
      const items = await store.loadUserSvgs()
      expect(store.isLoaded.value).toBe(true)
      expect(items).toEqual(store.items.value)
    })

    it('should filter out invalid items', async () => {
      // Pre-populate with mix of valid and invalid items
      const mockItems = [
        {
          id: 'user-svg-12345678',
          hash: '12345678',
          name: 'Valid',
          svgContent: validSvg,
          category: 'user-uploads',
          tags: ['user-upload'],
          uploadedAt: Date.now(),
          sizeBytes: 100
        },
        {
          id: 'invalid-id',  // Invalid ID format
          hash: 'abcdefgh',
          name: 'Invalid',
          svgContent: validSvg,
          category: 'user-uploads',
          tags: ['user-upload'],
          uploadedAt: Date.now(),
          sizeBytes: 100
        }
      ]
      localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserSvgStore()
      const items = await store.loadUserSvgs()

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('user-svg-12345678')
    })

    it('should sort items by upload date (newest first)', async () => {
      const now = Date.now()
      const mockItems = [
        {
          id: 'user-svg-11111111',
          hash: '11111111',
          name: 'Old',
          svgContent: validSvg,
          category: 'user-uploads',
          tags: ['user-upload'],
          uploadedAt: now - 1000,
          sizeBytes: 100
        },
        {
          id: 'user-svg-22222222',
          hash: '22222222',
          name: 'New',
          svgContent: validSvg2,
          category: 'user-uploads',
          tags: ['user-upload'],
          uploadedAt: now,
          sizeBytes: 100
        }
      ]
      localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY] = JSON.stringify(mockItems)

      const store = useUserSvgStore()
      const items = await store.loadUserSvgs()

      expect(items[0].name).toBe('New') // Newest first
      expect(items[1].name).toBe('Old')
    })
  })

  describe('addUserSvg', () => {
    it('should add valid SVG and return UserSvgItem', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test SVG')

      expect(item).not.toBeNull()
      expect(item?.name).toBe('Test SVG')
      expect(item?.svgContent).toBeTruthy()
      expect(item?.id).toMatch(/^user-svg-[0-9a-f]{8}$/)
      expect(item?.hash).toHaveLength(8)
      expect(store.items.value.length).toBe(1)
    })

    it('should auto-generate name if not provided', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg)

      expect(item?.name).toMatch(/^User SVG \d+$/)
    })

    it('should return existing item for duplicate content', async () => {
      const store = useUserSvgStore()
      const item1 = await store.addUserSvg(validSvg, 'First')
      const item2 = await store.addUserSvg(validSvg, 'Second')

      expect(item1?.id).toBe(item2?.id)
      expect(store.items.value.length).toBe(1) // No duplicate
    })

    it('should sanitize dangerous content', async () => {
      const maliciousSvg = '<svg><script>alert(1)</script><circle cx="50" cy="50" r="40" /></svg>'
      const store = useUserSvgStore()
      const item = await store.addUserSvg(maliciousSvg)

      expect(item).not.toBeNull()
      expect(item?.svgContent).not.toContain('<script')
      expect(item?.svgContent).toContain('<circle')
    })

    it('should reject SVG that is too large', async () => {
      const largeSvg = validSvg.repeat(10000) // Make it huge
      const store = useUserSvgStore()
      const item = await store.addUserSvg(largeSvg)

      expect(item).toBeNull()
      expect(store.error.value).toContain('too large')
    })

    it('should reject invalid SVG structure', async () => {
      const invalidSvg = '<svg><unclosed'
      const store = useUserSvgStore()
      const item = await store.addUserSvg(invalidSvg)

      expect(item).toBeNull()
      expect(store.error.value).toBeTruthy()
    })

    it('should reject when quota is reached', async () => {
      const store = useUserSvgStore()

      // Mock quota limit by adding max items
      const maxCount = USER_ASSET_CONFIG.MAX_SVG_COUNT
      for (let i = 0; i < maxCount; i++) {
        // Use different SVGs to avoid collision detection
        const uniqueSvg = `<svg><circle cx="${i}" cy="${i}" r="40" /></svg>`
        await store.addUserSvg(uniqueSvg)
      }

      expect(store.items.value.length).toBe(maxCount)

      // Try to add one more
      const overLimitItem = await store.addUserSvg(validSvg)
      expect(overLimitItem).toBeNull()
      expect(store.error.value).toContain('Maximum')
    })

    it('should persist to localStorage', async () => {
      const store = useUserSvgStore()
      await store.addUserSvg(validSvg, 'Test')

      const stored = localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY]
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(1)
      expect(parsed[0].name).toBe('Test')
    })
  })

  describe('deleteUserSvg', () => {
    it('should delete existing item', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')
      expect(store.items.value.length).toBe(1)

      const deleted = store.deleteUserSvg(item!.id)
      expect(deleted).toBe(true)
      expect(store.items.value.length).toBe(0)
    })

    it('should return false for non-existent item', () => {
      const store = useUserSvgStore()
      const deleted = store.deleteUserSvg('user-svg-nonexistent')
      expect(deleted).toBe(false)
    })

    it('should persist deletion to localStorage', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')
      store.deleteUserSvg(item!.id)

      const stored = localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY]
      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(0)
    })
  })

  describe('updateUserSvgName', () => {
    it('should update existing item name', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Old Name')

      const updated = store.updateUserSvgName(item!.id, 'New Name')
      expect(updated).toBe(true)
      expect(store.items.value[0].name).toBe('New Name')
    })

    it('should return false for non-existent item', () => {
      const store = useUserSvgStore()
      const updated = store.updateUserSvgName('user-svg-nonexistent', 'New Name')
      expect(updated).toBe(false)
    })

    it('should persist update to localStorage', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Old Name')
      store.updateUserSvgName(item!.id, 'New Name')

      const stored = localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY]
      const parsed = JSON.parse(stored)
      expect(parsed[0].name).toBe('New Name')
    })
  })

  describe('getUserSvgById', () => {
    it('should return item if exists', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')

      const found = store.getUserSvgById(item!.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe('Test')
    })

    it('should return null if not exists', () => {
      const store = useUserSvgStore()
      const found = store.getUserSvgById('user-svg-nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('getUserSvgContent', () => {
    it('should return SVG content if exists', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')

      const content = store.getUserSvgContent(item!.id)
      expect(content).toBeTruthy()
      expect(content).toContain('<svg')
    })

    it('should return null if not exists', () => {
      const store = useUserSvgStore()
      const content = store.getUserSvgContent('user-svg-nonexistent')
      expect(content).toBeNull()
    })
  })

  describe('hasUserSvg', () => {
    it('should return true if SVG exists', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')

      expect(store.hasUserSvg(item!.id)).toBe(true)
    })

    it('should return false if SVG does not exist', () => {
      const store = useUserSvgStore()
      expect(store.hasUserSvg('user-svg-nonexistent')).toBe(false)
    })
  })

  describe('validateUploadedSvg', () => {
    it('should validate matching content and hash', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')

      const isValid = await store.validateUploadedSvg(validSvg, item!.hash)
      expect(isValid).toBe(true)
    })

    it('should reject mismatched content and hash', async () => {
      const store = useUserSvgStore()
      const item = await store.addUserSvg(validSvg, 'Test')

      const isValid = await store.validateUploadedSvg(validSvg2, item!.hash)
      expect(isValid).toBe(false)
    })
  })

  describe('clearAllUserSvgs', () => {
    it('should clear all items', async () => {
      const store = useUserSvgStore()
      await store.addUserSvg(validSvg, 'Test 1')
      await store.addUserSvg(validSvg2, 'Test 2')
      expect(store.items.value.length).toBe(2)

      store.clearAllUserSvgs()
      expect(store.items.value.length).toBe(0)
    })

    it('should persist clear to localStorage', async () => {
      const store = useUserSvgStore()
      await store.addUserSvg(validSvg, 'Test')
      store.clearAllUserSvgs()

      const stored = localStorageMock[USER_ASSET_CONFIG.SVG_LOCALSTORAGE_KEY]
      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const store = useUserSvgStore()
      await store.addUserSvg(validSvg, 'Test 1')
      await store.addUserSvg(validSvg2, 'Test 2')

      const stats = store.getStats()
      expect(stats.totalItems).toBe(2)
      expect(stats.totalSizeBytes).toBeGreaterThan(0)
      expect(stats.maxItems).toBe(USER_ASSET_CONFIG.MAX_SVG_COUNT)
      expect(stats.remainingSlots).toBe(USER_ASSET_CONFIG.MAX_SVG_COUNT - 2)
      expect(stats.canAddMore).toBe(true)
      expect(stats.isLoaded).toBe(true)
    })

    it('should show canAddMore=false when quota reached', async () => {
      const store = useUserSvgStore()

      // Mock reaching quota
      const maxCount = USER_ASSET_CONFIG.MAX_SVG_COUNT
      for (let i = 0; i < maxCount; i++) {
        const uniqueSvg = `<svg><circle cx="${i}" cy="${i}" r="40" /></svg>`
        await store.addUserSvg(uniqueSvg)
      }

      const stats = store.getStats()
      expect(stats.canAddMore).toBe(false)
      expect(stats.remainingSlots).toBe(0)
    })
  })

  describe('Computed Properties', () => {
    it('should track itemCount reactively', async () => {
      const store = useUserSvgStore()
      expect(store.itemCount.value).toBe(0)

      await store.addUserSvg(validSvg, 'Test')
      expect(store.itemCount.value).toBe(1)

      await store.addUserSvg(validSvg2, 'Test 2')
      expect(store.itemCount.value).toBe(2)
    })

    it('should track totalSizeBytes reactively', async () => {
      const store = useUserSvgStore()
      expect(store.totalSizeBytes.value).toBe(0)

      await store.addUserSvg(validSvg, 'Test')
      expect(store.totalSizeBytes.value).toBeGreaterThan(0)
    })

    it('should track canAddMore reactively', async () => {
      const store = useUserSvgStore()
      expect(store.canAddMore.value).toBe(true)

      // Add items until quota reached
      const maxCount = USER_ASSET_CONFIG.MAX_SVG_COUNT
      for (let i = 0; i < maxCount; i++) {
        const uniqueSvg = `<svg><circle cx="${i}" cy="${i}" r="40" /></svg>`
        await store.addUserSvg(uniqueSvg)
      }

      expect(store.canAddMore.value).toBe(false)
    })
  })
})
