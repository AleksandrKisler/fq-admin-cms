<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-2">
      <div class="text-sm text-gray-500">Левая</div>
      <CoverUpload v-model="local.left.image"/>
      <el-input v-model="local.left.caption" placeholder="Подпись"/>
    </div>
    <div class="space-y-2">
      <div class="text-sm text-gray-500">Правая</div>
      <CoverUpload v-model="local.right.image"/>
      <el-input v-model="local.right.caption" placeholder="Подпись"/>
    </div>
    <el-form-item label="Промежуток (px)" class="md:col-span-2">
      <el-slider v-model="local.gap" :min="0" :max="48"/>
    </el-form-item>
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
