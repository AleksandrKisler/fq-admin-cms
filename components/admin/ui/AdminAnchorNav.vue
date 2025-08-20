<template>
  <div class="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-4">
    <div class="px-1 pb-2 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
      Навигация
    </div>

    <nav class="space-y-1">
      <!-- верхний уровень -->
      <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl transition"
          :class="isActive(item.id) ? activeCls : baseCls"
          @click="goTo(item.id)"
      >
        {{ item.label }}
      </button>

      <!-- дети (блоки конструктора) -->
      <div v-for="item in items" :key="item.id + '-children'">
        <div v-if="item.children?.length" class="mt-1 ml-1 space-y-1">
          <button
              v-for="c in item.children"
              :key="c.id"
              type="button"
              class="w-full text-left px-4 py-2.5 rounded-xl text-sm transition"
              :class="isActive(c.id) ? activeChildCls : childCls"
              @click="goTo(c.id)"
          >
            {{ c.label }}
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { id: string; label: string; children?: { id: string; label: string }[] }[];
  offset?: number; // отступ под фикс-хедер
}>();

const baseCls =
    'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5';
const activeCls =
    'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-inset ring-indigo-100/60';
const childCls =
    'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5';
const activeChildCls =
    'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-inset ring-indigo-100/60';

const activeId = ref<string | null>(null);
const headerOffset = computed(() => props.offset ?? 72);

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset.value;
  window.scrollTo({top, behavior: 'smooth'});
};

const isActive = (id: string) => activeId.value === id;

// отслеживание активного блока (по прокрутке)
onMounted(() => {
  const ids = props.items.flatMap((it) => [it.id, ...(it.children?.map((c) => c.id) ?? [])]);
  const els = ids
      .map((id) => ({id, el: document.getElementById(id)}))
      .filter((x) => !!x.el) as { id: string; el: Element }[];

  // IntersectionObserver устойчив к перепрыгиванию
  const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).id;
          activeId.value = id;
        }
      },
      {
        root: null,
        rootMargin: `-${headerOffset.value + 8}px 0px -65% 0px`, // “активен” ближний кверху
        threshold: [0.1, 0.25, 0.5],
      }
  );

  els.forEach(({el}) => io.observe(el));
  onBeforeUnmount(() => io.disconnect());
});
</script>
