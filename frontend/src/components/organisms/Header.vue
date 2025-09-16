<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">D</span>
            </div>
            <span class="ml-2 text-xl font-bold text-gray-900">DocuVault</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-purple-600"
          >
            首页
          </router-link>
          <router-link
            to="/articles"
            class="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-purple-600"
          >
            文章
          </router-link>
          <router-link
            to="/collections"
            class="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-purple-600"
          >
            合集
          </router-link>
        </nav>

        <!-- Search -->
        <div class="hidden md:flex flex-1 max-w-lg mx-8">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章、作者..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              @keyup.enter="handleSearch"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <!-- Notifications -->
            <button class="text-gray-600 hover:text-purple-600 relative">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.5L6.5 7.5 10.5 11.5"/>
              </svg>
              <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ notificationCount }}
              </span>
            </button>

            <!-- User Dropdown -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
              >
                <img
                  v-if="user?.avatarUrl"
                  :src="user.avatarUrl"
                  :alt="user.nickname"
                  class="h-8 w-8 rounded-full"
                />
                <div v-else class="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user?.nickname?.charAt(0) }}
                  </span>
                </div>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  个人资料
                </router-link>
                <router-link
                  to="/my-articles"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  我的文章
                </router-link>
                <router-link
                  to="/my-notes"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  我的笔记
                </router-link>
                <router-link
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  设置
                </router-link>
                <hr class="my-1">
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <Button variant="ghost" size="sm" @click="$router.push('/login')">
              登录
            </Button>
            <Button variant="primary" size="sm" @click="$router.push('/register')">
              注册
            </Button>
          </template>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden text-gray-600 hover:text-purple-600"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-show="showMobileMenu" class="md:hidden border-t border-gray-200 pt-4 pb-3">
        <div class="space-y-1">
          <router-link
            to="/"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-purple-600"
            @click="showMobileMenu = false"
          >
            首页
          </router-link>
          <router-link
            to="/articles"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-purple-600"
            @click="showMobileMenu = false"
          >
            文章
          </router-link>
          <router-link
            to="/collections"
            class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-purple-600"
            @click="showMobileMenu = false"
          >
            合集
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Button from '../atoms/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const notificationCount = ref(0)
const userMenuRef = ref<HTMLElement>()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

// 点击外部关闭用户菜单
const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
