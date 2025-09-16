import { eventBus } from './EventBus'

// 安全配置
export interface SecurityConfig {
  enableCSP: boolean // Content Security Policy
  enableXSSProtection: boolean // XSS 防护
  enableCSRFProtection: boolean // CSRF 防护
  enableInputSanitization: boolean // 输入净化
  enableRateLimiting: boolean // 频率限制
  enableSecureHeaders: boolean // 安全头部
  maxRequestsPerMinute: number // 每分钟最大请求数
  sessionTimeout: number // 会话超时时间（毫秒）
}

const DEFAULT_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableInputSanitization: true,
  enableRateLimiting: true,
  enableSecureHeaders: true,
  maxRequestsPerMinute: 60,
  sessionTimeout: 30 * 60 * 1000 // 30分钟
}

// 安全威胁类型
export type ThreatType = 'xss' | 'csrf' | 'injection' | 'rate_limit' | 'session_hijack' | 'malicious_input'

// 安全事件
export interface SecurityEvent {
  type: ThreatType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  payload?: any
  timestamp: number
  userAgent: string
  ip?: string
  blocked: boolean
}

export class SecurityManager {
  private config: SecurityConfig
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()
  private csrfToken: string = ''
  private sessionStartTime: number = Date.now()
  private securityEvents: SecurityEvent[] = []

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.init()
  }

  private init() {
    if (this.config.enableCSP) {
      this.initContentSecurityPolicy()
    }

    if (this.config.enableXSSProtection) {
      this.initXSSProtection()
    }

    if (this.config.enableCSRFProtection) {
      this.initCSRFProtection()
    }

    if (this.config.enableSecureHeaders) {
      this.initSecureHeaders()
    }

    // 监听安全相关事件
    this.initSecurityEventListeners()

    // 定期清理过期数据
    setInterval(() => this.cleanup(), 60000) // 每分钟清理一次
  }

  // 初始化内容安全策略
  private initContentSecurityPolicy() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.docuvault.com ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    const csp = cspDirectives.join('; ')
    
    // 设置 CSP meta 标签
    const metaTag = document.createElement('meta')
    metaTag.httpEquiv = 'Content-Security-Policy'
    metaTag.content = csp
    document.head.appendChild(metaTag)

    console.log('CSP initialized:', csp)
  }

  // 初始化 XSS 防护
  private initXSSProtection() {
    // 监听所有表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      const formData = new FormData(form)
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && this.detectXSS(value)) {
          this.logSecurityEvent({
            type: 'xss',
            severity: 'high',
            description: `XSS attempt detected in form field: ${key}`,
            payload: { field: key, value: value.substring(0, 100) },
            blocked: true
          })
          
          event.preventDefault()
          this.showSecurityWarning('检测到潜在的XSS攻击，请求已被阻止')
          return
        }
      }
    })

    // 监听动态内容插入
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            this.scanElementForXSS(element)
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 检测 XSS 攻击
  private detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  private scanElementForXSS(element: Element) {
    // 检查元素属性
    Array.from(element.attributes).forEach(attr => {
      if (this.detectXSS(attr.value)) {
        this.logSecurityEvent({
          type: 'xss',
          severity: 'high',
          description: `XSS attempt detected in element attribute: ${attr.name}`,
          payload: { attribute: attr.name, value: attr.value.substring(0, 100) },
          blocked: true
        })
        
        element.removeAttribute(attr.name)
      }
    })

    // 检查文本内容
    if (element.textContent && this.detectXSS(element.textContent)) {
      this.logSecurityEvent({
        type: 'xss',
        severity: 'medium',
        description: 'XSS attempt detected in element text content',
        payload: { content: element.textContent.substring(0, 100) },
        blocked: true
      })
      
      element.textContent = '[内容已被安全过滤]'
    }
  }

  // 初始化 CSRF 防护
  private initCSRFProtection() {
    this.generateCSRFToken()

    // 拦截所有 fetch 请求，添加 CSRF token
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      
      // 只对同源请求添加 CSRF token
      if (this.isSameOrigin(url)) {
        init = init || {}
        init.headers = {
          ...init.headers,
          'X-CSRF-Token': this.csrfToken
        }
      }

      return originalFetch(input, init)
    }

    // 监听表单提交，添加 CSRF token
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      
      if (this.isSameOrigin(form.action)) {
        let csrfInput = form.querySelector('input[name="_csrf_token"]') as HTMLInputElement
        
        if (!csrfInput) {
          csrfInput = document.createElement('input')
          csrfInput.type = 'hidden'
          csrfInput.name = '_csrf_token'
          form.appendChild(csrfInput)
        }
        
        csrfInput.value = this.csrfToken
      }
    })
  }

  private generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    return this.csrfToken
  }

  private isSameOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin)
      return urlObj.origin === window.location.origin
    } catch {
      return true // 相对URL视为同源
    }
  }

  // 初始化安全头部
  private initSecureHeaders() {
    // 这些头部通常由服务器设置，这里主要用于检查
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy'
    ]

    // 检查是否设置了安全头部
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        const missingHeaders = requiredHeaders.filter(header => !response.headers.has(header))
        
        if (missingHeaders.length > 0) {
          this.logSecurityEvent({
            type: 'csrf',
            severity: 'medium',
            description: `Missing security headers: ${missingHeaders.join(', ')}`,
            blocked: false
          })
        }
      })
      .catch(() => {
        // 忽略错误
      })
  }

  // 初始化安全事件监听器
  private initSecurityEventListeners() {
    // 监听控制台错误（可能的攻击尝试）
    window.addEventListener('error', (event) => {
      if (event.message.includes('Script error') || event.message.includes('Uncaught')) {
        this.logSecurityEvent({
          type: 'injection',
          severity: 'low',
          description: `Potential script injection attempt: ${event.message}`,
          payload: { filename: event.filename, lineno: event.lineno },
          blocked: false
        })
      }
    })

    // 监听未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && typeof event.reason === 'string') {
        if (this.detectXSS(event.reason)) {
          this.logSecurityEvent({
            type: 'xss',
            severity: 'medium',
            description: 'XSS attempt detected in unhandled promise rejection',
            payload: { reason: event.reason.substring(0, 100) },
            blocked: false
          })
        }
      }
    })
  }

  // 频率限制检查
  checkRateLimit(identifier: string = 'global'): boolean {
    if (!this.config.enableRateLimiting) {
      return true
    }

    const now = Date.now()
    const windowStart = Math.floor(now / 60000) * 60000 // 1分钟窗口
    
    const record = this.requestCounts.get(identifier)
    
    if (!record || record.resetTime !== windowStart) {
      this.requestCounts.set(identifier, { count: 1, resetTime: windowStart })
      return true
    }

    if (record.count >= this.config.maxRequestsPerMinute) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        description: `Rate limit exceeded for identifier: ${identifier}`,
        payload: { identifier, count: record.count },
        blocked: true
      })
      
      return false
    }

    record.count++
    return true
  }

  // 输入净化
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) {
      return input
    }

    // HTML 实体编码
    const div = document.createElement('div')
    div.textContent = input
    let sanitized = div.innerHTML

    // 移除潜在的危险字符
    sanitized = sanitized
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .replace(/expression\s*\(/gi, '') // 移除 CSS expression
      .trim()

    return sanitized
  }

  // 验证会话
  validateSession(): boolean {
    const now = Date.now()
    const sessionAge = now - this.sessionStartTime

    if (sessionAge > this.config.sessionTimeout) {
      this.logSecurityEvent({
        type: 'session_hijack',
        severity: 'medium',
        description: 'Session timeout detected',
        blocked: true
      })

      // 清除会话
      this.clearSession()
      return false
    }

    return true
  }

  // 清除会话
  private clearSession() {
    localStorage.removeItem('auth_token')
    sessionStorage.clear()
    
    eventBus.emit('auth:session-expired', {})
    
    // 重定向到登录页
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?reason=session_expired'
    }
  }

  // 记录安全事件
  private logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'userAgent'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }

    this.securityEvents.push(securityEvent)

    // 限制事件数量
    if (this.securityEvents.length > 100) {
      this.securityEvents = this.securityEvents.slice(-50)
    }

    // 发送安全事件
    eventBus.emit('security:threat-detected', securityEvent)

    // 高危事件立即上报
    if (event.severity === 'high' || event.severity === 'critical') {
      this.reportSecurityEvent(securityEvent)
    }

    console.warn('Security event:', securityEvent)
  }

  // 上报安全事件
  private async reportSecurityEvent(event: SecurityEvent) {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to report security event:', error)
    }
  }

  // 显示安全警告
  private showSecurityWarning(message: string) {
    eventBus.emit('notification:show', {
      type: 'error',
      message,
      duration: 5000
    })
  }

  // 清理过期数据
  private cleanup() {
    const now = Date.now()
    
    // 清理过期的频率限制记录
    for (const [key, record] of this.requestCounts.entries()) {
      if (now - record.resetTime > 60000) {
        this.requestCounts.delete(key)
      }
    }

    // 清理旧的安全事件
    this.securityEvents = this.securityEvents.filter(
      event => now - event.timestamp < 24 * 60 * 60 * 1000 // 保留24小时
    )
  }

  // 公共方法
  getCSRFToken(): string {
    return this.csrfToken
  }

  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents]
  }

  getSecuritySummary() {
    const events = this.securityEvents
    const now = Date.now()
    const last24h = events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000)

    return {
      totalEvents: events.length,
      last24h: last24h.length,
      byType: this.groupEventsByType(last24h),
      bySeverity: this.groupEventsBySeverity(last24h),
      blocked: last24h.filter(e => e.blocked).length
    }
  }

  private groupEventsByType(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<ThreatType, number>)
  }

  private groupEventsBySeverity(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  // 手动触发安全检查
  performSecurityScan(): Promise<{ passed: boolean; issues: string[] }> {
    return new Promise((resolve) => {
      const issues: string[] = []

      // 检查 HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        issues.push('网站未使用 HTTPS 协议')
      }

      // 检查 localStorage 中的敏感信息
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key!)
        
        if (value && (value.includes('password') || value.includes('token'))) {
          issues.push(`localStorage 中可能包含敏感信息: ${key}`)
        }
      }

      // 检查全局变量泄露
      const globalVars = Object.keys(window).filter(key => 
        !['document', 'window', 'navigator', 'location', 'history', 'console'].includes(key) &&
        typeof (window as any)[key] === 'object'
      )

      if (globalVars.length > 10) {
        issues.push('检测到过多的全局变量，可能存在信息泄露风险')
      }

      resolve({
        passed: issues.length === 0,
        issues
      })
    })
  }
}

// 全局安全管理器实例
export const securityManager = new SecurityManager()
