<template>
  <div class="space-y-6">
    <AdminPageHeader title="Рассылки" subtitle="Кампании, статус, метрики.">
      <template #actions>
        <NuxtLink to="/admin/newsletters/create">
          <el-button type="success" :icon="Plus">Новая кампания</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <el-card class="!rounded-2xl">
      <el-skeleton v-if="loading" :rows="6" animated/>
      <template v-else>
        <el-table :data="items" row-key="id" stripe class="modern-table">
          <el-table-column label="Кампания" min-width="320">
            <template #default="{row}">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-indigo-600 text-white grid place-items-center text-xs font-semibold">
                  {{ (row.title||'?').slice(0,1).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ row.title }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ row.subject }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Статус" width="140" align="center">
            <template #default="{row}">
              <el-tag :type="mapStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Метрики" min-width="260">
            <template #default="{row}">
              <div class="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>Sent: <b>{{ row.metrics.sent }}</b></span>
                <span>Open: <b>{{ row.metrics.open }}</b></span>
                <span>Click: <b>{{ row.metrics.click }}</b></span>
                <span>Unsub: <b>{{ row.metrics.unsubscribe }}</b></span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Обновлено" width="180">
            <template #default="{row}">
              {{ formatDate(row.updated_at) }}
            </template>
          </el-table-column>

          <el-table-column fixed="right" width="200" label="Действия" align="right">
            <template #default="{row}">
              <div class="flex items-center justify-end gap-1.5">
                <NuxtLink :to="`/admin/newsletters/${row.id}`">
                  <el-button size="small">Открыть</el-button>
                </NuxtLink>
                <el-popconfirm title="Удалить кампанию?" @confirm="remove(row.id)">
                  <template #reference>
                    <el-button size="small" type="danger">Удалить</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import { useNewsletterApi } from '~/composables/useNewsletterApi'

definePageMeta({ layout: 'admin' })
const api = useNewsletterApi()
const loading = ref(true)
const items = ref<any[]>([])

const mapStatusType = (s:string) => s==='SENT' ? 'success' : s==='SENDING' ? 'warning' : s==='SCHEDULED' ? 'info' : 'default'
const formatDate = (v?:string) => v ? new Intl.DateTimeFormat('ru-RU', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'}).format(new Date(v)) : '—'

const fetchList = async () => {
  loading.value = true
  try { const r:any = await api.list(); items.value = r.data || [] } finally { loading.value=false }
}
const remove = async (id:number) => { await api.remove(id); await fetchList(); ElMessage.success('Удалено') }

onMounted(fetchList)
</script>
