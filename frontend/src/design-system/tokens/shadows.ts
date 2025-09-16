/**
 * 阴影系统 - 设计令牌
 * 完整的阴影层次系统，用于创建视觉深度
 */

import type { ShadowSystem } from './index'

// 阴影系统定义
export const shadowTokens: ShadowSystem = {
  // 无阴影
  none: 'none',
  
  // 微妙阴影 - 用于轻微的层次分离
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  
  // 柔和阴影 - 用于卡片和按钮的默认状态
  soft: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  
  // 中等阴影 - 用于悬停状态和重要元素
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  
  // 大阴影 - 用于模态框和弹出层
  large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // 浮动阴影 - 用于强烈的悬停效果
  floating: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // 发光阴影 - 用于焦点状态和特殊强调
  glow: '0 0 0 1px rgba(168, 85, 247, 0.05), 0 4px 16px rgba(168, 85, 247, 0.12)'
}

// 彩色阴影系统
export const coloredShadows = {
  // 主色调阴影
  primary: {
    subtle: '0 1px 2px 0 rgba(168, 85, 247, 0.05)',
    soft: '0 1px 3px 0 rgba(168, 85, 247, 0.1), 0 1px 2px 0 rgba(168, 85, 247, 0.06)',
    medium: '0 4px 6px -1px rgba(168, 85, 247, 0.1), 0 2px 4px -1px rgba(168, 85, 247, 0.06)',
    large: '0 10px 15px -3px rgba(168, 85, 247, 0.1), 0 4px 6px -2px rgba(168, 85, 247, 0.05)',
    glow: '0 0 0 1px rgba(168, 85, 247, 0.1), 0 4px 16px rgba(168, 85, 247, 0.2)'
  },
  
  // 成功色阴影
  success: {
    subtle: '0 1px 2px 0 rgba(34, 197, 94, 0.05)',
    soft: '0 1px 3px 0 rgba(34, 197, 94, 0.1), 0 1px 2px 0 rgba(34, 197, 94, 0.06)',
    medium: '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
    glow: '0 0 0 1px rgba(34, 197, 94, 0.1), 0 4px 16px rgba(34, 197, 94, 0.2)'
  },
  
  // 警告色阴影
  warning: {
    subtle: '0 1px 2px 0 rgba(245, 158, 11, 0.05)',
    soft: '0 1px 3px 0 rgba(245, 158, 11, 0.1), 0 1px 2px 0 rgba(245, 158, 11, 0.06)',
    medium: '0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06)',
    glow: '0 0 0 1px rgba(245, 158, 11, 0.1), 0 4px 16px rgba(245, 158, 11, 0.2)'
  },
  
  // 错误色阴影
  error: {
    subtle: '0 1px 2px 0 rgba(239, 68, 68, 0.05)',
    soft: '0 1px 3px 0 rgba(239, 68, 68, 0.1), 0 1px 2px 0 rgba(239, 68, 68, 0.06)',
    medium: '0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06)',
    glow: '0 0 0 1px rgba(239, 68, 68, 0.1), 0 4px 16px rgba(239, 68, 68, 0.2)'
  }
}

// 内阴影系统
export const innerShadows = {
  subtle: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  soft: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  medium: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  deep: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.12)'
}

// 组合阴影系统
export const combinedShadows = {
  // 卡片阴影组合
  card: {
    default: shadowTokens.soft,
    hover: shadowTokens.medium,
    active: shadowTokens.large,
    focus: shadowTokens.glow
  },
  
  // 按钮阴影组合
  button: {
    default: shadowTokens.subtle,
    hover: shadowTokens.soft,
    active: innerShadows.soft,
    focus: coloredShadows.primary.glow
  },
  
  // 模态框阴影组合
  modal: {
    backdrop: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    content: shadowTokens.large,
    overlay: '0 0 50px rgba(0, 0, 0, 0.3)'
  },
  
  // 下拉菜单阴影组合
  dropdown: {
    default: shadowTokens.medium,
    large: shadowTokens.large
  },
  
  // 工具提示阴影
  tooltip: {
    default: shadowTokens.soft,
    dark: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)'
  }
}

// 特殊效果阴影
export const effectShadows = {
  // 浮雕效果
  emboss: {
    light: '0 1px 0 rgba(255, 255, 255, 0.1), 0 -1px 0 rgba(0, 0, 0, 0.1)',
    medium: '0 2px 0 rgba(255, 255, 255, 0.1), 0 -2px 0 rgba(0, 0, 0, 0.1)',
    strong: '0 3px 0 rgba(255, 255, 255, 0.1), 0 -3px 0 rgba(0, 0, 0, 0.1)'
  },
  
  // 凹陷效果
  inset: {
    light: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
    medium: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    strong: 'inset 0 4px 8px rgba(0, 0, 0, 0.15)'
  },
  
  // 发光效果
  glow: {
    primary: '0 0 20px rgba(168, 85, 247, 0.3)',
    success: '0 0 20px rgba(34, 197, 94, 0.3)',
    warning: '0 0 20px rgba(245, 158, 11, 0.3)',
    error: '0 0 20px rgba(239, 68, 68, 0.3)',
    info: '0 0 20px rgba(59, 130, 246, 0.3)'
  },
  
  // 霓虹效果
  neon: {
    primary: '0 0 5px rgba(168, 85, 247, 0.5), 0 0 10px rgba(168, 85, 247, 0.4), 0 0 15px rgba(168, 85, 247, 0.3)',
    cyan: '0 0 5px rgba(6, 182, 212, 0.5), 0 0 10px rgba(6, 182, 212, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)'
  }
}

// CSS变量映射
export const shadowCSSVariables = {
  // 基础阴影变量
  '--shadow-none': shadowTokens.none,
  '--shadow-subtle': shadowTokens.subtle,
  '--shadow-soft': shadowTokens.soft,
  '--shadow-medium': shadowTokens.medium,
  '--shadow-large': shadowTokens.large,
  '--shadow-floating': shadowTokens.floating,
  '--shadow-glow': shadowTokens.glow,
  
  // 组合阴影变量
  '--shadow-card-default': combinedShadows.card.default,
  '--shadow-card-hover': combinedShadows.card.hover,
  '--shadow-card-active': combinedShadows.card.active,
  '--shadow-card-focus': combinedShadows.card.focus,
  
  '--shadow-button-default': combinedShadows.button.default,
  '--shadow-button-hover': combinedShadows.button.hover,
  '--shadow-button-active': combinedShadows.button.active,
  '--shadow-button-focus': combinedShadows.button.focus,
  
  '--shadow-modal-content': combinedShadows.modal.content,
  '--shadow-modal-overlay': combinedShadows.modal.overlay,
  
  '--shadow-dropdown': combinedShadows.dropdown.default,
  '--shadow-tooltip': combinedShadows.tooltip.default,
  
  // 彩色阴影变量
  '--shadow-primary-glow': coloredShadows.primary.glow,
  '--shadow-success-glow': coloredShadows.success.glow,
  '--shadow-warning-glow': coloredShadows.warning.glow,
  '--shadow-error-glow': coloredShadows.error.glow,
  
  // 特效阴影变量
  '--shadow-glow-primary': effectShadows.glow.primary,
  '--shadow-glow-success': effectShadows.glow.success,
  '--shadow-glow-warning': effectShadows.glow.warning,
  '--shadow-glow-error': effectShadows.glow.error
}

// 阴影工具函数
export function getShadow(key: keyof ShadowSystem): string {
  return shadowTokens[key]
}

// 创建自定义阴影
export function createShadow(
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number = 0,
  color: string = 'rgba(0, 0, 0, 0.1)'
): string {
  return `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`
}

// 创建多层阴影
export function createLayeredShadow(...shadows: string[]): string {
  return shadows.join(', ')
}

// 响应式阴影生成器
export function createResponsiveShadow(config: {
  mobile?: string
  tablet?: string
  desktop?: string
}) {
  return {
    mobile: config.mobile || shadowTokens.soft,
    tablet: config.tablet || shadowTokens.medium,
    desktop: config.desktop || shadowTokens.large
  }
}

// 阴影动画生成器
export function createShadowTransition(
  fromShadow: string,
  toShadow: string,
  duration: string = '300ms',
  easing: string = 'ease-out'
): string {
  return `box-shadow ${duration} ${easing}`
}

export default shadowTokens
