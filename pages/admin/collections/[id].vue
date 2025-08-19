<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Редактировать коллекцию</h1>
      <el-popconfirm title="Удалить коллекцию?" @confirm="remove">
        <template #reference>
          <el-button type="danger" :loading="busy">Удалить</el-button>
        </template>
      </el-popconfirm>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="160px" v-if="loaded">
      <el-form-item label="Название" prop="title">
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="Описание" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3"/>
      </el-form-item>

      <el-form-item label="Товары (мультиселект)">
        <ProductMultiSelect v-model="form.productIds"/>
      </el-form-item>

      <el-form-item label="Активна">
        <el-switch v-model="form.is_active"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="busy" @click="save">Сохранить</el-button>
        <NuxtLink to="/admin/collections">
          <el-button>Отмена</el-button>
        </NuxtLink>
      </el-form-item>
    </el-form>

    <el-skeleton v-else :rows="6" animated/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'});
import type {FormInstance, FormRules} from 'element-plus'
import ProductMultiSelect from '~/components/ProductMultiSelect.vue'

const {$api} = useNuxtApp();
const route = useRoute();
const id = Number(route.params.id);
const formRef = ref<FormInstance>();
const loaded = ref(false);
const busy = ref(false);
const form = reactive({title: '', description: '', is_active: true, productIds: [] as number[]});
const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  description: [{required: true, message: 'Описание обязательно', trigger: 'blur'}]
};
const fetchOne = async () => {
  loaded.value = false;
  const r: any = await $api(`/collections/${id}`, {query: {include: 'products'}});
  Object.assign(form, {
    title: r.collection.title,
    description: r.collection.description,
    is_active: !!r.collection.is_active,
    productIds: (r.collection.products || []).map((p: any) => p.id)
  });
  loaded.value = true;
};
onMounted(fetchOne);
const save = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  busy.value = true;
  try {
    await $api(`/collections/${id}`, {method: 'PUT', body: form});
    ElMessage.success('Сохранено');
  } catch {
    ElMessage.error('Ошибка сохранения');
  } finally {
    busy.value = false;
  }
};
const remove = async () => {
  busy.value = true;
  try {
    await $api(`/collections/${id}`, {method: 'DELETE'});
    ElMessage.success('Удалено');
    navigateTo('/admin/collections');
  } catch {
    ElMessage.error('Ошибка удаления');
  } finally {
    busy.value = false;
  }
};
</script>
