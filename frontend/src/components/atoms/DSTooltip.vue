<!--
  设计系统工具提示组件 - DSTooltip
  企业级工具提示组件，支持多种位置、触发方式和样式配置
-->

<template>
  <div
    class="tooltip-wrapper"
    :style="wrapperStyles"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
  >
    <!-- 触发元素 -->
    <div
      ref="triggerRef"
      class="tooltip-trigger"
      :style="triggerStyles"
      :tabindex="disabled ? -1 : 0"
      :aria-describedby="visible ? tooltipId : undefined"
    >
      <slot />
    </div>

    <!-- 工具提示内容 -->
    <teleport to="body">
      <transition
        name="tooltip"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="visible"
          ref="tooltipRef"
          :id="tooltipId"
          class="tooltip-content"
          :style="tooltipStyles"
          role="tooltip"
          :aria-hidden="!visible"
        >
          <!-- 箭头 -->
          <div
            v-if="showArrow"
            class="tooltip-arrow"
            :style="arrowStyles"
          ></div>
          
          <!-- 内容 -->
          <div class="tooltip-inner" :style="innerStyles">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 位置类型
type TooltipPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'

// 触发方式
type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual'

// 组件属性
interface Props {
  // 基础属性
  content?: string
  placement?: TooltipPlacement
  trigger?: TooltipTrigger[]
  
  // 样式配置
  variant?: 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  maxWidth?: string
  
  // 行为控制
  disabled?: boolean
  showArrow?: boolean
  openDelay?: number
  closeDelay?: number
  
  // 无障碍访问
  tooltipId?: string
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  trigger: () => ['hover', 'focus'],
  variant: 'dark',
  size: 'md',
  maxWidth: '200px',
  disabled: false,
  showArrow: true,
  openDelay: 100,
  closeDelay: 100,
  tooltipId: 'tooltip'
})

// 组件事件
interface Emits {
  (e: 'show'): void
  (e: 'hide'): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const visible = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const showTimer = ref<NodeJS.Timeout>()
const hideTimer = ref<NodeJS.Timeout>()

// 样式计算
const wrapperStyles = computed(() => ({
  display: 'inline-block',
  position: 'relative'
}))

const triggerStyles = computed(() => ({
  outline: 'none'
}))

const tooltipStyles = computed(() => {
  if (!triggerRef.value) return {}
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const position = calculatePosition(triggerRect)
  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()
  
  return {
    position: 'absolute',
    zIndex: '1200',
    ...position,
    ...variantStyles,
    ...sizeStyles,
    maxWidth: props.maxWidth,
    borderRadius: tokens.borderRadius.md,
    boxShadow: getShadow('large'),
    pointerEvents: 'none',
    wordWrap: 'break-word'
  }
})

const calculatePosition = (triggerRect: DOMRect) => {
  const spacing = 8 // 与触发元素的间距
  const scrollX = window.pageXOffset
  const scrollY = window.pageYOffset
  
  let top = 0
  let left = 0
  
  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollY - spacing
      left = triggerRect.left + scrollX + triggerRect.width / 2
      break
    case 'top-start':
      top = triggerRect.top + scrollY - spacing
      left = triggerRect.left + scrollX
      break
    case 'top-end':
      top = triggerRect.top + scrollY - spacing
      left = triggerRect.right + scrollX
      break
    case 'bottom':
      top = triggerRect.bottom + scrollY + spacing
      left = triggerRect.left + scrollX + triggerRect.width / 2
      break
    case 'bottom-start':
      top = triggerRect.bottom + scrollY + spacing
      left = triggerRect.left + scrollX
      break
    case 'bottom-end':
      top = triggerRect.bottom + scrollY + spacing
      left = triggerRect.right + scrollX
      break
    case 'left':
      top = triggerRect.top + scrollY + triggerRect.height / 2
      left = triggerRect.left + scrollX - spacing
      break
    case 'left-start':
      top = triggerRect.top + scrollY
      left = triggerRect.left + scrollX - spacing
      break
    case 'left-end':
      top = triggerRect.bottom + scrollY
      left = triggerRect.left + scrollX - spacing
      break
    case 'right':
      top = triggerRect.top + scrollY + triggerRect.height / 2
      left = triggerRect.right + scrollX + spacing
      break
    case 'right-start':
      top = triggerRect.top + scrollY
      left = triggerRect.right + scrollX + spacing
      break
    case 'right-end':
      top = triggerRect.bottom + scrollY
      left = triggerRect.right + scrollX + spacing
      break
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: getTransform()
  }
}

const getTransform = () => {
  const placement = props.placement
  
  if (placement.includes('top') || placement.includes('bottom')) {
    if (placement.endsWith('-start')) return 'translateY(-100%)'
    if (placement.endsWith('-end')) return 'translate(-100%, -100%)'
    return 'translate(-50%, -100%)'
  }
  
  if (placement.includes('left') || placement.includes('right')) {
    if (placement.endsWith('-start')) return 'translate(-100%, 0)'
    if (placement.endsWith('-end')) return 'translate(-100%, -100%)'
    return 'translate(-100%, -50%)'
  }
  
  return 'translate(-50%, -100%)'
}

const getVariantStyles = () => {
  const variantMap = {
    dark: {
      backgroundColor: getColor('gray.900'),
      color: 'white',
      border: 'none'
    },
    light: {
      backgroundColor: 'white',
      color: getColor('gray.900'),
      border: `1px solid ${getColor('gray.200')}`
    },
    primary: {
      backgroundColor: getColor('primary.600'),
      color: 'white',
      border: 'none'
    },
    success: {
      backgroundColor: getColor('success.600'),
      color: 'white',
      border: 'none'
    },
    warning: {
      backgroundColor: getColor('warning.600'),
      color: 'white',
      border: 'none'
    },
    error: {
      backgroundColor: getColor('error.600'),
      color: 'white',
      border: 'none'
    }
  }
  
  return variantMap[props.variant]
}

const getSizeStyles = () => {
  const sizeMap = {
    sm: {
      padding: `${getSpacing(1)} ${getSpacing(2)}`,
      fontSize: tokens.typography.fontSize.xs[0]
    },
    md: {
      padding: `${getSpacing(2)} ${getSpacing(3)}`,
      fontSize: tokens.typography.fontSize.sm[0]
    },
    lg: {
      padding: `${getSpacing(3)} ${getSpacing(4)}`,
      fontSize: tokens.typography.fontSize.base[0]
    }
  }
  
  return sizeMap[props.size]
}

const arrowStyles = computed(() => {
  const variantStyles = getVariantStyles()
  const arrowSize = 6
  
  let borderColor = 'transparent'
  let borderWidth = `${arrowSize}px`
  let position = {}
  
  const placement = props.placement
  
  if (placement.startsWith('top')) {
    borderColor = `${variantStyles.backgroundColor} transparent transparent transparent`
    position = {
      bottom: `-${arrowSize}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    }
  } else if (placement.startsWith('bottom')) {
    borderColor = `transparent transparent ${variantStyles.backgroundColor} transparent`
    position = {
      top: `-${arrowSize}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    }
  } else if (placement.startsWith('left')) {
    borderColor = `transparent transparent transparent ${variantStyles.backgroundColor}`
    position = {
      right: `-${arrowSize}px`,
      top: '50%',
      transform: 'translateY(-50%)'
    }
  } else if (placement.startsWith('right')) {
    borderColor = `transparent ${variantStyles.backgroundColor} transparent transparent`
    position = {
      left: `-${arrowSize}px`,
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }
  
  return {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth,
    borderColor,
    ...position
  }
})

const innerStyles = computed(() => ({
  fontFamily: tokens.typography.fontFamily.sans.join(', '),
  fontWeight: tokens.typography.fontWeight.medium,
  lineHeight: tokens.typography.lineHeight.relaxed
}))

// 事件处理
const show = () => {
  if (props.disabled || visible.value) return
  
  clearTimeout(hideTimer.value)
  
  if (props.openDelay > 0) {
    showTimer.value = setTimeout(() => {
      visible.value = true
      emit('show')
    }, props.openDelay)
  } else {
    visible.value = true
    emit('show')
  }
}

const hide = () => {
  if (!visible.value) return
  
  clearTimeout(showTimer.value)
  
  if (props.closeDelay > 0) {
    hideTimer.value = setTimeout(() => {
      visible.value = false
      emit('hide')
    }, props.closeDelay)
  } else {
    visible.value = false
    emit('hide')
  }
}

const handleMouseEnter = () => {
  if (props.trigger.includes('hover')) {
    show()
  }
}

const handleMouseLeave = () => {
  if (props.trigger.includes('hover')) {
    hide()
  }
}

const handleFocus = () => {
  if (props.trigger.includes('focus')) {
    show()
  }
}

const handleBlur = () => {
  if (props.trigger.includes('focus')) {
    hide()
  }
}

const handleClick = () => {
  if (props.trigger.includes('click')) {
    if (visible.value) {
      hide()
    } else {
      show()
    }
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Node
  if (
    visible.value &&
    triggerRef.value &&
    tooltipRef.value &&
    !triggerRef.value.contains(target) &&
    !tooltipRef.value.contains(target)
  ) {
    hide()
  }
}

// 动画钩子
const onEnter = (el: Element) => {
  // 进入动画开始
}

const onAfterEnter = (el: Element) => {
  // 进入动画完成
}

const onLeave = (el: Element) => {
  // 离开动画开始
}

const onAfterLeave = (el: Element) => {
  // 离开动画完成
}

// 生命周期
onMounted(() => {
  if (props.trigger.includes('click')) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(showTimer.value)
  clearTimeout(hideTimer.value)
})

// 暴露方法
defineExpose({
  show,
  hide,
  visible: computed(() => visible.value)
})
</script>

<style scoped>
/* 工具提示动画 */
.tooltip-enter-active {
  transition: all 0.2s ease;
}

.tooltip-leave-active {
  transition: all 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 触发元素样式 */
.tooltip-trigger {
  outline: none;
}

.tooltip-trigger:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .tooltip-content {
    max-width: calc(100vw - 2rem) !important;
    left: 1rem !important;
    right: 1rem !important;
    transform: none !important;
  }
  
  .tooltip-arrow {
    display: none;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: none !important;
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .tooltip-content {
    border: 2px solid currentColor !important;
  }
}

/* 打印样式 */
@media print {
  .tooltip-content {
    display: none;
  }
}
</style>
