<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <div class="max-w-3xl space-y-6">
      <h1 class="text-2xl font-semibold">Новый баннер</h1>

      <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="180px"
          status-icon
          class="bg-white rounded-2xl shadow p-6"
      >
        <el-form-item label="Тип" prop="type">
          <el-select v-model="form.type" placeholder="Выберите тип">
            <el-option label="MAIN" value="MAIN"/>
            <el-option label="INFORMATION" value="INFORMATION"/>
            <el-option label="COLLECTION" value="COLLECTION"/>
            <el-option label="PRODUCT" value="PRODUCT"/>
          </el-select>
        </el-form-item>

        <el-form-item label="Заголовок" prop="title">
          <el-input v-model="form.title" placeholder="Напр., Новая коллекция"/>
        </el-form-item>

        <el-form-item label="Описание" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Короткий описательный текст"/>
        </el-form-item>

        <el-form-item label="Позиция картинки" prop="image_position">
          <el-select v-model="form.image_position">
            <el-option label="DEFAULT" value="DEFAULT"/>
            <el-option label="LEFT" value="LEFT"/>
            <el-option label="RIGHT" value="RIGHT"/>
          </el-select>
        </el-form-item>

        <el-form-item label="Источник (опц.)">
          <el-input v-model="form.source_id" placeholder="например: selection:best-sellers"/>
        </el-form-item>

        <!-- Upload + URL -->
        <el-form-item label="Изображение" prop="image_url">
          <div class="w-full space-y-3">
            <el-upload
                drag
                :show-file-list="false"
                accept="image/*"
                :limit="1"
                :before-upload="handleBeforeUpload"
                :http-request="handleFileUpload"
                class="w-full"
            >
              <div class="el-upload__text">
                Перетащите файл сюда или <em>нажмите для выбора</em>
              </div>
              <template #tip>
                <div class="text-xs text-gray-500 mt-2">Допустимо: JPG/PNG/WebP, до 5 МБ.</div>
              </template>
            </el-upload>

            <div class="flex items-center gap-2">
              <el-input v-model="form.image_url" placeholder="/images/hero.jpg или https://..."/>
              <el-button v-if="previewUrl" @click="clearImage" type="warning" plain>Очистить</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Активен">
          <el-switch v-model="form.is_active"/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="submit">Сохранить</el-button>
          <NuxtLink to="/admin/banners">
            <el-button>Отмена</el-button>
          </NuxtLink>
        </el-form-item>
      </el-form>
    </div>

    <aside class="lg:sticky lg:top-6">
      <div class="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 class="text-lg font-semibold text-gray-900">Предпросмотр</h2>

        <div v-if="isMain" class="relative rounded-2xl overflow-hidden border bg-gray-50"
             :style="{ height: previewHeight }">
          <template v-if="previewUrl">
            <img :src="previewUrl" class="absolute inset-0 w-full h-full object-cover"/>
          </template>
          <template v-else>
            <div class="absolute inset-0 grid place-items-center text-gray-400 text-sm border-2 border-dashed">
              Загрузите изображение или укажите URL
            </div>
          </template>

          <div class="absolute inset-0 grid place-items-center">
            <div class="text-center px-6">
              <div class="uppercase tracking-wide text-[14px] text-white font-medium mb-4 drop-shadow">
                {{ form.title || 'SET YOUR GOALS HIGH' }}
              </div>
              <p class="text-[13px] text-white/90 leading-relaxed italic max-w-2xl mx-auto mb-5 drop-shadow">
                {{ form.description || 'ВСЁ, ЧТО НУЖНО ЖЕНЩИНЕ, чтобы покорить мир, ЭТО УЛЫБКА И туфли.' }}
              </p>
              <div class="uppercase tracking-wide text-[13px] text-white font-semibold drop-shadow">
                FOREVER QUEEN
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isSplit" class="w-full rounded-2xl overflow-hidden border">
          <div class="grid grid-cols-2 min-h-[320px]">
            <div :class="imgFirst ? 'order-1' : 'order-2'" class="relative">
              <template v-if="previewUrl">
                <img :src="previewUrl" class="absolute inset-0 w-full h-full object-cover"/>
              </template>
              <template v-else>
                <div class="absolute inset-0 grid place-items-center text-gray-400 text-sm border-2 border-dashed">
                  Фото ({{ imgFirst ? 'лево' : 'право' }})
                </div>
              </template>
            </div>
            <div :class="imgFirst ? 'order-2' : 'order-1'" class="relative bg-white">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="px-8 text-center max-w-md">
                  <div class="uppercase tracking-wide text-[13px] text-gray-900 font-medium mb-5">
                    {{ form.title || 'SET YOUR GOALS HIGH' }}
                  </div>
                  <p class="text-[12px] text-gray-600 leading-relaxed italic mb-5">
                    {{ form.description || 'ВСЁ, ЧТО НУЖНО ЖЕНЩИНЕ, чтобы покорить мир, ЭТО УЛЫБКА И туфли.' }}
                  </p>
                  <div v-if="showCTA" class="mb-5">
                    <NuxtLink :to="ctaHref">
                      <el-button type="primary" plain size="small">{{ ctaLabel }}</el-button>
                    </NuxtLink>
                  </div>
                  <div class="uppercase tracking-wide text-[13px] text-gray-900 font-semibold">FOREVER QUEEN</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="relative rounded-2xl overflow-hidden border bg-gray-50" style="height: 320px;">
          <template v-if="previewUrl">
            <img :src="previewUrl" class="h-full w-full object-cover" alt="preview"/>
          </template>
          <template v-else>
            <div class="h-full w-full grid place-items-center text-gray-400 text-sm border-2 border-dashed">
              Загрузите изображение или укажите URL
            </div>
          </template>
          <div class="absolute inset-y-0 flex p-6" :class="overlayAlign">
            <div class="max-w-md space-y-2 text-white">
              <div class="uppercase tracking-wide text-[13px] font-medium opacity-90">
                {{ form.title || 'SET YOUR GOALS HIGH' }}
              </div>
              <p class="text-[12px] opacity-90 italic">
                {{ form.description || 'ВСЁ, ЧТО НУЖНО ЖЕНЩИНЕ, чтобы покорить мир, ЭТО УЛЫБКА И туфли.' }}
              </p>
              <div v-if="showCTA">
                <NuxtLink :to="ctaHref">
                  <el-button type="primary" plain size="small">{{ ctaLabel }}</el-button>
                </NuxtLink>
              </div>
              <div class="uppercase tracking-wide text-[13px] font-semibold opacity-95">FOREVER QUEEN</div>
            </div>
          </div>
        </div>

        <div class="text-xs text-gray-500">
          Рекомендованные размеры:
          <span v-if="isMain">~1600×750 (герой, 1.5×)</span>
          <span v-else-if="isSplit">~1600×900 (1:1 по ширине половин)</span>
          <span v-else>~1400×500</span>.
        </div>
      </div>
    </aside>


  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'});
import type {FormInstance, FormRules} from 'element-plus'
import {isValidImageUrl} from '~/utils/validators'

const BASE_H = 320;
const isMain = computed(() => form.type === 'MAIN');
const previewHeight = computed(() => isMain.value ? `${Math.round(BASE_H * 1.5)}px` : `${BASE_H}px`);

const {$api} = useNuxtApp();

const formRef = ref<FormInstance>();
const saving = ref(false);
const tempPreviewUrl = ref<string>(''); // blob URL для мгновенного превью

const form = reactive({
  type: 'INFORMATION',
  title: '',
  description: '',
  source_id: '',
  image_position: 'DEFAULT',
  image_url: '',
  is_active: true
});

const rules: FormRules = {
  type: [{required: true, message: 'Тип обязателен', trigger: 'change'}],
  title: [{required: true, message: 'Заголовок обязателен', trigger: 'blur'}],
  description: [{required: true, message: 'Описание обязательно', trigger: 'blur'}],
  image_position: [{required: true, message: 'Укажите позицию', trigger: 'change'}],
  image_url: [{
    validator: (_r, v, cb) => {
      if (tempPreviewUrl.value) return cb(); // файл выбран — ок
      if (isValidImageUrl(v)) return cb();   // полный URL либо /images/...
      cb(new Error('Укажите корректный URL или загрузите файл'));
    },
    trigger: ['change', 'blur']
  }]
};

const previewUrl = computed(() => tempPreviewUrl.value || form.image_url || '');

const overlayAlign = computed(() => {
  if (form.image_position === 'RIGHT') return 'items-center justify-end text-right';
  if (form.image_position === 'LEFT') return 'items-center justify-start text-left';
  return 'items-center justify-start text-left';
});

const isSplit = computed(() => ['LEFT', 'RIGHT'].includes(form.image_position as string));
const imgFirst = computed(() => form.image_position === 'LEFT');

const showCTA = computed(() => ['COLLECTION', 'PRODUCT'].includes(form.type as string));
const ctaLabel = computed(() => {
  if (form.type === 'PRODUCT') return 'К товару';
  if (form.type === 'COLLECTION') return 'В коллекцию';
  return 'Перейти';
});

const ctaHref = computed(() => {
  const src = String(form.source_id || '').trim();
  if (!src) return '#';
  const [kind, value] = src.split(':');
  if (!value) return '#';
  switch ((kind || '').toLowerCase()) {
    case 'product':
      return `/product/${value}`;
    case 'collection':
      return `/collections/${value}`;
    case 'selection':
      return `/selections/${value}`;
    default:
      return '#';
  }
});


const clearImage = () => {
  tempPreviewUrl.value = '';
  form.image_url = '';
};

// ——— Upload ———
const handleBeforeUpload = (file: File) => {
  const okType = /image\/(jpeg|png|webp)/i.test(file.type);
  const okSize = file.size / 1024 / 1024 <= 5;
  if (!okType) ElMessage.error('Поддерживаются JPG/PNG/WebP');
  if (!okSize) ElMessage.error('Размер файла не должен превышать 5 МБ');
  return okType && okSize;
};

const handleFileUpload = async (opts: any) => {
  const {file, onSuccess, onError} = opts;
  try {
    if (process.client) tempPreviewUrl.value = URL.createObjectURL(file as File);

    const fd = new FormData();
    fd.append('file', file as File); // 👈 имя поля — 'file'

    const resp: any = await $api('/uploads/images', {method: 'POST', body: fd});

    form.image_url = resp?.file_url || resp?.file_path || form.image_url;

    onSuccess?.(resp);
    ElMessage.success('Файл загружен');
  } catch (e) {
    onError?.(e);
    ElMessage.error('Ошибка загрузки файла');
    tempPreviewUrl.value = '';
  }
};

const submit = async () => {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  saving.value = true;
  try {
    await $api('/banners', {method: 'POST', body: form});
    ElMessage.success('Создано');
    navigateTo('/admin/banners');
  } catch {
    ElMessage.error('Ошибка сохранения');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
