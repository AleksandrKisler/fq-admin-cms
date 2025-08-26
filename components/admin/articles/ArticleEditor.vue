<template>
  <div class="space-y-3">
    <ClientOnly>
      <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 overflow-hidden">
        <QuillEditor
            v-model:content="inner"
            contentType="html"
            theme="snow"
            :toolbar="toolbar"
            class="article-quill"
            @text-change="onChange"
        />
      </div>
      <template #fallback>
        <div class="h-40 grid place-items-center text-gray-400">Загрузка редактора…</div>
      </template>
    </ClientOnly>

    <div v-if="showPreview"
         class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900 p-5">
      <div class="prose dark:prose-invert max-w-none" v-html="inner"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps<{
  modelValue: string
  showPreview?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const inner = ref(props.modelValue || '')

watch(() => props.modelValue, v => {
  if (v !== inner.value) inner.value = v || ''
})

const toolbar = [
  [{header: [1, 2, 3, false]}],
  ['bold', 'italic', 'underline', 'strike', {color: []}, {background: []}],
  [{list: 'ordered'}, {list: 'bullet'}, {align: []}],
  ['blockquote', 'code-block'],
  ['link', 'image', 'clean']
]

const onChange = () => emit('update:modelValue', inner.value)
</script>

<style scoped>
.article-quill :deep(.ql-container) {
  min-height: 440px;
}
</style>
