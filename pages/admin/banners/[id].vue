<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Редактировать баннер</h1>
      <div class="space-x-2">
        <el-popconfirm title="Удалить баннер?" @confirm="remove"><template #reference><el-button type="danger" :loading="busy">Удалить</el-button></template></el-popconfirm>
        <el-button v-if="banner?.deleted_at" :loading="busy" @click="restore">Восстановить</el-button>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="160px" status-icon v-if="loaded">
      <el-form-item label="Тип" prop="type"><el-select v-model="form.type"><el-option label="INFORMATION" value="INFORMATION"/><el-option label="COLLECTION" value="COLLECTION"/><el-option label="PRODUCT" value="PRODUCT"/></el-select></el-form-item>
      <el-form-item label="Заголовок" prop="title"><el-input v-model="form.title"/></el-form-item>
      <el-form-item label="Описание" prop="description"><el-input v-model="form.description" type="textarea" :rows="3"/></el-form-item>
      <el-form-item label="Позиция картинки" prop="image_position"><el-select v-model="form.image_position"><el-option label="DEFAULT" value="DEFAULT"/><el-option label="LEFT" value="LEFT"/><el-option label="RIGHT" value="RIGHT"/></el-select></el-form-item>
      <el-form-item label="Источник (опц.)"><el-input v-model="form.source_id"/></el-form-item>
      <el-form-item label="Изображение" prop="image_url"><el-input v-model="form.image_url" placeholder="/banners/hero.jpg или полный URL" /></el-form-item>
      <el-form-item label="Активен"><el-switch v-model="form.is_active"/></el-form-item>
      <el-form-item><el-button type="primary" :loading="busy" @click="save">Сохранить</el-button><NuxtLink to="/admin/banners"><el-button>Отмена</el-button></NuxtLink></el-form-item>
    </el-form>
    <el-skeleton v-else :rows="6" animated />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });
import type { FormInstance, FormRules } from 'element-plus'
import { isValidImageUrl } from '~/utils/validators'
const {$api} = useNuxtApp(); const route = useRoute();
const id = Number(route.params.id);
const formRef = ref<FormInstance>(); const loaded = ref(false); const busy = ref(false);
const banner = ref<any>(null);
const form = reactive({ type:'INFORMATION', title:'', description:'', source_id:'', image_position:'DEFAULT', image_url:'', is_active:true });
const rules: FormRules = {
  type: [{ required: true, message: 'Тип обязателен', trigger: 'change' }],
  title: [{ required: true, message: 'Заголовок обязателен', trigger: 'blur' }],
  description: [{ required: true, message: 'Описание обязательно', trigger: 'blur' }],
  image_position: [{ required: true, message: 'Укажите позицию', trigger: 'change' }],
  image_url: [{ validator: (_r, v, cb) => isValidImageUrl(v) ? cb() : cb(new Error('Укажите корректный URL (https://...) или путь вида /banners/hero.jpg')), trigger: 'change' }]
};
const fetchOne = async () => {
  loaded.value = false;
  const r:any = await $api(`/banners/${id}`, { query:{ withDeleted:'true' } });
  banner.value = r?.banner ?? null;
  Object.assign(form, banner.value);
  loaded.value = true;
};
onMounted(fetchOne);
const save = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if(!ok) return;
  busy.value = true;
  try { await $api(`/banners/${id}`, { method:'PUT', body: form }); ElMessage.success('Сохранено'); await fetchOne(); }
  catch { ElMessage.error('Ошибка сохранения'); } finally { busy.value = false; }
};
const remove = async () => { busy.value=true; try { await $api(`/banners/${id}`, { method:'DELETE' }); ElMessage.success('Удалено'); navigateTo('/admin/banners'); } catch { ElMessage.error('Ошибка удаления'); } finally { busy.value=false; } };
const restore = async () => { busy.value=true; try { await $api(`/banners/${id}/restore`, { method:'POST' }); ElMessage.success('Восстановлено'); await fetchOne(); } catch { ElMessage.error('Ошибка восстановления'); } finally { busy.value=false; } };
</script>
