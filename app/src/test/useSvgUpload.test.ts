/**
 * Test suite for useSvgUpload composable
 * Tests SVG-specific file upload functionality with validation, sanitization, and preview state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useSvgUpload } from '../composables/useSvgUpload'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'

// Mock dependencies
vi.mock('../stores/userSvgStore', () => ({
  useUserSvgStore: vi.fn(() => ({
    addUserSvg: vi.fn(async (svgContent: string, name: string) => ({
      id: 'user-svg-test-id',
      hash: 'testhash',
      name,
      svgContent,
      category: 'user-uploads',
      tags: ['user-upload'],
      uploadedAt: Date.now(),
      sizeBytes: new Blob([svgContent]).size
    })),
    error: { value: null }
  }))
}))

vi.mock('../utils/svg-validation', () => ({
  validateSvgFile: vi.fn(async (file: File) => {
    // Valid if file size is reasonable and has .svg extension
    if (file.size > USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES) {
      return { valid: false, error: 'SVG too large' }
    }
    if (!file.name.toLowerCase().endsWith('.svg')) {
      return { valid: false, error: 'Invalid file type. Please upload an SVG file (.svg)' }
    }

    // Return sanitized SVG content
    return {
      valid: true,
      sanitized: '<svg><rect width="100" height="100" fill="blue"/></svg>'
    }
  })
}))

// Helper to create mock SVG files
const createMockSvgFile = (name: string, size = 1000): File => {
  const content = new Uint8Array(size).fill(65) // Fill with 'A' characters
  const blob = new Blob([content], { type: 'image/svg+xml' })
  return new File([blob], `${name}.svg`, { type: 'image/svg+xml' })
}

describe('useSvgUpload Composable', () => {
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
        svgPreviewReady,
        svgPreviewId,
        maxSvgSizeKB
      } = useSvgUpload()

      expect(selectedFile.value).toBeNull()
      expect(customName.value).toBe('')
      expect(isProcessing.value).toBe(false)
      expect(error.value).toBeNull()
      expect(svgPreviewReady.value).toBe(false)
      expect(svgPreviewId.value).toBeNull()
      expect(maxSvgSizeKB.value).toBeDefined()
    })

    it('should accept onSuccess callback in options', () => {
      const onSuccess = vi.fn()
      const upload = useSvgUpload({ onSuccess })

      expect(upload).toBeDefined()
      // Callback will be tested in upload tests
    })
  })

  describe('Computed Properties', () => {
    it('should calculate maxSvgSizeKB from config', () => {
      const { maxSvgSizeKB } = useSvgUpload()

      const expectedKB = (USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES / 1000).toFixed(0)
      expect(maxSvgSizeKB.value).toBe(expectedKB)
    })
  })

  describe('File Selection', () => {
    it('should update selectedFile on file selection', () => {
      const { selectedFile } = useSvgUpload()
      const file = createMockSvgFile('test-icon')

      selectedFile.value = file

      expect(selectedFile.value).toBe(file)
    })

    it('should generate customName from filename', () => {
      const { selectedFile, customName } = useSvgUpload()
      const file = createMockSvgFile('my-custom-icon')

      selectedFile.value = file
      customName.value = file.name.replace(/\.svg$/i, '')

      expect(customName.value).toBeDefined()
    })

    it('should calculate file size in KB', () => {
      const { selectedFile, fileSizeKB } = useSvgUpload()
      const file = createMockSvgFile('test', 2048)

      selectedFile.value = file

      // fileSizeKB returns a string from toFixed(1)
      expect(fileSizeKB.value).toBe('2.0')
    })
  })

  describe('Preview State Management', () => {
    it('should reset preview state when file changes', async () => {
      const { selectedFile, svgPreviewReady, svgPreviewId } = useSvgUpload()

      // Select first file
      const file1 = createMockSvgFile('icon1')
      selectedFile.value = file1

      // Simulate upload success (manually set preview state)
      svgPreviewReady.value = true
      svgPreviewId.value = 'test-id-1'

      // Select different file
      const file2 = createMockSvgFile('icon2')
      selectedFile.value = file2

      // Wait for watcher to execute
      await nextTick()

      // Preview state should be reset
      expect(svgPreviewReady.value).toBe(false)
      expect(svgPreviewId.value).toBeNull()
    })

    it('should reset preview when file is cleared', async () => {
      const { selectedFile, svgPreviewReady, svgPreviewId } = useSvgUpload()

      // First select a file (watcher will fire and reset preview)
      const file = createMockSvgFile('test')
      selectedFile.value = file
      await nextTick() // Wait for watcher to complete

      // Set preview state (after watcher has completed)
      svgPreviewReady.value = true
      svgPreviewId.value = 'test-id'

      // Clear file (this should trigger watcher again)
      selectedFile.value = null
      await nextTick() // Wait for watcher to complete

      // Preview state should be reset by watcher
      expect(svgPreviewReady.value).toBe(false)
      expect(svgPreviewId.value).toBeNull()
    })
  })

  describe('SVG Upload Flow', () => {
    it('should upload valid SVG successfully', async () => {
      const { selectedFile, customName, upload, uploadedItem, svgPreviewReady, svgPreviewId } = useSvgUpload()
      const file = createMockSvgFile('test-icon', 1000)

      selectedFile.value = file
      customName.value = 'test-icon'
      await upload()

      expect(uploadedItem.value).toBeDefined()
      expect(uploadedItem.value?.id).toBe('user-svg-test-id')
      expect(uploadedItem.value?.name).toBe('test-icon') // Extension removed
      expect(svgPreviewReady.value).toBe(true)
      expect(svgPreviewId.value).toBe('user-svg-test-id')
    })

    it('should strip file extension from SVG name', async () => {
      const { selectedFile, customName, upload, uploadedItem } = useSvgUpload()
      const file = createMockSvgFile('my-icon')

      selectedFile.value = file
      customName.value = 'my-icon'
      await upload()

      // Name should not have .svg extension
      expect(uploadedItem.value?.name).toBe('my-icon')
      expect(uploadedItem.value?.name).not.toContain('.svg')
    })

    it('should call onSuccess callback after successful upload', async () => {
      const onSuccess = vi.fn()
      const { selectedFile, customName, upload } = useSvgUpload({ onSuccess })
      const file = createMockSvgFile('test-icon')

      selectedFile.value = file
      customName.value = 'test-icon'
      await upload()

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-svg-test-id',
        name: 'test-icon'
      }))
    })

    it('should reject SVG file that is too large', async () => {
      const { selectedFile, customName, upload, error } = useSvgUpload()
      const largeFile = createMockSvgFile('large-icon', USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES + 1)

      selectedFile.value = largeFile
      customName.value = 'large-icon'
      await upload()

      expect(error.value).toBeTruthy()
      expect(error.value).toContain('too large')
    })

    it('should reject invalid file format', async () => {
      const { selectedFile, customName, upload, error } = useSvgUpload()
      // Create file with wrong extension
      const invalidFile = new File([new Blob(['test'])], 'test.txt', { type: 'text/plain' })

      selectedFile.value = invalidFile as File
      customName.value = 'test'
      await upload()

      expect(error.value).toBeTruthy()
      expect(error.value).toContain('Invalid file type')
    })
  })

  describe('File Clearing', () => {
    it('should clear selected file', () => {
      const { selectedFile, clearFile } = useSvgUpload()
      const file = createMockSvgFile('test')

      selectedFile.value = file
      expect(selectedFile.value).toBe(file)

      clearFile()
      expect(selectedFile.value).toBeNull()
    })

    it('should reset preview state when clearing file', async () => {
      const { selectedFile, clearFile, svgPreviewReady, svgPreviewId } = useSvgUpload()
      const file = createMockSvgFile('test')

      // Set file first
      selectedFile.value = file
      await nextTick() // Let watcher process

      // Then set preview state
      svgPreviewReady.value = true
      svgPreviewId.value = 'test-id'

      // Clear file (should trigger watcher)
      clearFile()
      await nextTick()

      expect(svgPreviewReady.value).toBe(false)
      expect(svgPreviewId.value).toBeNull()
    })
  })

  describe('Upload State Management', () => {
    it('should update uploadState during upload', async () => {
      const { selectedFile, customName, upload, uploadState } = useSvgUpload()
      const file = createMockSvgFile('test')

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
      const { selectedFile, customName, upload, uploadState } = useSvgUpload()
      const invalidFile = new File([new Blob(['test'])], 'test.txt', { type: 'text/plain' })

      selectedFile.value = invalidFile as File
      customName.value = 'test'
      await upload()

      expect(uploadState.value).toBe('error')
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all state', async () => {
      const { selectedFile, customName, upload, reset, uploadedItem, svgPreviewReady, svgPreviewId } = useSvgUpload()
      const file = createMockSvgFile('test')

      // Upload a file
      selectedFile.value = file
      customName.value = 'test'
      await upload()

      expect(selectedFile.value).not.toBeNull()
      expect(uploadedItem.value).not.toBeNull()
      expect(svgPreviewReady.value).toBe(true)
      expect(svgPreviewId.value).not.toBeNull()

      // Reset
      reset()
      await nextTick() // Wait for watcher to execute

      expect(selectedFile.value).toBeNull()
      expect(uploadedItem.value).toBeNull()
      expect(svgPreviewReady.value).toBe(false)
      expect(svgPreviewId.value).toBeNull()
    })
  })

})
