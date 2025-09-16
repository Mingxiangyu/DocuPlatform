// 事件总线类型定义
export interface EventMap {
  // 用户相关事件
  'user:login': { userId: string; token: string }
  'user:logout': { userId: string }
  'user:profile-updated': { userId: string; changes: Record<string, any> }
  
  // 文章相关事件
  'article:viewed': { articleId: string; userId?: string }
  'article:liked': { articleId: string; userId: string }
  'article:unliked': { articleId: string; userId: string }
  'article:purchased': { articleId: string; userId: string; orderId: string }
  
  // 笔记相关事件
  'note:created': { noteId: string; articleId: string; userId: string }
  'note:updated': { noteId: string; changes: Record<string, any> }
  'note:deleted': { noteId: string; articleId: string; userId: string }
  'notes:loaded': { count: number }
  'notes:view-changed': 'grouped' | 'timeline'
  'notes:filter-changed': 'all' | 'highlight' | 'note' | 'both'
  'notes:sort-changed': 'newest' | 'oldest' | 'article'
  'notes:search-changed': string
  
  // 高亮相关事件
  'highlight:created': { highlightId: string; articleId: string; userId: string; virtualNodeId: string }
  'highlight:deleted': { highlightId: string; articleId: string; userId: string }
  'highlight:color-changed': { highlightId: string; newColor: string }
  'highlight:linked-to-note': { highlightId: string; noteId: string; articleId: string }
  
  // 虚拟DOM相关事件
  'virtual-dom:node-created': { nodeId: string; parentId?: string; type: string }
  'virtual-dom:node-updated': { nodeId: string; changes: Record<string, any> }
  'virtual-dom:selection-changed': { startNodeId: string; endNodeId: string; text: string }
  
  // UI状态事件
  'ui:modal-opened': { modalId: string; data?: any }
  'ui:modal-closed': { modalId: string }
  'ui:notification': { type: 'success' | 'error' | 'warning' | 'info'; message: string; duration?: number }
  'ui:loading-start': { operation: string }
  'ui:loading-end': { operation: string }
  
  // 搜索相关事件
  'search:query-changed': { query: string; filters?: Record<string, any> }
  'search:results-updated': { results: any[]; total: number; query: string }
  
  // 支付相关事件
  'payment:initiated': { orderId: string; amount: number; method: string }
  'payment:completed': { orderId: string; paymentId: string }
  'payment:failed': { orderId: string; error: string }
  'payment:modal-opened': { articleId: string; amount: number }
  'payment:modal-closed': { orderId?: string; reason: 'success' | 'cancelled' | 'failed' }
  'payment:method-changed': 'wechat' | 'alipay'
  'payment:qr-refreshed': { orderId: string; qrCodeUrl: string }
  'payment:countdown-expired': { orderId: string }
  
  // 缓存相关事件
  'cache:invalidated': { key: string; reason: string }
  'cache:updated': { key: string; data: any }
  
  // 错误处理事件
  'error:api': { endpoint: string; error: Error; context?: any }
  'error:validation': { field: string; message: string; value: any }
  'error:network': { type: 'timeout' | 'offline' | 'server'; details: string }
}

export type EventKey = keyof EventMap
export type EventPayload<K extends EventKey> = EventMap[K]
export type EventListener<K extends EventKey> = (payload: EventPayload<K>) => void | Promise<void>

// 事件监听器配置
export interface EventListenerConfig {
  once?: boolean
  priority?: number
  context?: string
}

// 事件总线接口
export interface IEventBus {
  on<K extends EventKey>(event: K, listener: EventListener<K>, config?: EventListenerConfig): () => void
  off<K extends EventKey>(event: K, listener: EventListener<K>): void
  emit<K extends EventKey>(event: K, payload: EventPayload<K>): Promise<void>
  once<K extends EventKey>(event: K, listener: EventListener<K>): Promise<EventPayload<K>>
  clear(event?: EventKey): void
  getListenerCount(event: EventKey): number
  hasListeners(event: EventKey): boolean
}
