/**
 * 主题组合式API
 * 提供主题管理和响应功能
 */

import { 
  ref, 
  computed, 
  inject, 
  watch, 
  onMounted,
  type Ref,
  type ComputedRef 
} from 'vue'
import { usePreferredColorScheme, useStorage } from '@vueuse/core'
import type { CompleteDesignTokens } from '../tokens'

// 主题类型定义
export type ThemeMode = 'light' | 'dark' | 'auto'

// 主题上下文接口
export interface ThemeContext {
  currentTheme: ComputedRef<'light' | 'dark'>
  themeMode: Ref<ThemeMode>
  designTokens: CompleteDesignTokens
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  isDark: ComputedRef<boolean>
  isLight: ComputedRef<boolean>
  isAuto: ComputedRef<boolean>
}

// 主题变更事件接口
export interface ThemeChangeEvent {
  from: string
  to: string
  timestamp: number
}

/**
 * 主题管理组合式API
 */
export function useTheme(): ThemeContext {
  const tokens = inject<CompleteDesignTokens>('designTokens')
  const setThemeProvider = inject<(theme: ThemeMode) => void>('setTheme')
  
  if (!tokens) {
    throw new Error('useTheme must be used within a DesignSystemProvider')
  }

  // 系统主题偏好
  const systemTheme = usePreferredColorScheme()
  
  // 用户主题设置（持久化到localStorage）
  const themeMode = useStorage<ThemeMode>('docuvault-theme', 'light')
  
  // 计算当前实际主题
  const currentTheme = computed<'light' | 'dark'>(() => {
    if (themeMode.value === 'auto') {
      return systemTheme.value === 'dark' ? 'dark' : 'light'
    }
    return themeMode.value
  })

  // 主题状态计算属性
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')
  const isAuto = computed(() => themeMode.value === 'auto')

  // 设置主题
  const setTheme = (theme: ThemeMode): void => {
    const previousTheme = currentTheme.value
    themeMode.value = theme
    
    // 调用提供者的设置方法
    if (setThemeProvider) {
      setThemeProvider(theme)
    }
    
    // 触发主题变更事件
    const changeEvent: ThemeChangeEvent = {
      from: previousTheme,
      to: currentTheme.value,
      timestamp: Date.now()
    }
    
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: changeEvent
    }))
  }

  // 切换主题
  const toggleTheme = (): void => {
    if (themeMode.value === 'light') {
      setTheme('dark')
    } else if (themeMode.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  return {
    currentTheme,
    themeMode,
    designTokens: tokens,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
    isAuto
  }
}

/**
 * 主题响应式颜色组合式API
 */
export function useThemeColors() {
  const { currentTheme, designTokens } = useTheme()
  
  // 根据主题获取颜色
  const getThemeColor = (lightColor: string, darkColor?: string): ComputedRef<string> => {
    return computed(() => {
      if (currentTheme.value === 'dark' && darkColor) {
        return darkColor
      }
      return lightColor
    })
  }

  // 主题相关的颜色计算属性
  const backgroundColor = computed(() => 
    currentTheme.value === 'dark' ? '#0f172a' : '#ffffff'
  )
  
  const textColor = computed(() => 
    currentTheme.value === 'dark' ? '#f1f5f9' : '#0f172a'
  )
  
  const borderColor = computed(() => 
    currentTheme.value === 'dark' ? '#334155' : '#e2e8f0'
  )
  
  const cardBackground = computed(() => 
    currentTheme.value === 'dark' ? '#1e293b' : '#ffffff'
  )

  return {
    getThemeColor,
    backgroundColor,
    textColor,
    borderColor,
    cardBackground,
    
    // 便捷的主题颜色获取方法
    primary: computed(() => designTokens.colors.primary[500]),
    primaryLight: computed(() => designTokens.colors.primary[100]),
    primaryDark: computed(() => designTokens.colors.primary[700]),
    
    // 语义化颜色
    success: computed(() => designTokens.colors.semantic.success[500]),
    warning: computed(() => designTokens.colors.semantic.warning[500]),
    error: computed(() => designTokens.colors.semantic.error[500]),
    info: computed(() => designTokens.colors.semantic.info[500])
  }
}

/**
 * 主题动画组合式API
 */
export function useThemeAnimation() {
  const { currentTheme } = useTheme()
  const isTransitioning = ref(false)
  
  // 主题切换动画
  const animateThemeChange = async (duration: number = 300): Promise<void> => {
    if (isTransitioning.value) return
    
    isTransitioning.value = true
    
    // 添加过渡类
    document.documentElement.classList.add('theme-transitioning')
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, duration))
    
    // 移除过渡类
    document.documentElement.classList.remove('theme-transitioning')
    isTransitioning.value = false
  }

  // 监听主题变化并触发动画
  watch(currentTheme, () => {
    animateThemeChange()
  })

  return {
    isTransitioning,
    animateThemeChange
  }
}

/**
 * 主题媒体查询组合式API
 */
export function useThemeMediaQuery() {
  const { currentTheme } = useTheme()
  
  // 媒体查询状态
  const prefersDark = ref(false)
  const prefersLight = ref(false)
  const prefersReducedMotion = ref(false)
  const prefersHighContrast = ref(false)
  
  // 更新媒体查询状态
  const updateMediaQueries = (): void => {
    if (typeof window !== 'undefined') {
      prefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersLight.value = window.matchMedia('(prefers-color-scheme: light)').matches
      prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      prefersHighContrast.value = window.matchMedia('(prefers-contrast: high)').matches
    }
  }

  // 监听媒体查询变化
  onMounted(() => {
    updateMediaQueries()
    
    if (typeof window !== 'undefined') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)')
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      
      darkModeQuery.addEventListener('change', updateMediaQueries)
      lightModeQuery.addEventListener('change', updateMediaQueries)
      reducedMotionQuery.addEventListener('change', updateMediaQueries)
      highContrastQuery.addEventListener('change', updateMediaQueries)
    }
  })

  return {
    prefersDark,
    prefersLight,
    prefersReducedMotion,
    prefersHighContrast,
    updateMediaQueries
  }
}

/**
 * 主题持久化组合式API
 */
export function useThemePersistence() {
  const { themeMode, setTheme } = useTheme()
  
  // 保存主题到localStorage
  const saveTheme = (theme: ThemeMode): void => {
    try {
      localStorage.setItem('docuvault-theme', theme)
      localStorage.setItem('docuvault-theme-timestamp', Date.now().toString())
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }
  
  // 从localStorage恢复主题
  const restoreTheme = (): ThemeMode => {
    try {
      const savedTheme = localStorage.getItem('docuvault-theme') as ThemeMode
      const timestamp = localStorage.getItem('docuvault-theme-timestamp')
      
      // 检查保存的主题是否有效
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        // 检查时间戳，如果超过30天则重置为auto
        if (timestamp) {
          const saveTime = parseInt(timestamp)
          const now = Date.now()
          const thirtyDays = 30 * 24 * 60 * 60 * 1000
          
          if (now - saveTime > thirtyDays) {
            return 'auto'
          }
        }
        
        return savedTheme
      }
    } catch (error) {
      console.warn('Failed to restore theme from localStorage:', error)
    }
    
    return 'auto' // 默认值
  }
  
  // 清除保存的主题
  const clearTheme = (): void => {
    try {
      localStorage.removeItem('docuvault-theme')
      localStorage.removeItem('docuvault-theme-timestamp')
    } catch (error) {
      console.warn('Failed to clear theme from localStorage:', error)
    }
  }

  // 监听主题变化并自动保存
  watch(themeMode, (newTheme) => {
    saveTheme(newTheme)
  }, { immediate: false })

  return {
    saveTheme,
    restoreTheme,
    clearTheme
  }
}

/**
 * 主题调试组合式API
 */
export function useThemeDebug() {
  const { currentTheme, themeMode, designTokens } = useTheme()
  
  // 主题信息
  const themeInfo = computed(() => ({
    currentTheme: currentTheme.value,
    themeMode: themeMode.value,
    timestamp: new Date().toISOString(),
    tokens: {
      colors: Object.keys(designTokens.colors),
      spacing: Object.keys(designTokens.spacing).length,
      animations: Object.keys(designTokens.animations.keyframes).length
    }
  }))
  
  // 打印主题信息
  const logThemeInfo = (): void => {
    console.group('🎨 Theme Debug Info')
    console.log('Current Theme:', currentTheme.value)
    console.log('Theme Mode:', themeMode.value)
    console.log('Design Tokens:', designTokens)
    console.log('Theme Info:', themeInfo.value)
    console.groupEnd()
  }
  
  // 验证主题配置
  const validateTheme = (): boolean => {
    const requiredTokens = ['colors', 'spacing', 'typography', 'animations', 'shadows']
    const missingTokens = requiredTokens.filter(token => !designTokens[token as keyof CompleteDesignTokens])
    
    if (missingTokens.length > 0) {
      console.error('Missing design tokens:', missingTokens)
      return false
    }
    
    return true
  }

  return {
    themeInfo,
    logThemeInfo,
    validateTheme
  }
}

export default useTheme
