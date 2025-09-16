import { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest, Permission, ROLE_PERMISSIONS } from '@types/auth'
import { JWTService } from '@utils/jwt'
import { prisma } from '../server'
import { logger } from '@utils/logger'

/**
 * 认证中间件 - 验证JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证token',
        code: 'MISSING_TOKEN'
      })
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 验证token
    const payload = JWTService.verifyAccessToken(token)
    
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    // 将用户信息添加到请求对象
    req.user = user as any
    req.userId = user.id

    next()
  } catch (error: any) {
    logger.error('认证失败:', error)
    
    return res.status(401).json({
      success: false,
      message: error.message || '认证失败',
      code: 'AUTHENTICATION_FAILED'
    })
  }
}

/**
 * 可选认证中间件 - 如果有token则验证，没有则继续
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // 没有token，继续执行
    }

    const token = authHeader.substring(7)
    
    try {
      const payload = JWTService.verifyAccessToken(token)
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (user) {
        req.user = user as any
        req.userId = user.id
      }
    } catch (error) {
      // token无效，但不阻止请求继续
      logger.warn('可选认证失败:', error)
    }

    next()
  } catch (error) {
    logger.error('可选认证中间件错误:', error)
    next() // 出错也继续执行
  }
}

/**
 * 权限检查中间件工厂
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要认证',
        code: 'AUTHENTICATION_REQUIRED'
      })
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || []
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  }
}

/**
 * 角色检查中间件工厂
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要认证',
        code: 'AUTHENTICATION_REQUIRED'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '角色权限不足',
        code: 'INSUFFICIENT_ROLE'
      })
    }

    next()
  }
}

/**
 * 邮箱验证检查中间件
 */
export const requireEmailVerified = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证',
      code: 'AUTHENTICATION_REQUIRED'
    })
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: '需要验证邮箱',
      code: 'EMAIL_NOT_VERIFIED'
    })
  }

  next()
}

/**
 * 资源所有者检查中间件工厂
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要认证',
        code: 'AUTHENTICATION_REQUIRED'
      })
    }

    const resourceId = req.params[resourceIdParam]
    const userId = req.user.id

    // 管理员可以访问所有资源
    if (req.user.role === 'ADMIN') {
      return next()
    }

    // 检查资源所有权（这里需要根据具体资源类型实现）
    // 示例：检查文章所有权
    if (req.route.path.includes('/articles')) {
      try {
        const article = await prisma.article.findUnique({
          where: { id: resourceId },
          select: { authorId: true }
        })

        if (!article || article.authorId !== userId) {
          return res.status(403).json({
            success: false,
            message: '无权访问此资源',
            code: 'RESOURCE_ACCESS_DENIED'
          })
        }
      } catch (error) {
        logger.error('检查资源所有权失败:', error)
        return res.status(500).json({
          success: false,
          message: '服务器错误',
          code: 'INTERNAL_ERROR'
        })
      }
    }

    next()
  }
}
