<template>
  <div class="space-y-6">
    <AdminPageHeader :title="headerTitle" subtitle="Измените заголовок, контент и публикацию.">
      <template #actions><NuxtLink to="/admin/rules"><el-button>Назад</el-button></NuxtLink></template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6" v-loading="loading">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Заголовок" prop="title"><el-input v-model="form.title"/></el-form-item>
            <el-form-item label="Текст правила" prop="content">
              <ArticleEditor v-model="form.content" :show-preview="false" class="bg-white rounded-md"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Публикация">
          <p class="text-sm text-gray-600">Статус: <b>{{ rule?.is_published ? 'Опубликовано' : 'Черновик' }}</b></p>
          <div class="flex items-center gap-2 mt-2">
            <el-button @click="setPublish(true)" :disabled="rule?.is_published">Опубликовать</el-button>
            <el-button @click="setPublish(false)" :disabled="!rule?.is_published">Снять с публикации</el-button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Опубликовано: {{ rule?.published_at ? new Date(rule.published_at).toLocaleString() : '—' }}</p>
        </AdminFormSection>

        <AdminFormSection title="Действия">
          <div class="flex items-center gap-2">
            <el-button type="primary" :loading="saving" @click="save">Сохранить</el-button>
            <el-button type="danger" plain @click="remove">Удалить</el-button>
          </div>
        </AdminFormSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import ArticleEditor from "~/components/admin/articles/ArticleEditor.vue";
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

const route = useRoute()
const id = String(route.params.id)
const cfg = useRuntimeConfig()
const api = (p: string) => `${(cfg.public as any)?.apiBase || 'http://localhost:80'}${p}`

const formRef = ref()
const loading = ref(true)
const saving = ref(false)
const rule = ref<Rule | null>(null)
const form = reactive({ title:'', content:'' })
const rules = {
  title: [{ required:true, message:'Заголовок обязателен', trigger:'blur' }],
  content: [{ required:true, message:'Текст обязателен', trigger:'change' }],
}
const headerTitle = computed(()=> rule.value ? `Правило: ${rule.value.title}` : 'Правило')

const fetchRule = async () => {
  loading.value = true
  try {
    const r = await $fetch<{ data: Rule }>(api(`/rules/${id}`), { credentials:'include' })
    rule.value = r.data
    form.title = r.data.title
    form.content = r.data.content
  } finally { loading.value = false }
}

const save = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if (!ok) return
  saving.value = true
  try {
    await $fetch(api(`/rules/${id}`), {
      method:'PATCH', credentials:'include', body: form
    })
    ElMessage.success('Сохранено')
    await fetchRule()
  } catch { ElMessage.error('Ошибка сохранения') }
  finally { saving.value = false }
}

const setPublish = async (publish: boolean) => {
  await $fetch(api(`/rules/${id}/publish`), {
    method:'PATCH', credentials:'include', body:{ publish }
  })
  ElMessage.success(publish ? 'Опубликовано' : 'Снято с публикации')
  await fetchRule()
}

const remove = async () => {
  if (!confirm('Удалить правило?')) return
  await $fetch(api(`/rules/${id}`), { method:'DELETE', credentials:'include' })
  ElMessage.success('Удалено')
  navigateTo('/admin/rules')
}

onMounted(fetchRule)
</script>
