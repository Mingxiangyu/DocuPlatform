import { Request } from 'express'
import { User } from '@prisma/client'

// JWT载荷接口
export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// 扩展Request接口，添加用户信息
export interface AuthenticatedRequest extends Request {
  user?: User
  userId?: string
}

// 认证响应接口
export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token: string
  refreshToken: string
}

// 登录请求接口
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求接口
export interface RegisterRequest {
  email: string
  password: string
  nickname: string
}

// 刷新token请求接口
export interface RefreshTokenRequest {
  refreshToken: string
}

// 重置密码请求接口
export interface ResetPasswordRequest {
  email: string
}

// 验证邮箱请求接口
export interface VerifyEmailRequest {
  token: string
}

// 更新密码请求接口
export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

// 微信OAuth响应接口
export interface WeChatOAuthResponse {
  openid: string
  nickname: string
  headimgurl: string
  unionid?: string
}

// 权限级别枚举
export enum Permission {
  READ_ARTICLE = 'read:article',
  WRITE_ARTICLE = 'write:article',
  DELETE_ARTICLE = 'delete:article',
  MANAGE_USERS = 'manage:users',
  MANAGE_ORDERS = 'manage:orders',
  MANAGE_SYSTEM = 'manage:system'
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  USER: [Permission.READ_ARTICLE],
  CONTENT_MANAGER: [
    Permission.READ_ARTICLE,
    Permission.WRITE_ARTICLE,
    Permission.DELETE_ARTICLE
  ],
  ADMIN: [
    Permission.READ_ARTICLE,
    Permission.WRITE_ARTICLE,
    Permission.DELETE_ARTICLE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_SYSTEM
  ]
}
