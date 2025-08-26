<template>
  <div class="space-y-6">
    <!-- Header -->
    <AdminPageHeader title="Статьи" subtitle="Управляйте публикациями и черновиками.">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-button
              :disabled="!selectedIds.length"
              type="danger"
              :icon="Delete"
              @click="bulkRemove"
          >
            Удалить ({{ selectedIds.length }})
          </el-button>

          <NuxtLink to="/admin/articles/create">
            <el-button type="primary" :icon="Plus">Новая статья</el-button>
          </NuxtLink>
        </div>
      </template>
    </AdminPageHeader>

    <!-- Controls -->
    <el-card shadow="never" class="!rounded-2xl border border-gray-100 dark:border-white/10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex items-center gap-2 w-full md:w-auto">
          <el-input
              v-model="q"
              placeholder="Поиск по названию или slug…"
              class="w-full md:w-96"
              clearable
              @keyup.enter="fetchList"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
          </el-input>
          <el-button @click="fetchList">Найти</el-button>
        </div>

        <div class="flex items-center gap-2 min-w-[400px]">
          <el-select v-model="pageSize" class="w-40">
            <el-option v-for="n in [12, 24, 48, 96]" :key="n" :label="`Показывать: ${n}`" :value="n"/>
          </el-select>
          <span class="min-w-[140px] text-sm text-gray-400">Обновлено: {{ nowLabel }}</span>
        </div>
      </div>
    </el-card>

    <!-- Grid -->
    <div>
      <el-skeleton v-if="loading" :count="12" animated>
        <template #template>
          <div
              class="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900">
            <div class="h-40 bg-gray-100 dark:bg-white/5"></div>
            <div class="p-4 space-y-2">
              <el-skeleton-item variant="text" style="width: 80%"/>
              <el-skeleton-item variant="text" style="width: 40%"/>
              <el-skeleton-item variant="text" style="width: 60%"/>
            </div>
          </div>
        </template>
      </el-skeleton>

      <template v-else>
        <div
            v-if="paged.length"
            class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ArticleCard
              v-for="item in paged"
              :key="item.id"
              :item="item"
              :checked="selectedIds.includes(item.id)"
              @toggle-check="toggleSelect(item.id)"
              @edit="goEdit(item.id)"
              @delete="remove(item.id)"
          />
        </div>

        <div v-else class="py-14 text-center text-gray-500">
          Ничего не найдено
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Показаны {{ start + 1 }}–{{ end }} из {{ items.length }}
          </div>
          <el-pagination
              background
              layout="prev, pager, next"
              :total="items.length"
              :page-size="pageSize"
              v-model:current-page="page"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArticleCard from "~/components/admin/articles/ArticleCard.vue";

definePageMeta({layout: 'admin'})

import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import {Plus, Delete, Search} from '@element-plus/icons-vue'

const {$api} = useNuxtApp()

/** state */
const loading = ref(true)
const items = ref<any[]>([])
const q = ref('')

/** selection */
const selectedIds = ref<number[]>([])
const toggleSelect = (id: number) => {
  const i = selectedIds.value.indexOf(id)
  if (i === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(i, 1)
}

/** paging */
const page = ref(1)
const pageSize = ref(24)

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return items.value.slice(start, start + pageSize.value)
})
const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, items.value.length))
const nowLabel = computed(() =>
    new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'short'}).format(new Date())
)

/** fetch */
const fetchList = async () => {
  loading.value = true
  try {
    const r: any = await $api('/articles', {query: {q: q.value, limit: 1000}})
    // ожидаем массив вида [{id, title, slug, main_image, is_active, publish_date, excerpt}]
    items.value = r.data || r.items || r || []
    // сбрасываем выбор при новом поиске
    selectedIds.value = []
    page.value = 1
  } catch {
    ElMessage.error('Не удалось загрузить статьи')
  } finally {
    loading.value = false
  }
}
onMounted(fetchList)

/** actions */
const goEdit = (id: number) => navigateTo(`/admin/articles/${id}`)
const remove = async (id: number) => {
  try {
    await $api(`/articles/${id}`, {method: 'DELETE'})
    ElMessage.success('Статья удалена')
    await fetchList()
  } catch {
    ElMessage.error('Ошибка удаления')
  }
}
const bulkRemove = async () => {
  if (!selectedIds.value.length) return
  try {
    await Promise.all(selectedIds.value.map(id => $api(`/articles/${id}`, {method: 'DELETE'})))
    ElMessage.success(`Удалено: ${selectedIds.value.length}`)
    selectedIds.value = []
    await fetchList()
  } catch {
    ElMessage.error('Ошибка массового удаления')
  }
}
</script>
<style scoped>
/* skeleton grid spacing alignment */
:deep(.el-skeleton__list) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1280px) {
  :deep(.el-skeleton__list) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  :deep(.el-skeleton__list) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  :deep(.el-skeleton__list) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>