<template>
  <div class="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
    <el-table :data="orders" row-key="id" table-layout="auto" stripe class="modern-table w-full rounded-xl">
      <el-table-column min-width="280" label="Покупатель">
        <template #default="{ row }">
          <div class="flex items-center gap-3 min-w-0">
            <img :src="row.user.avatar" class="h-9 w-9 rounded-full object-cover border border-gray-100 dark:border-white/10" :alt="row.user.name" />
            <div class="min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">{{ row.user.name }}</div>
              <div class="text-xs text-gray-400 truncate">{{ row.user.email }}</div>
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
        <template #default="{ row }"><span class="text-gray-700 dark:text-gray-200">{{ row.items }} шт.</span></template>
      </el-table-column>

      <el-table-column width="160" label="Сумма" align="right">
        <template #default="{ row }"><span class="font-medium text-gray-900 dark:text-white">{{ formatMoney(row.total) }}</span></template>
      </el-table-column>

      <el-table-column width="200" label="Дата">
        <template #default="{ row }"><span class="text-gray-600 dark:text-gray-300">{{ formatDateTime(row.created_at) }}</span></template>
      </el-table-column>

      <el-table-column width="120" fixed="right" align="right" label="Действия">
        <template #default>
          <el-button size="small" circle><el-icon><View /></el-icon></el-button>
          <el-button size="small" circle><el-icon><MoreFilled /></el-icon></el-button>
        </template>
      </el-table-column>

      <template #empty><div class="py-14 text-center text-gray-500">Пока нет заказов</div></template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { View, MoreFilled } from '@element-plus/icons-vue'
import { formatDateTime, formatMoney } from '~/utils/format'

defineProps<{ orders: any[] }>()

function statusTag(s) {
  return s ==='new' ? 'warning' : s==='paid' ? 'success' : s==='shipped' ? 'info' : 'danger'
}
</script>

<style scoped>
:deep(.modern-table .el-table__inner-wrapper::before){ display:none; }
:deep(.modern-table .el-table__header-wrapper th){
  background-color: rgb(249 250 251 / 1); font-weight:600; color: rgb(75 85 99 / 1);
}
:deep(.modern-table .el-table__body tr:hover>td){ background-color: rgba(99,102,241,.06); }
</style>
