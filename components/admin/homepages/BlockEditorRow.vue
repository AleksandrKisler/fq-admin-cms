<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</div>

      <div class="flex items-center gap-2">
        <el-popover
            v-model:visible="panelOpen"
            trigger="click"
            placement="bottom-end"
            width="420"
            :persistent="true"
            :hide-after="0"
            popper-class="block-editor-popover"
        >
          <template #reference>
            <el-button type="primary" plain size="small">
              {{ current ? 'Заменить' : 'Выбрать' }}
            </el-button>
          </template>

          <!-- важно: останавливаем всплытие кликов -->
          <div class="p-3 space-y-3" @click.stop @mousedown.stop>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ kind === 'banner' ? 'Выберите баннер' : 'Выберите подборку' }}
            </div>

            <el-select
                v-model="tempId"
                filterable
                clearable
                class="w-full"
                :loading="loading"
                :teleported="false"
                :fit-input-width="true"
                placeholder="Начните ввод…"
            >
              <el-option
                  v-for="it in items"
                  :key="it.id"
                  :label="it.title || ('#' + it.id)"
                  :value="it.id"
              >
                <div class="flex items-center gap-2">
                  <div v-if="kind==='banner'" class="h-6 w-10 rounded bg-gray-100 overflow-hidden border">
                    <img v-if="it.image_url" :src="$fileUrl(it.image_url)" class="h-full w-full object-cover"/>
                  </div>
                  <span class="truncate">{{ it.title || ('#' + it.id) }}</span>
                  <span v-if="kind==='banner' && it.type" class="ml-auto text-xs text-gray-400">{{ it.type }}</span>
                </div>
              </el-option>
            </el-select>

            <div class="flex items-center justify-end gap-2">
              <el-button size="small" @click="onCancel">Отмена</el-button>
              <el-button v-if="current" size="small" type="danger" plain @click="onClear">Очистить</el-button>
              <el-button size="small" type="primary" :disabled="!tempId" @click="onApply">Применить</el-button>
            </div>
          </div>
        </el-popover>

        <el-popconfirm v-if="current" title="Удалить выбранный элемент?" @confirm="doClear">
          <template #reference>
            <el-button text type="danger" size="small">Удалить</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- превью -->
    <div>
      <BannerPreviewMini v-if="kind==='banner'" :banner="current" :double="double"/>
      <SelectionPreviewStrip
          v-else
          :selection-id="modelValue"
          :limit="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SelectionPreviewStrip from "~/components/admin/selections/SelectionPreviewStrip.vue";

type Kind = 'banner' | 'selection'
import BannerPreviewMini from '~/components/admin/banners/BannerPreviewMini.vue'

const {$fileUrl} = useNuxtApp()

const props = defineProps<{
  label: string
  kind: Kind
  modelValue: number | null
  items: any[]
  placeholder?: string
  double?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>()

const panelOpen = ref(false)
const tempId = ref<number | null>(null)
const current = computed(() => props.items.find(i => String(i.id) === String(props.modelValue)) || null)

watch(panelOpen, (v) => {
  if (v) tempId.value = (props.modelValue as any) ?? null
})

const onApply = () => {
  if (tempId.value == null) return;
  emit('update:modelValue', tempId.value);
  panelOpen.value = false
}
const onCancel = () => {
  panelOpen.value = false;
  tempId.value = null
}
const onClear = () => {
  emit('update:modelValue', null);
  panelOpen.value = false;
  tempId.value = null
}
const doClear = () => emit('update:modelValue', null)
</script>

<style>
/* контейнер поповера для конструктора — даём выпадашке Select выйти за рамки */
.block-editor-popover {
  overflow: visible;
}
</style>
