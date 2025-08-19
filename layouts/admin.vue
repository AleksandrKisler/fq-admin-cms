<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-64 bg-white border-r">
      <div class="px-4 py-4 font-semibold">FQ Admin</div>
      <el-menu router :default-active="$route.path" class="border-t">
        <el-menu-item index="/admin">Дашборд</el-menu-item>
        <el-menu-item index="/admin/banners">Баннеры</el-menu-item>
        <el-menu-item index="/admin/collections">Коллекции</el-menu-item>
        <el-menu-item index="/admin/selections">Подборки</el-menu-item>
        <el-menu-item index="/admin/homepages">Главная</el-menu-item>
      </el-menu>
    </aside>
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
