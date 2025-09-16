import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { logger, PerformanceLogger } from '@utils/logger'

// 扩展Request接口
declare global {
  namespace Express {
    interface Request {
      requestId?: string
      startTime?: number
    }
  }
}

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // 生成请求ID
  req.requestId = uuidv4()
  req.startTime = Date.now()

  // 设置响应头
  res.setHeader('X-Request-ID', req.requestId)

  // 获取客户端信息
  const clientInfo = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    origin: req.get('Origin')
  }

  // 记录请求开始
  logger.info('请求开始', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: sanitizeBody(req.body),
    headers: sanitizeHeaders(req.headers),
    ...clientInfo
  })

  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0)
    const responseSize = res.get('Content-Length') || 0

    // 记录请求完成
    logger.info('请求完成', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: `${responseSize} bytes`,
      ...clientInfo
    })

    // 记录性能指标
    PerformanceLogger.logRequest(req.method, req.originalUrl, duration, res.statusCode)

    // 记录慢请求
    if (duration > 2000) {
      logger.warn('慢请求检测', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      })
    }

    // 记录错误响应
    if (res.statusCode >= 400) {
      const logLevel = res.statusCode >= 500 ? 'error' : 'warn'
      logger.log(logLevel, '错误响应', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ...clientInfo
      })
    }
  })

  // 监听响应错误事件
  res.on('error', (error) => {
    logger.error('响应错误', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      error: error.message,
      stack: error.stack,
      ...clientInfo
    })
  })

  next()
}

/**
 * 清理请求体中的敏感信息
 */
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
  const sanitized = { ...body }

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

/**
 * 清理请求头中的敏感信息
 */
const sanitizeHeaders = (headers: any): any => {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
  const sanitized = { ...headers }

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]'
    }
  }

  return sanitized
}

/**
 * API访问日志中间件（用于特定路由）
 */
export const apiAccessLogger = (resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || 'anonymous'
    
    logger.info('API访问', {
      requestId: req.requestId,
      userId,
      resource,
      action: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    next()
  }
}

/**
 * 数据访问日志中间件
 */
export const dataAccessLogger = (resourceType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id
    
    if (userId) {
      const action = getActionFromMethod(req.method)
      
      logger.info('数据访问', {
        requestId: req.requestId,
        userId,
        resourceType,
        resourceId: req.params.id,
        action,
        ip: req.ip
      })
    }

    next()
  }
}

/**
 * 根据HTTP方法获取操作类型
 */
const getActionFromMethod = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'READ'
    case 'POST':
      return 'CREATE'
    case 'PUT':
    case 'PATCH':
      return 'UPDATE'
    case 'DELETE':
      return 'DELETE'
    default:
      return 'UNKNOWN'
  }
}

/**
 * 安全事件日志中间件
 */
export const securityEventLogger = (eventType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.warn('安全事件', {
      requestId: req.requestId,
      eventType,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
    })

    next()
  }
}

/**
 * 业务事件日志中间件
 */
export const businessEventLogger = (eventType: string, getEventData?: (req: Request) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id
    const eventData = getEventData ? getEventData(req) : {}

    logger.info('业务事件', {
      requestId: req.requestId,
      eventType,
      userId,
      eventData,
      timestamp: new Date().toISOString()
    })

    next()
  }
}

/**
 * 调试日志中间件（仅开发环境）
 */
export const debugLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('调试信息', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      cookies: req.cookies
    })
  }

  next()
}
