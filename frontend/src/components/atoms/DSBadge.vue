<!--
  设计系统徽章组件 - DSBadge
  企业级徽章组件，支持多种变体、尺寸和状态显示
-->

<template>
  <span
    class="ds-badge"
    :style="badgeStyles"
    :class="badgeClasses"
    role="status"
    :aria-label="ariaLabel"
  >
    <!-- 图标 -->
    <component
      v-if="icon"
      :is="icon"
      class="badge-icon"
      :style="iconStyles"
    />
    
    <!-- 内容 -->
    <span v-if="$slots.default || content" class="badge-content" :style="contentStyles">
      <slot>{{ content }}</slot>
    </span>
    
    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      class="badge-close"
      :style="closeButtonStyles"
      @click="handleClose"
      :aria-label="closeLabel"
    >
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- 数字指示器 -->
    <span
      v-if="count !== undefined && showCount"
      class="badge-count"
      :style="countStyles"
    >
      {{ displayCount }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 组件属性
interface Props {
  // 基础属性
  content?: string | number
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  
  // 样式配置
  shape?: 'rounded' | 'pill' | 'square'
  outline?: boolean
  soft?: boolean
  
  // 功能配置
  closable?: boolean
  icon?: any
  count?: number
  maxCount?: number
  showCount?: boolean
  showZero?: boolean
  
  // 状态
  disabled?: boolean
  loading?: boolean
  
  // 无障碍访问
  ariaLabel?: string
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  shape: 'rounded',
  outline: false,
  soft: false,
  closable: false,
  maxCount: 99,
  showCount: true,
  showZero: false,
  disabled: false,
  loading: false,
  closeLabel: '关闭'
})

// 组件事件
interface Emits {
  (e: 'close'): void
  (e: 'click'): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing } = useDesignTokens()

// 计算属性
const displayCount = computed(() => {
  if (props.count === undefined) return ''
  if (props.count === 0 && !props.showZero) return ''
  if (props.count > props.maxCount) return `${props.maxCount}+`
  return props.count.toString()
})

const badgeClasses = computed(() => [
  `badge-${props.variant}`,
  `badge-${props.size}`,
  `badge-${props.shape}`,
  {
    'badge-outline': props.outline,
    'badge-soft': props.soft,
    'badge-disabled': props.disabled,
    'badge-loading': props.loading,
    'badge-closable': props.closable,
    'badge-with-icon': props.icon,
    'badge-with-count': props.count !== undefined && props.showCount
  }
])

// 样式计算
const badgeStyles = computed(() => {
  const baseStyles = getSizeStyles()
  const variantStyles = getVariantStyles()
  const shapeStyles = getShapeStyles()
  
  return {
    ...baseStyles,
    ...variantStyles,
    ...shapeStyles,
    display: 'inline-flex',
    alignItems: 'center',
    gap: getSpacing(1),
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    fontWeight: tokens.typography.fontWeight.medium,
    lineHeight: '1',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    transition: 'all 0.2s ease',
    position: 'relative',
    cursor: props.disabled ? 'not-allowed' : 'default',
    opacity: props.disabled ? '0.6' : '1'
  }
})

const getSizeStyles = () => {
  const sizeMap = {
    xs: {
      padding: `${getSpacing(0.5)} ${getSpacing(1.5)}`,
      fontSize: tokens.typography.fontSize.xs[0],
      minHeight: '16px'
    },
    sm: {
      padding: `${getSpacing(1)} ${getSpacing(2)}`,
      fontSize: tokens.typography.fontSize.xs[0],
      minHeight: '20px'
    },
    md: {
      padding: `${getSpacing(1)} ${getSpacing(2.5)}`,
      fontSize: tokens.typography.fontSize.sm[0],
      minHeight: '24px'
    },
    lg: {
      padding: `${getSpacing(1.5)} ${getSpacing(3)}`,
      fontSize: tokens.typography.fontSize.sm[0],
      minHeight: '28px'
    }
  }
  
  return sizeMap[props.size]
}

const getVariantStyles = () => {
  const variantMap = {
    default: {
      backgroundColor: getColor('gray.100'),
      color: getColor('gray.800'),
      borderColor: getColor('gray.200')
    },
    primary: {
      backgroundColor: getColor('primary.600'),
      color: 'white',
      borderColor: getColor('primary.600')
    },
    secondary: {
      backgroundColor: getColor('gray.600'),
      color: 'white',
      borderColor: getColor('gray.600')
    },
    success: {
      backgroundColor: getColor('success.600'),
      color: 'white',
      borderColor: getColor('success.600')
    },
    warning: {
      backgroundColor: getColor('warning.600'),
      color: 'white',
      borderColor: getColor('warning.600')
    },
    error: {
      backgroundColor: getColor('error.600'),
      color: 'white',
      borderColor: getColor('error.600')
    },
    info: {
      backgroundColor: getColor('info.600'),
      color: 'white',
      borderColor: getColor('info.600')
    }
  }
  
  let styles = variantMap[props.variant]
  
  // 轮廓样式
  if (props.outline) {
    styles = {
      backgroundColor: 'transparent',
      color: styles.borderColor,
      borderColor: styles.borderColor
    }
  }
  
  // 柔和样式
  if (props.soft) {
    const softMap = {
      default: {
        backgroundColor: getColor('gray.100'),
        color: getColor('gray.700')
      },
      primary: {
        backgroundColor: getColor('primary.100'),
        color: getColor('primary.700')
      },
      secondary: {
        backgroundColor: getColor('gray.100'),
        color: getColor('gray.700')
      },
      success: {
        backgroundColor: getColor('success.100'),
        color: getColor('success.700')
      },
      warning: {
        backgroundColor: getColor('warning.100'),
        color: getColor('warning.700')
      },
      error: {
        backgroundColor: getColor('error.100'),
        color: getColor('error.700')
      },
      info: {
        backgroundColor: getColor('info.100'),
        color: getColor('info.700')
      }
    }
    styles = softMap[props.variant]
  }
  
  return {
    ...styles,
    border: props.outline ? `1px solid ${styles.borderColor}` : 'none'
  }
}

const getShapeStyles = () => {
  const shapeMap = {
    rounded: {
      borderRadius: tokens.borderRadius.md
    },
    pill: {
      borderRadius: tokens.borderRadius.full
    },
    square: {
      borderRadius: tokens.borderRadius.sm
    }
  }
  
  return shapeMap[props.shape]
}

const iconStyles = computed(() => ({
  width: props.size === 'xs' ? '12px' : props.size === 'sm' ? '14px' : '16px',
  height: props.size === 'xs' ? '12px' : props.size === 'sm' ? '14px' : '16px',
  flexShrink: '0'
}))

const contentStyles = computed(() => ({
  flexShrink: '0'
}))

const closeButtonStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0',
  margin: '0',
  marginLeft: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: 'currentColor',
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  opacity: '0.7',
  transition: 'opacity 0.2s ease',
  width: props.size === 'xs' ? '12px' : '14px',
  height: props.size === 'xs' ? '12px' : '14px'
}))

const countStyles = computed(() => {
  const variantColors = {
    default: getColor('error.600'),
    primary: getColor('error.600'),
    secondary: getColor('error.600'),
    success: getColor('error.600'),
    warning: getColor('error.600'),
    error: getColor('warning.600'),
    info: getColor('error.600')
  }
  
  return {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    backgroundColor: variantColors[props.variant],
    color: 'white',
    fontSize: '10px',
    fontWeight: tokens.typography.fontWeight.bold,
    lineHeight: '16px',
    textAlign: 'center',
    borderRadius: tokens.borderRadius.full,
    border: '1px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// 事件处理
const handleClose = () => {
  if (!props.disabled) {
    emit('close')
  }
}

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.ds-badge {
  user-select: none;
}

.badge-close:hover {
  opacity: 1;
}

.badge-loading {
  position: relative;
}

.badge-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: badge-spin 1s linear infinite;
}

@keyframes badge-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 悬停效果 */
.ds-badge:not(.badge-disabled):hover {
  transform: translateY(-1px);
}

.badge-outline:not(.badge-disabled):hover {
  background-color: currentColor;
  color: white;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .badge-lg {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .ds-badge,
  .badge-close {
    transition: none !important;
    animation: none !important;
  }
  
  .badge-loading::after {
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-badge {
    border: 2px solid currentColor !important;
  }
}

/* 打印样式 */
@media print {
  .ds-badge {
    background: transparent !important;
    color: black !important;
    border: 1px solid black !important;
  }
}
</style>
