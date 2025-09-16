<!--
  设计系统提供者组件 - 顶层设计系统集成
  整合ThemeProvider、动画系统和全局配置
-->

<template>
  <ThemeProvider
    :theme="theme"
    :tokens="designTokens"
    :enable-animations="enableAnimations"
    :enable-transitions="enableTransitions"
  >
    <div class="design-system-root" :class="rootClasses">
      <!-- 全局进度条 -->
      <div
        v-if="showGlobalProgress"
        class="fixed top-0 left-0 z-50 transition-all duration-300"
        :style="{
          width: `${globalProgress}%`,
          height: '3px',
          background: 'linear-gradient(90deg, #a855f7 0%, #9333ea 100%)'
        }"
      ></div>
      
      <!-- 全局加载指示器 -->
      <Teleport to="body">
        <div
          v-if="isLoading"
          class="global-loading-overlay"
          :class="loadingOverlayClasses"
        >
          <div class="loading-spinner" :class="spinnerClasses">
            <div class="spinner-ring"></div>
            <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
          </div>
        </div>
      </Teleport>
      
      <!-- 主要内容 -->
      <slot />
      
      <!-- 全局通知容器 -->
      <Teleport to="body">
        <div id="notification-container" class="notification-container"></div>
      </Teleport>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  provide, 
  onMounted, 
  onUnmounted,
  type PropType 
} from 'vue'
import ThemeProvider from './ThemeProvider.vue'
import { designTokens } from '../tokens'
import type { CompleteDesignTokens } from '../tokens'
import { eventBus } from '../../utils/EventBus'

// 导入新组件以确保它们在设计系统中可用
import DSCategoryGrid from '../../components/organisms/DSCategoryGrid.vue'
import DSScrollProgress from '../../components/atoms/DSScrollProgress.vue'
import DSHeader from '../../components/organisms/DSHeader.vue'
import DSCategoryNavigation from '../../components/molecules/DSCategoryNavigation.vue'
import DSDefaultLayout from '../../components/templates/DSDefaultLayout.vue'

// 组件属性定义
export interface DesignSystemProviderProps {
  theme?: 'light' | 'dark' | 'auto'
  tokens?: CompleteDesignTokens
  enableAnimations?: boolean
  enableTransitions?: boolean
  enableGlobalProgress?: boolean
  enableGlobalLoading?: boolean
  debugMode?: boolean
}

const props = withDefaults(defineProps<DesignSystemProviderProps>(), {
  theme: 'light',
  tokens: () => designTokens,
  enableAnimations: true,
  enableTransitions: true,
  enableGlobalProgress: true,
  enableGlobalLoading: true,
  debugMode: false
})

// 全局状态管理
const isLoading = ref(false)
const loadingText = ref('')
const globalProgress = ref(0)
const showGlobalProgress = ref(false)

// 计算样式类
const rootClasses = computed(() => [
  'min-h-screen',
  'transition-all duration-300',
  props.enableAnimations && 'animations-enabled',
  props.enableTransitions && 'transitions-enabled',
  props.debugMode && 'debug-mode'
])

const loadingOverlayClasses = computed(() => [
  'fixed inset-0 z-50',
  'bg-white/80 dark:bg-gray-900/80',
  'backdrop-blur-sm',
  'flex items-center justify-center',
  props.enableAnimations && 'animate-fadeIn'
])

const spinnerClasses = computed(() => [
  'text-center',
  props.enableAnimations && 'animate-scaleIn'
])

// 设计系统全局配置
const designSystemConfig = computed(() => ({
  tokens: props.tokens,
  theme: props.theme,
  animations: {
    enabled: props.enableAnimations,
    reducedMotion: !props.enableAnimations
  },
  transitions: {
    enabled: props.enableTransitions
  },
  features: {
    globalProgress: props.enableGlobalProgress,
    globalLoading: props.enableGlobalLoading
  },
  debug: props.debugMode
}))

// 提供全局配置
provide('designSystemConfig', designSystemConfig)

// 全局加载控制
const setGlobalLoading = (loading: boolean, text: string = '') => {
  if (!props.enableGlobalLoading) return
  
  isLoading.value = loading
  loadingText.value = text
  
  // 防止页面滚动
  if (loading) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 全局进度控制
const setGlobalProgress = (progress: number, show: boolean = true) => {
  if (!props.enableGlobalProgress) return
  
  globalProgress.value = Math.max(0, Math.min(100, progress))
  showGlobalProgress.value = show
  
  // 自动隐藏完成的进度条
  if (progress >= 100) {
    setTimeout(() => {
      showGlobalProgress.value = false
      globalProgress.value = 0
    }, 500)
  }
}

// 新组件集成配置
const newComponentsConfig = computed(() => ({
  DSCategoryGrid: {
    defaultProps: {
      animationStagger: 100,
      scrollAnimation: true,
      gap: 'md'
    }
  },
  DSScrollProgress: {
    defaultProps: {
      height: 3,
      animated: true,
      gradient: true,
      smooth: true
    }
  },
  DSHeader: {
    defaultProps: {
      sticky: true,
      elevation: 'sm',
      showSearch: true
    }
  },
  DSCategoryNavigation: {
    defaultProps: {
      layout: 'horizontal',
      variant: 'default',
      size: 'md',
      showCounts: true
    }
  },
  DSDefaultLayout: {
    defaultProps: {
      showScrollProgress: true,
      showFooter: true,
      showBackToTop: true,
      stickyHeader: true
    }
  }
}))

// 提供新组件配置
provide('newComponentsConfig', newComponentsConfig)

// 提供全局控制方法
provide('setGlobalLoading', setGlobalLoading)
provide('setGlobalProgress', setGlobalProgress)

// 全局错误处理
const handleGlobalError = (error: Error, context: string = 'Unknown') => {
  console.error(`[Design System Error - ${context}]:`, error)
  
  if (props.debugMode) {
    // 在调试模式下显示错误详情
    console.group('Design System Debug Info')
    console.log('Error Context:', context)
    console.log('Error Stack:', error.stack)
    console.log('Design System Config:', designSystemConfig.value)
    console.groupEnd()
  }
  
  // 触发全局错误事件
  window.dispatchEvent(new CustomEvent('design-system-error', {
    detail: { error, context }
  }))
}

provide('handleGlobalError', handleGlobalError)

// 性能监控
const performanceMetrics = ref({
  renderTime: 0,
  animationFrames: 0,
  memoryUsage: 0
})

const startPerformanceMonitoring = () => {
  if (!props.debugMode) return
  
  const startTime = performance.now()
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        performanceMetrics.value.renderTime = entry.duration
      }
    }
  })
  
  observer.observe({ entryTypes: ['measure'] })
  
  // 监控内存使用（如果支持）
  if ('memory' in performance) {
    const updateMemory = () => {
      performanceMetrics.value.memoryUsage = (performance as any).memory.usedJSHeapSize
    }
    
    const memoryInterval = setInterval(updateMemory, 5000)
    
    onUnmounted(() => {
      clearInterval(memoryInterval)
      observer.disconnect()
    })
  }
}

// 键盘快捷键支持
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  if (!props.debugMode) return
  
  // Ctrl/Cmd + Shift + D: 切换调试模式
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault()
    console.log('Design System Debug Info:', {
      config: designSystemConfig.value,
      performance: performanceMetrics.value,
      tokens: props.tokens
    })
  }
  
  // Ctrl/Cmd + Shift + T: 切换主题
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
    event.preventDefault()
    const themes = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(props.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    // 这里需要通过事件通知父组件切换主题
    window.dispatchEvent(new CustomEvent('theme-toggle', {
      detail: { theme: nextTheme }
    }))
  }
}

// 事件总线集成
const setupEventBusIntegration = () => {
  // 监听全局加载事件
  eventBus.on('loading:set', setGlobalLoading)
  eventBus.on('loading:start', () => setGlobalLoading(true))
  eventBus.on('loading:stop', () => setGlobalLoading(false))

  // 监听进度事件
  eventBus.on('progress:set', (progress: number) => setGlobalProgress(progress))

  // 监听主题事件
  eventBus.on('theme:change', (theme: string) => {
    if (['light', 'dark', 'auto'].includes(theme)) {
      // 这里可以触发主题切换
      window.dispatchEvent(new CustomEvent('theme-change-request', {
        detail: { theme }
      }))
    }
  })
}

// 生命周期钩子
onMounted(() => {
  // 启动性能监控
  startPerformanceMonitoring()

  // 设置事件总线集成
  setupEventBusIntegration()

  // 注册键盘快捷键
  if (props.debugMode) {
    document.addEventListener('keydown', handleKeyboardShortcuts)
  }

  // 设置全局CSS类
  document.documentElement.classList.add('design-system-initialized')

  // 注册新组件到全局
  ;(window as any).DocuVaultDesignSystem = {
    components: {
      DSCategoryGrid,
      DSScrollProgress,
      DSHeader,
      DSCategoryNavigation,
      DSDefaultLayout
    },
    config: newComponentsConfig.value,
    version: '2.0.0'
  }

  // 触发初始化完成事件
  window.dispatchEvent(new CustomEvent('design-system-ready', {
    detail: {
      config: designSystemConfig.value,
      newComponents: Object.keys(newComponentsConfig.value)
    }
  }))
  
  if (props.debugMode) {
    console.log('🎨 Design System Provider initialized', {
      config: designSystemConfig.value,
      tokens: Object.keys(props.tokens)
    })
  }
})

onUnmounted(() => {
  // 清理事件总线监听
  eventBus.off('loading:set', setGlobalLoading)
  eventBus.off('loading:start')
  eventBus.off('loading:stop')
  eventBus.off('progress:set')
  eventBus.off('theme:change')

  // 清理事件监听器
  if (props.debugMode) {
    document.removeEventListener('keydown', handleKeyboardShortcuts)
  }

  // 清理全局CSS类
  document.documentElement.classList.remove('design-system-initialized')

  // 清理全局对象
  delete (window as any).DocuVaultDesignSystem
  
  // 恢复页面滚动
  document.body.style.overflow = ''
})

// 暴露给父组件的方法
defineExpose({
  setGlobalLoading,
  setGlobalProgress,
  handleGlobalError,
  performanceMetrics: performanceMetrics.value
})
</script>

<style scoped>
.design-system-root {
  position: relative;
  min-height: 100vh;
}

.global-loading-overlay {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top: 3px solid rgb(168, 85, 247);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: rgb(168, 85, 247);
  font-weight: 500;
  font-size: 0.875rem;
}

.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  pointer-events: none;
}

/* 调试模式样式 */
.debug-mode {
  position: relative;
}

.debug-mode::before {
  content: '🐛 DEBUG MODE';
  position: fixed;
  top: 0;
  left: 0;
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 9999;
  pointer-events: none;
}

/* 动画定义 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes scaleIn {
  0% { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1); 
  }
}

/* 工具类 */
.animations-enabled * {
  transition-property: transform, opacity, background-color, border-color, color;
  transition-duration: var(--duration-normal, 300ms);
  transition-timing-function: var(--easing-smooth, ease);
}

.transitions-enabled {
  transition: all var(--duration-normal, 300ms) var(--easing-smooth, ease);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notification-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}
</style>
