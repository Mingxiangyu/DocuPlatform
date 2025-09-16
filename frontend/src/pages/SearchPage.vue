<template>
  <DSDefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">搜索</h1>
      <div class="text-center py-12">
        <p class="text-gray-600">搜索页面开发中...</p>
        <p v-if="$route.query.q" class="text-sm text-gray-500 mt-2">
          搜索关键词: {{ $route.query.q }}
        </p>
      </div>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
</script>
