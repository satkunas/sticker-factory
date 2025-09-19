<template>
  <Modal :show="show" title="Import Data" @close="$emit('close')">
    <div class="space-y-6">
      <p class="text-sm text-secondary-600">
        Import sticker data from JSON text or by uploading a file.
      </p>
      
      <!-- Tab Selection -->
      <div class="flex rounded-lg border border-secondary-200 bg-secondary-50 p-1">
        <button
          :class="[
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            activeTab === 'text' 
              ? 'bg-white text-secondary-900 shadow-sm' 
              : 'text-secondary-600 hover:text-secondary-900'
          ]"
          @click="activeTab = 'text'"
        >
          Paste JSON
        </button>
        <button
          :class="[
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
            activeTab === 'file' 
              ? 'bg-white text-secondary-900 shadow-sm' 
              : 'text-secondary-600 hover:text-secondary-900'
          ]"
          @click="activeTab = 'file'"
        >
          Upload File
        </button>
      </div>

      <!-- JSON Text Input Tab -->
      <div v-if="activeTab === 'text'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            JSON Data
          </label>
          <textarea
            v-model="jsonText"
            placeholder="Paste your JSON data here..."
            class="w-full h-40 px-3 py-2 border border-secondary-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <button
          :disabled="!jsonText.trim()"
          class="btn-primary w-full flex items-center justify-center space-x-2"
          :class="{ 'opacity-50 cursor-not-allowed': !jsonText.trim() }"
          @click="importFromText"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span>Import Data</span>
        </button>
      </div>

      <!-- File Upload Tab -->
      <div v-if="activeTab === 'file'" class="space-y-4">
        <!-- Drag and Drop Area -->
        <div
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragOver 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-secondary-300 hover:border-secondary-400'
          ]"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <svg class="w-12 h-12 mx-auto text-secondary-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <p class="text-secondary-600 mb-2">
            <span class="font-medium">Drop a JSON file here</span> or click to select
          </p>
          <p class="text-sm text-secondary-500">
            Supports .json files
          </p>
          
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileSelect"
          >
          
          <button
            class="mt-4 btn-secondary"
            @click="$refs.fileInput.click()"
          >
            Select File
          </button>
        </div>
        
        <!-- Selected File Display -->
        <div v-if="selectedFile" class="p-4 bg-secondary-50 rounded-lg">
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-secondary-900 truncate">
                {{ selectedFile.name }}
              </p>
              <p class="text-sm text-secondary-500">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
            <button
              class="text-secondary-400 hover:text-secondary-600"
              @click="clearFile"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <button
          :disabled="!selectedFile"
          class="btn-primary w-full flex items-center justify-center space-x-2"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedFile }"
          @click="importFromFile"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <span>Import File</span>
        </button>
      </div>
      
      <!-- Error Display -->
      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
      
      <!-- Success Display -->
      <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-700">
          {{ successMessage }}
        </p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end">
        <button class="btn-secondary" @click="$emit('close')">
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import { useStore } from '../stores'
import { validateFileUpload, validateImportData } from '../utils/security'

interface Props {
  show: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const store = useStore()

// Tab state
const activeTab = ref('text')

// Text input
const jsonText = ref('')

// File upload
const selectedFile = ref(null)
const isDragOver = ref(false)

// Messages
const errorMessage = ref('')
const successMessage = ref('')

// Clear messages
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// Text import
const importFromText = async () => {
  clearMessages()
  try {
    const parsedData = JSON.parse(jsonText.value)
    const validation = validateImportData(parsedData)
    if (!validation.valid) {
      errorMessage.value = validation.error
      return
    }

    await store.importData(jsonText.value)
    successMessage.value = 'Data imported successfully!'
    jsonText.value = ''
  } catch (error) {
    if (error instanceof SyntaxError) {
      errorMessage.value = 'Invalid JSON format'
    } else {
      errorMessage.value = error.message || 'Failed to import data'
    }
  }
}

// File handling
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const validation = validateFileUpload(file)
  if (!validation.valid) {
    errorMessage.value = validation.error
    return
  }

  selectedFile.value = file
  clearMessages()
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false

  const file = e.dataTransfer.files[0]
  if (!file) return

  const validation = validateFileUpload(file)
  if (!validation.valid) {
    errorMessage.value = validation.error
    return
  }

  selectedFile.value = file
  clearMessages()
}

const handleDragOver = (e) => {
  e.preventDefault()
}

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  clearMessages()
}

const importFromFile = async () => {
  if (!selectedFile.value) return

  clearMessages()
  try {
    const text = await selectedFile.value.text()
    const parsedData = JSON.parse(text)
    const validation = validateImportData(parsedData)
    if (!validation.valid) {
      errorMessage.value = validation.error
      return
    }

    await store.importData(text)
    successMessage.value = 'File imported successfully!'
    selectedFile.value = null
  } catch (error) {
    if (error instanceof SyntaxError) {
      errorMessage.value = 'Invalid JSON format in file'
    } else {
      errorMessage.value = error.message || 'Failed to import file'
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>