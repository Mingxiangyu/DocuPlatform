<!--
  设计系统导航头部组件 - DSHeader
  基于设计令牌的智能导航头部，集成滚动行为和响应式设计
-->

<template>
  <header
    ref="headerRef"
    :class="headerClasses"
    :style="headerStyles"
    role="banner"
  >
    <!-- 滚动进度条集成区域 -->
    <div
      v-if="showScrollProgress"
      class="scroll-progress-container"
      :style="scrollProgressContainerStyles"
    >
      <div
        class="scroll-progress-bar"
        :style="scrollProgressBarStyles"
      />
    </div>

    <div class="header-container" :style="containerStyles">
      <div class="header-content" :style="contentStyles">
        <!-- Logo区域 -->
        <div class="header-logo" :style="logoContainerStyles">
          <router-link
            to="/"
            class="logo-link"
            :style="logoLinkStyles"
            :aria-label="logoAriaLabel"
          >
            <div class="logo-icon" :style="logoIconStyles">
              <span class="logo-text" :style="logoTextStyles">D</span>
            </div>
            <span class="logo-brand" :style="logoBrandStyles">DocuVault</span>
          </router-link>
        </div>

        <!-- 主导航 -->
        <nav
          class="header-nav"
          :style="navStyles"
          role="navigation"
          aria-label="主导航"
        >
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="navItemClasses"
            :style="getNavItemStyles(item)"
            :aria-current="$route.path === item.path ? 'page' : undefined"
          >
            <span class="nav-item-text">{{ item.label }}</span>
            <div
              v-if="$route.path === item.path"
              class="nav-item-indicator"
              :style="navIndicatorStyles"
            />
          </router-link>
        </nav>

        <!-- 搜索区域 -->
        <div
          v-if="showSearch"
          class="header-search"
          :style="searchContainerStyles"
        >
          <div class="search-input-container" :style="searchInputContainerStyles">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="search-input"
              :style="searchInputStyles"
              :aria-label="searchAriaLabel"
              @keyup.enter="handleSearch"
              @focus="handleSearchFocus"
              @blur="handleSearchBlur"
            />
            <div class="search-icon" :style="searchIconStyles">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 用户操作区域 -->
        <div class="header-actions" :style="actionsStyles">
          <!-- 收藏图标 -->
          <button
            class="action-button"
            :style="actionButtonStyles"
            aria-label="收藏"
            @click="handleFavorites"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          </button>

          <!-- 书签图标 -->
          <button
            class="action-button"
            :style="actionButtonStyles"
            aria-label="书签"
            @click="handleBookmarks"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>

          <!-- 用户头像 (仅在已登录时显示) -->
          <button
            v-if="isAuthenticated"
            class="user-avatar-button"
            :style="userAvatarButtonStyles"
            :aria-label="`用户菜单 - ${user?.name || '用户'}`"
            @click="toggleUserMenu()"
          >
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="user-avatar"
              :style="userAvatarStyles"
            />
            <div
              v-else
              class="user-avatar-placeholder"
              :style="userAvatarPlaceholderStyles"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>

          <!-- 未登录状态 - 隐藏登录注册按钮以匹配原型 -->
          <div v-if="!isAuthenticated" class="auth-actions" :style="authActionsStyles">
            <DSButton
              variant="ghost"
              size="sm"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </DSButton>
            <DSButton
              variant="primary"
              size="sm"
              @click="handleRegister"
              class="register-button"
            >
              注册
            </DSButton>
          </div>

          <!-- 已登录状态 -->
          <div v-else-if="isAuthenticated" class="user-menu" :style="userMenuStyles">
            <!-- 用户下拉菜单 -->
            <div
              v-if="showUserMenu"
              class="user-dropdown"
              :style="userDropdownStyles"
              role="menu"
            >
              <router-link
                v-for="menuItem in userMenuItems"
                :key="menuItem.path"
                :to="menuItem.path"
                class="dropdown-item"
                :style="dropdownItemStyles"
                role="menuitem"
                @click="closeUserMenu"
              >
                <component :is="menuItem.icon" class="dropdown-icon" />
                <span>{{ menuItem.label }}</span>
              </router-link>
              <hr class="dropdown-divider" :style="dropdownDividerStyles" />
              <button
                class="dropdown-item logout-item"
                :style="dropdownItemStyles"
                role="menuitem"
                @click="handleLogout"
              >
                <svg class="dropdown-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>

          <!-- 移动端菜单按钮 - 隐藏以匹配原型 -->
          <button
            v-if="false"
            class="mobile-menu-button"
            :style="mobileMenuButtonStyles"
            :aria-label="showMobileMenu ? '关闭菜单' : '打开菜单'"
            :aria-expanded="showMobileMenu"
            @click="toggleMobileMenu"
          >
            <svg
              v-if="!showMobileMenu"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div
      v-if="showMobileMenu"
      class="mobile-menu"
      :style="mobileMenuStyles"
      role="navigation"
      aria-label="移动端导航"
    >
      <div class="mobile-nav" :style="mobileNavStyles">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-item"
          :style="mobileNavItemStyles"
          @click="closeMobileMenu"
        >
          {{ item.label }}
        </router-link>
      </div>

      <!-- 移动端搜索 -->
      <div v-if="showSearch" class="mobile-search" :style="mobileSearchStyles">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="mobile-search-input"
          :style="mobileSearchInputStyles"
          @keyup.enter="handleSearchAndCloseMobile"
        />
      </div>

      <!-- 移动端用户操作 -->
      <div class="mobile-actions" :style="mobileActionsStyles">
        <div v-if="!isAuthenticated" class="mobile-auth-actions">
          <DSButton
            variant="outline"
            size="md"
            @click="handleLoginAndCloseMobile"
            class="mobile-login-button"
          >
            登录
          </DSButton>
          <DSButton
            variant="primary"
            size="md"
            @click="handleRegisterAndCloseMobile"
            class="mobile-register-button"
          >
            注册
          </DSButton>
        </div>
        <div v-else class="mobile-user-actions">
          <router-link
            v-for="menuItem in userMenuItems"
            :key="menuItem.path"
            :to="menuItem.path"
            class="mobile-user-item"
            :style="mobileUserItemStyles"
            @click="closeMobileMenu"
          >
            <component :is="menuItem.icon" class="mobile-user-icon" />
            <span>{{ menuItem.label }}</span>
          </router-link>
          <button
            class="mobile-logout-button"
            :style="mobileLogoutButtonStyles"
            @click="handleLogoutAndCloseMobile"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDesignTokens, useScrollProgress } from '../../design-system/composables'
import { useAuthStore } from '../../stores/auth'
import DSButton from '../atoms/DSButton.vue'

// 导航项接口
interface NavigationItem {
  path: string
  label: string
  icon?: any
}

// 用户菜单项接口
interface UserMenuItem {
  path: string
  label: string
  icon: any
}

// 组件属性接口
interface Props {
  showSearch?: boolean
  showScrollProgress?: boolean
  searchPlaceholder?: string
  logoAriaLabel?: string
  searchAriaLabel?: string
  sticky?: boolean
  transparent?: boolean
  elevation?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showScrollProgress: false,
  searchPlaceholder: '搜索文章、作者...',
  logoAriaLabel: 'DocuVault 首页',
  searchAriaLabel: '搜索内容',
  sticky: true,
  transparent: false,
  elevation: 'sm'
})

// 事件定义
const emit = defineEmits<{
  search: [query: string]
  login: []
  register: []
  logout: []
}>()

// 路由和状态
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const { progress: scrollProgress } = useScrollProgress()

// 强制滚动进度更新（修复进度条不更新的问题）
const forceScrollProgress = ref(0)

const updateScrollProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = window.innerHeight
  const maxScroll = scrollHeight - clientHeight
  forceScrollProgress.value = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
}

onMounted(() => {
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})

// 组件引用
const headerRef = ref<HTMLElement | null>(null)

// 状态管理
const searchQuery = ref('')
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const searchFocused = ref(false)

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 导航项配置
const navigationItems: NavigationItem[] = [
  { path: '/', label: '首页' },
  { path: '/categories', label: '分类' },
  { path: '/articles?sort=popular', label: '热门' },
  { path: '/articles?sort=latest', label: '最新' },
  { path: '/about', label: '关于' }
]

// 用户菜单项配置
const userMenuItems: UserMenuItem[] = [
  {
    path: '/profile',
    label: '个人中心',
    icon: { template: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>' }
  },
  {
    path: '/profile/notes',
    label: '我的笔记',
    icon: { template: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L16 11.586V5a2 2 0 00-2-2v1a1 1 0 01-1 1H7a1 1 0 01-1-1V3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H6V5z" clip-rule="evenodd" /></svg>' }
  },
  {
    path: '/profile/purchases',
    label: '我的购买',
    icon: { template: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" /></svg>' }
  }
]

// 样式计算
const headerClasses = computed(() => [
  'ds-header',
  'transition-all',
  'duration-300',
  'ease-out',
  {
    'ds-header-sticky': props.sticky,
    'ds-header-transparent': props.transparent,
    'ds-header-elevated': props.elevation !== 'none'
  }
])

const headerStyles = computed(() => {
  const styles: Record<string, string> = {
    backgroundColor: props.transparent ? 'transparent' : 'white',
    borderBottom: props.transparent ? 'none' : `1px solid ${getColor('gray.200')}`,
    position: props.sticky ? 'sticky' : 'relative',
    top: props.sticky ? '0' : 'auto',
    zIndex: '50'
  }

  if (props.elevation !== 'none') {
    const shadowMap = {
      sm: getShadow('soft'),
      md: getShadow('medium'),
      lg: getShadow('large')
    }
    styles.boxShadow = shadowMap[props.elevation]
  }

  return styles
})

// 滚动进度条样式
const scrollProgressContainerStyles = computed(() => ({
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  height: '3px',
  backgroundColor: getColor('gray.100'),
  zIndex: '1000'
}))

const scrollProgressBarStyles = computed(() => ({
  height: '100%',
  width: `${forceScrollProgress.value}%`,
  background: `linear-gradient(90deg, rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)`,
  transition: 'width 0.3s ease-out',
  transformOrigin: 'left center'
}))

// 容器和内容样式
const containerStyles = computed(() => ({
  maxWidth: '1280px',
  margin: '0 auto',
  padding: `0 ${getSpacing(4)}`
}))

const contentStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '64px'
}))

// Logo相关样式
const logoContainerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center'
}))

const logoLinkStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  transition: 'opacity 0.2s ease'
}))

const logoIconStyles = computed(() => ({
  width: '32px',
  height: '32px',
  backgroundColor: getColor('primary.600'),
  borderRadius: tokens.borderRadius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const logoTextStyles = computed(() => ({
  color: 'white',
  fontWeight: tokens.typography.fontWeight.bold,
  fontSize: tokens.typography.fontSize.lg[0]
}))

const logoBrandStyles = computed(() => ({
  marginLeft: getSpacing(2),
  fontSize: tokens.typography.fontSize.xl[0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900')
}))

// 导航相关样式
const navStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(8)
}))

const navItemClasses = computed(() => [
  'nav-item',
  'relative',
  'px-3',
  'py-2',
  'rounded-md',
  'text-sm',
  'font-medium',
  'transition-colors',
  'duration-200',
  'hover:text-purple-600'
])

const getNavItemStyles = (item: NavigationItem) => {
  const isActive = route.path === item.path
  return {
    color: isActive ? getColor('primary.600') : getColor('gray.600'),
    textDecoration: 'none'
  }
}

const navIndicatorStyles = computed(() => ({
  position: 'absolute',
  bottom: '-2px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '20px',
  height: '2px',
  backgroundColor: getColor('primary.600'),
  borderRadius: '1px'
}))

// 搜索相关样式
const searchContainerStyles = computed(() => ({
  display: 'flex',
  flex: '1',
  maxWidth: '512px',
  margin: `0 ${getSpacing(8)}`
}))

const searchInputContainerStyles = computed(() => ({
  position: 'relative',
  width: '100%'
}))

const searchInputStyles = computed(() => ({
  width: '100%',
  paddingLeft: getSpacing(10),
  paddingRight: getSpacing(4),
  paddingTop: getSpacing(2),
  paddingBottom: getSpacing(2),
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.typography.fontSize.sm[0],
  transition: 'all 0.2s ease',
  outline: 'none',
  backgroundColor: 'white'
}))

const searchIconStyles = computed(() => ({
  position: 'absolute',
  left: getSpacing(3),
  top: '50%',
  transform: 'translateY(-50%)',
  color: getColor('gray.400'),
  pointerEvents: 'none'
}))

// 操作区域样式
const actionsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4)
}))

const actionButtonStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'transparent',
  color: getColor('gray.600'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: getColor('gray.100'),
    color: getColor('gray.900')
  }
}))

const authActionsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3)
}))

const userMenuStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4)
}))

// 用户相关样式
const userAvatarButtonStyles = computed(() => ({
  padding: '2px',
  borderRadius: tokens.borderRadius.full,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

const userAvatarStyles = computed(() => ({
  width: '32px',
  height: '32px',
  borderRadius: tokens.borderRadius.full,
  objectFit: 'cover'
}))

const userAvatarPlaceholderStyles = computed(() => ({
  width: '32px',
  height: '32px',
  borderRadius: tokens.borderRadius.full,
  backgroundColor: getColor('primary.600'),
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium
}))

// 下拉菜单样式
const userDropdownStyles = computed(() => ({
  position: 'absolute',
  top: '100%',
  right: '0',
  marginTop: getSpacing(2),
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: getShadow('large'),
  border: `1px solid ${getColor('gray.200')}`,
  minWidth: '200px',
  zIndex: '100',
  overflow: 'hidden'
}))

const dropdownItemStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  color: getColor('gray.700'),
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.sm[0],
  transition: 'background-color 0.2s ease',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer'
}))

const dropdownDividerStyles = computed(() => ({
  margin: '0',
  border: 'none',
  borderTop: `1px solid ${getColor('gray.200')}`
}))

// 移动端样式
const mobileMenuButtonStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(2),
  borderRadius: tokens.borderRadius.md,
  border: 'none',
  backgroundColor: 'transparent',
  color: getColor('gray.600'),
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

const mobileMenuStyles = computed(() => ({
  display: 'block',
  backgroundColor: 'white',
  borderTop: `1px solid ${getColor('gray.200')}`
}))

const mobileNavStyles = computed(() => ({
  padding: getSpacing(4)
}))

const mobileNavItemStyles = computed(() => ({
  display: 'block',
  padding: `${getSpacing(3)} 0`,
  color: getColor('gray.700'),
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  borderBottom: `1px solid ${getColor('gray.100')}`,
  transition: 'color 0.2s ease'
}))

const mobileSearchStyles = computed(() => ({
  padding: `0 ${getSpacing(4)} ${getSpacing(4)}`
}))

const mobileSearchInputStyles = computed(() => ({
  width: '100%',
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.typography.fontSize.base[0],
  outline: 'none'
}))

const mobileActionsStyles = computed(() => ({
  padding: getSpacing(4),
  borderTop: `1px solid ${getColor('gray.200')}`
}))

const mobileUserItemStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  padding: `${getSpacing(3)} 0`,
  color: getColor('gray.700'),
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.base[0],
  borderBottom: `1px solid ${getColor('gray.100')}`,
  transition: 'color 0.2s ease'
}))

const mobileLogoutButtonStyles = computed(() => ({
  width: '100%',
  padding: `${getSpacing(3)} 0`,
  marginTop: getSpacing(2),
  border: 'none',
  backgroundColor: 'transparent',
  color: getColor('error.600'),
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'color 0.2s ease'
}))

// 事件处理函数
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const handleSearchFocus = () => {
  searchFocused.value = true
}

const handleSearchBlur = () => {
  searchFocused.value = false
}

const handleLogin = () => {
  emit('login')
  router.push('/login')
}

const handleRegister = () => {
  emit('register')
  router.push('/register')
}

const handleFavorites = () => {
  router.push('/favorites')
}

const handleBookmarks = () => {
  router.push('/bookmarks')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    emit('logout')
    closeUserMenu()
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// 移动端组合事件处理
const handleSearchAndCloseMobile = () => {
  handleSearch()
  closeMobileMenu()
}

const handleLoginAndCloseMobile = () => {
  handleLogin()
  closeMobileMenu()
}

const handleRegisterAndCloseMobile = () => {
  handleRegister()
  closeMobileMenu()
}

const handleLogoutAndCloseMobile = () => {
  handleLogout()
  closeMobileMenu()
}

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (headerRef.value && !headerRef.value.contains(target)) {
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

// 监听路由变化关闭菜单
watch(route, () => {
  showUserMenu.value = false
  showMobileMenu.value = false
})
</script>

<style scoped>
.ds-header {
  will-change: transform, box-shadow;
}

.ds-header-sticky {
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-item:hover .nav-item-text {
  color: var(--color-primary-600);
}

.search-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.user-avatar-button:hover,
.mobile-menu-button:hover {
  background-color: var(--color-gray-100);
}

.dropdown-item:hover {
  background-color: var(--color-gray-50);
}

.mobile-nav-item:hover,
.mobile-user-item:hover {
  color: var(--color-primary-600);
}

.mobile-logout-button:hover {
  color: var(--color-error-700);
}

/* 响应式隐藏/显示 */
@media (min-width: 768px) {
  .mobile-menu-button {
    display: none;
  }

  .mobile-menu {
    display: none;
  }

  .header-nav {
    display: flex;
  }

  .header-search {
    display: block;
  }
}

@media (max-width: 767px) {
  .header-nav {
    display: none;
  }

  .header-search {
    display: none;
  }
}

/* 动画 */
.mobile-menu {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-dropdown {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .ds-header,
  .mobile-menu,
  .user-dropdown,
  .nav-item,
  .search-input,
  .user-avatar-button,
  .mobile-menu-button {
    transition: none !important;
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-header {
    border-bottom: 2px solid currentColor;
  }

  .search-input {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .ds-header {
    position: static;
    box-shadow: none;
    border-bottom: 1px solid #000;
  }

  .header-search,
  .header-actions,
  .mobile-menu {
    display: none;
  }
}
</style>
