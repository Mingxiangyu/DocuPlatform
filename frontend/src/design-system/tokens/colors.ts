/**
 * 颜色系统 - 设计令牌
 * 基于色彩心理学和高保真原型的完整颜色系统
 */

import type { ColorSystem } from './index'

// 主色调系统 - 紫色系
const primaryColors = {
  50: '#faf5ff',   // 最浅紫 - 背景色
  100: '#f3e8ff',  // 浅紫 - 悬停背景
  200: '#e9d5ff',  // 中浅紫 - 边框色
  300: '#d8b4fe',  // 中紫 - 禁用状态
  400: '#c084fc',  // 中深紫 - 辅助色
  500: '#a855f7',  // 标准紫 - 主色
  600: '#9333ea',  // 深紫 - 悬停主色
  700: '#7c3aed',  // 更深紫 - 激活状态
  800: '#6b21a8',  // 很深紫 - 文字色
  900: '#581c87',  // 最深紫 - 强调色
}

// 语义化颜色系统
const successColors = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
}

const warningColors = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
}

const errorColors = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
}

const infoColors = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
}

// 分类色彩系统 - 基于高保真原型
const categoryColors = {
  frontend: {
    background: 'rgba(124, 58, 237, 0.1)',
    border: 'rgba(124, 58, 237, 0.2)',
    text: '#7c3aed',
    icon: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
  },
  backend: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
    text: '#3b82f6',
    icon: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  database: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
    text: '#10b981',
    icon: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
  },
  mobile: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    text: '#f59e0b',
    icon: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
  },
  cloud: {
    background: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.2)',
    text: '#ec4899',
    icon: '#db2777',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
  },
  security: {
    background: 'rgba(220, 38, 38, 0.1)',
    border: 'rgba(220, 38, 38, 0.2)',
    text: '#dc2626',
    icon: '#b91c1c',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
  }
}

// 渐变系统 - 视觉深度（基于高保真原型）
const gradients = {
  // 英雄区域渐变 - 三层渐变效果
  hero: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
  heroOverlay: 'linear-gradient(135deg, rgba(250, 245, 255, 0.9) 0%, rgba(243, 232, 255, 0.8) 100%)',

  // 卡片渐变系统
  card: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  cardHover: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
  cardActive: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',

  // 按钮渐变系统
  button: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  buttonHover: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
  buttonActive: 'linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)',

  // 分类卡片渐变
  categoryHover: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(124, 58, 237, 0.1) 100%)',
  categoryActive: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.15) 100%)',

  // 文字渐变
  textGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  textGradientHover: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',

  // 覆盖层渐变
  overlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%)',
  modalOverlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',

  // 阴影渐变
  cardShadow: 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',

  // 进度条渐变
  progress: 'linear-gradient(90deg, #a855f7 0%, #9333ea 100%)',

  // 背景装饰渐变
  decoration: 'linear-gradient(135deg, rgba(168, 85, 247, 0.03) 0%, rgba(124, 58, 237, 0.05) 100%)',

  // 分类渐变
  category: {
    frontend: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    backend: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    database: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    mobile: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
    devops: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    design: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  }
}

// 中性色系统
const neutralColors = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
}

// 完整颜色系统导出
export const colorTokens: ColorSystem = {
  primary: primaryColors,
  category: categoryColors,
  gradients: gradients,
  semantic: {
    success: successColors,
    warning: warningColors,
    error: errorColors,
    info: infoColors
  },
  // 添加中性色和灰色别名
  neutral: neutralColors,
  gray: neutralColors, // 灰色别名指向中性色
  purple: primaryColors // 紫色别名指向主色
}

// 颜色工具函数
export function getColorValue(colorPath: string): string {
  const paths = colorPath.split('.')
  let current: any = colorTokens
  
  for (const path of paths) {
    current = current[path]
    if (!current) return ''
  }
  
  return current
}

// 获取分类颜色方案
export function getCategoryColorScheme(categoryId: string) {
  return colorTokens.category[categoryId as keyof typeof colorTokens.category] || colorTokens.category.frontend
}

// 生成颜色变体
export function generateColorVariants(baseColor: string, opacity: number = 0.1) {
  return {
    background: `rgba(${hexToRgb(baseColor)}, ${opacity})`,
    border: `rgba(${hexToRgb(baseColor)}, ${opacity * 2})`,
    text: baseColor,
    icon: baseColor,
    gradient: `linear-gradient(135deg, ${baseColor} 0%, ${darkenColor(baseColor, 20)} 100%)`
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

// CSS变量映射
export const colorCSSVariables = {
  // 主色调变量
  '--color-primary-50': primaryColors[50],
  '--color-primary-100': primaryColors[100],
  '--color-primary-200': primaryColors[200],
  '--color-primary-300': primaryColors[300],
  '--color-primary-400': primaryColors[400],
  '--color-primary-500': primaryColors[500],
  '--color-primary-600': primaryColors[600],
  '--color-primary-700': primaryColors[700],
  '--color-primary-800': primaryColors[800],
  '--color-primary-900': primaryColors[900],
  
  // 分类颜色变量
  '--color-category-frontend-bg': categoryColors.frontend.background,
  '--color-category-frontend-text': categoryColors.frontend.text,
  '--color-category-backend-bg': categoryColors.backend.background,
  '--color-category-backend-text': categoryColors.backend.text,
  '--color-category-database-bg': categoryColors.database.background,
  '--color-category-database-text': categoryColors.database.text,
  '--color-category-mobile-bg': categoryColors.mobile.background,
  '--color-category-mobile-text': categoryColors.mobile.text,
  '--color-category-cloud-bg': categoryColors.cloud.background,
  '--color-category-cloud-text': categoryColors.cloud.text,
  '--color-category-security-bg': categoryColors.security.background,
  '--color-category-security-text': categoryColors.security.text,
  
  // 渐变变量
  '--gradient-hero': gradients.hero,
  '--gradient-card': gradients.card,
  '--gradient-button': gradients.button,
  '--gradient-overlay': gradients.overlay
}

export default colorTokens
