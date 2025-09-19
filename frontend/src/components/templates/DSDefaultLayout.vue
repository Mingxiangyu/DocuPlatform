<!--
  设计系统默认布局组件 - DSDefaultLayout
  提供标准的页面布局结构，包含头部、主内容区域、页脚等
-->

<template>
  <div class="ds-default-layout" :style="layoutStyles">
    <!-- 滚动进度条 -->
    <DSScrollProgress
      v-if="showScrollProgress"
      position="top"
      :height="3"
      :animated="true"
      :gradient="true"
      :smooth="true"
      :aria-label="progressAriaLabel"
    />

    <!-- 页面头部 -->
    <DSHeader
      v-if="showHeader"
      :show-search="showSearch"
      :show-scroll-progress="false"
      :sticky="stickyHeader"
      elevation="sm"
      @search="handleSearch"
      @login="handleLogin"
      @register="handleRegister"
      @logout="handleLogout"
    />

    <!-- 主内容区域 -->
    <main 
      class="ds-main-content" 
      :style="mainContentStyles"
      :aria-label="mainAriaLabel"
    >
      <div v-if="contentMaxWidth" :style="contentContainerStyles">
        <slot />
      </div>
      <slot v-else />
    </main>

    <!-- 页脚 -->
    <footer v-if="showFooter" style="background-color: rgb(249, 250, 251); color: rgb(55, 65, 81); padding: 3rem 0 1rem 0; border-top: 1px solid rgb(229, 231, 235);">
      <slot name="footer">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
          <!-- 主要页脚内容 -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <!-- Logo和描述区域 -->
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="width: 32px; height: 32px; background-color: rgb(147, 51, 234); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 0.75rem;">
                  <span style="color: white; font-weight: 700; font-size: 1.125rem;">D</span>
                </div>
                <span style="font-size: 1.25rem; font-weight: 700; color: rgb(17, 24, 39);">DocuVault</span>
              </div>
              <p style="color: rgb(107, 114, 128); line-height: 1.6; margin-bottom: 1.5rem;">
                专业的知识付费平台，为创作者和读者提供优质的内容分享体验。
              </p>
              <div style="display: flex; gap: 1rem;">
                <a href="#" style="color: rgb(107, 114, 128); transition: color 0.2s ease;"
                   @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                   @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">
                  <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" style="color: rgb(107, 114, 128); transition: color 0.2s ease;"
                   @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                   @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">
                  <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- 快速链接 -->
            <div>
              <h3 style="color: rgb(17, 24, 39); font-weight: 600; font-size: 1rem; margin-bottom: 1rem;">快速链接</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">热门文档</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">最新发布</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">免费资源</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">专家推荐</a>
                </li>
              </ul>
            </div>

            <!-- 热门分类 -->
            <div>
              <h3 style="color: rgb(17, 24, 39); font-weight: 600; font-size: 1rem; margin-bottom: 1rem;">热门分类</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">前端开发</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">后端架构</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">数据科学</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">DevOps</a>
                </li>
              </ul>
            </div>

            <!-- 帮助支持 -->
            <div>
              <h3 style="color: rgb(17, 24, 39); font-weight: 600; font-size: 1rem; margin-bottom: 1rem;">帮助支持</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">使用帮助</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">作者入驻</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">意见反馈</a>
                </li>
                <li style="margin-bottom: 0.5rem;">
                  <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; transition: color 0.2s ease;"
                     @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                     @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">联系我们</a>
                </li>
              </ul>
            </div>
          </div>

          <!-- 底部版权区域 -->
          <div style="border-top: 1px solid rgb(229, 231, 235); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <p style="color: rgb(107, 114, 128); margin: 0;">&copy; {{ currentYear }} DocuVault. 保留所有权利。</p>
            <div style="display: flex; gap: 1.5rem;">
              <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; font-size: 0.875rem; transition: color 0.2s ease;"
                 @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                 @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">服务条款</a>
              <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; font-size: 0.875rem; transition: color 0.2s ease;"
                 @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                 @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">隐私政策</a>
              <a href="#" style="color: rgb(107, 114, 128); text-decoration: none; font-size: 0.875rem; transition: color 0.2s ease;"
                 @mouseenter="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
                 @mouseleave="(e) => e.target.style.color = 'rgb(107, 114, 128)'">Cookie 设置</a>
            </div>
          </div>
        </div>
      </slot>
    </footer>

    <!-- 返回顶部按钮 -->
    <button
      v-if="showBackToTop && scrollProgress > 0.1"
      class="back-to-top"
      :style="backToTopStyles"
      :aria-label="backToTopAriaLabel"
      @click="scrollToTop"
    >
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="global-loading" :style="loadingOverlayStyles">
      <div class="loading-content" :style="loadingContentStyles">
        <div class="loading-spinner" :style="loadingSpinnerStyles"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 全局通知 -->
    <div class="notifications-container" :style="notificationsContainerStyles">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :style="getNotificationStyles(notification)"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" />
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <button 
            class="notification-close"
            :style="notificationCloseStyles"
            @click="removeNotification(notification.id)"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DSHeader from '../organisms/DSHeader.vue'
import DSScrollProgress from '../atoms/DSScrollProgress.vue'
import { useDesignTokens } from '../../design-system/composables'
import { useScrollProgress } from '../../design-system/composables/useScrollTrigger'
import { eventBus } from '../../utils/EventBus'

// 通知接口
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// 社交链接接口
interface SocialLink {
  name: string
  href: string
  icon: any
}

// 组件属性
interface Props {
  // 显示控制
  showHeader?: boolean
  showFooter?: boolean
  showScrollProgress?: boolean
  showBackToTop?: boolean
  showSearch?: boolean
  stickyHeader?: boolean
  
  // 无障碍标签
  searchAriaLabel?: string
  mainAriaLabel?: string
  progressAriaLabel?: string
  backToTopAriaLabel?: string
  backgroundColor?: string
  contentMaxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  showScrollProgress: true,
  showBackToTop: true,
  showSearch: true,
  stickyHeader: true,
  searchAriaLabel: '搜索内容',
  mainAriaLabel: '主要内容',
  progressAriaLabel: '页面滚动进度',
  backToTopAriaLabel: '返回顶部',
  backgroundColor: undefined,
  contentMaxWidth: undefined
})

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const { progress: scrollProgress } = useScrollProgress()

// 状态管理
const isLoading = ref(false)
const notifications = ref<Notification[]>([])
const currentYear = new Date().getFullYear()

// 社交链接配置
const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    href: '#',
    icon: 'github-icon'
  },
  {
    name: 'Twitter',
    href: '#',
    icon: 'twitter-icon'
  }
]

// 样式计算
const layoutStyles = computed(() => ({
  minHeight: '100vh',
  backgroundColor: props.backgroundColor || getColor('gray.50'),
  display: 'flex',
  flexDirection: 'column',
  fontFamily: tokens.typography.fontFamily.sans.join(', ')
}))

const mainContentStyles = computed(() => ({
  flex: '1',
  width: '100%'
}))

const contentContainerStyles = computed(() => ({
  maxWidth: props.contentMaxWidth || '1200px',
  margin: '0 auto',
  padding: `0 ${getSpacing(4)}`
}))

const footerStyles = computed(() => ({
  backgroundColor: getColor('white'),
  borderTop: `1px solid ${getColor('gray.200')}`,
  marginTop: 'auto'
}))

const footerContentStyles = computed(() => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: getSpacing(8),
  textAlign: 'center'
}))

const footerBrandStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: getSpacing(4)
}))

const logoStyles = computed(() => ({
  width: '32px',
  height: '32px',
  backgroundColor: getColor('purple.600'),
  borderRadius: getSpacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: getSpacing(2)
}))

const footerLinksStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  gap: getSpacing(4),
  margin: `${getSpacing(4)} 0`
}))

const socialLinkStyles = computed(() => ({
  color: getColor('gray.400'),
  transition: 'color 0.2s ease',
  ':hover': {
    color: getColor('purple.600')
  }
}))

const footerBottomStyles = computed(() => ({
  marginTop: getSpacing(6),
  paddingTop: getSpacing(6),
  borderTop: `1px solid ${getColor('gray.200')}`,
  color: getColor('gray.600'),
  fontSize: tokens.typography.fontSize.sm
}))

const backToTopStyles = computed(() => ({
  position: 'fixed',
  bottom: getSpacing(6),
  right: getSpacing(6),
  width: '48px',
  height: '48px',
  backgroundColor: getColor('purple.600'),
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: getShadow('large'),
  transition: 'all 0.2s ease',
  zIndex: '1000',
  ':hover': {
    backgroundColor: getColor('purple.700'),
    transform: 'translateY(-2px)'
  }
}))

const loadingOverlayStyles = computed(() => ({
  position: 'fixed',
  inset: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '9999'
}))

const loadingContentStyles = computed(() => ({
  backgroundColor: getColor('white'),
  borderRadius: getSpacing(2),
  padding: getSpacing(6),
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  boxShadow: getShadow('large')
}))

const loadingSpinnerStyles = computed(() => ({
  width: '24px',
  height: '24px',
  border: `2px solid ${getColor('gray.200')}`,
  borderTop: `2px solid ${getColor('purple.600')}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}))

// 通知系统样式
const notificationsContainerStyles = computed(() => ({
  position: 'fixed',
  top: getSpacing(4),
  right: getSpacing(4),
  zIndex: '9998',
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(2)
}))

const getNotificationStyles = (notification: Notification) => {
  const baseStyles = {
    maxWidth: '400px',
    backgroundColor: getColor('white'),
    borderRadius: getSpacing(2),
    padding: getSpacing(4),
    boxShadow: getShadow('large'),
    border: `1px solid ${getColor('gray.200')}`,
    transform: 'translateX(0)',
    transition: 'all 0.3s ease'
  }

  const typeColors = {
    success: getColor('green.500'),
    error: getColor('red.500'),
    warning: getColor('yellow.500'),
    info: getColor('blue.500')
  }

  return {
    ...baseStyles,
    borderLeft: `4px solid ${typeColors[notification.type]}`
  }
}

const notificationCloseStyles = computed(() => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: getColor('gray.400'),
  padding: getSpacing(1),
  ':hover': {
    color: getColor('gray.600')
  }
}))

// 方法
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
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

const getNotificationIcon = (type: string) => {
  // 这里应该返回对应的图标组件
  return 'div'
}

// 生命周期
onMounted(() => {
  eventBus.on('ui:loading-start', () => {
    isLoading.value = true
  })
  
  eventBus.on('ui:loading-end', () => {
    isLoading.value = false
  })
  
  eventBus.on('ui:notification', (payload) => {
    addNotification(payload)
  })
})

onUnmounted(() => {
  eventBus.clear()
})
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.brand-name {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin-left: 8px;
}
</style>
