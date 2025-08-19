<template>
  <div class="space-y-6">
    <section class="rounded-2xl overflow-hidden  shadow-lg">
      <div class="bg-white">
        <div class="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold">Коллекции</h1>
            <p class="text-sm">Всего: {{ items.length }}</p>
          </div>
          <div class="flex items-center gap-2">
            <NuxtLink to="/admin/collections/create">
              <el-button type="success" :icon="Plus" class="px-4">Новая коллекция</el-button>
            </NuxtLink>
            <el-button
                :disabled="!selectedIds.length"
                type="danger"
                :icon="Delete"
                class="px-4"
                @click="bulkRemove"
            >
              Удалить ({{ selectedIds.length }})
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <el-card shadow="always" class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-gray-800 font-medium">Список коллекций</span>
          <span class="text-sm text-gray-400">Обновлено: {{ nowLabel }}</span>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated/>

      <template v-else>
        <div class="overflow-hidden rounded-xl border border-gray-100">
          <el-table
              :data="pagedItems"
              row-key="id"
              table-layout="auto"
              stripe
              highlight-current-row
              :max-height="560"
              class="modern-table w-full rounded-xl"
              @selection-change="onSelectionChange"
          >
            <!-- чекбоксы -->
            <el-table-column type="selection" width="46"/>

            <!-- название + мини-эмблема -->
            <el-table-column min-width="360">
              <template #header>
                <span class="th">Название</span>
              </template>
              <template #default="{ row }">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                      class="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center text-xs font-semibold shadow-sm"
                      aria-hidden="true"
                  >
                    {{ (row.title || 'К').slice(0, 1).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <el-tooltip :content="row.title" placement="top" :disabled="(row.title || '').length < 28">
                      <div class="font-medium text-gray-900 truncate">{{ row.title }}</div>
                    </el-tooltip>
                    <div class="text-xs text-gray-400 mt-0.5">ID: {{ row.id }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- статус -->
            <el-table-column width="160" align="center">
              <template #header><span class="th">Статус</span></template>
              <template #default="{ row }">
                <span
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                    :class="row.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  <span
                      class="h-2 w-2 rounded-full"
                      :class="row.is_active ? 'bg-emerald-500' : 'bg-slate-400'"
                  />
                  {{ row.is_active ? 'Активна' : 'Черновик' }}
                </span>
              </template>
            </el-table-column>

            <el-table-column width="200">
              <template #header><span class="th">Обновлено</span></template>
              <template #default="{ row }">
                <span class="text-gray-600">{{ formatDate(row.updated_at || row.created_at) }}</span>
              </template>
            </el-table-column>

            <el-table-column width="140" fixed="right" align="right">
              <template #header><span class="th">Действия</span></template>
              <template #default="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                  <NuxtLink :to="`/admin/collections/${row.id}`">
                    <el-tooltip content="Редактировать" placement="top">
                      <el-button size="small" circle>
                        <el-icon>
                          <Edit/>
                        </el-icon>
                      </el-button>
                    </el-tooltip>
                  </NuxtLink>
                  <el-popconfirm title="Удалить коллекцию?" @confirm="remove(row.id)">
                    <template #reference>
                      <el-tooltip content="Удалить" placement="top">
                        <el-button size="small" circle type="danger">
                          <el-icon>
                            <Delete/>
                          </el-icon>
                        </el-button>
                      </el-tooltip>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>

            <!-- пустое состояние -->
            <template #empty>
              <div class="py-14 text-center">
                <p class="text-gray-500 mb-1">Пока нет коллекций</p>
                <p class="text-sm text-gray-400 mb-4">Создайте первую коллекцию.</p>
                <NuxtLink to="/admin/collections/create">
                  <el-button type="primary" :icon="Plus">Создать</el-button>
                </NuxtLink>
              </div>
            </template>
          </el-table>
        </div>

        <!-- пагинация -->
        <div class="mt-4 flex items-center justify-between gap-3">
          <div class="text-sm text-gray-500">
            Показаны {{ startIndex + 1 }}–{{ endIndex }} из {{ items.length }}
          </div>
          <el-pagination
              background
              layout="prev, pager, next, sizes"
              :total="items.length"
              :page-sizes="[10, 20, 50, 100]"
              v-model:page-size="pageSize"
              v-model:current-page="currentPage"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {Plus, Refresh, Delete, Edit} from '@element-plus/icons-vue'

definePageMeta({layout: 'admin'});

const {$api} = useNuxtApp();

const items = ref<any[]>([]);
const loading = ref(true);

const selectedIds = ref<number[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchList = async () => {
  loading.value = true;
  try {
    const r: any = await $api('/collections', {query: {limit: 500}});
    items.value = r.data || [];
  } catch {
    ElMessage.error('Не удалось загрузить коллекции');
  } finally {
    loading.value = false;
  }
};
onMounted(fetchList);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return items.value.slice(start, start + pageSize.value);
});
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, items.value.length));

const formatDate = (v?: string) => {
  if (!v) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(v));
  } catch {
    return '—';
  }
};
const nowLabel = computed(() => formatDate(new Date().toISOString()));

const onSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map(r => r.id);
};

const remove = async (id: number) => {
  try {
    await $api(`/collections/${id}`, {method: 'DELETE'});
    ElMessage.success('Коллекция удалена');
    await fetchList();
  } catch {
    ElMessage.error('Ошибка удаления');
  }
};
const bulkRemove = async () => {
  if (!selectedIds.value.length) return;
  try {
    await Promise.all(selectedIds.value.map(id => $api(`/collections/${id}`, {method: 'DELETE'})));
    ElMessage.success(`Удалено: ${selectedIds.value.length}`);
    selectedIds.value = [];
    await fetchList();
  } catch {
    ElMessage.error('Ошибка массового удаления');
  }
};
</script>

<style scoped>
:deep(.modern-table .el-table__inner-wrapper::before) {
  display: none;
}

:deep(.modern-table .el-table__border-left-patch) {
  display: none;
}

:deep(.modern-table .el-table__header-wrapper th) {
  background-color: rgb(249 250 251 / 1); /* tailwind gray-50 */
  font-weight: 600;
  color: rgb(75 85 99 / 1); /* gray-600 */
  text-transform: none;
  letter-spacing: .01em;
}

:deep(.modern-table .el-table__body tr:hover>td) {
  background-color: rgba(99, 102, 241, .06); /* индиго hover */
}

:deep(.modern-table .el-table__row) {
  transition: background-color .15s ease;
}
</style>
