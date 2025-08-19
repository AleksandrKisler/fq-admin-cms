<template>
  <section class="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
    <header v-if="title || description" class="px-6 pt-6">
      <h2 v-if="title" class="text-base font-medium text-gray-900">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
    </header>
    <div class="p-6">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string; description?: string }>()
</script>
