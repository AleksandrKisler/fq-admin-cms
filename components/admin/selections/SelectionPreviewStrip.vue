<template>
  <div class="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900">
    <!-- HEADER -->
    <div v-if="showHeader" class="px-4 sm:px-6 pt-5 pb-3 text-center">
      <div class="text-[22px] sm:text-2xl font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
        {{ headerTitle }}
      </div>
      <div v-if="headerSubtitle" class="text-sm italic text-gray-500 mt-1">
        {{ headerSubtitle }}
      </div>
      <div v-if="withLink" class="mt-3">
        <NuxtLink :to="resolvedLink" class="text-xs uppercase tracking-wide text-gray-600 hover:text-gray-900 dark:text-gray-300">
          {{ linkText }}
        </NuxtLink>
      </div>
    </div>

    <!-- GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/10">
      <!-- items -->
      <div
          v-for="p in itemsToShow"
          :key="p.id"
          class="bg-white dark:bg-neutral-900 p-4 flex flex-col"
      >
        <div class="aspect-[4/3] rounded-lg bg-gray-50 dark:bg-white/5 overflow-hidden grid place-items-center">
          <img v-if="p.image" :src="fileUrl(p.image)" alt="" class="h-full w-full object-contain" />
          <div v-else class="text-gray-400 text-xs">Нет фото</div>
        </div>
        <div class="mt-3 text-center">
          <!-- поддержка курсивных слов через [i]...[/i] -->
          <div class="text-[12px] leading-5 uppercase text-gray-900 dark:text-white" v-html="italicize(p.title)" />
          <div class="text-xs text-gray-500 mt-1">{{ formatPrice(p.price) }}</div>
        </div>
      </div>

      <!-- skeleton -->
      <div v-if="loading" v-for="i in 3" :key="'sk'+i" class="bg-white dark:bg-neutral-900 p-4">
        <div class="aspect-[4/3] rounded-lg bg-gray-100 dark:bg-white/10 animate-pulse" />
        <div class="mt-3 h-3 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
      </div>

      <!-- empty -->
      <div v-if="!loading && !itemsToShow.length" class="col-span-full py-10 text-center text-gray-400">
        Нет товаров для предпросмотра
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectionId: { type: [Number, String], default: null },

  /* опциональные переопределения хедера */
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  link: { type: String, default: '' },
  linkText: { type: String, default: 'Перейти в каталог' },
  withLink: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },

  limit: { type: Number, default: 3 }
})

const { $api, $fileUrl } = useNuxtApp()
const loading = ref(false)
const items = ref([])
const meta = ref({ title: '', slug: '' })

const fileUrl = (p) => ($fileUrl ? $fileUrl(p) : p)

const fetchItems = async () => {
  items.value = []
  meta.value = { title: '', slug: '' }
  if (!props.selectionId) return
  loading.value = true
  try {
    let res = await $api(`/selections/${props.selectionId}`, { query: { include: 'products' } })
    console.log(res);
    const m =
        res?.data || res?.selection || res || {}
    meta.value.title = m.title || ''
    meta.value.slug = m.slug || ''

    let list = m.products || res?.products
    if (!Array.isArray(list) || !list.length) {
      try {
        res = await $api(`/selections/${props.selectionId}/products`)
        list = res?.data || res?.products || res
        console.log(list)
      } catch {}
    }
    items.value = (list || []).map((p) => ({
      id: p.id,
      title: p.title || p.name || `Товар #${p.id}`,
      price: p.price || p.fix_price || p.price_rub || 0,
      image: p.image_url || p.image?.file_url || p.images?.[0]?.file_url || p.images?.[0] || p.main_image
    }))
  } catch {
    // no-op
  } finally {
    loading.value = false
  }
}

watch(() => props.selectionId, fetchItems, { immediate: true })

const itemsToShow = computed(() => items.value.slice(0, props.limit))
const formatPrice = (v) => (v ? new Intl.NumberFormat('ru-RU').format(v) + ' ₽' : '')

/** [i]word[/i] -> <em>word</em> */
const italicize = (t = '') =>
    String(t).replace(/\[i\](.*?)\[\/i\]/g, '<em class="italic lowercase not-italic font-normal">$1</em>')

/* header values */
const headerTitle = computed(() => props.title || meta.value.title || `Подборка #${props.selectionId}`)
const headerSubtitle = computed(() => props.subtitle || '') // при желании сюда можно отдать, например, категорию
const resolvedLink = computed(() => props.link || `/selections/${meta.value.slug || props.selectionId}`)
</script>
