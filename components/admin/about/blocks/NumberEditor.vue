<template>
  <div class="grid grid-cols-3 gap-3">
    <el-input v-model="local.value" placeholder="10"/>
    <el-input v-model="local.label" placeholder="лет"/>
    <el-input v-model="local.text" placeholder="описание"/>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit  = defineEmits(['update:modelValue'])
const local = reactive(JSON.parse(JSON.stringify(props.modelValue)))
watch(() => props.modelValue, v => Object.assign(local, JSON.parse(JSON.stringify(v || {}))))
watch(local, v => emit('update:modelValue', v), { deep: true })
</script>
