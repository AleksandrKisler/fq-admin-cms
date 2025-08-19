<template>
  <div class="space-y-6">
    <AdminPageHeader :title="`Баннер #${form.id ?? ''}`"
                     subtitle="Редактирование баннера, изображения и кнопки перехода.">
      <template #actions>
        <NuxtLink to="/admin/banners">
          <el-button>Список</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное" description="Тип баннера, позиция изображения и тексты.">
          <el-skeleton v-if="pending" :rows="6" animated/>
          <el-form
              v-else
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <AdminSegmented v-model="form.type" :options="typeOptions"/>
              <p class="mt-1 text-xs text-gray-500">MAIN — герой; INFORMATION — сплит; остальное — фулл 16:9.</p>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Расположение изображения</label>
              <AdminSegmented v-model="form.image_position" :options="posOptions"/>
            </div>

            <div class="col-span-1 md:col-span-2">
              <el-form-item prop="title" label="Заголовок">
                <el-input v-model="form.title" placeholder='Курсив для слов: *так*, _так_ или [i]так[/i]'/>
              </el-form-item>
            </div>

            <div class="col-span-1 md:col-span-2">
              <el-form-item prop="description" label="Описание">
                <el-input v-model="form.description" type="textarea" :rows="3"
                          placeholder="Можно выделять отдельные слова курсивом"/>
              </el-form-item>
            </div>

            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Цвет текста</label>
              <div class="flex items-center gap-3">
                <el-color-picker v-model="form.text_color"/>
                <span class="text-xs text-gray-500">Применится к заголовку и описанию в превью</span>
              </div>
            </div>

            <div class="col-span-1">
              <el-form-item label="Активен">
                <el-switch v-model="form.is_active"/>
              </el-form-item>
            </div>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Переход по кнопке" description="Для COLLECTION/PRODUCT кнопка становится активной.">
          <el-skeleton v-if="pending" :rows="2" animated/>
          <el-form v-else :model="form" label-position="top" class="grid grid-cols-1 gap-4">
            <el-form-item label="Источник (опционально)" prop="source_id">
              <el-input v-model="form.source_id"
                        placeholder="Напр.: product:123 · collection:summer · selection:best-sellers"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Изображение" description="Загрузите новый файл или используйте существующий URL.">
          <el-skeleton v-if="pending" :rows="3" animated/>
          <div v-else class="grid grid-cols-1 gap-4">
            <el-upload
                :key="uploadKey"
                ref="uploadRef"
                drag
                :show-file-list="false"
                accept="image/*"
                :limit="1"
                :before-upload="handleBeforeUpload"
                :http-request="handleFileUpload"
                class="w-full"
            >
              <div class="el-upload__text">Перетащите файл или <em>выберите</em></div>
              <template #tip>
                <div class="text-xs text-gray-500 mt-2">JPG/PNG/WebP, до 5 МБ</div>
              </template>
            </el-upload>

            <div class="flex items-center gap-2">
              <el-input v-model="form.image_url" placeholder="/images/hero.jpg или https://..."/>
              <el-button v-if="previewUrl" @click="clearImage" type="warning" plain>Очистить</el-button>
            </div>
          </div>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5">
        <AdminFormSection title="Предпросмотр" description="Пустые слоты заменяются плейсхолдерами.">
          <div v-if="isMain" class="relative rounded-2xl overflow-hidden border bg-gray-50 w-full"
               :style="{ aspectRatio: aspect }">
            <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover"/>
            <div v-else class="absolute inset-0 grid place-items-center text-gray-400 text-sm border-2 border-dashed">
              Рекомендуемый размер: 1920×2160
            </div>
            <div class="absolute inset-0 grid place-items-center">
              <div class="text-center px-6" :style="{ color: form.text_color }">
                <div class="uppercase tracking-wide text-[14px] font-medium mb-4 drop-shadow"
                     v-html="titleHtml || 'ЗИМНЯЯ КАПСУЛА'"/>
                <p class="text-[13px] leading-relaxed max-w-2xl mx-auto mb-5 drop-shadow"
                   v-html="descHtml || 'forever queen × EKONIKA «NEW YEAR’S PARTY»'"/>
                <template v-if="ctaEnabled">
                  <NuxtLink :to="ctaHref">
                    <el-button type="primary" size="small">{{ ctaLabel }}</el-button>
                  </NuxtLink>
                </template>
                <template v-else>
                  <el-button size="small" plain disabled class="opacity-60 pointer-events-none">ПЕРЕЙТИ В КАТАЛОГ
                  </el-button>
                </template>
              </div>
            </div>
          </div>

          <div v-else-if="isSplit" class="w-full rounded-2xl overflow-hidden border" :style="{ aspectRatio: aspect }">
            <div class="grid grid-cols-2 h-full">
              <div :class="imgFirst ? 'order-1' : 'order-2'" class="relative">
                <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover"/>
                <div v-else
                     class="absolute inset-0 grid place-items-center text-gray-400 text-sm border-2 border-dashed">
                  Фото ({{ imgFirst ? 'лево' : 'право' }}) · 960×1080
                </div>
              </div>
              <div :class="imgFirst ? 'order-2' : 'order-1'" class="relative bg-white">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="px-8 text-center max-w-md" :style="{ color: form.text_color }">
                    <div class="uppercase tracking-wide text-[13px] font-medium mb-5"
                         v-html="titleHtml || 'SET YOUR GOALS HIGH'"/>
                    <p class="text-[12px] leading-relaxed mb-5" v-html="descHtml || 'ВСЁ, ЧТО НУЖНО ЖЕНЩИНЕ…'"/>
                    <template v-if="ctaEnabled">
                      <NuxtLink :to="ctaHref">
                        <el-button type="primary" plain size="small">{{ ctaLabel }}</el-button>
                      </NuxtLink>
                    </template>
                    <template v-else>
                      <el-button size="small" plain disabled class="opacity-60 pointer-events-none">ПЕРЕЙТИ В КАТАЛОГ
                      </el-button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="relative rounded-2xl overflow-hidden border bg-gray-50 w-full"
               :style="{ aspectRatio: aspect }">
            <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover"/>
            <div v-else class="absolute inset-0 grid place-items-center text-gray-400 text-sm border-2 border-dashed">
              Рекомендуемый размер: 1920×1080
            </div>
            <div class="absolute inset-0 grid place-items-center">
              <div class="text-center px-6" :style="{ color: form.text_color }">
                <div class="uppercase tracking-wide text-[14px] font-medium mb-4 drop-shadow"
                     v-html="titleHtml || 'НОВАЯ КОЛЛЕКЦИЯ'"/>
                <p class="text-[13px] leading-relaxed max-w-2xl mx-auto mb-5 drop-shadow"
                   v-html="descHtml || 'FOREVER QUEEN · LIMITED'"/>
                <template v-if="ctaEnabled">
                  <NuxtLink :to="ctaHref">
                    <el-button type="primary" plain size="small">{{ ctaLabel }}</el-button>
                  </NuxtLink>
                </template>
                <template v-else>
                  <el-button size="small" plain disabled class="opacity-60 pointer-events-none">ПЕРЕЙТИ В КАТАЛОГ
                  </el-button>
                </template>
              </div>
            </div>
          </div>

          <div class="text-xs text-gray-600 mt-4">
            <div><span class="font-medium">Тип:</span> {{ ratioHint.label }}</div>
            <div><span class="font-medium">Рекомендованный размер:</span> {{ ratioHint.wh }} <span
                v-if="ratioHint.extra">· {{ ratioHint.extra }}</span></div>
            <div><span class="font-medium">Соотношение (превью):</span> {{ ratioHint.ratio }}</div>
            <div class="text-[11px] text-gray-400 mt-3">
              Создано: {{ fmt(meta.created_at) }} · Обновлено: {{ fmt(meta.updated_at) }}
            </div>
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Редактирование баннера</template>
      <el-popconfirm title="Удалить баннер?" @confirm="remove">
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
definePageMeta({layout: 'admin'})

import type {FormInstance, FormRules, UploadInstance} from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import AdminSegmented from '~/components/admin/ui/AdminSegmented.vue'
import {isValidImageUrl} from '~/utils/validators'
import {renderItalicsToHtml} from '~/utils/markup'

const {$api, $fileUrl} = useNuxtApp()
const route = useRoute()

const formRef = ref<FormInstance>()
const saving = ref(false)
const uploadRef = ref<UploadInstance | null>(null)
const uploadKey = ref(0)
const tempPreviewUrl = ref<string>('')

const meta = reactive<{ created_at?: string, updated_at?: string }>({})

const typeOptions = [
  {label: 'MAIN', value: 'MAIN'},
  {label: 'INFORMATION', value: 'INFORMATION'},
  {label: 'COLLECTION', value: 'COLLECTION'},
  {label: 'PRODUCT', value: 'PRODUCT'}
]
const posOptions = [
  {label: 'DEFAULT', value: 'DEFAULT'},
  {label: 'LEFT', value: 'LEFT'},
  {label: 'RIGHT', value: 'RIGHT'}
]

const form = reactive({
  id: null as any,
  type: 'INFORMATION' as 'MAIN' | 'INFORMATION' | 'COLLECTION' | 'PRODUCT',
  image_position: 'DEFAULT' as 'DEFAULT' | 'LEFT' | 'RIGHT',
  title: '',
  description: '',
  text_color: '#000000',
  source_id: '',
  image_url: '',
  is_active: true
})

const rules: FormRules = {
  type: [{required: true, message: 'Тип обязателен', trigger: 'change'}],
  image_position: [{required: true, message: 'Укажите позицию', trigger: 'change'}],
  title: [{required: true, message: 'Заголовок обязателен', trigger: 'blur'}],
  description: [{required: true, message: 'Описание обязательно', trigger: 'blur'}],
  image_url: [{
    validator: (_r, v, cb) => {
      if (tempPreviewUrl.value) return cb()
      if (isValidImageUrl(v)) return cb()
      cb(new Error('Укажите корректный URL или загрузите файл'))
    },
    trigger: ['change', 'blur']
  }]
}

const {pending} = await useAsyncData('banner-one', async () => {
  const r: any = await $api(`/banners/${route.params.id}`)
  const b = r?.banner || r?.data || r
  form.id = b.id
  form.type = b.type || form.type
  form.image_position = b.image_position || form.image_position
  form.title = b.title || ''
  form.description = b.description || ''
  form.text_color = b.text_color || form.text_color
  form.source_id = b.source_id || ''
  form.image_url = b.image_url || ''
  form.is_active = !!b.is_active
  meta.created_at = b.created_at
  meta.updated_at = b.updated_at
  return b
})

const previewUrl = computed(() => tempPreviewUrl.value || $fileUrl(form.image_url) || '')
const isMain = computed(() => form.type === 'MAIN')
const isSplit = computed(() => form.type === 'INFORMATION' && ['LEFT', 'RIGHT'].includes(form.image_position))
const imgFirst = computed(() => form.image_position === 'LEFT')

const aspect = computed(() => isMain.value ? '1920 / 2160' : '1920 / 1080')
const ratioHint = computed(() => {
  switch (form.type) {
    case 'MAIN':
      return {label: 'MAIN', wh: '1920×2160', ratio: '≈0.89:1 (портрет)'}
    case 'COLLECTION':
    case 'PRODUCT':
      return {label: 'COLLECTION / PRODUCT', wh: '1920×1080', ratio: '16:9 (≈1.78:1)'}
    case 'INFORMATION':
      return {
        label: 'INFORMATION',
        wh: '960×1080 (фото-половина)',
        extra: 'Общий блок 1920×1080',
        ratio: '≈0.89:1 / общий 16:9'
      }
    default:
      return {label: 'DEFAULT', wh: '1920×1080', ratio: '16:9'}
  }
})

const titleHtml = computed(() => renderItalicsToHtml(form.title))
const descHtml = computed(() => renderItalicsToHtml(form.description))

const ctaEnabled = computed(() =>
    ['COLLECTION', 'PRODUCT'].includes(form.type) && !!String(form.source_id || '').trim()
)
const ctaLabel = computed(() => form.type === 'PRODUCT' ? 'К товару' : 'В коллекцию')
const ctaHref = computed(() => {
  if (!ctaEnabled.value) return '#'
  const [kind, value] = String(form.source_id).split(':')
  if (!value) return '#'
  switch ((kind || '').toLowerCase()) {
    case 'product':
      return `/product/${value}`
    case 'collection':
      return `/collections/${value}`
    case 'selection':
      return `/selections/${value}`
    default:
      return '#'
  }
})

const handleBeforeUpload = (file: File) => {
  const okType = /image\/(jpeg|png|webp)/i.test(file.type)
  const okSize = file.size / 1024 / 1024 <= 5
  if (!okType) ElMessage.error('Поддерживаются JPG/PNG/WebP')
  if (!okSize) ElMessage.error('Размер файла не должен превышать 5 МБ')
  return okType && okSize
}
const handleFileUpload = async (opts: any) => {
  const {file, onSuccess, onError} = opts
  try {
    if (process.client) {
      if (tempPreviewUrl.value) URL.revokeObjectURL(tempPreviewUrl.value)
      tempPreviewUrl.value = URL.createObjectURL(file as File)
    }
    const fd = new FormData()
    fd.append('file', file as File)
    const resp: any = await $api('/uploads/images', {method: 'POST', body: fd})
    form.image_url = resp?.file_url || resp?.file_path || ''
    if (tempPreviewUrl.value) {
      URL.revokeObjectURL(tempPreviewUrl.value);
      tempPreviewUrl.value = ''
    }
    resetUploader()
    onSuccess?.(resp)
    ElMessage.success('Файл загружен')
  } catch (e) {
    onError?.(e)
    ElMessage.error('Ошибка загрузки файла')
    if (tempPreviewUrl.value) {
      URL.revokeObjectURL(tempPreviewUrl.value);
      tempPreviewUrl.value = ''
    }
    resetUploader()
  }
}
const resetUploader = () => {
  uploadKey.value++
}
const clearImage = () => {
  if (tempPreviewUrl.value) URL.revokeObjectURL(tempPreviewUrl.value)
  tempPreviewUrl.value = ''
  form.image_url = ''
  resetUploader()
}

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return
  saving.value = true
  try {
    await $api(`/banners/${form.id}`, {method: 'PUT', body: form})
    ElMessage.success('Сохранено')
    navigateTo('/admin/banners')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const remove = async () => {
  try {
    await $api(`/banners/${form.id}`, {method: 'DELETE'})
    ElMessage.success('Удалено')
    navigateTo('/admin/banners')
  } catch {
    ElMessage.error('Ошибка удаления')
  }
}
const cancel = () => navigateTo('/admin/banners')

const fmt = (v?: string) => v
    ? new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(v))
    : '—'
</script>
