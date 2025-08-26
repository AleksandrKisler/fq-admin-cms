<template>
  <svg :viewBox="`0 0 ${box.w} ${box.h}`" class="block">
    <path :d="areaPath" :fill="stroke + '22'"/>
    <path :d="linePath" fill="none" :stroke="stroke" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{ points?: number[], color?: 'white' | 'indigo' | 'sky' | 'emerald' | 'amber' }>()
const box = {w: 120, h: 48}
const data = computed(() => props.points?.length ? props.points! : [0])
const max = computed(() => Math.max(...data.value, 1))
const min = computed(() => Math.min(...data.value))
const stroke = computed(() => {
  if (props.color === 'white') return '#FFFFFF'
  return ({
    indigo: '#6366F1',
    sky: '#0EA5E9',
    emerald: '#10B981',
    amber: '#F59E0B'
  } as any)[props.color || 'indigo'] || '#6366F1'
})
const pts = computed(() => data.value.map((v, i) => {
  const x = (i / (data.value.length - 1 || 1)) * box.w
  const y = box.h - ((v - min.value) / (max.value - min.value || 1)) * box.h
  return [x, y]
}))
const linePath = computed(() => ['M', pts.value[0][0], pts.value[0][1], ...pts.value.slice(1).flatMap(([x, y]) => ['L', x, y])].join(' '))
const areaPath = computed(() => linePath.value + ` L ${box.w} ${box.h} L 0 ${box.h} Z`)
</script>
