<template>
  <div class="rounded-xl border bg-white dark:bg-neutral-900 border-gray-100 dark:border-white/10 overflow-hidden">
    <!-- header -->
    <div class="px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10">
      <div class="flex items-center gap-3">
        <el-switch v-model="innerActive" @change="emit('update:isActive', innerActive)" />
        <div class="leading-tight">
          <div class="el-form-item__label !mb-0">Опубликована</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ innerActive ? 'Коллекция видна на сайте' : 'Черновик — скрыта от пользователей' }}
          </div>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="updatedAt">Обновлено: {{ fmt(updatedAt) }}</span>
        <span v-if="createdAt" class="hidden lg:inline">· Создано: {{ fmt(createdAt) }}</span>
      </div>
    </div>

    <!-- cover (upload surface) -->
    <div class="relative">
      <el-upload
          :key="uploadKey"
          ref="uploadRef"
          drag
          :show-file-list="false"
          accept="image/*"
          :limit="1"
          :before-upload="beforeUpload"
          :http-request="uploadRequest"
          class="w-full"
      >
        <div class="aspect-[16/9] relative">
          <!-- preview (как в баннерах: temp -> $fileUrl) -->
          <img
              v-if="previewUrl"
              :src="previewUrl"
              class="absolute inset-0 w-full h-full object-cover"
          />

          <!-- placeholder -->
          <div
              v-else
              class="absolute inset-0 grid place-items-center text-gray-400 dark:text-white/60 border-2 border-dashed border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5"
          >
            <div class="text-center px-6">
              <div class="mb-1">Перетащите изображение сюда</div>
              <div class="text-xs">или нажмите, чтобы выбрать файл</div>
            </div>
          </div>
        </div>
      </el-upload>

      <!-- actions -->
      <div class="absolute right-3 top-3 flex items-center gap-2" v-if="previewUrl">
        <el-button size="small" @click="openInNewTab" text>Открыть</el-button>
        <el-button size="small" @click="triggerReplace" type="primary" text>Заменить</el-button>
        <el-popconfirm title="Убрать обложку?" @confirm="clear">
          <template #reference>
            <el-button size="small" type="danger" text>Удалить</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- footer -->
    <div class="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
      <div><span class="font-medium">Рекомендованный размер:</span> 1920×1080</div>
      <div><span class="font-medium">Соотношение превью:</span> 16:9</div>
      <div v-if="previewImage" class="truncate mt-1">
        <span class="font-medium">Файл:</span> {{ previewImage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadInstance } from 'element-plus'

type Emits = {
  (e:'update:isActive', v:boolean): void
  (e:'update:previewImage', v:string): void
}

const props = defineProps<{
  isActive: boolean
  previewImage: string
  createdAt?: string | null
  updatedAt?: string | null
}>()
const emit = defineEmits<Emits>()

const { $api, $fileSSRUrl } = useNuxtApp()

/* state */
const uploadRef = ref<UploadInstance | null>(null)
const uploadKey = ref(0)
const innerActive = ref(props.isActive)
watch(() => props.isActive, v => { innerActive.value = !!v })

const previewImage = computed({
  get: () => props.previewImage || '',
  set: v => emit('update:previewImage', v)
})

/** временный objectURL для мгновенного превью — как в баннерах */
const tempPreviewUrl = ref<string>('')

/** финальный URL для <img> — строго temp || $fileUrl */
const previewUrl = computed(() => {
  if (tempPreviewUrl.value) return tempPreviewUrl.value
  try {
    // $fileUrl может вернуть пустую строку, держим fallback ''
    return (typeof $fileSSRUrl === 'function' ? $fileSSRUrl(previewImage.value) : '') || ''
  } catch {
    return ''
  }
})

const createdAt = computed(() => props.createdAt || null)
const updatedAt = computed(() => props.updatedAt || null)
const fmt = (v?: string | null) => {
  if (!v) return ''
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(v))
  } catch { return '' }
}

/* upload logic — идентично баннерам: моментальная подмена temp, потом API */
const beforeUpload = (file: File) => {
  const okType = /image\/(jpeg|png|webp)/i.test(file.type)
  const okSize = file.size / 1024 / 1024 <= 5
  if (!okType) ElMessage.error('Поддерживаются JPG/PNG/WebP')
  if (!okSize) ElMessage.error('Размер файла не должен превышать 5 МБ')
  return okType && okSize
}

const uploadRequest = async (opt: any) => {
  const { file, onSuccess, onError } = opt
  try {
    if (process.client) {
      if (tempPreviewUrl.value) URL.revokeObjectURL(tempPreviewUrl.value)
      tempPreviewUrl.value = URL.createObjectURL(file as File)
    }
    const fd = new FormData()
    fd.append('file', file as File)
    const resp: any = await $api('/uploads/images', { method: 'POST', body: fd })
    // сохраняем путь от сервера
    previewImage.value = resp?.file_url || resp?.file_path || ''
    // очищаем temp урл (покажется уже $fileUrl)
    if (process.client && tempPreviewUrl.value) {
      URL.revokeObjectURL(tempPreviewUrl.value)
      tempPreviewUrl.value = ''
    }
    uploadKey.value++
    onSuccess?.(resp)
    ElMessage.success('Файл загружен')
  } catch (e) {
    onError?.(e)
    ElMessage.error('Ошибка загрузки')
    if (process.client && tempPreviewUrl.value) {
      URL.revokeObjectURL(tempPreviewUrl.value)
      tempPreviewUrl.value = ''
    }
    uploadKey.value++
  }
}

/* actions */
const clear = () => {
  if (process.client && tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value)
    tempPreviewUrl.value = ''
  }
  previewImage.value = ''
  uploadKey.value++
}
const triggerReplace = () => {
  // @ts-ignore — доступ к внутреннему input
  uploadRef.value?.$el?.querySelector('input[type=file]')?.click()
}
const openInNewTab = () => {
  if (previewUrl.value) window.open(previewUrl.value, '_blank')
}
</script>

<style scoped>
:deep(.el-upload) { width: 100%; }
</style>
