<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новая главная" subtitle="Соберите из баннеров и подборок.">
      <template #actions>
        <NuxtLink to="/admin/homepages">
          <el-button>Назад</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid grid-cols-1 gap-4">
            <el-form-item label="Название" prop="title">
              <el-input v-model="form.title" @input="autoSlug"/>
            </el-form-item>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug" placeholder="home-default"/>
              </el-form-item>
              <el-form-item label="Активна">
                <el-switch v-model="form.is_active"/>
              </el-form-item>
            </div>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Баннеры" description="Выберите баннеры для слотов.">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="main">
              <el-select v-model="form.banners.main" filterable clearable :loading="loading.banners">
                <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="slot-1">
              <el-select v-model="form.banners['slot-1']" filterable clearable :loading="loading.banners">
                <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="slot-2">
              <el-select v-model="form.banners['slot-2']" filterable clearable :loading="loading.banners">
                <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="slot-3">
              <el-select v-model="form.banners['slot-3']" filterable clearable :loading="loading.banners">
                <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
              </el-select>
            </el-form-item>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Подборки">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-form-item label="slot-1">
              <el-select v-model="form.selections['slot-1']" filterable clearable :loading="loading.selections">
                <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="slot-2">
              <el-select v-model="form.selections['slot-2']" filterable clearable :loading="loading.selections">
                <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
              </el-select>
            </el-form-item>
            <el-form-item label="slot-3">
              <el-select v-model="form.selections['slot-3']" filterable clearable :loading="loading.selections">
                <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
              </el-select>
            </el-form-item>
          </div>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Предпросмотр" description="Пустые слоты отображаются плейсхолдерами.">
          <div class="space-y-4">
            <div class="rounded-xl border overflow-hidden bg-gray-50" style="aspect-ratio: 1920/1080">
              <div class="grid place-items-center h-full text-gray-400" v-if="!form.banners.main">Баннер: main</div>
              <div v-else class="grid place-items-center h-full text-gray-600">Выбран баннер #{{
                  form.banners.main
                }}
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="rounded-xl border overflow-hidden bg-gray-50"
                   style="aspect-ratio: 1/1">
                <div class="grid place-items-center h-full text-gray-400"
                     v-if="!form.selections[`slot-${i}`]">Подборка: slot-{{ i }}
                </div>
                <div v-else class="grid place-items-center h-full text-gray-600">Выбрана подборка
                  #{{ form.selections[`slot-${i}`] }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div v-for="i in 3" :key="'b'+i" class="rounded-xl border overflow-hidden bg-gray-50"
                   style="aspect-ratio: 16/9">
                <div class="grid place-items-center h-full text-gray-400"
                     v-if="!form.banners[`slot-${i}`]">Баннер: slot-{{ i }}
                </div>
                <div v-else class="grid place-items-center h-full text-gray-600">Выбран баннер
                  #{{ form.banners[`slot-${i}`] }}
                </div>
              </div>
            </div>
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Создание главной</template>
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
const loading = reactive({banners: false, selections: false})
const banners = ref<any[]>([])
const selections = ref<any[]>([])

const form = reactive({
  title: 'Главная по умолчанию',
  slug: 'home-default',
  is_active: true,
  banners: {main: null as any, 'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any},
  selections: {'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any}
})

const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  slug: [
    {required: true, message: 'Slug обязателен', trigger: 'blur'},
    {validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger: 'blur'}
  ]
}
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
const autoSlug = () => {
  if (!form.slug) form.slug = slugify(form.title)
}

onMounted(async () => {
  try {
    loading.banners = true;
    const r: any = await $api('/banners', {query: {limit: 1000}});
    banners.value = r.data || r.items || r || []
  } finally {
    loading.banners = false
  }
  try {
    loading.selections = true;
    const r: any = await $api('/selections', {query: {limit: 1000}});
    selections.value = r.data || r.items || r || []
  } finally {
    loading.selections = false
  }
})

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return
  saving.value = true
  try {
    await $api('/homepages', {method: 'POST', body: form});
    ElMessage.success('Создано');
    navigateTo('/admin/homepages')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const cancel = () => navigateTo('/admin/homepages')
</script>
