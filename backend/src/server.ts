import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { authRoutes } from './routes/auth'
import { healthRoutes } from './routes/health'
import articleRoutes from './routes/articles'
import orderRoutes from './routes/orders'
// TODO: 其他路由将在后续步骤中实现
// import { noteRoutes } from './routes/notes'
// import { highlightRoutes } from './routes/highlights'
// import { collectionRoutes } from './routes/collections'
// import { uploadRoutes } from './routes/upload'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// 初始化数据库连接
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

// 初始化Redis连接
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// 压缩响应
app.use(compression())

// 请求体解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志
app.use(requestLogger)

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 限制每个IP 100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// 健康检查路由（不受速率限制）
app.use('/health', healthRoutes)

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/orders', orderRoutes)
// TODO: 其他路由将在后续步骤中实现
// app.use('/api/notes', noteRoutes)
// app.use('/api/highlights', highlightRoutes)
// app.use('/api/collections', collectionRoutes)
// app.use('/api/upload', uploadRoutes)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    code: 'NOT_FOUND'
  })
})

// 错误处理中间件
app.use(errorHandler)

// 数据库连接和服务器启动
async function startServer() {
  try {
    // 连接数据库
    await prisma.$connect()
    logger.info('数据库连接成功')

    // 连接Redis
    await redis.connect()
    logger.info('Redis连接成功')

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`)
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`API文档: http://localhost:${PORT}/api/docs`)
    })
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  logger.info('收到SIGTERM信号，开始优雅关闭...')
  
  try {
    await prisma.$disconnect()
    await redis.disconnect()
    logger.info('数据库连接已关闭')
    process.exit(0)
  } catch (error) {
    logger.error('关闭过程中出错:', error)
    process.exit(1)
  }
})

process.on('SIGINT', async () => {
  logger.info('收到SIGINT信号，开始优雅关闭...')
  
  try {
    await prisma.$disconnect()
    await redis.disconnect()
    logger.info('数据库连接已关闭')
    process.exit(0)
  } catch (error) {
    logger.error('关闭过程中出错:', error)
    process.exit(1)
  }
})

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason)
  logger.error('Promise:', promise)
  process.exit(1)
})

// 启动服务器
startServer()

export default app
