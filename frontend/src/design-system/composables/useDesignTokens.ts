/**
 * 设计令牌组合式API
 * 提供便捷的设计令牌访问和操作方法
 */

import { computed, inject, type ComputedRef } from 'vue'
import type { CompleteDesignTokens, ColorSystem, SpacingSystem, ShadowSystem } from '../tokens'

// 设计令牌组合式API返回类型
export interface UseDesignTokensReturn {
  tokens: CompleteDesignTokens
  getColor: (path: string) => string
  getSpacing: (key: string | number) => string
  getShadow: (key: keyof ShadowSystem) => string
  getAnimation: (key: string) => any
  getFontSize: (key: string) => string
  getFontWeight: (key: string) => string
  getBreakpoint: (key: string) => string
  getBorderRadius: (key: string) => string
  
  // 便捷访问器
  colors: ColorSystem
  spacing: SpacingSystem
  shadows: ShadowSystem
  
  // 响应式计算属性
  primaryColors: ComputedRef<any>
  categoryColors: ComputedRef<any>
  gradients: ComputedRef<any>
  
  // 工具方法
  createColorVariant: (baseColor: string, opacity?: number) => any
  createSpacingScale: (base: number, steps: number[]) => string[]
  createShadowVariant: (shadow: string, color: string) => string
}

/**
 * 设计令牌组合式API
 * 提供对设计系统令牌的便捷访问
 */
export function useDesignTokens(): UseDesignTokensReturn {
  // 注入设计令牌
  const tokens = inject<CompleteDesignTokens>('designTokens')
  
  if (!tokens) {
    throw new Error('useDesignTokens must be used within a DesignSystemProvider')
  }

  // 颜色访问器
  const getColor = (path: string): string => {
    const keys = path.split('.')
    let current: any = tokens.colors
    
    for (const key of keys) {
      current = current?.[key]
      if (current === undefined) {
        console.warn(`Color path "${path}" not found in design tokens`)
        return ''
      }
    }
    
    return current
  }

  // 间距访问器
  const getSpacing = (key: string | number): string => {
    const value = tokens.spacing[key]
    if (!value) {
      console.warn(`Spacing key "${key}" not found in design tokens`)
      return tokens.spacing[4] // 默认返回16px
    }
    return value
  }

  // 阴影访问器
  const getShadow = (key: keyof ShadowSystem): string => {
    const value = tokens.shadows[key]
    if (!value) {
      console.warn(`Shadow key "${key}" not found in design tokens`)
      return tokens.shadows.soft // 默认返回soft阴影
    }
    return value
  }

  // 动画访问器
  const getAnimation = (key: string): any => {
    const animation = tokens.animations.keyframes[key]
    if (!animation) {
      console.warn(`Animation "${key}" not found in design tokens`)
      return {}
    }
    return animation
  }

  // 字体尺寸访问器
  const getFontSize = (key: string): string => {
    const fontSize = tokens.typography.fontSize[key as keyof typeof tokens.typography.fontSize]
    if (!fontSize) {
      console.warn(`Font size "${key}" not found in design tokens`)
      return tokens.typography.fontSize.base[0] // 默认返回base尺寸
    }
    return Array.isArray(fontSize) ? fontSize[0] : fontSize
  }

  // 字体权重访问器
  const getFontWeight = (key: string): string => {
    const fontWeight = tokens.typography.fontWeight[key as keyof typeof tokens.typography.fontWeight]
    if (!fontWeight) {
      console.warn(`Font weight "${key}" not found in design tokens`)
      return tokens.typography.fontWeight.normal // 默认返回normal权重
    }
    return fontWeight
  }

  // 断点访问器
  const getBreakpoint = (key: string): string => {
    const breakpoint = tokens.breakpoints[key as keyof typeof tokens.breakpoints]
    if (!breakpoint) {
      console.warn(`Breakpoint "${key}" not found in design tokens`)
      return tokens.breakpoints.md // 默认返回md断点
    }
    return breakpoint
  }

  // 圆角访问器
  const getBorderRadius = (key: string): string => {
    const radius = tokens.borderRadius[key as keyof typeof tokens.borderRadius]
    if (!radius) {
      console.warn(`Border radius "${key}" not found in design tokens`)
      return tokens.borderRadius.base // 默认返回base圆角
    }
    return radius
  }

  // 响应式计算属性
  const primaryColors = computed(() => tokens.colors.primary)
  const categoryColors = computed(() => tokens.colors.category)
  const gradients = computed(() => tokens.colors.gradients)

  // 工具方法：创建颜色变体
  const createColorVariant = (baseColor: string, opacity: number = 0.1) => {
    const rgb = hexToRgb(baseColor)
    return {
      background: `rgba(${rgb}, ${opacity})`,
      border: `rgba(${rgb}, ${opacity * 2})`,
      text: baseColor,
      icon: baseColor,
      gradient: `linear-gradient(135deg, ${baseColor} 0%, ${darkenColor(baseColor, 20)} 100%)`
    }
  }

  // 工具方法：创建间距比例
  const createSpacingScale = (base: number, steps: number[]): string[] => {
    return steps.map(step => `${base * step}px`)
  }

  // 工具方法：创建阴影变体
  const createShadowVariant = (shadow: string, color: string): string => {
    // 将默认的黑色阴影替换为指定颜色
    return shadow.replace(/rgba\(0,\s*0,\s*0,/g, `rgba(${hexToRgb(color)},`)
  }

  return {
    tokens,
    getColor,
    getSpacing,
    getShadow,
    getAnimation,
    getFontSize,
    getFontWeight,
    getBreakpoint,
    getBorderRadius,
    
    // 便捷访问器
    colors: tokens.colors,
    spacing: tokens.spacing,
    shadows: tokens.shadows,
    
    // 响应式计算属性
    primaryColors,
    categoryColors,
    gradients,
    
    // 工具方法
    createColorVariant,
    createSpacingScale,
    createShadowVariant
  }
}

// 颜色相关的组合式API
export function useColors() {
  const { getColor, primaryColors, categoryColors, gradients, createColorVariant } = useDesignTokens()
  
  return {
    getColor,
    primaryColors,
    categoryColors,
    gradients,
    createColorVariant,
    
    // 便捷的颜色获取方法
    getPrimaryColor: (shade: string | number) => getColor(`primary.${shade}`),
    getCategoryColor: (category: string, property: string = 'text') => getColor(`category.${category}.${property}`),
    getGradient: (type: string) => getColor(`gradients.${type}`)
  }
}

// 间距相关的组合式API
export function useSpacing() {
  const { getSpacing, spacing, createSpacingScale } = useDesignTokens()
  
  return {
    getSpacing,
    spacing,
    createSpacingScale,
    
    // 便捷的间距获取方法
    getComponentSpacing: (size: 'tight' | 'normal' | 'loose' | 'spacious') => {
      const spacingMap = {
        tight: getSpacing(2),      // 8px
        normal: getSpacing(4),     // 16px
        loose: getSpacing(6),      // 24px
        spacious: getSpacing(8)    // 32px
      }
      return spacingMap[size]
    },
    
    getLayoutSpacing: (type: 'section' | 'container' | 'page' | 'hero') => {
      const spacingMap = {
        section: getSpacing(16),   // 64px
        container: getSpacing(20), // 80px
        page: getSpacing(24),      // 96px
        hero: getSpacing(32)       // 128px
      }
      return spacingMap[type]
    }
  }
}

// 阴影相关的组合式API
export function useShadows() {
  const { getShadow, shadows, createShadowVariant } = useDesignTokens()
  
  return {
    getShadow,
    shadows,
    createShadowVariant,
    
    // 便捷的阴影获取方法
    getCardShadow: (state: 'default' | 'hover' | 'active' | 'focus') => {
      const shadowMap = {
        default: getShadow('soft'),
        hover: getShadow('medium'),
        active: getShadow('large'),
        focus: getShadow('glow')
      }
      return shadowMap[state]
    },
    
    getButtonShadow: (state: 'default' | 'hover' | 'active') => {
      const shadowMap = {
        default: getShadow('subtle'),
        hover: getShadow('soft'),
        active: getShadow('none')
      }
      return shadowMap[state]
    }
  }
}

// 字体相关的组合式API
export function useTypography() {
  const { getFontSize, getFontWeight, tokens } = useDesignTokens()
  
  return {
    getFontSize,
    getFontWeight,
    fontFamily: tokens.typography.fontFamily,
    
    // 便捷的字体获取方法
    getHeadingStyle: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      const sizeMap = {
        1: getFontSize('5xl'),
        2: getFontSize('4xl'),
        3: getFontSize('3xl'),
        4: getFontSize('2xl'),
        5: getFontSize('xl'),
        6: getFontSize('lg')
      }
      
      return {
        fontSize: sizeMap[level],
        fontWeight: level <= 2 ? getFontWeight('bold') : getFontWeight('semibold'),
        fontFamily: tokens.typography.fontFamily.serif.join(', ')
      }
    },
    
    getBodyStyle: (size: 'small' | 'base' | 'large') => {
      const sizeMap = {
        small: getFontSize('sm'),
        base: getFontSize('base'),
        large: getFontSize('lg')
      }
      
      return {
        fontSize: sizeMap[size],
        fontWeight: getFontWeight('normal'),
        fontFamily: tokens.typography.fontFamily.sans.join(', ')
      }
    }
  }
}

// 工具函数：十六进制转RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0, 0, 0'
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ].join(', ')
}

// 工具函数：颜色加深
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

export default useDesignTokens
