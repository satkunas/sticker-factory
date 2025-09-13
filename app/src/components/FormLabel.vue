<template>
  <label class="block text-sm font-medium text-secondary-700 mb-2">
    {{ text }}
  </label>
</template>

<script setup lang="ts">
interface Props {
  text: string
}

defineProps<Props>()
</script>