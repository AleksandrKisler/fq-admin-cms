<template>
  <el-dialog
      v-model="open"
      :show-close="false"
      append-to-body
      fullscreen
      class="!p-0"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div class="text-sm tracking-wide text-gray-600">СТАТЬЯ</div>
      <el-button text @click="open = false">Закрыть</el-button>
    </div>

    <!-- Body -->
    <div class="overflow-y-auto">
      <div class="mx-auto max-w-3xl px-6 py-8 sm:py-10 md:py-12">
        <!-- hero -->
        <div class="flex justify-center">
          <div class="h-52 w-52 sm:h-56 sm:w-56 rounded overflow-hidden shadow">
            <img
                v-if="article?.main_image"
                :src="fileUrl(article.main_image)"
                alt=""
                class="h-full w-full object-cover"
            />
            <div v-else class="h-full w-full grid place-items-center text-gray-400 text-xs bg-gray-50">
              ОБЛОЖКА
            </div>
          </div>
        </div>

        <!-- title -->
        <h1
            class="mt-6 text-center text-xl sm:text-2xl font-semibold leading-snug uppercase"
            v-html="renderTitle(article?.title || 'Заголовок статьи')"
        />

        <!-- date -->
        <div class="mt-2 text-center italic text-gray-700">
          {{ formatDateRU(article?.publish_date) }}
        </div>

        <!-- lead / excerpt -->
        <div v-if="article?.excerpt" class="mt-8">
          <p class="mx-auto max-w-2xl text-center italic text-[15px] leading-7 text-gray-800">
            {{ article.excerpt }}
          </p>
        </div>

        <!-- content -->
        <article class="mt-10 readable">
          <!-- безопасно отображаем HTML из редактора -->
          <div v-html="safeHtml(article?.content)"></div>
        </article>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
// v-model:open
const open = defineModel({ type: Boolean, default: false })
// пропсы с данными статьи (можно передавать прямо form из create/edit)
const props = defineProps({
  article: {
    type: Object,
    default: () => ({})
  }
})

// если в вашем проекте есть $fileUrl — используем его; иначе просто вернём путь
const { $fileUrl } = useNuxtApp?.() || {}
const fileUrl = (p) => ($fileUrl ? $fileUrl(p) : p)

// формат даты: "27 февраля"
const formatDateRU = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  } catch { return '' }
}

// поддержка курсива внутри заголовка через [i]...[/i]
const renderTitle = (t) => {
  return String(t).replace(/\[i\](.*?)\[\/i\]/g, '<em class="italic lowercase not-italic font-normal">$1</em>')
}

// очень лёгкая «санитация»: убираем script/iframe/style. Для админ-превью этого обычно достаточно.
// при необходимости замените на DOMPurify.
const safeHtml = (html) => {
  if (!html) return ''
  const disallowed = /<(script|style|iframe)[^>]*>.*?<\/\1>/gis
  return String(html).replace(disallowed, '')
}
</script>

<style scoped>
/* Нужная «читабельная» типографика без tailwind-typography */
.readable :deep(h2){
  @apply mt-8 mb-3 text-lg font-semibold uppercase;
}
.readable :deep(h3){
  @apply mt-6 mb-2 font-semibold;
}
.readable :deep(p){
  @apply my-4 leading-7 text-[15px] text-gray-800;
}
.readable :deep(ul){
  @apply my-4 list-disc pl-5 space-y-1;
}
.readable :deep(ol){
  @apply my-4 list-decimal pl-5 space-y-1;
}
.readable :deep(blockquote){
  @apply my-6 border-l-4 pl-4 italic text-gray-700;
}
.readable :deep(img){
  @apply my-4 rounded-lg overflow-hidden;
  max-height: 480px; object-fit: cover;
}
.readable :deep(a){
  @apply text-blue-600 hover:underline;
}
</style>
