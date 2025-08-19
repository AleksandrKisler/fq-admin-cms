<template>
  <div class="space-y-2">
    <div class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</div>

    <div
        class="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 grid place-items-center text-center px-4"
        :class="aspectRatioClass"
    >
      <template v-if="title">
        <div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ kind === 'banner' ? 'Баннер' : 'Подборка' }}
          </div>
          <div class="font-medium truncate max-w-[80%] mx-auto">
            {{ title }}
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-gray-400 dark:text-white/60">
          {{ emptyText }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
type Kind = 'banner' | 'selection'

const props = defineProps<{
  label?: string
  kind: Kind
  title?: string | null
  emptyText?: string
  double?: boolean
}>()

const aspectRatioClass = computed(() => (props.double ? 'aspect-[16/18]' : 'aspect-[16/9]'))
</script>

<style scoped>
</style>
