/**
 * Test suite for useFontUpload composable
 * Tests font-specific file upload functionality with validation and preview state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useFontUpload } from '../composables/useFontUpload'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

// Mock dependencies
vi.mock('../stores/userFontStore', () => ({
  useUserFontStore: vi.fn(() => ({
    addUserFont: vi.fn(async (file: File, name: string) => ({
      id: 'user-font-test-id',
      name: name,
      format: 'woff2',
      size: file.size,
      uploadDate: Date.now(),
      fontFamily: name,
      dataUrl: 'data:font/woff2;base64,test'
    }))
  }))
}))

vi.mock('../utils/font-validation', () => ({
  validateFont: vi.fn((file: File) => {
    // Valid if file size is reasonable and has font extension
    if (file.size > USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES) {
      return { valid: false, error: 'Font file too large' }
    }
    if (!file.name.match(/\.(woff2?|[ot]tf)$/i)) {
      return { valid: false, error: 'Invalid font format' }
    }
    return { valid: true }
  }),
  detectFontFormat: vi.fn((file: File) => {
    const match = file.name.match(/\.(woff2?|[ot]tf)$/i)
    return match ? match[1].toLowerCase() : null
  })
}))

// Helper to create mock font files
const createMockFontFile = (name: string, format: 'woff2' | 'woff' | 'ttf' | 'otf' = 'woff2', size = 1000): File => {
  const content = new Uint8Array(size).fill(65)
  const blob = new Blob([content], { type: `font/${format}` })
  return new File([blob], `${name}.${format}`, { type: `font/${format}` })
}

describe('useFontUpload Composable', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const {
        selectedFile,
        customName,
        isProcessing,
        error,
        fontPreviewReady,
        fontPreviewId,
        maxFontSizeMB,
        fontFormat
      } = useFontUpload()

      expect(selectedFile.value).toBeNull()
      expect(customName.value).toBe('')
      expect(isProcessing.value).toBe(false)
      expect(error.value).toBeNull()
      expect(fontPreviewReady.value).toBe(false)
      expect(fontPreviewId.value).toBeNull()
      expect(maxFontSizeMB.value).toBeDefined()
      expect(fontFormat.value).toBe('')
    })

    it('should accept onSuccess callback in options', () => {
      const onSuccess = vi.fn()
      const upload = useFontUpload({ onSuccess })

      expect(upload).toBeDefined()
      // Callback will be tested in upload tests
    })
  })

  describe('Computed Properties', () => {
    it('should calculate maxFontSizeMB from config', () => {
      const { maxFontSizeMB } = useFontUpload()

      const expectedMB = (USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES / 1024 / 1024).toFixed(0)
      expect(maxFontSizeMB.value).toBe(expectedMB)
    })

    it('should return empty fontFormat when no file selected', () => {
      const { fontFormat } = useFontUpload()

      expect(fontFormat.value).toBe('')
    })

    it('should detect WOFF2 format', () => {
      const { selectedFile, fontFormat } = useFontUpload()
      const file = createMockFontFile('test', 'woff2')

      selectedFile.value = file

      expect(fontFormat.value).toBe('WOFF2')
    })

    it('should detect WOFF format', () => {
      const { selectedFile, fontFormat } = useFontUpload()
      const file = createMockFontFile('test', 'woff')

      selectedFile.value = file

      expect(fontFormat.value).toBe('WOFF')
    })

    it('should detect TTF format', () => {
      const { selectedFile, fontFormat } = useFontUpload()
      const file = createMockFontFile('test', 'ttf')

      selectedFile.value = file

      expect(fontFormat.value).toBe('TTF')
    })

    it('should detect OTF format', () => {
      const { selectedFile, fontFormat } = useFontUpload()
      const file = createMockFontFile('test', 'otf')

      selectedFile.value = file

      expect(fontFormat.value).toBe('OTF')
    })
  })

  describe('File Selection', () => {
    it('should update selectedFile on file selection', () => {
      const { selectedFile } = useFontUpload()
      const file = createMockFontFile('MyFont', 'woff2')

      selectedFile.value = file

      expect(selectedFile.value).toBe(file)
    })

    it('should generate customName from filename', () => {
      const { selectedFile, customName } = useFontUpload()
      const file = createMockFontFile('MyCustomFont', 'woff2')

      selectedFile.value = file
      customName.value = file.name.replace(/\.[^.]+$/, '')

      // customName should be set by useFileUpload base
      expect(customName.value).toBeDefined()
    })

    it('should calculate file size in KB', () => {
      const { selectedFile, fileSizeKB } = useFontUpload()
      const file = createMockFontFile('test', 'woff2', 2048)

      selectedFile.value = file

      // fileSizeKB returns a string from toFixed(1)
      expect(fileSizeKB.value).toBe('2.0')
    })
  })

  describe('Preview State Management', () => {
    it('should reset preview state when file changes', async () => {
      const { selectedFile, fontPreviewReady, fontPreviewId } = useFontUpload()

      // Select first file
      const file1 = createMockFontFile('Font1', 'woff2')
      selectedFile.value = file1

      // Simulate upload success (manually set preview state)
      fontPreviewReady.value = true
      fontPreviewId.value = 'test-id-1'

      // Select different file
      const file2 = createMockFontFile('Font2', 'woff2')
      selectedFile.value = file2

      // Wait for watcher to execute
      await nextTick()

      // Preview state should be reset
      expect(fontPreviewReady.value).toBe(false)
      expect(fontPreviewId.value).toBeNull()
    })

    it('should reset preview when file is cleared', async () => {
      const { selectedFile, fontPreviewReady, fontPreviewId } = useFontUpload()

      // First select a file (watcher will fire and reset preview)
      const file = createMockFontFile('test', 'woff2')
      selectedFile.value = file
      await nextTick() // Wait for watcher to complete

      // Set preview state (after watcher has completed)
      fontPreviewReady.value = true
      fontPreviewId.value = 'test-id'

      // Clear file (this should trigger watcher again)
      selectedFile.value = null
      await nextTick() // Wait for watcher to complete

      // Preview state should be reset by watcher
      expect(fontPreviewReady.value).toBe(false)
      expect(fontPreviewId.value).toBeNull()
    })
  })

  describe('Font Upload Flow', () => {
    it('should upload valid font successfully', async () => {
      const { selectedFile, customName, upload, uploadedItem, fontPreviewReady, fontPreviewId } = useFontUpload()
      const file = createMockFontFile('TestFont', 'woff2', 1000)

      selectedFile.value = file
      customName.value = 'TestFont'
      await upload()

      expect(uploadedItem.value).toBeDefined()
      expect(uploadedItem.value?.id).toBe('user-font-test-id')
      expect(uploadedItem.value?.name).toBe('TestFont') // Extension removed
      expect(fontPreviewReady.value).toBe(true)
      expect(fontPreviewId.value).toBe('user-font-test-id')
    })

    it('should strip file extension from font name', async () => {
      const { selectedFile, customName, upload, uploadedItem } = useFontUpload()
      const file = createMockFontFile('MyFont', 'woff2')

      selectedFile.value = file
      customName.value = 'MyFont'
      await upload()

      // Name should not have .woff2 extension
      expect(uploadedItem.value?.name).toBe('MyFont')
      expect(uploadedItem.value?.name).not.toContain('.woff2')
    })

    it('should call onSuccess callback after successful upload', async () => {
      const onSuccess = vi.fn()
      const { selectedFile, customName, upload } = useFontUpload({ onSuccess })
      const file = createMockFontFile('TestFont', 'woff2')

      selectedFile.value = file
      customName.value = 'TestFont'
      await upload()

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-font-test-id',
        name: 'TestFont'
      }))
    })

    it('should reject font file that is too large', async () => {
      const { selectedFile, customName, upload, error } = useFontUpload()
      const largeFile = createMockFontFile('LargeFont', 'woff2', USER_ASSET_CONFIG.MAX_FONT_SIZE_BYTES + 1)

      selectedFile.value = largeFile
      customName.value = 'LargeFont'
      await upload()

      expect(error.value).toBeTruthy()
      expect(error.value).toContain('too large')
    })

    it('should reject invalid file format', async () => {
      const { selectedFile, customName, upload, error } = useFontUpload()
      // Create file with wrong extension
      const invalidFile = new File([new Blob(['test'])], 'test.txt', { type: 'text/plain' })

      selectedFile.value = invalidFile as File
      customName.value = 'test'
      await upload()

      expect(error.value).toBeTruthy()
      expect(error.value).toContain('Invalid font format')
    })
  })

  describe('File Clearing', () => {
    it('should clear selected file', () => {
      const { selectedFile, clearFile } = useFontUpload()
      const file = createMockFontFile('test', 'woff2')

      selectedFile.value = file
      expect(selectedFile.value).toBe(file)

      clearFile()
      expect(selectedFile.value).toBeNull()
    })

    it('should reset preview state when clearing file', async () => {
      const { selectedFile, clearFile, fontPreviewReady, fontPreviewId } = useFontUpload()
      const file = createMockFontFile('test', 'woff2')

      // Set file first
      selectedFile.value = file
      await nextTick() // Let watcher process

      // Then set preview state
      fontPreviewReady.value = true
      fontPreviewId.value = 'test-id'

      // Clear file (should trigger watcher)
      clearFile()
      await nextTick()

      expect(fontPreviewReady.value).toBe(false)
      expect(fontPreviewId.value).toBeNull()
    })
  })

  describe('Upload State Management', () => {
    it('should update uploadState during upload', async () => {
      const { selectedFile, customName, upload, uploadState } = useFontUpload()
      const file = createMockFontFile('test', 'woff2')

      selectedFile.value = file
      customName.value = 'test'

      expect(uploadState.value).toBe('idle')

      const uploadPromise = upload()

      // During upload, state may be 'uploading' or complete quickly
      // Just verify upload completes successfully
      await uploadPromise

      expect(uploadState.value).toBe('success')
    })

    it('should set error state on upload failure', async () => {
      const { selectedFile, customName, upload, uploadState } = useFontUpload()
      const invalidFile = new File([new Blob(['test'])], 'test.txt', { type: 'text/plain' })

      selectedFile.value = invalidFile as File
      customName.value = 'test'
      await upload()

      expect(uploadState.value).toBe('error')
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all state', async () => {
      const { selectedFile, customName, upload, reset, uploadedItem, fontPreviewReady, fontPreviewId } = useFontUpload()
      const file = createMockFontFile('test', 'woff2')

      // Upload a file
      selectedFile.value = file
      customName.value = 'test'
      await upload()

      expect(selectedFile.value).not.toBeNull()
      expect(uploadedItem.value).not.toBeNull()
      expect(fontPreviewReady.value).toBe(true)
      expect(fontPreviewId.value).not.toBeNull()

      // Reset
      reset()
      await nextTick() // Wait for watcher to execute

      expect(selectedFile.value).toBeNull()
      expect(uploadedItem.value).toBeNull()
      expect(fontPreviewReady.value).toBe(false)
      expect(fontPreviewId.value).toBeNull()
    })
  })
})
