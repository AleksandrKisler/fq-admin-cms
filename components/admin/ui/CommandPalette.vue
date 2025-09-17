<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[1000]">
      <div class="absolute inset-0 bg-black/40" @click="close"/>
      <div class="absolute inset-x-0 top-16 mx-auto w-full max-w-2xl px-4">
        <div class="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-black/5">
          <div class="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
            <el-icon>
              <Search/>
            </el-icon>
            <input
                ref="inp"
                v-model="q"
                type="text"
                placeholder="Быстрый переход…"
                class="w-full bg-transparent outline-none text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="selectCurrent"
                @keydown.esc.prevent="close"
            />
            <span class="hidden sm:flex items-center text-xs text-gray-400 dark:text-gray-500 gap-1">
              <kbd class="kbd">Esc</kbd> чтобы закрыть
            </span>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            <template v-if="filtered.length">
              <ul class="py-2">
                <li
                    v-for="(it, i) in filtered"
                    :key="it.key || it.to || it.label"
                    @click="onSelect(it)"
                    @mouseenter="active = i"
                    class="px-3 sm:px-4 py-2.5 cursor-pointer flex items-center gap-3"
                    :class="i===active ? 'bg-indigo-50 dark:bg-white/10' : ''"
                >
                  <el-icon class="text-gray-500 dark:text-gray-300">
                    <component :is="it.icon || CircleCheck"/>
                  </el-icon>
                  <div class="flex-1 min-w-0">
                    <div class="text-[14px] truncate" v-html="hl(it.label)"></div>
                    <div v-if="it.description" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ it.description }}
                    </div>
                  </div>
                  <el-icon class="text-gray-400">
                    <ArrowRight/>
                  </el-icon>
                </li>
              </ul>
            </template>

            <div v-else class="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
              Ничего не найдено
            </div>
          </div>

          <div
              class="px-4 py-2 border-t border-gray-100 dark:border-white/10 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between"
          >
            <div class="hidden sm:flex items-center gap-3">
              <span class="flex items-center gap-1"><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> навигация</span>
              <span class="flex items-center gap-1"><kbd class="kbd">Enter</kbd> выбрать</span>
            </div>
            <div class="flex items-center gap-1">
              <kbd class="kbd">⌘</kbd><kbd class="kbd">K</kbd> открыть
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {Search, ArrowRight, CircleCheck} from '@element-plus/icons-vue'

type Item = {
  label: string
  to?: string
  action?: () => void
  icon?: any
  description?: string
  key?: string
}

const props = defineProps<{ open: boolean; items: Item[] }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const q = ref('')
const active = ref(0)
const inp = ref<HTMLInputElement | null>(null)

const close = () => emit('update:open', false)

watch(() => props.open, (v) => {
  if (v) {
    active.value = 0
    nextTick(() => inp.value?.focus())
  } else {
    q.value = ''
  }
})

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
const score = (label: string, query: string) => {
  const L = norm(label);
  const Q = norm(query)
  if (!Q) return 1
  if (L === Q) return 100
  if (L.startsWith(Q)) return 50
  if (L.includes(Q)) return 20
  let i = 0, j = 0;
  while (i < L.length && j < Q.length) {
    if (L[i] === Q[j]) j++;
    i++
  }
  return j === Q.length ? 5 : 0
}

const filtered = computed(() => {
  const list = props.items || []
  if (!q.value) return list.slice(0, 12)
  return list
      .map(it => ({it, s: score(it.label, q.value)}))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map(x => x.it)
})

const move = (delta: number) => {
  if (!filtered.value.length) return
  active.value = (active.value + delta + filtered.value.length) % filtered.value.length
}
const selectCurrent = () => {
  const it = filtered.value[active.value]
  if (it) onSelect(it)
}
const router = useRouter()
const onSelect = (it: Item) => {
  if (it.action) it.action()
  else if (it.to) router.push(it.to)
  close()
}

const hl = (label: string) => {
  const qv = norm(q.value)
  if (!qv) return label
  const idx = norm(label).indexOf(qv)
  if (idx < 0) return label
  return label.substring(0, idx) + '<mark class="bg-yellow-200 dark:bg-yellow-600/50 px-0.5 rounded">' +
      label.substring(idx, idx + qv.length) + '</mark>' + label.substring(idx + qv.length)
}

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      emit('update:open', !props.open)
    }
    if (props.open && e.key === 'Escape') {
      e.preventDefault();
      close()
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .15s ease
}

.fade-enter-from, .fade-leave-to {
  opacity: 0
}

.kbd {
  @apply inline-flex items-center justify-center h-[22px] min-w-[22px] px-1.5 rounded border border-gray-300/80 dark:border-white/20 text-[10px] leading-none bg-white dark:bg-white/10;
}
</style>
