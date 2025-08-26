<template>
  <div class="space-y-6">
    <AdminPageHeader :title="`Статья #${id}`" subtitle="Редактирование публикации.">
      <template #actions>
        <NuxtLink to="/admin/articles">
          <el-button>Назад</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <el-skeleton :rows="10" animated v-if="loading"/>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 space-y-6">
          <AdminFormSection title="Основное">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid grid-cols-1 gap-4">
              <el-form-item label="Заголовок" prop="title">
                <el-input v-model="form.title"/>
              </el-form-item>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <el-form-item label="Slug" prop="slug">
                  <el-input v-model="form.slug"/>
                </el-form-item>
                <el-form-item label="Опубликована">
                  <el-switch v-model="form.is_active"/>
                </el-form-item>
              </div>
              <el-form-item label="Дата публикации" prop="publish_date">
                <el-date-picker v-model="form.publish_date" type="date" format="DD.MM.YYYY" value-format="YYYY-MM-DD"/>
              </el-form-item>
              <el-form-item label="Короткое описание (excerpt)">
                <el-input v-model="form.excerpt" type="textarea" :rows="2"/>
              </el-form-item>
            </el-form>
          </AdminFormSection>

          <AdminFormSection title="Содержимое">
            <ArticleEditor v-model="form.content" :show-preview="false"/>
          </AdminFormSection>

          <AdminFormSection title="SEO">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Meta title">
                <el-input v-model="form.meta_title"/>
              </el-form-item>
              <el-form-item label="Meta description">
                <el-input v-model="form.meta_description" type="textarea" :rows="2"/>
              </el-form-item>
            </div>
          </AdminFormSection>
        </div>

        <div class="lg:col-span-4 space-y-6">
          <AdminFormSection title="Обложка">
            <CoverUpload v-model="form.main_image"/>
          </AdminFormSection>

          <AdminFormSection title="Предпросмотр">
            <div class="space-y-3">
              <div class="rounded-xl border overflow-hidden bg-gray-50 aspect-[16/9]">
                <img v-if="form.main_image" :src="$fileUrl(form.main_image)" class="h-full w-full object-cover">
              </div>
              <div class="rounded-xl border bg-white p-4">
                <div class="text-lg font-semibold">{{ form.title || '—' }}</div>
                <div class="text-xs text-gray-400">/{{ form.slug || 'slug' }}</div>
                <p class="text-sm text-gray-600 mt-2" v-if="form.excerpt">{{ form.excerpt }}</p>
                <el-tag :type="form.is_active ? 'success' : 'info'" class="mt-2">
                  {{ form.is_active ? 'Опубликована' : 'Черновик' }}
                </el-tag>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Опасная зона">
            <div class="flex flex-wrap gap-2">
              <el-popconfirm title="Удалить статью?" @confirm="doDelete">
                <template #reference>
                  <el-button type="danger" plain>Удалить</el-button>
                </template>
              </el-popconfirm>
              <el-button v-if="form.deleted_at" type="warning" @click="doRestore">Восстановить</el-button>
            </div>
          </AdminFormSection>
        </div>
      </div>

      <AdminStickyActions>
        <template #meta>Редактирование</template>
        <el-button @click="cancel">Отмена</el-button>
        <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
      </AdminStickyActions>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'})
import type {FormInstance, FormRules} from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import ArticleEditor from '~/components/admin/articles/ArticleEditor.vue'
import CoverUpload from '~/components/admin/articles/CoverUpload.vue'
import {isValidSlug} from '~/utils/validators'

const route = useRoute()
const id = Number(route.params.id)
const {$api, $fileUrl} = useNuxtApp()

const formRef = ref<FormInstance>()
const loading = ref(true)
const saving = ref(false)
const form = reactive<any>({})

const rules: FormRules = {
  title: [{required: true, message: 'Заголовок обязателен', trigger: 'blur'}],
  slug: [
    {required: true, message: 'Slug обязателен', trigger: 'blur'},
    {validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger: 'blur'}
  ],
  publish_date: [{required: true, message: 'Укажите дату публикации', trigger: 'change'}],
  content: [{required: true, message: 'Содержимое обязательно', trigger: 'blur'}]
}

onMounted(async () => {
  try {
    const r: any = await $api(`/articles/${id}`)
    Object.assign(form, r?.article || r || {})
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return
  saving.value = true
  try {
    await $api(`/articles/${id}`, {method: 'PUT', body: form});
    ElMessage.success('Сохранено')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const doDelete = async () => {
  await $api(`/articles/${id}`, {method: 'DELETE'});
  ElMessage.success('Удалено');
  navigateTo('/admin/articles')
}
const doRestore = async () => {
  await $api(`/articles/${id}/restore`, {method: 'POST'});
  ElMessage.success('Восстановлено');
  location.reload()
}
const cancel = () => navigateTo('/admin/articles')
</script>
