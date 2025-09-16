import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { eventBus } from '../utils/EventBus'

// 管理员用户接口扩展
export interface AdminUser extends User {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  lastLoginAt?: string
  articlesCount?: number
  notesCount?: number
  purchasesCount?: number
}

// 统计数据接口
export interface AdminStats {
  articles: {
    total: number
    published: number
    draft: number
    archived: number
    monthlyNew: number
  }
  users: {
    total: number
    active: number
    contentManagers: number
    admins: number
    monthlyNew: number
  }
  orders: {
    total: number
    completed: number
    pending: number
    failed: number
    monthlyRevenue: number
  }
  system: {
    storageUsed: number
    storageTotal: number
    bandwidth: number
    uptime: number
  }
}

// 批量操作类型
export type BatchAction = 'activate' | 'deactivate' | 'suspend' | 'delete' | 'publish' | 'archive'

export const useAdminStore = defineStore('admin', () => {
  // 状态定义
  const stats = ref<AdminStats>({
    articles: {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      monthlyNew: 0
    },
    users: {
      total: 0,
      active: 0,
      contentManagers: 0,
      admins: 0,
      monthlyNew: 0
    },
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      monthlyRevenue: 0
    },
    system: {
      storageUsed: 0,
      storageTotal: 100,
      bandwidth: 0,
      uptime: 99.9
    }
  })

  const users = ref<AdminUser[]>([])
  const selectedUserIds = ref<string[]>([])
  const userFilters = ref({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const filteredUsers = computed(() => {
    let filtered = [...users.value]

    // 搜索过滤
    if (userFilters.value.search) {
      const search = userFilters.value.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(search) ||
        user.nickname.toLowerCase().includes(search)
      )
    }

    // 角色过滤
    if (userFilters.value.role) {
      filtered = filtered.filter(user => user.role === userFilters.value.role)
    }

    // 状态过滤
    if (userFilters.value.status) {
      filtered = filtered.filter(user => user.status === userFilters.value.status)
    }

    // 排序
    filtered.sort((a, b) => {
      const aValue = a[userFilters.value.sortBy as keyof AdminUser]
      const bValue = b[userFilters.value.sortBy as keyof AdminUser]
      
      if (userFilters.value.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })

  const selectedUsers = computed(() => 
    users.value.filter(user => selectedUserIds.value.includes(user.id))
  )

  // 初始化管理数据
  const initAdminData = () => {
    loadMockStats()
    loadMockUsers()
  }

  // 加载模拟统计数据
  const loadMockStats = () => {
    const mockStats: AdminStats = {
      articles: {
        total: 156,
        published: 128,
        draft: 23,
        archived: 5,
        monthlyNew: 12
      },
      users: {
        total: 1234,
        active: 892,
        contentManagers: 8,
        admins: 3,
        monthlyNew: 156
      },
      orders: {
        total: 2847,
        completed: 2654,
        pending: 156,
        failed: 37,
        monthlyRevenue: 45680.50
      },
      system: {
        storageUsed: 68.5,
        storageTotal: 100,
        bandwidth: 2.3,
        uptime: 99.9
      }
    }

    stats.value = mockStats
  }

  // 加载模拟用户数据
  const loadMockUsers = () => {
    const mockUsers: AdminUser[] = [
      {
        id: '1',
        email: 'admin@docuvault.com',
        nickname: '系统管理员',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-12-10T08:30:00Z',
        articlesCount: 0,
        notesCount: 0,
        purchasesCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-10T08:30:00Z'
      },
      {
        id: '2',
        email: 'content@docuvault.com',
        nickname: '内容运营',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
        role: 'CONTENT_MANAGER',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-12-10T09:15:00Z',
        articlesCount: 45,
        notesCount: 128,
        purchasesCount: 23,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-12-10T09:15:00Z'
      },
      {
        id: '3',
        email: 'user1@example.com',
        nickname: '技术专家',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-12-09T16:45:00Z',
        articlesCount: 12,
        notesCount: 89,
        purchasesCount: 15,
        createdAt: '2024-03-20T00:00:00Z',
        updatedAt: '2024-12-09T16:45:00Z'
      },
      {
        id: '4',
        email: 'user2@example.com',
        nickname: 'TS大师',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-12-08T14:20:00Z',
        articlesCount: 8,
        notesCount: 67,
        purchasesCount: 22,
        createdAt: '2024-04-10T00:00:00Z',
        updatedAt: '2024-12-08T14:20:00Z'
      },
      {
        id: '5',
        email: 'inactive@example.com',
        nickname: '非活跃用户',
        avatarUrl: '',
        role: 'USER',
        status: 'INACTIVE',
        emailVerified: false,
        lastLoginAt: '2024-11-15T10:30:00Z',
        articlesCount: 0,
        notesCount: 3,
        purchasesCount: 1,
        createdAt: '2024-05-25T00:00:00Z',
        updatedAt: '2024-11-15T10:30:00Z'
      }
    ]

    users.value = mockUsers
  }

  // 用户管理方法
  const updateUserFilters = (filters: Partial<typeof userFilters.value>) => {
    Object.assign(userFilters.value, filters)
  }

  const selectUser = (userId: string) => {
    if (!selectedUserIds.value.includes(userId)) {
      selectedUserIds.value.push(userId)
    }
  }

  const unselectUser = (userId: string) => {
    const index = selectedUserIds.value.indexOf(userId)
    if (index > -1) {
      selectedUserIds.value.splice(index, 1)
    }
  }

  const selectAllUsers = () => {
    selectedUserIds.value = filteredUsers.value.map(user => user.id)
  }

  const clearSelection = () => {
    selectedUserIds.value = []
  }

  const updateUserRole = async (userId: string, newRole: AdminUser['role']) => {
    try {
      isLoading.value = true
      error.value = null

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userIndex = users.value.findIndex(user => user.id === userId)
      if (userIndex > -1) {
        users.value[userIndex].role = newRole
        users.value[userIndex].updatedAt = new Date().toISOString()

        // 更新统计数据
        loadMockStats()

        // 发送事件
        eventBus.emit('admin:user-updated', { userId, role: newRole })
      }
    } catch (err) {
      error.value = '更新用户角色失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUserStatus = async (userId: string, newStatus: AdminUser['status']) => {
    try {
      isLoading.value = true
      error.value = null

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))

      const userIndex = users.value.findIndex(user => user.id === userId)
      if (userIndex > -1) {
        users.value[userIndex].status = newStatus
        users.value[userIndex].updatedAt = new Date().toISOString()

        // 更新统计数据
        loadMockStats()

        // 发送事件
        eventBus.emit('admin:user-updated', { userId, status: newStatus })
      }
    } catch (err) {
      error.value = '更新用户状态失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const batchUpdateUsers = async (userIds: string[], action: BatchAction) => {
    try {
      isLoading.value = true
      error.value = null

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      userIds.forEach(userId => {
        const userIndex = users.value.findIndex(user => user.id === userId)
        if (userIndex > -1) {
          switch (action) {
            case 'activate':
              users.value[userIndex].status = 'ACTIVE'
              break
            case 'deactivate':
              users.value[userIndex].status = 'INACTIVE'
              break
            case 'suspend':
              users.value[userIndex].status = 'SUSPENDED'
              break
            case 'delete':
              users.value.splice(userIndex, 1)
              break
          }
          if (action !== 'delete') {
            users.value[userIndex].updatedAt = new Date().toISOString()
          }
        }
      })

      // 清除选择
      clearSelection()

      // 更新统计数据
      loadMockStats()

      // 发送事件
      eventBus.emit('admin:batch-operation', { userIds, action })
    } catch (err) {
      error.value = '批量操作失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refreshStats = async () => {
    try {
      isLoading.value = true
      error.value = null

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      loadMockStats()
    } catch (err) {
      error.value = '刷新统计数据失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    stats: readonly(stats),
    users: readonly(users),
    selectedUserIds,
    userFilters,
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 计算属性
    filteredUsers,
    selectedUsers,

    // 方法
    initAdminData,
    loadMockStats,
    loadMockUsers,
    updateUserFilters,
    selectUser,
    unselectUser,
    selectAllUsers,
    clearSelection,
    updateUserRole,
    updateUserStatus,
    batchUpdateUsers,
    refreshStats
  }
}, {
  persist: {
    key: 'admin-store',
    storage: localStorage,
    paths: ['userFilters']
  }
})
