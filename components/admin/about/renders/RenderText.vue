<template>
  <div :class="wrap">
    <div class="prose prose-sm max-w-none" v-html="block.html"></div>
  </div>
</template>

<script setup>
const props = defineProps({ block: { type: Object, required: true } })
const widthMap = { narrow: 'max-w-prose', normal: 'max-w-3xl', wide: 'max-w-5xl' }
const alignMap = { left: 'mx-0', center: 'mx-auto', right: 'ml-auto' }
const wrap = computed(() => `${widthMap[props.block.width] || 'max-w-3xl'} ${alignMap[props.block.align] || 'mx-auto'}`)
</script>
