<!--
  设计系统消息提示组件 - DSToast
  企业级消息提示组件，支持多种类型、位置和配置选项
-->

<template>
  <teleport to="body">
    <div
      v-if="toasts.length > 0"
      class="toast-container"
      :style="containerStyles"
    >
      <transition-group
        name="toast"
        tag="div"
        class="toast-list"
        :style="listStyles"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :style="getToastStyles(toast)"
          @click="handleToastClick(toast)"
          @mouseenter="handleMouseEnter(toast)"
          @mouseleave="handleMouseLeave(toast)"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <!-- 图标 -->
          <div class="toast-icon" :style="getIconStyles(toast.type)">
            <component :is="getIcon(toast.type)" />
          </div>

          <!-- 内容 -->
          <div class="toast-content" :style="contentStyles">
            <div
              v-if="toast.title"
              class="toast-title"
              :style="titleStyles"
            >
              {{ toast.title }}
            </div>
            <div class="toast-message" :style="messageStyles">
              {{ toast.message }}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div
            v-if="toast.action"
            class="toast-action"
            :style="actionStyles"
          >
            <button
              class="action-button"
              :style="getActionButtonStyles(toast.type)"
              @click.stop="handleAction(toast)"
            >
              {{ toast.action.label }}
            </button>
          </div>

          <!-- 关闭按钮 -->
          <button
            v-if="toast.closable !== false"
            class="toast-close"
            :style="closeButtonStyles"
            @click.stop="removeToast(toast.id)"
            :aria-label="closeLabel"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- 进度条 -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="toast-progress"
            :style="getProgressStyles(toast)"
          >
            <div
              class="progress-bar"
              :style="getProgressBarStyles(toast)"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 消息类型
type ToastType = 'success' | 'error' | 'warning' | 'info'

// 位置类型
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

// 消息接口
interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  closable?: boolean
  action?: {
    label: string
    handler: () => void
  }
  createdAt: number
  pausedAt?: number
  remainingTime?: number
}

// 组件属性
interface Props {
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5,
  defaultDuration: 4000,
  closeLabel: '关闭'
})

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const toasts = ref<Toast[]>([])
const timers = ref<Map<string, NodeJS.Timeout>>(new Map())

// 样式计算
const containerStyles = computed(() => {
  const positionMap = {
    'top-left': { top: getSpacing(4), left: getSpacing(4) },
    'top-center': { top: getSpacing(4), left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: getSpacing(4), right: getSpacing(4) },
    'bottom-left': { bottom: getSpacing(4), left: getSpacing(4) },
    'bottom-center': { bottom: getSpacing(4), left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: getSpacing(4), right: getSpacing(4) }
  }
  
  return {
    position: 'fixed',
    zIndex: '1100',
    pointerEvents: 'none',
    ...positionMap[props.position]
  }
})

const listStyles = computed(() => ({
  display: 'flex',
  flexDirection: props.position.startsWith('bottom') ? 'column-reverse' : 'column',
  gap: getSpacing(3),
  minWidth: '320px',
  maxWidth: '480px'
}))

const getToastStyles = (toast: Toast) => {
  const typeColors = {
    success: {
      background: getColor('success.50'),
      border: getColor('success.200')
    },
    error: {
      background: getColor('error.50'),
      border: getColor('error.200')
    },
    warning: {
      background: getColor('warning.50'),
      border: getColor('warning.200')
    },
    info: {
      background: getColor('info.50'),
      border: getColor('info.200')
    }
  }
  
  const colors = typeColors[toast.type]
  
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: getSpacing(3),
    padding: getSpacing(4),
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: getShadow('large'),
    cursor: toast.action ? 'pointer' : 'default',
    pointerEvents: 'auto',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)'
  }
}

const getIconStyles = (type: ToastType) => {
  const typeColors = {
    success: getColor('success.600'),
    error: getColor('error.600'),
    warning: getColor('warning.600'),
    info: getColor('info.600')
  }
  
  return {
    flexShrink: '0',
    color: typeColors[type],
    width: '20px',
    height: '20px'
  }
}

const contentStyles = computed(() => ({
  flex: '1',
  minWidth: '0'
}))

const titleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const messageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.700'),
  lineHeight: tokens.typography.lineHeight.relaxed,
  margin: '0'
}))

const actionStyles = computed(() => ({
  flexShrink: '0'
}))

const getActionButtonStyles = (type: ToastType) => {
  const typeColors = {
    success: getColor('success.600'),
    error: getColor('error.600'),
    warning: getColor('warning.600'),
    info: getColor('info.600')
  }
  
  return {
    padding: `${getSpacing(1)} ${getSpacing(3)}`,
    backgroundColor: 'transparent',
    border: `1px solid ${typeColors[type]}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.xs[0],
    fontWeight: tokens.typography.fontWeight.medium,
    color: typeColors[type],
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}

const closeButtonStyles = computed(() => ({
  flexShrink: '0',
  padding: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.400'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease'
}))

const getProgressStyles = (toast: Toast) => ({
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  height: '3px',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
})

const getProgressBarStyles = (toast: Toast) => {
  const typeColors = {
    success: getColor('success.500'),
    error: getColor('error.500'),
    warning: getColor('warning.500'),
    info: getColor('info.500')
  }
  
  const elapsed = Date.now() - toast.createdAt
  const duration = toast.duration || props.defaultDuration
  const progress = Math.min((elapsed / duration) * 100, 100)
  
  return {
    height: '100%',
    backgroundColor: typeColors[toast.type],
    width: `${100 - progress}%`,
    transition: 'width 0.1s linear'
  }
}

// 图标组件
const getIcon = (type: ToastType) => {
  const icons = {
    success: {
      template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
    },
    error: {
      template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>'
    },
    warning: {
      template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>'
    },
    info: {
      template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>'
    }
  }
  
  return icons[type]
}

// 工具函数
const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 消息管理
const addToast = (options: Omit<Toast, 'id' | 'createdAt'>) => {
  const toast: Toast = {
    id: generateId(),
    createdAt: Date.now(),
    duration: options.duration ?? props.defaultDuration,
    closable: options.closable ?? true,
    ...options
  }
  
  // 限制最大消息数量
  if (toasts.value.length >= props.maxToasts) {
    const oldestToast = toasts.value[0]
    removeToast(oldestToast.id)
  }
  
  toasts.value.push(toast)
  
  // 设置自动移除定时器
  if (toast.duration && toast.duration > 0) {
    const timer = setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
    
    timers.value.set(toast.id, timer)
  }
  
  return toast.id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
  
  // 清除定时器
  const timer = timers.value.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.value.delete(id)
  }
}

const clearAllToasts = () => {
  toasts.value = []
  timers.value.forEach(timer => clearTimeout(timer))
  timers.value.clear()
}

// 事件处理
const handleToastClick = (toast: Toast) => {
  if (toast.action) {
    handleAction(toast)
  }
}

const handleAction = (toast: Toast) => {
  if (toast.action) {
    toast.action.handler()
    removeToast(toast.id)
  }
}

const handleMouseEnter = (toast: Toast) => {
  // 鼠标悬停时暂停定时器
  const timer = timers.value.get(toast.id)
  if (timer) {
    clearTimeout(timer)
    toast.pausedAt = Date.now()
  }
}

const handleMouseLeave = (toast: Toast) => {
  // 鼠标离开时恢复定时器
  if (toast.pausedAt && toast.duration) {
    const elapsed = toast.pausedAt - toast.createdAt
    const remaining = toast.duration - elapsed
    
    if (remaining > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, remaining)
      
      timers.value.set(toast.id, timer)
    }
    
    toast.pausedAt = undefined
  }
}

// 暴露方法给父组件
defineExpose({
  addToast,
  removeToast,
  clearAllToasts,
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) =>
    addToast({ type: 'success', message, ...options }),
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) =>
    addToast({ type: 'error', message, ...options }),
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) =>
    addToast({ type: 'warning', message, ...options }),
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) =>
    addToast({ type: 'info', message, ...options })
})

// 生命周期
onUnmounted(() => {
  clearAllToasts()
})
</script>

<style scoped>
/* 消息动画 */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 从左侧位置的动画 */
.toast-container[style*="left:"] .toast-enter-from,
.toast-container[style*="left:"] .toast-leave-to {
  transform: translateX(-100%);
}

/* 从中心位置的动画 */
.toast-container[style*="translateX(-50%)"] .toast-enter-from,
.toast-container[style*="translateX(-50%)"] .toast-leave-to {
  transform: translateX(-50%) translateY(-20px);
}

/* 交互样式 */
.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-large);
}

.action-button:hover {
  background-color: currentColor;
  color: white;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-gray-600);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem !important;
    right: 1rem !important;
    transform: none !important;
  }
  
  .toast-list {
    min-width: auto;
    max-width: none;
  }
  
  .toast-item {
    padding: 0.75rem;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move,
  .toast-item,
  .action-button,
  .toast-close {
    transition: none !important;
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .toast-item {
    border: 2px solid currentColor;
  }
  
  .action-button {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .toast-container {
    display: none;
  }
}
</style>
