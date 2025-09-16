/**
 * 工具函数单元测试
 * 测试设计系统中的所有工具函数
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateId,
  formatFileSize,
  debounce,
  throttle,
  deepClone,
  merge,
  get,
  set,
  unset,
  unique,
  groupBy,
  sortBy,
  formatNumber,
  formatDate,
  formatRelativeTime,
  colorUtils,
  domUtils,
  validators
} from '../../utils'

describe('工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^ds-[a-zA-Z0-9]{8}$/)
    })

    it('应该支持自定义前缀和长度', () => {
      const id = generateId('test', 6)
      expect(id).toMatch(/^test-[a-zA-Z0-9]{6}$/)
    })
  })

  describe('formatFileSize', () => {
    it('应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('应该支持自定义小数位数', () => {
      expect(formatFileSize(1536, 1)).toBe('1.5 KB')
      expect(formatFileSize(1536, 0)).toBe('2 KB')
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      expect(fn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持立即执行', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100, true)
      
      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)
      
      debouncedFn()
      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持取消和刷新', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn.cancel()
      
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
      
      debouncedFn()
      debouncedFn.flush()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)
      
      throttledFn()
      throttledFn()
      throttledFn()
      
      expect(fn).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该支持禁用前导和尾随执行', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100, { leading: false, trailing: false })
      
      throttledFn()
      expect(fn).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('deepClone', () => {
    it('应该深度克隆对象', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }]
        },
        f: new Date('2024-01-01'),
        g: /test/g
      }
      
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
      expect(cloned.b.d).not.toBe(original.b.d)
      expect(cloned.f).not.toBe(original.f)
      expect(cloned.g).not.toBe(original.g)
    })

    it('应该处理基本类型', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
      expect(deepClone(42)).toBe(42)
      expect(deepClone('string')).toBe('string')
      expect(deepClone(true)).toBe(true)
    })
  })

  describe('merge', () => {
    it('应该合并对象', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: { d: 3 }, e: 4 }
      
      const result = merge(target, source)
      
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      })
    })

    it('应该支持多个源对象', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }
      
      const result = merge(target, source1, source2)
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('get/set/unset', () => {
    const obj = {
      a: {
        b: {
          c: 'value'
        }
      },
      array: [1, 2, { nested: 'item' }]
    }

    it('get 应该获取嵌套值', () => {
      expect(get(obj, 'a.b.c')).toBe('value')
      expect(get(obj, 'a.b.d', 'default')).toBe('default')
      expect(get(obj, 'array.2.nested')).toBe('item')
    })

    it('set 应该设置嵌套值', () => {
      const testObj = { ...obj }
      set(testObj, 'a.b.d', 'new value')
      expect(testObj.a.b.d).toBe('new value')
      
      set(testObj, 'new.path', 'value')
      expect(testObj.new.path).toBe('value')
    })

    it('unset 应该删除嵌套值', () => {
      const testObj = deepClone(obj)
      unset(testObj, 'a.b.c')
      expect(testObj.a.b.c).toBeUndefined()
    })
  })

  describe('unique', () => {
    it('应该去除数组重复项', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('应该支持对象数组去重', () => {
      const array = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' }
      ]
      
      const result = unique(array, 'id')
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })
  })

  describe('groupBy', () => {
    it('应该按指定键分组', () => {
      const array = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ]
      
      const result = groupBy(array, 'category')
      
      expect(result.A).toHaveLength(2)
      expect(result.B).toHaveLength(1)
    })
  })

  describe('sortBy', () => {
    it('应该按指定键排序', () => {
      const array = [
        { name: 'c', value: 3 },
        { name: 'a', value: 1 },
        { name: 'b', value: 2 }
      ]
      
      const ascResult = sortBy(array, 'name', 'asc')
      expect(ascResult[0].name).toBe('a')
      expect(ascResult[2].name).toBe('c')
      
      const descResult = sortBy(array, 'value', 'desc')
      expect(descResult[0].value).toBe(3)
      expect(descResult[2].value).toBe(1)
    })
  })

  describe('formatNumber', () => {
    it('应该格式化数字', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
      expect(formatNumber(1234.56, { minimumFractionDigits: 2 })).toBe('1,234.56')
    })
  })

  describe('formatDate', () => {
    it('应该格式化日期', () => {
      const date = new Date('2024-01-15 10:30:45')
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date, 'HH:mm:ss')).toBe('10:30:45')
    })
  })

  describe('formatRelativeTime', () => {
    it('应该格式化相对时间', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1分钟前')
      expect(formatRelativeTime(oneHourAgo)).toBe('1小时前')
      expect(formatRelativeTime(oneDayAgo)).toBe('1天前')
    })
  })

  describe('colorUtils', () => {
    it('应该转换颜色格式', () => {
      const rgb = colorUtils.hexToRgb('#ff0000')
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 })
      
      const hex = colorUtils.rgbToHex(255, 0, 0)
      expect(hex).toBe('#ff0000')
    })

    it('应该计算颜色亮度', () => {
      const lightness = colorUtils.getLuminance('#ffffff')
      expect(lightness).toBe(255)
      
      const darkness = colorUtils.getLuminance('#000000')
      expect(darkness).toBe(0)
    })

    it('应该判断颜色深浅', () => {
      expect(colorUtils.isDark('#000000')).toBe(true)
      expect(colorUtils.isDark('#ffffff')).toBe(false)
    })
  })

  describe('domUtils', () => {
    beforeEach(() => {
      // 创建测试元素
      document.body.innerHTML = `
        <div id="test-element" style="width: 100px; height: 100px; color: red;">
          Test Element
        </div>
      `
    })

    it('应该获取元素边界矩形', () => {
      const element = document.getElementById('test-element')!
      const rect = domUtils.getBoundingRect(element)
      
      expect(rect).toHaveProperty('width')
      expect(rect).toHaveProperty('height')
      expect(rect).toHaveProperty('top')
      expect(rect).toHaveProperty('left')
    })

    it('应该获取元素样式', () => {
      const element = document.getElementById('test-element')!
      const color = domUtils.getStyle(element, 'color')
      
      expect(color).toBeTruthy()
    })

    it('应该滚动到元素', () => {
      const element = document.getElementById('test-element')!
      const scrollIntoViewSpy = vi.spyOn(element, 'scrollIntoView')
      
      domUtils.scrollToElement(element)
      expect(scrollIntoViewSpy).toHaveBeenCalled()
    })
  })

  describe('validators', () => {
    it('应该验证邮箱', () => {
      expect(validators.isEmail('test@example.com')).toBe(true)
      expect(validators.isEmail('invalid-email')).toBe(false)
      expect(validators.isEmail('test@')).toBe(false)
      expect(validators.isEmail('@example.com')).toBe(false)
    })

    it('应该验证手机号', () => {
      expect(validators.isPhone('13812345678')).toBe(true)
      expect(validators.isPhone('12345678901')).toBe(false)
      expect(validators.isPhone('1381234567')).toBe(false)
    })

    it('应该验证URL', () => {
      expect(validators.isUrl('https://example.com')).toBe(true)
      expect(validators.isUrl('http://example.com')).toBe(true)
      expect(validators.isUrl('ftp://example.com')).toBe(true)
      expect(validators.isUrl('invalid-url')).toBe(false)
      expect(validators.isUrl('example.com')).toBe(false)
    })

    it('应该验证身份证号', () => {
      expect(validators.isIdCard('123456789012345678')).toBe(true)
      expect(validators.isIdCard('12345678901234567X')).toBe(true)
      expect(validators.isIdCard('123456789012345')).toBe(true)
      expect(validators.isIdCard('12345')).toBe(false)
      expect(validators.isIdCard('abcdefghijklmnopqr')).toBe(false)
    })
  })
})
