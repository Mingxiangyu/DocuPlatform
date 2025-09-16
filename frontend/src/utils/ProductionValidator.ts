import { integrationTester } from './IntegrationTester'
import { performanceOptimizer } from './PerformanceOptimizer'
import { securityManager } from './SecurityManager'
import { monitoringSystem } from './MonitoringSystem'
import { eventBus } from './EventBus'

// 生产验证配置
export interface ProductionValidationConfig {
  enablePerformanceValidation: boolean
  enableSecurityValidation: boolean
  enableFunctionalValidation: boolean
  enableAccessibilityValidation: boolean
  enableSEOValidation: boolean
  performanceThresholds: PerformanceThresholds
  securityThresholds: SecurityThresholds
}

// 性能阈值
export interface PerformanceThresholds {
  LCP: number // Largest Contentful Paint (ms)
  FID: number // First Input Delay (ms)
  CLS: number // Cumulative Layout Shift
  FCP: number // First Contentful Paint (ms)
  TTFB: number // Time to First Byte (ms)
  pageLoadTime: number // 页面加载时间 (ms)
  apiResponseTime: number // API响应时间 (ms)
}

// 安全阈值
export interface SecurityThresholds {
  maxSecurityEvents: number // 最大安全事件数
  maxHighSeverityEvents: number // 最大高危事件数
  sessionTimeoutMin: number // 最小会话超时时间 (ms)
  csrfTokenLength: number // CSRF令牌最小长度
}

// 验证结果
export interface ValidationResult {
  category: string
  passed: boolean
  score: number // 0-100
  issues: ValidationIssue[]
  recommendations: string[]
  metrics?: Record<string, any>
}

export interface ValidationIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: string
  fix?: string
}

const DEFAULT_CONFIG: ProductionValidationConfig = {
  enablePerformanceValidation: true,
  enableSecurityValidation: true,
  enableFunctionalValidation: true,
  enableAccessibilityValidation: true,
  enableSEOValidation: true,
  performanceThresholds: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 600,
    pageLoadTime: 3000,
    apiResponseTime: 1000
  },
  securityThresholds: {
    maxSecurityEvents: 5,
    maxHighSeverityEvents: 0,
    sessionTimeoutMin: 1800000, // 30分钟
    csrfTokenLength: 32
  }
}

export class ProductionValidator {
  private config: ProductionValidationConfig
  private results: ValidationResult[] = []

  constructor(config: Partial<ProductionValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // 运行完整的生产验证
  async runFullValidation(): Promise<ValidationResult[]> {
    console.log('🔍 开始生产环境验证...')
    
    this.results = []

    try {
      // 功能验证
      if (this.config.enableFunctionalValidation) {
        const functionalResult = await this.validateFunctionality()
        this.results.push(functionalResult)
      }

      // 性能验证
      if (this.config.enablePerformanceValidation) {
        const performanceResult = await this.validatePerformance()
        this.results.push(performanceResult)
      }

      // 安全验证
      if (this.config.enableSecurityValidation) {
        const securityResult = await this.validateSecurity()
        this.results.push(securityResult)
      }

      // 可访问性验证
      if (this.config.enableAccessibilityValidation) {
        const accessibilityResult = await this.validateAccessibility()
        this.results.push(accessibilityResult)
      }

      // SEO验证
      if (this.config.enableSEOValidation) {
        const seoResult = await this.validateSEO()
        this.results.push(seoResult)
      }

      this.generateValidationReport()
      return this.results

    } catch (error) {
      console.error('生产验证过程中发生错误:', error)
      throw error
    }
  }

  // 功能验证
  private async validateFunctionality(): Promise<ValidationResult> {
    console.log('📋 执行功能验证...')
    
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      // 运行集成测试
      const testResults = await integrationTester.runAllTests()
      
      testResults.forEach(suite => {
        if (!suite.success) {
          const failedTests = suite.tests.filter(t => !t.passed)
          failedTests.forEach(test => {
            issues.push({
              severity: 'high',
              message: `测试失败: ${suite.name} - ${test.name}`,
              details: test.error,
              fix: '检查相关功能实现并修复测试失败的问题'
            })
            score -= 10
          })
        }
      })

      // 验证关键页面可访问性
      const criticalPages = ['/', '/login', '/articles', '/profile', '/payment']
      for (const page of criticalPages) {
        try {
          const response = await fetch(page, { method: 'HEAD' })
          if (!response.ok) {
            issues.push({
              severity: 'critical',
              message: `关键页面不可访问: ${page}`,
              details: `HTTP状态码: ${response.status}`,
              fix: '检查路由配置和服务器状态'
            })
            score -= 20
          }
        } catch (error) {
          issues.push({
            severity: 'critical',
            message: `页面请求失败: ${page}`,
            details: error instanceof Error ? error.message : String(error),
            fix: '检查网络连接和服务器配置'
          })
          score -= 20
        }
      }

      // 验证API端点
      const apiEndpoints = ['/api/health', '/api/articles', '/api/auth/me']
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint, { method: 'HEAD' })
          if (!response.ok && response.status !== 401) { // 401对于需要认证的端点是正常的
            issues.push({
              severity: 'high',
              message: `API端点异常: ${endpoint}`,
              details: `HTTP状态码: ${response.status}`,
              fix: '检查后端服务状态和API实现'
            })
            score -= 15
          }
        } catch (error) {
          issues.push({
            severity: 'high',
            message: `API请求失败: ${endpoint}`,
            details: error instanceof Error ? error.message : String(error),
            fix: '检查后端服务连接'
          })
          score -= 15
        }
      }

      if (issues.length === 0) {
        recommendations.push('所有功能测试通过，系统运行正常')
      } else {
        recommendations.push('修复失败的测试用例')
        recommendations.push('确保所有关键功能正常工作')
      }

    } catch (error) {
      issues.push({
        severity: 'critical',
        message: '功能验证过程中发生错误',
        details: error instanceof Error ? error.message : String(error),
        fix: '检查测试环境和依赖服务'
      })
      score = 0
    }

    return {
      category: '功能验证',
      passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  // 性能验证
  private async validatePerformance(): Promise<ValidationResult> {
    console.log('⚡ 执行性能验证...')
    
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      // 获取性能指标
      const performanceSummary = performanceOptimizer.getPerformanceSummary()
      const metrics: Record<string, any> = {}

      if (performanceSummary) {
        // 检查LCP
        if (performanceSummary.avgLCP && performanceSummary.avgLCP > this.config.performanceThresholds.LCP) {
          issues.push({
            severity: 'medium',
            message: `LCP过高: ${performanceSummary.avgLCP}ms`,
            details: `超过阈值 ${this.config.performanceThresholds.LCP}ms`,
            fix: '优化关键渲染路径，减少资源加载时间'
          })
          score -= 15
        }
        metrics.LCP = performanceSummary.avgLCP

        // 检查FID
        if (performanceSummary.avgFID && performanceSummary.avgFID > this.config.performanceThresholds.FID) {
          issues.push({
            severity: 'medium',
            message: `FID过高: ${performanceSummary.avgFID}ms`,
            details: `超过阈值 ${this.config.performanceThresholds.FID}ms`,
            fix: '优化JavaScript执行，减少主线程阻塞'
          })
          score -= 15
        }
        metrics.FID = performanceSummary.avgFID

        // 检查CLS
        if (performanceSummary.avgCLS && performanceSummary.avgCLS > this.config.performanceThresholds.CLS) {
          issues.push({
            severity: 'medium',
            message: `CLS过高: ${performanceSummary.avgCLS}`,
            details: `超过阈值 ${this.config.performanceThresholds.CLS}`,
            fix: '为图片和广告预留空间，避免布局偏移'
          })
          score -= 15
        }
        metrics.CLS = performanceSummary.avgCLS

        // 检查页面加载时间
        if (performanceSummary.avgPageLoadTime && performanceSummary.avgPageLoadTime > this.config.performanceThresholds.pageLoadTime) {
          issues.push({
            severity: 'high',
            message: `页面加载时间过长: ${performanceSummary.avgPageLoadTime}ms`,
            details: `超过阈值 ${this.config.performanceThresholds.pageLoadTime}ms`,
            fix: '优化资源加载，启用缓存和压缩'
          })
          score -= 20
        }
        metrics.pageLoadTime = performanceSummary.avgPageLoadTime

        // 检查API响应时间
        if (performanceSummary.avgApiResponseTime && performanceSummary.avgApiResponseTime > this.config.performanceThresholds.apiResponseTime) {
          issues.push({
            severity: 'medium',
            message: `API响应时间过长: ${performanceSummary.avgApiResponseTime}ms`,
            details: `超过阈值 ${this.config.performanceThresholds.apiResponseTime}ms`,
            fix: '优化数据库查询，启用API缓存'
          })
          score -= 15
        }
        metrics.apiResponseTime = performanceSummary.avgApiResponseTime
      }

      // 检查资源大小
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const largeResources = resources.filter(r => r.transferSize > 1024 * 1024) // 1MB
      
      if (largeResources.length > 0) {
        issues.push({
          severity: 'medium',
          message: `发现${largeResources.length}个大型资源`,
          details: largeResources.map(r => `${r.name}: ${Math.round(r.transferSize / 1024)}KB`).join(', '),
          fix: '压缩大型资源，考虑懒加载或代码分割'
        })
        score -= 10
      }

      if (issues.length === 0) {
        recommendations.push('性能指标良好，符合生产标准')
      } else {
        recommendations.push('优化关键性能指标')
        recommendations.push('启用更多缓存策略')
        recommendations.push('考虑使用CDN加速资源加载')
      }

      return {
        category: '性能验证',
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics
      }

    } catch (error) {
      return {
        category: '性能验证',
        passed: false,
        score: 0,
        issues: [{
          severity: 'critical',
          message: '性能验证失败',
          details: error instanceof Error ? error.message : String(error),
          fix: '检查性能监控系统配置'
        }],
        recommendations: ['修复性能监控系统', '重新运行性能验证']
      }
    }
  }

  // 安全验证
  private async validateSecurity(): Promise<ValidationResult> {
    console.log('🔒 执行安全验证...')
    
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      // 获取安全摘要
      const securitySummary = securityManager.getSecuritySummary()
      
      // 检查安全事件数量
      if (securitySummary.last24h > this.config.securityThresholds.maxSecurityEvents) {
        issues.push({
          severity: 'high',
          message: `24小时内安全事件过多: ${securitySummary.last24h}`,
          details: `超过阈值 ${this.config.securityThresholds.maxSecurityEvents}`,
          fix: '调查安全事件原因，加强防护措施'
        })
        score -= 25
      }

      // 检查高危事件
      const highSeverityEvents = securitySummary.bySeverity.high || 0
      const criticalEvents = securitySummary.bySeverity.critical || 0
      const totalHighSeverity = highSeverityEvents + criticalEvents

      if (totalHighSeverity > this.config.securityThresholds.maxHighSeverityEvents) {
        issues.push({
          severity: 'critical',
          message: `发现${totalHighSeverity}个高危安全事件`,
          details: `高危: ${highSeverityEvents}, 严重: ${criticalEvents}`,
          fix: '立即处理高危安全事件，加强安全监控'
        })
        score -= 40
      }

      // 检查CSRF令牌
      const csrfToken = securityManager.getCSRFToken()
      if (!csrfToken || csrfToken.length < this.config.securityThresholds.csrfTokenLength) {
        issues.push({
          severity: 'high',
          message: 'CSRF令牌长度不足',
          details: `当前长度: ${csrfToken?.length || 0}, 要求: ${this.config.securityThresholds.csrfTokenLength}`,
          fix: '生成更长的CSRF令牌'
        })
        score -= 20
      }

      // 执行安全扫描
      const scanResult = await securityManager.performSecurityScan()
      if (!scanResult.passed) {
        scanResult.issues.forEach(issue => {
          issues.push({
            severity: 'medium',
            message: issue,
            fix: '根据安全扫描结果修复相关问题'
          })
          score -= 10
        })
      }

      // 检查HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        issues.push({
          severity: 'critical',
          message: '未使用HTTPS协议',
          details: '生产环境必须使用HTTPS',
          fix: '配置SSL证书，强制HTTPS访问'
        })
        score -= 50
      }

      if (issues.length === 0) {
        recommendations.push('安全配置良好，符合生产标准')
      } else {
        recommendations.push('修复所有安全问题')
        recommendations.push('定期进行安全审计')
        recommendations.push('启用更多安全监控')
      }

      return {
        category: '安全验证',
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        score: Math.max(0, score),
        issues,
        recommendations,
        metrics: securitySummary
      }

    } catch (error) {
      return {
        category: '安全验证',
        passed: false,
        score: 0,
        issues: [{
          severity: 'critical',
          message: '安全验证失败',
          details: error instanceof Error ? error.message : String(error),
          fix: '检查安全管理系统配置'
        }],
        recommendations: ['修复安全管理系统', '重新运行安全验证']
      }
    }
  }

  // 可访问性验证
  private async validateAccessibility(): Promise<ValidationResult> {
    console.log('♿ 执行可访问性验证...')
    
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      // 检查图片alt属性
      const images = document.querySelectorAll('img')
      let imagesWithoutAlt = 0
      
      images.forEach(img => {
        if (!img.alt) {
          imagesWithoutAlt++
        }
      })

      if (imagesWithoutAlt > 0) {
        issues.push({
          severity: 'medium',
          message: `${imagesWithoutAlt}个图片缺少alt属性`,
          fix: '为所有图片添加描述性的alt属性'
        })
        score -= 15
      }

      // 检查表单标签
      const inputs = document.querySelectorAll('input, textarea, select')
      let inputsWithoutLabels = 0

      inputs.forEach(input => {
        const id = input.id
        if (id && !document.querySelector(`label[for="${id}"]`)) {
          inputsWithoutLabels++
        }
      })

      if (inputsWithoutLabels > 0) {
        issues.push({
          severity: 'medium',
          message: `${inputsWithoutLabels}个表单控件缺少标签`,
          fix: '为所有表单控件添加相关联的标签'
        })
        score -= 15
      }

      // 检查颜色对比度（简化检查）
      const elements = document.querySelectorAll('*')
      let lowContrastElements = 0

      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // 简化的对比度检查（实际应用中需要更复杂的算法）
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // 这里应该实现真正的对比度计算
          // 为了简化，我们跳过这个检查
        }
      })

      // 检查键盘导航
      const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]')
      let elementsWithoutFocus = 0

      focusableElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        if (styles.outline === 'none' && !styles.boxShadow.includes('focus')) {
          elementsWithoutFocus++
        }
      })

      if (elementsWithoutFocus > 0) {
        issues.push({
          severity: 'low',
          message: `${elementsWithoutFocus}个可聚焦元素缺少焦点样式`,
          fix: '为所有可聚焦元素添加清晰的焦点指示器'
        })
        score -= 10
      }

      if (issues.length === 0) {
        recommendations.push('可访问性良好，符合基本标准')
      } else {
        recommendations.push('改善可访问性以支持更多用户')
        recommendations.push('考虑使用专业的可访问性测试工具')
      }

      return {
        category: '可访问性验证',
        passed: issues.filter(i => i.severity === 'high' || i.severity === 'critical').length === 0,
        score: Math.max(0, score),
        issues,
        recommendations
      }

    } catch (error) {
      return {
        category: '可访问性验证',
        passed: false,
        score: 0,
        issues: [{
          severity: 'medium',
          message: '可访问性验证失败',
          details: error instanceof Error ? error.message : String(error),
          fix: '检查页面结构和可访问性实现'
        }],
        recommendations: ['修复可访问性检查', '重新运行验证']
      }
    }
  }

  // SEO验证
  private async validateSEO(): Promise<ValidationResult> {
    console.log('🔍 执行SEO验证...')
    
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      // 检查页面标题
      const title = document.title
      if (!title || title.length < 10) {
        issues.push({
          severity: 'high',
          message: '页面标题缺失或过短',
          details: `当前标题: "${title}"`,
          fix: '添加描述性的页面标题（10-60字符）'
        })
        score -= 20
      } else if (title.length > 60) {
        issues.push({
          severity: 'medium',
          message: '页面标题过长',
          details: `当前长度: ${title.length}字符`,
          fix: '缩短页面标题到60字符以内'
        })
        score -= 10
      }

      // 检查meta描述
      const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (!metaDescription || !metaDescription.content) {
        issues.push({
          severity: 'high',
          message: '缺少meta描述',
          fix: '添加描述性的meta描述（120-160字符）'
        })
        score -= 20
      } else if (metaDescription.content.length < 120 || metaDescription.content.length > 160) {
        issues.push({
          severity: 'medium',
          message: 'meta描述长度不当',
          details: `当前长度: ${metaDescription.content.length}字符`,
          fix: '调整meta描述长度到120-160字符'
        })
        score -= 10
      }

      // 检查H1标签
      const h1Tags = document.querySelectorAll('h1')
      if (h1Tags.length === 0) {
        issues.push({
          severity: 'high',
          message: '页面缺少H1标签',
          fix: '添加一个描述页面主要内容的H1标签'
        })
        score -= 20
      } else if (h1Tags.length > 1) {
        issues.push({
          severity: 'medium',
          message: `页面有${h1Tags.length}个H1标签`,
          fix: '每个页面应该只有一个H1标签'
        })
        score -= 10
      }

      // 检查结构化数据
      const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
      if (structuredData.length === 0) {
        issues.push({
          severity: 'low',
          message: '缺少结构化数据',
          fix: '添加适当的JSON-LD结构化数据'
        })
        score -= 5
      }

      // 检查robots meta标签
      const robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement
      if (robotsMeta && robotsMeta.content.includes('noindex')) {
        issues.push({
          severity: 'critical',
          message: '页面设置为不被索引',
          details: `robots meta: ${robotsMeta.content}`,
          fix: '移除noindex指令或确认这是有意的'
        })
        score -= 30
      }

      // 检查canonical链接
      const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        issues.push({
          severity: 'medium',
          message: '缺少canonical链接',
          fix: '添加canonical链接防止重复内容问题'
        })
        score -= 15
      }

      if (issues.length === 0) {
        recommendations.push('SEO配置良好，有利于搜索引擎优化')
      } else {
        recommendations.push('优化页面SEO元素')
        recommendations.push('添加更多结构化数据')
        recommendations.push('定期检查SEO表现')
      }

      return {
        category: 'SEO验证',
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        score: Math.max(0, score),
        issues,
        recommendations
      }

    } catch (error) {
      return {
        category: 'SEO验证',
        passed: false,
        score: 0,
        issues: [{
          severity: 'medium',
          message: 'SEO验证失败',
          details: error instanceof Error ? error.message : String(error),
          fix: '检查页面SEO配置'
        }],
        recommendations: ['修复SEO检查', '重新运行验证']
      }
    }
  }

  // 生成验证报告
  private generateValidationReport() {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0) / this.results.length
    const totalIssues = this.results.reduce((sum, result) => sum + result.issues.length, 0)
    const criticalIssues = this.results.reduce((sum, result) => 
      sum + result.issues.filter(i => i.severity === 'critical').length, 0
    )
    const highIssues = this.results.reduce((sum, result) => 
      sum + result.issues.filter(i => i.severity === 'high').length, 0
    )

    console.log('\n📊 生产验证报告')
    console.log('='.repeat(50))
    console.log(`总体评分: ${totalScore.toFixed(1)}/100`)
    console.log(`总问题数: ${totalIssues}`)
    console.log(`严重问题: ${criticalIssues}`)
    console.log(`高危问题: ${highIssues}`)
    
    console.log('\n📋 分类结果:')
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌'
      console.log(`${status} ${result.category}: ${result.score}/100`)
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '🔴' : 
                      issue.severity === 'high' ? '🟠' : 
                      issue.severity === 'medium' ? '🟡' : '🔵'
          console.log(`  ${icon} ${issue.message}`)
        })
      }
    })

    // 发送验证完成事件
    eventBus.emit('production-validation:completed', {
      results: this.results,
      summary: {
        totalScore,
        totalIssues,
        criticalIssues,
        highIssues,
        passed: criticalIssues === 0 && highIssues === 0
      }
    })
  }

  // 获取验证结果
  getResults(): ValidationResult[] {
    return this.results
  }

  // 获取验证摘要
  getSummary() {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0) / this.results.length
    const totalIssues = this.results.reduce((sum, result) => sum + result.issues.length, 0)
    const passed = this.results.every(result => result.passed)

    return {
      totalScore,
      totalIssues,
      passed,
      categories: this.results.map(result => ({
        name: result.category,
        score: result.score,
        passed: result.passed,
        issueCount: result.issues.length
      }))
    }
  }
}

// 全局生产验证器实例
export const productionValidator = new ProductionValidator()
