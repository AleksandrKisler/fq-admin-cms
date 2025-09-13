<template>
  <div class="space-y-8">
    <div v-for="b in blocks" :key="b.id">
      <component :is="renders[b.type] || Unknown" :block="b"/>
    </div>
  </div>
</template>

<script setup>
import RenderHero from './renders/RenderHero.vue'
import RenderText from './renders/RenderText.vue'
import RenderImage from './renders/RenderImage.vue'
// import RenderImagePair from './renders/RenderImagePair.vue'
// import RenderGallery from './renders/RenderGallery.vue'
// import RenderQuote from './renders/RenderQuote.vue'
// import RenderNumber from './renders/RenderNumber.vue'
// import RenderDivider from './renders/RenderDivider.vue'
// import RenderSpacer from './renders/RenderSpacer.vue'

const props = defineProps({ blocks: { type: Array, default: () => [] } })

const renders = {
  'hero': RenderHero,
  'text': RenderText,
  'image': RenderImage,
  // 'image-pair': RenderImagePair,
  // 'gallery-masonry': RenderGallery,
  // 'quote': RenderQuote,
  // 'number': RenderNumber,
  // 'divider': RenderDivider,
  // 'spacer': RenderSpacer
}

const Unknown = {
  props: ['block'],
  template: `<div class="text-sm text-red-500">Unknown block: {{ block?.type }}</div>`
}
</script>
