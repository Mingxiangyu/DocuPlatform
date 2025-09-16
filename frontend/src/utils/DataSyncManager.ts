import { eventBus } from './EventBus'

// 数据同步状态
export interface SyncStatus {
  isOnline: boolean
  lastSyncTime: number
  pendingOperations: PendingOperation[]
  syncInProgress: boolean
  retryCount: number
}

// 待同步操作
export interface PendingOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'article' | 'note' | 'highlight' | 'user' | 'payment'
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
}

// 同步配置
export interface SyncConfig {
  syncInterval: number // 同步间隔（毫秒）
  maxRetries: number // 最大重试次数
  retryDelay: number // 重试延迟（毫秒）
  batchSize: number // 批量同步大小
  enableOfflineMode: boolean // 启用离线模式
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  syncInterval: 30000, // 30秒
  maxRetries: 3,
  retryDelay: 5000, // 5秒
  batchSize: 10,
  enableOfflineMode: true
}

export class DataSyncManager {
  private config: SyncConfig
  private status: SyncStatus
  private syncTimer?: NodeJS.Timeout
  private retryTimer?: NodeJS.Timeout

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config }
    this.status = {
      isOnline: navigator.onLine,
      lastSyncTime: 0,
      pendingOperations: [],
      syncInProgress: false,
      retryCount: 0
    }

    this.init()
  }

  private init() {
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // 从本地存储恢复待同步操作
    this.loadPendingOperations()

    // 启动定时同步
    this.startPeriodicSync()

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  // 网络状态处理
  private handleOnline() {
    console.log('DataSyncManager: Network online')
    this.status.isOnline = true
    this.status.retryCount = 0
    
    eventBus.emit('sync:network-online', {})
    
    // 立即尝试同步
    this.syncPendingOperations()
  }

  private handleOffline() {
    console.log('DataSyncManager: Network offline')
    this.status.isOnline = false
    
    eventBus.emit('sync:network-offline', {})
  }

  private handleVisibilityChange() {
    if (!document.hidden && this.status.isOnline) {
      // 页面重新可见时尝试同步
      this.syncPendingOperations()
    }
  }

  // 添加待同步操作
  addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const pendingOp: PendingOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.status.pendingOperations.push(pendingOp)
    this.savePendingOperations()

    eventBus.emit('sync:operation-queued', { operation: pendingOp })

    // 如果在线，立即尝试同步
    if (this.status.isOnline && !this.status.syncInProgress) {
      setTimeout(() => this.syncPendingOperations(), 100)
    }

    return pendingOp.id
  }

  // 同步待处理操作
  private async syncPendingOperations() {
    if (this.status.syncInProgress || !this.status.isOnline || this.status.pendingOperations.length === 0) {
      return
    }

    this.status.syncInProgress = true
    eventBus.emit('sync:started', { operationCount: this.status.pendingOperations.length })

    try {
      // 按批次处理操作
      const batches = this.createBatches(this.status.pendingOperations, this.config.batchSize)
      
      for (const batch of batches) {
        await this.processBatch(batch)
      }

      this.status.lastSyncTime = Date.now()
      this.status.retryCount = 0
      
      eventBus.emit('sync:completed', { 
        syncTime: this.status.lastSyncTime,
        operationsProcessed: this.status.pendingOperations.length
      })

    } catch (error) {
      console.error('DataSyncManager: Sync failed', error)
      this.status.retryCount++
      
      eventBus.emit('sync:failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: this.status.retryCount
      })

      // 安排重试
      if (this.status.retryCount < this.config.maxRetries) {
        this.scheduleRetry()
      }
    } finally {
      this.status.syncInProgress = false
    }
  }

  // 处理批次
  private async processBatch(batch: PendingOperation[]) {
    const results = await Promise.allSettled(
      batch.map(operation => this.processOperation(operation))
    )

    // 处理结果
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const operation = batch[i]

      if (result.status === 'fulfilled') {
        // 成功，从待同步列表中移除
        this.removePendingOperation(operation.id)
        eventBus.emit('sync:operation-completed', { operation })
      } else {
        // 失败，增加重试次数
        operation.retryCount++
        if (operation.retryCount >= operation.maxRetries) {
          // 超过最大重试次数，移除操作
          this.removePendingOperation(operation.id)
          eventBus.emit('sync:operation-failed', { 
            operation, 
            error: result.reason 
          })
        }
      }
    }

    this.savePendingOperations()
  }

  // 处理单个操作
  private async processOperation(operation: PendingOperation): Promise<void> {
    const { type, entity, data } = operation

    // 模拟API调用
    const endpoint = this.getApiEndpoint(entity, type, data)
    const method = this.getHttpMethod(type)
    
    try {
      // 检查后端可用性
      const backendAvailable = await this.checkBackendAvailable()
      
      if (!backendAvailable) {
        throw new Error('Backend not available')
      }

      // 模拟API调用
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: type !== 'DELETE' ? JSON.stringify(data) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`DataSyncManager: ${type} ${entity} synced successfully`, result)

    } catch (error) {
      console.error(`DataSyncManager: Failed to sync ${type} ${entity}`, error)
      throw error
    }
  }

  // 辅助方法
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private getApiEndpoint(entity: string, type: string, data: any): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
    
    switch (entity) {
      case 'article':
        return type === 'CREATE' ? `${baseUrl}/articles` : `${baseUrl}/articles/${data.id}`
      case 'note':
        return type === 'CREATE' ? `${baseUrl}/notes` : `${baseUrl}/notes/${data.id}`
      case 'highlight':
        return type === 'CREATE' ? `${baseUrl}/highlights` : `${baseUrl}/highlights/${data.id}`
      case 'user':
        return type === 'CREATE' ? `${baseUrl}/users` : `${baseUrl}/users/${data.id}`
      case 'payment':
        return type === 'CREATE' ? `${baseUrl}/payments` : `${baseUrl}/payments/${data.id}`
      default:
        throw new Error(`Unknown entity type: ${entity}`)
    }
  }

  private getHttpMethod(type: string): string {
    switch (type) {
      case 'CREATE': return 'POST'
      case 'UPDATE': return 'PUT'
      case 'DELETE': return 'DELETE'
      default: throw new Error(`Unknown operation type: ${type}`)
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || ''
  }

  private async checkBackendAvailable(): Promise<boolean> {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      } as any)
      return response.ok
    } catch {
      return false
    }
  }

  private removePendingOperation(operationId: string) {
    const index = this.status.pendingOperations.findIndex(op => op.id === operationId)
    if (index > -1) {
      this.status.pendingOperations.splice(index, 1)
    }
  }

  private scheduleRetry() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }

    const delay = this.config.retryDelay * Math.pow(2, this.status.retryCount - 1) // 指数退避
    
    this.retryTimer = setTimeout(() => {
      this.syncPendingOperations()
    }, delay)

    eventBus.emit('sync:retry-scheduled', { 
      delay, 
      retryCount: this.status.retryCount 
    })
  }

  // 定时同步
  private startPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      if (this.status.isOnline && this.status.pendingOperations.length > 0) {
        this.syncPendingOperations()
      }
    }, this.config.syncInterval)
  }

  // 本地存储操作
  private savePendingOperations() {
    try {
      localStorage.setItem('docuvault_pending_sync', JSON.stringify(this.status.pendingOperations))
    } catch (error) {
      console.error('DataSyncManager: Failed to save pending operations', error)
    }
  }

  private loadPendingOperations() {
    try {
      const stored = localStorage.getItem('docuvault_pending_sync')
      if (stored) {
        this.status.pendingOperations = JSON.parse(stored)
      }
    } catch (error) {
      console.error('DataSyncManager: Failed to load pending operations', error)
      this.status.pendingOperations = []
    }
  }

  // 公共方法
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  forcSync(): void {
    if (this.status.isOnline) {
      this.syncPendingOperations()
    }
  }

  clearPendingOperations(): void {
    this.status.pendingOperations = []
    this.savePendingOperations()
    eventBus.emit('sync:operations-cleared', {})
  }

  // 清理资源
  destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }

    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }
}

// 全局数据同步管理器实例
export const dataSyncManager = new DataSyncManager()
