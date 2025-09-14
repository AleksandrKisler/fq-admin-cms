<template>
  <component
      :is="linkTo ? NuxtLink : 'div'"
      :to="linkTo"
      class="product-card block rounded-2xl overflow-hidden border bg-white dark:bg-neutral-900
           border-gray-200/80 dark:border-white/10 hover:shadow-md transition-shadow"
      @click="$emit('select', product)"
  >
    <!-- Фото -->
    <div
        class="relative w-full bg-gray-100 dark:bg-white/5"
        :class="imageAspectClass"
    >
      <img
          v-if="imageSrc"
          :src="imageSrc"
          alt=""
          class="absolute inset-0 w-full h-full object-contain p-[10%]"
          loading="lazy"
      />
      <div v-else class="absolute inset-0 grid place-items-center text-gray-400 text-xs">
        нет изображения
      </div>
    </div>

    <!-- Текст -->
    <div class="px-5 pt-5 pb-6 text-center">
      <h3
          class="text-[13px] leading-[1.35] tracking-wide text-gray-900 dark:text-white uppercase"
          v-html="titleHtml"
      />
      <div class="mt-2 text-[13px] italic text-gray-800 dark:text-gray-200">
        {{ priceLabel }}
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
/**
 * Карточка продукта “как в макете”
 * - большое фото на сером фоне
 * - заголовок в верхнем регистре, внутри поддерживается курсив (*так*, _так_ или [i]так[/i])
 * - цена внизу курсивом
 */
import { computed } from 'vue'
import { renderItalicsToHtml } from '~/utils/markup'
import {NuxtLink} from "#components";

type ImageObj = { file_url?: string; file_path?: string; url?: string }
type ProductLike = {
  id: number | string
  title?: string
  price?: number
  final_price?: number
  image_url?: string
  preview_image?: string
  images?: ImageObj[] | null
}

const props = defineProps<{
  product: ProductLike
  linkTo?: string | null
  /** Соотношение для блока с фото: '4/3' (по макету) или '1/1' */
  ratio?: '4/3' | '1/1'
}>()

defineEmits<{ (e: 'select', p: ProductLike): void }>()

const { $fileUrl } = useNuxtApp()

// Изображение: берём preview/image_url/первую из images
const imageSrc = computed(() => {
  const p = props.product || ({} as ProductLike)
  const direct =
      p.preview_image ||
      p.image_url ||
      (Array.isArray(p.images) && p.images[0]?.file_url) ||
      (Array.isArray(p.images) && p.images[0]?.url) ||
      (Array.isArray(p.images) && p.images[0]?.file_path) ||
      ''
  // $fileUrl может отсутствовать на раннем SSR — защитимся
  try {
    return (typeof $fileUrl === 'function' ? $fileUrl(direct) : direct) || ''
  } catch {
    return direct || ''
  }
})

const imageAspectClass = computed(() =>
    props.ratio === '1/1' ? 'aspect-[1/1]' : 'aspect-[4/3]'
)

// Заголовок с поддержкой курсивных фрагментов
const titleHtml = computed(() =>
    renderItalicsToHtml(props.product?.title || '')
        // дополнительная стилизация <em> как в макете
        .replaceAll('<em>', '<em class="not-italic font-serif italic">')
)

// Цена
const priceLabel = computed(() => {
  const val = Number(
      props.product?.final_price ?? props.product?.price ?? 0
  )
  const fmt = new Intl.NumberFormat('ru-RU').format(val)
  return `${fmt} ₽`
})
</script>

<style scoped>
.product-card :deep(em) {
  font-style: italic;
}
</style>
