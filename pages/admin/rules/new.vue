<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новое правило" subtitle="Добавьте заголовок и контент.">
      <template #actions><NuxtLink to="/admin/rules"><el-button>Назад</el-button></NuxtLink></template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Заголовок" prop="title"><el-input v-model="form.title"/></el-form-item>
            <el-form-item label="Текст правила" prop="content">
              <ArticleEditor v-model="form.content" :show-preview="false" class="bg-white rounded-md"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Действия">
          <div class="flex items-center gap-2">
            <el-button type="primary" :loading="saving" @click="save(false)">Сохранить (черновик)</el-button>
            <el-button type="success" plain :loading="saving" @click="save(true)">Сохранить и опубликовать</el-button>
          </div>
        </AdminFormSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import ArticleEditor from "~/components/admin/articles/ArticleEditor.vue";
definePageMeta({ layout: 'admin' })

const cfg = useRuntimeConfig()
const api = (p: string) => `${(cfg.public as any)?.apiBase || 'http://localhost:80'}${p}`

const formRef = ref()
const saving = ref(false)
const form = reactive({ title:'', content:'' })
const rules = {
  title: [{ required:true, message:'Заголовок обязателен', trigger:'blur' }],
  content: [{ required:true, message:'Текст обязателен', trigger:'change' }],
}

const save = async (publish?: boolean) => {
  const ok = await formRef.value?.validate().catch(()=>false); if (!ok) return
  saving.value = true
  try {
    const created:any = await $fetch(api('/rules'), {
      method:'POST', credentials:'include', body: form
    })
    if (publish) {
      await $fetch(api(`/rules/${created.data.id}/publish`), {
        method:'PATCH', credentials:'include', body:{ publish:true }
      })
    }
    ElMessage.success('Сохранено')
    navigateTo('/admin/rules')
  } catch { ElMessage.error('Ошибка сохранения') }
  finally { saving.value = false }
}
</script>
