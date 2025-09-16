import { eventBus } from './EventBus'

// 性能指标类型
export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  
  // 其他重要指标
  FCP?: number // First Contentful Paint
  TTFB?: number // Time to First Byte
  TTI?: number // Time to Interactive
  
  // 自定义指标
  pageLoadTime?: number
  routeChangeTime?: number
  apiResponseTime?: number
  memoryUsage?: number
  
  // 时间戳
  timestamp: number
  url: string
}

// 性能优化配置
export interface PerformanceConfig {
  enableMetrics: boolean
  enableLazyLoading: boolean
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enableCaching: boolean
  enablePreloading: boolean
  reportInterval: number // 上报间隔（毫秒）
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMetrics: true,
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enableCaching: true,
  enablePreloading: true,
  reportInterval: 30000 // 30秒
}

export class PerformanceOptimizer {
  private config: PerformanceConfig
  private metrics: PerformanceMetrics[] = []
  private observer?: PerformanceObserver
  private reportTimer?: NodeJS.Timeout

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.init()
  }

  private init() {
    if (this.config.enableMetrics) {
      this.initPerformanceObserver()
      this.initWebVitals()
      this.startPeriodicReporting()
    }

    if (this.config.enableLazyLoading) {
      this.initLazyLoading()
    }

    if (this.config.enableImageOptimization) {
      this.initImageOptimization()
    }

    if (this.config.enablePreloading) {
      this.initResourcePreloading()
    }
  }

  // 初始化性能观察器
  private initPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported')
      return
    }

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        this.processPerformanceEntry(entry)
      })
    })

    // 观察不同类型的性能条目
    try {
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Some performance entry types not supported:', error)
    }
  }

  // 初始化 Web Vitals
  private initWebVitals() {
    // LCP (Largest Contentful Paint)
    this.observeLCP()
    
    // FID (First Input Delay)
    this.observeFID()
    
    // CLS (Cumulative Layout Shift)
    this.observeCLS()
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.recordMetric('LCP', lastEntry.startTime)
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        if (entry.name === 'first-input') {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime)
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: any[] = []

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += (entry as any).value
            sessionEntries.push(entry)
          } else {
            sessionValue = (entry as any).value
            sessionEntries = [entry]
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue
            this.recordMetric('CLS', clsValue)
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
  }

  // 处理性能条目
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationEntry(entry as PerformanceNavigationTiming)
        break
      case 'paint':
        this.processPaintEntry(entry as PerformancePaintTiming)
        break
      default:
        break
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    const metrics = {
      TTFB: entry.responseStart - entry.fetchStart,
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      timestamp: Date.now(),
      url: window.location.href
    }

    this.addMetrics(metrics)
  }

  private processPaintEntry(entry: PerformancePaintTiming) {
    if (entry.name === 'first-contentful-paint') {
      this.recordMetric('FCP', entry.startTime)
    }
  }

  // 记录单个指标
  private recordMetric(name: keyof PerformanceMetrics, value: number) {
    const metric: Partial<PerformanceMetrics> = {
      [name]: value,
      timestamp: Date.now(),
      url: window.location.href
    }

    this.addMetrics(metric)
  }

  // 添加指标
  private addMetrics(metrics: Partial<PerformanceMetrics>) {
    const fullMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      url: window.location.href,
      ...metrics
    }

    this.metrics.push(fullMetrics)

    // 发送性能指标事件
    eventBus.emit('performance:metric-recorded', { metrics: fullMetrics })

    // 限制存储的指标数量
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50)
    }
  }

  // 初始化懒加载
  private initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, lazy loading disabled')
      return
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    // 观察所有带有 data-src 的图片
    const lazyImages = document.querySelectorAll('img[data-src]')
    lazyImages.forEach(img => imageObserver.observe(img))

    // 监听新添加的懒加载图片
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            const lazyImages = element.querySelectorAll('img[data-src]')
            lazyImages.forEach(img => imageObserver.observe(img))
          }
        })
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 初始化图片优化
  private initImageOptimization() {
    // 自动添加 loading="lazy" 属性
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach(img => {
      (img as HTMLImageElement).loading = 'lazy'
    })

    // 响应式图片优化
    this.optimizeResponsiveImages()
  }

  private optimizeResponsiveImages() {
    const images = document.querySelectorAll('img[data-responsive]')
    
    images.forEach(img => {
      const element = img as HTMLImageElement
      const baseSrc = element.dataset.responsive
      
      if (baseSrc) {
        const devicePixelRatio = window.devicePixelRatio || 1
        const width = element.offsetWidth * devicePixelRatio
        
        // 根据设备像素比和宽度选择合适的图片
        let optimizedSrc = baseSrc
        if (width <= 480) {
          optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '_small.$1')
        } else if (width <= 768) {
          optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '_medium.$1')
        } else if (devicePixelRatio > 1) {
          optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '_2x.$1')
        }
        
        element.src = optimizedSrc
      }
    })
  }

  // 初始化资源预加载
  private initResourcePreloading() {
    // 预加载关键资源
    this.preloadCriticalResources()
    
    // 预加载下一页面资源
    this.preloadNextPageResources()
  }

  private preloadCriticalResources() {
    const criticalResources = [
      '/api/user/profile',
      '/api/articles/featured',
      '/fonts/main.woff2'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      
      if (resource.endsWith('.woff2')) {
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
      } else if (resource.startsWith('/api/')) {
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
      }
      
      document.head.appendChild(link)
    })
  }

  private preloadNextPageResources() {
    // 监听链接悬停，预加载页面资源
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.hostname === window.location.hostname) {
        this.preloadPage(link.href)
      }
    })
  }

  private preloadPage(url: string) {
    // 避免重复预加载
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  }

  // 开始定期上报
  private startPeriodicReporting() {
    this.reportTimer = setInterval(() => {
      this.reportMetrics()
    }, this.config.reportInterval)
  }

  // 上报性能指标
  private reportMetrics() {
    if (this.metrics.length === 0) return

    const report = {
      metrics: [...this.metrics],
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      connection: this.getConnectionInfo()
    }

    // 发送到性能监控服务
    this.sendToAnalytics(report)

    // 清空已上报的指标
    this.metrics = []
  }

  private getConnectionInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      }
    }
    
    return null
  }

  private async sendToAnalytics(report: any) {
    try {
      // 使用 sendBeacon API 确保数据发送
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(report))
      } else {
        // 降级到 fetch
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(report),
          keepalive: true
        }).catch(error => {
          console.warn('Failed to send performance metrics:', error)
        })
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error)
    }
  }

  // 手动记录自定义指标
  recordCustomMetric(name: string, value: number, context?: any) {
    const metric = {
      [name]: value,
      timestamp: Date.now(),
      url: window.location.href,
      context
    }

    this.addMetrics(metric)
  }

  // 记录路由变化时间
  recordRouteChange(from: string, to: string, duration: number) {
    this.recordCustomMetric('routeChangeTime', duration, { from, to })
  }

  // 记录API响应时间
  recordApiResponse(endpoint: string, duration: number, status: number) {
    this.recordCustomMetric('apiResponseTime', duration, { endpoint, status })
  }

  // 获取当前性能指标
  getCurrentMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  // 获取性能摘要
  getPerformanceSummary() {
    const recent = this.metrics.slice(-10)
    
    if (recent.length === 0) {
      return null
    }

    const summary = {
      avgLCP: this.calculateAverage(recent, 'LCP'),
      avgFID: this.calculateAverage(recent, 'FID'),
      avgCLS: this.calculateAverage(recent, 'CLS'),
      avgPageLoadTime: this.calculateAverage(recent, 'pageLoadTime'),
      avgApiResponseTime: this.calculateAverage(recent, 'apiResponseTime'),
      sampleSize: recent.length
    }

    return summary
  }

  private calculateAverage(metrics: PerformanceMetrics[], key: keyof PerformanceMetrics): number | null {
    const values = metrics.map(m => m[key]).filter(v => typeof v === 'number') as number[]
    
    if (values.length === 0) return null
    
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  // 清理资源
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }

    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }

    // 最后一次上报
    this.reportMetrics()
  }
}

// 全局性能优化器实例
export const performanceOptimizer = new PerformanceOptimizer()
