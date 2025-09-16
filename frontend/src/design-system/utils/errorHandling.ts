/**
 * 设计系统错误处理和验证系统
 * 提供完整的错误管理、验证和调试功能
 */

import type { CompleteDesignTokens } from '../tokens'

// 错误类型枚举
export enum DesignSystemErrorType {
  TOKENS_VALIDATION = 'TOKENS_VALIDATION',
  COMPONENT_PROPS = 'COMPONENT_PROPS',
  THEME_PROVIDER = 'THEME_PROVIDER',
  ANIMATION_SYSTEM = 'ANIMATION_SYSTEM',
  FACTORY_CREATION = 'FACTORY_CREATION',
  RUNTIME_ERROR = 'RUNTIME_ERROR'
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 设计系统错误类
export class DesignSystemError extends Error {
  public readonly code: string
  public readonly type: DesignSystemErrorType
  public readonly severity: ErrorSeverity
  public readonly component?: string
  public readonly context?: any
  public readonly timestamp: number
  public readonly userAgent: string
  public readonly url: string

  constructor(
    message: string,
    type: DesignSystemErrorType,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    component?: string,
    context?: any
  ) {
    super(message)
    this.name = 'DesignSystemError'
    this.type = type
    this.code = code
    this.severity = severity
    this.component = component
    this.context = context
    this.timestamp = Date.now()
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    this.url = typeof window !== 'undefined' ? window.location.href : 'Unknown'

    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DesignSystemError)
    }
  }

  // 转换为可序列化的对象
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      severity: this.severity,
      component: this.component,
      context: this.context,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    }
  }
}

// 错误处理器接口
export interface ErrorHandler {
  handle(error: DesignSystemError): void
}

// 控制台错误处理器
export class ConsoleErrorHandler implements ErrorHandler {
  handle(error: DesignSystemError): void {
    const style = this.getConsoleStyle(error.severity)
    
    console.group(`%c[Design System Error] ${error.type}`, style)
    console.error(`Code: ${error.code}`)
    console.error(`Message: ${error.message}`)
    console.error(`Severity: ${error.severity}`)
    
    if (error.component) {
      console.error(`Component: ${error.component}`)
    }
    
    if (error.context) {
      console.error('Context:', error.context)
    }
    
    console.error('Stack:', error.stack)
    console.error('Timestamp:', new Date(error.timestamp).toISOString())
    console.groupEnd()
  }

  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles = {
      [ErrorSeverity.LOW]: 'color: #059669; font-weight: bold;',
      [ErrorSeverity.MEDIUM]: 'color: #d97706; font-weight: bold;',
      [ErrorSeverity.HIGH]: 'color: #dc2626; font-weight: bold;',
      [ErrorSeverity.CRITICAL]: 'color: #991b1b; font-weight: bold; background: #fef2f2; padding: 2px 4px;'
    }
    return styles[severity]
  }
}

// 远程错误处理器
export class RemoteErrorHandler implements ErrorHandler {
  constructor(
    private endpoint: string,
    private apiKey?: string
  ) {}

  async handle(error: DesignSystemError): Promise<void> {
    try {
      const payload = {
        ...error.toJSON(),
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || 'unknown'
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
    } catch (fetchError) {
      console.warn('Failed to send error to remote handler:', fetchError)
    }
  }
}

// 错误管理器
export class DesignSystemErrorManager {
  private handlers: ErrorHandler[] = []
  private errorHistory: DesignSystemError[] = []
  private maxHistorySize = 100

  constructor() {
    // 默认添加控制台处理器
    this.addHandler(new ConsoleErrorHandler())
    
    // 监听未捕获的错误
    this.setupGlobalErrorHandling()
  }

  // 添加错误处理器
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  // 移除错误处理器
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  // 处理错误
  handleError(error: DesignSystemError): void {
    // 添加到历史记录
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop()
    }

    // 调用所有处理器
    this.handlers.forEach(handler => {
      try {
        handler.handle(error)
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError)
      }
    })

    // 触发全局错误事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('design-system-error', {
        detail: error
      }))
    }
  }

  // 获取错误历史
  getErrorHistory(): DesignSystemError[] {
    return [...this.errorHistory]
  }

  // 清除错误历史
  clearErrorHistory(): void {
    this.errorHistory = []
  }

  // 获取错误统计
  getErrorStats(): {
    total: number
    byType: Record<DesignSystemErrorType, number>
    bySeverity: Record<ErrorSeverity, number>
    byComponent: Record<string, number>
  } {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<DesignSystemErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byComponent: {} as Record<string, number>
    }

    this.errorHistory.forEach(error => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      
      // 按严重级别统计
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      
      // 按组件统计
      if (error.component) {
        stats.byComponent[error.component] = (stats.byComponent[error.component] || 0) + 1
      }
    })

    return stats
  }

  // 设置全局错误处理
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      const error = new DesignSystemError(
        `Unhandled Promise Rejection: ${event.reason}`,
        DesignSystemErrorType.RUNTIME_ERROR,
        'UNHANDLED_PROMISE_REJECTION',
        ErrorSeverity.HIGH,
        undefined,
        { reason: event.reason }
      )
      this.handleError(error)
    })

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      const error = new DesignSystemError(
        `Global Error: ${event.message}`,
        DesignSystemErrorType.RUNTIME_ERROR,
        'GLOBAL_ERROR',
        ErrorSeverity.HIGH,
        undefined,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      )
      this.handleError(error)
    })
  }
}

// 验证器接口
export interface Validator<T> {
  validate(value: T): ValidationResult
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 设计令牌验证器
export class DesignTokensValidator implements Validator<CompleteDesignTokens> {
  validate(tokens: CompleteDesignTokens): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证颜色系统
    if (!tokens.colors) {
      errors.push('Colors system is missing')
    } else {
      if (!tokens.colors.primary || !tokens.colors.primary['500']) {
        errors.push('Primary color 500 is required')
      }
      
      if (!tokens.colors.category) {
        warnings.push('Category colors are missing')
      }
    }

    // 验证字体系统
    if (!tokens.typography) {
      errors.push('Typography system is missing')
    } else {
      if (!tokens.typography.fontFamily.sans.length) {
        errors.push('Sans font family is required')
      }
      
      if (!tokens.typography.fontSize.base) {
        errors.push('Base font size is required')
      }
    }

    // 验证间距系统
    if (!tokens.spacing) {
      errors.push('Spacing system is missing')
    } else {
      if (!tokens.spacing['4']) {
        errors.push('Base spacing unit (4) is required')
      }
    }

    // 验证动画系统
    if (!tokens.animations) {
      errors.push('Animation system is missing')
    } else {
      if (!tokens.animations.duration.normal) {
        warnings.push('Normal animation duration is missing')
      }
    }

    // 验证阴影系统
    if (!tokens.shadows) {
      errors.push('Shadow system is missing')
    } else {
      if (!tokens.shadows.soft) {
        warnings.push('Soft shadow is missing')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// 组件属性验证器
export class ComponentPropsValidator {
  static validateRequired<T>(value: T, name: string): void {
    if (value === undefined || value === null) {
      throw new DesignSystemError(
        `Required prop "${name}" is missing`,
        DesignSystemErrorType.COMPONENT_PROPS,
        'MISSING_REQUIRED_PROP',
        ErrorSeverity.HIGH,
        undefined,
        { propName: name, value }
      )
    }
  }

  static validateType<T>(value: T, expectedType: string, name: string): void {
    const actualType = typeof value
    if (actualType !== expectedType) {
      throw new DesignSystemError(
        `Prop "${name}" expected ${expectedType} but got ${actualType}`,
        DesignSystemErrorType.COMPONENT_PROPS,
        'INVALID_PROP_TYPE',
        ErrorSeverity.MEDIUM,
        undefined,
        { propName: name, expectedType, actualType, value }
      )
    }
  }

  static validateEnum<T>(value: T, allowedValues: T[], name: string): void {
    if (!allowedValues.includes(value)) {
      throw new DesignSystemError(
        `Prop "${name}" must be one of: ${allowedValues.join(', ')}`,
        DesignSystemErrorType.COMPONENT_PROPS,
        'INVALID_ENUM_VALUE',
        ErrorSeverity.MEDIUM,
        undefined,
        { propName: name, value, allowedValues }
      )
    }
  }
}

// 全局错误管理器实例
export const errorManager = new DesignSystemErrorManager()

// 便捷的错误创建函数
export function createError(
  message: string,
  type: DesignSystemErrorType,
  code: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  component?: string,
  context?: any
): DesignSystemError {
  return new DesignSystemError(message, type, code, severity, component, context)
}

// 便捷的错误处理函数
export function handleError(error: DesignSystemError): void {
  errorManager.handleError(error)
}

// 验证设计令牌
export function validateDesignTokens(tokens: CompleteDesignTokens): ValidationResult {
  const validator = new DesignTokensValidator()
  return validator.validate(tokens)
}

export default {
  DesignSystemError,
  DesignSystemErrorManager,
  ConsoleErrorHandler,
  RemoteErrorHandler,
  DesignTokensValidator,
  ComponentPropsValidator,
  errorManager,
  createError,
  handleError,
  validateDesignTokens
}
