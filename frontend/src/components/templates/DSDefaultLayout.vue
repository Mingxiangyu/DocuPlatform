<!--
  设计系统默认布局模板 - DSDefaultLayout
  基于设计令牌的智能布局模板，集成滚动进度、导航头部、通知系统等
-->

<template>
  <div :class="layoutClasses" :style="layoutStyles">
    <!-- 滚动进度条 -->
    <DSScrollProgress
      v-if="showScrollProgress"
      position="top"
      :height="progressHeight"
      :animated="true"
      :gradient="true"
      :smooth="true"
      :visible="true"
      :aria-label="progressAriaLabel"
      @progress="handleScrollProgress"
      @complete="handleScrollComplete"
    />

    <!-- 导航头部 -->
    <DSHeader
      :show-search="showSearch"
      :show-scroll-progress="false"
      :sticky="stickyHeader"
      :elevation="headerElevation"
      :transparent="transparentHeader"
      :search-placeholder="searchPlaceholder"
      :logo-aria-label="logoAriaLabel"
      :search-aria-label="searchAriaLabel"
      @search="handleSearch"
      @login="handleLogin"
      @register="handleRegister"
      @logout="handleLogout"
    />

    <!-- 主内容区域 -->
    <main
      :class="mainClasses"
      :style="mainStyles"
      role="main"
      :aria-label="mainAriaLabel"
    >
      <!-- 内容插槽 -->
      <slot />
    </main>

    <!-- 页脚 -->
    <footer
      v-if="showFooter"
      :class="footerClasses"
      :style="footerStyles"
      role="contentinfo"
    >
      <div class="footer-container" :style="footerContainerStyles">
        <div class="footer-content" :style="footerContentStyles">
          <!-- 公司信息 -->
          <div class="footer-section footer-brand" :style="footerSectionStyles">
            <div class="brand-logo" :style="brandLogoStyles">
              <div class="logo-icon" :style="logoIconStyles">
                <span class="logo-text" :style="logoTextStyles">D</span>
              </div>
              <span class="brand-name" :style="brandNameStyles">DocuVault</span>
            </div>
            <p class="brand-description" :style="brandDescriptionStyles">
              专业的知识付费平台，为创作者和读者提供优质的内容分享体验。
            </p>
            <div class="social-links" :style="socialLinksStyles">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                :aria-label="social.name"
                class="social-link"
                :style="socialLinkStyles"
                target="_blank"
                rel="noopener noreferrer"
              >
                <component :is="social.icon" />
              </a>
            </div>
          </div>

          <!-- 导航链接 -->
          <div class="footer-section footer-nav" :style="footerSectionStyles">
            <h4 class="footer-title" :style="footerTitleStyles">产品</h4>
            <ul class="footer-links" :style="footerLinksStyles">
              <li v-for="link in productLinks" :key="link.path">
                <router-link
                  :to="link.path"
                  class="footer-link"
                  :style="footerLinkStyles"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="footer-section footer-nav" :style="footerSectionStyles">
            <h4 class="footer-title" :style="footerTitleStyles">支持</h4>
            <ul class="footer-links" :style="footerLinksStyles">
              <li v-for="link in supportLinks" :key="link.path">
                <router-link
                  :to="link.path"
                  class="footer-link"
                  :style="footerLinkStyles"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="footer-section footer-nav" :style="footerSectionStyles">
            <h4 class="footer-title" :style="footerTitleStyles">公司</h4>
            <ul class="footer-links" :style="footerLinksStyles">
              <li v-for="link in companyLinks" :key="link.path">
                <router-link
                  :to="link.path"
                  class="footer-link"
                  :style="footerLinkStyles"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="footer-bottom" :style="footerBottomStyles">
          <div class="copyright" :style="copyrightStyles">
            <p :style="copyrightTextStyles">
              © {{ currentYear }} DocuVault. 保留所有权利。
            </p>
          </div>
          <div class="footer-legal" :style="footerLegalStyles">
            <router-link
              v-for="legal in legalLinks"
              :key="legal.path"
              :to="legal.path"
              class="legal-link"
              :style="legalLinkStyles"
            >
              {{ legal.label }}
            </router-link>
          </div>
        </div>
      </div>
    </footer>

    <!-- 全局通知系统 -->
    <div
      v-if="notifications.length"
      class="notifications-container"
      :style="notificationsContainerStyles"
      role="region"
      aria-label="通知消息"
      aria-live="polite"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="getNotificationClasses(notification)"
        :style="getNotificationStyles(notification)"
        role="alert"
      >
        <div class="notification-content" :style="notificationContentStyles">
          <div class="notification-icon" :style="getNotificationIconStyles(notification)">
            <component :is="getNotificationIcon(notification.type)" />
          </div>
          <div class="notification-message" :style="notificationMessageStyles">
            {{ notification.message }}
          </div>
          <button
            class="notification-close"
            :style="notificationCloseStyles"
            :aria-label="`关闭通知: ${notification.message}`"
            @click="removeNotification(notification.id)"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 全局加载指示器 -->
    <div
      v-if="isLoading"
      class="global-loading"
      :style="globalLoadingStyles"
      role="status"
      aria-label="页面加载中"
    >
      <div class="loading-spinner" :style="loadingSpinnerStyles">
        <div class="spinner-ring" :style="spinnerRingStyles" />
      </div>
      <p class="loading-text" :style="loadingTextStyles">加载中...</p>
    </div>

    <!-- 返回顶部按钮 -->
    <button
      v-if="showBackToTop && scrollProgress > 20"
      class="back-to-top"
      :style="backToTopStyles"
      :aria-label="backToTopAriaLabel"
      @click="handleBackToTop"
    >
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDesignTokens, useScrollProgress, useScrollToElement } from '../../design-system/composables'
import { eventBus } from '../../utils/EventBus'
import DSHeader from '../organisms/DSHeader.vue'
import DSScrollProgress from '../atoms/DSScrollProgress.vue'

// 通知接口
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// 链接接口
interface FooterLink {
  path: string
  label: string
}

interface SocialLink {
  name: string
  url: string
  icon: any
}

// 组件属性接口
interface Props {
  showScrollProgress?: boolean
  showSearch?: boolean
  showFooter?: boolean
  showBackToTop?: boolean
  stickyHeader?: boolean
  transparentHeader?: boolean
  headerElevation?: 'none' | 'sm' | 'md' | 'lg'
  progressHeight?: number
  searchPlaceholder?: string
  logoAriaLabel?: string
  searchAriaLabel?: string
  mainAriaLabel?: string
  progressAriaLabel?: string
  backToTopAriaLabel?: string
  backgroundColor?: string
  contentMaxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  showScrollProgress: true,
  showSearch: true,
  showFooter: true,
  showBackToTop: true,
  stickyHeader: true,
  transparentHeader: false,
  headerElevation: 'sm',
  progressHeight: 3,
  searchPlaceholder: '搜索文章、作者...',
  logoAriaLabel: 'DocuVault 首页',
  searchAriaLabel: '搜索内容',
  mainAriaLabel: '主要内容',
  progressAriaLabel: '页面滚动进度',
  backToTopAriaLabel: '返回顶部',
  backgroundColor: '',
  contentMaxWidth: '1280px'
})

// 事件定义
const emit = defineEmits<{
  search: [query: string]
  login: []
  register: []
  logout: []
  scrollProgress: [progress: number]
  scrollComplete: []
}>()

// 路由和工具
const router = useRouter()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const { progress: scrollProgress } = useScrollProgress()
const { scrollToTop } = useScrollToElement()

// 状态管理
const isLoading = ref(false)
const notifications = ref<Notification[]>([])
const currentYear = new Date().getFullYear()

// 社交链接配置
const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/docuvault',
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>' }
  },
  {
    name: 'GitHub',
    url: 'https://github.com/docuvault',
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>' }
  }
]

// 页脚链接配置
const productLinks: FooterLink[] = [
  { path: '/articles', label: '文章' },
  { path: '/collections', label: '合集' },
  { path: '/tools', label: '工具' },
  { path: '/pricing', label: '定价' }
]

const supportLinks: FooterLink[] = [
  { path: '/help', label: '帮助中心' },
  { path: '/contact', label: '联系我们' },
  { path: '/feedback', label: '意见反馈' },
  { path: '/status', label: '服务状态' }
]

const companyLinks: FooterLink[] = [
  { path: '/about', label: '关于我们' },
  { path: '/careers', label: '加入我们' },
  { path: '/blog', label: '博客' },
  { path: '/press', label: '媒体报道' }
]

const legalLinks: FooterLink[] = [
  { path: '/privacy', label: '隐私政策' },
  { path: '/terms', label: '服务条款' },
  { path: '/cookies', label: 'Cookie政策' }
]

// 样式计算
const layoutClasses = computed(() => [
  'ds-default-layout',
  'min-h-screen',
  'flex',
  'flex-col',
  'relative'
])

const layoutStyles = computed(() => ({
  backgroundColor: props.backgroundColor || getColor('gray.50'),
  fontFamily: tokens.typography.fontFamily.sans.join(', ')
}))

const mainClasses = computed(() => [
  'main-content',
  'flex-1',
  'relative'
])

const mainStyles = computed(() => ({
  minHeight: 'calc(100vh - 64px)', // 减去header高度
  paddingTop: props.stickyHeader ? '0' : getSpacing(4)
}))

// 页脚样式
const footerClasses = computed(() => [
  'ds-footer',
  'mt-auto'
])

const footerStyles = computed(() => ({
  backgroundColor: getColor('gray.900'),
  color: getColor('gray.300'),
  paddingTop: getSpacing(12),
  paddingBottom: getSpacing(8)
}))

const footerContainerStyles = computed(() => ({
  maxWidth: props.contentMaxWidth,
  margin: '0 auto',
  padding: `0 ${getSpacing(4)}`
}))

const footerContentStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: getSpacing(8),
  marginBottom: getSpacing(8)
}))

const footerSectionStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column'
}))

// 品牌样式
const brandLogoStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: getSpacing(4)
}))

const logoIconStyles = computed(() => ({
  width: '32px',
  height: '32px',
  backgroundColor: getColor('primary.600'),
  borderRadius: tokens.borderRadius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: getSpacing(3)
}))

const logoTextStyles = computed(() => ({
  color: 'white',
  fontWeight: tokens.typography.fontWeight.bold,
  fontSize: tokens.typography.fontSize.lg[0]
}))

const brandNameStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xl[0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: 'white'
}))

const brandDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.400'),
  lineHeight: tokens.typography.lineHeight.relaxed,
  marginBottom: getSpacing(4),
  margin: '0 0 1rem 0'
}))

// 社交链接样式
const socialLinksStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(3)
}))

const socialLinkStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  backgroundColor: getColor('gray.800'),
  borderRadius: tokens.borderRadius.lg,
  color: getColor('gray.400'),
  textDecoration: 'none',
  transition: 'all 0.2s ease'
}))

// 页脚导航样式
const footerTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: 'white',
  marginBottom: getSpacing(4),
  margin: '0 0 1rem 0'
}))

const footerLinksStyles = computed(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0'
}))

const footerLinkStyles = computed(() => ({
  display: 'block',
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.400'),
  textDecoration: 'none',
  padding: `${getSpacing(1)} 0`,
  transition: 'color 0.2s ease'
}))

// 页脚底部样式
const footerBottomStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: getSpacing(8),
  borderTop: `1px solid ${getColor('gray.800')}`,
  flexWrap: 'wrap',
  gap: getSpacing(4)
}))

const copyrightStyles = computed(() => ({
  flex: '1'
}))

const copyrightTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.400'),
  margin: '0'
}))

const footerLegalStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(6),
  flexWrap: 'wrap'
}))

const legalLinkStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.400'),
  textDecoration: 'none',
  transition: 'color 0.2s ease'
})

// 通知系统样式
const notificationsContainerStyles = computed(() => ({
  position: 'fixed',
  top: '80px',
  right: getSpacing(4),
  zIndex: '1000',
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(2),
  maxWidth: '400px',
  width: '100%'
}))

const getNotificationClasses = (notification: Notification) => [
  'notification',
  `notification-${notification.type}`,
  'animate-slide-in'
]

const getNotificationStyles = (notification: Notification) => {
  const typeColors = {
    success: getColor('success.500'),
    error: getColor('error.500'),
    warning: getColor('warning.500'),
    info: getColor('info.500')
  }

  return {
    backgroundColor: 'white',
    borderRadius: tokens.borderRadius.lg,
    boxShadow: getShadow('large'),
    border: `1px solid ${getColor('gray.200')}`,
    borderLeft: `4px solid ${typeColors[notification.type]}`,
    overflow: 'hidden'
  }
}

const notificationContentStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: getSpacing(4),
  gap: getSpacing(3)
}))

const getNotificationIconStyles = (notification: Notification) => {
  const typeColors = {
    success: getColor('success.500'),
    error: getColor('error.500'),
    warning: getColor('warning.500'),
    info: getColor('info.500')
  }

  return {
    color: typeColors[notification.type],
    flexShrink: '0'
  }
}

const notificationMessageStyles = computed(() => ({
  flex: '1',
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.700'),
  lineHeight: tokens.typography.lineHeight.relaxed
}))

const notificationCloseStyles = computed(() => ({
  flexShrink: '0',
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.400'),
  cursor: 'pointer',
  padding: '0',
  transition: 'color 0.2s ease'
}))

// 全局加载样式
const globalLoadingStyles = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '9999'
}))

const loadingSpinnerStyles = computed(() => ({
  position: 'relative',
  width: '40px',
  height: '40px',
  marginBottom: getSpacing(4)
}))

const spinnerRingStyles = computed(() => ({
  width: '100%',
  height: '100%',
  border: `3px solid ${getColor('gray.200')}`,
  borderTop: `3px solid ${getColor('primary.600')}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}))

const loadingTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

// 返回顶部按钮样式
const backToTopStyles = computed(() => ({
  position: 'fixed',
  bottom: getSpacing(6),
  right: getSpacing(6),
  width: '48px',
  height: '48px',
  backgroundColor: getColor('primary.600'),
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.full,
  boxShadow: getShadow('large'),
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  zIndex: '100'
}))

// 通知图标获取
const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    success: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' },
    error: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>' },
    warning: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>' },
    info: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>' }
  }
  return icons[type]
}

// 事件处理函数
const handleSearch = (query: string) => {
  emit('search', query)
}

const handleLogin = () => {
  emit('login')
}

const handleRegister = () => {
  emit('register')
}

const handleLogout = () => {
  emit('logout')
}

const handleScrollProgress = (progress: number) => {
  emit('scrollProgress', progress)
}

const handleScrollComplete = () => {
  emit('scrollComplete')
}

const handleBackToTop = () => {
  scrollToTop({ behavior: 'smooth' })
}

// 通知管理
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  const newNotification = { ...notification, id }
  notifications.value.push(newNotification)

  // 自动移除通知
  if (notification.duration !== 0) {
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 5000)
  }
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 全局加载状态管理
const setLoading = (loading: boolean) => {
  isLoading.value = loading
}

// 事件总线监听
onMounted(() => {
  eventBus.on('notification:add', addNotification)
  eventBus.on('loading:set', setLoading)
})

onUnmounted(() => {
  eventBus.off('notification:add', addNotification)
  eventBus.off('loading:set', setLoading)
})
</script>

<style scoped>
.ds-default-layout {
  font-family: var(--font-family-sans);
}

.social-link:hover {
  background-color: var(--color-primary-600);
  color: white;
}

.footer-link:hover,
.legal-link:hover {
  color: white;
}

.notification-close:hover {
  color: var(--color-gray-600);
}

.back-to-top:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-2px);
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-legal {
    justify-content: center;
  }

  .notifications-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .back-to-top {
    bottom: 1rem;
    right: 1rem;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .social-link,
  .footer-link,
  .legal-link,
  .notification-close,
  .back-to-top,
  .animate-slide-in {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-footer {
    border-top: 2px solid white;
  }

  .notification {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .ds-footer,
  .notifications-container,
  .back-to-top,
  .global-loading {
    display: none;
  }
}
</style>)
