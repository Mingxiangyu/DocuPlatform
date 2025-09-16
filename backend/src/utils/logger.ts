import winston from 'winston'
import path from 'path'

// 日志级别
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs'

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`
    
    // 添加堆栈信息
    if (stack) {
      log += `\n${stack}`
    }
    
    // 添加元数据
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return log
  })
)

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`
    if (stack) {
      log += `\n${stack}`
    }
    return log
  })
)

// 创建传输器
const transports: winston.transport[] = []

// 控制台输出
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: LOG_LEVEL
    })
  )
}

// 文件输出
transports.push(
  // 所有日志
  new winston.transports.File({
    filename: path.join(LOG_FILE_PATH, 'app.log'),
    format: logFormat,
    level: LOG_LEVEL,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // 错误日志
  new winston.transports.File({
    filename: path.join(LOG_FILE_PATH, 'error.log'),
    format: logFormat,
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  })
)

// 创建logger实例
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  // 处理未捕获的异常
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_FILE_PATH, 'exceptions.log'),
      format: logFormat
    })
  ],
  // 处理未处理的Promise拒绝
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_FILE_PATH, 'rejections.log'),
      format: logFormat
    })
  ]
})

// 性能日志记录器
export class PerformanceLogger {
  private static timers = new Map<string, number>()

  /**
   * 开始计时
   */
  static start(label: string): void {
    this.timers.set(label, Date.now())
  }

  /**
   * 结束计时并记录
   */
  static end(label: string, context?: any): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      logger.warn(`性能计时器 "${label}" 未找到`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(label)

    logger.info(`性能指标: ${label}`, {
      duration: `${duration}ms`,
      context
    })

    return duration
  }

  /**
   * 记录数据库查询性能
   */
  static logQuery(query: string, duration: number, params?: any): void {
    const level = duration > 1000 ? 'warn' : 'debug'
    
    logger.log(level, '数据库查询', {
      query,
      duration: `${duration}ms`,
      params,
      slow: duration > 1000
    })
  }

  /**
   * 记录API请求性能
   */
  static logRequest(method: string, url: string, duration: number, statusCode: number): void {
    const level = duration > 2000 ? 'warn' : 'info'
    
    logger.log(level, 'API请求', {
      method,
      url,
      duration: `${duration}ms`,
      statusCode,
      slow: duration > 2000
    })
  }
}

// 安全日志记录器
export class SecurityLogger {
  /**
   * 记录登录尝试
   */
  static logLoginAttempt(email: string, success: boolean, ip: string, userAgent?: string): void {
    logger.info('登录尝试', {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录权限检查失败
   */
  static logPermissionDenied(userId: string, resource: string, action: string, ip: string): void {
    logger.warn('权限检查失败', {
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录可疑活动
   */
  static logSuspiciousActivity(type: string, details: any, ip: string): void {
    logger.warn('可疑活动', {
      type,
      details,
      ip,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录数据访问
   */
  static logDataAccess(userId: string, resource: string, action: string): void {
    logger.info('数据访问', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    })
  }
}

// 业务日志记录器
export class BusinessLogger {
  /**
   * 记录用户注册
   */
  static logUserRegistration(userId: string, email: string): void {
    logger.info('用户注册', {
      userId,
      email,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录文章发布
   */
  static logArticlePublished(articleId: string, authorId: string, title: string): void {
    logger.info('文章发布', {
      articleId,
      authorId,
      title,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录订单创建
   */
  static logOrderCreated(orderId: string, userId: string, amount: number): void {
    logger.info('订单创建', {
      orderId,
      userId,
      amount,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 记录支付完成
   */
  static logPaymentCompleted(orderId: string, paymentId: string, amount: number): void {
    logger.info('支付完成', {
      orderId,
      paymentId,
      amount,
      timestamp: new Date().toISOString()
    })
  }
}

// 错误日志记录器
export class ErrorLogger {
  /**
   * 记录API错误
   */
  static logApiError(error: Error, req: any, context?: any): void {
    logger.error('API错误', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body,
      user: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      context
    })
  }

  /**
   * 记录数据库错误
   */
  static logDatabaseError(error: Error, operation: string, context?: any): void {
    logger.error('数据库错误', {
      message: error.message,
      stack: error.stack,
      operation,
      context
    })
  }

  /**
   * 记录外部服务错误
   */
  static logExternalServiceError(service: string, error: Error, context?: any): void {
    logger.error('外部服务错误', {
      service,
      message: error.message,
      stack: error.stack,
      context
    })
  }
}

// 导出默认logger
export default logger
