<template>
  <div class="space-y-6">
    <AdminPageHeader title="О бренде (About)" subtitle="Управление страницами «О бренде». Активной может быть только одна.">
      <template #actions>
        <NuxtLink to="/admin/about/create"><el-button type="primary">Создать</el-button></NuxtLink>
      </template>
    </AdminPageHeader>

    <el-card class="!rounded-2xl">
      <div class="flex items-center gap-3 mb-3">
        <el-input v-model="q" placeholder="Поиск по названию или slug" clearable class="max-w-md" @keyup.enter="load"/>
        <el-button @click="load" :loading="loading">Искать</el-button>
        <el-switch v-model="withDeleted" active-text="Показывать удалённые" />
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
        <el-table :data="items" table-layout="auto" row-key="id" stripe class="modern-table w-full rounded-xl"
                  :empty-text="loading ? 'Загрузка…' : 'Нет данных'">
          <el-table-column label="#" width="80" prop="id"/>
          <el-table-column label="Название" min-width="280">
            <template #default="{row}">
              <div class="font-medium">{{ row.title }}</div>
              <div class="text-xs text-gray-500">/{{ row.slug }}</div>
            </template>
          </el-table-column>
          <el-table-column label="Статус" width="140" align="center">
            <template #default="{row}">
              <el-tag :type="row.is_active ? 'success':'info'">{{ row.is_active ? 'Опубликована':'Черновик' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Обновлена" width="200">
            <template #default="{row}">
              <span class="text-gray-500">{{ fmt(row.updated_at || row.created_at) }}</span>
            </template>
          </el-table-column>

          <!-- Действия -->
          <el-table-column width="220" fixed="right" align="right">
            <template #header><span class="th">Действия</span></template>
            <template #default="{ row }">
              <div class="flex items-center justify-end gap-1.5">
                <NuxtLink :to="`/admin/about-pages/${row.id}`">
                  <el-tooltip content="Редактировать" placement="top">
                    <el-button size="small" circle>
                      <el-icon><Edit/></el-icon>
                    </el-button>
                  </el-tooltip>
                </NuxtLink>

                <el-tooltip :content="row.is_active ? 'Снять с публикации' : 'Опубликовать'" placement="top">
                  <el-button size="small" circle type="success" plain :loading="publishingId===row.id"
                             @click="togglePublish(row)">
                    <el-icon><UploadFilled/></el-icon>
                  </el-button>
                </el-tooltip>

                <el-popconfirm title="Удалить страницу About?" @confirm="remove(row.id)">
                  <template #reference>
                    <el-tooltip content="Удалить" placement="top">
                      <el-button size="small" circle type="danger">
                        <el-icon><Delete/></el-icon>
                      </el-button>
                    </el-tooltip>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="flex justify-end mt-3">
        <el-pagination
            layout="prev, pager, next"
            :total="total"
            :page-size="limit"
            :current-page="page"
            @current-change="p => { page = p; load() }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete, UploadFilled } from '@element-plus/icons-vue'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'

definePageMeta({ layout: 'admin', title: 'О бренде' })
const { $api } = useNuxtApp()

const q = ref('')
const withDeleted = ref(false)
const items = ref<any[]>([])
const total = ref(0)
const limit = 20
const page = ref(1)
const loading = ref(false)
const publishingId = ref<number|null>(null)

const load = async () => {
  loading.value = true
  try {
    const r:any = await $api('/about-pages', {
      query: { q: q.value || undefined, limit, offset: (page.value-1)*limit, withDeleted: withDeleted.value }
    })
    items.value = r.data || []
    total.value = r.total || 0
  } catch {
    ElMessage.error('Не удалось загрузить список')
  } finally { loading.value = false }
}
onMounted(load)

const togglePublish = async (row:any) => {
  try {
    publishingId.value = row.id
    const r:any = await $api(`/about-pages/${row.id}/publish`, { method:'POST', body:{ publish: !row.is_active }})
    // если опубликовали — все прочие стали черновиками (логика бэка)
    ElMessage.success(r.page?.is_active ? 'Опубликовано' : 'Снято с публикации')
    await load()
  } catch { ElMessage.error('Не удалось сменить статус публикации') }
  finally { publishingId.value = null }
}

const remove = async (id:number) => {
  try { await $api(`/about-pages/${id}`, { method:'DELETE' }); ElMessage.success('Удалено'); await load() }
  catch { ElMessage.error('Ошибка удаления') }
}

const fmt = (s?:string) => s ? new Date(s).toLocaleString('ru-RU') : ''
</script>

<style scoped>
:deep(.modern-table .el-table__inner-wrapper::before){ display:none; }
:deep(.modern-table .el-table__header-wrapper th){
  background-color: rgb(249 250 251 / 1); font-weight:600; color: rgb(75 85 99 / 1);
}
:deep(.modern-table .el-table__body tr:hover>td){ background-color: rgba(99,102,241,.06); }
</style>
