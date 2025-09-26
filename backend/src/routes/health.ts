import { Router } from 'express'
import { prisma, redis } from '../server'
import { logger } from '../utils/logger'

const router = Router()

/**
 * 健康检查接口
 */
router.get('/', async (_req, res) => {
  try {
    const startTime = Date.now()
    
    // 检查数据库连接
    const dbCheck = await checkDatabase()
    
    // 检查Redis连接
    const redisCheck = await checkRedis()
    
    // 检查系统资源
    const systemCheck = getSystemInfo()
    
    const responseTime = Date.now() - startTime
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbCheck,
        redis: redisCheck,
        system: systemCheck
      }
    }
    
    // 如果任何检查失败，返回503状态
    const isHealthy = dbCheck.status === 'healthy' && 
                     redisCheck.status === 'healthy' && 
                     systemCheck.status === 'healthy'
    
    res.status(isHealthy ? 200 : 503).json(health)
  } catch (error) {
    logger.error('健康检查失败:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 详细健康检查接口
 */
router.get('/detailed', async (_req, res) => {
  try {
    const startTime = Date.now()
    
    // 数据库详细检查
    const dbDetailedCheck = await checkDatabaseDetailed()
    
    // Redis详细检查
    const redisDetailedCheck = await checkRedisDetailed()
    
    // 系统详细信息
    const systemDetailed = getSystemDetailedInfo()
    
    const responseTime = Date.now() - startTime
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: dbDetailedCheck,
        redis: redisDetailedCheck,
        system: systemDetailed
      }
    }
    
    res.json(detailedHealth)
  } catch (error) {
    logger.error('详细健康检查失败:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 检查数据库连接
 */
async function checkDatabase() {
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

/**
 * 检查Redis连接
 */
async function checkRedis() {
  try {
    const startTime = Date.now()
    await redis.ping()
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Redis connection failed'
    }
  }
}

/**
 * 获取系统信息
 */
function getSystemInfo() {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  return {
    status: 'healthy',
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: `${Math.round(process.uptime())}s`
  }
}

/**
 * 数据库详细检查
 */
async function checkDatabaseDetailed() {
  try {
    const startTime = Date.now()
    
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    // 获取数据库统计信息
    const userCount = await prisma.user.count()
    const articleCount = await prisma.article.count()
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      statistics: {
        users: userCount,
        articles: articleCount
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database detailed check failed'
    }
  }
}

/**
 * Redis详细检查
 */
async function checkRedisDetailed() {
  try {
    const startTime = Date.now()
    
    // 检查Redis连接
    await redis.ping()
    
    // 获取Redis信息
    const info = await redis.info('memory')
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      info: info.split('\r\n').filter(line => line.includes(':')).reduce((acc, line) => {
        const [key, value] = line.split(':')
        if (key && value) {
          acc[key.trim()] = value.trim()
        }
        return acc
      }, {} as Record<string, string>)
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Redis detailed check failed'
    }
  }
}

/**
 * 获取系统详细信息
 */
function getSystemDetailedInfo() {
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  return {
    status: 'healthy',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    process: {
      pid: process.pid,
      uptime: `${Math.round(process.uptime())}s`,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }
}

export { router as healthRoutes }
