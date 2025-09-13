<template>
  <div class="space-y-6">
    <AdminPageHeader :title="`Подборка #${form.id||''}`" subtitle="Редактирование подборки">
      <template #actions>
        <NuxtLink to="/admin/selections">
          <el-button>Список</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное">
          <el-skeleton v-if="pending" :rows="6" animated/>
          <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top"
                   class="grid grid-cols-1 gap-4">
            <el-form-item label="Название" prop="title">
              <el-input v-model="form.title" @input="autoSlug"/>
            </el-form-item>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug"/>
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

        <AdminFormSection title="Товары">
          <ProductPicker v-model="form.productIds" />
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
            <div class="text-[11px] text-gray-400 mt-3">
              Создано: {{ fmt(meta.created_at) }} · Обновлено: {{ fmt(meta.updated_at) }}
            </div>
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Редактирование подборки</template>
      <el-popconfirm title="Удалить подборку?" @confirm="remove">
        <template #reference>
          <el-button type="danger" plain>Удалить</el-button>
        </template>
      </el-popconfirm>
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
import ProductPicker from "~/components/admin/products/ProductPicker.vue";

const {$api} = useNuxtApp();
const route = useRoute()

const formRef = ref<FormInstance>();
const saving = ref(false)
const meta = reactive<{ created_at?: string, updated_at?: string }>({})
const form = reactive({
  id: null as any,
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
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
const autoSlug = () => {
  if (!form.slug) form.slug = slugify(form.title)
}

const {pending} = await useAsyncData('selection-one', async () => {
  const r: any = await $api(`/selections/${route.params.id}`)
  const s = r?.selection || r?.data || r
  form.id = s.id;
  form.title = s.title;
  form.slug = s.slug || '';
  form.description = s.description || '';
  form.is_active = !!s.is_active
  form.productIds = s.productIds || s.products?.map((p: any) => p.id) || []
  meta.created_at = s.created_at;
  meta.updated_at = s.updated_at
  return s
})
const fmt = (v?: string) => v ? new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(v)) : '—'

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return
  saving.value = true
  try {
    await $api(`/selections/${form.id}`, {method: 'PUT', body: form});
    ElMessage.success('Сохранено');
    navigateTo('/admin/selections')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const remove = async () => {
  try {
    await $api(`/selections/${form.id}`, {method: 'DELETE'});
    ElMessage.success('Удалено');
    navigateTo('/admin/selections')
  } catch {
    ElMessage.error('Ошибка удаления')
  }
}
const cancel = () => navigateTo('/admin/selections')
</script>
