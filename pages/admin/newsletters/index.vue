<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новая рассылка" subtitle="Соберите письмо и выберите сегмент.">
      <template #actions><NuxtLink to="/admin/newsletters"><el-button>Назад</el-button></NuxtLink></template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-6">
        <AdminFormSection title="Основное">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid gap-4">
            <el-form-item label="Название" prop="title"><el-input v-model="form.title"/></el-form-item>
            <div class="grid md:grid-cols-2 gap-4">
              <el-form-item label="Тема письма" prop="subject"><el-input v-model="form.subject"/></el-form-item>
              <el-form-item label="Preheader"><el-input v-model="form.preheader"/></el-form-item>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <el-form-item label="От кого"><el-input v-model="form.from_name" placeholder="Forever Queen"/></el-form-item>
              <el-form-item label="Email отправителя"><el-input v-model="form.from_email" placeholder="hello@foreverqueen.ru"/></el-form-item>
            </div>
            <el-form-item label="HTML контент" prop="html">
              <el-input v-model="form.html" type="textarea" :rows="10" placeholder="<h1>Заголовок</h1>…"/>
            </el-form-item>
          </el-form>
        </AdminFormSection>

        <AdminFormSection title="Сегмент аудитории">
          <div class="grid md:grid-cols-2 gap-4">
            <el-select v-model="tags" multiple filterable placeholder="Теги (опционально)">
              <el-option v-for="t in allTags" :key="t" :label="t" :value="t"/>
            </el-select>
            <el-button @click="loadSubs" :loading="subsLoading">Посчитать аудиторию</el-button>
          </div>
          <p class="text-sm text-gray-500 mt-2">Подписчиков в выборке: <b>{{ audienceCountLabel }}</b></p>
        </AdminFormSection>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AdminFormSection title="Предпросмотр">
          <EmailPreview
              :subject="form.subject"
              :preheader="form.preheader"
              :html="form.html"
              :from_name="form.from_name"
              :from_email="form.from_email"
          />
        </AdminFormSection>

        <AdminFormSection title="Действия">
          <div class="flex items-center gap-2">
            <el-button type="success" plain :disabled="!savedId" @click="save">Отправить</el-button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Подстановка переменных: используйте <code>ХХ</code> в HTML.</p>
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
const api = useNewsletterApi()
const formRef = ref()
const saving = ref(false)
const savedId = ref<number| null>(null)

const form = reactive({
  title: 'Промо рассылка',
  subject: 'Новинки и скидки',
  preheader: 'Только сегодня',
  from_name: 'Forever Queen',
  from_email: 'hello@foreverqueen.ru',
  html: '<h1>Здравствуйте, {{name}}!</h1><p>Смотрите новинки на сайте.</p>',
})
const rules = {
  title: [{ required:true, message:'Название обязательно', trigger:'blur' }],
  subject: [{ required:true, message:'Тема обязательна', trigger:'blur' }],
  html: [{ required:true, message:'HTML обязателен', trigger:'blur' }]
}

const tags = ref<string[]>([])
const allTags = ['ru','en','vip']
const subsLoading = ref(false)
const audienceCount = ref<number>(0)
const audienceCountLabel = computed(()=> subsLoading.value ? '…' : audienceCount.value)

const loadSubs = async () => {
  subsLoading.value = true
  try {
    const r:any = await api.subs(tags.value[0]) // просто пример фильтра по первому тегу
    audienceCount.value = (r.data || []).length
  } finally { subsLoading.value = false }
}

const save = async () => {
  const ok = await formRef.value?.validate().catch(()=>false); if (!ok) return
  saving.value = true
  try {
    const r:any = await api.create({ ...form, segment: { tags: tags.value } })
    savedId.value = r?.campaign?.id || null
    ElMessage.success('Отправка письма успешно сохранена')
  } catch { ElMessage.error('Ошибка сохранения') }
  finally { saving.value = false }
}

const send = async () => {
  if (!savedId.value) return
  await api.send(savedId.value)
  ElMessage.success('Отправка смоделирована (метрики появятся через ~секунду)')
  navigateTo(`/admin/newsletters/${savedId.value}`)
}
</script>
