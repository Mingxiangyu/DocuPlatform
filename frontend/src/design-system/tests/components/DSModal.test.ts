/**
 * DSModal 组件单元测试
 * 测试模态框组件的显示、隐藏、交互和可访问性
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DSModal from '../../components/molecules/DSModal.vue'
import { testUtils } from '../setup'

describe('DSModal', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    // 创建 teleport 目标
    const teleportTarget = document.createElement('div')
    teleportTarget.id = 'modal-root'
    document.body.appendChild(teleportTarget)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // 清理 teleport 目标
    const teleportTarget = document.getElementById('modal-root')
    if (teleportTarget) {
      document.body.removeChild(teleportTarget)
    }
  })

  describe('基础渲染', () => {
    it('应该在 modelValue 为 true 时显示模态框', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '测试模态框',
          content: '这是测试内容'
        },
        attachTo: document.body
      })

      await nextTick()
      
      // 检查模态框是否在 DOM 中
      const modal = document.querySelector('.modal-overlay')
      expect(modal).toBeTruthy()
    })

    it('应该在 modelValue 为 false 时隐藏模态框', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: false,
          title: '测试模态框'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const modal = document.querySelector('.modal-overlay')
      expect(modal).toBeFalsy()
    })

    it('应该正确渲染标题和内容', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '测试标题',
          description: '测试描述',
          content: '测试内容'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const title = document.querySelector('.modal-title')
      const description = document.querySelector('.modal-description')
      
      expect(title?.textContent).toBe('测试标题')
      expect(description?.textContent).toBe('测试描述')
    })
  })

  describe('尺寸和变体', () => {
    it('应该正确应用不同尺寸', async () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full']
      
      for (const size of sizes) {
        wrapper = mount(DSModal, {
          props: {
            modelValue: true,
            size,
            title: '测试'
          },
          attachTo: document.body
        })

        await nextTick()
        
        const container = document.querySelector('.modal-container')
        expect(container).toBeTruthy()
        
        wrapper.unmount()
      }
    })

    it('应该正确应用不同变体', async () => {
      const variants = ['default', 'danger', 'warning', 'success', 'info']
      
      for (const variant of variants) {
        wrapper = mount(DSModal, {
          props: {
            modelValue: true,
            variant,
            title: '测试'
          },
          attachTo: document.body
        })

        await nextTick()
        wrapper.unmount()
      }
    })
  })

  describe('交互行为', () => {
    it('应该在点击确认按钮时触发 confirm 事件', async () => {
      const confirmHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '确认操作',
          onConfirm: confirmHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const confirmButton = document.querySelector('.confirm-button')
      expect(confirmButton).toBeTruthy()
      
      await testUtils.click(confirmButton!)
      expect(confirmHandler).toHaveBeenCalledTimes(1)
    })

    it('应该在点击取消按钮时触发 cancel 事件', async () => {
      const cancelHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '取消操作',
          onCancel: cancelHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const cancelButton = document.querySelector('.cancel-button')
      expect(cancelButton).toBeTruthy()
      
      await testUtils.click(cancelButton!)
      expect(cancelHandler).toHaveBeenCalledTimes(1)
    })

    it('应该在点击关闭按钮时触发 close 事件', async () => {
      const closeHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '关闭操作',
          showCloseButton: true,
          onClose: closeHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const closeButton = document.querySelector('.close-button')
      expect(closeButton).toBeTruthy()
      
      await testUtils.click(closeButton!)
      expect(closeHandler).toHaveBeenCalledTimes(1)
    })

    it('应该在点击遮罩时关闭模态框（如果允许）', async () => {
      const updateHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '遮罩关闭',
          closeOnOverlay: true,
          'onUpdate:modelValue': updateHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const overlay = document.querySelector('.modal-overlay')
      expect(overlay).toBeTruthy()
      
      await testUtils.click(overlay!)
      expect(updateHandler).toHaveBeenCalledWith(false)
    })

    it('应该在按 ESC 键时关闭模态框（如果允许）', async () => {
      const updateHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: 'ESC 关闭',
          closeOnEscape: true,
          'onUpdate:modelValue': updateHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      await testUtils.keydown(document.body, 'Escape')
      expect(updateHandler).toHaveBeenCalledWith(false)
    })
  })

  describe('加载状态', () => {
    it('应该在加载状态下禁用按钮', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '加载测试',
          loading: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      const confirmButton = document.querySelector('.confirm-button') as HTMLButtonElement
      const cancelButton = document.querySelector('.cancel-button') as HTMLButtonElement
      
      expect(confirmButton?.disabled).toBe(true)
      expect(cancelButton?.disabled).toBe(true)
    })

    it('应该显示加载指示器', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '加载指示器',
          loading: true
        },
        attachTo: document.body
      })

      await nextTick()
      
      const loadingSpinner = document.querySelector('.loading-spinner')
      expect(loadingSpinner).toBeTruthy()
    })
  })

  describe('持久化模式', () => {
    it('持久化模式下不应该通过遮罩关闭', async () => {
      const updateHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '持久化模式',
          persistent: true,
          'onUpdate:modelValue': updateHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const overlay = document.querySelector('.modal-overlay')
      await testUtils.click(overlay!)
      
      expect(updateHandler).not.toHaveBeenCalled()
    })

    it('持久化模式下不应该通过 ESC 键关闭', async () => {
      const updateHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '持久化 ESC',
          persistent: true,
          'onUpdate:modelValue': updateHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      await testUtils.keydown(document.body, 'Escape')
      expect(updateHandler).not.toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 ARIA 属性', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '可访问性测试',
          titleId: 'test-title',
          contentId: 'test-content'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const modal = document.querySelector('.modal-overlay')
      expect(modal?.getAttribute('role')).toBe('dialog')
      expect(modal?.getAttribute('aria-modal')).toBe('true')
      expect(modal?.getAttribute('aria-labelledby')).toBe('test-title')
      expect(modal?.getAttribute('aria-describedby')).toBe('test-content')
    })

    it('应该正确管理焦点', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '焦点管理'
        },
        attachTo: document.body
      })

      await nextTick()
      await testUtils.wait(100) // 等待焦点设置
      
      const modal = document.querySelector('.modal-container')
      expect(document.activeElement).toBe(modal)
    })

    it('应该阻止背景滚动', async () => {
      const originalOverflow = document.body.style.overflow
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '滚动阻止'
        },
        attachTo: document.body
      })

      await nextTick()
      expect(document.body.style.overflow).toBe('hidden')
      
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      expect(document.body.style.overflow).toBe('')
      
      // 恢复原始样式
      document.body.style.overflow = originalOverflow
    })
  })

  describe('插槽内容', () => {
    it('应该正确渲染默认插槽', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '插槽测试'
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const customContent = document.querySelector('.custom-content')
      expect(customContent?.textContent).toBe('自定义内容')
    })

    it('应该正确渲染底部插槽', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '底部插槽'
        },
        slots: {
          footer: '<div class="custom-footer">自定义底部</div>'
        },
        attachTo: document.body
      })

      await nextTick()
      
      const customFooter = document.querySelector('.custom-footer')
      expect(customFooter?.textContent).toBe('自定义底部')
    })
  })

  describe('动画和过渡', () => {
    it('应该触发正确的动画事件', async () => {
      const openedHandler = vi.fn()
      const closedHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: false,
          title: '动画测试',
          onOpened: openedHandler,
          onClosed: closedHandler
        },
        attachTo: document.body
      })

      // 打开模态框
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await testUtils.wait(300) // 等待动画完成
      
      expect(openedHandler).toHaveBeenCalledTimes(1)
      
      // 关闭模态框
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      await testUtils.wait(300) // 等待动画完成
      
      expect(closedHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理无标题的情况', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          showHeader: false
        },
        attachTo: document.body
      })

      await nextTick()
      
      const header = document.querySelector('.modal-header')
      expect(header).toBeFalsy()
    })

    it('应该处理无底部的情况', async () => {
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '无底部',
          showFooter: false
        },
        attachTo: document.body
      })

      await nextTick()
      
      const footer = document.querySelector('.modal-footer')
      expect(footer).toBeFalsy()
    })

    it('应该处理禁用状态下的交互', async () => {
      const confirmHandler = vi.fn()
      
      wrapper = mount(DSModal, {
        props: {
          modelValue: true,
          title: '禁用测试',
          confirmDisabled: true,
          onConfirm: confirmHandler
        },
        attachTo: document.body
      })

      await nextTick()
      
      const confirmButton = document.querySelector('.confirm-button') as HTMLButtonElement
      expect(confirmButton?.disabled).toBe(true)
      
      await testUtils.click(confirmButton)
      expect(confirmHandler).not.toHaveBeenCalled()
    })
  })
})
