<!--
  设计系统按钮组件 - DSButton
  基于设计令牌的完整按钮系统，支持多种变体和动画效果
-->

<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="disabled || loading"
    :type="type"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 加载状态 -->
    <span 
      v-if="loading" 
      class="loading-spinner"
      :style="spinnerStyles"
      aria-hidden="true"
    ></span>
    
    <!-- 图标插槽 -->
    <span 
      v-if="$slots.icon && !loading" 
      class="button-icon"
      :class="{ 'mr-2': $slots.default }"
    >
      <slot name="icon" />
    </span>
    
    <!-- 默认内容 -->
    <span v-if="!loading && $slots.default" class="button-content">
      <slot />
    </span>
    
    <!-- 加载文本 -->
    <span v-if="loading && loadingText" class="button-loading-text">
      {{ loadingText }}
    </span>
    
    <!-- 右侧图标插槽 -->
    <span 
      v-if="$slots.iconRight && !loading" 
      class="button-icon-right"
      :class="{ 'ml-2': $slots.default }"
    >
      <slot name="iconRight" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue'
import { useDesignTokens, useAnimation } from '../../design-system/composables'
import type { CompleteDesignTokens } from '../../design-system/tokens'

// 组件属性接口
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  rounded?: boolean
  shadow?: boolean
  animation?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingText: '加载中...',
  type: 'button',
  fullWidth: false,
  rounded: false,
  shadow: true,
  animation: true
})

// 事件定义
const emit = defineEmits<{
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

// 设计令牌和动画
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const buttonRef = ref<HTMLElement | null>(null)

// 动画控制
const pressAnimation = useAnimation('buttonPress', {
  duration: tokens.animations.duration.fast,
  easing: tokens.animations.easing.easeOut
})

// 状态管理
const isHovered = ref(false)
const isFocused = ref(false)
const isPressed = ref(false)

// 按钮样式计算
const buttonClasses = computed(() => {
  const baseClasses = [
    'ds-button',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'border',
    'transition-all',
    'focus:outline-none',
    'focus-ring',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none'
  ]

  // 尺寸类
  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs', 'rounded'],
    sm: ['px-3', 'py-1.5', 'text-sm', 'rounded-md'],
    md: ['px-4', 'py-2', 'text-base', 'rounded-md'],
    lg: ['px-6', 'py-3', 'text-lg', 'rounded-lg'],
    xl: ['px-8', 'py-4', 'text-xl', 'rounded-lg']
  }

  // 变体类
  const variantClasses = {
    primary: [
      'bg-primary-600',
      'text-white',
      'border-primary-600',
      'hover:bg-primary-700',
      'hover:border-primary-700',
      'active:bg-primary-800',
      'focus:ring-primary-500'
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'border-gray-600',
      'hover:bg-gray-700',
      'hover:border-gray-700',
      'active:bg-gray-800',
      'focus:ring-gray-500'
    ],
    outline: [
      'bg-transparent',
      'text-primary-600',
      'border-primary-600',
      'hover:bg-primary-50',
      'hover:text-primary-700',
      'active:bg-primary-100',
      'focus:ring-primary-500'
    ],
    ghost: [
      'bg-transparent',
      'text-primary-600',
      'border-transparent',
      'hover:bg-primary-50',
      'hover:text-primary-700',
      'active:bg-primary-100',
      'focus:ring-primary-500'
    ],
    danger: [
      'bg-error-600',
      'text-white',
      'border-error-600',
      'hover:bg-error-700',
      'hover:border-error-700',
      'active:bg-error-800',
      'focus:ring-error-500'
    ],
    success: [
      'bg-success-600',
      'text-white',
      'border-success-600',
      'hover:bg-success-700',
      'hover:border-success-700',
      'active:bg-success-800',
      'focus:ring-success-500'
    ],
    warning: [
      'bg-warning-600',
      'text-white',
      'border-warning-600',
      'hover:bg-warning-700',
      'hover:border-warning-700',
      'active:bg-warning-800',
      'focus:ring-warning-500'
    ]
  }

  const classes = [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant]
  ]

  // 条件类
  if (props.fullWidth) {
    classes.push('w-full')
  }

  if (props.rounded) {
    classes.push('rounded-full')
  }

  if (props.shadow) {
    classes.push('shadow-soft', 'hover:shadow-medium')
  }

  if (props.animation) {
    classes.push('hover:transform', 'hover:-translate-y-0.5', 'active:translate-y-0')
  }

  return classes
})

// 动态样式
const buttonStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 动画持续时间
  styles['--transition-duration'] = tokens.animations.duration.normal
  styles['--transition-easing'] = tokens.animations.easing.smooth

  // 根据状态调整样式
  if (isPressed.value && props.animation) {
    styles.transform = 'scale(0.98)'
  }

  return styles
})

// 加载动画样式
const spinnerStyles = computed(() => ({
  borderColor: props.variant === 'outline' || props.variant === 'ghost' 
    ? getColor('primary.600') 
    : 'currentColor',
  borderTopColor: 'transparent'
}))

// 事件处理
const handleClick = async (event: MouseEvent) => {
  if (props.disabled || props.loading) return

  // 播放按压动画
  if (props.animation && buttonRef.value) {
    pressAnimation.element.value = buttonRef.value
    await pressAnimation.play()
  }

  emit('click', event)
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
  isPressed.value = false
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// 组件挂载
onMounted(() => {
  if (props.animation && buttonRef.value) {
    pressAnimation.element.value = buttonRef.value
  }
})
</script>

<style scoped>
.ds-button {
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.ds-button:disabled {
  pointer-events: none;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.button-icon,
.button-icon-right {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.button-content {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.button-loading-text {
  margin-left: 0.5rem;
}

/* 动画关键帧 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-button {
    min-height: 44px; /* 移动端触摸目标最小尺寸 */
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-button {
    border-width: 2px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-button {
    transition: none !important;
    animation: none !important;
  }
  
  .loading-spinner {
    animation: none !important;
  }
}
</style>
