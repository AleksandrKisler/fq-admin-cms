<template>
  <div class="w-full overflow-hidden">
    <svg :viewBox="`0 0 ${vb.w} ${vb.h}`" class="block w-full">
      <template v-if="grid">
        <line v-for="t in ticks" :key="t" :x1="0" :x2="vb.w" :y1="y(t)" :y2="y(t)" stroke="#E5E7EB" stroke-width="1"/>
      </template>

      <path :d="areaPath" :fill="color + '22'"/>
      <path :d="linePath" fill="none" :stroke="color" stroke-width="3" stroke-linecap="round"/>

      <text v-for="(d,i) in data" :key="i" v-if="i % step === 0"
            :x="x(i)" :y="vb.h-6" text-anchor="middle" fill="#9CA3AF" font-size="11">{{ d.label }}
      </text>

      <text v-if="yLabel" x="8" y="16" fill="#9CA3AF" font-size="11">{{ yLabel }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: { label: string; value: number }[],
  height?: number,
  yLabel?: string,
  grid?: boolean,
  color?: string
}>()

const vb = computed(() => ({w: 720, h: props.height ?? 260}))
const maxY = computed(() => Math.max(...props.data.map(d => d.value), 1))
const pad = computed(() => Math.ceil(maxY.value * 0.1))
const y = (v: number) => (vb.value.h - 24) - (v / (maxY.value + pad.value)) * (vb.value.h - 48)
const x = (i: number) => (i / (props.data.length - 1 || 1)) * (vb.value.w - 32) + 16
const pts = computed(() => props.data.map((d, i) => [x(i), y(d.value)]))
const linePath = computed(() => !pts.value.length ? '' : ['M', pts.value[0][0], pts.value[0][1], ...pts.value.slice(1).flatMap(([X, Y]) => ['L', X, Y])].join(' '))
const areaPath = computed(() => linePath.value + ` L ${x(props.data.length - 1)} ${vb.value.h - 24} L ${x(0)} ${vb.value.h - 24} Z`)
const ticks = computed(() => {
  const c = 4, arr: number[] = [];
  for (let i = 0; i <= c; i++) arr.push(Math.round((maxY.value * i) / c));
  return arr
})
const step = computed(() => Math.ceil((props.data.length || 1) / 6))
const color = computed(() => props.color || '#6366F1')
const yLabel = computed(() => props.yLabel || '')
const grid = computed(() => props.grid !== false)
</script>
