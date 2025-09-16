/**
 * DocuVault 设计系统 - 性能优化配置
 * 提供性能监控、优化策略和最佳实践
 */

import type { PerformanceMetrics, ComponentEvent } from '../types'

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()
  private enabled = true

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
    this.initializeObservers()
  }

  /**
   * 初始化性能观察器
   */
  private initializeObservers() {
    if (!this.enabled || typeof window === 'undefined') return

    // 监控组件渲染性能
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.startsWith('ds-component-')) {
            this.recordMetric(entry.name, {
              componentName: entry.name.replace('ds-component-', ''),
              renderTime: entry.duration,
              updateTime: 0,
              memoryUsage: this.getMemoryUsage(),
              timestamp: entry.startTime
            })
          }
        }
      })

      observer.observe({ entryTypes: ['measure'] })
      this.observers.set('component-render', observer)
    }

    // 监控内存使用
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage()
      }, 30000) // 每30秒记录一次内存使用
    }
  }

  /**
   * 记录组件性能指标
   */
  recordMetric(componentName: string, metric: PerformanceMetrics) {
    if (!this.enabled) return

    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, [])
    }

    const metrics = this.metrics.get(componentName)!
    metrics.push(metric)

    // 保持最近100条记录
    if (metrics.length > 100) {
      metrics.shift()
    }

    // 触发性能警告
    this.checkPerformanceThresholds(componentName, metric)
  }

  /**
   * 检查性能阈值
   */
  private checkPerformanceThresholds(componentName: string, metric: PerformanceMetrics) {
    const thresholds = {
      renderTime: 16, // 16ms (60fps)
      updateTime: 8,  // 8ms
      memoryUsage: 50 * 1024 * 1024 // 50MB
    }

    if (metric.renderTime > thresholds.renderTime) {
      console.warn(`[Performance] ${componentName} 渲染时间过长: ${metric.renderTime.toFixed(2)}ms`)
    }

    if (metric.updateTime > thresholds.updateTime) {
      console.warn(`[Performance] ${componentName} 更新时间过长: ${metric.updateTime.toFixed(2)}ms`)
    }

    if (metric.memoryUsage > thresholds.memoryUsage) {
      console.warn(`[Performance] ${componentName} 内存使用过高: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  /**
   * 记录内存使用
   */
  private recordMemoryUsage() {
    const memoryUsage = this.getMemoryUsage()
    if (memoryUsage > 0) {
      this.recordMetric('system-memory', {
        componentName: 'system',
        renderTime: 0,
        updateTime: 0,
        memoryUsage,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 获取组件性能统计
   */
  getComponentStats(componentName: string) {
    const metrics = this.metrics.get(componentName) || []
    if (metrics.length === 0) return null

    const renderTimes = metrics.map(m => m.renderTime).filter(t => t > 0)
    const updateTimes = metrics.map(m => m.updateTime).filter(t => t > 0)
    const memoryUsages = metrics.map(m => m.memoryUsage).filter(m => m > 0)

    return {
      componentName,
      totalRenders: renderTimes.length,
      totalUpdates: updateTimes.length,
      averageRenderTime: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0,
      averageUpdateTime: updateTimes.length > 0 ? updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length : 0,
      averageMemoryUsage: memoryUsages.length > 0 ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length : 0,
      maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
      maxUpdateTime: updateTimes.length > 0 ? Math.max(...updateTimes) : 0,
      maxMemoryUsage: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0
    }
  }

  /**
   * 获取所有组件性能报告
   */
  getPerformanceReport() {
    const report: any = {
      timestamp: new Date().toISOString(),
      components: {},
      summary: {
        totalComponents: this.metrics.size,
        totalMetrics: 0,
        averageRenderTime: 0,
        averageMemoryUsage: 0
      }
    }

    let totalRenderTime = 0
    let totalMemoryUsage = 0
    let totalRenderCount = 0
    let totalMemoryCount = 0

    for (const [componentName] of this.metrics) {
      const stats = this.getComponentStats(componentName)
      if (stats) {
        report.components[componentName] = stats
        report.summary.totalMetrics += stats.totalRenders + stats.totalUpdates

        if (stats.averageRenderTime > 0) {
          totalRenderTime += stats.averageRenderTime
          totalRenderCount++
        }

        if (stats.averageMemoryUsage > 0) {
          totalMemoryUsage += stats.averageMemoryUsage
          totalMemoryCount++
        }
      }
    }

    report.summary.averageRenderTime = totalRenderCount > 0 ? totalRenderTime / totalRenderCount : 0
    report.summary.averageMemoryUsage = totalMemoryCount > 0 ? totalMemoryUsage / totalMemoryCount : 0

    return report
  }

  /**
   * 清除性能数据
   */
  clearMetrics(componentName?: string) {
    if (componentName) {
      this.metrics.delete(componentName)
    } else {
      this.metrics.clear()
    }
  }

  /**
   * 销毁监控器
   */
  destroy() {
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()
    this.metrics.clear()
    this.enabled = false
  }
}

/**
 * 组件性能装饰器
 */
export function withPerformanceTracking(componentName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const startTime = performance.now()
      
      try {
        const result = originalMethod.apply(this, args)
        
        // 如果是 Promise，等待完成后记录
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            const endTime = performance.now()
            performanceMonitor.recordMetric(componentName, {
              componentName,
              renderTime: endTime - startTime,
              updateTime: 0,
              memoryUsage: performanceMonitor['getMemoryUsage'](),
              timestamp: startTime
            })
          })
        } else {
          const endTime = performance.now()
          performanceMonitor.recordMetric(componentName, {
            componentName,
            renderTime: endTime - startTime,
            updateTime: 0,
            memoryUsage: performanceMonitor['getMemoryUsage'](),
            timestamp: startTime
          })
          return result
        }
      } catch (error) {
        const endTime = performance.now()
        performanceMonitor.recordMetric(componentName, {
          componentName,
          renderTime: endTime - startTime,
          updateTime: 0,
          memoryUsage: performanceMonitor['getMemoryUsage'](),
          timestamp: startTime
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 全局性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor({
  enabled: process.env.NODE_ENV === 'development'
})

/**
 * 性能优化工具
 */
export const performanceUtils = {
  /**
   * 延迟执行函数
   */
  defer(fn: Function) {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => fn())
    } else {
      setTimeout(() => fn(), 0)
    }
  },

  /**
   * 批量更新DOM
   */
  batchUpdate(updates: Function[]) {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        updates.forEach(update => update())
      })
    } else {
      updates.forEach(update => update())
    }
  },

  /**
   * 虚拟滚动计算
   */
  calculateVirtualScrollItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan = 5
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2)

    return {
      startIndex,
      endIndex,
      visibleCount,
      offsetY: startIndex * itemHeight
    }
  },

  /**
   * 图片懒加载
   */
  createLazyImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    if (typeof IntersectionObserver === 'undefined') {
      return null
    }

    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })
  },

  /**
   * 预加载关键资源
   */
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    
    switch (type) {
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
      case 'image':
        link.as = 'image'
        break
      case 'font':
        link.as = 'font'
        link.crossOrigin = 'anonymous'
        break
    }
    
    document.head.appendChild(link)
  },

  /**
   * 检测设备性能
   */
  getDevicePerformance() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    const memory = (performance as any).memory
    
    return {
      // 网络信息
      networkType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      
      // 内存信息
      memoryLimit: memory?.jsHeapSizeLimit || 0,
      memoryUsed: memory?.usedJSHeapSize || 0,
      memoryTotal: memory?.totalJSHeapSize || 0,
      
      // 硬件信息
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 0,
      
      // 性能等级评估
      performanceLevel: this.assessPerformanceLevel(connection, memory, navigator.hardwareConcurrency)
    }
  },

  /**
   * 评估设备性能等级
   */
  assessPerformanceLevel(connection: any, memory: any, cores: number): 'low' | 'medium' | 'high' {
    let score = 0
    
    // 网络评分
    if (connection?.effectiveType === '4g') score += 3
    else if (connection?.effectiveType === '3g') score += 2
    else if (connection?.effectiveType === '2g') score += 1
    
    // 内存评分
    const memoryGB = (memory?.jsHeapSizeLimit || 0) / (1024 * 1024 * 1024)
    if (memoryGB >= 4) score += 3
    else if (memoryGB >= 2) score += 2
    else if (memoryGB >= 1) score += 1
    
    // CPU评分
    if (cores >= 8) score += 3
    else if (cores >= 4) score += 2
    else if (cores >= 2) score += 1
    
    if (score >= 7) return 'high'
    if (score >= 4) return 'medium'
    return 'low'
  }
}

/**
 * 性能优化配置
 */
export const performanceConfig = {
  // 虚拟滚动配置
  virtualScroll: {
    itemHeight: 50,
    overscan: 5,
    threshold: 100 // 超过100项启用虚拟滚动
  },
  
  // 图片懒加载配置
  lazyLoading: {
    rootMargin: '50px 0px',
    threshold: 0.01,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
  },
  
  // 防抖节流配置
  debounce: {
    search: 300,
    resize: 100,
    scroll: 16
  },
  
  // 缓存配置
  cache: {
    maxSize: 100,
    ttl: 5 * 60 * 1000 // 5分钟
  },
  
  // 性能阈值
  thresholds: {
    renderTime: 16, // 16ms (60fps)
    updateTime: 8,  // 8ms
    memoryUsage: 50 * 1024 * 1024, // 50MB
    bundleSize: 500 * 1024, // 500KB
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500 // 2.5s
  }
}

/**
 * 导出性能监控钩子
 */
export function usePerformanceMonitor() {
  return {
    monitor: performanceMonitor,
    utils: performanceUtils,
    config: performanceConfig,
    withTracking: withPerformanceTracking
  }
}
