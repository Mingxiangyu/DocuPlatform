<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <!-- 错误图标 -->
      <div class="error-icon">
        <svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <!-- 错误标题 -->
      <h2 class="error-title">
        {{ errorTitle }}
      </h2>

      <!-- 错误描述 -->
      <p class="error-description">
        {{ errorDescription }}
      </p>

      <!-- 错误详情（开发模式） -->
      <div v-if="showDetails && errorDetails" class="error-details">
        <details class="error-details-toggle">
          <summary class="error-details-summary">
            查看错误详情
          </summary>
          <div class="error-details-content">
            <pre class="error-stack">{{ errorDetails }}</pre>
          </div>
        </details>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <Button
          @click="handleRetry"
          variant="primary"
          :loading="isRetrying"
          class="mr-4"
        >
          重试
        </Button>
        
        <Button
          @click="handleReload"
          variant="outline"
          class="mr-4"
        >
          刷新页面
        </Button>

        <Button
          v-if="showReportButton"
          @click="handleReport"
          variant="ghost"
        >
          报告问题
        </Button>
      </div>

      <!-- 建议操作 -->
      <div v-if="suggestions.length > 0" class="error-suggestions">
        <h3 class="suggestions-title">建议尝试：</h3>
        <ul class="suggestions-list">
          <li v-for="suggestion in suggestions" :key="suggestion" class="suggestion-item">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- 正常内容 -->
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'
import { eventBus } from '../../utils/EventBus'

interface Props {
  fallbackComponent?: string
  showDetails?: boolean
  showReportButton?: boolean
  maxRetries?: number
  onError?: (error: Error, errorInfo: any) => void
  onRetry?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  fallbackComponent: '',
  showDetails: import.meta.env.DEV,
  showReportButton: true,
  maxRetries: 3
})

const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  retry: []
  recover: []
}>()

const router = useRouter()

// 错误状态
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<any>(null)
const retryCount = ref(0)
const isRetrying = ref(false)

// 计算属性
const errorTitle = computed(() => {
  if (!error.value) return '出现了一个错误'
  
  // 根据错误类型返回不同标题
  if (error.value.name === 'ChunkLoadError') {
    return '资源加载失败'
  }
  if (error.value.name === 'NetworkError') {
    return '网络连接错误'
  }
  if (error.value.message.includes('timeout')) {
    return '请求超时'
  }
  if (error.value.message.includes('permission')) {
    return '权限不足'
  }
  
  return '应用程序错误'
})

const errorDescription = computed(() => {
  if (!error.value) return '应用程序遇到了意外错误'
  
  // 根据错误类型返回用户友好的描述
  if (error.value.name === 'ChunkLoadError') {
    return '应用程序的某些资源无法加载，这可能是由于网络问题或应用程序更新导致的。'
  }
  if (error.value.name === 'NetworkError') {
    return '无法连接到服务器，请检查您的网络连接。'
  }
  if (error.value.message.includes('timeout')) {
    return '请求处理时间过长，请稍后重试。'
  }
  if (error.value.message.includes('permission')) {
    return '您没有执行此操作的权限，请联系管理员。'
  }
  
  return '应用程序遇到了意外错误，我们正在努力解决这个问题。'
})

const errorDetails = computed(() => {
  if (!error.value) return ''
  
  let details = `错误类型: ${error.value.name}\n`
  details += `错误消息: ${error.value.message}\n`
  
  if (error.value.stack) {
    details += `\n堆栈跟踪:\n${error.value.stack}`
  }
  
  if (errorInfo.value) {
    details += `\n\n组件信息:\n${JSON.stringify(errorInfo.value, null, 2)}`
  }
  
  return details
})

const suggestions = computed(() => {
  const suggestions: string[] = []
  
  if (!error.value) return suggestions
  
  if (error.value.name === 'ChunkLoadError') {
    suggestions.push('刷新页面重新加载资源')
    suggestions.push('清除浏览器缓存')
    suggestions.push('检查网络连接')
  } else if (error.value.name === 'NetworkError') {
    suggestions.push('检查网络连接')
    suggestions.push('稍后重试')
    suggestions.push('联系技术支持')
  } else if (error.value.message.includes('timeout')) {
    suggestions.push('检查网络连接速度')
    suggestions.push('稍后重试')
  } else {
    suggestions.push('刷新页面')
    suggestions.push('清除浏览器缓存')
    suggestions.push('如果问题持续存在，请联系技术支持')
  }
  
  return suggestions
})

// 错误捕获
onErrorCaptured((err: Error, instance: any, info: string) => {
  console.error('ErrorBoundary caught error:', err, info)
  
  hasError.value = true
  error.value = err
  errorInfo.value = { instance, info }
  
  // 发送错误事件
  eventBus.emit('error:boundary-caught', {
    error: err,
    errorInfo: { instance, info },
    retryCount: retryCount.value
  })
  
  // 调用错误回调
  props.onError?.(err, { instance, info })
  emit('error', err, { instance, info })
  
  // 错误上报
  reportError(err, { instance, info })
  
  // 阻止错误继续传播
  return false
})

// 全局错误监听
onMounted(() => {
  // 监听未捕获的Promise错误
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // 监听全局JavaScript错误
  window.addEventListener('error', handleGlobalError)
})

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  
  hasError.value = true
  error.value = error
  errorInfo.value = { type: 'unhandledrejection', event }
  
  eventBus.emit('error:unhandled-rejection', {
    error,
    event
  })
  
  reportError(error, { type: 'unhandledrejection' })
}

const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error)
  
  const error = event.error || new Error(event.message)
  
  hasError.value = true
  error.value = error
  errorInfo.value = { 
    type: 'global', 
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }
  
  eventBus.emit('error:global', {
    error,
    event
  })
  
  reportError(error, { type: 'global', event })
}

// 错误处理方法
const handleRetry = async () => {
  if (retryCount.value >= props.maxRetries) {
    eventBus.emit('notification:show', {
      type: 'warning',
      message: `已达到最大重试次数 (${props.maxRetries})`
    })
    return
  }
  
  isRetrying.value = true
  retryCount.value++
  
  try {
    // 调用重试回调
    await props.onRetry?.()
    
    // 重置错误状态
    hasError.value = false
    error.value = null
    errorInfo.value = null
    
    emit('retry')
    emit('recover')
    
    eventBus.emit('error:recovered', {
      retryCount: retryCount.value
    })
    
    eventBus.emit('notification:show', {
      type: 'success',
      message: '错误已恢复'
    })
    
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    
    eventBus.emit('notification:show', {
      type: 'error',
      message: '重试失败，请稍后再试'
    })
  } finally {
    isRetrying.value = false
  }
}

const handleReload = () => {
  window.location.reload()
}

const handleReport = () => {
  if (!error.value) return
  
  const reportData = {
    error: {
      name: error.value.name,
      message: error.value.message,
      stack: error.value.stack
    },
    errorInfo: errorInfo.value,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    retryCount: retryCount.value
  }
  
  // 这里可以集成错误报告服务，如 Sentry
  console.log('Error report:', reportData)
  
  eventBus.emit('error:reported', reportData)
  
  eventBus.emit('notification:show', {
    type: 'info',
    message: '错误报告已发送，感谢您的反馈'
  })
}

const reportError = (error: Error, context: any) => {
  // 错误上报逻辑
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
  
  // 发送到错误监控服务
  if (import.meta.env.PROD) {
    // 生产环境发送错误报告
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      console.error('Failed to report error:', err)
    })
  }
}

// 监听路由变化，重置错误状态
watch(() => router.currentRoute.value.path, () => {
  if (hasError.value) {
    hasError.value = false
    error.value = null
    errorInfo.value = null
    retryCount.value = 0
  }
})
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4;
}

.error-container {
  @apply max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center;
}

.error-icon {
  @apply flex justify-center mb-6;
}

.error-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-4;
}

.error-description {
  @apply text-gray-600 dark:text-gray-300 mb-6 leading-relaxed;
}

.error-details {
  @apply mb-6 text-left;
}

.error-details-toggle {
  @apply border border-gray-200 dark:border-gray-700 rounded-md;
}

.error-details-summary {
  @apply p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm;
}

.error-details-content {
  @apply border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900;
}

.error-stack {
  @apply text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-40;
}

.error-actions {
  @apply flex flex-wrap justify-center gap-2 mb-6;
}

.error-suggestions {
  @apply text-left;
}

.suggestions-title {
  @apply font-semibold text-gray-900 dark:text-white mb-3;
}

.suggestions-list {
  @apply space-y-2;
}

.suggestion-item {
  @apply text-sm text-gray-600 dark:text-gray-300 flex items-start;
}

.suggestion-item::before {
  content: '•';
  @apply text-purple-500 mr-2 flex-shrink-0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .error-container {
    @apply p-6;
  }
  
  .error-actions {
    @apply flex-col;
  }
  
  .error-actions button {
    @apply w-full mb-2;
  }
}
</style>
