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
          <ProductPicker v-model="form.productIds" />
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Предпросмотр">
          <SelectionPreviewMini
              :title="form.title"
              :subtitle="form.description"
              :products="previewProducts"
              :loading="previewLoading"
          />
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
import ProductPicker from "~/components/admin/products/ProductPicker.vue";
import SelectionPreviewMini from "~/components/admin/selections/SelectionPreviewMini.vue";

const {$api, $fileUrl} = useNuxtApp()

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

const previewProducts = ref<Array<{id:number; title?:string; price?:number; image?:string}>>([])
const previewLoading = ref(false)


function pickImageUrl(product: any): string {
  const imgs = product?.images || product?.Images || []
  if (!imgs.length) return ''
  const cand =
      imgs.find((i: any) => i.is_preview || i.is_main) ||
      imgs[0]
  const raw = cand?.file_url || cand?.url || cand || ''
  return $fileUrl(raw) || raw
}

const fetchPreview = async () => {
  const ids = (form.productIds || []).slice(0, 3)
  console.log(ids)
  if (!ids.length) { previewProducts.value = []; return }
  previewLoading.value = true
  try {
    const r: any = await $api('/products/by-ids', { method: 'POST', body: { ids } })
    const list = r?.data || r?.items || r || []
    previewProducts.value = list.map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price.current ?? p.final_price ?? 0,
      image: pickImageUrl(p),
    }))
  } catch {
    previewProducts.value = []
  } finally {
    previewLoading.value = false
  }
}

watch(() => [...form.productIds], fetchPreview, { immediate: true })
const cancel = () => navigateTo('/admin/selections')
</script>
