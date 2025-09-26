import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types/auth'
import { logger } from '@utils/logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = '30d'

export class JWTService {
  /**
   * 生成访问token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'docuvault',
        audience: 'docuvault-users'
      } as jwt.SignOptions)
    } catch (error) {
      logger.error('生成访问token失败:', error)
      throw new Error('Token生成失败')
    }
  }

  /**
   * 生成刷新token
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'docuvault',
        audience: 'docuvault-refresh'
      })
    } catch (error) {
      logger.error('生成刷新token失败:', error)
      throw new Error('刷新Token生成失败')
    }
  }

  /**
   * 验证访问token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'docuvault',
        audience: 'docuvault-users'
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token已过期')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token无效')
      } else {
        logger.error('验证访问token失败:', error)
        throw new Error('Token验证失败')
      }
    }
  }

  /**
   * 验证刷新token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'docuvault',
        audience: 'docuvault-refresh'
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('刷新Token已过期')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('刷新Token无效')
      } else {
        logger.error('验证刷新token失败:', error)
        throw new Error('刷新Token验证失败')
      }
    }
  }

  /**
   * 解码token（不验证）
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      logger.error('解码token失败:', error)
      return null
    }
  }

  /**
   * 检查token是否即将过期（30分钟内）
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return true

      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = decoded.exp - now
      
      // 如果30分钟内过期，返回true
      return timeUntilExpiry < 30 * 60
    } catch (error) {
      return true
    }
  }

  /**
   * 生成邮箱验证token
   */
  static generateEmailVerificationToken(email: string): string {
    try {
      return jwt.sign(
        { email, type: 'email_verification' },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
    } catch (error) {
      logger.error('生成邮箱验证token失败:', error)
      throw new Error('邮箱验证Token生成失败')
    }
  }

  /**
   * 验证邮箱验证token
   */
  static verifyEmailVerificationToken(token: string): { email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (decoded.type !== 'email_verification') {
        throw new Error('Token类型错误')
      }

      return { email: decoded.email }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('验证链接已过期')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('验证链接无效')
      } else {
        logger.error('验证邮箱token失败:', error)
        throw new Error('邮箱验证失败')
      }
    }
  }

  /**
   * 生成密码重置token
   */
  static generatePasswordResetToken(email: string): string {
    try {
      return jwt.sign(
        { email, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      )
    } catch (error) {
      logger.error('生成密码重置token失败:', error)
      throw new Error('密码重置Token生成失败')
    }
  }

  /**
   * 验证密码重置token
   */
  static verifyPasswordResetToken(token: string): { email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Token类型错误')
      }

      return { email: decoded.email }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('重置链接已过期')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('重置链接无效')
      } else {
        logger.error('验证密码重置token失败:', error)
        throw new Error('密码重置验证失败')
      }
    }
  }
}
