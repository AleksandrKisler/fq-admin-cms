<template>
  <div
      class="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900"
      :class="containerClass"
  >
    <template v-if="mode === 'card'">
      <div class="relative w-full" :class="heroAspectClass">
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-[1]" />
        <img
            v-if="coverUrl"
            :src="coverUrl"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
        />
        <div
            v-else
            class="absolute inset-0 h-full w-full grid place-items-center bg-gray-100 dark:bg-neutral-800 text-gray-400"
        >
          16:9 — обложка
        </div>

        <div class="absolute inset-x-0 bottom-0 z-[2] p-4 text-white">
          <div class="flex items-center gap-2 mb-2">
            <span
                class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                :class="is_active ? 'bg-emerald-500/90' : 'bg-slate-500/90'"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-white/90" />
              {{ is_active ? 'Опубликована' : 'Черновик' }}
            </span>
            <span class="text-white/90 text-xs">•</span>
            <span class="text-white/90 text-xs">{{ dateLabel }}</span>
            <span class="text-white/90 text-xs">•</span>
            <span class="text-white/90 text-xs">{{ readingTimeLabel }}</span>
          </div>
          <h3 class="text-lg md:text-xl font-semibold leading-snug line-clamp-2">
            {{ title || 'Заголовок статьи…' }}
          </h3>
        </div>
      </div>

      <div class="p-4">
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {{ excerpt || plainPreview }}
        </p>
        <div class="mt-3 text-xs text-gray-400">/{{ slug || 'slug' }}</div>
      </div>
    </template>

    <!-- DETAIL mode -->
    <template v-else>
      <div class="relative w-full" :class="detailHeroAspectClass">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1]" />
        <img
            v-if="coverUrl"
            :src="coverUrl"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
        />
        <div
            v-else
            class="absolute inset-0 h-full w-full grid place-items-center bg-gray-100 dark:bg-neutral-800 text-gray-400"
        >
          21:9 — обложка
        </div>

        <div class="absolute inset-0 z-[2] flex items-end p-6">
          <div class="text-white max-w-3xl">
            <div class="flex items-center gap-2 mb-3">
              <span
                  class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  :class="is_active ? 'bg-emerald-500/90' : 'bg-slate-500/90'"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-white/90" />
                {{ is_active ? 'Опубликована' : 'Черновик' }}
              </span>
              <span class="text-white/90 text-xs">•</span>
              <span class="text-white/90 text-xs">{{ dateLabel }}</span>
              <span class="text-white/90 text-xs">•</span>
              <span class="text-white/90 text-xs">{{ readingTimeLabel }}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-semibold leading-tight">
              {{ title || 'Заголовок статьи…' }}
            </h1>
          </div>
        </div>
      </div>

      <div class="px-6 py-5">
        <p class="text-[15px] text-gray-600 dark:text-gray-300 leading-7">
          {{ excerpt || plainPreview }}
        </p>
        <div class="mt-4 text-xs text-gray-400">/{{ slug || 'slug' }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
type Mode = 'card' | 'detail'
type Viewport = 'desktop' | 'mobile'

const props = defineProps<{
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  cover?: string
  is_active?: boolean
  publish_date?: string
  mode?: Mode
  viewport?: Viewport
}>()

const { $fileUrl } = useNuxtApp()

const mode = computed<Mode>(() => props.mode ?? 'card')
const viewport = computed<Viewport>(() => props.viewport ?? 'desktop')

const coverUrl = computed(() => props.cover ? $fileUrl(props.cover) : '')

const containerClass = computed(() => {
  return viewport.value === 'mobile'
      ? 'w-[380px] mx-auto'
      : 'w-full'
})

const heroAspectClass = computed(() => (viewport.value === 'mobile' ? 'aspect-[16/10]' : 'aspect-[16/9]'))
const detailHeroAspectClass = computed(() => (viewport.value === 'mobile' ? 'aspect-[21/12]' : 'aspect-[21/9]'))

const stripHtml = (html?: string) =>
    (html || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

const plainPreview = computed(() => {
  const text = stripHtml(props.content)
  return text ? text.slice(0, 280) + (text.length > 280 ? '…' : '') : 'Короткое описание появится здесь…'
})

const wordsCount = computed(() => {
  const t = stripHtml(props.content)
  return t ? t.split(/\s+/).filter(Boolean).length : 0
})
const readingTimeLabel = computed(() => {
  const wpm = 180 // средняя скорость чтения RU
  const min = Math.max(1, Math.ceil(wordsCount.value / wpm))
  return `${min} мин чтения`
})

const dateLabel = computed(() => {
  try {
    if (!props.publish_date) return 'Дата не указана'
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
        .format(new Date(props.publish_date))
  } catch {
    return 'Дата не указана'
  }
})
</script>
