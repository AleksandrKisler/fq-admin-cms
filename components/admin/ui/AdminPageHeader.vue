<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div>
      <h1 class="transition-colors duration-150 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm mt-1 text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
