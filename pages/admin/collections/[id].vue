<template>
  <div class="space-y-6">
    <AdminPageHeader
        :title="loaded ? `Коллекция — ${form.title || 'без названия'}` : 'Загрузка…'"
        subtitle="Измените информацию, обложку и состав товаров."
    >
      <template #actions>
        <NuxtLink to="/admin/collections">
          <el-button>Назад</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6" v-if="loaded">
      <div class="lg:col-span-12 space-y-6">
        <AdminFormSection title="Основное">
          <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              class="grid grid-cols-1 gap-4"
          >
            <el-form-item label="Название" prop="title">
              <el-input v-model="form.title" />
            </el-form-item>

            <el-form-item label="Описание" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" />
            </el-form-item>
          </el-form>
        </AdminFormSection>
        <AdminFormSection title="Публикация и обложка">
          <PublishCard
              v-model:is-active="form.is_active"
              v-model:preview-image="form.preview_image"
              :created-at="form.created_at"
              :updated-at="form.updated_at"
          />
        </AdminFormSection>


        <AdminFormSection title="Товары">
          <ProductPicker v-model="form.productIds" />
        </AdminFormSection>
      </div>
    </div>
    <CollectionPreviewModal
        v-model="previewOpen"
        :title="form.title"
        :description="form.description"
        :preview-image="form.preview_image"
        :temp-preview-url="tempPreviewUrl"
        :products="previewProducts"
    />

    <AdminStickyActions>
      <template #meta>Редактирование коллекции</template>
      <el-button @click="openPreview">Предпросмотр</el-button>
      <el-button @click="cancel">Отмена</el-button>
      <el-popconfirm title="Удалить коллекцию?" @confirm="remove">
        <template #reference><el-button type="danger" plain>Удалить</el-button></template>
      </el-popconfirm>
      <el-button type="primary" :loading="saving" @click="save">Сохранить</el-button>
    </AdminStickyActions>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import ProductPicker from '~/components/admin/products/ProductPicker.vue'
import PublishCard from "~/components/admin/collections/PublishCard.vue";
import CollectionPreviewModal from "~/components/admin/collections/CollectionPreviewModal.vue";

definePageMeta({ layout: 'admin' })
const route = useRoute()
const { $api, $fileUrl } = useNuxtApp()

const id = Number(route.params.id)
const formRef = ref<FormInstance>()
const loaded  = ref(false)
const saving  = ref(false)

const form = reactive({
  title: '',
  description: '',
  is_active: true,
  preview_image: '' as string,
  productIds: [] as number[],
  created_at: '' as string | null,
  updated_at: '' as string | null
})

const previewOpen = ref(false)
const previewProducts = ref<any[]>([])
const tempPreviewUrl = ref<string | null>(null)

const rules: FormRules = {
  title:       [{ required: true, message: 'Название обязательно',    trigger: 'blur' }],
  description: [{ required: true, message: 'Описание обязательно',    trigger: 'blur' }],
}

onMounted(async () => {
  try {
    const r: any = await $api(`/collections/${id}`)
    const c = r.collection || r.data || r
    form.title        = c.title ?? ''
    form.description  = c.description ?? ''
    form.is_active    = !!c.is_active
    form.preview_image = c.preview_image || ''
    form.productIds   = (c.products || []).map((p: any) => p.id)
  } catch {
    ElMessage.error('Не удалось загрузить коллекцию')
    navigateTo('/admin/collections')
  } finally {
    loaded.value = true
  }
})

const save = async () => {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    await $api(`/collections/${id}`, {
      method: 'PUT',
      body: {
        title: form.title,
        description: form.description,
        is_active: form.is_active,
        preview_image: form.preview_image,     // <= новое поле
        productIds: form.productIds
      }
    })
    ElMessage.success('Изменения сохранены')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  try {
    await $api(`/collections/${id}`, { method: 'DELETE' })
    ElMessage.success('Коллекция удалена')
    navigateTo('/admin/collections')
  } catch {
    ElMessage.error('Ошибка удаления')
  }
}

const cancel = () => navigateTo('/admin/collections')

const openPreview = async () => {
  try {
    if (form.productIds?.length) {
      const r: any = await $api('/products/by-ids', { method: 'POST', body: { ids: form.productIds } })
      const list = r?.data || r?.items || r || []
      previewProducts.value = list.map((p: any) => {
        const rawImg =
            (Array.isArray(p.images) && p.images.length ? p.images[0] : null) ||
            p.image_url || p.preview_image || p.thumbnail || ''
        console.log(rawImg)
        return {
          id: p.id,
          title: p.title,
          price: (p.price && typeof p.price === 'object')
              ? (p.price.current ?? 0)
              : (p.price ?? p.final_price ?? 0),
          image_url: $fileUrl ? $fileUrl(rawImg) : rawImg
        }
      })
    } else {
      previewProducts.value = []
    }
  } catch {
    previewProducts.value = []
  }
  previewOpen.value = true
}
</script>
