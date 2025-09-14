<template>
  <div class="space-y-4">
    <!-- Панель управления -->
    <div class="flex flex-col md:flex-row md:items-end gap-3">
      <div class="flex-1">
        <label class="el-form-item__label block mb-1">Категория</label>
        <el-cascader
            v-model="selectedCategory"
            :options="categoryOptions"
            :props="{ value:'id', label:'title', children:'children', emitPath:false }"
            clearable
            filterable
            class="w-full"
            placeholder="Все категории"
            @change="reload"
        />
      </div>

      <div class="flex-1">
        <label class="el-form-item__label block mb-1">Поиск по названию / SKU</label>
        <el-input
            v-model="searchQuery"
            placeholder="Например: кеды, 679566…"
            clearable
            @input="debouncedLocalFilter"
        >
          <template #prefix>
            <el-icon><Search/></el-icon>
          </template>
        </el-input>
      </div>

      <div class="shrink-0 flex items-center gap-3">
        <el-checkbox v-model="onlyInStock" @change="reload">Только в наличии</el-checkbox>
        <el-button :loading="loading" @click="reload">
          <el-icon class="mr-1"><Refresh/></el-icon>Обновить
        </el-button>
      </div>
    </div>

    <!-- Список карточек -->
    <el-skeleton v-if="loading && !items.length" :rows="6" animated />
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
          v-for="p in filteredItems"
          :key="p.id"
          class="group rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow transition"
      >
        <div class="aspect-[4/5] bg-gray-50 dark:bg-white/5 relative">
          <img
              v-if="firstImage(p)"
              :src="firstImage(p)"
              class="absolute inset-0 w-full h-full object-cover"
              :alt="p.title"
          />
          <div v-else class="absolute inset-0 grid place-items-center text-gray-400 text-xs">
            Нет фото
          </div>

          <button
              class="absolute top-2 right-2 h-8 w-8 rounded-full grid place-items-center bg-white/90 dark:bg-black/60 border border-gray-200 dark:border-white/10"
              @click.stop="toggle(p)"
              :title="isSelected(p.id) ? 'Убрать' : 'Выбрать'"
          >
            <el-icon v-if="isSelected(p.id)" class="text-emerald-600"><Check/></el-icon>
            <el-icon v-else class="text-gray-600 dark:text-gray-300"><Plus/></el-icon>
          </button>
        </div>

        <div class="p-3 space-y-1">
          <div class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{{ p.title }}</div>
          <div class="text-[12px] text-gray-400">SKU: {{ p.sku ?? '—' }}</div>
          <div class="flex items-baseline gap-2">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ p.price?.current != null ? formatRub(p.price.current) : '—' }}
            </div>
            <div v-if="p.price?.old" class="text-xs line-through text-gray-400">
              {{ formatRub(p.price.old) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация / ещё -->
    <div class="flex items-center justify-between mt-2">
      <div class="text-xs text-gray-500">
        Показано {{ items.length }} из {{ total }}
      </div>
      <el-button
          v-if="items.length < total"
          :loading="loadingMore"
          @click="loadMore"
      >
        Показать ещё
      </el-button>
    </div>

    <!-- Выбранные товары -->
    <div v-if="selectedDetailed.length" class="mt-6">
      <div class="el-form-item__label mb-2">Выбранные товары ({{ modelValue.length }})</div>
      <div class="flex flex-wrap gap-2">
        <div
            v-for="p in selectedDetailed"
            :key="'sel-'+p.id"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30"
        >
          <img
              v-if="firstImage(p)"
              :src="firstImage(p)"
              class="h-6 w-6 rounded object-cover"
              :alt="p.title"
          />
          <span class="text-sm text-indigo-800 dark:text-indigo-200 truncate max-w-[200px]">{{ p.title }}</span>
          <button
              class="h-6 w-6 grid place-items-center rounded-full hover:bg-indigo-100 dark:hover:bg-white/10"
              @click="remove(p.id)"
              title="Убрать"
          >
            <el-icon>
              <Close/>
            </el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Search, Refresh, Plus, Check, Close } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // [ids]
})
const emit = defineEmits(['update:modelValue'])

const { $api, $fileUrl } = useNuxtApp()

/* ---- состояние ---- */
const loading = ref(true)
const loadingMore = ref(false)
const total = ref(0)
const limit = ref(24)
const offset = ref(0)

const items = ref([])               // страница каталога
const selectedDetailed = ref([])    // детальные данные для выбранных
const selectedCategory = ref(null)  // id категории
const categoryOptions = ref([])     // каскадер
const searchQuery = ref('')
const onlyInStock = ref(false)

/* ---- утилиты ---- */
const formatRub = (n) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(n || 0))

const firstImage = (p) => {
  const url = Array.isArray(p.images) && p.images.length ? p.images[0] : ''
  return url ? $fileUrl(url) : ''
}

const isSelected = (id) => props.modelValue?.includes(id)
const toggle = (p) => {
  const set = new Set(props.modelValue || [])
  if (set.has(p.id)) set.delete(p.id); else set.add(p.id)
  emit('update:modelValue', Array.from(set))
}
const remove = (id) => {
  emit('update:modelValue', (props.modelValue || []).filter(v => v !== id))
}

/* ---- загрузка категорий ---- */
const loadCatalog = async () => {
  try {
    const r = await $api('/products/catalog')
    // r.catalog: [{ id, title, slug, children:[...] }]
    categoryOptions.value = (r?.catalog || []).map(root => ({
      id: root.id,
      title: root.title,
      children: (root.children || []).map(ch => ({ id: ch.id, title: ch.title })),
    }))
  } catch (e) {
    categoryOptions.value = []
  }
}

/* ---- загрузка товаров под фильтры ---- */
const fetchProductsPage = async (append = false) => {
  const body = {
    source: selectedCategory.value || null,
    sourceType: 'CATEGORY',
    filters: [
      ...(onlyInStock.value ? [{ type: 'STOCK', data: {} }] : []),
    ],
    sort: 'created_at',
    direction: 'DESC',
    limit: limit.value,
    offset: offset.value,
  }
  try {
    if (!append) { loading.value = true } else { loadingMore.value = true }
    const r = await $api('/products', { method: 'POST', body })
    const page = r?.data || r?.items || []
    total.value = r?.total ?? page.length
    items.value = append ? items.value.concat(page) : page
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const reload = async () => {
  offset.value = 0
  await fetchProductsPage(false)
}
const loadMore = async () => {
  if (items.value.length >= total.value) return
  offset.value += limit.value
  await fetchProductsPage(true)
}

/* ---- локальный поиск по текущей странице (т.к. бэкенд текста не поддерживает) ---- */
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(p =>
      String(p.title || '').toLowerCase().includes(q) ||
      String(p.sku || '').toLowerCase().includes(q)
  )
})
const debouncedLocalFilter = useDebounceFn(() => {
}, 200)

const hydrateSelected = async () => {
  const ids = Array.isArray(props.modelValue) ? props.modelValue : []
  if (!ids.length) { selectedDetailed.value = []; return }
  try {
    const r = await $api('/products/by-ids', { method: 'POST', body: { ids } })
    selectedDetailed.value = r?.data || []
  } catch {
    selectedDetailed.value = []
  }
}

watch(() => props.modelValue, hydrateSelected, { immediate: true })
watch([selectedCategory, onlyInStock], reload)

onMounted(async () => {
  await loadCatalog()
  await reload()
})
</script>

<style scoped>
/* Чуть более контрастная тень в тёмной теме */
:deep(.el-cascader .el-input__wrapper),
:deep(.el-input__wrapper) {
  transition: box-shadow .15s ease;
}
</style>
