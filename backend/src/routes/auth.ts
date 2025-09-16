import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../server'
import { JWTService } from '../utils/jwt'
import { validate, authValidations } from '../middleware/validation'
import { authenticate, optionalAuthenticate } from '../middleware/auth'
import { asyncHandler, createSuccessResponse, createErrorResponse } from '../middleware/errorHandler'
import { BusinessLogger, SecurityLogger } from '../utils/logger'
import type { AuthenticatedRequest } from '../types/auth'

const router = Router()

/**
 * 用户注册
 */
router.post('/register', 
  validate(authValidations.register),
  asyncHandler(async (req, res) => {
    const { email, password, nickname } = req.body

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      const { response, statusCode } = createErrorResponse(
        '邮箱已被注册',
        'EMAIL_ALREADY_EXISTS',
        409
      )
      return res.status(statusCode).json(response)
    }

    // 检查昵称是否已存在
    const existingNickname = await prisma.user.findFirst({
      where: { nickname }
    })

    if (existingNickname) {
      const { response, statusCode } = createErrorResponse(
        '昵称已被使用',
        'NICKNAME_ALREADY_EXISTS',
        409
      )
      return res.status(statusCode).json(response)
    }

    // 加密密码
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname,
        role: 'USER'
      },
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

    // 生成JWT token
    const token = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const refreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // 记录业务日志
    BusinessLogger.logUserRegistration(user.id, user.email)

    // 记录安全日志
    SecurityLogger.logLoginAttempt(email, true, req.ip, req.get('User-Agent'))

    const response = createSuccessResponse({
      user,
      token,
      refreshToken
    }, '注册成功')

    res.status(201).json(response)
  })
)

/**
 * 用户登录
 */
router.post('/login',
  validate(authValidations.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.passwordHash) {
      SecurityLogger.logLoginAttempt(email, false, req.ip, req.get('User-Agent'))
      
      const { response, statusCode } = createErrorResponse(
        '邮箱或密码错误',
        'INVALID_CREDENTIALS',
        401
      )
      return res.status(statusCode).json(response)
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      SecurityLogger.logLoginAttempt(email, false, req.ip, req.get('User-Agent'))
      
      const { response, statusCode } = createErrorResponse(
        '邮箱或密码错误',
        'INVALID_CREDENTIALS',
        401
      )
      return res.status(statusCode).json(response)
    }

    // 生成JWT token
    const token = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const refreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // 记录安全日志
    SecurityLogger.logLoginAttempt(email, true, req.ip, req.get('User-Agent'))

    // 返回用户信息（不包含密码）
    const { passwordHash, ...userWithoutPassword } = user

    const response = createSuccessResponse({
      user: userWithoutPassword,
      token,
      refreshToken
    }, '登录成功')

    res.json(response)
  })
)

/**
 * 刷新token
 */
router.post('/refresh',
  validate(authValidations.refreshToken),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body

    // 验证刷新token
    const payload = JWTService.verifyRefreshToken(refreshToken)

    // 查找用户
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
      const { response, statusCode } = createErrorResponse(
        '用户不存在',
        'USER_NOT_FOUND',
        401
      )
      return res.status(statusCode).json(response)
    }

    // 生成新的token
    const newToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const response = createSuccessResponse({
      user,
      token: newToken,
      refreshToken: newRefreshToken
    }, 'Token刷新成功')

    res.json(response)
  })
)

/**
 * 获取当前用户信息
 */
router.get('/me',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!

    const response = createSuccessResponse(user, '获取用户信息成功')
    res.json(response)
  })
)

/**
 * 更新用户资料
 */
router.put('/profile',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!
    const { nickname, avatarUrl } = req.body

    // 如果更新昵称，检查是否已存在
    if (nickname) {
      const existingNickname = await prisma.user.findFirst({
        where: {
          nickname,
          id: { not: userId }
        }
      })

      if (existingNickname) {
        const { response, statusCode } = createErrorResponse(
          '昵称已被使用',
          'NICKNAME_ALREADY_EXISTS',
          409
        )
        return res.status(statusCode).json(response)
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname && { nickname }),
        ...(avatarUrl && { avatarUrl })
      },
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

    const response = createSuccessResponse(updatedUser, '用户资料更新成功')
    res.json(response)
  })
)

/**
 * 登出
 */
router.post('/logout',
  optionalAuthenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // 这里可以实现token黑名单机制
    // 目前只是返回成功响应
    
    const response = createSuccessResponse(null, '登出成功')
    res.json(response)
  })
)

export { router as authRoutes }
