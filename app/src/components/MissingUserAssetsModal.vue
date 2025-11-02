<template>
  <div v-if="isOpen && hasMissingAssets" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <!-- Header -->
        <div class="mb-4">
          <div class="flex items-center">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-secondary-900">
                Missing Uploaded Images
              </h3>
              <p class="mt-1 text-sm text-secondary-500">
                This design uses {{ missingSvgIds.length }} {{ missingSvgIds.length === 1 ? 'image' : 'images' }} that {{ missingSvgIds.length === 1 ? "isn't" : "aren't" }} in your library.
              </p>
            </div>
          </div>
        </div>

        <!-- Missing Assets List -->
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="svgId in missingSvgIds"
            :key="svgId"
            class="border border-secondary-200 rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-secondary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-secondary-900">{{ svgId }}</p>
                    <p class="text-xs text-secondary-500 mt-1">
                      Hash: {{ extractHash(svgId) }}
                    </p>
                  </div>
                </div>

                <!-- Upload success message -->
                <div v-if="uploadedAssets.has(svgId)" class="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center">
                  <svg class="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-green-800">Uploaded successfully!</span>
                </div>

                <!-- Upload error message -->
                <div v-if="uploadErrors.get(svgId)" class="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p class="text-sm text-red-800">{{ uploadErrors.get(svgId) }}</p>
                </div>

                <!-- Integrated upload UI (only if not uploaded yet) -->
                <div v-if="!uploadedAssets.has(svgId)" class="mt-3 border-t border-secondary-200 pt-3">
                  <label class="block">
                    <div class="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-secondary-300 rounded-md hover:border-primary-400 transition-colors cursor-pointer">
                      <svg class="w-5 h-5 text-secondary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span class="text-sm text-secondary-600">Upload SVG file</span>
                    </div>
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      class="hidden"
                      @change="handleFileUpload($event, svgId)"
                    >
                  </label>
                  <p class="mt-1 text-xs text-secondary-500 text-center">
                    Upload the correct SVG file to use in this design
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex">
            <svg class="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div class="text-xs text-blue-800">
              <p class="font-medium mb-1">Why am I seeing this?</p>
              <p>This design was shared with user-uploaded images that aren't in your browser yet. Upload the same files to see them.</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end space-x-3">
          <button
            v-if="hasUploadedAny"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            @click="closeAndRefresh"
          >
            Continue with Uploaded Images
          </button>
          <button
            v-else
            type="button"
            class="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            @click="closeModal"
          >
            {{ hasUploadedAny ? 'Skip Missing' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserSvgStore } from '../stores/userSvgStore'
import { extractHashFromAssetId } from '../utils/asset-hash'
import { validateSvgFile } from '../utils/svg-validation'
import { USER_ASSET_CONFIG } from '../utils/ui-constants'
import { logger } from '../utils/logger'

interface Props {
  isOpen: boolean
  missingSvgIds: string[]
  missingFontIds: string[] // Future: font support
}

interface Emits {
  'close': []
  'refresh': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Store
const userSvgStore = useUserSvgStore()

// Component state
const uploadedAssets = ref<Set<string>>(new Set())
const uploadErrors = ref<Map<string, string>>(new Map())

// Computed properties
const hasMissingAssets = computed(() => props.missingSvgIds.length > 0)
const hasUploadedAny = computed(() => uploadedAssets.value.size > 0)

// Extract hash from asset ID
const extractHash = (assetId: string): string => {
  return extractHashFromAssetId(assetId) || 'unknown'
}

// Handle file upload
const handleFileUpload = async (event: Event, assetId: string) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]

  try {
    // Clear previous error for this asset
    uploadErrors.value.delete(assetId)

    // Validate file using consolidated validation function
    const validation = await validateSvgFile(file, USER_ASSET_CONFIG.MAX_SVG_SIZE_BYTES)
    if (!validation.valid) {
      uploadErrors.value.set(assetId, validation.error || 'SVG validation failed')
      return
    }

    const svgContent = validation.sanitized!

    // Get expected hash
    const expectedHash = extractHashFromAssetId(assetId)
    if (!expectedHash) {
      uploadErrors.value.set(assetId, 'Invalid asset ID format')
      return
    }

    // Validate hash matches
    const isValid = await userSvgStore.validateUploadedSvg(svgContent, expectedHash)
    if (!isValid) {
      uploadErrors.value.set(assetId, 'Wrong file uploaded. Hash does not match.')
      return
    }

    // Upload to store
    const item = await userSvgStore.addUserSvg(svgContent, file.name.replace('.svg', ''))

    if (!item) {
      uploadErrors.value.set(assetId, userSvgStore.error.value || 'Failed to upload SVG')
      return
    }

    // Success!
    uploadedAssets.value.add(assetId)
    logger.info('Successfully uploaded missing asset:', assetId)

  } catch (error) {
    logger.error('Upload error for missing asset:', assetId, error)
    uploadErrors.value.set(assetId, error instanceof Error ? error.message : 'Upload failed')
  } finally {
    // Reset input
    input.value = ''
  }
}

// Close modal
const closeModal = () => {
  uploadedAssets.value.clear()
  uploadErrors.value.clear()
  emit('close')
}

// Close and refresh (reload URL to apply newly uploaded assets)
const closeAndRefresh = () => {
  uploadedAssets.value.clear()
  uploadErrors.value.clear()
  emit('refresh')
}
</script>
