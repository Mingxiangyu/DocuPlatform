import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ErrorLogger } from '@utils/logger'

// 自定义错误类
export class AppError extends Error {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// 业务错误类
export class BusinessError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_ERROR') {
    super(message, 400, code)
  }
}

// 验证错误类
export class ValidationError extends AppError {
  public errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

// 认证错误类
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

// 授权错误类
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

// 资源未找到错误类
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}未找到`, 404, 'NOT_FOUND')
  }
}

// 冲突错误类
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, 'CONFLICT')
  }
}

// 速率限制错误类
export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

/**
 * 处理Prisma错误
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // 唯一约束违反
      const field = error.meta?.target as string[]
      const fieldName = field?.[0] || '字段'
      return new ConflictError(`${fieldName}已存在`)

    case 'P2025':
      // 记录未找到
      return new NotFoundError('记录')

    case 'P2003':
      // 外键约束违反
      return new BusinessError('关联数据不存在')

    case 'P2014':
      // 关系违反
      return new BusinessError('数据关系错误')

    case 'P2021':
      // 表不存在
      return new AppError('数据库表不存在', 500, 'DATABASE_ERROR')

    case 'P2022':
      // 列不存在
      return new AppError('数据库列不存在', 500, 'DATABASE_ERROR')

    default:
      return new AppError('数据库操作失败', 500, 'DATABASE_ERROR')
  }
}

/**
 * 处理验证错误
 */
const handleValidationError = (error: any): ValidationError => {
  const errors: Record<string, string[]> = {}
  
  if (error.details) {
    // Joi验证错误
    error.details.forEach((detail: any) => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
  }

  return new ValidationError('数据验证失败', errors)
}

/**
 * 错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let appError: AppError

  // 处理不同类型的错误
  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error)
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('数据验证失败')
  } else if (error.name === 'ValidationError') {
    appError = handleValidationError(error)
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AuthenticationError('Token无效')
  } else if (error.name === 'TokenExpiredError') {
    appError = new AuthenticationError('Token已过期')
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    appError = new ValidationError('请求体格式错误')
  } else {
    // 未知错误
    appError = new AppError(
      process.env.NODE_ENV === 'production' ? '服务器内部错误' : error.message,
      500,
      'INTERNAL_ERROR'
    )
  }

  // 记录错误日志
  if (appError.statusCode >= 500) {
    ErrorLogger.logApiError(error, req, {
      originalError: error.name,
      statusCode: appError.statusCode,
      code: appError.code
    })
  }

  // 构建错误响应
  const errorResponse: any = {
    success: false,
    message: appError.message,
    code: appError.code
  }

  // 添加验证错误详情
  if (appError instanceof ValidationError && appError.errors) {
    errorResponse.errors = appError.errors
  }

  // 开发环境下添加堆栈信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack
    errorResponse.originalError = error.name
  }

  // 添加请求ID（如果有）
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id']
  }

  res.status(appError.statusCode).json(errorResponse)
}

/**
 * 异步错误处理包装器
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 404错误处理
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`路由 ${req.originalUrl}`)
  next(error)
}

/**
 * 创建错误响应的辅助函数
 */
export const createErrorResponse = (
  message: string,
  code: string = 'ERROR',
  statusCode: number = 400,
  errors?: Record<string, string[]>
) => {
  const response: any = {
    success: false,
    message,
    code
  }

  if (errors) {
    response.errors = errors
  }

  return { response, statusCode }
}

/**
 * 成功响应的辅助函数
 */
export const createSuccessResponse = (
  data?: any,
  message?: string,
  meta?: any
) => {
  const response: any = {
    success: true
  }

  if (data !== undefined) {
    response.data = data
  }

  if (message) {
    response.message = message
  }

  if (meta) {
    response.meta = meta
  }

  return response
}
