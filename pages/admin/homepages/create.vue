<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <div class="max-w-3xl space-y-6">
      <h1 class="text-2xl font-semibold">Новая главная</h1>

      <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="200px"
          class="bg-white rounded-2xl shadow p-6"
      >
        <el-form-item label="Название" prop="title">
          <el-input v-model="form.title" placeholder="Напр., Главная по умолчанию"/>
        </el-form-item>

        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" placeholder="home-default"/>
        </el-form-item>

        <el-form-item label="Сделать активной">
          <el-switch v-model="form.is_active"/>
        </el-form-item>

        <el-divider>Баннеры</el-divider>

        <!-- main -->
        <el-form-item label="main" prop="banners.main">
          <el-select
              v-model="form.banners.main"
              filterable
              clearable
              placeholder="Выберите баннер"
              :loading="loadingBanners"
              class="w-full"
          >
            <el-option
                v-for="b in banners"
                :key="b.id"
                :label="b.title"
                :value="b.id"
            >
              <div class="flex items-center gap-3">
                <div class="h-8 w-12 rounded bg-gray-100 overflow-hidden border">
                  <img v-if="b.image_url" :src="b.image_url" class="h-full w-full object-cover"/>
                </div>
                <div class="min-w-0">
                  <div class="truncate">{{ b.title }}</div>
                  <div class="text-xs text-gray-400">ID: {{ b.id }} · {{ b.type }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- slot-1..3 -->
        <el-form-item label="slot-1">
          <el-select v-model="form.banners['slot-1']" filterable clearable placeholder="Выберите баннер"
                     :loading="loadingBanners" class="w-full">
            <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id">
              <div class="flex items-center gap-3">
                <div class="h-8 w-12 rounded bg-gray-100 overflow-hidden border">
                  <img v-if="b.image_url" :src="b.image_url" class="h-full w-full object-cover"/>
                </div>
                <div class="min-w-0">
                  <div class="truncate">{{ b.title }}</div>
                  <div class="text-xs text-gray-400">ID: {{ b.id }} · {{ b.type }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="slot-2">
          <el-select v-model="form.banners['slot-2']" filterable clearable placeholder="Выберите баннер"
                     :loading="loadingBanners" class="w-full">
            <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id">
              <div class="flex items-center gap-3">
                <div class="h-8 w-12 rounded bg-gray-100 overflow-hidden border">
                  <img v-if="b.image_url" :src="b.image_url" class="h-full w-full object-cover"/>
                </div>
                <div class="min-w-0">
                  <div class="truncate">{{ b.title }}</div>
                  <div class="text-xs text-gray-400">ID: {{ b.id }} · {{ b.type }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="slot-3">
          <el-select v-model="form.banners['slot-3']" filterable clearable placeholder="Выберите баннер"
                     :loading="loadingBanners" class="w-full">
            <el-option v-for="b in banners" :key="b.id" :label="b.title" :value="b.id">
              <div class="flex items-center gap-3">
                <div class="h-8 w-12 rounded bg-gray-100 overflow-hidden border">
                  <img v-if="b.image_url" :src="b.image_url" class="h-full w-full object-cover"/>
                </div>
                <div class="min-w-0">
                  <div class="truncate">{{ b.title }}</div>
                  <div class="text-xs text-gray-400">ID: {{ b.id }} · {{ b.type }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider>Подборки</el-divider>

        <el-form-item label="slot-1">
          <el-select v-model="form.selections['slot-1']" filterable clearable placeholder="Выберите подборку"
                     :loading="loadingSelections" class="w-full">
            <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id">
              <div>
                <div class="truncate">{{ s.title }}</div>
                <div class="text-xs text-gray-400">ID: {{ s.id }} · {{ s.slug }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="slot-2">
          <el-select v-model="form.selections['slot-2']" filterable clearable placeholder="Выберите подборку"
                     :loading="loadingSelections" class="w-full">
            <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id">
              <div>
                <div class="truncate">{{ s.title }}</div>
                <div class="text-xs text-gray-400">ID: {{ s.id }} · {{ s.slug }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="slot-3">
          <el-select v-model="form.selections['slot-3']" filterable clearable placeholder="Выберите подборку"
                     :loading="loadingSelections" class="w-full">
            <el-option v-for="s in selections" :key="s.id" :label="s.title" :value="s.id">
              <div>
                <div class="truncate">{{ s.title }}</div>
                <div class="text-xs text-gray-400">ID: {{ s.id }} · {{ s.slug }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
          <NuxtLink to="/admin/homepages">
            <el-button>Отмена</el-button>
          </NuxtLink>
        </el-form-item>
      </el-form>
    </div>

    <!-- RIGHT: Live Preview -->
    <aside class="lg:sticky lg:top-6">
      <div class="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">Предпросмотр</h2>

        <!-- Banners preview -->
        <section class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Баннеры</h3>

          <!-- Main -->
          <div class="relative rounded-xl overflow-hidden border bg-gray-50 h-44">
            <template v-if="pvBanners.main">
              <img :src="pvBanners.main.image_url" class="h-full w-full object-cover"/>
              <div class="absolute bottom-2 left-2 text-white/90 text-xs bg-black/40 px-2 py-1 rounded">
                {{ pvBanners.main.title }}
              </div>
            </template>
            <template v-else>
              <div class="h-full w-full grid place-items-center text-gray-400 text-sm border-2 border-dashed">
                БАННЕР: main
              </div>
            </template>
          </div>

          <!-- 3 slots -->
          <div class="grid grid-cols-3 gap-3">
            <div v-for="slot in ['slot-1','slot-2','slot-3']" :key="slot"
                 class="relative rounded-lg overflow-hidden border bg-gray-50 h-28">
              <template v-if="pvBanners[slot]">
                <img :src="pvBanners[slot].image_url" class="h-full w-full object-cover"/>
                <div class="absolute bottom-1 left-1 text-white/90 text-[10px] bg-black/40 px-1.5 py-0.5 rounded">
                  {{ pvBanners[slot].title }}
                </div>
              </template>
              <template v-else>
                <div class="h-full w-full grid place-items-center text-gray-400 text-xs border-2 border-dashed">
                  {{ slot }}
                </div>
              </template>
            </div>
          </div>
        </section>

        <!-- Selections preview -->
        <section class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Подборки</h3>
          <div class="space-y-2">
            <div
                v-for="slot in ['slot-1','slot-2','slot-3']"
                :key="slot"
                class="rounded-lg border p-3"
                :class="pvSelections[slot] ? 'bg-white' : 'bg-gray-50 border-dashed'"
            >
              <template v-if="pvSelections[slot]">
                <div class="font-medium text-gray-900 truncate">{{ pvSelections[slot].title }}</div>
                <div class="text-xs text-gray-500">Slug: {{ pvSelections[slot].slug }} · ID: {{
                    pvSelections[slot].id
                  }}
                </div>
              </template>
              <template v-else>
                <div class="text-gray-400 text-sm">ПОДБОРКА: {{ slot }}</div>
              </template>
            </div>
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'});
import type {FormInstance, FormRules} from 'element-plus'

type TBanner = { id: number; title: string; image_url?: string; type?: string }
type TSelection = { id: number; title: string; slug: string; is_active?: boolean }

const {$api} = useNuxtApp();

const formRef = ref<FormInstance>();
const saving = ref(false);

const form = reactive({
  title: 'Главная по умолчанию',
  slug: 'home-default',
  is_active: true,
  banners: {
    main: null as number | null,
    'slot-1': null as number | null,
    'slot-2': null as number | null,
    'slot-3': null as number | null
  },
  selections: {'slot-1': null as number | null, 'slot-2': null as number | null, 'slot-3': null as number | null}
});

const rules: FormRules = {
  title: [{required: true, message: 'Название обязательно', trigger: 'blur'}],
  slug: [{required: true, message: 'Slug обязателен', trigger: 'blur'}],
  'banners.main': [{required: true, message: 'Выберите баннер (main)', trigger: 'change'}]
};

const banners = ref<TBanner[]>([]);
const selections = ref<TSelection[]>([]);
const loadingBanners = ref(true);
const loadingSelections = ref(true);

const fetchLists = async () => {
  try {
    loadingBanners.value = true;
    const br: any = await $api('/banners', {query: {limit: 500}});
    banners.value = br.data || [];
  } catch {
    ElMessage.error('Не удалось загрузить баннеры');
  } finally {
    loadingBanners.value = false;
  }

  try {
    loadingSelections.value = true;
    const sr: any = await $api('/selections', {query: {limit: 500}});
    selections.value = sr.data || [];
  } catch {
    ElMessage.error('Не удалось загрузить подборки');
  } finally {
    loadingSelections.value = false;
  }
};
onMounted(fetchLists);

const findBanner = (id?: number | null) => (id ? banners.value.find(b => b.id === id) || null : null);
const findSelection = (id?: number | null) => (id ? selections.value.find(s => s.id === id) || null : null);

const pvBanners = computed(() => ({
  main: findBanner(form.banners.main),
  'slot-1': findBanner(form.banners['slot-1']),
  'slot-2': findBanner(form.banners['slot-2']),
  'slot-3': findBanner(form.banners['slot-3'])
}));

const pvSelections = computed(() => ({
  'slot-1': findSelection(form.selections['slot-1']),
  'slot-2': findSelection(form.selections['slot-2']),
  'slot-3': findSelection(form.selections['slot-3'])
}));

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  saving.value = true;
  try {
    await $api('/homepages', {method: 'POST', body: form});
    ElMessage.success('Создано');
    navigateTo('/admin/homepages');
  } catch {
    ElMessage.error('Ошибка сохранения');
  } finally {
    saving.value = false;
  }
};
</script>
