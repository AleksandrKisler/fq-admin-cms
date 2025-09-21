<template>
  <div class="space-y-6">
    <AdminPageHeader title="Дашборд" subtitle="Свежая статистика магазина">
      <template #actions>
        <div class="flex items-center gap-2">
          <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="Дата начала"
              size="large"
              :disabled-date="disableFuture"
          />
          <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="Дата конца"
              size="large"
              :disabled-date="disableFuture"
          />
          <el-button :icon="Refresh" @click="regenerate">Обновить</el-button>
        </div>
      </template>
    </AdminPageHeader>

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
          <div class="flex items-center justify-between">
            <span class="text-gray-800 dark:text-white font-medium">Избранное</span>
            <span class="text-sm text-gray-400">Всего позиций</span>
          </div>
        </template>
        <div class="flex items-end justify-between">
          <div class="text-3xl font-semibold text-gray-900 dark:text-white">{{ formatInt(metrics.favorites) }}</div>
          <Sparkline :points="spark.favorites" class="h-12 w-40" color="indigo"/>
        </div>
      </el-card>

      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-gray-800 dark:text-white font-medium">Корзины</span>
            <span class="text-sm text-gray-400">Всего позиций</span>
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
            <span class="text-gray-800 dark:text-white font-medium">
              Выручка ({{ periodLabel }})
            </span>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Сумма за период: {{ formatMoney(sumSeries(revenueSeries)) }}
            </div>
          </div>
        </template>
        <AreaLineChart :data="revenueSeries" y-label="₽" :height="280" :grid="true" color="#6366F1"/>
      </el-card>

      <el-card
          class="!rounded-2xl backdrop-blur bg-white/90 border border-gray-100 dark:bg-neutral-900 dark:border-white/10">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-gray-800 dark:text-white font-medium">Посещения и конверсия</span>
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
          <div class="text-xs text-gray-500 dark:text-gray-400">Конверсия = Заказы / Посещения.</div>
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
            <el-button text @click="regenerate">Обновить</el-button>
          </div>
        </template>
        <OrdersTable :orders="ordersLatest"/>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import {Refresh} from '@element-plus/icons-vue'
import AdminPageHeader from "~/components/admin/ui/AdminPageHeader.vue";
import KpiCard from "~/components/admin/dashboard/KpiCard.vue";
import Sparkline from "~/components/admin/dashboard/Sparkline.vue";
import OrdersTable from "~/components/admin/dashboard/OrdersTable.vue";

definePageMeta({layout: 'admin', title: 'Дашборд'})
const {$api} = useNuxtApp()

/** Эндпоинт реального бэка (оставь как у тебя) */
const ENDPOINT = '/admin/dashboard'

/** Даты: начало/конец, конец не позже «сегодня», начало не позже конца */
const today = new Date()
const defaultEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate()) // сегодня (без времени)
const defaultStart = new Date(defaultEnd);
defaultStart.setMonth(defaultStart.getMonth() - 1)

const startDate = ref<Date | null>(defaultStart)
const endDate = ref<Date | null>(defaultEnd)

/** Блокировка будущих дат в пикере */
const disableFuture = (time: Date) => {
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime()
  return time.getTime() > endOfToday
}

/** Самокоррекция дат (реактивные вотчеры) */
watch(startDate, (s) => {
  if (!s) return
  if (!endDate.value) {
    endDate.value = s;
    return
  }
  if (s > (endDate.value as Date)) endDate.value = s
})
watch(endDate, (e) => {
  if (!e) return
  // не позволяем выбрать будущую дату
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  if (e > endOfToday) endDate.value = endOfToday
  // и не раньше начала
  if (startDate.value && e < startDate.value) startDate.value = e
})

/** RAW-ответ от бэка */
const raw = reactive<any>({
  period: {start: '', end: ''},
  summary: {
    totalOrders: 0, paidOrders: 0, cancelledOrders: 0, totalRevenue: 0, averageOrderValue: 0,
    customers: {total: 0, new: 0, active: 0, returning: 0}
  },
  ordersByStatus: [],
  revenueTrend: [],
  topProducts: [],
  recentOrders: [],
})

/** Маппинг в метрики для UI */
const metrics = computed(() => {
  const orders = raw.summary.totalOrders || 0
  const revenue = raw.summary.totalRevenue || 0
  const aov = raw.summary.averageOrderValue || 0
  const conversion = orders ? Math.round((raw.summary.paidOrders / orders) * 1000) / 10 : 0
  const visits = conversion ? Math.round(orders / (conversion / 100)) : orders
  const favorites = raw.topProducts.length
  const carts = raw.recentOrders.length
  return {
    revenue, orders, aov, conversion,
    visits, favorites, carts,
    revenueDelta: 0, ordersDelta: 0, conversionDelta: 0, aovDelta: 0,
  }
})

/** Спарклайны */
const spark = computed(() => {
  const rev = raw.revenueTrend.map((p: any) => p.revenue)
  const ord = raw.revenueTrend.map((p: any) => p.ordersCount)
  const maxOrd = Math.max(1, ...ord)
  const conv = ord.map((o: number) => Math.round((o / maxOrd) * (metrics.value.conversion || 0)))
  const fav = raw.topProducts.map((p: any) => p.unitsSold)
  const vis = ord.map((o: number) => o ? Math.round(o / Math.max(0.01, (metrics.value.conversion / 100))) : 0)
  const crt = ord
  return {
    revenue: rev,
    orders: ord,
    conversion: conv,
    favorites: fav.length ? fav : [0],
    visits: vis.length ? vis : ord,
    carts: crt.length ? crt : ord,
    aov: rev
  }
})

/** Серия для графика и подпись периода */
const revenueSeries = computed(() =>
    raw.revenueTrend.map((p: any) => ({x: new Date(p.date), y: p.revenue}))
)
const periodLabel = computed(() => {
  const s = raw.period.start ? d(raw.period.start) : (startDate.value ? d(startDate.value) : '')
  const e = raw.period.end ? d(raw.period.end) : (endDate.value ? d(endDate.value) : '')
  return s && e ? `${s} → ${e}` : 'период не выбран'
})

/** Последние заказы */
const ordersLatest = computed(() => raw.recentOrders)

/** Загрузка */
const loading = ref(false)
const load = async () => {
  loading.value = true
  try {
    const s = startDate.value || defaultStart
    const e = endDate.value || defaultEnd
    const startISO = toUtcStartOfDayISO(s)
    const endISO = toUtcEndOfDayISO(e)
    const r: any = await $api(ENDPOINT, {query: {startDate: startISO, endDate: endISO}})
    const payload = r?.data || r
    raw.period.start = payload.period?.start || startISO
    raw.period.end = payload.period?.end || endISO
    raw.summary = payload.summary || raw.summary
    raw.ordersByStatus = payload.ordersByStatus || []
    raw.revenueTrend = payload.revenueTrend || []
    raw.topProducts = payload.topProducts || []
    raw.recentOrders = payload.recentOrders || []
  } catch (e: any) {
    ElMessage.error(e?.data?.message || 'Не удалось загрузить дашборд')
  } finally {
    loading.value = false
  }
}
onMounted(load)
const regenerate = () => load()

/** Helpers */
const d = (v: string | Date) =>
    new Date(v).toLocaleDateString('ru-RU')
const formatMoney = (n: number) =>
    (n ?? 0).toLocaleString('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0})
const formatInt = (n: number) => (n ?? 0).toLocaleString('ru-RU')
const formatPercent = (n: number) => Math.round((n ?? 0) * 10) / 10
const sumSeries = (series: Array<{ y: number }>) => (series || []).reduce((acc, p) => acc + (p?.y || 0), 0)

function toUtcStartOfDayISO(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)).toISOString()
}

function toUtcEndOfDayISO(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)).toISOString()
}
</script>

<style scoped>
/* доп. стилей не нужно, всё в Tailwind */
</style>
