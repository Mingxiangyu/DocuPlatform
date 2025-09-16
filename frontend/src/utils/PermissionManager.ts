import type { User, UserRole } from '../types/api'
import { eventBus } from './EventBus'

// 权限定义
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

// 角色权限映射
export interface RolePermissions {
  [key: string]: Permission[]
}

// 权限检查结果
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  requiredRole?: UserRole
  requiredPermissions?: string[]
}

// 预定义权限
export const PERMISSIONS: Record<string, Permission> = {
  // 文章权限
  ARTICLE_READ: {
    id: 'article:read',
    name: '阅读文章',
    description: '可以阅读免费文章',
    resource: 'article',
    action: 'read'
  },
  ARTICLE_READ_PAID: {
    id: 'article:read:paid',
    name: '阅读付费文章',
    description: '可以阅读已购买的付费文章',
    resource: 'article',
    action: 'read:paid'
  },
  ARTICLE_CREATE: {
    id: 'article:create',
    name: '创建文章',
    description: '可以创建新文章',
    resource: 'article',
    action: 'create'
  },
  ARTICLE_UPDATE: {
    id: 'article:update',
    name: '编辑文章',
    description: '可以编辑自己的文章',
    resource: 'article',
    action: 'update'
  },
  ARTICLE_DELETE: {
    id: 'article:delete',
    name: '删除文章',
    description: '可以删除自己的文章',
    resource: 'article',
    action: 'delete'
  },
  ARTICLE_MANAGE_ALL: {
    id: 'article:manage:all',
    name: '管理所有文章',
    description: '可以管理所有用户的文章',
    resource: 'article',
    action: 'manage:all'
  },

  // 笔记权限
  NOTE_CREATE: {
    id: 'note:create',
    name: '创建笔记',
    description: '可以创建笔记',
    resource: 'note',
    action: 'create'
  },
  NOTE_READ: {
    id: 'note:read',
    name: '阅读笔记',
    description: '可以阅读自己的笔记',
    resource: 'note',
    action: 'read'
  },
  NOTE_UPDATE: {
    id: 'note:update',
    name: '编辑笔记',
    description: '可以编辑自己的笔记',
    resource: 'note',
    action: 'update'
  },
  NOTE_DELETE: {
    id: 'note:delete',
    name: '删除笔记',
    description: '可以删除自己的笔记',
    resource: 'note',
    action: 'delete'
  },

  // 高亮权限
  HIGHLIGHT_CREATE: {
    id: 'highlight:create',
    name: '创建高亮',
    description: '可以创建文本高亮',
    resource: 'highlight',
    action: 'create'
  },
  HIGHLIGHT_READ: {
    id: 'highlight:read',
    name: '查看高亮',
    description: '可以查看自己的高亮',
    resource: 'highlight',
    action: 'read'
  },
  HIGHLIGHT_UPDATE: {
    id: 'highlight:update',
    name: '编辑高亮',
    description: '可以编辑自己的高亮',
    resource: 'highlight',
    action: 'update'
  },
  HIGHLIGHT_DELETE: {
    id: 'highlight:delete',
    name: '删除高亮',
    description: '可以删除自己的高亮',
    resource: 'highlight',
    action: 'delete'
  },

  // 用户管理权限
  USER_READ: {
    id: 'user:read',
    name: '查看用户信息',
    description: '可以查看自己的用户信息',
    resource: 'user',
    action: 'read'
  },
  USER_UPDATE: {
    id: 'user:update',
    name: '更新用户信息',
    description: '可以更新自己的用户信息',
    resource: 'user',
    action: 'update'
  },
  USER_MANAGE_ALL: {
    id: 'user:manage:all',
    name: '管理所有用户',
    description: '可以管理所有用户信息',
    resource: 'user',
    action: 'manage:all'
  },

  // 支付权限
  PAYMENT_CREATE: {
    id: 'payment:create',
    name: '创建支付',
    description: '可以创建支付订单',
    resource: 'payment',
    action: 'create'
  },
  PAYMENT_READ: {
    id: 'payment:read',
    name: '查看支付记录',
    description: '可以查看自己的支付记录',
    resource: 'payment',
    action: 'read'
  },
  PAYMENT_MANAGE_ALL: {
    id: 'payment:manage:all',
    name: '管理所有支付',
    description: '可以管理所有支付记录',
    resource: 'payment',
    action: 'manage:all'
  },

  // 系统管理权限
  ADMIN_DASHBOARD: {
    id: 'admin:dashboard',
    name: '访问管理后台',
    description: '可以访问管理后台',
    resource: 'admin',
    action: 'dashboard'
  },
  ADMIN_STATS: {
    id: 'admin:stats',
    name: '查看统计数据',
    description: '可以查看系统统计数据',
    resource: 'admin',
    action: 'stats'
  },
  ADMIN_SETTINGS: {
    id: 'admin:settings',
    name: '系统设置',
    description: '可以修改系统设置',
    resource: 'admin',
    action: 'settings'
  }
}

// 角色权限映射
export const ROLE_PERMISSIONS: RolePermissions = {
  USER: [
    PERMISSIONS.ARTICLE_READ,
    PERMISSIONS.ARTICLE_READ_PAID,
    PERMISSIONS.NOTE_CREATE,
    PERMISSIONS.NOTE_READ,
    PERMISSIONS.NOTE_UPDATE,
    PERMISSIONS.NOTE_DELETE,
    PERMISSIONS.HIGHLIGHT_CREATE,
    PERMISSIONS.HIGHLIGHT_READ,
    PERMISSIONS.HIGHLIGHT_UPDATE,
    PERMISSIONS.HIGHLIGHT_DELETE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_READ
  ],
  CONTENT_MANAGER: [
    ...ROLE_PERMISSIONS.USER,
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_UPDATE,
    PERMISSIONS.ARTICLE_DELETE,
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_STATS
  ],
  ADMIN: [
    ...ROLE_PERMISSIONS.CONTENT_MANAGER,
    PERMISSIONS.ARTICLE_MANAGE_ALL,
    PERMISSIONS.USER_MANAGE_ALL,
    PERMISSIONS.PAYMENT_MANAGE_ALL,
    PERMISSIONS.ADMIN_SETTINGS
  ]
}

export class PermissionManager {
  private user: User | null = null
  private userPermissions: Permission[] = []

  constructor() {
    // 监听用户状态变化
    eventBus.on('auth:login', (data) => {
      this.setUser(data.user)
    })

    eventBus.on('auth:logout', () => {
      this.setUser(null)
    })

    eventBus.on('auth:user-updated', (data) => {
      this.setUser(data.user)
    })
  }

  // 设置当前用户
  setUser(user: User | null) {
    this.user = user
    this.userPermissions = user ? this.getUserPermissions(user) : []
    
    eventBus.emit('permission:user-changed', { 
      user, 
      permissions: this.userPermissions 
    })
  }

  // 获取用户权限
  private getUserPermissions(user: User): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || []
    
    // 可以在这里添加用户特定权限的逻辑
    // 例如：从用户的 customPermissions 字段获取额外权限
    
    return [...rolePermissions]
  }

  // 检查权限
  hasPermission(permissionId: string): boolean {
    if (!this.user) {
      return false
    }

    return this.userPermissions.some(permission => permission.id === permissionId)
  }

  // 检查多个权限（需要全部满足）
  hasAllPermissions(permissionIds: string[]): boolean {
    return permissionIds.every(id => this.hasPermission(id))
  }

  // 检查多个权限（满足任一即可）
  hasAnyPermission(permissionIds: string[]): boolean {
    return permissionIds.some(id => this.hasPermission(id))
  }

  // 检查角色
  hasRole(role: UserRole): boolean {
    return this.user?.role === role
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.hasRole('ADMIN')
  }

  // 检查是否为内容管理员
  isContentManager(): boolean {
    return this.hasRole('CONTENT_MANAGER') || this.isAdmin()
  }

  // 检查资源权限
  checkResourcePermission(
    resource: string, 
    action: string, 
    resourceOwnerId?: string
  ): PermissionCheckResult {
    if (!this.user) {
      return {
        allowed: false,
        reason: '用户未登录',
        requiredPermissions: [`${resource}:${action}`]
      }
    }

    const permissionId = `${resource}:${action}`
    const manageAllPermissionId = `${resource}:manage:all`

    // 检查是否有管理所有资源的权限
    if (this.hasPermission(manageAllPermissionId)) {
      return { allowed: true }
    }

    // 检查基本权限
    if (!this.hasPermission(permissionId)) {
      return {
        allowed: false,
        reason: '权限不足',
        requiredPermissions: [permissionId]
      }
    }

    // 检查资源所有权（如果指定了资源所有者）
    if (resourceOwnerId && resourceOwnerId !== this.user.id) {
      return {
        allowed: false,
        reason: '只能操作自己的资源',
        requiredPermissions: [manageAllPermissionId]
      }
    }

    return { allowed: true }
  }

  // 检查文章访问权限
  canAccessArticle(article: { isPaid: boolean; authorId: string }, hasPurchased: boolean = false): PermissionCheckResult {
    if (!article.isPaid) {
      // 免费文章，检查基本阅读权限
      return this.checkResourcePermission('article', 'read')
    }

    if (hasPurchased || article.authorId === this.user?.id) {
      // 已购买或是作者，检查付费文章阅读权限
      if (this.hasPermission('article:read:paid')) {
        return { allowed: true }
      }
    }

    return {
      allowed: false,
      reason: '需要购买此付费文章',
      requiredPermissions: ['article:read:paid']
    }
  }

  // 检查高亮功能权限
  canCreateHighlight(article: { isPaid: boolean; authorId: string }, hasPurchased: boolean = false): PermissionCheckResult {
    // 首先检查是否能访问文章
    const articleAccess = this.canAccessArticle(article, hasPurchased)
    if (!articleAccess.allowed) {
      return articleAccess
    }

    // 检查高亮创建权限
    return this.checkResourcePermission('highlight', 'create')
  }

  // 检查笔记功能权限
  canCreateNote(article: { isPaid: boolean; authorId: string }, hasPurchased: boolean = false): PermissionCheckResult {
    // 首先检查是否能访问文章
    const articleAccess = this.canAccessArticle(article, hasPurchased)
    if (!articleAccess.allowed) {
      return articleAccess
    }

    // 检查笔记创建权限
    return this.checkResourcePermission('note', 'create')
  }

  // 获取当前用户信息
  getCurrentUser(): User | null {
    return this.user
  }

  // 获取当前用户权限列表
  getCurrentPermissions(): Permission[] {
    return [...this.userPermissions]
  }

  // 获取权限描述
  getPermissionDescription(permissionId: string): string {
    const permission = Object.values(PERMISSIONS).find(p => p.id === permissionId)
    return permission?.description || '未知权限'
  }

  // 权限调试信息
  getDebugInfo(): {
    user: User | null
    permissions: Permission[]
    rolePermissions: Permission[]
  } {
    return {
      user: this.user,
      permissions: this.userPermissions,
      rolePermissions: this.user ? ROLE_PERMISSIONS[this.user.role] || [] : []
    }
  }
}

// 全局权限管理器实例
export const permissionManager = new PermissionManager()
