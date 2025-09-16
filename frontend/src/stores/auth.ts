import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/api'
import { apiClient } from '../services/ApiClient'
import { eventBus } from '../utils/EventBus'

// 检查后端是否可用
const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch('/health', {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isContentManager = computed(() => 
    user.value?.role === 'CONTENT_MANAGER' || user.value?.role === 'ADMIN'
  )

  // 初始化认证状态
  const initAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedUser) {
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)
    }
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null

      // 检查是否为开发模式且后端不可用，使用模拟数据
      const isDev = import.meta.env.DEV
      const useMockData = isDev // 暂时总是使用模拟数据

      if (useMockData) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟登录验证
        if (credentials.email === 'demo@docuvault.com' && credentials.password === 'demo123') {
          const mockUser: User = {
            id: '1',
            email: credentials.email,
            nickname: '演示用户',
            avatarUrl: '',
            role: 'USER',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          const mockToken = 'mock-jwt-token-' + Date.now()
          const mockRefreshToken = 'mock-refresh-token-' + Date.now()

          // 更新状态
          user.value = mockUser
          token.value = mockToken
          refreshToken.value = mockRefreshToken

          // 持久化存储
          localStorage.setItem('auth_token', mockToken)
          localStorage.setItem('refresh_token', mockRefreshToken)
          localStorage.setItem('user_data', JSON.stringify(mockUser))

          // 触发登录事件
          eventBus.emit('user:login', { userId: mockUser.id, token: mockToken })

          return { success: true }
        } else {
          throw new Error('邮箱或密码错误（演示账号：demo@docuvault.com / demo123）')
        }
      } else {
        // 真实API调用
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials)

        if (response.success && response.data) {
          const { user: userData, token: authToken, refreshToken: refreshTokenData } = response.data

          // 更新状态
          user.value = userData
          token.value = authToken
          refreshToken.value = refreshTokenData

          // 持久化存储
          localStorage.setItem('auth_token', authToken)
          localStorage.setItem('refresh_token', refreshTokenData)
          localStorage.setItem('user_data', JSON.stringify(userData))

          // 触发登录事件
          eventBus.emit('user:login', { userId: userData.id, token: authToken })

          return { success: true }
        } else {
          throw new Error(response.message || '登录失败')
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null

      // 检查是否为开发模式且后端不可用，使用模拟数据
      const isDev = import.meta.env.DEV
      const useMockData = isDev && !await checkBackendAvailable()

      if (useMockData) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟注册成功
        const mockUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          nickname: userData.nickname,
          avatarUrl: '',
          role: 'USER',
          emailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const mockToken = 'mock-jwt-token-' + Date.now()
        const mockRefreshToken = 'mock-refresh-token-' + Date.now()

        // 更新状态
        user.value = mockUser
        token.value = mockToken
        refreshToken.value = mockRefreshToken

        // 持久化存储
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('refresh_token', mockRefreshToken)
        localStorage.setItem('user_data', JSON.stringify(mockUser))

        // 触发登录事件
        eventBus.emit('user:login', { userId: mockUser.id, token: mockToken })

        return { success: true }
      } else {
        // 真实API调用
        const response = await apiClient.post<LoginResponse>('/auth/register', userData)

        if (response.success && response.data) {
          const { user: newUser, token: authToken, refreshToken: refreshTokenData } = response.data

          // 更新状态
          user.value = newUser
          token.value = authToken
          refreshToken.value = refreshTokenData

          // 持久化存储
          localStorage.setItem('auth_token', authToken)
          localStorage.setItem('refresh_token', refreshTokenData)
          localStorage.setItem('user_data', JSON.stringify(newUser))

          // 触发登录事件
          eventBus.emit('user:login', { userId: newUser.id, token: authToken })

          return { success: true }
        } else {
          throw new Error(response.message || '注册失败')
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 调用后端登出接口
      if (token.value) {
        await apiClient.post('/auth/logout')
      }
    } catch (err) {
      console.warn('登出请求失败:', err)
    } finally {
      // 清除本地状态
      const userId = user.value?.id || ''
      
      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null

      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')

      // 触发登出事件
      eventBus.emit('user:logout', { userId })
    }
  }

  // 更新用户信息
  const updateProfile = async (updates: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.put<User>('/auth/profile', updates)
      
      if (response.success && response.data) {
        const updatedUser = response.data
        user.value = updatedUser

        // 更新本地存储
        localStorage.setItem('user_data', JSON.stringify(updatedUser))

        // 触发用户信息更新事件
        eventBus.emit('user:profile-updated', { 
          userId: updatedUser.id, 
          changes: updates 
        })

        return { success: true }
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '更新失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 验证邮箱
  const verifyEmail = async (token: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.post('/auth/verify-email', { token })
      
      if (response.success) {
        if (user.value) {
          user.value.emailVerified = true
          localStorage.setItem('user_data', JSON.stringify(user.value))
        }
        return { success: true }
      } else {
        throw new Error(response.message || '验证失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '验证失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.post('/auth/reset-password', { email })
      
      if (response.success) {
        return { success: true, message: '重置邮件已发送' }
      } else {
        throw new Error(response.message || '重置失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '重置失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (!token.value) return false

    try {
      const response = await apiClient.get<User>('/auth/me')
      
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user_data', JSON.stringify(response.data))
        return true
      } else {
        await logout()
        return false
      }
    } catch (err) {
      await logout()
      return false
    }
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    isContentManager,
    
    // 方法
    initAuth,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resetPassword,
    clearError,
    checkAuth
  }
})
