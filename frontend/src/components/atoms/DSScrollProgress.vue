<!--
  设计系统滚动进度条组件 - DSScrollProgress
  基于设计令牌的智能滚动进度指示器，支持多种显示模式和动画效果
-->

<template>
  <div
    v-if="visible"
    ref="progressRef"
    :class="progressClasses"
    :style="progressStyles"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <!-- 进度条背景 -->
    <div
      v-if="showBackground"
      class="progress-background"
      :style="backgroundStyles"
    />
    
    <!-- 进度条填充 -->
    <div
      class="progress-fill"
      :style="fillStyles"
    >
      <!-- 渐变效果 -->
      <div
        v-if="gradient"
        class="progress-gradient"
        :style="gradientStyles"
      />
      
      <!-- 动画光效 -->
      <div
        v-if="animated && progress > 0"
        class="progress-shine"
        :style="shineStyles"
      />
    </div>
    
    <!-- 进度文本 -->
    <div
      v-if="showText"
      class="progress-text"
      :style="textStyles"
    >
      {{ Math.round(progress) }}%
    </div>
    
    <!-- 里程碑标记 -->
    <div
      v-if="showMilestones && milestones.length"
      class="progress-milestones"
      :style="milestonesContainerStyles"
    >
      <div
        v-for="milestone in milestones"
        :key="milestone.value"
        class="milestone"
        :class="{ 'milestone-reached': progress >= milestone.value }"
        :style="getMilestoneStyles(milestone)"
        :title="milestone.label"
      >
        <div class="milestone-dot" :style="milestoneDotStyles" />
        <div
          v-if="milestone.label && showMilestoneLabels"
          class="milestone-label"
          :style="milestoneLabelStyles"
        >
          {{ milestone.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useDesignTokens, useScrollProgress } from '../../design-system/composables'
import { useThrottleFn } from '@vueuse/core'

// 里程碑接口
interface Milestone {
  value: number
  label?: string
  color?: string
}

// 组件属性接口
interface Props {
  // 基础配置
  position?: 'top' | 'bottom' | 'left' | 'right'
  height?: number | string
  width?: number | string
  color?: string
  backgroundColor?: string
  
  // 显示配置
  visible?: boolean
  showBackground?: boolean
  showText?: boolean
  showMilestones?: boolean
  showMilestoneLabels?: boolean
  
  // 动画配置
  animated?: boolean
  gradient?: boolean
  smooth?: boolean
  
  // 数据配置
  milestones?: Milestone[]
  threshold?: number
  
  // 样式配置
  borderRadius?: number | string
  opacity?: number
  zIndex?: number
  
  // 可访问性
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  height: 3,
  width: '100%',
  color: '',
  backgroundColor: '',
  visible: true,
  showBackground: true,
  showText: false,
  showMilestones: false,
  showMilestoneLabels: false,
  animated: true,
  gradient: true,
  smooth: true,
  milestones: () => [],
  threshold: 0,
  borderRadius: 0,
  opacity: 1,
  zIndex: 1000,
  ariaLabel: '页面滚动进度'
})

// 事件定义
const emit = defineEmits<{
  progress: [value: number]
  milestone: [milestone: Milestone]
  complete: []
}>()

// 设计令牌和组合式API
const { tokens, getColor, getSpacing } = useDesignTokens()
const { progress: scrollProgress, isScrolling } = useScrollProgress()
const progressRef = ref<HTMLElement | null>(null)

// 当前进度
const progress = computed(() => {
  return Math.max(0, Math.min(100, scrollProgress.value))
})

// 进度颜色
const progressColor = computed(() => {
  return props.color || getColor('primary.600')
})

// 背景颜色
const progressBackgroundColor = computed(() => {
  return props.backgroundColor || getColor('gray.200')
})

// 进度条类名
const progressClasses = computed(() => [
  'ds-scroll-progress',
  `ds-scroll-progress-${props.position}`,
  {
    'ds-scroll-progress-animated': props.animated,
    'ds-scroll-progress-scrolling': isScrolling.value,
    'ds-scroll-progress-gradient': props.gradient
  }
])

// 进度条样式
const progressStyles = computed(() => {
  const isHorizontal = props.position === 'top' || props.position === 'bottom'
  
  const baseStyles: Record<string, string> = {
    position: 'fixed',
    zIndex: props.zIndex.toString(),
    opacity: props.opacity.toString(),
    pointerEvents: 'none'
  }

  // 位置样式
  if (props.position === 'top') {
    baseStyles.top = '0'
    baseStyles.left = '0'
    baseStyles.right = '0'
    baseStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  } else if (props.position === 'bottom') {
    baseStyles.bottom = '0'
    baseStyles.left = '0'
    baseStyles.right = '0'
    baseStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  } else if (props.position === 'left') {
    baseStyles.top = '0'
    baseStyles.left = '0'
    baseStyles.bottom = '0'
    baseStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  } else if (props.position === 'right') {
    baseStyles.top = '0'
    baseStyles.right = '0'
    baseStyles.bottom = '0'
    baseStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  // 圆角
  if (props.borderRadius) {
    baseStyles.borderRadius = typeof props.borderRadius === 'number' 
      ? `${props.borderRadius}px` 
      : props.borderRadius
  }

  return baseStyles
})

// 背景样式
const backgroundStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: progressBackgroundColor.value,
  borderRadius: 'inherit'
}))

// 填充样式
const fillStyles = computed(() => {
  const isHorizontal = props.position === 'top' || props.position === 'bottom'
  
  const styles: Record<string, string> = {
    position: 'relative',
    backgroundColor: progressColor.value,
    borderRadius: 'inherit',
    transition: props.smooth ? 'all 0.3s ease-out' : 'none',
    overflow: 'hidden'
  }

  if (isHorizontal) {
    styles.height = '100%'
    styles.width = `${progress.value}%`
  } else {
    styles.width = '100%'
    styles.height = `${progress.value}%`
    styles.marginTop = 'auto'
  }

  return styles
})

// 渐变样式
const gradientStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: tokens.colors.gradients.progress || `linear-gradient(90deg, ${progressColor.value}, ${getColor('primary.400')})`,
  borderRadius: 'inherit'
}))

// 光效样式
const shineStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  right: '0',
  bottom: '0',
  width: '20px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
  animation: props.animated ? 'progress-shine 2s ease-in-out infinite' : 'none',
  borderRadius: 'inherit'
}))

// 文本样式
const textStyles = computed(() => ({
  position: 'absolute',
  top: '50%',
  right: getSpacing(2),
  transform: 'translateY(-50%)',
  fontSize: tokens.typography.fontSize.xs[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: 'white',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  whiteSpace: 'nowrap'
}))

// 里程碑容器样式
const milestonesContainerStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  pointerEvents: 'none'
}))

// 里程碑样式
const getMilestoneStyles = (milestone: Milestone) => {
  const isHorizontal = props.position === 'top' || props.position === 'bottom'
  
  const styles: Record<string, string> = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)'
  }

  if (isHorizontal) {
    styles.left = `${milestone.value}%`
    styles.top = '50%'
  } else {
    styles.top = `${milestone.value}%`
    styles.left = '50%'
  }

  return styles
}

// 里程碑点样式
const milestoneDotStyles = computed(() => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'white',
  border: `1px solid ${progressColor.value}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
}))

// 里程碑标签样式
const milestoneLabelStyles = computed(() => ({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: getSpacing(1),
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.600'),
  whiteSpace: 'nowrap',
  pointerEvents: 'none'
}))

// 监听进度变化
watch(progress, (newProgress, oldProgress) => {
  emit('progress', newProgress)
  
  // 检查里程碑
  props.milestones.forEach(milestone => {
    if (oldProgress < milestone.value && newProgress >= milestone.value) {
      emit('milestone', milestone)
    }
  })
  
  // 检查完成
  if (oldProgress < 100 && newProgress >= 100) {
    emit('complete')
  }
}, { immediate: true })
</script>

<style scoped>
.ds-scroll-progress {
  will-change: transform;
}

.progress-fill {
  will-change: width, height;
}

/* 动画关键帧 */
@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 滚动时的增强效果 */
.ds-scroll-progress-scrolling .progress-fill {
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
}

/* 里程碑动画 */
.milestone {
  transition: all 0.3s ease;
}

.milestone-reached .milestone-dot {
  background-color: var(--color-primary-500);
  transform: scale(1.2);
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .ds-scroll-progress,
  .progress-fill,
  .milestone {
    transition: none !important;
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .progress-fill {
    border: 1px solid currentColor;
  }
}
</style>
