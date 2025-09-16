/**
 * 设计系统组合式API导出
 * 统一导出所有设计系统相关的composables
 */

// 设计令牌相关
export * from './useDesignTokens'

// 动画相关
export * from './useAnimation'

// 主题相关
export * from './useTheme'

// 滚动相关
export * from './useScrollTrigger'

// 默认导出
export { useDesignTokens } from './useDesignTokens'
export { useAnimation } from './useAnimation'
export { useTheme } from './useTheme'
export { useScrollTrigger, useScrollProgress } from './useScrollTrigger'
