<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-full max-w-sm">
      <h2 class="text-center text-xl font-semibold mb-4">Регистрация</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="email"><el-input v-model="form.email" placeholder="Email"/></el-form-item>
        <el-form-item prop="password"><el-input v-model="form.password" type="password" placeholder="Пароль"/></el-form-item>
        <el-form-item prop="confirm"><el-input v-model="form.confirm" type="password" placeholder="Повторите пароль"/></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="submit">Создать аккаунт</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
const {$api} = useNuxtApp(); const token = useCookie<string | null>('token');
const formRef = ref<FormInstance>(); const loading = ref(false);
const form = reactive({ email:'', password:'', confirm:'' });
const rules: FormRules = {
  email: [{ required:true, message:'Введите email', trigger:'blur' }],
  password: [{ required:true, message:'Введите пароль', trigger:'blur' }],
  confirm: [{ validator: (_r,v,cb)=> v===form.password?cb():cb(new Error('Пароли не совпадают')), trigger:'blur' }]
};
const submit = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if(!ok) return;
  loading.value = true;
  try { const r:any = await $api('/auth/register', { method:'POST', body:{ email:form.email, password:form.password }});
    token.value = r.token; await navigateTo('/admin'); }
  catch { ElMessage.error('Ошибка регистрации'); } finally { loading.value = false; }
};
</script>
