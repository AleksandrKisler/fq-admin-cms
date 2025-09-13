<template>
  <div class="space-y-3">
    <el-input v-model="local.text" type="textarea" :rows="2" placeholder="Текст цитаты"/>
    <div class="grid grid-cols-2 gap-3">
      <el-input v-model="local.author" placeholder="Автор"/>
      <el-checkbox v-model="local.big">Крупная</el-checkbox>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit  = defineEmits(['update:modelValue'])
const local = reactive(JSON.parse(JSON.stringify(props.modelValue)))
watch(() => props.modelValue, v => Object.assign(local, JSON.parse(JSON.stringify(v || {}))))
watch(local, v => emit('update:modelValue', v), { deep: true })
</script>
