/**
 * DSButton 组件单元测试
 * 测试按钮组件的所有功能、状态和交互
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DSButton from '../../components/atoms/DSButton.vue'
import { testUtils, assertions } from '../setup'

describe('DSButton', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染默认按钮', () => {
      wrapper = mount(DSButton, {
        slots: {
          default: '点击我'
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toBe('点击我')
      expect(wrapper.classes()).toContain('ds-button')
    })

    it('应该正确渲染不同变体', () => {
      const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error']
      
      variants.forEach(variant => {
        wrapper = mount(DSButton, {
          props: { variant },
          slots: { default: '按钮' }
        })
        
        expect(wrapper.classes()).toContain(`button-${variant}`)
        wrapper.unmount()
      })
    })

    it('应该正确渲染不同尺寸', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
      
      sizes.forEach(size => {
        wrapper = mount(DSButton, {
          props: { size },
          slots: { default: '按钮' }
        })
        
        expect(wrapper.classes()).toContain(`button-${size}`)
        wrapper.unmount()
      })
    })

    it('应该正确渲染不同形状', () => {
      const shapes = ['default', 'round', 'circle']
      
      shapes.forEach(shape => {
        wrapper = mount(DSButton, {
          props: { shape },
          slots: { default: '按钮' }
        })
        
        expect(wrapper.classes()).toContain(`button-${shape}`)
        wrapper.unmount()
      })
    })
  })

  describe('状态管理', () => {
    it('应该正确处理禁用状态', () => {
      wrapper = mount(DSButton, {
        props: { disabled: true },
        slots: { default: '禁用按钮' }
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('button-disabled')
    })

    it('应该正确处理加载状态', () => {
      wrapper = mount(DSButton, {
        props: { loading: true },
        slots: { default: '加载中' }
      })

      expect(wrapper.classes()).toContain('button-loading')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      
      // 加载状态下按钮应该被禁用
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('应该正确处理危险状态', () => {
      wrapper = mount(DSButton, {
        props: { danger: true },
        slots: { default: '危险按钮' }
      })

      expect(wrapper.classes()).toContain('button-danger')
    })

    it('应该正确处理幽灵状态', () => {
      wrapper = mount(DSButton, {
        props: { ghost: true },
        slots: { default: '幽灵按钮' }
      })

      expect(wrapper.classes()).toContain('button-ghost')
    })
  })

  describe('图标支持', () => {
    const MockIcon = {
      template: '<svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    }

    it('应该正确渲染带图标的按钮', () => {
      wrapper = mount(DSButton, {
        props: { icon: MockIcon },
        slots: { default: '图标按钮' }
      })

      expect(wrapper.find('.button-icon').exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('应该正确渲染仅图标按钮', () => {
      wrapper = mount(DSButton, {
        props: { 
          icon: MockIcon,
          iconOnly: true
        }
      })

      expect(wrapper.classes()).toContain('button-icon-only')
      expect(wrapper.find('.button-icon').exists()).toBe(true)
    })

    it('应该正确处理图标位置', () => {
      wrapper = mount(DSButton, {
        props: { 
          icon: MockIcon,
          iconPosition: 'right'
        },
        slots: { default: '右侧图标' }
      })

      expect(wrapper.classes()).toContain('button-icon-right')
    })
  })

  describe('事件处理', () => {
    it('应该正确触发点击事件', async () => {
      const clickHandler = vi.fn()
      
      wrapper = mount(DSButton, {
        props: { onClick: clickHandler },
        slots: { default: '点击我' }
      })

      await wrapper.trigger('click')
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    it('禁用状态下不应该触发点击事件', async () => {
      const clickHandler = vi.fn()
      
      wrapper = mount(DSButton, {
        props: { 
          disabled: true,
          onClick: clickHandler
        },
        slots: { default: '禁用按钮' }
      })

      await wrapper.trigger('click')
      expect(clickHandler).not.toHaveBeenCalled()
    })

    it('加载状态下不应该触发点击事件', async () => {
      const clickHandler = vi.fn()
      
      wrapper = mount(DSButton, {
        props: { 
          loading: true,
          onClick: clickHandler
        },
        slots: { default: '加载中' }
      })

      await wrapper.trigger('click')
      expect(clickHandler).not.toHaveBeenCalled()
    })

    it('应该正确处理键盘事件', async () => {
      const clickHandler = vi.fn()
      
      wrapper = mount(DSButton, {
        props: { onClick: clickHandler },
        slots: { default: '按钮' }
      })

      // 测试 Enter 键
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(clickHandler).toHaveBeenCalledTimes(1)

      // 测试空格键
      await wrapper.trigger('keydown', { key: ' ' })
      expect(clickHandler).toHaveBeenCalledTimes(2)
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 ARIA 属性', () => {
      wrapper = mount(DSButton, {
        props: { 
          disabled: true,
          loading: true
        },
        slots: { default: '按钮' }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-disabled')).toBe('true')
      expect(button.attributes('aria-busy')).toBe('true')
    })

    it('应该有正确的 role 属性', () => {
      wrapper = mount(DSButton, {
        slots: { default: '按钮' }
      })

      const button = wrapper.find('button')
      expect(button.attributes('role')).toBe('button')
    })

    it('应该支持自定义 aria-label', () => {
      wrapper = mount(DSButton, {
        props: { ariaLabel: '自定义标签' },
        slots: { default: '按钮' }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('自定义标签')
    })

    it('仅图标按钮应该有 aria-label', () => {
      const MockIcon = {
        template: '<svg><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      }

      wrapper = mount(DSButton, {
        props: { 
          icon: MockIcon,
          iconOnly: true,
          ariaLabel: '星标按钮'
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('星标按钮')
    })
  })

  describe('样式计算', () => {
    it('应该正确计算按钮样式', () => {
      wrapper = mount(DSButton, {
        props: {
          variant: 'primary',
          size: 'lg',
          shape: 'round'
        },
        slots: { default: '按钮' }
      })

      expect(wrapper.classes()).toContain('button-primary')
      expect(wrapper.classes()).toContain('button-lg')
      expect(wrapper.classes()).toContain('button-round')
    })

    it('应该正确应用自定义样式', () => {
      const customStyle = {
        backgroundColor: 'red',
        color: 'white'
      }

      wrapper = mount(DSButton, {
        props: { style: customStyle },
        slots: { default: '自定义按钮' }
      })

      const button = wrapper.find('button')
      expect(button.element.style.backgroundColor).toBe('red')
      expect(button.element.style.color).toBe('white')
    })
  })

  describe('插槽内容', () => {
    it('应该正确渲染默认插槽', () => {
      wrapper = mount(DSButton, {
        slots: {
          default: '<span>自定义内容</span>'
        }
      })

      expect(wrapper.find('span').exists()).toBe(true)
      expect(wrapper.text()).toBe('自定义内容')
    })

    it('应该正确渲染图标插槽', () => {
      wrapper = mount(DSButton, {
        slots: {
          icon: '<i class="custom-icon"></i>',
          default: '按钮'
        }
      })

      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      wrapper = mount(DSButton)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理无效的变体', () => {
      wrapper = mount(DSButton, {
        props: { variant: 'invalid' as any },
        slots: { default: '按钮' }
      })

      // 应该回退到默认变体
      expect(wrapper.classes()).toContain('button-default')
    })

    it('应该处理无效的尺寸', () => {
      wrapper = mount(DSButton, {
        props: { size: 'invalid' as any },
        slots: { default: '按钮' }
      })

      // 应该回退到默认尺寸
      expect(wrapper.classes()).toContain('button-md')
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内渲染', () => {
      const startTime = performance.now()
      
      wrapper = mount(DSButton, {
        slots: { default: '性能测试' }
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // 渲染时间应该小于 10ms
      expect(renderTime).toBeLessThan(10)
    })

    it('应该正确处理大量重新渲染', async () => {
      wrapper = mount(DSButton, {
        props: { variant: 'default' },
        slots: { default: '按钮' }
      })

      const variants = ['primary', 'secondary', 'success', 'warning', 'error']
      
      for (const variant of variants) {
        await wrapper.setProps({ variant })
        expect(wrapper.classes()).toContain(`button-${variant}`)
      }
    })
  })
})
