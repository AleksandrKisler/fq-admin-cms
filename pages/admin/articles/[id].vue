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
        <div class="lg:col-span-6 space-y-6">
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
            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
              <el-form-item label="Meta title">
                <el-input v-model="form.meta_title"/>
              </el-form-item>
              <el-form-item label="Meta description">
                <el-input v-model="form.meta_description" type="textarea" :rows="2"/>
              </el-form-item>
            </div>
          </AdminFormSection>
        </div>

        <div class="lg:col-span-6 space-y-6">
          <AdminFormSection title="Обложка">
            <CoverUpload v-model="form.main_image"/>
          </AdminFormSection>

          <ArticlePreviewModal v-model="previewOpen" :article="form" />

          <AdminFormSection title="">
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
        <template #meta>Предпросмотр / Сохранение</template>
        <el-button @click="previewOpen = true">Предпросмотр</el-button>
        <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
      </AdminStickyActions>
    </template>
  </div>
</template>

<script setup lang="ts">
import ArticlePreview from "~/components/admin/articles/ArticlePreview.vue";
const previewOpen = ref(false)
const preview = reactive({
  mode: 'card' as 'card' | 'detail',
  viewport: 'desktop' as 'desktop' | 'mobile'
})

definePageMeta({layout: 'admin'})
import type {FormInstance, FormRules} from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import ArticleEditor from '~/components/admin/articles/ArticleEditor.vue'
import CoverUpload from '~/components/admin/articles/CoverUpload.vue'
import {isValidSlug} from '~/utils/validators'
import ArticlePreviewModal from "~/components/admin/articles/ArticlePreviewModal.vue";

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
