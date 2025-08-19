<template>
  <div class="max-w-4xl space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Редактировать главную</h1>
      <div class="space-x-2">
        <el-button @click="publish" :disabled="form.is_active" :loading="busy">Опубликовать</el-button>
        <el-popconfirm title="Удалить страницу?" @confirm="remove">
          <template #reference>
            <el-button type="danger" :loading="busy">Удалить</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="200px" v-if="loaded">
      <el-form-item label="Название" prop="title">
        <el-input v-model="form.title"/>
      </el-form-item>
      <el-form-item label="Slug" prop="slug">
        <el-input v-model="form.slug"/>
      </el-form-item>
      <el-form-item label="Активна">
        <el-switch v-model="form.is_active"/>
      </el-form-item>

      <el-divider>Баннеры</el-divider>
      <el-form-item label="main">
        <el-input v-model="form.banners.main"/>
      </el-form-item>
      <el-form-item label="slot-1">
        <el-input v-model="form.banners['slot-1']"/>
      </el-form-item>
      <el-form-item label="slot-2">
        <el-input v-model="form.banners['slot-2']"/>
      </el-form-item>
      <el-form-item label="slot-3">
        <el-input v-model="form.banners['slot-3']"/>
      </el-form-item>

      <el-divider>Подборки</el-divider>
      <el-form-item label="slot-1">
        <el-input v-model="form.selections['slot-1']"/>
      </el-form-item>
      <el-form-item label="slot-2">
        <el-input v-model="form.selections['slot-2']"/>
      </el-form-item>
      <el-form-item label="slot-3">
        <el-input v-model="form.selections['slot-3']"/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="busy" @click="save">Сохранить</el-button>
        <NuxtLink to="/admin/homepages">
          <el-button>Отмена</el-button>
        </NuxtLink>
      </el-form-item>
    </el-form>
    <el-skeleton v-else :rows="8" animated/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'});
import type {FormInstance, FormRules} from 'element-plus'

const {$api} = useNuxtApp();
const route = useRoute();
const id = Number(route.params.id);
const formRef = ref<FormInstance>();
const loaded = ref(false);
const busy = ref(false);
const form = reactive({
  title: '', slug: '', is_active: false,
  banners: {main: null as any, 'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any},
  selections: {'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any}
});
const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  slug: [{required: true, message: 'Slug обязателен', trigger: 'blur'}]
};
const fetchOne = async () => {
  loaded.value = false;
  const r: any = await $api(`/homepages/${id}`);
  Object.assign(form, r.page || {});
  loaded.value = true;
};
onMounted(fetchOne);
const save = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  busy.value = true;
  try {
    await $api(`/homepages/${id}`, {method: 'PUT', body: form});
    ElMessage.success('Сохранено');
  } catch {
    ElMessage.error('Ошибка сохранения');
  } finally {
    busy.value = false;
  }
};
const publish = async () => {
  busy.value = true;
  try {
    await $api(`/homepages/${id}/publish`, {method: 'POST'});
    ElMessage.success('Опубликовано');
    await fetchOne();
  } catch {
    ElMessage.error('Ошибка публикации');
  } finally {
    busy.value = false;
  }
};
const remove = async () => {
  busy.value = true;
  try {
    await $api(`/homepages/${id}`, {method: 'DELETE'});
    ElMessage.success('Удалено');
    navigateTo('/admin/homepages');
  } catch {
    ElMessage.error('Ошибка удаления');
  } finally {
    busy.value = false;
  }
};
</script>
