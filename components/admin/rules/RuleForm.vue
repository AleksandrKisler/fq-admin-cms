<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Rule = {
  id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

const props = defineProps<{ id?: string }>()
const isEdit = !!props.id

const cfg = useRuntimeConfig()
const apiBase = (cfg.public as any)?.apiBase || 'http://localhost:80'
const api = (p: string) => `${apiBase}${p}`

const title = ref('')
const slug  = ref('')
const content = ref('')
const status = ref<'draft'|'published'>('draft')
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!isEdit) return
  loading.value = true
  error.value = null
  try {
    const { data } = await $fetch<{ data: Rule }>(api(`/api/rules/${props.id}`), { credentials: 'include' })
    title.value = data.title
    slug.value = data.slug
    content.value = data.content
    status.value = data.status
  } catch (e: any) {
    error.value = e?.data?.error || e?.message || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function save(publish?: boolean) {
  if (!title.value.trim()) return alert('Введите заголовок')
  if (!content.value.trim()) return alert('Введите текст')

  loading.value = true
  error.value = null
  try {
    if (isEdit) {
      await $fetch(api(`/api/rules/${props.id}`), {
        method: 'PATCH',
        body: { title: title.value.trim(), slug: slug.value.trim(), content },
        credentials: 'include',
      })
      if (typeof publish === 'boolean') {
        await $fetch(api(`/api/rules/${props.id}/publish`), {
          method: 'PATCH',
          body: { publish },
          credentials: 'include',
        })
      }
    } else {
      const created = await $fetch<{ data: Rule }>(api('/api/rules'), {
        method: 'POST',
        body: { title: title.value.trim(), slug: slug.value.trim(), content },
        credentials: 'include',
      })
      if (publish) {
        await $fetch(api(`/api/rules/${created.data.id}/publish`), {
          method: 'PATCH',
          body: { publish: true },
          credentials: 'include',
        })
      }
    }
    navigateTo('/admin/rules')
  } catch (e: any) {
    error.value = e?.data?.error || e?.message || 'Ошибка сохранения'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Заголовок</label>
        <input v-model="title" class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Например: Правила возврата" />
      </div>
      <div>
        <label class="block text-sm mb-1">Slug (опционально)</label>
        <input v-model="slug" class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="pravila-vozvrata" />
        <p class="text-xs text-gray-500 mt-1">Если оставить пустым — сгенерируется автоматически.</p>
      </div>
    </div>

    <div>
      <label class="block text-sm mb-1">Текст правила</label>
      <QuillEditor v-model:content="content" contentType="html" theme="snow" class="bg-white rounded-md" />
    </div>

    <div v-if="isEdit" class="text-sm text-gray-600">
      Текущий статус: <b>{{ status === 'published' ? 'Опубликовано' : 'Черновик' }}</b>
    </div>

    <div class="flex gap-2">
      <button
          class="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          :disabled="loading"
          @click="save(false)"
      >
        Сохранить (черновик)
      </button>
      <button
          class="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50"
          :disabled="loading"
          @click="save(true)"
      >
        Сохранить и опубликовать
      </button>
      <NuxtLink class="px-4 py-2 rounded-md border border-gray-300" to="/admin/rules">Отмена</NuxtLink>
    </div>
  </div>
</template>
