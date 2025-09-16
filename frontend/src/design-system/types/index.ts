/**
 * DocuVault 设计系统 - 类型定义
 * 统一的TypeScript类型定义，确保类型安全和开发体验
 */

// 基础类型
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type ComponentType = 'atom' | 'molecule' | 'organism' | 'template' | 'page'

// 颜色相关类型
export interface ColorScale {
  25: string
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
  950: string
}

export interface ColorTokens {
  primary: ColorScale
  secondary: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
  gray: ColorScale
  white: string
  black: string
  transparent: string
}

// 排版相关类型
export interface FontSize {
  0: string // fontSize
  1: string // lineHeight
}

export interface TypographyTokens {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: {
    xs: FontSize
    sm: FontSize
    base: FontSize
    lg: FontSize
    xl: FontSize
    '2xl': FontSize
    '3xl': FontSize
    '4xl': FontSize
    '5xl': FontSize
    '6xl': FontSize
  }
  fontWeight: {
    thin: number
    extralight: number
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
    black: number
  }
  lineHeight: {
    none: number
    tight: number
    snug: number
    normal: number
    relaxed: number
    loose: number
  }
  letterSpacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

// 间距相关类型
export interface SpacingTokens {
  0: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

// 阴影相关类型
export interface ShadowTokens {
  none: string
  small: string
  medium: string
  large: string
  xl: string
  inner: string
}

// 边框圆角类型
export interface BorderRadiusTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

// 动画相关类型
export interface AnimationTokens {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    linear: string
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

// 断点相关类型
export interface BreakpointTokens {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// 完整的设计令牌类型
export interface DesignTokens {
  colors: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  shadows: ShadowTokens
  borderRadius: BorderRadiusTokens
  animation: AnimationTokens
  breakpoints: BreakpointTokens
}

// 组件配置类型
export interface ComponentConfig {
  name: string
  type: ComponentType
  category: string
  description: string
  props: Record<string, any>
  slots: string[]
  events: string[]
  dependencies: string[]
  version: string
  status: 'stable' | 'beta' | 'alpha' | 'deprecated'
  examples: ComponentExample[]
  accessibility: AccessibilityInfo
}

// 组件示例类型
export interface ComponentExample {
  title: string
  description: string
  code: string
  preview?: string
  props?: Record<string, any>
}

// 可访问性信息类型
export interface AccessibilityInfo {
  ariaLabels: string[]
  keyboardNavigation: boolean
  screenReaderSupport: boolean
  colorContrast: 'AA' | 'AAA'
  focusManagement: boolean
}

// 主题配置类型
export interface ThemeConfig {
  name: string
  colors: Partial<ColorTokens>
  typography?: Partial<TypographyTokens>
  spacing?: Partial<SpacingTokens>
  shadows?: Partial<ShadowTokens>
  borderRadius?: Partial<BorderRadiusTokens>
  animation?: Partial<AnimationTokens>
  custom?: Record<string, any>
}

// 动画配置类型
export interface AnimationConfig {
  name: string
  duration: string
  easing: string
  delay?: string
  iterations?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

// 响应式配置类型
export interface ResponsiveConfig {
  breakpoint: keyof BreakpointTokens
  styles: Record<string, any>
}

// 表单相关类型
export interface FormFieldConfig {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  validation?: ValidationRule[]
  options?: SelectOption[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean | Promise<boolean>
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

// 表格相关类型
export interface TableColumn {
  key: string
  title: string
  width?: string
  minWidth?: string
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  formatter?: (value: any, row: any) => string
  visible?: boolean
}

export interface TableSortConfig {
  key: string
  order: 'asc' | 'desc'
}

export interface TableFilterConfig {
  key: string
  value: any
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith'
}

// 导航相关类型
export interface NavigationItem {
  key: string
  label: string
  href?: string
  icon?: any
  badge?: string | number
  active?: boolean
  disabled?: boolean
  children?: NavigationItem[]
  meta?: Record<string, any>
}

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}

// 文件上传相关类型
export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  status?: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  url?: string
  error?: string
  meta?: Record<string, any>
}

export interface UploadConfig {
  accept?: string
  maxSize?: number
  maxCount?: number
  multiple?: boolean
  directory?: boolean
  autoUpload?: boolean
  chunkSize?: number
  concurrent?: number
}

// 通知相关类型
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  action?: {
    label: string
    handler: () => void
  }
}

// 模态框相关类型
export interface ModalConfig {
  title?: string
  content?: string
  size?: ComponentSize
  variant?: ComponentVariant
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  destroyOnClose?: boolean
}

// 事件类型
export interface ComponentEvent {
  name: string
  payload?: any
  timestamp: number
  target: string
}

// 国际化类型
export interface LocaleConfig {
  locale: string
  messages: Record<string, string>
  dateFormat?: string
  numberFormat?: Intl.NumberFormatOptions
  currency?: string
}

// 性能监控类型
export interface PerformanceMetrics {
  componentName: string
  renderTime: number
  updateTime: number
  memoryUsage: number
  timestamp: number
}

// 错误处理类型
export interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  errorBoundary?: string
  timestamp: number
}

// 插件系统类型
export interface PluginConfig {
  name: string
  version: string
  install: (app: any, options?: any) => void
  dependencies?: string[]
  options?: Record<string, any>
}

// 工具函数类型
export type Debounced<T extends (...args: any[]) => any> = T & {
  cancel: () => void
  flush: () => void
}

export type Throttled<T extends (...args: any[]) => any> = T & {
  cancel: () => void
}

// 状态管理类型
export interface ComponentState {
  loading: boolean
  error: string | null
  data: any
  meta: Record<string, any>
}

// 导出所有类型的联合类型
export type AllComponentTypes = 
  | ComponentSize
  | ComponentVariant
  | ComponentType
  | ComponentConfig
  | ThemeConfig
  | AnimationConfig
  | ResponsiveConfig
  | FormFieldConfig
  | TableColumn
  | NavigationItem
  | UploadFile
  | NotificationConfig
  | ModalConfig
