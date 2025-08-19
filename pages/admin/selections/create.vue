<template>
  <div class="max-w-3xl">
    <h1 class="text-xl font-semibold mb-4">Новая подборка</h1>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="160px">
      <el-form-item label="Название" prop="title">
        <el-input v-model="form.title" @input="autoSlug"/>
      </el-form-item>
      <el-form-item label="Slug" prop="slug">
        <el-input v-model="form.slug" @input="slugDirty = true" placeholder="best-sellers"/>
      </el-form-item>
      <el-form-item label="Описание" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3"/>
      </el-form-item>

      <el-form-item label="Товары (мультиселект)">
        <ProductMultiSelect v-model="form.productIds"/>
      </el-form-item>

      <el-form-item label="Активна"><el-switch v-model="form.is_active"/></el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
        <NuxtLink to="/admin/selections"><el-button>Отмена</el-button></NuxtLink>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });
import type { FormInstance, FormRules } from 'element-plus'
import ProductMultiSelect from '~/components/ProductMultiSelect.vue'
import { slugifyRu } from '~/utils/slug'
const {$api} = useNuxtApp();

const formRef = ref<FormInstance>(); const saving = ref(false);
const slugDirty = ref(false);
const form = reactive({ title:'', slug:'', description:'', is_active:true, productIds: [] as number[] });
const rules: FormRules = {
  title: [{ required:true, message:'Название обязательно', trigger:'blur' }],
  slug: [{ required:true, message:'Slug обязателен', trigger:'blur' }],
  description: [{ required:true, message:'Описание обязательно', trigger:'blur' }]
};
const autoSlug = () => { if (!slugDirty.value) form.slug = slugifyRu(form.title); };
const submit = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if(!ok) return;
  saving.value = true;
  try { await $api('/selections', { method:'POST', body: form }); ElMessage.success('Создано'); navigateTo('/admin/selections'); }
  catch { ElMessage.error('Ошибка'); } finally { saving.value=false; }
};
</script>
