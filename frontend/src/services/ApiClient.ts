import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError, ApiClientConfig } from '../types/api'
import { eventBus } from '../utils/EventBus'

// Token获取函数，避免循环依赖
let getAuthToken: (() => string | null) | null = null

export const setTokenProvider = (provider: () => string | null) => {
  getAuthToken = provider
}

export class ApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig
  private cache = new Map<string, { data: any; timestamp: number }>()

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCache: import.meta.env.VITE_CACHE_ENABLED === 'true',
      cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000,
      ...config
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证token（从Pinia store获取，符合v2.1规范）
        const token = getAuthToken ? getAuthToken() : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 触发加载开始事件
        eventBus.emit('ui:loading-start', { operation: config.url || 'api' })

        return config
      },
      (error) => {
        eventBus.emit('ui:loading-end', { operation: 'api' })
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        eventBus.emit('ui:loading-end', { operation: response.config.url || 'api' })
        return response
      },
      async (error) => {
        eventBus.emit('ui:loading-end', { operation: error.config?.url || 'api' })

        const originalRequest = error.config

        // 处理401错误（token过期）
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            await this.refreshToken()
            return this.client(originalRequest)
          } catch (refreshError) {
            // 刷新token失败，跳转到登录页
            eventBus.emit('user:logout', { userId: '' })
            return Promise.reject(refreshError)
          }
        }

        // 处理网络错误
        if (!error.response) {
          eventBus.emit('error:network', {
            type: error.code === 'ECONNABORTED' ? 'timeout' : 'offline',
            details: error.message
          })
        } else {
          // 处理API错误
          eventBus.emit('error:api', {
            endpoint: error.config?.url || '',
            error: error,
            context: {
              status: error.response.status,
              data: error.response.data
            }
          })
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken
    })

    const { token, refreshToken: newRefreshToken } = response.data.data
    localStorage.setItem('auth_token', token)
    localStorage.setItem('refresh_token', newRefreshToken)
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}:${JSON.stringify(params || {})}`
  }

  private getFromCache(key: string): any | null {
    if (!this.config.enableCache) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any): void {
    if (!this.config.enableCache) return

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // 清理过期缓存
    if (this.cache.size > 100) {
      const now = Date.now()
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.config.cacheTimeout) {
          this.cache.delete(k)
        }
      }
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
    attempts: number = this.config.retryAttempts
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await requestFn()
    } catch (error: any) {
      if (attempts > 1 && error.response?.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        return this.retryRequest(requestFn, attempts - 1)
      }
      throw error
    }
  }

  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(url, params)
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached
    }

    const response = await this.retryRequest(() =>
      this.client.get<ApiResponse<T>>(url, { params, ...config })
    )

    this.setCache(cacheKey, response.data)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.client.post<ApiResponse<T>>(url, data, config)
    )
    
    // 清除相关缓存
    this.invalidateCache(url)
    
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.client.put<ApiResponse<T>>(url, data, config)
    )
    
    this.invalidateCache(url)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.retryRequest(() =>
      this.client.delete<ApiResponse<T>>(url, config)
    )
    
    this.invalidateCache(url)
    return response.data
  }

  private invalidateCache(url: string): void {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(url)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key)
      eventBus.emit('cache:invalidated', { key, reason: 'api_mutation' })
    })
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 创建默认API客户端实例
export const apiClient = new ApiClient()

// 开发环境下暴露到全局，便于调试
if (import.meta.env.DEV) {
  ;(window as any).__apiClient = apiClient
}
