<template>
  <el-radio-group v-model="model">
    <el-radio-button
        v-for="opt in options"
        :key="opt.value"
        :label="opt.value"
        :disabled="opt.disabled"
    >
      {{ opt.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string; options: { label:string; value:string; disabled?: boolean }[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string):void }>()
const model = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
</script>
