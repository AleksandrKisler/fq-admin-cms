<template>
  <el-radio-group v-model="model" size="default">
    <el-radio-button v-for="opt in options" :key="opt.value" :label="opt.value">
      {{ opt.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string | number; options: {label:string; value:string|number}[] }>()
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
</script>
