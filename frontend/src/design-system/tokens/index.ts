/**
 * 设计令牌系统 - 主入口文件
 * DocuVault知识付费平台设计系统核心
 */

import { colorTokens } from './colors'
import { typographyTokens } from './typography'
import { spacingTokens } from './spacing'
import { animationTokens } from './animations'
import { shadowTokens } from './shadows'

// 设计令牌系统完整接口定义
export interface CompleteDesignTokens {
  colors: ColorSystem
  typography: TypographySystem
  spacing: SpacingSystem
  animations: AnimationSystem
  shadows: ShadowSystem
  breakpoints: BreakpointSystem
  borderRadius: BorderRadiusSystem
}

// 颜色系统接口
export interface ColorSystem {
  primary: ColorScale
  category: CategoryColorSystem
  gradients: GradientSystem
  semantic: SemanticColorSystem
  neutral: ColorScale
  gray: ColorScale
  purple: ColorScale
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface CategoryColorSystem {
  frontend: CategoryColorScheme
  backend: CategoryColorScheme
  database: CategoryColorScheme
  mobile: CategoryColorScheme
  cloud: CategoryColorScheme
  security: CategoryColorScheme
}

export interface CategoryColorScheme {
  background: string
  border: string
  text: string
  icon: string
  gradient: string
}

export interface GradientSystem {
  hero: string
  card: string
  button: string
  overlay: string
}

export interface SemanticColorSystem {
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
}

// 字体系统接口
export interface TypographySystem {
  fontFamily: FontFamilySystem
  fontSize: FontSizeSystem
  fontWeight: FontWeightSystem
  lineHeight: LineHeightSystem
}

export interface FontFamilySystem {
  sans: string[]
  serif: string[]
  mono: string[]
}

export interface FontSizeSystem {
  xs: [string, { lineHeight: string }]
  sm: [string, { lineHeight: string }]
  base: [string, { lineHeight: string }]
  lg: [string, { lineHeight: string }]
  xl: [string, { lineHeight: string }]
  '2xl': [string, { lineHeight: string }]
  '3xl': [string, { lineHeight: string }]
  '4xl': [string, { lineHeight: string }]
  '5xl': [string, { lineHeight: string }]
  '6xl': [string, { lineHeight: string }]
}

export interface FontWeightSystem {
  thin: string
  extralight: string
  light: string
  normal: string
  medium: string
  semibold: string
  bold: string
  extrabold: string
  black: string
}

export interface LineHeightSystem {
  none: string
  tight: string
  snug: string
  normal: string
  relaxed: string
  loose: string
}

// 间距系统接口
export interface SpacingSystem {
  [key: string]: string
}

// 动画系统接口
export interface AnimationSystem {
  duration: DurationSystem
  easing: EasingSystem
  keyframes: KeyframeSystem
}

export interface DurationSystem {
  instant: string
  fast: string
  normal: string
  slow: string
  slower: string
  slowest: string
}

export interface EasingSystem {
  linear: string
  ease: string
  easeIn: string
  easeOut: string
  easeInOut: string
  spring: string
  bounce: string
  smooth: string
}

export interface KeyframeSystem {
  [key: string]: Record<string, Record<string, string>>
}

// 阴影系统接口
export interface ShadowSystem {
  none: string
  subtle: string
  soft: string
  medium: string
  large: string
  floating: string
  glow: string
}

// 断点系统接口
export interface BreakpointSystem {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// 圆角系统接口
export interface BorderRadiusSystem {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

// 断点系统定义
const breakpointTokens: BreakpointSystem = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

// 圆角系统定义
const borderRadiusTokens: BorderRadiusSystem = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
}

// 完整设计令牌系统导出
export const designTokens: CompleteDesignTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  animations: animationTokens,
  shadows: shadowTokens,
  breakpoints: breakpointTokens,
  borderRadius: borderRadiusTokens
}

// 设计系统工具函数
export function createDesignSystem(tokens: CompleteDesignTokens): DesignSystem {
  return {
    tokens,
    getColor: (path: string) => getNestedValue(tokens.colors, path),
    getSpacing: (key: string) => tokens.spacing[key],
    getShadow: (key: string) => tokens.shadows[key as keyof ShadowSystem],
    getAnimation: (key: string) => tokens.animations.keyframes[key]
  }
}

export interface DesignSystem {
  tokens: CompleteDesignTokens
  getColor: (path: string) => string
  getSpacing: (key: string) => string
  getShadow: (key: string) => string
  getAnimation: (key: string) => Record<string, Record<string, string>>
}

// 工具函数：获取嵌套对象值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || ''
}

// 验证设计令牌
export function validateDesignTokens(tokens: CompleteDesignTokens): ValidationResult {
  const errors: string[] = []
  
  // 验证颜色系统
  if (!tokens.colors.primary['500']) {
    errors.push('Primary color 500 is required')
  }
  
  // 验证字体系统
  if (!tokens.typography.fontFamily.sans.length) {
    errors.push('Sans font family is required')
  }
  
  // 验证间距系统
  if (!tokens.spacing['4']) {
    errors.push('Base spacing unit (4) is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// 默认导出
export default designTokens
