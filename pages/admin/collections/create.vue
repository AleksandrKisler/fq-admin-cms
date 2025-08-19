<template>
  <div class="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Создать новую коллекцию</h1>

    <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="160px"
        label-position="top"
        class="space-y-6"
    >
      <el-form-item label="Название" prop="title">
        <el-input
            v-model="form.title"
            placeholder="Введите название коллекции"
            clearable
        />
      </el-form-item>

      <el-form-item label="Описание" prop="description">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="Краткое описание коллекции"
            resize="none"
        />
      </el-form-item>

      <div class="border-t pt-6">
        <el-form-item label="Товары (мультиселект)">
          <ProductMultiSelect v-model="form.productIds"/>
        </el-form-item>
      </div>

      <div class="border-t pt-6">
        <el-form-item>
          <div class="flex items-center gap-3">
            <el-switch v-model="form.is_active"/>
            <span class="text-gray-700">Активна</span>
          </div>
        </el-form-item>
      </div>

      <div class="border-t pt-6">
        <el-form-item>
          <div class="flex gap-3">
            <el-button
                type="success"
                :loading="saving"
                @click="submit"
                class="px-6"
            >
              Сохранить
            </el-button>
            <NuxtLink to="/admin/collections">
              <el-button class="px-6">Отмена</el-button>
            </NuxtLink>
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>


<script setup lang="ts">
definePageMeta({layout: 'admin'});
import type {FormInstance, FormRules} from 'element-plus'
import ProductMultiSelect from '~/components/ProductMultiSelect.vue'

const {$api} = useNuxtApp();
const formRef = ref<FormInstance>();
const saving = ref(false);
const form = reactive({title: '', description: '', is_active: true, productIds: [] as number[]});
const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  description: [{required: true, message: 'Описание обязательно', trigger: 'blur'}]
};
const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  saving.value = true;
  try {
    await $api('/collections', {method: 'POST', body: form});
    ElMessage.success('Создано');
    navigateTo('/admin/collections');
  } catch {
    ElMessage.error('Ошибка');
  } finally {
    saving.value = false;
  }
};
</script>
