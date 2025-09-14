<template>
  <div
      class="bg-white dark:bg-neutral-900"
      role="button"
      @click="$emit('click', product)"
  >
    <div class="aspect-[1/1] bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded">
      <img
          v-if="img"
          :src="img"
          class="w-full h-full object-contain"
          :alt="product.title || 'Товар'"
      />
      <div v-else class="w-full h-full grid place-items-center text-xs opacity-50">
        Фото
      </div>
    </div>

    <div class="text-center mt-3 px-2">
      <div class="text-[12px] leading-snug line-clamp-2">
        {{ product.title || 'Название товара' }}
      </div>
      <div v-if="showPrice" class="text-[11px] opacity-60 mt-1">
        {{ formattedPrice }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Product = {
  id: number | string
  title?: string
  price?: number
  image_url?: string
}

const props = withDefaults(defineProps<{
  product: Product
  showPrice?: boolean
}>(), {
  showPrice: true
})

const emit = defineEmits<{ (e:'click', p: Product): void }>()

const { $fileUrl } = useNuxtApp()

const formattedPrice = computed(() =>
    ((props.product.price ?? 0) as number).toLocaleString('ru-RU') + ' ₽'
)

const img = computed(() => {
  const raw = props.product.image_url || ''
  return typeof $fileUrl === 'function' ? $fileUrl(raw) : raw
})
</script>
