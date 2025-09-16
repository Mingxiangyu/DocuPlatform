<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 滚动进度条 -->
    <DSScrollProgress
      position="top"
      :height="3"
      :animated="true"
      :gradient="true"
      :smooth="true"
      :visible="showScrollProgress"
      aria-label="页面滚动进度"
    />

    <!-- Header -->
    <DSHeader
      :show-search="true"
      :show-scroll-progress="showScrollProgress"
      :sticky="true"
      elevation="sm"
      @search="handleSearch"
      @login="handleLogin"
      @register="handleRegister"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">D</span>
              </div>
              <span class="ml-2 text-xl font-bold text-gray-900">DocuVault</span>
            </div>
            <p class="text-gray-600 mb-4">
              专业的知识付费平台，为创作者和读者提供优质的内容分享体验。
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-purple-600">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-purple-600">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              快速链接
            </h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/about" class="text-gray-600 hover:text-purple-600">
                  关于我们
                </router-link>
              </li>
              <li>
                <router-link to="/help" class="text-gray-600 hover:text-purple-600">
                  帮助中心
                </router-link>
              </li>
              <li>
                <router-link to="/contact" class="text-gray-600 hover:text-purple-600">
                  联系我们
                </router-link>
              </li>
              <li>
                <router-link to="/careers" class="text-gray-600 hover:text-purple-600">
                  加入我们
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              法律信息
            </h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/privacy" class="text-gray-600 hover:text-purple-600">
                  隐私政策
                </router-link>
              </li>
              <li>
                <router-link to="/terms" class="text-gray-600 hover:text-purple-600">
                  服务条款
                </router-link>
              </li>
              <li>
                <router-link to="/copyright" class="text-gray-600 hover:text-purple-600">
                  版权声明
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-center text-gray-500 text-sm">
            © 2024 DocuVault. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>

    <!-- Global Loading -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span class="text-gray-700">加载中...</span>
      </div>
    </div>

    <!-- Global Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          'transform transition-all duration-300 ease-in-out'
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg
                v-if="notification.type === 'success'"
                class="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg
                v-else-if="notification.type === 'error'"
                class="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg
                v-else
                class="h-6 w-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import DSHeader from '../organisms/DSHeader.vue'
import DSScrollProgress from '../atoms/DSScrollProgress.vue'
import { eventBus } from '../../utils/EventBus'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const isLoading = ref(false)
const notifications = ref<Notification[]>([])

// 滚动进度条显示控制
const showScrollProgress = computed(() => {
  // 可以根据路由或其他条件控制显示
  return true
})

// Header事件处理
const handleSearch = (query: string) => {
  console.log('搜索:', query)
  // 可以在这里添加搜索逻辑
}

const handleLogin = () => {
  console.log('跳转到登录页面')
}

const handleRegister = () => {
  console.log('跳转到注册页面')
}

const handleLogout = () => {
  console.log('用户退出登录')
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newNotification = { ...notification, id }
  
  notifications.value.push(newNotification)
  
  // 自动移除通知
  const duration = notification.duration || 5000
  setTimeout(() => {
    removeNotification(id)
  }, duration)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 监听全局事件
onMounted(() => {
  // 监听加载状态
  eventBus.on('ui:loading-start', () => {
    isLoading.value = true
  })
  
  eventBus.on('ui:loading-end', () => {
    isLoading.value = false
  })
  
  // 监听通知事件
  eventBus.on('ui:notification', (payload) => {
    addNotification(payload)
  })
})

onUnmounted(() => {
  eventBus.clear()
})
</script>
