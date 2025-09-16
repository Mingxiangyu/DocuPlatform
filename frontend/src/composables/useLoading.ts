import { ref, computed, watch } from 'vue'
import { eventBus } from '../utils/EventBus'

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 加载配置
export interface LoadingConfig {
  minDuration?: number // 最小加载时间（毫秒）
  timeout?: number // 超时时间（毫秒）
  showSkeleton?: boolean // 是否显示骨架屏
  skeletonVariant?: 'rect' | 'circle' | 'text' | 'card' | 'list' | 'table'
  retryable?: boolean // 是否可重试
  maxRetries?: number // 最大重试次数
}

// 加载结果
export interface LoadingResult<T = any> {
  data?: T
  error?: string | Error
  success: boolean
}

// 全局加载状态管理
const globalLoadingStates = new Map<string, {
  isLoading: boolean
  error: string | null
  retryCount: number
}>()

export function useLoading<T = any>(
  key?: string,
  config: LoadingConfig = {}
) {
  const {
    minDuration = 300,
    timeout = 30000,
    showSkeleton = true,
    skeletonVariant = 'rect',
    retryable = true,
    maxRetries = 3
  } = config

  // 本地状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)
  const retryCount = ref(0)
  const startTime = ref(0)

  // 计算属性
  const state = computed((): LoadingState => {
    if (isLoading.value) return 'loading'
    if (error.value) return 'error'
    if (data.value !== null) return 'success'
    return 'idle'
  })

  const canRetry = computed(() => {
    return retryable && error.value && retryCount.value < maxRetries
  })

  const isGlobalLoading = computed(() => {
    if (!key) return false
    return globalLoadingStates.get(key)?.isLoading || false
  })

  // 更新全局状态
  const updateGlobalState = () => {
    if (key) {
      globalLoadingStates.set(key, {
        isLoading: isLoading.value,
        error: error.value,
        retryCount: retryCount.value
      })
      
      eventBus.emit('loading:state-changed', {
        key,
        isLoading: isLoading.value,
        error: error.value,
        state: state.value
      })
    }
  }

  // 监听状态变化
  watch([isLoading, error], updateGlobalState)

  // 执行异步操作
  const execute = async <R = T>(
    asyncFn: () => Promise<R>,
    options: { 
      skipMinDuration?: boolean
      onSuccess?: (data: R) => void
      onError?: (error: Error) => void
    } = {}
  ): Promise<LoadingResult<R>> => {
    try {
      // 重置状态
      error.value = null
      data.value = null
      isLoading.value = true
      startTime.value = Date.now()

      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), timeout)
      })

      // 执行异步操作
      const resultPromise = asyncFn()
      const result = await Promise.race([resultPromise, timeoutPromise])

      // 确保最小加载时间
      if (!options.skipMinDuration) {
        const elapsed = Date.now() - startTime.value
        if (elapsed < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
        }
      }

      // 成功处理
      data.value = result as T
      isLoading.value = false
      retryCount.value = 0

      options.onSuccess?.(result)

      eventBus.emit('loading:success', {
        key,
        data: result,
        duration: Date.now() - startTime.value
      })

      return { data: result, success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      error.value = errorMessage
      isLoading.value = false

      options.onError?.(err instanceof Error ? err : new Error(errorMessage))

      eventBus.emit('loading:error', {
        key,
        error: errorMessage,
        retryCount: retryCount.value,
        duration: Date.now() - startTime.value
      })

      return { error: err, success: false }
    }
  }

  // 重试操作
  const retry = async <R = T>(
    asyncFn: () => Promise<R>,
    options?: Parameters<typeof execute>[1]
  ): Promise<LoadingResult<R>> => {
    if (!canRetry.value) {
      return { error: new Error('无法重试'), success: false }
    }

    retryCount.value++
    
    eventBus.emit('loading:retry', {
      key,
      retryCount: retryCount.value,
      maxRetries
    })

    return execute(asyncFn, options)
  }

  // 重置状态
  const reset = () => {
    isLoading.value = false
    error.value = null
    data.value = null
    retryCount.value = 0
    startTime.value = 0
    
    if (key) {
      globalLoadingStates.delete(key)
      eventBus.emit('loading:reset', { key })
    }
  }

  // 设置数据
  const setData = (newData: T) => {
    data.value = newData
    error.value = null
  }

  // 设置错误
  const setError = (newError: string | Error) => {
    error.value = newError instanceof Error ? newError.message : newError
    data.value = null
  }

  return {
    // 状态
    isLoading,
    error,
    data,
    state,
    retryCount,
    canRetry,
    isGlobalLoading,
    
    // 配置
    showSkeleton: ref(showSkeleton),
    skeletonVariant: ref(skeletonVariant),
    
    // 方法
    execute,
    retry,
    reset,
    setData,
    setError
  }
}

// 全局加载状态查询
export function useGlobalLoading() {
  const hasAnyLoading = computed(() => {
    return Array.from(globalLoadingStates.values()).some(state => state.isLoading)
  })

  const getLoadingState = (key: string) => {
    return globalLoadingStates.get(key) || {
      isLoading: false,
      error: null,
      retryCount: 0
    }
  }

  const getAllLoadingStates = () => {
    return new Map(globalLoadingStates)
  }

  const clearAllLoading = () => {
    globalLoadingStates.clear()
    eventBus.emit('loading:all-cleared', {})
  }

  return {
    hasAnyLoading,
    getLoadingState,
    getAllLoadingStates,
    clearAllLoading
  }
}

// 批量加载管理
export function useBatchLoading(keys: string[]) {
  const loadingStates = computed(() => {
    return keys.map(key => ({
      key,
      ...useLoading(key)
    }))
  })

  const isAnyLoading = computed(() => {
    return loadingStates.value.some(state => state.isLoading.value)
  })

  const hasAnyError = computed(() => {
    return loadingStates.value.some(state => state.error.value)
  })

  const allErrors = computed(() => {
    return loadingStates.value
      .filter(state => state.error.value)
      .map(state => ({ key: state.key, error: state.error.value }))
  })

  const executeAll = async <T>(
    operations: Record<string, () => Promise<T>>
  ): Promise<Record<string, LoadingResult<T>>> => {
    const results: Record<string, LoadingResult<T>> = {}
    
    const promises = Object.entries(operations).map(async ([key, operation]) => {
      const loadingState = loadingStates.value.find(state => state.key === key)
      if (loadingState) {
        results[key] = await loadingState.execute(operation)
      }
    })

    await Promise.allSettled(promises)
    return results
  }

  const resetAll = () => {
    loadingStates.value.forEach(state => state.reset())
  }

  return {
    loadingStates,
    isAnyLoading,
    hasAnyError,
    allErrors,
    executeAll,
    resetAll
  }
}

// 加载状态装饰器（用于自动处理加载状态）
export function withLoading<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  loadingKey?: string,
  config?: LoadingConfig
) {
  const loading = useLoading<R>(loadingKey, config)

  return {
    ...loading,
    execute: (...args: T) => loading.execute(() => fn(...args))
  }
}

// 页面级加载状态
export function usePageLoading(pageName: string) {
  return useLoading(`page:${pageName}`, {
    minDuration: 500,
    showSkeleton: true,
    skeletonVariant: 'card'
  })
}

// API 请求加载状态
export function useApiLoading(endpoint: string) {
  return useLoading(`api:${endpoint}`, {
    minDuration: 200,
    timeout: 15000,
    retryable: true,
    maxRetries: 2
  })
}
