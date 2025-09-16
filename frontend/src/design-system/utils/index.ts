/**
 * DocuVault 设计系统 - 工具函数
 * 提供常用的工具函数，提升开发效率和代码复用性
 */

import type { Debounced, Throttled } from '../types'

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @param length 长度
 * @returns 唯一ID字符串
 */
export function generateId(prefix = 'ds', length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix + '-'
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): Debounced<T> {
  let timeout: NodeJS.Timeout | null = null
  let result: any
  
  const debounced = function (this: any, ...args: Parameters<T>) {
    const context = this
    const later = () => {
      timeout = null
      if (!immediate) result = func.apply(context, args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) result = func.apply(context, args)
    
    return result
  } as Debounced<T>
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      result = func.apply(this, arguments as any)
      timeout = null
    }
  }
  
  return debounced
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @param options 选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): Throttled<T> {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  let result: any
  
  const { leading = true, trailing = true } = options
  
  const throttled = function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()
    
    if (!previous && !leading) previous = now
    
    const remaining = wait - (now - previous)
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now()
        timeout = null
        result = func.apply(context, args)
      }, remaining)
    }
    
    return result
  } as Throttled<T>
  
  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = 0
  }
  
  return throttled
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (obj instanceof RegExp) return new RegExp(obj) as T
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 合并对象
 * @param target 目标对象
 * @param sources 源对象
 * @returns 合并后的对象
 */
export function merge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return merge(target, ...sources)
}

/**
 * 判断是否为对象
 * @param item 要判断的项
 * @returns 是否为对象
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取嵌套对象的值
 * @param obj 对象
 * @param path 路径（用点分隔）
 * @param defaultValue 默认值
 * @returns 获取到的值
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

/**
 * 设置嵌套对象的值
 * @param obj 对象
 * @param path 路径（用点分隔）
 * @param value 值
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * 删除嵌套对象的值
 * @param obj 对象
 * @param path 路径（用点分隔）
 */
export function unset(obj: any, path: string): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      return
    }
    current = current[key]
  }
  
  delete current[lastKey]
}

/**
 * 数组去重
 * @param array 数组
 * @param key 去重的键（对象数组时使用）
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 * @param array 数组
 * @param key 分组的键
 * @returns 分组后的对象
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组排序
 * @param array 数组
 * @param key 排序的键
 * @param order 排序顺序
 * @returns 排序后的数组
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * 格式化数字
 * @param num 数字
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('zh-CN', options).format(num)
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的字符串
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 相对时间格式化
 * @param date 日期
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < week) return `${Math.floor(diff / day)}天前`
  if (diff < month) return `${Math.floor(diff / week)}周前`
  if (diff < year) return `${Math.floor(diff / month)}个月前`
  return `${Math.floor(diff / year)}年前`
}

/**
 * 颜色工具函数
 */
export const colorUtils = {
  /**
   * 十六进制转RGB
   * @param hex 十六进制颜色
   * @returns RGB对象
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  /**
   * RGB转十六进制
   * @param r 红色值
   * @param g 绿色值
   * @param b 蓝色值
   * @returns 十六进制颜色
   */
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  },
  
  /**
   * 获取颜色亮度
   * @param hex 十六进制颜色
   * @returns 亮度值（0-255）
   */
  getLuminance(hex: string): number {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return 0

    const { r, g, b } = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b
  },
  
  /**
   * 判断颜色是否为深色
   * @param hex 十六进制颜色
   * @returns 是否为深色
   */
  isDark(hex: string): boolean {
    return colorUtils.getLuminance(hex) < 128
  }
}

/**
 * DOM工具函数
 */
export const domUtils = {
  /**
   * 获取元素的边界矩形
   * @param element 元素
   * @returns 边界矩形
   */
  getBoundingRect(element: Element): DOMRect {
    return element.getBoundingClientRect()
  },
  
  /**
   * 判断元素是否在视口中
   * @param element 元素
   * @returns 是否在视口中
   */
  isInViewport(element: Element): boolean {
    const rect = domUtils.getBoundingRect(element)
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },
  
  /**
   * 滚动到元素
   * @param element 元素
   * @param options 滚动选项
   */
  scrollToElement(element: Element, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    })
  },
  
  /**
   * 获取元素的样式
   * @param element 元素
   * @param property 样式属性
   * @returns 样式值
   */
  getStyle(element: Element, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  }
}

/**
 * 验证工具函数
 */
export const validators = {
  /**
   * 验证邮箱
   * @param email 邮箱地址
   * @returns 是否有效
   */
  isEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },
  
  /**
   * 验证手机号
   * @param phone 手机号
   * @returns 是否有效
   */
  isPhone(phone: string): boolean {
    const regex = /^1[3-9]\d{9}$/
    return regex.test(phone)
  },
  
  /**
   * 验证URL
   * @param url URL地址
   * @returns 是否有效
   */
  isUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  
  /**
   * 验证身份证号
   * @param idCard 身份证号
   * @returns 是否有效
   */
  isIdCard(idCard: string): boolean {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return regex.test(idCard)
  }
}
