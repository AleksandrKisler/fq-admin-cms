<template>
  <div class="space-y-6">
    <AdminPageHeader :title="pageTitle" subtitle="Редактируйте баннеры и подборки этой главной.">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-button @click="openCopyDialog" :loading="copy.loading">Скопировать из…</el-button>

          <el-popconfirm title="Очистить все слоты?" @confirm="clearAll">
            <template #reference>
              <el-button type="warning" plain>Очистить все</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm title="Удалить эту главную?" @confirm="removePage">
            <template #reference>
              <el-button type="danger" plain>Удалить</el-button>
            </template>
          </el-popconfirm>

          <NuxtLink to="/admin/homepages"><el-button>Назад</el-button></NuxtLink>
        </div>
      </template>
    </AdminPageHeader>

    <!-- skeleton while loading -->
    <el-skeleton v-if="loading.page" :rows="8" animated />

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Левая колонка -->
        <div class="lg:col-span-8">
          <div class="grid grid-cols-12 gap-6">
            <!-- Навигация -->
            <aside class="col-span-3 hidden xl:block">
              <div class="sticky top-20">
                <AdminAnchorNav :items="navItems" :offset="72" />
              </div>
            </aside>

            <!-- Форма -->
            <div class="col-span-12 xl:col-span-9 space-y-6">
              <!-- Основное -->
              <section id="sec-main">
                <AdminFormSection title="Основное">
                  <el-form
                      ref="formRef"
                      :model="form"
                      :rules="rules"
                      label-position="top"
                      class="grid grid-cols-1 gap-4"
                  >
                    <el-form-item label="Название" prop="title">
                      <el-input v-model="form.title" @input="autoSlug" />
                    </el-form-item>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <el-form-item label="Slug" prop="slug">
                        <el-input v-model="form.slug" placeholder="home-default" />
                      </el-form-item>

                      <el-form-item label="Активна">
                        <el-switch v-model="form.is_active" />
                      </el-form-item>
                    </div>
                  </el-form>
                </AdminFormSection>
              </section>

              <!-- Конструктор -->
              <section id="sec-builder">
                <AdminFormSection
                    title="Конструктор блоков"
                    description="Блоки расположены строго в порядке вывода. Выбирайте, заменяйте или удаляйте элементы."
                >
                  <div class="space-y-6">
                    <!-- 1 -->
                    <section id="blk-main">
                      <BlockEditorRow
                          label="Баннер: main"
                          kind="banner"
                          v-model="form.banners.main"
                          :items="banners"
                          :loading="loading.banners"
                          placeholder="Баннер: main"
                          :double="true"
                      />
                    </section>

                    <!-- 2 -->
                    <section id="blk-sel-1">
                      <BlockEditorRow
                          label="Подборка: slot-1"
                          kind="selection"
                          v-model="form.selections['slot-1']"
                          :items="selections"
                          :loading="loading.selections"
                          placeholder="Подборка: slot-1"
                      />
                    </section>

                    <!-- 3 -->
                    <section id="blk-ban-1">
                      <BlockEditorRow
                          label="Баннер: slot-1"
                          kind="banner"
                          v-model="form.banners['slot-1']"
                          :items="banners"
                          :loading="loading.banners"
                          placeholder="Баннер: slot-1"
                      />
                    </section>

                    <!-- 4 -->
                    <section id="blk-sel-2">
                      <BlockEditorRow
                          label="Подборка: slot-2"
                          kind="selection"
                          v-model="form.selections['slot-2']"
                          :items="selections"
                          :loading="loading.selections"
                          placeholder="Подборка: slot-2"
                      />
                    </section>

                    <!-- 5 -->
                    <section id="blk-ban-2">
                      <BlockEditorRow
                          label="Баннер: slot-2"
                          kind="banner"
                          v-model="form.banners['slot-2']"
                          :items="banners"
                          :loading="loading.banners"
                          placeholder="Баннер: slot-2"
                      />
                    </section>

                    <!-- 6 -->
                    <section id="blk-ban-3">
                      <BlockEditorRow
                          label="Баннер: slot-3"
                          kind="banner"
                          v-model="form.banners['slot-3']"
                          :items="banners"
                          :loading="loading.banners"
                          placeholder="Баннер: slot-3"
                      />
                    </section>

                    <!-- 7 -->
                    <section id="blk-sel-3">
                      <BlockEditorRow
                          label="Подборка: slot-3"
                          kind="selection"
                          v-model="form.selections['slot-3']"
                          :items="selections"
                          :loading="loading.selections"
                          placeholder="Подборка: slot-3"
                      />
                    </section>
                  </div>
                </AdminFormSection>
              </section>
            </div>
          </div>
        </div>

        <!-- Правая колонка -->
        <div class="lg:col-span-4 space-y-6">
          <AdminFormSection title="Информация">
            <div class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div><b>ID:</b> {{ page?.id }}</div>
              <div><b>Slug:</b> /{{ form.slug }}</div>
              <div v-if="page?.updated_at"><b>Обновлено:</b> {{ formatDate(page.updated_at) }}</div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Быстрые действия">
            <div class="flex flex-col gap-2">
              <el-button :disabled="!dirty" type="primary" @click="submit" :loading="saving">Сохранить изменения</el-button>
              <el-button @click="resetToLoaded" :disabled="!dirty">Отменить изменения</el-button>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Подсказки">
            <ul class="text-sm leading-6 text-gray-600 dark:text-gray-300 list-disc pl-5">
              <li><b>main</b> — в 2 раза выше остальных.</li>
              <li>Пустой слот показывает плейсхолдер.</li>
              <li>Можно быстро копировать блоки из другой главной.</li>
            </ul>
          </AdminFormSection>
        </div>
      </div>

      <AdminStickyActions>
        <template #meta>
          Редактирование главной
          <span v-if="dirty" class="text-orange-500"> • есть несохранённые изменения</span>
        </template>
        <NuxtLink to="/admin/homepages"><el-button>Назад</el-button></NuxtLink>
        <el-button type="primary" :loading="saving" :disabled="!dirty" @click="submit">Сохранить</el-button>
      </AdminStickyActions>

      <!-- Диалог «Скопировать из…» -->
      <el-dialog v-model="copy.open" title="Скопировать блоки из главной" width="720px">
        <div class="space-y-3">
          <el-select v-model="copy.selectedId" class="w-full" filterable placeholder="Выберите главную" :loading="copy.loading">
            <el-option
                v-for="hp in copy.list"
                :key="hp.id"
                :label="`${hp.title} (${hp.slug})`"
                :value="hp.id"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate">{{ hp.title }}</span>
                <span class="text-xs text-gray-400">/{{ hp.slug }}</span>
              </div>
            </el-option>
          </el-select>

          <el-alert
              v-if="copy.selectedId"
              type="info"
              :closable="false"
              show-icon
              title="Будут перенесены: banners.main, banners.slot-1..3, selections.slot-1..3"
          />
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <el-button @click="copy.open=false">Отмена</el-button>
            <el-button type="primary" :disabled="!copy.selectedId" @click="applyCopy">Копировать</el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import AdminAnchorNav from '~/components/admin/ui/AdminAnchorNav.vue'
import BlockEditorRow from '~/components/admin/homepages/BlockEditorRow.vue'
import { isValidSlug } from '~/utils/validators'

definePageMeta({ layout: 'admin' })
const { $api } = useNuxtApp()
const route = useRoute()

/* ---------- состояние ---------- */
const formRef = ref<FormInstance>()
const loading = reactive({ page: true, banners: false, selections: false })
const saving = ref(false)

const banners = ref<any[]>([])
const selections = ref<any[]>([])

const page = ref<any>(null)

/** форма */
const form = reactive({
  title: '',
  slug: '',
  is_active: true,
  banners: { main: null as number|null, 'slot-1': null as number|null, 'slot-2': null as number|null, 'slot-3': null as number|null },
  selections: { 'slot-1': null as number|null, 'slot-2': null as number|null, 'slot-3': null as number|null }
})

/** валидация */
const rules: FormRules = {
  title: [{ required: true, message: 'Название обязательно', trigger: 'blur' }],
  slug: [
    { required: true, message: 'Slug обязателен', trigger: 'blur' },
    { validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger: 'blur' }
  ]
}
const slugify = (s: string) =>
    s.toLowerCase().trim()
        .replace(/[^\p{L}\p{N}\s-]+/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
const autoSlug = () => { if (!form.slug) form.slug = slugify(form.title) }

/** навигация */
const navItems = computed(() => [
  { id: 'sec-main', label: 'Основное' },
  {
    id: 'sec-builder',
    label: 'Конструктор',
    children: [
      { id: 'blk-main',  label: 'Главный Баннер' },
      { id: 'blk-sel-1', label: 'Подборка 1' },
      { id: 'blk-ban-1', label: 'Баннер 1' },
      { id: 'blk-sel-2', label: 'Подборка 2' },
      { id: 'blk-ban-2', label: 'Баннер 2' },
      { id: 'blk-ban-3', label: 'Баннер 3' },
      { id: 'blk-sel-3', label: 'Подборка 3' },
    ],
  },
])

/* ---------- загрузка ---------- */
const idOrSlug = computed(() => route.params.id as string)

const loadPage = async () => {
  loading.page = true
  try {
    // ожидаем, что API возвращает { homepage } или { data }
    const r:any = await $api(`/homepages/${idOrSlug.value}`)
    const hp = r.homepage || r.page || r

    page.value = hp
    form.title = hp.title
    form.slug = hp.slug
    form.is_active = !!hp.is_active
    form.banners.main = hp.banners?.main?.id ?? null
    form.banners['slot-1'] = hp.banners?.['slot-1']?.id ?? null
    form.banners['slot-2'] = hp.banners?.['slot-2']?.id ?? null
    form.banners['slot-3'] = hp.banners?.['slot-3']?.id ?? null
    form.selections['slot-1'] = hp.selections?.['slot-1']?.id ?? null
    form.selections['slot-2'] = hp.selections?.['slot-2']?.id ?? null
    form.selections['slot-3'] = hp.selections?.['slot-3']?.id ?? null

    snapshot.value = makeSnapshot()
  } catch {
    ElMessage.error('Главная не найдена')
    navigateTo('/admin/homepages')
  } finally {
    loading.page = false
  }
}

const loadRefs = async () => {
  try { loading.banners = true; const r:any = await $api('/banners', { query:{ limit: 1000 } }); banners.value = r.data || r.items || r || [] }
  finally { loading.banners = false }
  try { loading.selections = true; const r:any = await $api('/selections', { query:{ limit: 1000 } }); selections.value = r.data || r.items || r || [] }
  finally { loading.selections = false }
}

onMounted(async () => {
  await Promise.all([loadPage(), loadRefs()])
})

/* ---------- dirty-check ---------- */
const snapshot = ref('')
const makeSnapshot = () => JSON.stringify(form)
const dirty = computed(() => snapshot.value !== makeSnapshot())
const resetToLoaded = () => {
  if (!page.value) return
  loadPage()
}

/* ---------- действия ---------- */
const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    await $api(`/homepages/${idOrSlug.value}`, { method:'PUT', body: form })
    snapshot.value = makeSnapshot()
    ElMessage.success('Сохранено')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

const removePage = async () => {
  try {
    await $api(`/homepages/${idOrSlug.value}`, { method:'DELETE' })
    ElMessage.success('Главная удалена')
    navigateTo('/admin/homepages')
  } catch {
    ElMessage.error('Ошибка удаления')
  }
}

const clearAll = () => {
  form.banners.main = null
  form.banners['slot-1'] = null
  form.banners['slot-2'] = null
  form.banners['slot-3'] = null
  form.selections['slot-1'] = null
  form.selections['slot-2'] = null
  form.selections['slot-3'] = null
  ElMessage.success('Все слоты очищены')
}

/* --- копирование --- */
const copy = reactive({
  open: false,
  loading: false,
  list: [] as any[],
  selectedId: null as number | null
})

const openCopyDialog = async () => {
  copy.open = true
  if (copy.list.length) return
  try {
    copy.loading = true
    const r:any = await $api('/homepages', { query:{ limit: 1000 } })
    copy.list = r.data || r.items || r || []
  } catch {
    ElMessage.error('Не удалось загрузить список главных')
  } finally {
    copy.loading = false
  }
}

const applyCopy = () => {
  const hp:any = copy.list.find(h => String(h.id) === String(copy.selectedId))
  if (!hp) return
  const srcB = hp.banners || {}
  const srcS = hp.selections || {}
  form.banners.main      = srcB.main    ?? null
  form.banners['slot-1'] = srcB['slot-1'] ?? null
  form.banners['slot-2'] = srcB['slot-2'] ?? null
  form.banners['slot-3'] = srcB['slot-3'] ?? null
  form.selections['slot-1'] = srcS['slot-1'] ?? null
  form.selections['slot-2'] = srcS['slot-2'] ?? null
  form.selections['slot-3'] = srcS['slot-3'] ?? null
  copy.open = false
  ElMessage.success('Блоки скопированы')
}

/* ---------- утилиты ---------- */
const pageTitle = computed(() => form.title ? `Редактирование: ${form.title}` : 'Редактирование главной')
const formatDate = (v:string) => {
  try { return new Intl.DateTimeFormat('ru-RU', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v)) }
  catch { return '—' }
}
</script>
