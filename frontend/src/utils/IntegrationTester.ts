import { eventBus } from './EventBus'
import { dataSyncManager } from './DataSyncManager'
import { permissionManager } from './PermissionManager'

// 测试结果类型
export interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

// 测试套件结果
export interface TestSuiteResult {
  name: string
  tests: TestResult[]
  passed: number
  failed: number
  duration: number
  success: boolean
}

// 集成测试配置
export interface IntegrationTestConfig {
  timeout: number
  retries: number
  parallel: boolean
  verbose: boolean
}

const DEFAULT_CONFIG: IntegrationTestConfig = {
  timeout: 10000,
  retries: 2,
  parallel: false,
  verbose: true
}

export class IntegrationTester {
  private config: IntegrationTestConfig
  private results: TestSuiteResult[] = []

  constructor(config: Partial<IntegrationTestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // 运行所有集成测试
  async runAllTests(): Promise<TestSuiteResult[]> {
    console.log('🧪 开始运行集成测试...')
    
    const testSuites = [
      { name: '事件系统测试', tests: this.getEventSystemTests() },
      { name: '状态管理测试', tests: this.getStateManagementTests() },
      { name: '虚拟DOM高亮测试', tests: this.getVirtualDOMTests() },
      { name: '权限系统测试', tests: this.getPermissionTests() },
      { name: '数据同步测试', tests: this.getDataSyncTests() },
      { name: '响应式系统测试', tests: this.getResponsiveTests() },
      { name: '用户流程测试', tests: this.getUserFlowTests() }
    ]

    this.results = []

    for (const suite of testSuites) {
      const result = await this.runTestSuite(suite.name, suite.tests)
      this.results.push(result)
    }

    this.generateReport()
    return this.results
  }

  // 运行测试套件
  private async runTestSuite(
    suiteName: string, 
    tests: (() => Promise<TestResult>)[]
  ): Promise<TestSuiteResult> {
    console.log(`📋 运行测试套件: ${suiteName}`)
    
    const startTime = Date.now()
    const results: TestResult[] = []

    if (this.config.parallel) {
      // 并行执行测试
      const promises = tests.map(test => this.runSingleTest(test))
      const testResults = await Promise.allSettled(promises)
      
      testResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            name: `Test ${index + 1}`,
            passed: false,
            duration: 0,
            error: result.reason?.message || 'Unknown error'
          })
        }
      })
    } else {
      // 串行执行测试
      for (const test of tests) {
        const result = await this.runSingleTest(test)
        results.push(result)
      }
    }

    const duration = Date.now() - startTime
    const passed = results.filter(r => r.passed).length
    const failed = results.length - passed

    const suiteResult: TestSuiteResult = {
      name: suiteName,
      tests: results,
      passed,
      failed,
      duration,
      success: failed === 0
    }

    console.log(`${suiteResult.success ? '✅' : '❌'} ${suiteName}: ${passed}/${results.length} 通过`)
    
    return suiteResult
  }

  // 运行单个测试
  private async runSingleTest(testFn: () => Promise<TestResult>): Promise<TestResult> {
    let retries = this.config.retries
    
    while (retries >= 0) {
      try {
        const result = await Promise.race([
          testFn(),
          new Promise<TestResult>((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), this.config.timeout)
          )
        ])
        
        if (this.config.verbose) {
          console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`)
          if (!result.passed && result.error) {
            console.log(`    错误: ${result.error}`)
          }
        }
        
        return result
      } catch (error) {
        if (retries === 0) {
          return {
            name: 'Unknown Test',
            passed: false,
            duration: 0,
            error: error instanceof Error ? error.message : String(error)
          }
        }
        retries--
      }
    }

    throw new Error('Test failed after all retries')
  }

  // 事件系统测试
  private getEventSystemTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        let eventReceived = false
        
        const unsubscribe = eventBus.on('test:event', () => {
          eventReceived = true
        })
        
        eventBus.emit('test:event', {})
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        unsubscribe()
        
        return {
          name: '事件发送和接收',
          passed: eventReceived,
          duration: Date.now() - startTime,
          error: eventReceived ? undefined : '事件未被接收'
        }
      },

      async () => {
        const startTime = Date.now()
        let callCount = 0
        
        const unsubscribe = eventBus.on('test:multiple', () => {
          callCount++
        })
        
        eventBus.emit('test:multiple', {})
        eventBus.emit('test:multiple', {})
        eventBus.emit('test:multiple', {})
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        unsubscribe()
        
        return {
          name: '多次事件触发',
          passed: callCount === 3,
          duration: Date.now() - startTime,
          error: callCount !== 3 ? `期望3次调用，实际${callCount}次` : undefined
        }
      }
    ]
  }

  // 状态管理测试
  private getStateManagementTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          // 测试 Pinia stores 是否正常工作
          const { useAuthStore } = await import('../stores/auth')
          const { useArticlesStore } = await import('../stores/articles')
          const { useNotesStore } = await import('../stores/notes')
          const { useHighlightsStore } = await import('../stores/highlights')
          
          const authStore = useAuthStore()
          const articlesStore = useArticlesStore()
          const notesStore = useNotesStore()
          const highlightsStore = useHighlightsStore()
          
          // 检查 stores 是否正确初始化
          const storesInitialized = !!(
            authStore && 
            articlesStore && 
            notesStore && 
            highlightsStore
          )
          
          return {
            name: 'Pinia stores 初始化',
            passed: storesInitialized,
            duration: Date.now() - startTime,
            error: storesInitialized ? undefined : '某些 store 未正确初始化'
          }
        } catch (error) {
          return {
            name: 'Pinia stores 初始化',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 虚拟DOM高亮测试
  private getVirtualDOMTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          const { VirtualDOMManager } = await import('./VirtualDOMManager')
          const { HighlightManager } = await import('./HighlightManager')
          const { TextSelector } = await import('./TextSelector')
          
          const virtualDOMManager = new VirtualDOMManager()
          const textSelector = new TextSelector(virtualDOMManager)
          const highlightManager = new HighlightManager(virtualDOMManager, textSelector)
          
          // 测试虚拟DOM解析
          const testContent = '<p>这是一段测试文本</p>'
          const nodes = virtualDOMManager.parseContent(testContent)
          
          const success = nodes.length > 0
          
          return {
            name: '虚拟DOM解析',
            passed: success,
            duration: Date.now() - startTime,
            error: success ? undefined : '虚拟DOM解析失败'
          }
        } catch (error) {
          return {
            name: '虚拟DOM解析',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 权限系统测试
  private getPermissionTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          // 测试权限管理器
          const hasPermission = permissionManager.hasPermission('article:read')
          const isAdmin = permissionManager.isAdmin()
          
          return {
            name: '权限检查功能',
            passed: typeof hasPermission === 'boolean' && typeof isAdmin === 'boolean',
            duration: Date.now() - startTime
          }
        } catch (error) {
          return {
            name: '权限检查功能',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 数据同步测试
  private getDataSyncTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          const status = dataSyncManager.getStatus()
          const hasStatus = !!(status && typeof status.isOnline === 'boolean')
          
          return {
            name: '数据同步状态',
            passed: hasStatus,
            duration: Date.now() - startTime,
            error: hasStatus ? undefined : '数据同步状态获取失败'
          }
        } catch (error) {
          return {
            name: '数据同步状态',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 响应式系统测试
  private getResponsiveTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          const { useResponsive } = await import('../composables/useResponsive')
          const responsive = useResponsive()
          
          const hasWidth = typeof responsive.width.value === 'number'
          const hasBreakpoint = typeof responsive.breakpoint.value === 'string'
          
          return {
            name: '响应式系统',
            passed: hasWidth && hasBreakpoint,
            duration: Date.now() - startTime,
            error: hasWidth && hasBreakpoint ? undefined : '响应式系统初始化失败'
          }
        } catch (error) {
          return {
            name: '响应式系统',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 用户流程测试
  private getUserFlowTests(): (() => Promise<TestResult>)[] {
    return [
      async () => {
        const startTime = Date.now()
        
        try {
          // 模拟用户登录流程
          const { useAuthStore } = await import('../stores/auth')
          const authStore = useAuthStore()
          
          // 测试登录功能
          const loginResult = await authStore.login({
            email: 'demo@docuvault.com',
            password: 'demo123'
          })
          
          return {
            name: '用户登录流程',
            passed: loginResult.success,
            duration: Date.now() - startTime,
            error: loginResult.success ? undefined : loginResult.error
          }
        } catch (error) {
          return {
            name: '用户登录流程',
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    ]
  }

  // 生成测试报告
  private generateReport() {
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0)
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0)
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.duration, 0)
    const overallSuccess = totalFailed === 0

    console.log('\n📊 集成测试报告')
    console.log('='.repeat(50))
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过: ${totalPassed}`)
    console.log(`失败: ${totalFailed}`)
    console.log(`总耗时: ${totalDuration}ms`)
    console.log(`成功率: ${((totalPassed / totalTests) * 100).toFixed(1)}%`)
    console.log(`整体状态: ${overallSuccess ? '✅ 通过' : '❌ 失败'}`)
    
    console.log('\n📋 详细结果:')
    this.results.forEach(suite => {
      console.log(`\n${suite.success ? '✅' : '❌'} ${suite.name}`)
      console.log(`  通过: ${suite.passed}/${suite.tests.length} (${suite.duration}ms)`)
      
      if (!suite.success) {
        suite.tests.filter(t => !t.passed).forEach(test => {
          console.log(`    ❌ ${test.name}: ${test.error}`)
        })
      }
    })

    // 发送测试完成事件
    eventBus.emit('integration-test:completed', {
      results: this.results,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalDuration,
        overallSuccess
      }
    })
  }

  // 获取测试结果
  getResults(): TestSuiteResult[] {
    return this.results
  }
}

// 全局集成测试实例
export const integrationTester = new IntegrationTester()
