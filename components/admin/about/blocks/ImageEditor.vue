<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <el-form-item label="Картинка"><CoverUpload v-model="local.image"/></el-form-item>
    <el-form-item label="Соотношение"><el-select v-model="local.ratio">
      <el-option value="16/9" label="16:9"/><el-option value="4/3" label="4:3"/>
      <el-option value="3/2" label="3:2"/><el-option value="1/1" label="1:1"/>
      <el-option value="auto" label="Auto"/>
    </el-select></el-form-item>
    <el-form-item label="Выравнивание"><el-segmented v-model="local.align" :options="['left','center','right']"/></el-form-item>
    <el-form-item label="Подпись" class="md:col-span-2"><el-input v-model="local.caption"/></el-form-item>
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
