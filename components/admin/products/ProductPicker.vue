<template>
  <div class="space-y-4">
    <!-- Панель действий -->
    <div class="flex flex-col md:flex-row md:items-center gap-3">
      <el-input
          v-model="searchQuery"
          placeholder="Поиск по названию или SKU…"
          clearable
          class="md:flex-1"
          :prefix-icon="Search"
      />

      <el-select
          v-model="selectedCategory"
          clearable
          filterable
          placeholder="Категория"
          class="w-full md:w-72"
          :loading="loading.categories"
      >
        <el-option
            v-for="c in categories"
            :key="c.value"
            :label="c.label"
            :value="c.value"
        />
      </el-select>

      <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="onPage"
          class="ml-auto"
      />
    </div>

    <!-- Сетка карточек -->
    <el-skeleton v-if="loading.products" :rows="6" animated/>

    <template v-else>
      <div v-if="items.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
            v-for="p in items"
            :key="p.id"
            class="group relative rounded-xl border border-gray-200 hover:border-indigo-300 bg-white overflow-hidden transition"
            @click="toggle(p)"
        >
          <!-- плавающая круглая кнопка -->
          <div class="absolute top-2 right-2 z-10">
            <el-tooltip :content="isSelected(p.id) ? 'Убрать из выбора' : 'Добавить в выбор'" placement="top">
              <el-button
                  circle
                  :type="isSelected(p.id) ? 'danger' : 'primary'"
                  size="small"
                  class="!p-0 h-7 w-7 shadow-sm"
                  @click.stop="toggle(p)"
              >
                <el-icon :size="14">
                  <Check v-if="isSelected(p.id)" />
                  <Plus v-else />
                </el-icon>
                <span class="sr-only">{{ isSelected(p.id) ? 'Убрать' : 'Выбрать' }}</span>
              </el-button>
            </el-tooltip>
          </div>

          <!-- изображение -->
          <div class="aspect-[4/3] bg-gray-50">
            <img
                v-if="p.image"
                :src="$fileUrl(p.image)"
                :alt="p.title"
                class="h-full w-full object-cover"
                loading="lazy"
            />
            <div v-else class="h-full w-full grid place-items-center text-gray-300">
              <el-icon><Picture /></el-icon>
            </div>
          </div>

          <!-- контент -->
          <div class="p-3 space-y-1">
            <div class="text-sm font-medium text-gray-900 truncate" :title="p.title">{{ p.title }}</div>
            <div class="text-xs text-gray-500 truncate">
              <span v-if="p.sku">{{ p.sku }}</span>
              <span v-if="p.category" class="ml-1 text-gray-400">• {{ p.category }}</span>
            </div>

            <!-- очень компактный футер с ценой -->
            <div class="pt-1">
              <div class="text-sm font-semibold">
                <span v-if="p.price?.current != null">₽{{ p.price.current.toLocaleString('ru-RU') }}</span>
                <span v-else-if="typeof p.price === 'number'">₽{{ p.price.toLocaleString('ru-RU') }}</span>
                <span v-else class="text-gray-400">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="Ничего не найдено"/>
    </template>

    <div v-if="selectedList.length" class="rounded-xl border bg-white p-3">
      <div class="text-sm font-medium mb-2">Выбрано: {{ selectedList.length }}</div>
      <div class="flex flex-wrap gap-2">
        <el-tag
            v-for="p in selectedList"
            :key="p.id"
            closable
            @close="remove(p.id)"
        >
          {{ p.title || p.sku || ('#' + p.id) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Search, Picture} from '@element-plus/icons-vue'
import { Plus, Check } from '@element-plus/icons-vue'

type ProductLite = {
  id: number
  title: string
  sku?: string
  slug?: string
  price?: number | { current: number; old?: number | null }
  image?: string | null
  category?: string
}

const props = defineProps<{
  modelValue: number[] | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number[]): void }>()

const {$api} = useNuxtApp()

/** v-model */
const selectedIds = ref<number[]>(props.modelValue || [])
watch(() => props.modelValue, v => {
  selectedIds.value = v || []
})
watch(selectedIds, v => emit('update:modelValue', v))

/** локальное хранилище метаданных выбранных карточек (чтобы показывать чипы с названиями) */
const selectedMeta = reactive<Map<number, ProductLite>>(new Map())
const selectedList = computed(() => [...selectedMeta.values()].filter(p => selectedIds.value.includes(p.id)))

/** фильтры/поиск/страницы */
const searchQuery = ref('')
const selectedCategory = ref<number | string | null>(null)
const page = ref(1)
const pageSize = 24

/** данные */
const categories = ref<{ label: string; value: number | string }[]>([])
const items = ref<ProductLite[]>([])
const total = ref(0)

/** загрузки */
const loading = reactive({categories: false, products: false})

const isSelected = (id: number) => selectedIds.value.includes(id)
const ensureMeta = (p: ProductLite) => {
  selectedMeta.set(p.id, p)
}
const toggle = (p: ProductLite) => {
  const idx = selectedIds.value.indexOf(p.id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(p.id)
    ensureMeta(p)
  }
}
const remove = (id: number) => {
  const i = selectedIds.value.indexOf(id)
  if (i >= 0) selectedIds.value.splice(i, 1)
}

const normalizeProduct = (raw: any): ProductLite => {
  const price =
      raw?.price && typeof raw.price === 'object'
          ? {current: Number(raw.price.current ?? raw.price), old: raw.price.old ?? null}
          : (raw?.price != null ? Number(raw.price) : undefined)

  const image =
      raw?.main_image || raw?.image_url || raw?.image || raw?.images?.[0]?.file_url || raw?.images?.[0] || null

  if (image) console.info(image)
  console.info(raw)
  const categoryTitle = raw?.category?.title || raw?.category_title || undefined

  return {
    id: Number(raw.id),
    title: String(raw.title ?? raw.name ?? raw.sku ?? raw.slug ?? raw.id),
    sku: raw.sku ?? undefined,
    slug: raw.slug ?? undefined,
    price,
    image,
    category: categoryTitle
  }
}

const fetchCategories = async () => {
  loading.categories = true
  try {
    const r: any = await $api('/products/catalog').catch(() => null)
    let list: any[] = []
    if (r?.catalog) list = r.catalog
    else {
      const rc: any = await $api('/categories').catch(() => null)
      list = rc?.data || rc || []
    }
    const flat: { label: string; value: number | string }[] = []
    const walk = (node: any) => {
      flat.push({label: node.title || node.name || node.slug || String(node.id), value: node.id ?? node.slug})
      ;(node.children || []).forEach((ch: any) => walk(ch))
    }
    list.forEach(walk)
    categories.value = flat
  } finally {
    loading.categories = false
  }
}

const doFetchProducts = async () => {
  loading.products = true
  try {
    const offset = (page.value - 1) * pageSize
    const body = {
      source: selectedCategory.value || null,
      sourceType: 'CATEGORY', // как в твоём контроллере
      filters: [],
      sort: 'createdAt',
      direction: 'DESC',
      limit: pageSize,
      offset
    } as any

    if (searchQuery.value.trim()) body.q = searchQuery.value.trim()

    let res: any = await $api('/products', {method: 'POST', body}).catch(() => null)

    if (!res) {
      res = await $api('/products', {
        query: {
          q: searchQuery.value || undefined,
          category: selectedCategory.value || undefined,
          limit: pageSize,
          offset
        }
      }).catch(() => null)
    }

    if (!res) {
      res = await $api('/products/search', {
        method: 'POST',
        body: {q: searchQuery.value || '', category: selectedCategory.value || null, limit: pageSize, offset}
      }).catch(() => null)
    }

    const rows = res?.data || res?.rows || res?.products || res?.items || []
    items.value = rows.map(normalizeProduct)
    total.value = Number(res?.total ?? res?.count ?? rows.length)
    // сохраняем метаданные выбранных
    for (const p of items.value) if (isSelected(p.id)) ensureMeta(p)
  } finally {
    loading.products = false
  }
}

const debouncedFetch = () => {
  page.value = 1
  doFetchProducts()
}

watch([searchQuery, selectedCategory], () => debouncedFetch())
watch(page, () => doFetchProducts())

onMounted(async () => {
  await fetchCategories()
  await doFetchProducts()
})
</script>
