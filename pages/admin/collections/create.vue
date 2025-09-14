<template>
  <div class="space-y-6">
    <AdminPageHeader
        title="Новая коллекция"
        subtitle="Заполните данные, загрузите обложку и добавьте товары."
    >
      <template #actions>
        <NuxtLink to="/admin/collections">
          <el-button>Назад</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              <el-input v-model="form.title" placeholder="Например: Летняя распродажа" />
            </el-form-item>

            <el-form-item label="Описание" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3"
                        placeholder="Короткое описание коллекции…" />
            </el-form-item>
          </el-form>
        </AdminFormSection>
        <AdminFormSection title="Публикация и обложка">
          <PublishCard
              v-model:is-active="form.is_active"
              v-model:preview-image="form.preview_image"
          />
        </AdminFormSection>
        <AdminFormSection
            title="Товары"
            description="Выберите товары, которые войдут в коллекцию (можно фильтровать и искать)."
        >
          <ProductPicker v-model="form.productIds" />
        </AdminFormSection>
      </div>
      <CollectionPreviewModal
          v-model="previewOpen"
          :title="form.title"
          :description="form.description"
          :preview-image="form.preview_image"
          :temp-preview-url="tempPreviewUrl"
          :products="previewProducts"
      />
    </div>

    <AdminStickyActions>
      <template #meta>Создание коллекции</template>
      <el-button @click="openPreview">Предпросмотр</el-button>
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
import ProductPicker from '~/components/admin/products/ProductPicker.vue'
import PublishCard from "~/components/admin/collections/PublishCard.vue";
import CollectionPreviewModal from "~/components/admin/collections/CollectionPreviewModal.vue";

definePageMeta({ layout: 'admin' })
const { $api, $fileUrl } = useNuxtApp()

const formRef = ref<FormInstance>()
const saving = ref(false)
const previewOpen = ref(false)

const form = reactive({
  title: '',
  description: '',
  is_active: true,
  preview_image: '' as string,     // <= новое поле
  productIds: [] as number[]
})

const rules: FormRules = {
  title:       [{ required: true, message: 'Название обязательно',    trigger: 'blur' }],
  description: [{ required: true, message: 'Описание обязательно',    trigger: 'blur' }],
}

const previewProducts = ref<any[]>([])
const tempPreviewUrl = ref<string | null>(null)

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    await $api('/collections', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description,
        is_active: form.is_active,
        preview_image: form.preview_image,
        productIds: form.productIds,
      }
    })
    ElMessage.success('Коллекция создана')
    navigateTo('/admin/collections')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

const cancel = () => navigateTo('/admin/collections')

const openPreview = async () => {
  try {
    if (form.productIds?.length) {
      const r: any = await $api('/products/by-ids', { method: 'POST', body: { ids: form.productIds } })
      const list = r?.data || r?.items || r || []
      previewProducts.value = list.map((p: any) => {
        // берём первое фото из images[], иначе fallback на старые поля
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
