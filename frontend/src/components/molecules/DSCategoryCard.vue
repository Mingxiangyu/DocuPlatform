<!--
  设计系统分类卡片组件 - DSCategoryCard
  基于设计令牌的分类导航卡片，支持多种样式和动画效果
-->

<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="cardStyles"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    :tabindex="clickable ? 0 : -1"
    :role="clickable ? 'button' : 'article'"
    :aria-label="ariaLabel"
  >
    <!-- 背景装饰 -->
    <div class="category-background" :style="backgroundStyles">
      <div class="category-pattern" :style="patternStyles" />
    </div>
    
    <!-- 图标容器 -->
    <div class="category-icon-container" :style="iconContainerStyles">
      <div class="category-icon" :style="iconStyles">
        <slot name="icon">
          <svg 
            v-if="!$slots.icon" 
            :style="defaultIconStyles"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
          </svg>
        </slot>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="category-content" :style="contentStyles">
      <!-- 标题 -->
      <h3 class="category-title" :style="titleStyles">
        {{ title }}
      </h3>
      
      <!-- 描述 (只在非minimal模式下显示) -->
      <p v-if="description && variant !== 'minimal'" class="category-description" :style="descriptionStyles">
        {{ description }}
      </p>

      <!-- 统计信息 -->
      <div v-if="shouldShowStats" class="category-stats" :style="statsStyles">
        <!-- minimal模式下只显示文档数量 -->
        <div v-if="variant === 'minimal'" class="stat-item" :style="statItemStyles">
          <span class="stat-label" :style="statLabelStyles">{{ articleCount }} 篇文档</span>
        </div>
        <!-- 其他模式显示完整统计 -->
        <template v-else>
          <div class="stat-item" :style="statItemStyles">
            <span class="stat-number" :style="statNumberStyles">{{ articleCount }}</span>
            <span class="stat-label" :style="statLabelStyles">篇文章</span>
          </div>
          <div v-if="authorCount" class="stat-item" :style="statItemStyles">
            <span class="stat-number" :style="statNumberStyles">{{ authorCount }}</span>
            <span class="stat-label" :style="statLabelStyles">位作者</span>
          </div>
        </template>
      </div>

      <!-- 标签 (只在非minimal模式下显示) -->
      <div v-if="tags && tags.length > 0 && variant !== 'minimal'" class="category-tags" :style="tagsStyles">
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="category-tag"
          :style="tagStyles"
        >
          {{ tag }}
        </span>
        <span v-if="tags.length > maxTags" class="tag-more" :style="tagMoreStyles">
          +{{ tags.length - maxTags }}
        </span>
      </div>
    </div>
    
    <!-- 悬停指示器 -->
    <div 
      v-if="showHoverIndicator" 
      class="hover-indicator"
      :style="hoverIndicatorStyles"
    >
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <!-- 加载状态覆盖层 -->
    <div 
      v-if="loading" 
      class="category-loading"
      :style="loadingStyles"
    >
      <div class="loading-spinner" :style="spinnerStyles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDesignTokens, useAnimation, useScrollTrigger } from '../../design-system/composables'

// 组件属性接口
interface Props {
  title: string
  description?: string
  category: 'frontend' | 'backend' | 'mobile' | 'design' | 'devops' | 'ai'
  articleCount?: number
  authorCount?: number
  tags?: string[]
  maxTags?: number
  clickable?: boolean
  loading?: boolean
  showStats?: boolean
  showHoverIndicator?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'featured'
  animation?: boolean
  scrollAnimation?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 3,
  clickable: true,
  loading: false,
  showStats: true,
  showHoverIndicator: true,
  size: 'md',
  variant: 'default',
  animation: true,
  scrollAnimation: false,
  ariaLabel: '分类卡片'
})

// 事件定义
const emit = defineEmits<{
  click: [category: string]
  mouseenter: [event: MouseEvent]
  mouseleave: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

// 设计令牌和动画
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const cardRef = ref<HTMLElement | null>(null)

// 动画控制
const hoverAnimation = useAnimation('categoryCardHover', {
  duration: tokens.animations.duration.normal,
  easing: tokens.animations.easing.smooth
})

// 滚动动画
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.2,
  triggerOnce: true
})

// 状态管理
const isHovered = ref(false)
const isFocused = ref(false)

// 分类配置
const categoryConfig = computed(() => {
  const configs = {
    frontend: {
      color: getColor('primary.600'),
      background: getColor('primary.50'),
      border: getColor('primary.200'),
      gradient: tokens.colors.gradients.category.frontend
    },
    backend: {
      color: getColor('success.600'),
      background: getColor('success.50'),
      border: getColor('success.200'),
      gradient: tokens.colors.gradients.category.backend
    },
    database: {
      color: getColor('blue.600'),
      background: getColor('blue.50'),
      border: getColor('blue.200'),
      gradient: tokens.colors.gradients.category.backend
    },
    mobile: {
      color: getColor('info.600'),
      background: getColor('info.50'),
      border: getColor('info.200'),
      gradient: tokens.colors.gradients.category.mobile
    },
    cloud: {
      color: getColor('indigo.600'),
      background: getColor('indigo.50'),
      border: getColor('indigo.200'),
      gradient: tokens.colors.gradients.category.devops
    },
    security: {
      color: getColor('red.600'),
      background: getColor('red.50'),
      border: getColor('red.200'),
      gradient: tokens.colors.gradients.category.devops
    },
    design: {
      color: getColor('warning.600'),
      background: getColor('warning.50'),
      border: getColor('warning.200'),
      gradient: tokens.colors.gradients.category.design
    },
    devops: {
      color: getColor('error.600'),
      background: getColor('error.50'),
      border: getColor('error.200'),
      gradient: tokens.colors.gradients.category.devops
    },
    ai: {
      color: getColor('purple.600'),
      background: getColor('purple.50'),
      border: getColor('purple.200'),
      gradient: tokens.colors.gradients.category.ai
    }
  }

  return configs[props.category] || configs.frontend
})

// 显示的标签
const displayTags = computed(() =>
  props.tags?.slice(0, props.maxTags) || []
)

// 是否显示统计信息
const shouldShowStats = computed(() => {
  // minimal模式下总是显示文档数量
  if (props.variant === 'minimal') {
    return true
  }
  // 其他模式根据showStats属性决定
  return props.showStats
})

// 样式计算
const cardClasses = computed(() => {
  const baseClasses = [
    'ds-category-card',
    `ds-category-${props.category}`,
    `ds-category-${props.size}`,
    `ds-category-${props.variant}`,
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'ease-out'
  ]

  if (props.clickable) {
    baseClasses.push('cursor-pointer', 'hover:shadow-large', 'hover:-translate-y-1')
  }

  if (props.animation) {
    baseClasses.push('transform-gpu')
  }

  if (props.scrollAnimation && isVisible.value) {
    baseClasses.push('animate-fade-in-up')
  }

  if (isHovered.value || isFocused.value) {
    baseClasses.push('ring-2', 'ring-opacity-50')
  }

  return baseClasses
})

const cardStyles = computed(() => {
  // minimal变体使用更紧凑的尺寸，并采用垂直居中布局
  const sizeMap = props.variant === 'minimal' ? {
    sm: {
      padding: getSpacing(4),
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    md: {
      padding: getSpacing(5),
      minHeight: '140px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    lg: {
      padding: getSpacing(6),
      minHeight: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  } : {
    sm: {
      padding: getSpacing(4),
      minHeight: '120px'
    },
    md: {
      padding: getSpacing(6),
      minHeight: '160px'
    },
    lg: {
      padding: getSpacing(8),
      minHeight: '200px'
    }
  }

  const styles: Record<string, string> = {
    backgroundColor: 'white',
    border: `1px solid ${getColor('gray.200')}`,
    borderRadius: tokens.borderRadius.xl,
    boxShadow: getShadow('soft'),
    ...sizeMap[props.size]
  }

  if (isHovered.value || isFocused.value) {
    styles.borderColor = categoryConfig.value.color
    styles.ringColor = categoryConfig.value.color
    styles.boxShadow = getShadow('large')
  }

  return styles
})

// 背景样式
const backgroundStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: categoryConfig.value.gradient,
  opacity: isHovered.value ? '0.1' : '0.05',
  transition: `opacity ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
}))

const patternStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundImage: `radial-gradient(circle at 20% 80%, ${categoryConfig.value.color}20 0%, transparent 50%), 
                    radial-gradient(circle at 80% 20%, ${categoryConfig.value.color}15 0%, transparent 50%)`,
  opacity: isHovered.value ? '1' : '0.5',
  transition: `opacity ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
}))

// 图标样式
const iconContainerStyles = computed(() => ({
  position: 'relative',
  zIndex: '2',
  marginBottom: props.variant === 'minimal' ? getSpacing(3) : getSpacing(4),
  display: 'flex',
  justifyContent: 'center'
}))

const iconStyles = computed(() => {
  // minimal变体使用适中的图标尺寸，符合原型设计
  const sizeMap = props.variant === 'minimal' ? {
    sm: '32px',
    md: '40px',
    lg: '48px'
  } : {
    sm: getSpacing(8),
    md: getSpacing(10),
    lg: getSpacing(12)
  }

  return {
    width: sizeMap[props.size],
    height: sizeMap[props.size],
    backgroundColor: 'transparent',
    color: categoryConfig.value.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`,
    transform: isHovered.value ? 'scale(1.1)' : 'scale(1)'
  }
})

const defaultIconStyles = computed(() => ({
  width: '60%',
  height: '60%'
}))

// 内容样式
const contentStyles = computed(() => ({
  position: 'relative',
  zIndex: '2'
}))

const titleStyles = computed(() => {
  const sizeMap = props.variant === 'minimal' ? {
    sm: tokens.typography.fontSize.sm,
    md: tokens.typography.fontSize.base,
    lg: tokens.typography.fontSize.lg
  } : {
    sm: tokens.typography.fontSize.base,
    md: tokens.typography.fontSize.lg,
    lg: tokens.typography.fontSize.xl
  }

  return {
    fontSize: sizeMap[props.size][0],
    lineHeight: sizeMap[props.size][1],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: getColor('gray.900'),
    marginBottom: props.variant === 'minimal' ? getSpacing(2) : getSpacing(2),
    margin: '0',
    textAlign: props.variant === 'minimal' ? 'center' : 'left'
  }
})

const descriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  lineHeight: tokens.typography.fontSize.sm[1],
  color: getColor('gray.600'),
  marginBottom: getSpacing(3),
  margin: '0'
}))

// 统计样式
const statsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(4),
  marginBottom: props.variant === 'minimal' ? '0' : getSpacing(3),
  justifyContent: props.variant === 'minimal' ? 'center' : 'flex-start'
}))

const statItemStyles = computed(() => ({
  display: 'flex',
  flexDirection: props.variant === 'minimal' ? 'row' : 'column',
  alignItems: 'center',
  gap: props.variant === 'minimal' ? getSpacing(1) : '0'
}))

const statNumberStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: categoryConfig.value.color,
  lineHeight: '1'
}))

const statLabelStyles = computed(() => ({
  fontSize: props.variant === 'minimal' ? tokens.typography.fontSize.sm[0] : tokens.typography.fontSize.xs[0],
  color: getColor('gray.500'),
  marginTop: props.variant === 'minimal' ? '0' : getSpacing(1),
  textAlign: 'center'
}))

// 标签样式
const tagsStyles = computed(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: getSpacing(2)
}))

const tagStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  backgroundColor: categoryConfig.value.background,
  color: categoryConfig.value.color,
  borderRadius: tokens.borderRadius.full,
  border: `1px solid ${categoryConfig.value.border}`
}))

const tagMoreStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.500'),
  fontWeight: tokens.typography.fontWeight.medium
}))

// 悬停指示器样式
const hoverIndicatorStyles = computed(() => ({
  position: 'absolute',
  top: getSpacing(4),
  right: getSpacing(4),
  color: categoryConfig.value.color,
  opacity: isHovered.value ? '1' : '0',
  transform: isHovered.value ? 'translateX(0)' : 'translateX(-8px)',
  transition: `all ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`,
  zIndex: '3'
}))

// 加载样式
const loadingStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '10',
  borderRadius: 'inherit'
}))

const spinnerStyles = computed(() => ({
  width: getSpacing(6),
  height: getSpacing(6),
  border: `2px solid ${categoryConfig.value.color}20`,
  borderTop: `2px solid ${categoryConfig.value.color}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}))

// 事件处理
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click', props.category)
  }
}

const handleMouseEnter = async (event: MouseEvent) => {
  isHovered.value = true
  
  if (props.animation && cardRef.value) {
    hoverAnimation.element.value = cardRef.value
    await hoverAnimation.play()
  }
  
  emit('mouseenter', event)
}

const handleMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
  emit('mouseleave', event)
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
  if (props.scrollAnimation && cardRef.value) {
    observe(cardRef.value)
  }
  
  if (props.animation && cardRef.value) {
    hoverAnimation.element.value = cardRef.value
  }
})
</script>

<style scoped>
.ds-category-card {
  position: relative;
  will-change: transform, box-shadow;
}

.category-background {
  pointer-events: none;
}

.category-pattern {
  pointer-events: none;
}

/* 动画关键帧 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-category-card {
    margin: 0.5rem;
  }
  
  .category-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    flex-direction: row;
    gap: 0.5rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-category-card {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
  
  .category-background,
  .category-pattern,
  .category-icon,
  .hover-indicator {
    transition: none !important;
  }
  
  .loading-spinner {
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .ds-category-card {
    border-width: 2px;
  }
}
</style>
