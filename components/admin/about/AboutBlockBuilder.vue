<template>
  <div class="space-y-4">
    <!-- Палитра -->
    <el-card shadow="never" class="!rounded-xl border border-gray-100">
      <template #header>
        <div class="font-medium">Добавить блок</div>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <el-button v-for="p in palette" :key="p.type" plain @click="add(p.type)" class="m-0">
          {{ p.label }}
        </el-button>
      </div>
    </el-card>

    <!-- Список блоков -->
    <div ref="listRef" class="space-y-3">
      <div
          v-for="(element, index) in inner"
          :key="element.id"
          class="el-card is-always-shadow !rounded-xl overflow-hidden border border-gray-100"
      >
        <!-- header -->
        <div class="el-card__header">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <!-- ручка перетаскивания -->
              <el-button class="drag-handle" text :title="'Перетащите'">
                <el-icon>
                  <Rank/>
                </el-icon>
              </el-button>
              <span class="font-medium">{{ titleByType(element.type) }}</span>
              <el-tag size="small" type="info">#{{ index + 1 }}</el-tag>
            </div>
            <div class="flex items-center gap-2">
              <!-- запасной реордер без dnd -->
              <el-button text :disabled="index===0" @click="move(index, index-1)">
                <el-icon>
                  <ArrowUp/>
                </el-icon>
              </el-button>
              <el-button text :disabled="index===inner.length-1" @click="move(index, index+1)">
                <el-icon>
                  <ArrowDown/>
                </el-icon>
              </el-button>

              <el-button text @click="element.collapsed = !element.collapsed">
                {{ element.collapsed ? 'Раскрыть' : 'Свернуть' }}
              </el-button>
              <el-button text @click="duplicate(element)">Дублировать</el-button>
              <el-popconfirm title="Удалить блок?" @confirm="remove(element.id)">
                <template #reference>
                  <el-button text type="danger">Удалить</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>

        <!-- body -->
        <transition name="el-fade-in-linear">
          <div v-show="!element.collapsed" class="el-card__body p-4 bg-white">
            <component :is="editors[element.type]" v-model="inner[index]"/>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, watch} from 'vue'

// иконки
import {Rank, ArrowUp, ArrowDown} from '@element-plus/icons-vue'

// редакторы блоков
import HeroEditor from './blocks/HeroEditor.vue'
import TextEditor from './blocks/TextEditor.vue'
import ImageEditor from './blocks/ImageEditor.vue'
import ImagePairEditor from './blocks/ImagePairEditor.vue'
import GalleryEditor from './blocks/GalleryEditor.vue'
import QuoteEditor from './blocks/QuoteEditor.vue'
import NumberEditor from './blocks/NumberEditor.vue'
import DividerEditor from './blocks/DividerEditor.vue'
import SpacerEditor from './blocks/SpacerEditor.vue'

const props = defineProps({modelValue: {type: Array, default: () => []}})
const emit = defineEmits(['update:modelValue'])

const inner = ref(JSON.parse(JSON.stringify(props.modelValue || [])))
watch(() => props.modelValue, v => inner.value = JSON.parse(JSON.stringify(v || [])))
watch(inner, v => emit('update:modelValue', v), {deep: true})

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const palette = [
  {type: 'hero', label: 'Hero'}, {type: 'text', label: 'Text'},
  {type: 'image', label: 'Image'}, {type: 'image-pair', label: 'Image Pair'},
  {type: 'gallery-masonry', label: 'Gallery'}, {type: 'quote', label: 'Quote'},
  {type: 'number', label: 'Number'}, {type: 'divider', label: 'Divider'},
  {type: 'spacer', label: 'Spacer'},
]

const defaults = {
  'hero': () => ({
    id: uid(),
    type: 'hero',
    title: 'Заголовок',
    subtitle: '',
    image: '',
    align: 'center',
    // никогда не null ─ так безопаснее для v-model
    cta: {enabled: false, label: '', href: ''}
  }),
  'text': () => ({id: uid(), type: 'text', html: '<p>Текст</p>', align: 'center', width: 'normal'}),
  'image': () => ({id: uid(), type: 'image', image: '', ratio: '16/9', caption: '', align: 'center'}),
  'image-pair': () => ({
    id: uid(),
    type: 'image-pair',
    left: {image: '', caption: ''},
    right: {image: '', caption: ''},
    gap: 16
  }),
  'gallery-masonry': () => ({id: uid(), type: 'gallery-masonry', columns: 3, gap: 8, items: []}),
  'quote': () => ({id: uid(), type: 'quote', text: 'Цитата…', author: '', big: true}),
  'number': () => ({id: uid(), type: 'number', value: '10', label: 'лет', text: ''}),
  'divider': () => ({id: uid(), type: 'divider', weight: 'thin'}),
  'spacer': () => ({id: uid(), type: 'spacer', size: 'md'}),
}

const editors = {
  'hero': HeroEditor, 'text': TextEditor, 'image': ImageEditor, 'image-pair': ImagePairEditor,
  'gallery-masonry': GalleryEditor, 'quote': QuoteEditor, 'number': NumberEditor,
  'divider': DividerEditor, 'spacer': SpacerEditor,
}

const titleByType = t => (palette.find(p => p.type === t)?.label) || t
const add = (type) => inner.value.push(defaults[type]())
const duplicate = (block) => inner.value.splice(inner.value.findIndex(b => b.id === block.id) + 1, 0, {
  ...block,
  id: uid()
})
const remove = (id) => inner.value = inner.value.filter(b => b.id !== id)
const move = (from, to) => {
  if (to < 0 || to >= inner.value.length) return
  const [m] = inner.value.splice(from, 1)
  inner.value.splice(to, 0, m)
}

/* ---- SortableJS init (без SSR проблем) ---- */
const listRef = ref(null)
let sortableInstance = null

onMounted(async () => {
  try {
    const mod = await import('sortablejs')
    const Sortable = mod.default || mod
    sortableInstance = Sortable.create(listRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'opacity-50',
      onEnd: (evt) => {
        const {oldIndex, newIndex} = evt
        if (oldIndex === newIndex || oldIndex == null || newIndex == null) return
        move(oldIndex, newIndex)
      }
    })
  } catch (e) {
    // если sortablejs не установлен — просто тихо работаем стрелками
    console.warn('[AboutBuilder] SortableJS недоступен, доступен только реордер стрелками ↑/↓')
  }
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})
</script>

<style scoped>
/* чуть подсветим перетаскивание */
.opacity-50 {
  opacity: .5;
}
</style>
