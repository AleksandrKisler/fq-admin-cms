<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <el-form-item label="Заголовок">
      <el-input v-model="model.title" placeholder="Заголовок блока" />
    </el-form-item>

    <el-form-item label="Подзаголовок">
      <el-input v-model="model.subtitle" placeholder="Подзаголовок" />
    </el-form-item>

    <el-form-item label="Выравнивание">
      <el-select v-model="model.align" class="w-full">
        <el-option label="Слева" value="left" />
        <el-option label="По центру" value="center" />
        <el-option label="Справа" value="right" />
      </el-select>
    </el-form-item>

    <!-- картинка -->
    <el-form-item label="Изображение">
      <!-- ваш загрузчик/инпут; оставлю input для наглядности -->
      <el-input v-model="model.image" placeholder="/images/hero.jpg" />
    </el-form-item>

    <el-divider class="md:col-span-2" />

    <!-- Кнопка (CTA) -->
    <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
      <el-form-item label="Показать кнопку">
        <el-switch v-model="model.cta.enabled" />
      </el-form-item>

      <el-form-item v-if="model.cta.enabled" label="Текст кнопки">
        <el-input v-model="model.cta.label" placeholder="Например: Подробнее" />
      </el-form-item>

      <el-form-item v-if="model.cta.enabled" label="Ссылка">
        <el-input v-model="model.cta.href" placeholder="/catalog" />
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import { watchEffect } from 'vue'

// Редактор получает блок через v-model
const model = defineModel({ type: Object, required: true })

// Гарантируем, что cta всегда объект (на случай старых данных)
watchEffect(() => {
  if (!model.value.cta || typeof model.value.cta !== 'object') {
    model.value.cta = { enabled: false, label: '', href: '' }
  } else {
    // защитим обязательные поля
    model.value.cta.enabled ??= false
    model.value.cta.label   ??= ''
    model.value.cta.href    ??= ''
  }
  // дефолт выравнивания
  if (!model.value.align) model.value.align = 'center'
})
</script>
