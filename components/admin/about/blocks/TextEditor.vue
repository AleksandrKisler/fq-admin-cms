<template>
  <div class="space-y-3">
    <el-form-item label="Ширина"><el-segmented v-model="local.width" :options="['narrow','normal','wide']"/></el-form-item>
    <el-form-item label="Выравнивание"><el-segmented v-model="local.align" :options="['left','center','right']"/></el-form-item>
    <ArticleEditor v-model="local.html" :show-preview="false"/>
  </div>
</template>

<script setup>
import ArticleEditor from '~/components/admin/articles/ArticleEditor.vue'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit  = defineEmits(['update:modelValue'])
const local = reactive(JSON.parse(JSON.stringify(props.modelValue)))
watch(() => props.modelValue, v => Object.assign(local, JSON.parse(JSON.stringify(v || {}))))
watch(local, v => emit('update:modelValue', v), { deep: true })
</script>
