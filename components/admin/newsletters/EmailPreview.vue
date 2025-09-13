<template>
  <div class="rounded-2xl overflow-hidden border bg-white">
    <div class="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        <div class="font-medium">{{ subject || 'Без темы' }}</div>
        <div class="text-xs text-gray-400">{{ preheader || 'Предзаголовок…' }}</div>
      </div>
      <div class="text-xs text-gray-400">
        {{ from_name || 'Forever Queen' }} &lt;{{ from_email || 'hello@foreverqueen.ru' }}&gt;
      </div>
    </div>
    <div class="p-0">
      <iframe ref="frame" class="w-full" :style="{ height }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  subject?: string; preheader?: string; html?: string;
  from_name?: string; from_email?: string;
}>()

const height = ref('520px')
const frame = ref<HTMLIFrameElement>()

const render = () => {
  if (!frame.value) return;
  const doc = frame.value.contentDocument!;
  const css = `body{font-family:ui-sans-serif,system-ui,-apple-system;line-height:1.5;padding:16px}
    a{color:#2563eb} h1,h2,h3{margin:0 0 12px} p{margin:0 0 12px}`;
  const html = `
<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body>
  ${ (props.html || '<p>Пустое письмо</p>').replace(/{{\s*name\s*}}/g, '<em style="font-style:italic;">Имя</em>') }
</body></html>`;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    const h = doc.documentElement.scrollHeight || doc.body.scrollHeight || 520;
    height.value = Math.min(Math.max(h, 320), 1200) + 'px';
  }, 0);
}
watch(() => [props.subject, props.preheader, props.html], render, { immediate: true })
onMounted(render)
</script>
