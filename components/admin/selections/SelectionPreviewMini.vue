<template>
  <div class="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-6">
    <!-- header -->
    <div class="text-center mb-6">
      <div class="uppercase tracking-wide text-[18px] font-semibold text-gray-900 dark:text-white">
        {{ title || 'Сезонная коллекция' }}
      </div>
      <div
          v-if="subtitle"
          class="text-[14px] text-gray-500 dark:text-gray-400 italic mt-1"
          v-html="italic(subtitle)"
      />
      <div class="mt-3">
        <el-button size="small" plain>{{ ctaText }}</el-button>
      </div>
    </div>

    <!-- products row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
          v-for="(p, i) in cards"
          :key="i"
          class="rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900"
      >
        <div class="bg-gray-50 dark:bg-white/5" style="aspect-ratio: 4/3">
          <img
              v-if="p && p.image"
              :src="p.image"
              class="w-full h-full object-contain"
              :alt="p.title || ''"
          />
          <div
              v-else
              class="w-full h-full grid place-items-center text-gray-400 dark:text-white/50 text-xs"
          >
            {{ p ? 'Нет фото' : 'Товар' }}
          </div>
        </div>
        <div class="px-2 py-3 text-center">
          <div
              class="text-[12px] leading-snug text-gray-800 dark:text-gray-200"
              v-html="p?.title ? italic(p.title) : '&nbsp;'"
          />
          <div class="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
            {{ p?.price ? formatPrice(p.price) : '&nbsp;' }}
          </div>
        </div>
      </div>
    </div>

    <!-- loading -->
    <div v-if="loading" class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
      Загружаем товары…
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Мини-превью подборки: шапка + 3 карточки в ряд
 */
const props = defineProps<{
  title?: string
  subtitle?: string
  products?: Array<{ id: number; title?: string; price?: number; image?: string }>
  loading?: boolean
  ctaText?: string
}>()

const ctaText = computed(() => props.ctaText || 'ПЕРЕЙТИ В КАТАЛОГ')

/** берём ровно 3 карточки, недостающие — плейсхолдеры */
const cards = computed(() => {
  const arr = (props.products || []).slice(0, 3)
  while (arr.length < 3) arr.push(null as any)
  return arr
})

/** курсивная разметка для отдельных слов */
const italic = (s?: string) => {
  if (!s) return ''
  // простая поддержка *word* / _word_
  return s
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
}

/** ₽ формат */
const formatPrice = (n?: number) => {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}
</script>
