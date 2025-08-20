<template>
  <div class="space-y-2" :id="anchorId">
    <!-- Шапка с навигацией -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-300">
        <template v-if="index && total">Блок {{ index }} / {{ total }}</template>
        <template v-else>{{ label }}</template>
      </div>

      <div class="flex items-center gap-1.5" v-if="showToolbar">
        <el-tooltip content="К предыдущему">
          <span>
            <el-button
                size="small"
                circle
                :disabled="!prevAnchorId"
                @click="goTo(prevAnchorId!)"
            >
              <el-icon><ArrowUp /></el-icon>
            </el-button>
          </span>
        </el-tooltip>

        <el-tooltip content="К следующему">
          <span>
            <el-button
                size="small"
                circle
                :disabled="!nextAnchorId"
                @click="goTo(nextAnchorId!)"
            >
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </span>
        </el-tooltip>

        <el-tooltip content="Скопировать ссылку на этот блок">
          <el-button size="small" circle @click="copySelfLink">
            <el-icon><Link /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Превью -->
    <div
        class="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 grid place-items-center text-center px-4"
        :class="aspectRatioClass"
    >
      <template v-if="title">
        <div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ kind === 'banner' ? 'Баннер' : 'Подборка' }}
          </div>
          <div class="font-medium truncate max-w-[80%] mx-auto">
            {{ title }}
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-gray-400 dark:text-white/60">
          {{ emptyText }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUp, ArrowDown, Link } from '@element-plus/icons-vue'

type Kind = 'banner' | 'selection'

const props = defineProps<{
  label?: string
  kind: Kind
  title?: string | null
  emptyText?: string
  double?: boolean

  /** навигация */
  anchorId?: string           // id текущего блока (якорь)
  prevAnchorId?: string | null
  nextAnchorId?: string | null
  index?: number | null       // номер блока
  total?: number | null       // всего блоков
  showToolbar?: boolean       // показывать ли кнопки навигации (по умолчанию true)
}>()

const aspectRatioClass = computed(() => (props.double ? 'aspect-[16/18]' : 'aspect-[16/9]'))

const headerOffset = 72 // отступ под фикс-хедер админки
const goTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

const copySelfLink = async () => {
  try {
    const base = window.location.href.split('#')[0]
    const hash = props.anchorId ? `#${props.anchorId}` : ''
    const url = base + hash
    await navigator.clipboard.writeText(url)
    // @ts-ignore
    if (window.ElMessage) ElMessage.success('Ссылка скопирована')
  } catch {
    // @ts-ignore
    if (window.ElMessage) ElMessage.error('Не удалось скопировать')
  }
}
</script>

<style scoped>
/* no-op */
</style>
