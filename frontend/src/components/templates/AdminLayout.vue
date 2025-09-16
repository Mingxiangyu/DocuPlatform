<template>
  <div class="admin-layout min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <i class="fas fa-shield-alt text-white text-sm"></i>
              </div>
              <h1 class="text-xl font-bold text-gray-900 font-serif">DocuVault</h1>
              <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                管理后台
              </span>
            </div>
          </div>
          
          <!-- 用户操作 -->
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              前台首页
            </router-link>
            <div class="relative" ref="userMenuRef">
              <button 
                @click="toggleUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <img 
                  v-if="user?.avatarUrl"
                  :src="user.avatarUrl"
                  :alt="user.nickname"
                  class="w-8 h-8 rounded-full border-2 border-purple-100"
                />
                <div 
                  v-else
                  class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-2 border-purple-100"
                >
                  <span class="text-white text-sm font-medium">
                    {{ user?.nickname?.charAt(0) }}
                  </span>
                </div>
                <span class="text-sm font-medium">{{ user?.nickname }}</span>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              <div 
                v-show="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  个人设置
                </router-link>
                <router-link 
                  to="/settings" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  修改密码
                </router-link>
                <hr class="my-1">
                <button 
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="flex flex-1">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar w-72 bg-white border-r border-gray-200 shadow-sm min-h-[calc(100vh-64px)]">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">管理功能</h3>
          <nav class="space-y-2">
            <button
              v-for="item in menuItems"
              :key="item.key"
              @click="activeTab = item.key"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-colors duration-300 text-left',
                activeTab === item.key 
                  ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-500' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <i :class="[item.icon, 'w-5 text-center']"></i>
              <span>{{ item.label }}</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-6">
        <!-- 面包屑导航 -->
        <div class="mb-6">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <div class="flex items-center">
                  <i class="fas fa-home text-gray-400"></i>
                  <span class="ml-2 text-sm font-medium text-gray-500">管理后台</span>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                  <span class="text-sm font-medium text-gray-900">
                    {{ currentMenuItem?.label }}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <!-- 动态内容区域 -->
        <slot :activeTab="activeTab" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

// Props
interface Props {
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'articles'
})

// 状态
const authStore = useAuthStore()
const router = useRouter()
const activeTab = ref(props.defaultTab)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

// 计算属性
const user = computed(() => authStore.user)

const menuItems = computed(() => {
  const items = [
    { key: 'articles', label: '文章管理', icon: 'fas fa-file-alt' },
    { key: 'users', label: '用户管理', icon: 'fas fa-users' },
    { key: 'orders', label: '订单管理', icon: 'fas fa-shopping-cart' },
    { key: 'collections', label: '合集管理', icon: 'fas fa-layer-group' },
    { key: 'stats', label: '数据统计', icon: 'fas fa-chart-bar' },
    { key: 'settings', label: '系统设置', icon: 'fas fa-cog' }
  ]

  // 根据权限过滤菜单项
  if (!authStore.isAdmin) {
    return items.filter(item => 
      !['users', 'orders', 'settings'].includes(item.key)
    )
  }

  return items
})

const currentMenuItem = computed(() => 
  menuItems.value.find(item => item.key === activeTab.value)
)

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露给父组件
defineExpose({
  activeTab
})
</script>

<style scoped>
.admin-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.admin-sidebar {
  min-height: calc(100vh - 64px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    position: fixed;
    top: 64px;
    left: 0;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .admin-sidebar.open {
    transform: translateX(0);
  }
}
</style>
