<template>
  <div class="space-y-6">
    <AdminPageHeader title="О компании (About)" subtitle="Соберите страницу из блоков">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-button @click="load" :loading="loading">Обновить</el-button>
          <el-popconfirm title="Очистить все блоки?" @confirm="() => blocks = []">
            <template #reference>
              <el-button type="warning" plain>Очистить</el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Левая колонка: форма -->
      <div class="lg:col-span-8 space-y-6">
        <AdminFormSection title="Основное">
          <el-form :model="form" label-position="top" class="grid grid-cols-1 gap-4">
            <el-form-item label="Заголовок страницы">
              <el-input v-model="form.title" placeholder="О бренде Forever Queen"/>
            </el-form-item>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Meta title">
                <el-input v-model="form.meta_title"/>
              </el-form-item>
              <el-form-item label="Meta description">
                <el-input v-model="form.meta_description" type="textarea" :rows="2"/>
              </el-form-item>
            </div>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Конструктор блоков" description="Перетаскивайте, дублируйте, удаляйте.">
          <AboutBlockBuilder v-model="blocks"/>
        </AdminFormSection>
      </div>

      <!-- Правая колонка: предпросмотр -->
      <div class="lg:col-span-4 space-y-6">
        <AdminFormSection title="Предпросмотр">
          <div class="space-y-4">
            <div class="rounded-xl border border-gray-100 overflow-hidden bg-white">
              <div class="p-4 border-b">
                <div class="text-lg font-semibold">{{ form.title || 'О компании' }}</div>
                <div class="text-xs text-gray-400">/about</div>
              </div>
              <div class="p-3 max-h-[70vh] overflow-auto bg-gray-50">
                <AboutBlockRenderer :blocks="blocks"/>
              </div>
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Подсказки">
          <ul class="text-sm leading-6 text-gray-600 dark:text-gray-300 list-disc pl-5">
            <li><b>Hero</b> — большой баннер (изображение + заголовок, кнопка).</li>
            <li>Можно чередовать <b>Image</b>, <b>Text</b>, <b>Quote</b>, <b>Number</b>, <b>Gallery</b>.</li>
            <li><b>Spacer</b> добавляет отступ между блоками.</li>
          </ul>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Страница «О компании»</template>
      <el-button @click="load">Отмена</el-button>
      <el-button type="primary" :loading="saving" @click="save">Сохранить</el-button>
    </AdminStickyActions>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import AboutBlockBuilder from '~/components/admin/about/AboutBlockBuilder.vue'
import AboutBlockRenderer from '~/components/admin/about/AboutBlockRenderer.vue'

const { $api } = useNuxtApp()

const loading = ref(false)
const saving  = ref(false)

const form = reactive({
  title: 'О компании',
  meta_title: '',
  meta_description: ''
})

const blocks = ref([])

/* загрузка текущей версии */
const load = async () => {
  loading.value = true
  try {
    // ожидается ответ формата {title, meta_title, meta_description, blocks: [...]}
    const r = await $api('/about', { method: 'GET' })
    form.title = r?.title || 'О компании'
    form.meta_title = r?.meta_title || ''
    form.meta_description = r?.meta_description || ''
    blocks.value = Array.isArray(r?.blocks) ? r.blocks : []
    ElMessage.success('Загружено')
  } catch {
    // если первый запуск — ничего страшного
  } finally {
    loading.value = false
  }
}

/* сохранение */
const save = async () => {
  saving.value = true
  try {
    const payload = { ...form, blocks: blocks.value }
    // PUT либо POST — подставь как у тебя в бэке
    await $api('/about', { method: 'PUT', body: payload })
    ElMessage.success('Сохранено')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
