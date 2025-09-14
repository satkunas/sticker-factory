<template>
  <Modal :show="show" title="Export Data" @close="$emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-secondary-600">
        Export your sticker data as JSON. You can copy the text or download as a file.
      </p>
      
      <!-- JSON Display -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          JSON Data
        </label>
        <textarea
          :value="jsonData"
          readonly
          class="w-full h-40 px-3 py-2 border border-secondary-300 rounded-lg bg-secondary-50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          @click="selectAll"
        />
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="copyToClipboard"
          class="btn-secondary flex-1 flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
          </svg>
          <span>{{ copyButtonText }}</span>
        </button>
        
        <button
          @click="downloadFile"
          class="btn-primary flex-1 flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>Download File</span>
        </button>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end">
        <button @click="$emit('close')" class="btn-secondary">
          Close
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import { useStore } from '../stores'

interface Props {
  show: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const store = useStore()
const copyButtonText = ref('Copy JSON')

const jsonData = computed(() => {
  return store.exportData()
})

const selectAll = (e) => {
  e.target.select()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(jsonData.value)
    copyButtonText.value = 'Copied!'
    setTimeout(() => {
      copyButtonText.value = 'Copy JSON'
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = jsonData.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copyButtonText.value = 'Copied!'
    setTimeout(() => {
      copyButtonText.value = 'Copy JSON'
    }, 2000)
  }
}

const downloadFile = () => {
  store.exportToFile()
}
</script>