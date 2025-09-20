<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
    <header
        class="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200/60 dark:border-white/10">
      <div class="h-14 px-4 flex items-center justify-between">
        <button
            class="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            @click="mobileOpen = true"
            aria-label="Открыть меню"
        >
          <el-icon>
            <Menu/>
          </el-icon>
        </button>

        <div class="flex items-center gap-2">
          <div
              class="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white text-xs font-semibold">
            FQ
          </div>
          <span class="font-semibold">Admin</span>
        </div>

        <div class="flex items-center gap-1">
          <el-button circle text @click="openCP = true" aria-label="Поиск">
            <el-icon>
              <Search/>
            </el-icon>
          </el-button>
          <el-button circle text @click="isDark = !isDark" aria-label="Тема">
            <el-icon>
              <component :is="isDark ? Sunny : Moon"/>
            </el-icon>
          </el-button>
          <el-dropdown>
            <button
                class="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Аккаунт">
              <el-icon>
                <User/>
              </el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Профиль</el-dropdown-item>
                <el-dropdown-item divided>Выйти</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <div class="mx-auto flex">
      <aside
          class="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-neutral-900 border-r border-gray-200/60 dark:border-white/10"
          :class="collapsed ? 'w-[84px]' : 'w-[264px]'"
      >
        <div class="h-16 px-4 flex items-center gap-3 border-b border-gray-200/60 dark:border-white/10">
          <div
              class="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white text-sm font-semibold">
            FQ
          </div>
          <div v-if="!collapsed" class="leading-tight">
            <div class="font-semibold">FQ Admin</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">панель управления</div>
          </div>
          <div class="ml-auto">
            <button
                class="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                @click="toggleCollapsed"
                :title="collapsed ? 'Развернуть' : 'Свернуть'"
            >
              <el-icon>
                <Fold v-if="!collapsed"/>
                <Expand v-else/>
              </el-icon>
            </button>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto">
          <el-menu
              router
              :collapse="collapsed"
              :collapse-transition="false"
              :default-active="route.path"
              class="border-0 !rounded-none"
          >
            <template v-for="it in nav" :key="it.to">
              <el-menu-item :index="it.to">
                <el-icon>
                  <component :is="it.icon"/>
                </el-icon>
                <span>{{ it.label }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </nav>

        <div class="border-t border-gray-200/60 dark:border-white/10 p-4 text-[11px] text-gray-500 dark:text-gray-400">
          v{{ appVersion }} · {{ year }}
        </div>
      </aside>

      <el-drawer
          v-model="mobileOpen"
          :with-header="false"
          size="280px"
          custom-class="!p-0"
      >
        <div class="h-16 px-4 flex items-center gap-3 border-b border-gray-200/60">
          <div
              class="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white text-sm font-semibold">
            FQ
          </div>
          <div class="leading-tight">
            <div class="font-semibold">FQ Admin</div>
            <div class="text-xs text-gray-500">панель управления</div>
          </div>
        </div>
        <el-menu
            router
            :default-active="activeIndex"
            class="border-0"
            @select="mobileOpen=false"
        >
          <template v-for="it in nav" :key="it.to">
            <el-menu-item :index="it.to">
              <el-icon>
                <component :is="it.icon"/>
              </el-icon>
              <span>{{ it.label }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-drawer>

      <div class="flex-1 min-w-0">
        <header
            class="hidden lg:block sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/70 backdrop-blur border-b border-gray-200/60 dark:border-white/10">
          <div class="h-16 px-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <NuxtLink to="/admin" class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                Дашборд
              </NuxtLink>
              <span class="text-gray-300 dark:text-white/20">/</span>
              <span class="text-sm text-gray-900 dark:text-white font-medium truncate max-w-[40vw]">
                {{ pageTitle }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <el-tooltip content="Поиск (⌘K)" placement="bottom">
                <el-button circle text @click="openCP = true" aria-label="Поиск">
                  <el-icon>
                    <Search/>
                  </el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip :content="isDark ? 'Светлая тема' : 'Тёмная тема'" placement="bottom">
                <el-button circle text @click="isDark = !isDark" aria-label="Тема">
                  <el-icon>
                    <component :is="isDark ? Sunny : Moon"/>
                  </el-icon>
                </el-button>
              </el-tooltip>

              <el-dropdown>
                <button
                    class="inline-flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                  <el-icon>
                    <User/>
                  </el-icon>
                  <span class="text-sm">Администратор</span>
                  <el-icon>
                    <ArrowDown/>
                  </el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>Профиль</el-dropdown-item>
                    <el-dropdown-item divided>Выйти</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </header>

        <main class="px-4 lg:px-8 py-6">
          <slot/>
        </main>
      </div>
    </div>

    <CommandPalette v-model:open="openCP" :items="paletteItems"/>
  </div>
</template>

<script setup lang="ts">
import {
  Menu, User, ArrowDown, Fold, Expand, Search, Sunny, Moon,
  House, PictureFilled, Collection, List, HomeFilled, Pear, Comment, Box, Reading
} from '@element-plus/icons-vue'
import CommandPalette from '~/components/admin/ui/CommandPalette.vue'

const route = useRoute()
const router = useRouter()

const nav = [
  {label: 'Дашборд', to: '/admin', icon: House},
  {label: 'Баннеры', to: '/admin/banners', icon: PictureFilled},
  {label: 'Коллекции', to: '/admin/collections', icon: Collection},
  {label: 'Подборки', to: '/admin/selections', icon: List},
  {label: 'Главная', to: '/admin/homepages', icon: HomeFilled},
  {label: 'Правила', to: '/admin/rules', icon: Reading},
  {label: 'Блог', to: '/admin/articles', icon: Pear},
  {label: 'About', to: '/admin/about', icon: Comment},
  {label: 'Mail рассылка', to: '/admin/newsletters', icon: Box},
]

const activeIndex = computed(() => {
  const found = nav.find(n => route.path.startsWith(n.to))
  return found ? found.to : route.path
})

const pageTitle = computed(() => (route.meta?.title as string) || 'Панель администратора')

const collapsed = useState<boolean>('admin_sidebar_collapsed', () => false)
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  if (process.client) {
    try {
      localStorage.setItem('fq_admin_sidebar_collapsed', String(collapsed.value))
    } catch {
    }
  }
}
onMounted(() => {
  if (process.client) {
    try {
      const saved = localStorage.getItem('fq_admin_sidebar_collapsed')
      if (saved != null) collapsed.value = saved === 'true'
    } catch {
    }
  }
})

const mobileOpen = ref(false)

const openCP = ref(false)
const paletteItems = computed(() => ([
  {label: 'Дашборд — открыть', to: '/admin', icon: House},
  {label: 'Баннеры — список', to: '/admin/banners', icon: PictureFilled},
  {label: 'Баннер — создать', to: '/admin/banners/create', icon: PictureFilled, description: 'Новый баннер'},
  {label: 'Коллекции — список', to: '/admin/collections', icon: Collection},
  {label: 'Коллекция — создать', to: '/admin/collections/create', icon: Collection},
  {label: 'Подборки — список', to: '/admin/selections', icon: List},
  {label: 'Подборка — создать', to: '/admin/selections/create', icon: List},
  {label: 'Главная — список', to: '/admin/homepages', icon: HomeFilled},
  {label: 'Главная — создать', to: '/admin/homepages/create', icon: HomeFilled},

  {
    label: (isDark.value ? 'Светлая тема' : 'Тёмная тема') + ' — переключить',
    action: () => {
      isDark.value = !isDark.value
    },
    icon: isDark.value ? Sunny : Moon
  }
]))

const isDark = useState<boolean>('fq_theme_dark', () => false)
const applyTheme = () => {
  if (process.client) {
    const el = document.documentElement
    isDark.value ? el.classList.add('dark') : el.classList.remove('dark')
    try {
      localStorage.setItem('fq_theme', isDark.value ? 'dark' : 'light')
    } catch {
    }
  }
}
onMounted(() => {
  if (process.client) {
    try {
      isDark.value = (localStorage.getItem('fq_theme') || 'light') === 'dark'
    } catch {
    }
    applyTheme()
  }
})
watch(isDark, applyTheme)

const appVersion = '1.0.0'
const year = new Date().getFullYear()
</script>

<style scoped>
/* Стили элемента меню под Tailwind + dark */
:deep(.el-menu) {
  --el-menu-item-font-size: 14px;
}

:deep(.el-menu .el-menu-item) {
  margin: 4px 8px;
  border-radius: 10px;
}

:deep(.el-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(99, 102, 241, .12), rgba(139, 92, 246, .12));
  color: #111827;
}

:deep(.dark .el-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(99, 102, 241, .20), rgba(139, 92, 246, .20));
  color: #fff;
}

:deep(.el-menu .el-menu-item:hover) {
  background-color: rgba(17, 24, 39, .06);
}

:deep(.dark .el-menu .el-menu-item:hover) {
  background-color: rgba(255, 255, 255, .06);
}
</style>
