<template>
  <div class="relative flex-shrink-0">
    <input
      :value="modelValue"
      type="color"
      class="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <div 
      class="w-10 h-10 rounded-lg border-2 border-secondary-300 cursor-pointer flex items-center justify-center transition-colors hover:border-secondary-400 bg-white"
    >
      <span 
        v-if="previewText"
        class="text-lg font-bold"
        :style="{ 
          fontFamily: fontFamily || 'Arial, sans-serif',
          color: modelValue 
        }"
      >
        {{ previewText }}
      </span>
      <div 
        v-else
        class="w-6 h-6 rounded"
        :style="{ backgroundColor: modelValue }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  previewText?: string
  fontFamily?: string
  textColor?: string
  backgroundColor?: string
  showPreview?: boolean
}

interface Emits {
  'update:modelValue': [value: string]
}

withDefaults(defineProps<Props>(), {
  previewText: '',
  fontFamily: 'Arial, sans-serif',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  showPreview: true
})

defineEmits<Emits>()
</script>