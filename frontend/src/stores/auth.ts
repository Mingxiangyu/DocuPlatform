import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/api'
import { apiClient } from '../services/ApiClient'
import { eventBus } from '../utils/EventBus'

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

  // 初始化认证状态（简化版，Pinia插件会自动恢复状态）
  const initAuth = () => {
    console.log('initAuth - 当前认证状态:', {
      isAuthenticated: isAuthenticated.value,
      hasUser: !!user.value,
      hasToken: !!token.value,
      userEmail: user.value?.email
    })

    // 如果有认证信息但状态不一致，清理数据
    if ((user.value && !token.value) || (!user.value && token.value)) {
      console.warn('initAuth - 认证状态不一致，清理数据')
      user.value = null
      token.value = null
      refreshToken.value = null
    }
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null

      // 真实API调用
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)

      if (response.success && response.data) {
        const { user: userData, token: authToken, refreshToken: refreshTokenData } = response.data

        // 更新状态（Pinia插件会自动持久化）
        user.value = userData
        token.value = authToken
        refreshToken.value = refreshTokenData

        // 触发登录事件
        eventBus.emit('user:login', { userId: userData.id, token: authToken })

        return { success: true }
      } else {
        throw new Error(response.message || '登录失败')
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

      // 真实API调用
      const response = await apiClient.post<LoginResponse>('/api/auth/register', userData)

      if (response.success && response.data) {
        const { user: newUser, token: authToken, refreshToken: refreshTokenData } = response.data

        // 更新状态（Pinia插件会自动持久化）
        user.value = newUser
        token.value = authToken
        refreshToken.value = refreshTokenData

        // 触发登录事件
        eventBus.emit('user:login', { userId: newUser.id, token: authToken })

        return { success: true }
      } else {
        throw new Error(response.message || '注册失败')
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
        await apiClient.post('/api/auth/logout')
      }
    } catch (err) {
      console.warn('登出请求失败:', err)
    } finally {
      // 清除本地状态（Pinia插件会自动清除持久化数据）
      const userId = user.value?.id || ''

      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null

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
        // 更新状态（Pinia插件会自动持久化）
        user.value = updatedUser

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

      const response = await apiClient.post('/api/auth/verify-email', { token })
      
      if (response.success) {
        if (user.value) {
          // 更新用户邮箱验证状态（Pinia插件会自动持久化）
          user.value.emailVerified = true
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

      const response = await apiClient.post('/api/auth/reset-password', { email })
      
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
      const response = await apiClient.get<User>('/api/auth/me')

      if (response.success && response.data) {
        // 更新用户信息（Pinia插件会自动持久化）
        user.value = response.data
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
}, {
  persist: {
    storage: localStorage,
    pick: ['user', 'token', 'refreshToken'],
    beforeHydrate: (ctx) => {
      console.log('Auth state hydrating...')
    },
    afterHydrate: (ctx) => {
      console.log('Auth state hydrated:', ctx.store.isAuthenticated)
    }
  }
})
