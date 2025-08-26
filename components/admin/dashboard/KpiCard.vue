<template>
  <div
      class="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 shadow-sm">
    <div class="flex items-start justify-between">
      <div>
        <div class="text-sm text-gray-500 dark:text-gray-400">{{ title }}</div>
        <div class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
          {{ value }}<span v-if="suffix">{{ suffix }}</span>
        </div>
        <div
            class="mt-1 inline-flex items-center gap-2 text-xs px-2 py-0.5 rounded-full"
            :class="up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
        >
          {{ deltaText }}
        </div>
      </div>

      <div :class="['h-16 w-32 rounded-lg p-1 bg-gradient-to-br', toneClass]">
        <Sparkline :points="spark" class="h-full w-full" color="white"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sparkline from './Sparkline.vue'

const props = defineProps<{
  title?: string
  value: string
  delta?: number
  spark?: number[]
  tone?: 'indigo' | 'emerald' | 'amber' | 'violet'
  suffix?: string
}>()

const up = computed(() => (props.delta ?? 0) >= 0)
const deltaText = computed(() => {
  const d = Math.abs(Math.round((props.delta ?? 0) * 10) / 10)
  return `${up.value ? '▲' : '▼'} ${d}%`
})
const toneClass = computed(() => ({
  indigo: 'from-indigo-500 to-violet-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  violet: 'from-violet-500 to-fuchsia-600'
}[props.tone || 'indigo']))
</script>
