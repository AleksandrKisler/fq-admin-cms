<template>
  <div
      class="relative rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900"
      :class="aspectClass"
  >
    <!-- DEFAULT: фон на весь блок, текст по центру -->
    <template v-if="pos === 'DEFAULT'">
      <div
          v-if="imageUrl"
          class="absolute inset-0 bg-center bg-no-repeat"
          :class="bgModeClass"
          :style="{ backgroundImage: `url('${$fileUrl(imageUrl)}')` }"
      />
      <div class="relative h-full w-full grid place-items-center text-center p-6 md:p-10">
        <div class="w-full max-w-2xl" :style="textStyle">
          <h3 class="text-lg md:text-2xl font-semibold" v-html="fmt(title)"/>
          <p v-if="description" class="mt-2 text-sm md:text-base opacity-90" v-html="fmt(description)"/>
          <div v-if="showCTA" class="mt-4">
            <button type="button"
                    class="inline-flex items-center px-4 py-2 rounded-lg border border-white/40 text-white/90 hover:bg-white/10">
              {{ ctaText }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="imageUrl" class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent"/>
    </template>

    <!-- LEFT / RIGHT: сетка 2 колонки -->
    <template v-else>
      <div class="relative h-full w-full grid grid-cols-1 md:grid-cols-12">
        <!-- КОЛОНКА ИЗОБРАЖЕНИЯ -->
        <div
            class="relative overflow-hidden"
            :class="imgColClass"
        >
          <template v-if="imageUrl">
            <img :src="$fileUrl(imageUrl)" alt="" class="absolute inset-0 w-full h-full object-cover"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent"/>
          </template>
          <div v-else class="absolute inset-0 grid place-items-center text-gray-400 dark:text-white/60">
            Изображение баннера
          </div>
        </div>

        <!-- КОЛОНКА ТЕКСТА -->
        <div
            class="relative flex items-center justify-center p-6 md:p-10"
            :class="textColClass"
        >
          <div class="w-full max-w-xl text-center md:text-left" :style="textStyle">
            <h3 class="text-lg md:text-2xl font-semibold" v-html="fmt(title)"/>
            <p v-if="description" class="mt-2 text-sm md:text-base opacity-90" v-html="fmt(description)"/>
            <div v-if="showCTA" class="mt-4">
              <button type="button"
                      class="inline-flex items-center px-4 py-2 rounded-lg border border-current/40 hover:bg-white/10">
                {{ ctaText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Плейсхолдер, если баннера нет вообще -->
    <div v-if="!banner" class="absolute inset-0 grid place-items-center text-gray-400 dark:text-white/60">
      Пустой баннер
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Мини-превью баннера для конструктора.
 * image_position: 'LEFT' | 'RIGHT' | 'DEFAULT'
 * type: 'INFORMATION' | 'COLLECTION' | 'PRODUCT' | 'MAIN'
 * italic: используйте *курсив* в title/description
 */
type BannerType = 'INFORMATION' | 'COLLECTION' | 'PRODUCT' | 'MAIN'
type Pos = 'LEFT' | 'RIGHT' | 'DEFAULT'

const props = defineProps<{
  banner?: any
  /** Принудительно удвоенная высота (для main) */
  double?: boolean
}>()

const {$fileUrl} = useNuxtApp()

const type = computed<BannerType>(() => (props.banner?.type || 'INFORMATION'))
const pos = computed<Pos>(() => (props.banner?.image_position || 'DEFAULT'))
const imageUrl = computed<string | null>(() => props.banner?.image_url || null)
const title = computed(() => props.banner?.title || '')
const description = computed(() => props.banner?.description || '')

/** Цвет текста из модели (font_color/text_color), по умолчанию белый */
const color = computed<string>(() => props.banner?.font_color || props.banner?.text_color || '#000000')
const textStyle = computed(() => ({color: color.value}))

/** CTA для подборки/продукта */
const showCTA = computed(() => type.value === 'COLLECTION' || type.value === 'PRODUCT')
const ctaText = computed(() => (type.value === 'PRODUCT' ? 'Купить' : 'Смотреть'))

/** Аспект (высота) */
const aspectClass = computed(() => {
  if (props.double || type.value === 'MAIN') return 'aspect-[16/18]' // x2
  return 'aspect-[16/9]'
})

/** Фон: cover по умолчанию, можно подключить contain при желании */
const bgModeClass = computed(() => 'bg-cover')

/** Классы колонок для LEFT/RIGHT */
const imgColClass = computed(() => {
  // md: 6 колонок, на мобилке — целая строка
  if (pos.value === 'LEFT') {
    // изображение слева: на мобилке первым
    return 'md:col-span-6 order-1'
  }
  // RIGHT: изображение справа, а на мобилке — вторым
  return 'md:col-span-6 order-2'
})

const textColClass = computed(() => {
  if (pos.value === 'LEFT') {
    // текст справа, на мобилке — вторым
    return 'md:col-span-6 order-2'
  }
  // RIGHT: текст слева, на мобилке — первым
  return 'md:col-span-6 order-1'
})

/** Курсив: *слово* -> <em>слово</em> (безопасно) */
const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

const fmt = (s?: string) => {
  if (!s) return ''
  const safe = escapeHtml(s)
  return safe.replace(/\*(.+?)\*/g, '<em>$1</em>')
}
</script>
