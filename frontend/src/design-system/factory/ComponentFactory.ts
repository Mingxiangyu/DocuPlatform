/**
 * 组件工厂系统 - 设计系统核心
 * 基于设计令牌的智能组件生成器
 */

import { defineComponent, computed, ref, inject, type Component, type PropType } from 'vue'
import type { CompleteDesignTokens } from '../tokens'

// 组件工厂核心类
export class DesignSystemComponentFactory {
  private designTokens: CompleteDesignTokens
  private themeContext: ThemeContext
  private registeredComponents: Map<string, Component> = new Map()

  constructor(tokens: CompleteDesignTokens, theme: ThemeContext) {
    this.designTokens = tokens
    this.themeContext = theme
  }

  // 注册组件方法
  registerComponent(name: string, component: Component): void {
    this.registeredComponents.set(name, component)
  }

  // 获取已注册的组件
  getComponent(name: string): Component | undefined {
    return this.registeredComponents.get(name)
  }

  // 获取所有已注册的组件
  getAllComponents(): Map<string, Component> {
    return new Map(this.registeredComponents)
  }

  // 英雄区域工厂方法
  createHeroSection(config: HeroSectionConfig): Component {
    return defineComponent({
      name: 'DSHeroSection',
      props: {
        layout: {
          type: String as PropType<'center' | 'split'>,
          default: 'split'
        },
        backgroundType: {
          type: String as PropType<'gradient' | 'image' | 'solid'>,
          default: 'gradient'
        },
        animation: {
          type: Object as PropType<AnimationConfig>,
          default: () => ({
            enter: 'fadeInUp',
            stagger: 200,
            duration: 800
          })
        },
        padding: {
          type: String,
          default: 'large'
        }
      },
      setup: (props) => {
        const heroClasses = computed(() => [
          'hero-section',
          `hero-layout-${props.layout}`,
          `hero-bg-${props.backgroundType}`,
          'relative overflow-hidden'
        ])

        const heroStyles = computed(() => ({
          background: this.designTokens.colors.gradients.hero,
          minHeight: '500px',
          display: props.layout === 'split' ? 'grid' : 'flex',
          gridTemplateColumns: props.layout === 'split' ? '1fr 1fr' : 'none',
          alignItems: 'center',
          padding: this.getSpacingValue(props.padding),
          gap: this.designTokens.spacing[8]
        }))

        const contentClasses = computed(() => [
          'hero-content',
          'z-10 relative',
          props.layout === 'center' ? 'text-center' : 'text-left'
        ])

        const visualClasses = computed(() => [
          'hero-visual',
          'z-10 relative',
          props.layout === 'split' ? 'flex justify-center items-center' : 'hidden'
        ])

        return { heroClasses, heroStyles, contentClasses, visualClasses }
      },
      template: `
        <section :class="heroClasses" :style="heroStyles">
          <div :class="contentClasses">
            <slot name="content" />
          </div>
          <div v-if="layout === 'split'" :class="visualClasses">
            <slot name="visual" />
          </div>
        </section>
      `
    })
  }

  // 分类卡片工厂方法
  createCategoryCard(config: CategoryCardConfig): Component {
    return defineComponent({
      name: 'DSCategoryCard',
      props: {
        category: {
          type: Object as PropType<CategoryData>,
          required: true
        },
        size: {
          type: String as PropType<'sm' | 'md' | 'lg'>,
          default: 'md'
        },
        animationDelay: {
          type: Number,
          default: 0
        },
        hoverEffects: {
          type: Boolean,
          default: true
        }
      },
      setup: (props) => {
        const categoryScheme = computed(() => 
          this.designTokens.colors.category[props.category.id as keyof typeof this.designTokens.colors.category] || 
          this.designTokens.colors.category.frontend
        )

        const cardClasses = computed(() => [
          'category-card',
          `category-card-${props.size}`,
          'bg-white rounded-2xl p-6 cursor-pointer',
          'transition-all duration-300 ease-out',
          props.hoverEffects && 'hover:transform hover:-translate-y-1 hover:shadow-large'
        ])

        const cardStyles = computed(() => ({
          boxShadow: this.designTokens.shadows.soft,
          animationDelay: `${props.animationDelay}ms`,
          borderRadius: this.designTokens.borderRadius['2xl']
        }))

        const iconContainerStyles = computed(() => ({
          width: this.designTokens.spacing[12],
          height: this.designTokens.spacing[12],
          background: categoryScheme.value.background,
          borderRadius: this.designTokens.borderRadius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: this.designTokens.spacing[4]
        }))

        const iconStyles = computed(() => ({
          color: categoryScheme.value.icon,
          fontSize: this.designTokens.spacing[6]
        }))

        const titleStyles = computed(() => ({
          color: categoryScheme.value.text,
          fontFamily: this.designTokens.typography.fontFamily.sans.join(', '),
          fontSize: this.designTokens.typography.fontSize.lg[0],
          fontWeight: this.designTokens.typography.fontWeight.semibold,
          marginBottom: this.designTokens.spacing[2]
        }))

        return { 
          cardClasses, 
          cardStyles, 
          iconContainerStyles, 
          iconStyles, 
          titleStyles, 
          categoryScheme 
        }
      },
      template: `
        <div :class="cardClasses" :style="cardStyles">
          <div :style="iconContainerStyles">
            <i :class="category.icon" :style="iconStyles"></i>
          </div>
          <h3 :style="titleStyles">{{ category.name }}</h3>
          <p class="text-gray-600 text-sm">{{ category.articleCount }} 篇文档</p>
        </div>
      `
    })
  }

  // 动画卡片工厂方法
  createAnimatedCard(config: AnimatedCardConfig): Component {
    return defineComponent({
      name: 'DSAnimatedCard',
      props: {
        hover: {
          type: Boolean,
          default: true
        },
        animation: {
          type: String as PropType<keyof typeof this.designTokens.animations.keyframes>,
          default: 'fadeInUp'
        },
        delay: {
          type: Number,
          default: 0
        },
        threshold: {
          type: Number,
          default: 0.1
        }
      },
      setup: (props) => {
        const cardRef = ref<HTMLElement>()
        const isVisible = ref(false)

        const cardClasses = computed(() => [
          'animated-card',
          'opacity-0 transform',
          'transition-all duration-500',
          props.hover && 'hover:transform hover:-translate-y-2 hover:shadow-floating',
          isVisible.value && `animate-${props.animation}`
        ])

        const cardStyles = computed(() => ({
          animationDelay: `${props.delay}ms`,
          animationDuration: this.designTokens.animations.duration.slow,
          animationTimingFunction: this.designTokens.animations.easing.smooth,
          animationFillMode: 'forwards'
        }))

        // 滚动触发动画逻辑将在组合式API中实现
        return { cardRef, cardClasses, cardStyles, isVisible }
      },
      template: `
        <div ref="cardRef" :class="cardClasses" :style="cardStyles">
          <slot />
        </div>
      `
    })
  }

  // 进度条工厂方法
  createProgressBar(config: ProgressBarConfig): Component {
    return defineComponent({
      name: 'DSProgressBar',
      props: {
        progress: {
          type: Number,
          required: true,
          validator: (value: number) => value >= 0 && value <= 100
        },
        color: {
          type: String,
          default: 'primary'
        },
        height: {
          type: String,
          default: '3px'
        },
        position: {
          type: String as PropType<'top' | 'bottom'>,
          default: 'top'
        },
        animated: {
          type: Boolean,
          default: true
        }
      },
      setup: (props) => {
        const progressStyles = computed(() => ({
          position: 'fixed' as const,
          [props.position]: '0',
          left: '0',
          width: `${props.progress}%`,
          height: props.height,
          background: this.designTokens.colors.gradients.progress,
          zIndex: '100',
          transition: props.animated ? 'width 0.3s ease-out' : 'none'
        }))

        return { progressStyles }
      },
      template: `
        <div class="progress-bar" :style="progressStyles"></div>
      `
    })
  }

  // 私有工具方法
  private getSpacingValue(size: string): string {
    const spacingMap = {
      small: this.designTokens.spacing[8],
      medium: this.designTokens.spacing[12],
      large: this.designTokens.spacing[20],
      xlarge: this.designTokens.spacing[32]
    }
    return spacingMap[size as keyof typeof spacingMap] || spacingMap.medium
  }
}

// 类型定义
export interface ThemeContext {
  theme: string
  designTokens?: CompleteDesignTokens
}

export interface HeroSectionConfig {
  layout: 'center' | 'split'
  backgroundType: 'gradient' | 'image' | 'solid'
  animation: AnimationConfig
  content?: HeroContent
}

export interface AnimationConfig {
  enter: string
  stagger?: number
  duration?: number
  delay?: number
}

export interface HeroContent {
  title: string
  subtitle?: string
  description?: string
  actions?: Array<{
    text: string
    variant: string
    href?: string
  }>
}

export interface CategoryCardConfig {
  category: CategoryData
  size: 'sm' | 'md' | 'lg'
  animationDelay: number
  hoverEffects: boolean
}

export interface CategoryData {
  id: string
  name: string
  icon: string
  articleCount: number
  description?: string
}

export interface AnimatedCardConfig {
  hover: boolean
  animation: string
  delay: number
  threshold: number
}

export interface ProgressBarConfig {
  progress: number
  color: string
  height: string
  position: 'top' | 'bottom'
  animated: boolean
}

// 组件升级工厂
export class ComponentUpgradeFactory {
  static upgradeComponent<T extends Component>(
    originalComponent: T,
    designTokens: CompleteDesignTokens,
    enhancements: ComponentEnhancement[] = []
  ): UpgradedComponent<T> {
    return defineComponent({
      name: `DS${originalComponent.name}`,
      extends: originalComponent,
      setup(props, ctx) {
        // 注入设计令牌
        const tokens = inject('designTokens', designTokens)
        const theme = inject('currentTheme', ref('light'))

        // 获取原始组件的setup
        const originalSetup = originalComponent.setup?.(props, ctx) || {}

        // 添加设计系统增强
        const designSystemEnhancements = {
          tokens,
          theme,
          // 统一的动画控制
          useAnimation: (name: string, options?: AnimationOptions) => {
            return useDesignSystemAnimation(name, tokens, options)
          },
          // 统一的主题响应
          useThemeColors: (colorKey: string) => {
            return computed(() => getNestedValue(tokens.colors, colorKey))
          }
        }

        return { ...originalSetup, ...designSystemEnhancements }
      }
    })
  }
}

export interface ComponentEnhancement {
  type: 'animation' | 'theme' | 'responsive' | 'accessibility'
  config: any
}

export interface AnimationOptions {
  duration?: string
  easing?: string
  delay?: string
}

export type UpgradedComponent<T> = T & {
  designSystemEnhancements: any
}

// 工具函数
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || ''
}

function useDesignSystemAnimation(name: string, tokens: CompleteDesignTokens, options?: AnimationOptions) {
  // 动画逻辑将在组合式API中实现
  return {
    play: () => Promise.resolve(),
    pause: () => {},
    reset: () => {},
    isPlaying: ref(false)
  }
}

export default DesignSystemComponentFactory
