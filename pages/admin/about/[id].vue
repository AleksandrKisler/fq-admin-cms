<template>
  <div class="space-y-6" v-if="loaded">
    <AdminPageHeader :title="`Редактирование: ${form.title || 'About'}`" subtitle="Измените блоки и метаданные.">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-tag :type="form.is_active ? 'success':'info'">{{ form.is_active? 'Опубликована' : 'Черновик' }}</el-tag>
          <el-button :loading="publishing" type="success" plain @click="publish(!form.is_active)">
            {{ form.is_active ? 'Снять с публикации' : 'Опубликовать' }}
          </el-button>
          <NuxtLink to="/admin/about"><el-button>Назад</el-button></NuxtLink>
        </div>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Название" prop="title"><el-input v-model="form.title"/></el-form-item>
            <el-form-item label="Slug" prop="slug"><el-input v-model="form.slug"/></el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Блоки">
          <AboutBlockEditor v-model="form.blocks"/>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <AdminFormSection title="Статус">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <div>Текущий: <b>{{ form.is_active ? 'Опубликована' : 'Черновик' }}</b></div>
            <div class="mt-1 text-xs text-gray-500">Публикация сделает остальные версии черновиками.</div>
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Редактирование About</template>
      <el-button @click="cancel">Отмена</el-button>
      <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
    </AdminStickyActions>
  </div>

  <div v-else class="p-8 text-center text-gray-500">Загрузка…</div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import AboutBlockEditor from '~/components/admin/about/AboutBlockEditor.vue'
import { isValidSlug } from '~/utils/validators'

definePageMeta({ layout: 'admin', title:'Редактировать About' })
const { $api } = useNuxtApp()
const route = useRoute()

const formRef = ref<FormInstance>()
const saving = ref(false)
const publishing = ref(false)
const loaded = ref(false)

const form = reactive<any>({
  id: null,
  title: '',
  slug: '',
  is_active: false,
  blocks: []
})

const rules:FormRules = {
  title: [{ required:true, message:'Название обязательно', trigger:'blur' }],
  slug: [
    { required:true, message:'Slug обязателен', trigger:'blur' },
    { validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger:'blur' }
  ]
}

const load = async () => {
  loaded.value = false
  try {
    const r:any = await $api(`/about-pages/${route.params.id}`)
    const p = r.page || r
    Object.assign(form, p)
  } catch { ElMessage.error('Не удалось загрузить страницу') }
  finally { loaded.value = true }
}
onMounted(load)

const submit = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if(!ok) return
  saving.value = true
  try {
    await $api(`/about-pages/${form.id}`, { method:'PUT', body: { title: form.title, slug: form.slug, blocks: form.blocks } })
    ElMessage.success('Сохранено')
  } catch (e:any) {
    ElMessage.error(e?.data?.errors?.[0] || 'Ошибка сохранения')
  } finally { saving.value = false }
}

const publish = async (makeActive:boolean) => {
  publishing.value = true
  try {
    const r:any = await $api(`/about/${form.id}/publish`, { method:'POST', body:{ publish: makeActive } })
    Object.assign(form, r.page || {})
    ElMessage.success(makeActive ? 'Опубликовано' : 'Снято с публикации')
  } catch { ElMessage.error('Ошибка публикации') }
  finally { publishing.value = false }
}

const cancel = () => navigateTo('/admin/about')
</script>
