<template>
  <div :class="align">
    <div class="overflow-hidden rounded-xl border bg-white" :style="aspect">
      <img v-if="block.image" :src="$fileUrl(block.image)" class="w-full h-full object-cover"/>
    </div>
    <div v-if="block.caption" class="text-xs text-gray-500 mt-1">{{ block.caption }}</div>
  </div>
</template>

<script setup>
const props = defineProps({ block: { type: Object, required: true } })
const { $fileUrl } = useNuxtApp()
const align = computed(() => props.block.align === 'left' ? 'mr-auto'
    : props.block.align === 'right' ? 'ml-auto' : 'mx-auto')
const aspect = computed(() => `aspect-ratio: ${props.block.ratio || '16/9'}`)
</script>
