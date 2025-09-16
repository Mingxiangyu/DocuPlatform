import type { 
  EventKey, 
  EventPayload, 
  EventListener, 
  EventListenerConfig, 
  IEventBus 
} from '../types/events'

interface ListenerEntry<K extends EventKey> {
  listener: EventListener<K>
  config: EventListenerConfig
  id: string
}

export class TypedEventBus implements IEventBus {
  private listeners = new Map<EventKey, ListenerEntry<any>[]>()
  private maxListeners: number
  private debug: boolean
  private listenerIdCounter = 0

  constructor(options: { maxListeners?: number; debug?: boolean } = {}) {
    this.maxListeners = options.maxListeners ?? 100
    this.debug = options.debug ?? import.meta.env.VITE_EVENT_BUS_DEBUG === 'true'
  }

  on<K extends EventKey>(
    event: K, 
    listener: EventListener<K>, 
    config: EventListenerConfig = {}
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const listeners = this.listeners.get(event)!
    
    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`EventBus: 事件 "${event}" 的监听器数量已达到最大限制 ${this.maxListeners}`)
    }

    const entry: ListenerEntry<K> = {
      listener,
      config,
      id: `${event}_${++this.listenerIdCounter}`
    }

    // 按优先级插入
    const priority = config.priority ?? 0
    const insertIndex = listeners.findIndex(l => (l.config.priority ?? 0) < priority)
    
    if (insertIndex === -1) {
      listeners.push(entry)
    } else {
      listeners.splice(insertIndex, 0, entry)
    }

    if (this.debug) {
      console.log(`EventBus: 注册监听器 ${entry.id} for event "${event}"`)
    }

    // 返回取消监听的函数
    return () => this.off(event, listener)
  }

  off<K extends EventKey>(event: K, listener: EventListener<K>): void {
    const listeners = this.listeners.get(event)
    if (!listeners) return

    const index = listeners.findIndex(entry => entry.listener === listener)
    if (index !== -1) {
      const removed = listeners.splice(index, 1)[0]
      if (this.debug) {
        console.log(`EventBus: 移除监听器 ${removed.id} for event "${event}"`)
      }
    }

    // 如果没有监听器了，删除事件键
    if (listeners.length === 0) {
      this.listeners.delete(event)
    }
  }

  async emit<K extends EventKey>(event: K, payload: EventPayload<K>): Promise<void> {
    const listeners = this.listeners.get(event)
    if (!listeners || listeners.length === 0) {
      if (this.debug) {
        console.log(`EventBus: 没有监听器处理事件 "${event}"`)
      }
      return
    }

    if (this.debug) {
      console.log(`EventBus: 触发事件 "${event}"`, payload)
    }

    // 创建监听器副本，避免在执行过程中修改
    const listenersToCall = [...listeners]
    const promises: Promise<void>[] = []

    for (const entry of listenersToCall) {
      try {
        const result = entry.listener(payload)
        
        // 如果是Promise，添加到promises数组
        if (result instanceof Promise) {
          promises.push(result)
        }

        // 如果是一次性监听器，移除它
        if (entry.config.once) {
          this.off(event, entry.listener)
        }
      } catch (error) {
        console.error(`EventBus: 监听器 ${entry.id} 执行出错:`, error)
        
        // 触发错误事件
        if (event !== 'error:api') { // 避免无限循环
          this.emit('error:api', {
            endpoint: 'EventBus',
            error: error as Error,
            context: { event, payload }
          })
        }
      }
    }

    // 等待所有异步监听器完成
    if (promises.length > 0) {
      try {
        await Promise.all(promises)
      } catch (error) {
        console.error(`EventBus: 异步监听器执行出错:`, error)
      }
    }
  }

  once<K extends EventKey>(event: K, listener: EventListener<K>): Promise<EventPayload<K>> {
    return new Promise((resolve) => {
      const wrappedListener: EventListener<K> = (payload) => {
        resolve(payload)
        return listener(payload)
      }
      
      this.on(event, wrappedListener, { once: true })
    })
  }

  clear(event?: EventKey): void {
    if (event) {
      this.listeners.delete(event)
      if (this.debug) {
        console.log(`EventBus: 清除事件 "${event}" 的所有监听器`)
      }
    } else {
      this.listeners.clear()
      if (this.debug) {
        console.log('EventBus: 清除所有监听器')
      }
    }
  }

  getListenerCount(event: EventKey): number {
    return this.listeners.get(event)?.length ?? 0
  }

  hasListeners(event: EventKey): boolean {
    return this.getListenerCount(event) > 0
  }

  // 调试方法
  getDebugInfo() {
    const info: Record<string, any> = {}
    
    for (const [event, listeners] of this.listeners.entries()) {
      info[event] = {
        count: listeners.length,
        listeners: listeners.map(l => ({
          id: l.id,
          priority: l.config.priority ?? 0,
          once: l.config.once ?? false,
          context: l.config.context
        }))
      }
    }
    
    return info
  }
}

// 创建全局事件总线实例
export const eventBus = new TypedEventBus({
  maxListeners: parseInt(import.meta.env.VITE_EVENT_BUS_MAX_LISTENERS) || 50,
  debug: import.meta.env.VITE_EVENT_BUS_DEBUG === 'true'
})

// 开发环境下暴露到全局，便于调试
if (import.meta.env.DEV) {
  ;(window as any).__eventBus = eventBus
}
