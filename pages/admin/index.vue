<template>
  <div class="space-y-6">
    <AdminPageHeader title="Дашборд" subtitle="Свежая статистика магазина (моки)">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-select v-model="granularity" class="w-40" size="large">
            <el-option label="По неделям" value="weekly"/>
            <el-option label="По месяцам" value="monthly"/>
          </el-select>
          <el-date-picker v-model="range" type="daterange" range-separator="→" start-placeholder="От"
                          end-placeholder="До" size="large" :disabled="true"/>
          <el-button :icon="Refresh" @click="regenerate">Обновить</el-button>
        </div>
      </template>
    </AdminPageHeader>

    <!-- KPI -->
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard title="Выручка" :value="formatMoney(metrics.revenue)" :delta="metrics.revenueDelta" tone="indigo"
               :spark="spark.revenue"/>
      <KpiCard title="Заказы" :value="formatInt(metrics.orders)" :delta="metrics.ordersDelta" tone="emerald"
               :spark="spark.orders"/>
      <KpiCard title="Конверсия" :value="formatPercent(metrics.conversion)" :delta="metrics.conversionDelta"
               tone="amber" :spark="spark.conversion" suffix="%"/>
      <KpiCard title="Средний чек" :value="formatMoney(metrics.aov)" :delta="metrics.aovDelta" tone="violet"
               :spark="spark.aov"/>
    </section>

    <!-- Favorites / Carts -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between"><span class="text-gray-800 dark:text-white font-medium">Избранное</span><span
              class="text-sm text-gray-400">Всего позиций</span></div>
        </template>
        <div class="flex items-end justify-between">
          <div class="text-3xl font-semibold text-gray-900 dark:text-white">{{ formatInt(metrics.favorites) }}</div>
          <Sparkline :points="spark.favorites" class="h-12 w-40" color="indigo"/>
        </div>
      </el-card>

      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between"><span
              class="text-gray-800 dark:text-white font-medium">Корзины</span><span class="text-sm text-gray-400">Всего позиций</span>
          </div>
        </template>
        <div class="flex items-end justify-between">
          <div class="text-3xl font-semibold text-gray-900 dark:text-white">{{ formatInt(metrics.carts) }}</div>
          <Sparkline :points="spark.carts" class="h-12 w-40" color="emerald"/>
        </div>
      </el-card>
    </section>

    <!-- Charts & Visits -->
    <section class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <el-card
          class="xl:col-span-2 !rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-gray-800 dark:text-white font-medium">Выручка ({{ granularityLabel }})</span>
            <div class="text-sm text-gray-500 dark:text-gray-400">Сумма за период:
              {{ formatMoney(sumSeries(revenueSeries)) }}
            </div>
          </div>
        </template>
        <AreaLineChart :data="revenueSeries" y-label="₽" :height="280" :grid="true" color="#6366F1"/>
      </el-card>

      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between"><span class="text-gray-800 dark:text-white font-medium">Посещения и конверсия</span>
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Посещения</div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{ formatInt(metrics.visits) }}</div>
            </div>
            <Sparkline :points="spark.visits" class="h-12 w-40" color="sky"/>
          </div>
          <el-divider class="!my-1"/>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Конверсия</div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{
                  formatPercent(metrics.conversion)
                }}%
              </div>
            </div>
            <Sparkline :points="spark.conversion" class="h-12 w-40" color="amber"/>
          </div>
          <el-divider class="!my-1"/>
          <div class="text-xs text-gray-500 dark:text-gray-400">Конверсия = Заказы / Посещения · данные синтетические.
          </div>
        </div>
      </el-card>
    </section>

    <!-- Latest orders -->
    <section>
      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-gray-800 dark:text-white font-medium">Последние заказы</span>
            <el-button text @click="regenerate">Сгенерировать ещё</el-button>
          </div>
        </template>
        <OrdersTable :orders="ordersLatest"/>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({layout: 'admin'})

import AdminPageHeader from '~/components/admin/ui/AdminPageHeader.vue'
import Sparkline from '~/components/admin/dashboard/Sparkline.vue'
import AreaLineChart from '~/components/admin/dashboard/AreaLineChart.vue'
import KpiCard from '~/components/admin/dashboard/KpiCard.vue'
import OrdersTable from '~/components/admin/dashboard/OrdersTable.vue'
import {Refresh} from '@element-plus/icons-vue'
import {useMockAnalytics} from '~/composables/useMockAnalytic'
import {formatMoney, formatInt, formatPercent} from '~/utils/format'

const {
  granularity, granularityLabel, range,
  revenueSeries, sumSeries,
  ordersLatest,
  metrics, spark,
  regenerate
} = useMockAnalytics()
</script>
