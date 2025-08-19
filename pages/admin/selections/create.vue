<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новая подборка" subtitle="Подборка — вручную выбранные товары.">
      <template #actions>
        <NuxtLink to="/admin/selections">
          <el-button>Список</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное" description="Название, slug и описание подборки.">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid grid-cols-1 gap-4">
            <el-form-item label="Название" prop="title">
              <el-input v-model="form.title" @input="autoSlug"/>
            </el-form-item>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug" placeholder="best-sellers"/>
              </el-form-item>
              <el-form-item label="Активна">
                <el-switch v-model="form.is_active"/>
              </el-form-item>
            </div>

            <el-form-item label="Описание" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Товары" description="Добавьте 3–12 товаров (поиск работает внутри мультиселекта).">
          <ProductMultiSelect v-model="form.productIds"/>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Предпросмотр">
          <div class="rounded-xl border bg-white p-4 space-y-2">
            <div class="text-lg font-medium">{{ form.title || 'Подборка' }}</div>
            <div class="text-xs text-gray-400">/{{ form.slug || 'slug' }}</div>
            <p class="text-sm text-gray-600 mt-2">{{ form.description || 'Описание подборки…' }}</p>
            <div class="mt-3 text-xs text-gray-500">Выбрано товаров: {{ form.productIds.length }}</div>
            <el-tag :type="form.is_active?'success':'info'" class="mt-2">{{
                form.is_active ? 'Активна' : 'Черновик'
              }}
            </el-tag>
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Создание подборки</template>
      <el-button @click="cancel">Отмена</el-button>
      <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
    </AdminStickyActions>
  </div>
</template>

<script setup lang="ts">
import AdminPageHeader from "~/components/admin/ui/AdminPageHeader.vue";

definePageMeta({layout: 'admin'})
import type {FormInstance, FormRules} from 'element-plus'
import {isValidSlug} from '~/utils/validators'
import AdminFormSection from "~/components/admin/ui/AdminFormSection.vue";
import AdminStickyActions from "~/components/admin/ui/AdminStickyActions.vue";

const {$api} = useNuxtApp()

const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive({
  title: '',
  slug: '',
  description: '',
  is_active: true,
  productIds: [] as number[]
})

const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  slug: [
    {required: true, message: 'Slug обязателен', trigger: 'blur'},
    {validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger: 'blur'}
  ],
  description: [{required: true, message: 'Описание обязательно', trigger: 'blur'}]
}

const slugify = (s: string) => s.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
const autoSlug = () => {
  if (!form.slug) form.slug = slugify(form.title)
}

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return
  saving.value = true
  try {
    await $api('/selections', {method: 'POST', body: form})
    ElMessage.success('Подборка создана')
    navigateTo('/admin/selections')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const cancel = () => navigateTo('/admin/selections')
</script>
