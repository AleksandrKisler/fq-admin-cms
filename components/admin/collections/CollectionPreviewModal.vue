<template>
  <el-dialog
      v-model="open"
      :show-close="false"
      class="collection-preview-modal"
      width="90%"
      top="4vh"
  >
    <!-- header (до фото) -->
    <header class="text-center px-4 pt-2">
      <div class="text-[11px] uppercase tracking-[.18em] text-gray-400 dark:text-gray-500 italic">
        Коллекция
      </div>
      <h2 class="mt-1 font-semibold text-gray-900 dark:text-white
                 text-[22px] md:text-[26px] leading-none tracking-wide">
        {{ title || 'ЧЁРНАЯ ПАНТЕРА' }}
      </h2>
      <div v-if="productsCount>0" class="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {{ modelsLabel }}
      </div>
    </header>

    <!-- hero image (сразу после заголовка) -->
    <section class="mt-4 relative rounded-2xl overflow-hidden
                    border border-gray-100 dark:border-white/10 bg-gray-100/40 dark:bg-white/5">
      <div class="relative aspect-[16/9]">
        <img
            v-if="bgSrc"
            :src="bgSrc"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
        />
        <div
            v-else
            class="absolute inset-0 grid place-items-center text-gray-400 dark:text-white/60
                 border-2 border-dashed border-gray-200 dark:border-white/15"
        >
          Обложка 1920×1080
        </div>

        <!-- вертикальный «шов» по центру -->
        <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-black/10 dark:bg-white/10"/>
      </div>
    </section>

    <!-- «полоса» c описанием (сразу под фото) -->
    <section class="bg-white dark:bg-neutral-900">
      <div class="px-4">
        <p v-if="description"
           class="mx-auto max-w-[740px] text-center
                  text-[10px] leading-[14px] tracking-[.18em]
                  text-gray-600 dark:text-gray-300 py-6">
          {{ description }}
        </p>
      </div>
    </section>

    <!-- сетка товаров -->
    <section class="mt-8 px-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard
            v-for="p in normalizedProducts"
            :key="p.id ?? p.sku ?? p.title"
            :product="{
               id: p.id ?? p.sku,
               title: p.title,
               final_price: p.price,
               preview_image: p.image_url
            }"
        />
        <!-- заглушки, если менее 3 -->
        <div
            v-for="n in Math.max(0, 3 - normalizedProducts.length)"
            :key="'ph'+n"
            class="aspect-[4/3] rounded-2xl border border-gray-100 dark:border-white/10
                 bg-gray-50 dark:bg-white/5 grid place-items-center
                 text-gray-400 dark:text-white/60 text-xs"
        >
          Товар
        </div>
      </div>
    </section>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <el-button @click="close">Закрыть</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import ProductCard from './ProductCard.vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  previewImage?: string
  tempPreviewUrl?: string | null
  products?: Array<Partial<{
    id: number | string
    sku: string
    title: string
    price: number
    image_url: string
    preview_image: string
    thumbnail: string
  }>>
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
const {$fileSSRUrl} = useNuxtApp()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
const close = () => (open.value = false)

/** фон из temp → $fileUrl */
const bgSrc = computed(() => {
  if (props.tempPreviewUrl) return props.tempPreviewUrl
  try {
    return (typeof $fileSSRUrl === 'function' ? $fileSSRUrl(props.previewImage || '') : '') || ''
  } catch {
    return ''
  }
})

const title = computed(() => props.title || '')
const description = computed(() => props.description || '')
const normalizedProducts = computed(() => props.products ?? [])
const productsCount = computed(() => normalizedProducts.value.length)

/** 32 модели / 21 модель / 5 моделей */
const modelsLabel = computed(() => {
  const n = productsCount.value
  const mod10 = n % 10, mod100 = n % 100
  const word =
      mod10 === 1 && mod100 !== 11 ? 'модель'
          : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'модели'
              : 'моделей'
  return `${n} ${word}`
})

/** картинка товара: как в баннерах */
const productImage = (p: any) => {
  const raw = p?.image_url || p?.preview_image || p?.thumbnail || ''
  if (raw) console.log(raw)
  try {
    return (typeof $fileSSRUrl === 'function' ? $fileSSRUrl(raw) : raw) || ''
  } catch {
    return raw || ''
  }
}
</script>

<style scoped>
.collection-preview-modal :deep(.el-dialog__header) {
  display: none;
}

.collection-preview-modal :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  background: var(--el-bg-color);
}
</style>
