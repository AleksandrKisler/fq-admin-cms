<template>
  <div class="relative overflow-hidden rounded-xl">
    <div class="w-full" style="aspect-ratio: 16/9">
      <img v-if="img" :src="img" class="w-full h-full object-cover">
      <div class="absolute inset-0 grid">
        <div :class="['self-center px-6 py-8 text-white',
                     block.align==='left'?'justify-start text-left':
                     block.align==='right'?'justify-end text-right':'justify-center']">
          <h2 class="text-2xl font-semibold drop-shadow">{{ block.title }}</h2>
          <p v-if="block.subtitle" class="opacity-90 mt-1 drop-shadow">{{ block.subtitle }}</p>
          <NuxtLink v-if="block.cta" :to="block.cta.url" class="inline-block mt-3">
            <el-button round>{{ block.cta.label }}</el-button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ block: { type: Object, required: true } })
const { $fileUrl } = useNuxtApp()
const img = computed(() => {
  const v = props.block?.image || ''
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  return $fileUrl ? $fileUrl(v) : v
})
</script>
