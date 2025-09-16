<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="text-center">
      <div class="flex justify-center mb-8">
        <div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.881-6.127 2.325.473-.497 1.169-.825 1.927-.825h8.4c.758 0 1.454.328 1.927.825A7.962 7.962 0 0112 15z"/>
          </svg>
        </div>
      </div>
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">页面未找到</h2>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
      </p>
      
      <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <Button
          variant="primary"
          size="lg"
          @click="$router.push('/')"
        >
          返回首页
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          @click="$router.go(-1)"
        >
          返回上页
        </Button>
      </div>
      
      <div class="mt-12">
        <h3 class="text-lg font-medium text-gray-900 mb-4">您可能在寻找：</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <router-link
            to="/articles"
            class="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div class="text-purple-600 mb-2">
              <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h4 class="font-medium text-gray-900">文章列表</h4>
            <p class="text-sm text-gray-600">浏览所有文章</p>
          </router-link>
          
          <router-link
            to="/collections"
            class="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div class="text-purple-600 mb-2">
              <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <h4 class="font-medium text-gray-900">合集</h4>
            <p class="text-sm text-gray-600">发现精选合集</p>
          </router-link>
          
          <router-link
            to="/search"
            class="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div class="text-purple-600 mb-2">
              <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h4 class="font-medium text-gray-900">搜索</h4>
            <p class="text-sm text-gray-600">搜索感兴趣的内容</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../components/atoms/Button.vue'
</script>
