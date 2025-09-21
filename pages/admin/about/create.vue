<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новая страница «О бренде»" subtitle="Соберите страницу из блоков. После сохранения можно опубликовать.">
      <template #actions><NuxtLink to="/admin/about"><el-button>Назад</el-button></NuxtLink></template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Название" prop="title"><el-input v-model="form.title" @input="autoSlug"/></el-form-item>
            <el-form-item label="Slug" prop="slug"><el-input v-model="form.slug" placeholder="about-default"/></el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Блоки">
          <AboutBlockEditor v-model="form.blocks"/>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <AdminFormSection title="Подсказки">
          <ul class="text-sm leading-6 text-gray-600 dark:text-gray-300 list-disc pl-5">
            <li>Активной может быть только одна About-страница. Публикация выключит остальные.</li>
            <li>Тексты можно вводить как обычный текст или HTML.</li>
            <li>Изображения — по URL (как в баннерах/подборках).</li>
          </ul>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Создание About</template>
      <el-button @click="cancel">Отмена</el-button>
      <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
    </AdminStickyActions>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import AboutBlockEditor from '~/components/admin/about/AboutBlockEditor.vue'
import { isValidSlug } from '~/utils/validators'

definePageMeta({ layout: 'admin', title:'Создать About' })
const { $api } = useNuxtApp()

const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive({
  title: 'О компании',
  slug: 'about-default',
  blocks: [] as any[]
})

const rules:FormRules = {
  title: [{ required:true, message:'Название обязательно', trigger:'blur' }],
  slug: [
    { required:true, message:'Slug обязателен', trigger:'blur' },
    { validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger:'blur' }
  ]
}
const slugify = (s:string) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]+/gu,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80)
const autoSlug = () => { if (!form.slug) form.slug = slugify(form.title) }

const submit = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if(!ok) return
  saving.value = true
  try {
    await $api('/about-pages', { method:'POST', body: form })
    ElMessage.success('Создано')
    navigateTo('/admin/about')
  } catch (e:any) {
    ElMessage.error(e?.data?.errors?.[0] || 'Ошибка сохранения')
  } finally { saving.value = false }
}
const cancel = () => navigateTo('/admin/about')
</script>
