<template>
  <el-select
    v-model="innerValue"
    multiple filterable remote reserve-keyword
    :remote-method="search" :loading="loading"
    placeholder="Выберите товары"
    class="w-full"
  >
    <el-option v-for="item in options" :key="item.id" :label="formatLabel(item)" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number[] | null }>()
const emit = defineEmits<{ (e:'update:modelValue', v:number[]): void }>();
const {$api} = useNuxtApp();

const innerValue = ref<number[]>(props.modelValue || []);
watch(() => props.modelValue, v => innerValue.value = v || []);
watch(innerValue, v => emit('update:modelValue', v));

const options = ref<any[]>([]);
const loading = ref(false);

const search = async (q:string) => {
  loading.value = true;
  try {
    let res:any;
    try {
      res = await $api('/products', { query: { q, limit: 20 } });
    } catch {
      res = await $api('/products/search', { method: 'POST', body: { q, limit: 20 } });
    }
    options.value = (res?.data || res?.products || res || []).map((p:any) => ({
      id: p.id, title: p.title, sku: p.sku
    }));
  } finally { loading.value = false; }
};
const formatLabel = (item:any) => `${item.title ?? item.sku ?? item.id}${item.sku ? ' ('+item.sku+')' : ''}`;
</script>
