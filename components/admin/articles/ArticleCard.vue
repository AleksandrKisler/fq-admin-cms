<template>
  <div
      class="group relative rounded-2xl overflow-hidden
           border border-gray-100 dark:border-white/10
           bg-white dark:bg-neutral-900
           shadow-sm hover:shadow-md transition-shadow"
  >
    <button
        class="absolute z-10 top-3 left-3 rounded-md p-1.5
             bg-white/90 dark:bg-black/40 border border-gray-200 dark:border-white/10
             hover:bg-white dark:hover:bg-black/60 transition"
        title="Выбрать"
        data-card-action
        @click.stop="emit('toggle-check')"
    >
      <span
          class="block h-4 w-4 rounded-sm border"
          :class="checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-transparent border-gray-300 dark:border-white/20'"
      />
    </button>

    <div class="absolute z-10 top-3 right-3">
      <span
          class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
          :class="item?.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
      >
        <span class="h-2 w-2 rounded-full" :class="item?.is_active ? 'bg-emerald-500' : 'bg-slate-400'"/>
        {{ item?.is_active ? 'Опубликована' : 'Черновик' }}
      </span>
    </div>

    <div class="aspect-[16/9] bg-gray-50 dark:bg-white/5 overflow-hidden">
      <img
          v-if="item?.main_image"
          :src="$fileUrl(item.main_image)"
          class="h-full w-full object-cover"
          :alt="item.title || ('Статья #' + item.id)"
      />
      <div v-else class="grid place-items-center h-full text-gray-300 dark:text-white/30">
        Нет изображения
      </div>
    </div>

    <!-- контент -->
    <div class="p-4 flex flex-col gap-2">
      <div class="font-semibold text-gray-900 dark:text-white truncate">
        {{ titleFallback }}
      </div>
      <div class="text-xs text-gray-400 truncate">{{ slugFallback }}</div>
      <p v-if="excerptShort" class="text-sm text-gray-600 dark:text-gray-300">
        {{ excerptShort }}
      </p>

      <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Опубликовано: {{ fmtDate(item?.publish_date) }}</span>
        <div class="flex items-center gap-1.5">
          <el-tooltip content="Редактировать" placement="top">
            <el-button size="small" circle data-card-action @click.stop="emit('edit')">
              <el-icon>
                <Edit/>
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-popconfirm title="Удалить статью?" @confirm="emit('delete')">
            <template #reference>
              <el-tooltip content="Удалить" placement="top">
                <el-button size="small" type="danger" circle data-card-action>
                  <el-icon>
                    <Delete/>
                  </el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Edit, Delete} from '@element-plus/icons-vue'
import {computed} from 'vue'

const {$fileUrl} = useNuxtApp()

type Article = {
  id: number
  title?: string | null
  slug?: string | null
  main_image?: string | null
  is_active?: boolean | null
  publish_date?: string | null
  excerpt?: string | null
}

const props = defineProps<{
  item: Article
  checked?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-check'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const titleFallback = computed(() => props.item?.title || 'Без названия')
const slugFallback = computed(() => (props.item?.slug ? `/${props.item.slug}` : '/slug'))
const excerptShort = computed(() => {
  const s = props.item?.excerpt || ''
  return s.length > 140 ? s.slice(0, 140) + '…' : s
})

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('ru-RU') : '—')
</script>
