<template>
  <div class="space-y-6">
    <AdminPageHeader title="Новая главная" subtitle="Соберите страницу из баннеров и подборок.">
      <template #actions>
        <NuxtLink to="/admin/homepages">
          <el-button>Назад</el-button>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- FORM + STICKY NAV -->
      <div class="lg:col-span-7">
        <div class="grid grid-cols-12 gap-6">
          <!-- sticky оглавление -->
          <aside class="col-span-3 hidden xl:block">
            <nav
                class="sticky top-20 space-y-1 p-3 rounded-xl border bg-white dark:bg-neutral-900 border-gray-100 dark:border-white/10">
              <div class="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Навигация</div>
              <button
                  v-for="item in formNav"
                  :key="item.id"
                  @click="scrollTo(item.id)"
                  class="w-full text-left px-3 py-2 rounded-lg transition"
                  :class="activeSection===item.id
                    ? 'bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'"
              >
                {{ item.label }}
              </button>
            </nav>
          </aside>

          <!-- сама форма -->
          <div class="col-span-12 xl:col-span-9 space-y-6">
            <section :id="SEC_MAIN" ref="secMain">
              <AdminFormSection title="Основное">
                <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid grid-cols-1 gap-4">
                  <el-form-item label="Название" prop="title">
                    <el-input v-model="form.title" @input="autoSlug"/>
                  </el-form-item>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <el-form-item label="Slug" prop="slug">
                      <el-input v-model="form.slug" placeholder="home-default"/>
                    </el-form-item>
                    <el-form-item label="Активна">
                      <el-switch v-model="form.is_active"/>
                    </el-form-item>
                  </div>
                </el-form>
              </AdminFormSection>
            </section>

            <section :id="SEC_BANNERS" ref="secBanners">
              <AdminFormSection title="Баннеры" description="Выберите баннеры для слотов.">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <el-form-item label="main">
                    <el-select v-model="form.banners.main" filterable clearable :loading="loading.banners">
                      <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="slot-1">
                    <el-select v-model="form.banners['slot-1']" filterable clearable :loading="loading.banners">
                      <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="slot-2">
                    <el-select v-model="form.banners['slot-2']" filterable clearable :loading="loading.banners">
                      <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="slot-3">
                    <el-select v-model="form.banners['slot-3']" filterable clearable :loading="loading.banners">
                      <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id"/>
                    </el-select>
                  </el-form-item>
                </div>
              </AdminFormSection>
            </section>

            <section :id="SEC_SELECTIONS" ref="secSelections">
              <AdminFormSection title="Подборки">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <el-form-item label="slot-1">
                    <el-select v-model="form.selections['slot-1']" filterable clearable :loading="loading.selections">
                      <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="slot-2">
                    <el-select v-model="form.selections['slot-2']" filterable clearable :loading="loading.selections">
                      <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="slot-3">
                    <el-select v-model="form.selections['slot-3']" filterable clearable :loading="loading.selections">
                      <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id"/>
                    </el-select>
                  </el-form-item>
                </div>
              </AdminFormSection>
            </section>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5">
        <AdminFormSection title="Предпросмотр" description="Слоты показаны в порядке реального отображения.">
          <div class="space-y-5">
            <PreviewRow
                v-for="blk in previewOrder" :key="blk.key"
                :label="blk.label"
                :kind="blk.kind"
                :double="blk.double"
                :title="getTitle(blk)"
                :emptyText="blk.empty"
            />
          </div>
        </AdminFormSection>
      </div>
    </div>

    <AdminStickyActions>
      <template #meta>Создание главной</template>
      <el-button @click="cancel">Отмена</el-button>
      <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
    </AdminStickyActions>
  </div>
</template>

<script setup lang="ts">
import PreviewRow from '~/components/admin/homepages/PreviewRow.vue'
import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import AdminFormSection from '~/components/admin/ui/AdminFormSection.vue'
import AdminStickyActions from '~/components/admin/ui/AdminStickyActions.vue'
import type {FormInstance, FormRules} from 'element-plus'
import {isValidSlug} from '~/utils/validators'

definePageMeta({layout: 'admin'})
const {$api} = useNuxtApp()

const formRef = ref<FormInstance>()
const saving = ref(false)
const loading = reactive({banners: false, selections: false})
const banners = ref<any[]>([])
const selections = ref<any[]>([])

const form = reactive({
  title: 'Главная по умолчанию',
  slug: 'home-default',
  is_active: true,
  banners: {main: null as any, 'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any},
  selections: {'slot-1': null as any, 'slot-2': null as any, 'slot-3': null as any}
})

const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  slug: [
    {required: true, message: 'Slug обязателен', trigger: 'blur'},
    {validator: (_r, v, cb) => isValidSlug(v) ? cb() : cb(new Error('Неверный формат slug')), trigger: 'blur'}
  ]
}
const slugify = (s: string) =>
    s.toLowerCase().trim()
        .replace(/[^\p{L}\p{N}\s-]+/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
const autoSlug = () => {
  if (!form.slug) form.slug = slugify(form.title)
}

const SEC_MAIN = 'sec-main'
const SEC_BANNERS = 'sec-banners'
const SEC_SELECTIONS = 'sec-selections'
const formNav = [
  {id: SEC_MAIN, label: 'Основное'},
  {id: SEC_BANNERS, label: 'Баннеры'},
  {id: SEC_SELECTIONS, label: 'Подборки'}
]
const activeSection = ref<string>(SEC_MAIN)
const secMain = ref<HTMLElement | null>(null)
const secBanners = ref<HTMLElement | null>(null)
const secSelections = ref<HTMLElement | null>(null)

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 72 // высота липкой шапки
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({top, behavior: 'smooth'})
}

onMounted(() => {
  // подсветка активного раздела
  const io = new IntersectionObserver((entries) => {
        // выбираем самую видимую секцию
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) activeSection.value = visible.target.id
      }, {rootMargin: '-80px 0px -60% 0px', threshold: [0.1, 0.25, 0.5, 0.75]})
  ;[secMain.value, secBanners.value, secSelections.value].forEach(el => el && io.observe(el))
})

onMounted(async () => {
  try {
    loading.banners = true;
    const r: any = await $api('/banners', {query: {limit: 1000}});
    banners.value = r.data || r.items || r || []
  } finally {
    loading.banners = false
  }
  try {
    loading.selections = true;
    const r: any = await $api('/selections', {query: {limit: 1000}});
    selections.value = r.data || r.items || r || []
  } finally {
    loading.selections = false
  }
})

/* ----------------- предпросмотр: порядок и заголовки ----------------- */
const previewOrder = computed(() => ([
  {key: 'b-main', label: 'Баннер: main', kind: 'banner', slot: 'main', empty: 'Баннер: main', double: true},
  {key: 's-1', label: 'Подборка: slot-1', kind: 'selection', slot: 'slot-1', empty: 'Подборка: slot-1'},
  {key: 'b-1', label: 'Баннер: slot-1', kind: 'banner', slot: 'slot-1', empty: 'Баннер: slot-1'},
  {key: 's-2', label: 'Подборка: slot-2', kind: 'selection', slot: 'slot-2', empty: 'Подборка: slot-2'},
  {key: 'b-2', label: 'Баннер: slot-2', kind: 'banner', slot: 'slot-2', empty: 'Баннер: slot-2'},
  {key: 'b-3', label: 'Баннер: slot-3', kind: 'banner', slot: 'slot-3', empty: 'Баннер: slot-3'},
  {key: 's-3', label: 'Подборка: slot-3', kind: 'selection', slot: 'slot-3', empty: 'Подборка: slot-3'},
]))
const bannerTitle = (id?: number | string) => banners.value.find(b => String(b.id) === String(id))?.title
const selectionTitle = (id?: number | string) => selections.value.find(s => String(s.id) === String(id))?.title
const getTitle = (blk: any) => blk.kind === 'banner'
    ? bannerTitle((form.banners as any)[blk.slot])
    : selectionTitle((form.selections as any)[blk.slot])

/* ----------------- сохранение ----------------- */
const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    await $api('/homepages', {method: 'POST', body: form})
    ElMessage.success('Создано');
    navigateTo('/admin/homepages')
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
const cancel = () => navigateTo('/admin/homepages')
</script>
