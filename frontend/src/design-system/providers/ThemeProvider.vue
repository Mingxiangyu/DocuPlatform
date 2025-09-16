<!--
  主题提供者组件 - 设计系统核心
  负责主题管理、设计令牌注入和CSS变量应用
-->

<template>
  <div 
    class="theme-provider" 
    :data-theme="resolvedTheme"
    :style="cssVariables"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  provide, 
  watch, 
  watchEffect, 
  onMounted,
  type PropType 
} from 'vue'
import { usePreferredColorScheme } from '@vueuse/core'
import type { CompleteDesignTokens } from '../tokens'
import { DesignSystemComponentFactory } from '../factory/ComponentFactory'

// 导入新创建的组件以确保它们被注册到组件工厂
import DSCategoryGrid from '../../components/organisms/DSCategoryGrid.vue'
import DSScrollProgress from '../../components/atoms/DSScrollProgress.vue'
import DSHeader from '../../components/organisms/DSHeader.vue'
import DSCategoryNavigation from '../../components/molecules/DSCategoryNavigation.vue'
import DSDefaultLayout from '../../components/templates/DSDefaultLayout.vue'

// 组件属性定义
export interface ThemeProviderProps {
  theme: 'light' | 'dark' | 'auto'
  tokens: CompleteDesignTokens
  enableAnimations: boolean
  enableTransitions: boolean
}

const props = withDefaults(defineProps<ThemeProviderProps>(), {
  theme: 'light',
  enableAnimations: true,
  enableTransitions: true
})

// 主题状态管理
const currentTheme = ref(props.theme)
const systemTheme = usePreferredColorScheme()

// 计算实际主题
const resolvedTheme = computed(() => {
  if (currentTheme.value === 'auto') {
    return systemTheme.value === 'dark' ? 'dark' : 'light'
  }
  return currentTheme.value
})

// 创建组件工厂实例
const componentFactory = new DesignSystemComponentFactory(
  props.tokens,
  { theme: resolvedTheme.value }
)

// 主题上下文接口
export interface ThemeContext {
  currentTheme: typeof resolvedTheme
  designTokens: CompleteDesignTokens
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  componentFactory: DesignSystemComponentFactory
  enableAnimations: boolean
  enableTransitions: boolean
}

// 提供设计系统上下文
provide('designTokens', props.tokens)
provide('currentTheme', resolvedTheme)
provide('componentFactory', componentFactory)
provide('enableAnimations', computed(() => props.enableAnimations))
provide('enableTransitions', computed(() => props.enableTransitions))

// 动态CSS变量生成
const cssVariables = computed(() => {
  const vars: Record<string, string> = {}
  
  // 颜色变量
  Object.entries(props.tokens.colors.primary).forEach(([key, value]) => {
    vars[`--color-primary-${key}`] = value
  })
  
  // 分类颜色变量
  Object.entries(props.tokens.colors.category).forEach(([categoryId, scheme]) => {
    vars[`--color-category-${categoryId}-bg`] = scheme.background
    vars[`--color-category-${categoryId}-text`] = scheme.text
    vars[`--color-category-${categoryId}-icon`] = scheme.icon
    vars[`--color-category-${categoryId}-border`] = scheme.border
  })
  
  // 渐变变量
  Object.entries(props.tokens.colors.gradients).forEach(([key, value]) => {
    vars[`--gradient-${key}`] = value
  })
  
  // 间距变量
  Object.entries(props.tokens.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value
  })
  
  // 阴影变量
  Object.entries(props.tokens.shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value
  })
  
  // 动画变量
  Object.entries(props.tokens.animations.duration).forEach(([key, value]) => {
    vars[`--duration-${key}`] = value
  })
  
  Object.entries(props.tokens.animations.easing).forEach(([key, value]) => {
    vars[`--easing-${key}`] = value
  })
  
  // 字体变量
  vars['--font-sans'] = props.tokens.typography.fontFamily.sans.join(', ')
  vars['--font-serif'] = props.tokens.typography.fontFamily.serif.join(', ')
  vars['--font-mono'] = props.tokens.typography.fontFamily.mono.join(', ')
  
  Object.entries(props.tokens.typography.fontSize).forEach(([key, [size]]) => {
    vars[`--text-${key}`] = size
  })
  
  Object.entries(props.tokens.typography.fontWeight).forEach(([key, value]) => {
    vars[`--font-${key}`] = value
  })
  
  // 断点变量
  Object.entries(props.tokens.breakpoints).forEach(([key, value]) => {
    vars[`--breakpoint-${key}`] = value
  })
  
  // 圆角变量
  Object.entries(props.tokens.borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value
  })
  
  // 新组件特定变量
  // DSCategoryGrid 变量
  vars['--category-grid-gap'] = props.tokens.spacing[4]
  vars['--category-grid-animation-delay'] = '100ms'
  vars['--category-grid-hover-transform'] = 'translateY(-2px)'

  // DSScrollProgress 变量
  vars['--scroll-progress-height'] = '3px'
  vars['--scroll-progress-gradient'] = props.tokens.colors.gradients.progress ||
    `linear-gradient(90deg, ${props.tokens.colors.primary[600]}, ${props.tokens.colors.primary[400]})`

  // DSHeader 变量
  vars['--header-height'] = '64px'
  vars['--header-shadow'] = props.tokens.shadows.soft
  vars['--header-backdrop-blur'] = 'blur(8px)'

  // DSCategoryNavigation 变量
  vars['--category-nav-pill-radius'] = props.tokens.borderRadius.full
  vars['--category-nav-indicator-size'] = '4px'
  vars['--category-nav-hover-bg'] = props.tokens.colors.gray[50]

  // DSDefaultLayout 变量
  vars['--layout-max-width'] = '1280px'
  vars['--footer-bg'] = props.tokens.colors.gray[900]
  vars['--notification-shadow'] = props.tokens.shadows.large
  vars['--back-to-top-size'] = '48px'

  // 动画控制变量
  if (!props.enableAnimations) {
    vars['--animation-duration'] = '0ms'
    vars['--transition-duration'] = '0ms'
  }
  
  if (!props.enableTransitions) {
    vars['--transition-duration'] = '0ms'
  }
  
  return vars
})

// 主题切换方法
const setTheme = (theme: 'light' | 'dark' | 'auto') => {
  currentTheme.value = theme
  localStorage.setItem('docuvault-theme', theme)
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: resolvedTheme.value }
  }))
}

// 组件工厂实例
const componentFactory = new DesignSystemComponentFactory(props.tokens)

// 注册新组件到组件工厂
const registerNewComponents = () => {
  // 注册新创建的组件
  componentFactory.registerComponent('DSCategoryGrid', DSCategoryGrid)
  componentFactory.registerComponent('DSScrollProgress', DSScrollProgress)
  componentFactory.registerComponent('DSHeader', DSHeader)
  componentFactory.registerComponent('DSCategoryNavigation', DSCategoryNavigation)
  componentFactory.registerComponent('DSDefaultLayout', DSDefaultLayout)

  // 注册组件别名以便更好的使用
  componentFactory.registerComponent('CategoryGrid', DSCategoryGrid)
  componentFactory.registerComponent('ScrollProgress', DSScrollProgress)
  componentFactory.registerComponent('Header', DSHeader)
  componentFactory.registerComponent('CategoryNavigation', DSCategoryNavigation)
  componentFactory.registerComponent('DefaultLayout', DSDefaultLayout)
}

// 提供主题控制方法
provide('setTheme', setTheme)

// 组件工厂注入
provide('componentFactory', componentFactory)

// 监听系统主题变化
watch(systemTheme, (newTheme) => {
  if (currentTheme.value === 'auto') {
    document.documentElement.setAttribute('data-theme', newTheme === 'dark' ? 'dark' : 'light')
  }
})

// 监听主题变化
watch(resolvedTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
})

// 应用CSS变量到根元素
watchEffect(() => {
  const root = document.documentElement
  Object.entries(cssVariables.value).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
})

// 初始化主题
onMounted(() => {
  // 注册新组件
  registerNewComponents()

  // 从localStorage恢复主题设置
  const savedTheme = localStorage.getItem('docuvault-theme') as 'light' | 'dark' | 'auto'
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  }
  
  // 设置初始主题属性
  document.documentElement.setAttribute('data-theme', resolvedTheme.value)
  document.documentElement.classList.toggle('dark', resolvedTheme.value === 'dark')
  
  // 添加主题过渡类
  if (props.enableTransitions) {
    document.documentElement.classList.add('theme-transition')
  }
})

// 暴露给父组件的方法
defineExpose({
  setTheme,
  currentTheme: resolvedTheme,
  componentFactory
})
</script>

<style scoped>
.theme-provider {
  min-height: 100vh;
  transition: background-color var(--duration-normal, 300ms) var(--easing-smooth, ease);
}

/* 全局主题过渡样式 */
:global(.theme-transition) {
  transition: 
    background-color var(--duration-normal, 300ms) var(--easing-smooth, ease),
    color var(--duration-normal, 300ms) var(--easing-smooth, ease),
    border-color var(--duration-normal, 300ms) var(--easing-smooth, ease);
}

:global(.theme-transition *) {
  transition: 
    background-color var(--duration-normal, 300ms) var(--easing-smooth, ease),
    color var(--duration-normal, 300ms) var(--easing-smooth, ease),
    border-color var(--duration-normal, 300ms) var(--easing-smooth, ease);
}

/* 暗色主题样式 */
:global([data-theme="dark"]) {
  color-scheme: dark;
}

:global([data-theme="light"]) {
  color-scheme: light;
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .theme-provider,
  :global(.theme-transition),
  :global(.theme-transition *) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
