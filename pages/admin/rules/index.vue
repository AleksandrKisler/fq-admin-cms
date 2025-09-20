<template>
  <div class="space-y-6">
    <AdminPageHeader title="Правила" subtitle="Управление текстовыми правилами и публикацией.">
      <template #actions>
        <NuxtLink to="/admin/rules/new"><el-button type="primary">Создать</el-button></NuxtLink>
      </template>
    </AdminPageHeader>

    <AdminFormSection title="Фильтры">
      <div class="grid md:grid-cols-3 gap-4">
        <el-input v-model="filters.search" placeholder="Поиск по заголовку" @keyup.enter="load"/>
        <el-select v-model="filters.status" placeholder="Статус" clearable>
          <el-option label="Все" value=""/>
          <el-option label="Черновики" value="draft"/>
          <el-option label="Опубликованные" value="published"/>
        </el-select>
        <div class="flex items-center gap-2">
          <el-button :loading="loading" @click="load">Искать</el-button>
          <el-button @click="resetFilters" text>Сбросить</el-button>
        </div>
      </div>
    </AdminFormSection>

    <AdminFormSection title="Список">
      <el-table :data="items" stripe v-loading="loading">
        <el-table-column prop="title" label="Заголовок" min-width="240" />

        <!-- Публикация отдельной колонкой-переключателем -->
        <el-table-column label="Публикация" width="140">
          <template #default="{ row }">
            <el-switch
                :model-value="row.is_published"
                @change="(val:boolean)=>togglePublish(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Опубликовано" width="180">
          <template #default="{ row }">{{ row.published_at ? dt(row.published_at) : '—' }}</template>
        </el-table-column>

        <el-table-column label="Обновлено" width="180">
          <template #default="{ row }">{{ dt(row.updated_at) }}</template>
        </el-table-column>

        <!-- === СТОЛБЕЦ ДЕЙСТВИЙ КАК В ТВОЁМ ПРИМЕРЕ === -->
        <el-table-column width="140" fixed="right" align="right">
          <template #header><span class="th">Действия</span></template>
          <template #default="{ row }">
            <div class="flex items-center justify-end gap-1.5">
              <NuxtLink :to="`/admin/rules/${row.id}`">
                <el-tooltip content="Редактировать" placement="top">
                  <el-button size="small" circle>
                    <el-icon><Edit/></el-icon>
                  </el-button>
                </el-tooltip>
              </NuxtLink>

              <el-popconfirm title="Удалить правило?" @confirm="remove(row.id)">
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


      <div class="flex items-center justify-between mt-4">
        <span class="text-sm text-gray-500">Всего: {{ total }}</span>
        <el-pagination
            background
            layout="prev, pager, next, sizes"
            :page-size="limit"
            :current-page="page"
            :page-sizes="[10,20,50]"
            :total="total"
            @update:page-size="(v:number)=>{ limit=v; page=1; load() }"
            @current-change="(v:number)=>{ page=v; load() }"
        />
      </div>
    </AdminFormSection>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete } from '@element-plus/icons-vue'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
definePageMeta({ layout: 'admin' })

type Rule = {
  id: string
  title: string
  content: string
  is_published: boolean
  published_at: string|null
  created_at: string
  updated_at: string
}

const cfg = useRuntimeConfig()
const api = (p: string) => `${(cfg.public as any)?.apiBase || 'http://localhost:80'}${p}`

const items = ref<Rule[]>([])
const total = ref(0)
let page = ref(1)
let limit = ref(10)
const loading = ref(false)
const filters = reactive({ search:'', status:'' as ''|'draft'|'published' })

const dt = (s: string) => new Date(s).toLocaleString()

const load = async () => {
  loading.value = true
  try {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: filters.search,
      status: filters.status || ''
    }).toString()
    const r = await $fetch<{ data: Rule[]; meta: { count:number } }>(api(`/rules?${qs}`), { credentials:'include' })
    items.value = r.data
    total.value = r.meta.count
  } finally { loading.value = false }
}

const resetFilters = () => { filters.search=''; filters.status=''; page=1; load() }


const remove = async (id: string) => {
  if (!confirm('Удалить правило?')) return
  await $fetch(api(`/rules/${id}`), { method:'DELETE', credentials:'include' })
  await load()
}

const togglePublish = async (row: Rule, val?: boolean) => {
  const publish = typeof val === 'boolean' ? val : !row.is_published
  await $fetch(api(`/rules/${row.id}/publish`), {
    method: 'PATCH',
    credentials: 'include',
    body: { publish }
  })
  await load()
}

onMounted(load)
</script>
