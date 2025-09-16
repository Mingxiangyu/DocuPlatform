<!--
  设计系统管理后台布局组件 - DSAdminLayout
  企业级管理后台布局，支持侧边栏、顶部导航、面包屑、响应式设计
-->

<template>
  <div class="admin-layout" :style="layoutStyles">
    <!-- 侧边栏 -->
    <aside
      class="admin-sidebar"
      :style="sidebarStyles"
      :class="sidebarClasses"
    >
      <!-- 侧边栏头部 -->
      <div class="sidebar-header" :style="sidebarHeaderStyles">
        <slot name="sidebar-header">
          <div class="logo-section" :style="logoSectionStyles">
            <div class="logo" :style="logoStyles">
              <slot name="logo">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </slot>
            </div>
            <div v-if="!collapsed" class="brand-text" :style="brandTextStyles">
              <h1 class="brand-title" :style="brandTitleStyles">
                {{ brandTitle }}
              </h1>
              <p v-if="brandSubtitle" class="brand-subtitle" :style="brandSubtitleStyles">
                {{ brandSubtitle }}
              </p>
            </div>
          </div>
        </slot>
      </div>

      <!-- 侧边栏导航 -->
      <nav class="sidebar-nav" :style="sidebarNavStyles">
        <slot name="sidebar-nav" :collapsed="collapsed">
          <ul class="nav-list" :style="navListStyles">
            <li
              v-for="item in menuItems"
              :key="item.key"
              class="nav-item"
              :style="navItemStyles"
            >
              <a
                :href="item.href"
                class="nav-link"
                :style="getNavLinkStyles(item)"
                :class="{ 'is-active': item.active }"
                @click="handleMenuClick(item)"
              >
                <div class="nav-icon" :style="navIconStyles">
                  <component :is="item.icon" />
                </div>
                <span v-if="!collapsed" class="nav-text" :style="navTextStyles">
                  {{ item.label }}
                </span>
                <div
                  v-if="item.badge && !collapsed"
                  class="nav-badge"
                  :style="navBadgeStyles"
                >
                  {{ item.badge }}
                </div>
              </a>

              <!-- 子菜单 -->
              <ul
                v-if="item.children && !collapsed && item.expanded"
                class="sub-nav-list"
                :style="subNavListStyles"
              >
                <li
                  v-for="child in item.children"
                  :key="child.key"
                  class="sub-nav-item"
                  :style="subNavItemStyles"
                >
                  <a
                    :href="child.href"
                    class="sub-nav-link"
                    :style="getSubNavLinkStyles(child)"
                    :class="{ 'is-active': child.active }"
                    @click="handleMenuClick(child)"
                  >
                    <span class="sub-nav-text">{{ child.label }}</span>
                    <div
                      v-if="child.badge"
                      class="sub-nav-badge"
                      :style="subNavBadgeStyles"
                    >
                      {{ child.badge }}
                    </div>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </slot>
      </nav>

      <!-- 侧边栏底部 -->
      <div class="sidebar-footer" :style="sidebarFooterStyles">
        <slot name="sidebar-footer" :collapsed="collapsed">
          <button
            class="collapse-button"
            :style="collapseButtonStyles"
            @click="handleToggleCollapse"
            :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 20 20"
              :style="collapseIconStyles"
            >
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </slot>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="admin-main" :style="mainStyles">
      <!-- 顶部导航栏 -->
      <header class="admin-header" :style="headerStyles">
        <div class="header-left" :style="headerLeftStyles">
          <slot name="header-left">
            <!-- 移动端菜单按钮 -->
            <button
              class="mobile-menu-button"
              :style="mobileMenuButtonStyles"
              @click="handleToggleMobileMenu"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- 面包屑导航 -->
            <nav v-if="breadcrumbs.length > 0" class="breadcrumb-nav" :style="breadcrumbNavStyles">
              <ol class="breadcrumb-list" :style="breadcrumbListStyles">
                <li
                  v-for="(crumb, index) in breadcrumbs"
                  :key="index"
                  class="breadcrumb-item"
                  :style="breadcrumbItemStyles"
                >
                  <a
                    v-if="crumb.href && index < breadcrumbs.length - 1"
                    :href="crumb.href"
                    class="breadcrumb-link"
                    :style="breadcrumbLinkStyles"
                  >
                    {{ crumb.label }}
                  </a>
                  <span v-else class="breadcrumb-current" :style="breadcrumbCurrentStyles">
                    {{ crumb.label }}
                  </span>
                  <span
                    v-if="index < breadcrumbs.length - 1"
                    class="breadcrumb-separator"
                    :style="breadcrumbSeparatorStyles"
                  >
                    /
                  </span>
                </li>
              </ol>
            </nav>
          </slot>
        </div>

        <div class="header-right" :style="headerRightStyles">
          <slot name="header-right">
            <!-- 用户菜单 -->
            <div class="user-menu" :style="userMenuStyles">
              <button class="user-button" :style="userButtonStyles">
                <div class="user-avatar" :style="userAvatarStyles">
                  <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    :alt="userName"
                    class="avatar-image"
                    :style="avatarImageStyles"
                  />
                  <div v-else class="avatar-placeholder" :style="avatarPlaceholderStyles">
                    {{ userName?.charAt(0)?.toUpperCase() }}
                  </div>
                </div>
                <span v-if="userName" class="user-name" :style="userNameStyles">
                  {{ userName }}
                </span>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" :style="userDropdownIconStyles">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </slot>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="admin-content" :style="contentStyles">
        <slot />
      </main>

      <!-- 页脚 -->
      <footer v-if="showFooter" class="admin-footer" :style="footerStyles">
        <slot name="footer">
          <p class="footer-text" :style="footerTextStyles">
            © 2024 {{ brandTitle }}. All rights reserved.
          </p>
        </slot>
      </footer>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      :style="mobileOverlayStyles"
      @click="handleCloseMobileMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 菜单项接口
interface MenuItem {
  key: string
  label: string
  href?: string
  icon?: any
  badge?: string | number
  active?: boolean
  expanded?: boolean
  children?: MenuItem[]
}

// 面包屑接口
interface Breadcrumb {
  label: string
  href?: string
}

// 组件属性
interface Props {
  // 基础配置
  brandTitle?: string
  brandSubtitle?: string
  
  // 菜单配置
  menuItems?: MenuItem[]
  breadcrumbs?: Breadcrumb[]
  
  // 用户信息
  userName?: string
  userAvatar?: string
  
  // 布局配置
  collapsed?: boolean
  sidebarWidth?: string
  collapsedWidth?: string
  showFooter?: boolean
  
  // 响应式配置
  mobileBreakpoint?: number
}

const props = withDefaults(defineProps<Props>(), {
  brandTitle: 'Admin Panel',
  menuItems: () => [],
  breadcrumbs: () => [],
  collapsed: false,
  sidebarWidth: '280px',
  collapsedWidth: '80px',
  showFooter: true,
  mobileBreakpoint: 768
})

// 组件事件
interface Emits {
  (e: 'menu-click', item: MenuItem): void
  (e: 'toggle-collapse'): void
  (e: 'toggle-mobile-menu'): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const mobileMenuOpen = ref(false)

// 计算属性
const sidebarClasses = computed(() => [
  'admin-sidebar',
  {
    'is-collapsed': props.collapsed,
    'is-mobile-open': mobileMenuOpen.value
  }
])

// 样式计算
const layoutStyles = computed(() => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: getColor('gray.100'),
  fontFamily: tokens.typography.fontFamily.sans.join(', ')
}))

const sidebarStyles = computed(() => ({
  width: props.collapsed ? props.collapsedWidth : props.sidebarWidth,
  backgroundColor: getColor('gray.900'),
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  transition: 'width 0.3s ease',
  position: 'relative',
  zIndex: '1000',
  boxShadow: getShadow('large')
}))

const sidebarHeaderStyles = computed(() => ({
  padding: getSpacing(4),
  borderBottom: `1px solid ${getColor('gray.700')}`
}))

const logoSectionStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3)
}))

const logoStyles = computed(() => ({
  flexShrink: '0',
  color: getColor('primary.400')
}))

const brandTextStyles = computed(() => ({
  minWidth: '0'
}))

const brandTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: 'white',
  margin: '0'
}))

const brandSubtitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.400'),
  margin: '0'
}))

const sidebarNavStyles = computed(() => ({
  flex: '1',
  overflow: 'auto',
  padding: getSpacing(2)
}))

const navListStyles = computed(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0'
}))

const navItemStyles = computed(() => ({
  marginBottom: getSpacing(1)
}))

const getNavLinkStyles = (item: MenuItem) => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  padding: getSpacing(3),
  color: item.active ? 'white' : getColor('gray.300'),
  backgroundColor: item.active ? getColor('primary.600') : 'transparent',
  borderRadius: tokens.borderRadius.md,
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  cursor: 'pointer'
})

const navIconStyles = computed(() => ({
  flexShrink: '0',
  width: '20px',
  height: '20px'
}))

const navTextStyles = computed(() => ({
  flex: '1',
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium
}))

const navBadgeStyles = computed(() => ({
  padding: `${getSpacing(0.5)} ${getSpacing(1.5)}`,
  backgroundColor: getColor('error.600'),
  color: 'white',
  fontSize: tokens.typography.fontSize.xs[0],
  borderRadius: tokens.borderRadius.full,
  minWidth: '20px',
  textAlign: 'center'
}))

const subNavListStyles = computed(() => ({
  listStyle: 'none',
  padding: '0',
  margin: `${getSpacing(2)} 0 0 ${getSpacing(8)}`
}))

const subNavItemStyles = computed(() => ({
  marginBottom: getSpacing(1)
}))

const getSubNavLinkStyles = (item: MenuItem) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${getSpacing(2)} ${getSpacing(3)}`,
  color: item.active ? 'white' : getColor('gray.400'),
  backgroundColor: item.active ? getColor('primary.700') : 'transparent',
  borderRadius: tokens.borderRadius.sm,
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.sm[0],
  transition: 'all 0.2s ease',
  cursor: 'pointer'
})

const subNavBadgeStyles = computed(() => ({
  padding: `${getSpacing(0.5)} ${getSpacing(1)}`,
  backgroundColor: getColor('error.600'),
  color: 'white',
  fontSize: tokens.typography.fontSize.xs[0],
  borderRadius: tokens.borderRadius.full,
  minWidth: '16px',
  textAlign: 'center'
}))

const sidebarFooterStyles = computed(() => ({
  padding: getSpacing(4),
  borderTop: `1px solid ${getColor('gray.700')}`
}))

const collapseButtonStyles = computed(() => ({
  width: '100%',
  padding: getSpacing(2),
  backgroundColor: 'transparent',
  border: `1px solid ${getColor('gray.700')}`,
  color: getColor('gray.300'),
  borderRadius: tokens.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const collapseIconStyles = computed(() => ({
  transform: props.collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s ease'
}))

const mainStyles = computed(() => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}))

const headerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${getSpacing(4)} ${getSpacing(6)}`,
  backgroundColor: 'white',
  borderBottom: `1px solid ${getColor('gray.200')}`,
  boxShadow: getShadow('small')
}))

const headerLeftStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4)
}))

const headerRightStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4)
}))

const mobileMenuButtonStyles = computed(() => ({
  display: 'none',
  padding: getSpacing(2),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.600'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.md
}))

const breadcrumbNavStyles = computed(() => ({}))

const breadcrumbListStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  listStyle: 'none',
  padding: '0',
  margin: '0'
}))

const breadcrumbItemStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center'
}))

const breadcrumbLinkStyles = computed(() => ({
  color: getColor('primary.600'),
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.sm[0],
  transition: 'color 0.2s ease'
}))

const breadcrumbCurrentStyles = computed(() => ({
  color: getColor('gray.900'),
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium
}))

const breadcrumbSeparatorStyles = computed(() => ({
  margin: `0 ${getSpacing(2)}`,
  color: getColor('gray.400')
}))

const userMenuStyles = computed(() => ({}))

const userButtonStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  padding: getSpacing(2),
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease'
}))

const userAvatarStyles = computed(() => ({
  width: '32px',
  height: '32px',
  borderRadius: tokens.borderRadius.full,
  overflow: 'hidden'
}))

const avatarImageStyles = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}))

const avatarPlaceholderStyles = computed(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: getColor('primary.600'),
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium
}))

const userNameStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900')
}))

const userDropdownIconStyles = computed(() => ({
  color: getColor('gray.500')
}))

const contentStyles = computed(() => ({
  flex: '1',
  padding: getSpacing(6),
  overflow: 'auto',
  backgroundColor: getColor('gray.50')
}))

const footerStyles = computed(() => ({
  padding: getSpacing(4),
  backgroundColor: 'white',
  borderTop: `1px solid ${getColor('gray.200')}`,
  textAlign: 'center'
}))

const footerTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

const mobileOverlayStyles = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: '999',
  display: 'none'
}))

// 事件处理
const handleMenuClick = (item: MenuItem) => {
  emit('menu-click', item)
}

const handleToggleCollapse = () => {
  emit('toggle-collapse')
}

const handleToggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  emit('toggle-mobile-menu')
}

const handleCloseMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<style scoped>
/* 导航链接悬停效果 */
.nav-link:hover:not(.is-active) {
  background-color: var(--color-gray-800);
  color: white;
}

.sub-nav-link:hover:not(.is-active) {
  background-color: var(--color-gray-800);
  color: white;
}

.collapse-button:hover {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-600);
  color: white;
}

.user-button:hover {
  background-color: var(--color-gray-100);
}

.breadcrumb-link:hover {
  color: var(--color-primary-700);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    position: relative;
  }
  
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px !important;
  }
  
  .admin-sidebar.is-mobile-open {
    transform: translateX(0);
  }
  
  .admin-main {
    width: 100%;
  }
  
  .mobile-menu-button {
    display: flex !important;
  }
  
  .mobile-overlay {
    display: block !important;
  }
  
  .breadcrumb-nav {
    display: none;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .admin-sidebar,
  .nav-link,
  .sub-nav-link,
  .collapse-button,
  .user-button,
  .collapse-icon {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .admin-sidebar {
    border-right: 2px solid currentColor;
  }
  
  .admin-header {
    border-bottom: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .admin-sidebar,
  .admin-header,
  .admin-footer {
    display: none;
  }
  
  .admin-content {
    padding: 0;
  }
}
</style>
