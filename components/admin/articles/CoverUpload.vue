<template>
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <el-upload
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          :on-change="onPick"
      >
        <el-button type="primary">Загрузить обложку</el-button>
      </el-upload>
      <el-button v-if="modelValue" @click="$emit('update:modelValue','')" text type="danger">Очистить</el-button>
    </div>

    <div class="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 h-48 grid place-items-center">
      <img v-if="modelValue" :src="$fileUrl(modelValue)" class="h-full w-full object-cover" alt="">
      <div v-else class="text-gray-400">Нет изображения</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const {$api, $fileUrl} = useNuxtApp()

const onPick = async (fileEvent: any) => {
  const raw = fileEvent.raw as File | undefined
  if (!raw) return
  const fd = new FormData()
  fd.append('file', raw)
  try {
    const res: any = await $api('/uploads/images', {method: 'POST', body: fd})
    const url = res?.file_url || res?.url || ''
    if (!url) throw new Error('Не удалось получить URL')
    emit('update:modelValue', url)
    ElMessage.success('Изображение загружено')
  } catch {
    ElMessage.error('Ошибка загрузки')
  }
}
</script>
