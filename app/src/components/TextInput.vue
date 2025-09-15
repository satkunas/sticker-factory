<template>
  <input
    :value="modelValue"
    type="text"
    class="input-field flex-1"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  'update:modelValue': [value: string]
}

defineProps<Props>()
defineEmits<Emits>()
</script>