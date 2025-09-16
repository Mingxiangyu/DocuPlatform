/**
 * 性能监控系统单元测试
 * 测试性能监控器、优化工具和配置管理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  PerformanceMonitor,
  performanceUtils,
  performanceConfig,
  withPerformanceTracking
} from '../../performance'

describe('性能监控系统测试', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    vi.clearAllMocks()
    monitor = new PerformanceMonitor({ enabled: true })
  })

  afterEach(() => {
    monitor.destroy()
  })

  describe('PerformanceMonitor', () => {
    it('应该正确记录性能指标', () => {
      const metric = {
        componentName: 'TestComponent',
        renderTime: 15.5,
        updateTime: 5.2,
        memoryUsage: 1024 * 1024,
        timestamp: Date.now()
      }

      monitor.recordMetric('TestComponent', metric)
      
      const stats = monitor.getComponentStats('TestComponent')
      expect(stats).toBeTruthy()
      expect(stats!.componentName).toBe('TestComponent')
      expect(stats!.totalRenders).toBe(1)
      expect(stats!.averageRenderTime).toBe(15.5)
    })

    it('应该限制指标记录数量', () => {
      // 记录超过100条指标
      for (let i = 0; i < 150; i++) {
        monitor.recordMetric('TestComponent', {
          componentName: 'TestComponent',
          renderTime: i,
          updateTime: 0,
          memoryUsage: 0,
          timestamp: Date.now()
        })
      }

      const stats = monitor.getComponentStats('TestComponent')
      expect(stats!.totalRenders).toBe(100) // 应该限制在100条
    })

    it('应该生成性能报告', () => {
      // 记录多个组件的指标
      monitor.recordMetric('Component1', {
        componentName: 'Component1',
        renderTime: 10,
        updateTime: 5,
        memoryUsage: 1024,
        timestamp: Date.now()
      })

      monitor.recordMetric('Component2', {
        componentName: 'Component2',
        renderTime: 20,
        updateTime: 8,
        memoryUsage: 2048,
        timestamp: Date.now()
      })

      const report = monitor.getPerformanceReport()
      
      expect(report.summary.totalComponents).toBe(2)
      expect(report.components.Component1).toBeTruthy()
      expect(report.components.Component2).toBeTruthy()
      expect(report.summary.averageRenderTime).toBe(15) // (10 + 20) / 2
    })

    it('应该清除指标数据', () => {
      monitor.recordMetric('TestComponent', {
        componentName: 'TestComponent',
        renderTime: 10,
        updateTime: 0,
        memoryUsage: 0,
        timestamp: Date.now()
      })

      expect(monitor.getComponentStats('TestComponent')).toBeTruthy()
      
      monitor.clearMetrics('TestComponent')
      expect(monitor.getComponentStats('TestComponent')).toBe(null)
    })

    it('应该在禁用时不记录指标', () => {
      const disabledMonitor = new PerformanceMonitor({ enabled: false })
      
      disabledMonitor.recordMetric('TestComponent', {
        componentName: 'TestComponent',
        renderTime: 10,
        updateTime: 0,
        memoryUsage: 0,
        timestamp: Date.now()
      })

      expect(disabledMonitor.getComponentStats('TestComponent')).toBe(null)
      disabledMonitor.destroy()
    })
  })

  describe('withPerformanceTracking 装饰器', () => {
    it('应该跟踪同步方法性能', () => {
      const recordMetricSpy = vi.spyOn(monitor, 'recordMetric')
      
      class TestClass {
        @withPerformanceTracking('TestMethod')
        testMethod() {
          // 模拟一些工作
          let sum = 0
          for (let i = 0; i < 1000; i++) {
            sum += i
          }
          return sum
        }
      }

      const instance = new TestClass()
      const result = instance.testMethod()
      
      expect(result).toBe(499500) // 验证方法正常执行
      expect(recordMetricSpy).toHaveBeenCalledWith(
        'TestMethod',
        expect.objectContaining({
          componentName: 'TestMethod',
          renderTime: expect.any(Number)
        })
      )
    })

    it('应该跟踪异步方法性能', async () => {
      const recordMetricSpy = vi.spyOn(monitor, 'recordMetric')
      
      class TestClass {
        @withPerformanceTracking('AsyncMethod')
        async asyncMethod() {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'done'
        }
      }

      const instance = new TestClass()
      const result = await instance.asyncMethod()
      
      expect(result).toBe('done')
      expect(recordMetricSpy).toHaveBeenCalled()
    })

    it('应该在方法抛出错误时仍然记录性能', () => {
      const recordMetricSpy = vi.spyOn(monitor, 'recordMetric')
      
      class TestClass {
        @withPerformanceTracking('ErrorMethod')
        errorMethod() {
          throw new Error('Test error')
        }
      }

      const instance = new TestClass()
      
      expect(() => instance.errorMethod()).toThrow('Test error')
      expect(recordMetricSpy).toHaveBeenCalled()
    })
  })

  describe('performanceUtils', () => {
    it('defer 应该延迟执行函数', (done) => {
      let executed = false
      
      performanceUtils.defer(() => {
        executed = true
        expect(executed).toBe(true)
        done()
      })
      
      expect(executed).toBe(false)
    })

    it('batchUpdate 应该批量执行更新', (done) => {
      const updates: string[] = []
      const updateFunctions = [
        () => updates.push('update1'),
        () => updates.push('update2'),
        () => updates.push('update3')
      ]

      performanceUtils.batchUpdate(updateFunctions)
      
      // 使用 setTimeout 来检查批量更新是否完成
      setTimeout(() => {
        expect(updates).toEqual(['update1', 'update2', 'update3'])
        done()
      }, 20)
    })

    it('calculateVirtualScrollItems 应该正确计算虚拟滚动项', () => {
      const result = performanceUtils.calculateVirtualScrollItems(
        400, // 容器高度
        50,  // 项目高度
        100, // 滚动位置
        1000, // 总项目数
        3    // 预渲染数量
      )

      expect(result.startIndex).toBe(0) // max(0, floor(100/50) - 3) = max(0, -1) = 0
      expect(result.endIndex).toBe(13)  // min(999, 0 + ceil(400/50) + 3*2) = min(999, 14) = 14 - 1 = 13
      expect(result.visibleCount).toBe(8) // ceil(400/50) = 8
      expect(result.offsetY).toBe(0)     // 0 * 50 = 0
    })

    it('createLazyImageObserver 应该创建交叉观察器', () => {
      const callback = vi.fn()
      const observer = performanceUtils.createLazyImageObserver(callback)
      
      expect(observer).toBeInstanceOf(IntersectionObserver)
    })

    it('preloadResource 应该预加载资源', () => {
      const originalAppendChild = document.head.appendChild
      const appendChildSpy = vi.spyOn(document.head, 'appendChild')
      
      performanceUtils.preloadResource('/test.js', 'script')
      
      expect(appendChildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          rel: 'preload',
          href: '/test.js',
          as: 'script'
        })
      )
      
      document.head.appendChild = originalAppendChild
    })

    it('getDevicePerformance 应该返回设备性能信息', () => {
      const performance = performanceUtils.getDevicePerformance()
      
      expect(performance).toHaveProperty('networkType')
      expect(performance).toHaveProperty('hardwareConcurrency')
      expect(performance).toHaveProperty('performanceLevel')
      expect(['low', 'medium', 'high']).toContain(performance.performanceLevel)
    })

    it('assessPerformanceLevel 应该正确评估性能等级', () => {
      // 高性能设备
      const highPerf = performanceUtils.assessPerformanceLevel(
        { effectiveType: '4g' },
        { jsHeapSizeLimit: 4 * 1024 * 1024 * 1024 }, // 4GB
        8 // 8核
      )
      expect(highPerf).toBe('high')
      
      // 低性能设备
      const lowPerf = performanceUtils.assessPerformanceLevel(
        { effectiveType: '2g' },
        { jsHeapSizeLimit: 512 * 1024 * 1024 }, // 512MB
        2 // 2核
      )
      expect(lowPerf).toBe('low')
    })
  })

  describe('performanceConfig', () => {
    it('应该包含正确的配置值', () => {
      expect(performanceConfig.virtualScroll.itemHeight).toBe(50)
      expect(performanceConfig.virtualScroll.overscan).toBe(5)
      expect(performanceConfig.virtualScroll.threshold).toBe(100)
      
      expect(performanceConfig.debounce.search).toBe(300)
      expect(performanceConfig.debounce.resize).toBe(100)
      expect(performanceConfig.debounce.scroll).toBe(16)
      
      expect(performanceConfig.thresholds.renderTime).toBe(16)
      expect(performanceConfig.thresholds.updateTime).toBe(8)
    })
  })

  describe('性能阈值检查', () => {
    it('应该在超过阈值时发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // 记录超过阈值的渲染时间
      monitor.recordMetric('SlowComponent', {
        componentName: 'SlowComponent',
        renderTime: 50, // 超过16ms阈值
        updateTime: 0,
        memoryUsage: 0,
        timestamp: Date.now()
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] SlowComponent 渲染时间过长')
      )
      
      consoleSpy.mockRestore()
    })

    it('应该在内存使用过高时发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      monitor.recordMetric('MemoryHeavyComponent', {
        componentName: 'MemoryHeavyComponent',
        renderTime: 10,
        updateTime: 0,
        memoryUsage: 100 * 1024 * 1024, // 100MB，超过50MB阈值
        timestamp: Date.now()
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] MemoryHeavyComponent 内存使用过高')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('内存监控', () => {
    it('应该定期记录内存使用', () => {
      vi.useFakeTimers()
      
      const recordMetricSpy = vi.spyOn(monitor, 'recordMetric')
      
      // 创建新的监控器以触发内存监控
      const memoryMonitor = new PerformanceMonitor({ enabled: true })
      
      // 快进30秒
      vi.advanceTimersByTime(30000)
      
      expect(recordMetricSpy).toHaveBeenCalledWith(
        'system-memory',
        expect.objectContaining({
          componentName: 'system',
          memoryUsage: expect.any(Number)
        })
      )
      
      memoryMonitor.destroy()
      vi.useRealTimers()
    })
  })

  describe('监控器销毁', () => {
    it('应该正确清理资源', () => {
      const disconnectSpy = vi.fn()
      
      // 模拟 PerformanceObserver
      const mockObserver = {
        observe: vi.fn(),
        disconnect: disconnectSpy
      }
      
      // 手动添加观察器
      monitor['observers'].set('test', mockObserver as any)
      
      monitor.destroy()
      
      expect(disconnectSpy).toHaveBeenCalled()
      expect(monitor['enabled']).toBe(false)
    })
  })
})
