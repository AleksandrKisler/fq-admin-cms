<template>
  <div class="space-y-6" v-if="loaded">
    <AdminPageHeader :title="form.title || ('Кампания #' + id)" :subtitle="`Статус: ${form.status}`">
      <template #actions>
        <el-button type="success" plain @click="send" :disabled="form.status==='SENDING'">Отправить</el-button>
        <NuxtLink to="/admin/newsletters"><el-button>Назад</el-button></NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Редактирование">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Название" prop="title"><el-input v-model="form.title"/></el-form-item>
            <div class="grid md:grid-cols-2 gap-4">
              <el-form-item label="Тема письма" prop="subject"><el-input v-model="form.subject"/></el-form-item>
              <el-form-item label="Preheader"><el-input v-model="form.preheader"/></el-form-item>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <el-form-item label="От кого"><el-input v-model="form.from_name"/></el-form-item>
              <el-form-item label="Email отправителя"><el-input v-model="form.from_email"/></el-form-item>
            </div>
            <el-form-item label="HTML контент" prop="html">
              <el-input v-model="form.html" type="textarea" :rows="10"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Сегмент">
          <el-tag v-for="t in (form.segment?.tags||[])" :key="t" class="mr-1">{{ t }}</el-tag>
        </AdminFormSection>

        <el-button type="primary" :loading="saving" @click="save">Сохранить</el-button>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Предпросмотр">
          <EmailPreview :subject="form.subject" :preheader="form.preheader" :html="form.html" :from_name="form.from_name" :from_email="form.from_email"/>
        </AdminFormSection>

        <AdminFormSection title="Метрики">
          <div class="text-sm text-gray-700 grid grid-cols-2 gap-2">
            <div>Отправлено: <b>{{ form.metrics.sent }}</b></div>
            <div>Доставлено: <b>{{ form.metrics.delivered }}</b></div>
            <div>Открытия: <b>{{ form.metrics.open }}</b></div>
            <div>Клики: <b>{{ form.metrics.click }}</b></div>
            <div>Отписки: <b>{{ form.metrics.unsubscribe }}</b></div>
            <div>Спам: <b>{{ form.metrics.spam }}</b></div>
          </div>
        </AdminFormSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import EmailPreview from '~/components/admin/newsletters/EmailPreview.vue'
import { useNewsletterApi } from '~/composables/useNewsletterApi'

definePageMeta({ layout: 'admin' })
const route = useRoute()
const id = Number(route.params.id)
const api = useNewsletterApi()

const loaded = ref(false)
const formRef = ref()
const saving = ref(false)
const form = reactive<any>({
  title:'', subject:'', preheader:'', from_name:'', from_email:'', html:'',
  status:'DRAFT', segment:null, metrics:{ sent:0, delivered:0, open:0, click:0, unsubscribe:0, spam:0 }
})
const rules = {
  title: [{ required:true, message:'Название обязательно', trigger:'blur' }],
  subject: [{ required:true, message:'Тема обязательна', trigger:'blur' }],
  html: [{ required:true, message:'HTML обязателен', trigger:'blur' }]
}

const fetchItem = async () => {
  const r:any = await api.get(id)
  Object.assign(form, r.campaign || {})
  loaded.value = true
}
const save = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if (!ok) return
  saving.value = true
  try { await api.update(id, form); ElMessage.success('Сохранено') }
  finally { saving.value = false }
}
const send = async () => { await api.send(id); ElMessage.success('Отправка смоделирована'); setTimeout(fetchItem, 800) }

onMounted(fetchItem)
</script>
