<template>
  <div class="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
    <el-table
        :data="rows"
        row-key="id"
        table-layout="auto"
        stripe
        class="modern-table w-full rounded-xl"
    >
      <el-table-column min-width="280" label="Покупатель">
        <template #default="{ row }">
          <div class="flex items-center gap-3 min-w-0">
            <!-- аватар можно добавить позже -->
            <div class="min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">
                {{ row.customerName || '—' }}
              </div>
              <div class="text-xs text-gray-400 truncate">
                {{ row.customerEmail || '' }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column width="140" label="Статус" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120" label="Товары" align="center">
        <template #default="{ row }">
          <span class="text-gray-700 dark:text-gray-200">{{ row.itemsCount }} шт.</span>
        </template>
      </el-table-column>

      <el-table-column width="160" label="Сумма" align="right">
        <template #default="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">{{ formatMoney(row.totalAmount) }}</span>
        </template>
      </el-table-column>

      <el-table-column width="200" label="Дата">
        <template #default="{ row }">
          <span class="text-gray-600 dark:text-gray-300">{{ formatDateTime(row.createdAt) }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120" fixed="right" align="right" label="Действия">
        <template #default>
          <el-button size="small" circle><el-icon><View /></el-icon></el-button>
          <el-button size="small" circle><el-icon><MoreFilled /></el-icon></el-button>
        </template>
      </el-table-column>

      <template #empty>
        <div class="py-14 text-center text-gray-500">Пока нет заказов</div>
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { View, MoreFilled } from '@element-plus/icons-vue'
import { formatDateTime, formatMoney } from '~/utils/format'

type BackendOrder = {
  id: string | number
  slug?: string
  status?: string            // "Оплачен", "Отменен", "Ожидает оплаты", ...
  paymentStatus?: string     // "succeeded" | "pending" | ...
  deliveryStatus?: string
  totalAmount?: number
  createdAt?: string
  customer?: { id?: string | number; name?: string; email?: string }
  items?: Array<{ id?: string|number; productId?: string; title?: string; quantity?: number; totalPrice?: number }>
}

const props = defineProps<{ orders: BackendOrder[] }>()

/** Нормализуем заказы под отображение в таблице */
const rows = computed(() =>
    (props.orders || []).map(o => ({
      id: o.id,
      slug: o.slug,
      status: o.status || '',
      totalAmount: o.totalAmount ?? 0,
      createdAt: o.createdAt || '',
      customerName: o.customer?.name || '',
      customerEmail: o.customer?.email || '',
      itemsCount: (o.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 0), 0),
    }))
)

/** Маппинг статуса в цвет тега */
function statusTag(s?: string) {
  if (!s) return 'info'
  const v = s.toLowerCase()
  if (v.includes('оплачен')) return 'success'
  if (v.includes('ожидает')) return 'warning'
  if (v.includes('достав') || v.includes('в пути') || v.includes('подтвержден')) return 'info'
  if (v.includes('отмен')) return 'danger'
  return 'info'
}
</script>

<style scoped>
:deep(.modern-table .el-table__inner-wrapper::before){ display:none; }
:deep(.modern-table .el-table__header-wrapper th){
  background-color: rgb(249 250 251 / 1);
  font-weight:600;
  color: rgb(75 85 99 / 1);
}
:deep(.modern-table .el-table__body tr:hover>td){ background-color: rgba(99,102,241,.06); }
</style>
