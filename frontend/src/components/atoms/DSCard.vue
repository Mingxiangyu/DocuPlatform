<!--
  设计系统卡片组件 - DSCard
  基于设计令牌的完整卡片系统，支持多种变体和高级动画效果
-->

<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="cardStyles"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- 背景装饰层 -->
    <div 
      v-if="decorative" 
      class="card-decoration"
      :style="decorationStyles"
    ></div>
    
    <!-- 头部插槽 -->
    <div 
      v-if="$slots.header" 
      class="card-header"
      :class="headerClasses"
      :style="headerStyles"
    >
      <slot name="header" />
    </div>
    
    <!-- 主体内容 -->
    <div 
      class="card-body"
      :class="bodyClasses"
      :style="bodyStyles"
    >
      <slot />
    </div>
    
    <!-- 底部插槽 -->
    <div 
      v-if="$slots.footer" 
      class="card-footer"
      :class="footerClasses"
      :style="footerStyles"
    >
      <slot name="footer" />
    </div>
    
    <!-- 加载状态覆盖层 -->
    <div 
      v-if="loading" 
      class="card-loading-overlay"
      :style="loadingOverlayStyles"
    >
      <div class="loading-spinner"></div>
      <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDesignTokens, useAnimation, useScrollTrigger } from '../../design-system/composables'

// 组件属性接口
interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  shadow?: 'none' | 'subtle' | 'soft' | 'medium' | 'large' | 'floating' | 'glow'
  hover?: boolean
  clickable?: boolean
  loading?: boolean
  loadingText?: string
  animation?: boolean
  scrollAnimation?: boolean
  decorative?: boolean
  borderColor?: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'lg',
  shadow: 'soft',
  hover: false,
  clickable: false,
  loading: false,
  loadingText: '加载中...',
  animation: true,
  scrollAnimation: false,
  decorative: false
})

// 事件定义
const emit = defineEmits<{
  click: [event: MouseEvent]
  mouseenter: [event: MouseEvent]
  mouseleave: [event: MouseEvent]
}>()

// 设计令牌和动画
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const cardRef = ref<HTMLElement | null>(null)

// 动画控制
const hoverAnimation = useAnimation('cardHover', {
  duration: tokens.animations.duration.normal,
  easing: tokens.animations.easing.smooth
})

// 滚动动画
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.1,
  triggerOnce: true
})

// 状态管理
const isHovered = ref(false)

// 卡片样式计算
const cardClasses = computed(() => {
  const baseClasses = [
    'ds-card',
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'ease-out'
  ]

  // 变体类
  const variantClasses = {
    default: [
      'bg-white',
      'border',
      'border-gray-200',
      'dark:bg-gray-800',
      'dark:border-gray-700'
    ],
    elevated: [
      'bg-white',
      'dark:bg-gray-800'
    ],
    outlined: [
      'bg-white',
      'border-2',
      'border-gray-300',
      'dark:bg-gray-800',
      'dark:border-gray-600'
    ],
    filled: [
      'bg-gray-50',
      'border',
      'border-gray-200',
      'dark:bg-gray-700',
      'dark:border-gray-600'
    ],
    glass: [
      'bg-white/80',
      'backdrop-blur-sm',
      'border',
      'border-white/20',
      'dark:bg-gray-800/80',
      'dark:border-gray-700/20'
    ],
    gradient: [
      'bg-gradient-to-br',
      'from-white',
      'to-gray-50',
      'border',
      'border-gray-200',
      'dark:from-gray-800',
      'dark:to-gray-900',
      'dark:border-gray-700'
    ]
  }

  // 圆角类
  const roundedClasses = {
    none: [],
    sm: ['rounded-sm'],
    md: ['rounded-md'],
    lg: ['rounded-lg'],
    xl: ['rounded-xl'],
    '2xl': ['rounded-2xl'],
    '3xl': ['rounded-3xl'],
    full: ['rounded-full']
  }

  // 阴影类
  const shadowClasses = {
    none: [],
    subtle: ['shadow-subtle'],
    soft: ['shadow-soft'],
    medium: ['shadow-medium'],
    large: ['shadow-large'],
    floating: ['shadow-floating'],
    glow: ['shadow-glow']
  }

  // 交互类
  const interactionClasses = []
  if (props.hover || props.clickable) {
    interactionClasses.push('hover:shadow-large', 'hover:-translate-y-1')
  }
  
  if (props.clickable) {
    interactionClasses.push('cursor-pointer', 'active:translate-y-0', 'active:shadow-medium')
  }

  // 动画类
  const animationClasses = []
  if (props.animation) {
    animationClasses.push('transform-gpu')
  }
  
  if (props.scrollAnimation && isVisible.value) {
    animationClasses.push('animate-fade-in-up')
  }

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...roundedClasses[props.rounded],
    ...shadowClasses[props.shadow],
    ...interactionClasses,
    ...animationClasses
  ]
})

// 动态样式
const cardStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 自定义背景色
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor
  }

  // 自定义边框色
  if (props.borderColor) {
    styles.borderColor = props.borderColor
  }

  // 动画变量
  styles['--card-transition-duration'] = tokens.animations.duration.normal
  styles['--card-transition-easing'] = tokens.animations.easing.smooth

  return styles
})

// 头部样式
const headerClasses = computed(() => [
  'border-b',
  'border-gray-200',
  'dark:border-gray-700'
])

const headerStyles = computed(() => ({
  padding: `${getSpacing(4)} ${getSpacing(6)}`
}))

// 主体样式
const bodyClasses = computed(() => [])

const bodyStyles = computed(() => {
  const paddingMap = {
    none: '0',
    xs: getSpacing(2),
    sm: getSpacing(3),
    md: getSpacing(6),
    lg: getSpacing(8),
    xl: getSpacing(10)
  }
  
  return {
    padding: paddingMap[props.padding]
  }
})

// 底部样式
const footerClasses = computed(() => [
  'border-t',
  'border-gray-200',
  'bg-gray-50',
  'dark:border-gray-700',
  'dark:bg-gray-700/50'
])

const footerStyles = computed(() => ({
  padding: `${getSpacing(4)} ${getSpacing(6)}`
}))

// 装饰层样式
const decorationStyles = computed(() => ({
  background: tokens.colors.gradients.decoration,
  opacity: '0.5'
}))

// 加载覆盖层样式
const loadingOverlayStyles = computed(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(2px)'
}))

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}

const handleMouseEnter = async (event: MouseEvent) => {
  isHovered.value = true
  
  if (props.animation && props.hover && cardRef.value) {
    hoverAnimation.element.value = cardRef.value
    await hoverAnimation.play()
  }
  
  emit('mouseenter', event)
}

const handleMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
  emit('mouseleave', event)
}

// 组件挂载
onMounted(() => {
  if (props.scrollAnimation && cardRef.value) {
    observe(cardRef.value)
  }
  
  if (props.animation && cardRef.value) {
    hoverAnimation.element.value = cardRef.value
  }
})
</script>

<style scoped>
.ds-card {
  position: relative;
  will-change: transform, box-shadow;
}

.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 1;
}

.card-header {
  position: relative;
  z-index: 2;
}

.card-body {
  position: relative;
  z-index: 2;
}

.card-footer {
  position: relative;
  z-index: 2;
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top: 3px solid rgb(168, 85, 247);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.loading-text {
  color: rgb(168, 85, 247);
  font-weight: 500;
  font-size: 0.875rem;
}

/* 动画关键帧 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-card {
    margin: 0.5rem;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-card {
    border-width: 2px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-card {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
  
  .loading-spinner {
    animation: none !important;
  }
}

/* 暗色模式优化 */
@media (prefers-color-scheme: dark) {
  .card-loading-overlay {
    background-color: rgba(31, 41, 55, 0.9);
  }
}
</style>
