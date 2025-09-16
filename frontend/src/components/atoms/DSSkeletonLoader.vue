<!--
  设计系统骨架屏组件 - DSSkeletonLoader
  基于设计令牌的完整骨架屏系统，支持多种变体和高级加载动画
-->

<template>
  <div 
    ref="skeletonRef"
    :class="skeletonClasses"
    :style="skeletonStyles"
    :aria-label="ariaLabel"
    role="status"
    aria-live="polite"
  >
    <!-- 文本骨架 -->
    <div v-if="variant === 'text'" class="skeleton-text-container">
      <div 
        v-for="(line, index) in lines" 
        :key="index"
        class="skeleton-line"
        :class="lineClasses(index)"
        :style="lineStyles(index)"
      />
    </div>
    
    <!-- 卡片骨架 -->
    <div v-else-if="variant === 'card'" class="skeleton-card-container" :style="cardContainerStyles">
      <!-- 头像 -->
      <div 
        v-if="showAvatar" 
        class="skeleton-avatar"
        :class="avatarClasses"
        :style="avatarStyles"
      />
      
      <!-- 内容区域 -->
      <div class="skeleton-card-content" :style="cardContentStyles">
        <div class="skeleton-title" :style="titleStyles" />
        <div class="skeleton-description" :style="descriptionStyles" />
        <div class="skeleton-meta" :style="metaStyles" />
        
        <!-- 操作按钮 -->
        <div v-if="showActions" class="skeleton-actions" :style="actionsStyles">
          <div 
            v-for="action in actionCount" 
            :key="action"
            class="skeleton-button"
            :style="buttonStyles"
          />
        </div>
      </div>
    </div>
    
    <!-- 列表骨架 -->
    <div v-else-if="variant === 'list'" class="skeleton-list-container">
      <div 
        v-for="(item, index) in count" 
        :key="index"
        class="skeleton-list-item"
        :style="listItemStyles(index)"
      >
        <div 
          v-if="showAvatar" 
          class="skeleton-list-avatar"
          :style="listAvatarStyles"
        />
        <div class="skeleton-list-content">
          <div class="skeleton-list-title" :style="listTitleStyles" />
          <div class="skeleton-list-subtitle" :style="listSubtitleStyles" />
        </div>
      </div>
    </div>
    
    <!-- 表格骨架 -->
    <div v-else-if="variant === 'table'" class="skeleton-table-container">
      <!-- 表头 -->
      <div class="skeleton-table-header" :style="tableHeaderStyles">
        <div 
          v-for="col in columns" 
          :key="col"
          class="skeleton-table-header-cell"
          :style="tableHeaderCellStyles"
        />
      </div>
      
      <!-- 表格行 -->
      <div 
        v-for="row in rows" 
        :key="row"
        class="skeleton-table-row"
        :style="tableRowStyles"
      >
        <div 
          v-for="col in columns" 
          :key="col"
          class="skeleton-table-cell"
          :style="tableCellStyles"
        />
      </div>
    </div>
    
    <!-- 图片骨架 -->
    <div v-else-if="variant === 'image'" class="skeleton-image" :style="imageStyles">
      <div class="skeleton-image-placeholder" :style="imagePlaceholderStyles">
        <svg 
          class="skeleton-image-icon" 
          :style="imageIconStyles"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <!-- 默认矩形骨架 -->
    <div v-else class="skeleton-rect" :style="rectStyles" />
    
    <!-- 动画覆盖层 -->
    <div 
      v-if="animated && animationType === 'shimmer'" 
      class="skeleton-shimmer"
      :style="shimmerStyles"
    />
    
    <!-- 波浪动画 -->
    <div 
      v-if="animated && animationType === 'wave'" 
      class="skeleton-wave"
      :style="waveStyles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDesignTokens, useScrollTrigger } from '../../design-system/composables'

// 组件属性接口
interface Props {
  variant?: 'rect' | 'circle' | 'text' | 'card' | 'list' | 'table' | 'image'
  width?: string | number
  height?: string | number
  lines?: number
  count?: number
  columns?: number
  rows?: number
  actionCount?: number
  animated?: boolean
  animationType?: 'shimmer' | 'wave' | 'pulse'
  animationSpeed?: 'slow' | 'normal' | 'fast'
  rounded?: boolean | string
  showAvatar?: boolean
  showActions?: boolean
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark' | 'auto'
  ariaLabel?: string
  delay?: number
  stagger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rect',
  width: '100%',
  height: '20px',
  lines: 3,
  count: 3,
  columns: 4,
  rows: 5,
  actionCount: 2,
  animated: true,
  animationType: 'shimmer',
  animationSpeed: 'normal',
  rounded: false,
  showAvatar: false,
  showActions: false,
  avatarSize: 'md',
  theme: 'auto',
  ariaLabel: '内容加载中...',
  delay: 0,
  stagger: false
})

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const skeletonRef = ref<HTMLElement | null>(null)

// 滚动触发
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.1,
  triggerOnce: true
})

// 基础样式计算
const skeletonClasses = computed(() => {
  const baseClasses = [
    'ds-skeleton',
    `ds-skeleton-${props.variant}`,
    `ds-skeleton-theme-${props.theme}`,
    'relative',
    'overflow-hidden'
  ]

  if (props.animated) {
    baseClasses.push(`ds-skeleton-animated-${props.animationType}`)
  }

  if (props.rounded) {
    if (typeof props.rounded === 'string') {
      baseClasses.push(`rounded-${props.rounded}`)
    } else {
      baseClasses.push('rounded-md')
    }
  }

  return baseClasses
})

const skeletonStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 基础尺寸
  if (props.variant === 'rect' || props.variant === 'circle' || props.variant === 'image') {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  // 圆形变体
  if (props.variant === 'circle') {
    styles.borderRadius = '50%'
  }
  
  // 延迟动画
  if (props.delay > 0) {
    styles.animationDelay = `${props.delay}ms`
  }
  
  // 背景色
  styles.backgroundColor = getColor('gray.200')
  
  return styles
})

// 动画样式
const shimmerStyles = computed(() => {
  const speedMap = {
    slow: tokens.animations.duration.slowest,
    normal: '1500ms',
    fast: tokens.animations.duration.slower
  }
  
  return {
    background: `linear-gradient(90deg, transparent 0%, ${getColor('gray.50')} 50%, transparent 100%)`,
    backgroundSize: '200% 100%',
    animation: `shimmer ${speedMap[props.animationSpeed]} ${tokens.animations.easing.linear} infinite`
  }
})

const waveStyles = computed(() => ({
  background: `linear-gradient(45deg, transparent 30%, ${getColor('gray.100')} 50%, transparent 70%)`,
  animation: `wave 2s ${tokens.animations.easing.easeInOut} infinite`
}))

// 文本骨架样式
const lineClasses = (index: number) => [
  'skeleton-line-base',
  { 'skeleton-line-last': index === props.lines - 1 }
]

const lineStyles = (index: number) => {
  const styles: Record<string, string> = {
    height: getSpacing(4),
    backgroundColor: getColor('gray.200'),
    borderRadius: tokens.borderRadius.sm,
    marginBottom: index < props.lines - 1 ? getSpacing(2) : '0'
  }
  
  // 最后一行宽度
  if (index === props.lines - 1) {
    styles.width = '75%'
  }
  
  // 交错动画
  if (props.stagger) {
    styles.animationDelay = `${index * 100}ms`
  }
  
  return styles
}

// 卡片骨架样式
const cardContainerStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(4),
  padding: getSpacing(6)
}))

const avatarClasses = computed(() => [
  'skeleton-avatar-base',
  `skeleton-avatar-${props.avatarSize}`
])

const avatarStyles = computed(() => {
  const sizeMap = {
    xs: getSpacing(6),
    sm: getSpacing(8),
    md: getSpacing(12),
    lg: getSpacing(16),
    xl: getSpacing(20)
  }
  
  const size = sizeMap[props.avatarSize]
  
  return {
    width: size,
    height: size,
    backgroundColor: getColor('gray.200'),
    borderRadius: '50%',
    flexShrink: '0'
  }
})

const cardContentStyles = computed(() => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(3)
}))

const titleStyles = computed(() => ({
  height: getSpacing(5),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  width: '75%'
}))

const descriptionStyles = computed(() => ({
  height: getSpacing(4),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  width: '100%'
}))

const metaStyles = computed(() => ({
  height: getSpacing(3),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  width: '50%'
}))

const actionsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(2),
  marginTop: getSpacing(2)
}))

const buttonStyles = computed(() => ({
  height: getSpacing(8),
  width: getSpacing(20),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.md
}))

// 列表骨架样式
const listItemStyles = (index: number) => {
  const styles: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(3),
    padding: getSpacing(3)
  }
  
  if (props.stagger) {
    styles.animationDelay = `${index * 150}ms`
  }
  
  return styles
}

const listAvatarStyles = computed(() => ({
  width: getSpacing(8),
  height: getSpacing(8),
  backgroundColor: getColor('gray.200'),
  borderRadius: '50%',
  flexShrink: '0'
}))

const listTitleStyles = computed(() => ({
  height: getSpacing(4),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  width: '66%',
  marginBottom: getSpacing(2)
}))

const listSubtitleStyles = computed(() => ({
  height: getSpacing(3),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  width: '50%'
}))

// 表格骨架样式
const tableHeaderStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(4),
  padding: getSpacing(4),
  borderBottom: `1px solid ${getColor('gray.200')}`
}))

const tableHeaderCellStyles = computed(() => ({
  height: getSpacing(4),
  backgroundColor: getColor('gray.300'),
  borderRadius: tokens.borderRadius.sm,
  flex: '1'
}))

const tableRowStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(4),
  padding: getSpacing(4),
  borderBottom: `1px solid ${getColor('gray.100')}`
}))

const tableCellStyles = computed(() => ({
  height: getSpacing(4),
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.sm,
  flex: '1'
}))

// 图片骨架样式
const imageStyles = computed(() => ({
  backgroundColor: getColor('gray.200'),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const imagePlaceholderStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
}))

const imageIconStyles = computed(() => ({
  width: getSpacing(12),
  height: getSpacing(12),
  color: getColor('gray.400')
}))

// 矩形骨架样式
const rectStyles = computed(() => ({
  backgroundColor: getColor('gray.200')
}))

// 组件挂载
onMounted(() => {
  if (skeletonRef.value) {
    observe(skeletonRef.value)
  }
})
</script>

<style scoped>
.ds-skeleton {
  position: relative;
  overflow: hidden;
}

/* 动画定义 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes wave {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 动画覆盖层 */
.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.skeleton-wave {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

/* 脉冲动画 */
.ds-skeleton-animated-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .skeleton-card-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .skeleton-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .skeleton-table-header,
  .skeleton-table-row {
    gap: 0.5rem;
    padding: 0.5rem;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .ds-skeleton-theme-auto .skeleton-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-skeleton {
    animation: none !important;
  }
  
  .skeleton-shimmer,
  .skeleton-wave {
    animation: none !important;
  }
}
</style>
