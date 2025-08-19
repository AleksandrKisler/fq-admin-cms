<template>
  <div class="sticky bottom-4 z-10 shadow rounded-2xl">
    <div class="backdrop-blur bg-white/70 border-t border-gray-100 rounded-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div class="text-xs text-gray-500"><slot name="meta" /></div>
        <div class="flex items-center gap-2"><slot /></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
