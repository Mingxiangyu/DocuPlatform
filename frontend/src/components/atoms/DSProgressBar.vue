<!--
  设计系统进度条组件 - DSProgressBar
  基于设计令牌的完整进度条系统，支持多种变体和滚动进度功能
-->

<template>
  <div
    ref="progressRef"
    :class="progressClasses"
    :style="progressStyles"
    :role="role"
    :aria-valuenow="normalizedProgress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <!-- 背景轨道 -->
    <div class="progress-track" :style="trackStyles">
      <!-- 进度填充 -->
      <div 
        class="progress-fill"
        :class="fillClasses"
        :style="fillStyles"
      >
        <!-- 动画条纹 -->
        <div 
          v-if="striped" 
          class="progress-stripes"
          :style="stripesStyles"
        />
        
        <!-- 发光效果 -->
        <div 
          v-if="glow" 
          class="progress-glow"
          :style="glowStyles"
        />
      </div>
      
      <!-- 缓冲进度（用于视频等场景） -->
      <div 
        v-if="bufferProgress !== undefined" 
        class="progress-buffer"
        :style="bufferStyles"
      />
    </div>
    
    <!-- 进度标签 -->
    <div 
      v-if="showLabel" 
      class="progress-label"
      :class="labelClasses"
      :style="labelStyles"
    >
      <slot name="label" :progress="normalizedProgress">
        {{ labelText }}
      </slot>
    </div>
    
    <!-- 步骤指示器（用于多步骤进度） -->
    <div 
      v-if="steps && steps.length > 0" 
      class="progress-steps"
      :style="stepsStyles"
    >
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="progress-step"
        :class="stepClasses(index)"
        :style="stepStyles(index)"
        @click="handleStepClick(index)"
      >
        <div class="step-indicator" :style="stepIndicatorStyles(index)">
          <span v-if="step.icon" class="step-icon">{{ step.icon }}</span>
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>
        <span v-if="step.label" class="step-label" :style="stepLabelStyles(index)">
          {{ step.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useDesignTokens, useScrollProgress } from '../../design-system/composables'

// 步骤接口
interface ProgressStep {
  label?: string
  icon?: string
  completed?: boolean
}

// 组件属性接口
interface Props {
  progress?: number
  bufferProgress?: number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  position?: 'static' | 'fixed-top' | 'fixed-bottom' | 'sticky-top'
  animated?: boolean
  striped?: boolean
  glow?: boolean
  rounded?: boolean
  showLabel?: boolean
  labelPosition?: 'inside' | 'outside' | 'top' | 'bottom'
  labelFormat?: 'percentage' | 'fraction' | 'custom'
  steps?: ProgressStep[]
  clickableSteps?: boolean
  scrollProgress?: boolean
  smoothTransition?: boolean
  role?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  variant: 'default',
  size: 'md',
  position: 'static',
  animated: true,
  striped: false,
  glow: false,
  rounded: true,
  showLabel: false,
  labelPosition: 'outside',
  labelFormat: 'percentage',
  clickableSteps: false,
  scrollProgress: false,
  smoothTransition: true,
  role: 'progressbar',
  ariaLabel: '进度指示器'
})

// 事件定义
const emit = defineEmits<{
  stepClick: [index: number, step: ProgressStep]
  progressChange: [progress: number]
}>()

// 设计令牌和滚动进度
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const { progress: scrollProgressValue } = useScrollProgress()
const progressRef = ref<HTMLElement | null>(null)

// 计算实际进度值
const normalizedProgress = computed(() => {
  if (props.scrollProgress) {
    return Math.min(100, Math.max(0, scrollProgressValue.value))
  }
  return Math.min(100, Math.max(0, props.progress))
})

// 监听进度变化
watch(normalizedProgress, (newProgress) => {
  emit('progressChange', newProgress)
})

// 样式计算
const progressClasses = computed(() => {
  const baseClasses = [
    'ds-progress',
    `ds-progress-${props.variant}`,
    `ds-progress-${props.size}`,
    `ds-progress-${props.position}`
  ]

  if (props.animated) {
    baseClasses.push('ds-progress-animated')
  }

  if (props.rounded) {
    baseClasses.push('ds-progress-rounded')
  }

  if (props.steps && props.steps.length > 0) {
    baseClasses.push('ds-progress-stepped')
  }

  return baseClasses
})

const progressStyles = computed(() => {
  const styles: Record<string, string> = {}

  // 位置样式
  if (props.position.includes('fixed')) {
    styles.position = 'fixed'
    styles.left = '0'
    styles.right = '0'
    styles.zIndex = '1000'
    
    if (props.position === 'fixed-top') {
      styles.top = '0'
    } else if (props.position === 'fixed-bottom') {
      styles.bottom = '0'
    }
  } else if (props.position === 'sticky-top') {
    styles.position = 'sticky'
    styles.top = '0'
    styles.zIndex = '100'
  }

  return styles
})

// 轨道样式
const trackStyles = computed(() => {
  const sizeMap = {
    xs: getSpacing(1),
    sm: getSpacing(2),
    md: getSpacing(3),
    lg: getSpacing(4),
    xl: getSpacing(6)
  }

  return {
    height: sizeMap[props.size],
    backgroundColor: getColor('gray.200'),
    borderRadius: props.rounded ? tokens.borderRadius.full : '0',
    overflow: 'hidden',
    position: 'relative'
  }
})

// 填充样式
const fillClasses = computed(() => {
  const classes = ['progress-fill-base']
  
  if (props.animated) {
    classes.push('progress-fill-animated')
  }
  
  return classes
})

const fillStyles = computed(() => {
  const variantColors = {
    default: getColor('primary.600'),
    success: getColor('success.600'),
    warning: getColor('warning.600'),
    error: getColor('error.600'),
    info: getColor('info.600'),
    gradient: tokens.colors.gradients.progress
  }

  const styles: Record<string, string> = {
    width: `${normalizedProgress.value}%`,
    height: '100%',
    background: variantColors[props.variant],
    borderRadius: 'inherit',
    position: 'relative',
    overflow: 'hidden'
  }

  if (props.smoothTransition) {
    styles.transition = `width ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
  }

  return styles
})

// 条纹样式
const stripesStyles = computed(() => ({
  background: `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.2) 10px,
    rgba(255, 255, 255, 0.2) 20px
  )`,
  animation: props.animated ? 'progress-stripes 1s linear infinite' : 'none'
}))

// 发光样式
const glowStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
  animation: props.animated ? 'progress-glow 2s ease-in-out infinite' : 'none'
}))

// 缓冲样式
const bufferStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  height: '100%',
  width: `${Math.min(100, Math.max(0, props.bufferProgress || 0))}%`,
  backgroundColor: getColor('gray.300'),
  borderRadius: 'inherit',
  zIndex: '1'
}))

// 标签样式
const labelClasses = computed(() => {
  const classes = ['progress-label-base']
  
  if (props.labelPosition === 'inside') {
    classes.push('progress-label-inside')
  }
  
  return classes
})

const labelStyles = computed(() => {
  const styles: Record<string, string> = {
    fontSize: tokens.typography.fontSize.sm[0],
    fontWeight: tokens.typography.fontWeight.medium,
    color: props.labelPosition === 'inside' ? 'white' : getColor('gray.700')
  }

  if (props.labelPosition === 'inside') {
    styles.position = 'absolute'
    styles.top = '50%'
    styles.left = '50%'
    styles.transform = 'translate(-50%, -50%)'
    styles.zIndex = '10'
    styles.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)'
  } else if (props.labelPosition === 'top') {
    styles.marginBottom = getSpacing(2)
  } else if (props.labelPosition === 'bottom') {
    styles.marginTop = getSpacing(2)
  } else {
    styles.marginLeft = getSpacing(3)
  }

  return styles
})

// 标签文本
const labelText = computed(() => {
  switch (props.labelFormat) {
    case 'percentage':
      return `${Math.round(normalizedProgress.value)}%`
    case 'fraction':
      return `${Math.round(normalizedProgress.value)}/100`
    default:
      return `${Math.round(normalizedProgress.value)}%`
  }
})

// 步骤样式
const stepsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: getSpacing(4)
}))

const stepClasses = (index: number) => {
  const classes = ['progress-step-base']
  
  if (props.clickableSteps) {
    classes.push('progress-step-clickable')
  }
  
  const step = props.steps?.[index]
  if (step?.completed || (normalizedProgress.value / 100) * (props.steps?.length || 1) > index) {
    classes.push('progress-step-completed')
  }
  
  return classes
}

const stepStyles = (index: number) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: props.clickableSteps ? 'pointer' : 'default'
})

const stepIndicatorStyles = (index: number) => {
  const step = props.steps?.[index]
  const isCompleted = step?.completed || (normalizedProgress.value / 100) * (props.steps?.length || 1) > index
  
  return {
    width: getSpacing(8),
    height: getSpacing(8),
    borderRadius: '50%',
    backgroundColor: isCompleted ? getColor('primary.600') : getColor('gray.300'),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.sm[0],
    fontWeight: tokens.typography.fontWeight.medium,
    transition: `all ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
  }
}

const stepLabelStyles = (index: number) => {
  const step = props.steps?.[index]
  const isCompleted = step?.completed || (normalizedProgress.value / 100) * (props.steps?.length || 1) > index
  
  return {
    marginTop: getSpacing(2),
    fontSize: tokens.typography.fontSize.xs[0],
    color: isCompleted ? getColor('primary.600') : getColor('gray.500'),
    textAlign: 'center',
    transition: `color ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
  }
}

// 事件处理
const handleStepClick = (index: number) => {
  if (props.clickableSteps && props.steps) {
    emit('stepClick', index, props.steps[index])
  }
}

// 组件挂载
onMounted(() => {
  // 如果是滚动进度条，确保滚动监听已启动
  if (props.scrollProgress) {
    // 滚动进度监听已在 useScrollProgress 中处理
  }
})
</script>

<style scoped>
.ds-progress {
  position: relative;
  width: 100%;
}

.progress-track {
  position: relative;
  width: 100%;
}

.progress-fill-base {
  position: relative;
  will-change: width;
}

.progress-fill-animated {
  transition: width var(--duration-normal, 300ms) var(--easing-smooth, ease);
}

.progress-label-base {
  display: inline-block;
  white-space: nowrap;
}

.progress-label-inside {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.progress-step-base {
  position: relative;
}

.progress-step-clickable {
  cursor: pointer;
  transition: transform var(--duration-fast, 150ms) var(--easing-smooth, ease);
}

.progress-step-clickable:hover {
  transform: scale(1.05);
}

.progress-step-completed .step-indicator {
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

/* 动画关键帧 */
@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}

@keyframes progress-glow {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .progress-step-base {
    min-width: 0;
    flex: 1;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .progress-fill-animated,
  .progress-step-clickable {
    transition: none !important;
  }
  
  .progress-stripes,
  .progress-glow {
    animation: none !important;
  }
}
</style>
