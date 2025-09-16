/**
 * DocuVault 设计系统 - 测试环境配置
 * 配置测试环境、模拟对象和全局测试工具
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createApp } from 'vue'
import { DesignSystemProvider } from '../providers/DesignSystemProvider.vue'

// 配置 Vue Test Utils
config.global.plugins = [DesignSystemProvider]

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn().mockImplementation(id => clearTimeout(id))

// 模拟 requestIdleCallback
global.requestIdleCallback = vi.fn().mockImplementation(cb => setTimeout(cb, 0))
global.cancelIdleCallback = vi.fn().mockImplementation(id => clearTimeout(id))

// 模拟 performance API
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  }
})

// 模拟 navigator API
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en'],
    hardwareConcurrency: 4,
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    },
    deviceMemory: 8
  }
})

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// 模拟 console 方法（用于测试警告和错误）
const originalConsole = { ...console }
global.console = {
  ...originalConsole,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// 测试工具函数
export const testUtils = {
  /**
   * 等待下一个 tick
   */
  async nextTick() {
    await new Promise(resolve => setTimeout(resolve, 0))
  },

  /**
   * 等待指定时间
   */
  async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 模拟用户点击
   */
  async click(element: Element) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟用户输入
   */
  async type(element: HTMLInputElement, text: string) {
    element.focus()
    element.value = text
    
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(inputEvent)
    
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(changeEvent)
    
    await this.nextTick()
  },

  /**
   * 模拟键盘事件
   */
  async keydown(element: Element, key: string, options: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟鼠标悬停
   */
  async hover(element: Element) {
    const event = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟鼠标离开
   */
  async unhover(element: Element) {
    const event = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟焦点事件
   */
  async focus(element: HTMLElement) {
    element.focus()
    const event = new FocusEvent('focus', {
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟失焦事件
   */
  async blur(element: HTMLElement) {
    element.blur()
    const event = new FocusEvent('blur', {
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 获取元素的计算样式
   */
  getComputedStyle(element: Element, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  },

  /**
   * 检查元素是否可见
   */
  isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0'
  },

  /**
   * 检查元素是否有指定类名
   */
  hasClass(element: Element, className: string): boolean {
    return element.classList.contains(className)
  },

  /**
   * 获取元素的文本内容
   */
  getText(element: Element): string {
    return element.textContent?.trim() || ''
  },

  /**
   * 检查元素是否被禁用
   */
  isDisabled(element: HTMLElement): boolean {
    return element.hasAttribute('disabled') || 
           element.getAttribute('aria-disabled') === 'true'
  },

  /**
   * 模拟文件选择
   */
  async selectFiles(input: HTMLInputElement, files: File[]) {
    const dataTransfer = new DataTransfer()
    files.forEach(file => dataTransfer.items.add(file))
    
    Object.defineProperty(input, 'files', {
      value: dataTransfer.files,
      writable: false
    })
    
    const event = new Event('change', {
      bubbles: true,
      cancelable: true
    })
    input.dispatchEvent(event)
    await this.nextTick()
  },

  /**
   * 模拟拖拽事件
   */
  async dragAndDrop(source: Element, target: Element, files?: File[]) {
    const dataTransfer = new DataTransfer()
    
    if (files) {
      files.forEach(file => dataTransfer.items.add(file))
    }
    
    // 开始拖拽
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    })
    source.dispatchEvent(dragStartEvent)
    
    // 拖拽到目标
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    })
    target.dispatchEvent(dragOverEvent)
    
    // 释放
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    })
    target.dispatchEvent(dropEvent)
    
    await this.nextTick()
  },

  /**
   * 创建测试文件
   */
  createFile(name: string, content: string, type = 'text/plain'): File {
    return new File([content], name, { type })
  },

  /**
   * 创建图片文件
   */
  createImageFile(name: string, width = 100, height = 100): File {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(0, 0, width, height)
    
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], name, { type: 'image/png' }))
      }, 'image/png')
    }) as any
  }
}

// 测试断言工具
export const assertions = {
  /**
   * 断言元素存在
   */
  elementExists(element: Element | null, message?: string) {
    if (!element) {
      throw new Error(message || 'Element does not exist')
    }
  },

  /**
   * 断言元素可见
   */
  elementVisible(element: Element, message?: string) {
    this.elementExists(element, message)
    if (!testUtils.isVisible(element)) {
      throw new Error(message || 'Element is not visible')
    }
  },

  /**
   * 断言元素隐藏
   */
  elementHidden(element: Element, message?: string) {
    this.elementExists(element, message)
    if (testUtils.isVisible(element)) {
      throw new Error(message || 'Element is visible')
    }
  },

  /**
   * 断言元素有指定文本
   */
  elementHasText(element: Element, expectedText: string, message?: string) {
    this.elementExists(element, message)
    const actualText = testUtils.getText(element)
    if (actualText !== expectedText) {
      throw new Error(message || `Expected text "${expectedText}", but got "${actualText}"`)
    }
  },

  /**
   * 断言元素包含指定文本
   */
  elementContainsText(element: Element, expectedText: string, message?: string) {
    this.elementExists(element, message)
    const actualText = testUtils.getText(element)
    if (!actualText.includes(expectedText)) {
      throw new Error(message || `Expected text to contain "${expectedText}", but got "${actualText}"`)
    }
  },

  /**
   * 断言元素有指定类名
   */
  elementHasClass(element: Element, className: string, message?: string) {
    this.elementExists(element, message)
    if (!testUtils.hasClass(element, className)) {
      throw new Error(message || `Element does not have class "${className}"`)
    }
  },

  /**
   * 断言元素被禁用
   */
  elementDisabled(element: HTMLElement, message?: string) {
    this.elementExists(element, message)
    if (!testUtils.isDisabled(element)) {
      throw new Error(message || 'Element is not disabled')
    }
  },

  /**
   * 断言元素未被禁用
   */
  elementEnabled(element: HTMLElement, message?: string) {
    this.elementExists(element, message)
    if (testUtils.isDisabled(element)) {
      throw new Error(message || 'Element is disabled')
    }
  }
}

// 导出测试工具
export { testUtils as default, assertions }
