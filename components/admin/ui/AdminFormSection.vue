<template>
  <section class="admin-section rounded-2xl border p-5 sm:p-6">
    <header class="mb-4">
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>
    </header>
    <div>
      <slot/>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string; description?: string }>()
</script>