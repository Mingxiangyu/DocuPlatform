import { eventBus } from './EventBus'
import { performanceOptimizer } from './PerformanceOptimizer'
import { securityManager } from './SecurityManager'

// 监控配置
export interface MonitoringConfig {
  enableErrorTracking: boolean
  enablePerformanceTracking: boolean
  enableUserTracking: boolean
  enableSecurityTracking: boolean
  enableRealTimeAlerts: boolean
  sampleRate: number // 采样率 (0-1)
  reportInterval: number // 上报间隔（毫秒）
  maxEvents: number // 最大事件数量
}

const DEFAULT_CONFIG: MonitoringConfig = {
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableUserTracking: true,
  enableSecurityTracking: true,
  enableRealTimeAlerts: true,
  sampleRate: 1.0,
  reportInterval: 30000, // 30秒
  maxEvents: 1000
}

// 监控事件类型
export interface MonitoringEvent {
  id: string
  type: 'error' | 'performance' | 'user' | 'security' | 'business'
  category: string
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  userAgent: string
  url: string
  referrer: string
}

// 用户行为事件
export interface UserEvent {
  action: string
  category: string
  label?: string
  value?: number
  metadata?: Record<string, any>
}

// 业务指标
export interface BusinessMetrics {
  // 用户参与度
  pageViews: number
  uniqueUsers: number
  sessionDuration: number
  bounceRate: number
  
  // 内容指标
  articlesRead: number
  notesCreated: number
  highlightsCreated: number
  searchQueries: number
  
  // 商业指标
  conversions: number
  revenue: number
  subscriptions: number
  
  // 技术指标
  errorRate: number
  loadTime: number
  apiResponseTime: number
}

export class MonitoringSystem {
  private config: MonitoringConfig
  private events: MonitoringEvent[] = []
  private sessionId: string
  private startTime: number = Date.now()
  private reportTimer?: NodeJS.Timeout
  private businessMetrics: Partial<BusinessMetrics> = {}

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.init()
  }

  private init() {
    console.log('🔍 监控系统初始化...')

    if (this.config.enableErrorTracking) {
      this.initErrorTracking()
    }

    if (this.config.enablePerformanceTracking) {
      this.initPerformanceTracking()
    }

    if (this.config.enableUserTracking) {
      this.initUserTracking()
    }

    if (this.config.enableSecurityTracking) {
      this.initSecurityTracking()
    }

    // 开始定期上报
    this.startPeriodicReporting()

    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.reportEvents(true)
    })

    // 页面可见性变化时上报
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportEvents(true)
      }
    })

    console.log('✅ 监控系统初始化完成')
  }

  // 初始化错误跟踪
  private initErrorTracking() {
    // JavaScript 错误
    window.addEventListener('error', (event) => {
      this.trackEvent({
        type: 'error',
        category: 'javascript',
        action: 'error',
        label: event.message,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      })
    })

    // Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent({
        type: 'error',
        category: 'promise',
        action: 'unhandled_rejection',
        label: String(event.reason),
        metadata: {
          reason: event.reason
        }
      })
    })

    // Vue 错误（通过事件总线）
    eventBus.on('error:boundary-caught', (data) => {
      this.trackEvent({
        type: 'error',
        category: 'vue',
        action: 'component_error',
        label: data.error.message,
        metadata: {
          error: data.error,
          errorInfo: data.errorInfo,
          retryCount: data.retryCount
        }
      })
    })

    // API 错误
    eventBus.on('api:error', (data) => {
      this.trackEvent({
        type: 'error',
        category: 'api',
        action: 'request_failed',
        label: data.endpoint,
        value: data.status,
        metadata: {
          method: data.method,
          status: data.status,
          error: data.error,
          duration: data.duration
        }
      })
    })
  }

  // 初始化性能跟踪
  private initPerformanceTracking() {
    // 监听性能指标
    eventBus.on('performance:metric-recorded', (data) => {
      this.trackEvent({
        type: 'performance',
        category: 'web_vitals',
        action: 'metric_recorded',
        metadata: data.metrics
      })
    })

    // 路由变化性能
    eventBus.on('router:navigation-end', (data) => {
      this.trackEvent({
        type: 'performance',
        category: 'navigation',
        action: 'route_change',
        label: data.to,
        value: data.duration,
        metadata: {
          from: data.from,
          to: data.to,
          duration: data.duration
        }
      })
    })

    // API 响应时间
    eventBus.on('api:response', (data) => {
      this.trackEvent({
        type: 'performance',
        category: 'api',
        action: 'response_time',
        label: data.endpoint,
        value: data.duration,
        metadata: {
          method: data.method,
          status: data.status,
          duration: data.duration,
          size: data.size
        }
      })
    })
  }

  // 初始化用户行为跟踪
  private initUserTracking() {
    // 页面浏览
    this.trackPageView()

    // 路由变化
    eventBus.on('router:navigation-end', (data) => {
      this.trackPageView(data.to)
    })

    // 用户交互
    this.initUserInteractionTracking()

    // 业务事件
    this.initBusinessEventTracking()
  }

  private initUserInteractionTracking() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      
      // 跟踪重要元素的点击
      if (['button', 'a', 'input'].includes(tagName) || target.closest('[data-track]')) {
        const trackElement = target.closest('[data-track]') || target
        const trackData = (trackElement as HTMLElement).dataset.track
        
        this.trackEvent({
          type: 'user',
          category: 'interaction',
          action: 'click',
          label: trackData || `${tagName}:${target.textContent?.trim().substring(0, 50)}`,
          metadata: {
            tagName,
            className: target.className,
            id: target.id,
            text: target.textContent?.trim().substring(0, 100)
          }
        })
      }
    })

    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      const formName = form.name || form.id || 'unnamed_form'
      
      this.trackEvent({
        type: 'user',
        category: 'form',
        action: 'submit',
        label: formName,
        metadata: {
          action: form.action,
          method: form.method,
          fieldCount: form.elements.length
        }
      })
    })

    // 滚动深度
    this.initScrollTracking()
  }

  private initScrollTracking() {
    let maxScroll = 0
    let scrollTimer: NodeJS.Timeout

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer)
      
      scrollTimer = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent
          
          // 记录滚动里程碑
          const milestones = [25, 50, 75, 90, 100]
          const milestone = milestones.find(m => scrollPercent >= m && maxScroll < m)
          
          if (milestone) {
            this.trackEvent({
              type: 'user',
              category: 'engagement',
              action: 'scroll_depth',
              label: `${milestone}%`,
              value: milestone
            })
          }
        }
      }, 100)
    })
  }

  private initBusinessEventTracking() {
    // 文章阅读
    eventBus.on('article:read', (data) => {
      this.trackEvent({
        type: 'business',
        category: 'content',
        action: 'article_read',
        label: data.articleId,
        value: data.readTime,
        metadata: data
      })
      
      this.updateBusinessMetric('articlesRead', 1)
    })

    // 笔记创建
    eventBus.on('note:created', (data) => {
      this.trackEvent({
        type: 'business',
        category: 'content',
        action: 'note_created',
        label: data.articleId,
        metadata: data
      })
      
      this.updateBusinessMetric('notesCreated', 1)
    })

    // 高亮创建
    eventBus.on('highlight:created', (data) => {
      this.trackEvent({
        type: 'business',
        category: 'content',
        action: 'highlight_created',
        label: data.articleId,
        metadata: data
      })
      
      this.updateBusinessMetric('highlightsCreated', 1)
    })

    // 搜索查询
    eventBus.on('search:query', (data) => {
      this.trackEvent({
        type: 'business',
        category: 'search',
        action: 'query',
        label: data.query,
        value: data.results,
        metadata: data
      })
      
      this.updateBusinessMetric('searchQueries', 1)
    })

    // 支付转化
    eventBus.on('payment:completed', (data) => {
      this.trackEvent({
        type: 'business',
        category: 'conversion',
        action: 'payment_completed',
        label: data.planId,
        value: data.amount,
        metadata: data
      })
      
      this.updateBusinessMetric('conversions', 1)
      this.updateBusinessMetric('revenue', data.amount)
    })
  }

  // 初始化安全跟踪
  private initSecurityTracking() {
    eventBus.on('security:threat-detected', (data) => {
      this.trackEvent({
        type: 'security',
        category: 'threat',
        action: data.type,
        label: data.description,
        value: this.getSeverityScore(data.severity),
        metadata: {
          severity: data.severity,
          blocked: data.blocked,
          payload: data.payload
        }
      })

      // 高危威胁实时告警
      if (data.severity === 'high' || data.severity === 'critical') {
        this.sendRealTimeAlert('security', data)
      }
    })
  }

  private getSeverityScore(severity: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 }
    return scores[severity as keyof typeof scores] || 0
  }

  // 跟踪事件
  trackEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp' | 'sessionId' | 'userId' | 'userAgent' | 'url' | 'referrer'>) {
    // 采样控制
    if (Math.random() > this.config.sampleRate) {
      return
    }

    const monitoringEvent: MonitoringEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      ...event
    }

    this.events.push(monitoringEvent)

    // 限制事件数量
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-Math.floor(this.config.maxEvents * 0.8))
    }

    // 实时告警检查
    if (this.config.enableRealTimeAlerts) {
      this.checkRealTimeAlerts(monitoringEvent)
    }

    console.debug('📊 Event tracked:', monitoringEvent)
  }

  // 跟踪页面浏览
  trackPageView(path?: string) {
    this.trackEvent({
      type: 'user',
      category: 'navigation',
      action: 'page_view',
      label: path || window.location.pathname,
      metadata: {
        title: document.title,
        path: path || window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      }
    })

    this.updateBusinessMetric('pageViews', 1)
  }

  // 跟踪用户事件
  trackUserEvent(event: UserEvent) {
    this.trackEvent({
      type: 'user',
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      metadata: event.metadata
    })
  }

  // 更新业务指标
  private updateBusinessMetric(metric: keyof BusinessMetrics, value: number) {
    this.businessMetrics[metric] = (this.businessMetrics[metric] || 0) + value
  }

  // 实时告警检查
  private checkRealTimeAlerts(event: MonitoringEvent) {
    // 错误率告警
    if (event.type === 'error') {
      const recentErrors = this.events.filter(e => 
        e.type === 'error' && 
        Date.now() - e.timestamp < 60000 // 最近1分钟
      ).length

      if (recentErrors > 10) {
        this.sendRealTimeAlert('error_spike', { count: recentErrors, event })
      }
    }

    // 性能告警
    if (event.type === 'performance' && event.value && event.value > 3000) {
      this.sendRealTimeAlert('performance_degradation', { metric: event.action, value: event.value })
    }
  }

  // 发送实时告警
  private async sendRealTimeAlert(type: string, data: any) {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          sessionId: this.sessionId
        })
      })
    } catch (error) {
      console.error('Failed to send real-time alert:', error)
    }
  }

  // 开始定期上报
  private startPeriodicReporting() {
    this.reportTimer = setInterval(() => {
      this.reportEvents()
    }, this.config.reportInterval)
  }

  // 上报事件
  private async reportEvents(immediate = false) {
    if (this.events.length === 0) return

    const events = [...this.events]
    this.events = []

    const report = {
      events,
      businessMetrics: { ...this.businessMetrics },
      sessionInfo: {
        sessionId: this.sessionId,
        duration: Date.now() - this.startTime,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
    }

    try {
      if (immediate && 'sendBeacon' in navigator) {
        // 页面卸载时使用 sendBeacon
        navigator.sendBeacon('/api/monitoring/events', JSON.stringify(report))
      } else {
        // 正常上报使用 fetch
        await fetch('/api/monitoring/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(report),
          keepalive: immediate
        })
      }

      console.debug(`📤 Reported ${events.length} events`)
    } catch (error) {
      console.error('Failed to report events:', error)
      // 失败时重新加入队列
      this.events.unshift(...events)
    }
  }

  // 工具方法
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string | undefined {
    // 从认证状态获取用户ID
    try {
      const authData = localStorage.getItem('auth_user')
      if (authData) {
        const user = JSON.parse(authData)
        return user.id
      }
    } catch {
      // 忽略错误
    }
    return undefined
  }

  // 公共方法
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      eventCount: this.events.length,
      businessMetrics: { ...this.businessMetrics }
    }
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events]
  }

  // 清理资源
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }

    // 最后一次上报
    this.reportEvents(true)
  }
}

// 全局监控系统实例
export const monitoringSystem = new MonitoringSystem()
