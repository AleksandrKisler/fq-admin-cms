<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <el-form-item label="Колонки"><el-segmented v-model="local.columns" :options="[2,3,4]"/></el-form-item>
      <el-form-item label="Отступ (px)"><el-slider v-model="local.gap" :min="0" :max="24"/></el-form-item>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div v-for="(it, i) in local.items" :key="i" class="rounded-lg border p-2">
        <CoverUpload v-model="it.image"/>
        <el-input v-model="it.caption" class="mt-2" placeholder="Подпись"/>
        <div class="flex justify-end mt-2">
          <el-button text type="danger" @click="local.items.splice(i,1)">Удалить</el-button>
        </div>
      </div>

      <button type="button" class="rounded-lg border-2 border-dashed p-6 text-sm text-gray-500"
              @click="local.items.push({ image:'', caption:'' })">
        + Добавить изображение
      </button>
    </div>
  </div>
</template>

<script setup>
import CoverUpload from '~/components/admin/articles/CoverUpload.vue'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit  = defineEmits(['update:modelValue'])
const local = reactive(JSON.parse(JSON.stringify(props.modelValue)))
watch(() => props.modelValue, v => Object.assign(local, JSON.parse(JSON.stringify(v || {}))))
watch(local, v => emit('update:modelValue', v), { deep: true })
</script>
