<!--
  设计系统英雄区域组件 - DSHeroSection
  基于设计令牌的完整英雄区域，支持左右分栏布局和渐变背景
-->

<template>
  <section
    ref="heroRef"
    :class="heroClasses"
    :style="heroStyles"
    role="banner"
    :aria-label="ariaLabel"
  >
    <!-- 背景装饰层 -->
    <div class="hero-background" :style="backgroundStyles">
      <!-- 渐变背景 -->
      <div class="hero-gradient" :style="gradientStyles" />
      
      <!-- 图案装饰 -->
      <div class="hero-pattern" :style="patternStyles" />
      
      <!-- 浮动元素 -->
      <div v-if="showFloatingElements" class="hero-floating-elements">
        <div 
          v-for="(element, index) in floatingElements" 
          :key="index"
          class="floating-element"
          :style="floatingElementStyles(index)"
        />
      </div>
    </div>
    
    <!-- 主要内容容器 -->
    <div class="hero-container" :style="containerStyles">
      <!-- 左侧内容区域 -->
      <div class="hero-content" :style="contentStyles">
        <!-- 标题区域 -->
        <div class="hero-title-section" :style="titleSectionStyles">
          <!-- 副标题/标签 -->
          <div v-if="subtitle" class="hero-subtitle" :style="subtitleStyles">
            {{ subtitle }}
          </div>
          
          <!-- 主标题 -->
          <h1 class="hero-title" :style="titleStyles">
            <slot name="title">
              {{ title }}
            </slot>
          </h1>
          
          <!-- 描述文本 -->
          <p v-if="description" class="hero-description" :style="descriptionStyles">
            {{ description }}
          </p>
        </div>
        
        <!-- 操作按钮区域 -->
        <div v-if="showActions" class="hero-actions" :style="actionsStyles">
          <slot name="actions">
            <DSButton
              v-if="primaryAction"
              :variant="primaryAction.variant || 'primary'"
              :size="primaryAction.size || 'lg'"
              :loading="primaryAction.loading"
              @click="handlePrimaryAction"
            >
              {{ primaryAction.text }}
            </DSButton>
            
            <DSButton
              v-if="secondaryAction"
              :variant="secondaryAction.variant || 'outline'"
              :size="secondaryAction.size || 'lg'"
              @click="handleSecondaryAction"
            >
              {{ secondaryAction.text }}
            </DSButton>
          </slot>
        </div>
        
        <!-- 特性列表 -->
        <div v-if="features && features.length > 0" class="hero-features" :style="featuresStyles">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="hero-feature"
            :style="featureStyles"
          >
            <div class="feature-icon" :style="featureIconStyles">
              <slot :name="`feature-icon-${index}`" :feature="feature">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </slot>
            </div>
            <span class="feature-text" :style="featureTextStyles">{{ feature }}</span>
          </div>
        </div>
        
        <!-- 统计数据 -->
        <div v-if="stats && stats.length > 0" class="hero-stats" :style="statsStyles">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="hero-stat"
            :style="statStyles"
          >
            <div class="stat-number" :style="statNumberStyles">{{ stat.number }}</div>
            <div class="stat-label" :style="statLabelStyles">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧图片/媒体区域 -->
      <div v-if="showMedia" class="hero-media" :style="mediaStyles">
        <slot name="media">
          <!-- 默认图片 -->
          <div v-if="image" class="hero-image-container" :style="imageContainerStyles">
            <img 
              :src="image.src" 
              :alt="image.alt || '英雄区域图片'"
              class="hero-image"
              :style="imageStyles"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            
            <!-- 图片加载状态 -->
            <div v-if="imageLoading" class="image-loading" :style="imageLoadingStyles">
              <div class="loading-spinner" :style="spinnerStyles" />
            </div>
          </div>
          
          <!-- 默认插图 -->
          <div v-else class="hero-illustration" :style="illustrationStyles">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 简化的插图SVG -->
              <rect width="400" height="300" :fill="getColor('primary.50')" rx="12"/>
              <circle cx="200" cy="150" r="60" :fill="getColor('primary.200')" opacity="0.6"/>
              <rect x="160" y="120" width="80" height="60" :fill="getColor('primary.600')" rx="8"/>
              <circle cx="180" cy="140" r="8" fill="white"/>
              <circle cx="220" cy="140" r="8" fill="white"/>
              <rect x="170" y="155" width="60" height="4" fill="white" rx="2"/>
            </svg>
          </div>
        </slot>
      </div>
    </div>
    
    <!-- 滚动指示器 -->
    <div v-if="showScrollIndicator" class="hero-scroll-indicator" :style="scrollIndicatorStyles">
      <div class="scroll-indicator-line" :style="scrollLineStyles" />
      <div class="scroll-indicator-dot" :style="scrollDotStyles" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDesignTokens, useAnimation, useScrollTrigger } from '../../design-system/composables'
import DSButton from '../atoms/DSButton.vue'

// 操作按钮接口
interface HeroAction {
  text: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

// 统计数据接口
interface HeroStat {
  number: string
  label: string
}

// 图片接口
interface HeroImage {
  src: string
  alt?: string
}

// 组件属性接口
interface Props {
  title?: string
  subtitle?: string
  description?: string
  image?: HeroImage
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  features?: string[]
  stats?: HeroStat[]
  variant?: 'default' | 'centered' | 'minimal' | 'featured'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showActions?: boolean
  showMedia?: boolean
  showScrollIndicator?: boolean
  showFloatingElements?: boolean
  animation?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎来到DocuVault',
  subtitle: '知识付费平台',
  description: '发现、学习、分享优质内容，与专业作者一起成长',
  variant: 'default',
  size: 'lg',
  showActions: true,
  showMedia: true,
  showScrollIndicator: true,
  showFloatingElements: true,
  animation: true,
  ariaLabel: '英雄区域'
})

// 事件定义
const emit = defineEmits<{
  primaryAction: []
  secondaryAction: []
  imageLoad: []
  imageError: []
}>()

// 设计令牌和动画
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const heroRef = ref<HTMLElement | null>(null)

// 动画控制
const entranceAnimation = useAnimation('heroEntrance', {
  duration: tokens.animations.duration.slower,
  easing: tokens.animations.easing.smooth
})

// 滚动触发
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.1,
  triggerOnce: true
})

// 状态管理
const imageLoading = ref(true)

// 浮动元素配置
const floatingElements = computed(() => [
  { size: 60, x: 10, y: 20, delay: 0 },
  { size: 40, x: 85, y: 15, delay: 1000 },
  { size: 80, x: 15, y: 70, delay: 2000 },
  { size: 50, x: 90, y: 80, delay: 1500 }
])

// 样式计算
const heroClasses = computed(() => {
  const baseClasses = [
    'ds-hero',
    `ds-hero-${props.variant}`,
    `ds-hero-${props.size}`,
    'relative',
    'overflow-hidden'
  ]

  if (props.animation && isVisible.value) {
    baseClasses.push('animate-fade-in')
  }

  return baseClasses
})

const heroStyles = computed(() => {
  const sizeMap = {
    sm: { minHeight: '400px', padding: `${getSpacing(12)} 0` },
    md: { minHeight: '500px', padding: `${getSpacing(16)} 0` },
    lg: { minHeight: '600px', padding: `${getSpacing(20)} 0` },
    xl: { minHeight: '700px', padding: `${getSpacing(24)} 0` }
  }

  return {
    position: 'relative',
    ...sizeMap[props.size]
  }
})

// 背景样式
const backgroundStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  zIndex: '1'
}))

const gradientStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: tokens.colors.gradients.hero,
  opacity: '0.9'
}))

const patternStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundImage: `radial-gradient(circle at 25% 25%, ${getColor('primary.200')}40 0%, transparent 50%), 
                    radial-gradient(circle at 75% 75%, ${getColor('purple.200')}30 0%, transparent 50%)`,
  opacity: '0.6'
}))

// 浮动元素样式
const floatingElementStyles = (index: number) => {
  const element = floatingElements.value[index]
  return {
    position: 'absolute',
    width: `${element.size}px`,
    height: `${element.size}px`,
    left: `${element.x}%`,
    top: `${element.y}%`,
    backgroundColor: getColor('primary.200'),
    borderRadius: '50%',
    opacity: '0.3',
    animation: `float 6s ease-in-out infinite ${element.delay}ms`,
    transform: 'translateZ(0)'
  }
}

// 容器样式
const containerStyles = computed(() => ({
  position: 'relative',
  zIndex: '2',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${getSpacing(6)}`,
  display: 'grid',
  gridTemplateColumns: props.showMedia ? '1.2fr 0.8fr' : '1fr',
  gap: getSpacing(12),
  alignItems: 'center',
  height: '100%',
  minHeight: '500px'
}))

// 内容样式
const contentStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(6)
}))

const titleSectionStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(4)
}))

const subtitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('primary.600'),
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0'
}))

const titleStyles = computed(() => {
  const sizeMap = {
    sm: tokens.typography.fontSize['2xl'],
    md: tokens.typography.fontSize['3xl'],
    lg: tokens.typography.fontSize['4xl'],
    xl: tokens.typography.fontSize['5xl']
  }

  return {
    fontSize: sizeMap[props.size][0],
    lineHeight: sizeMap[props.size][1],
    fontWeight: tokens.typography.fontWeight.bold,
    color: getColor('gray.900'),
    margin: '0'
  }
})

const descriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  lineHeight: tokens.typography.fontSize.lg[1],
  color: getColor('gray.600'),
  maxWidth: '500px',
  margin: '0'
}))

// 操作按钮样式
const actionsStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(6),
  width: '100%'
}))

// 特性列表样式
const featuresStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(3)
}))

const featureStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3)
}))

const featureIconStyles = computed(() => ({
  width: getSpacing(5),
  height: getSpacing(5),
  color: getColor('primary.600'),
  flexShrink: '0'
}))

const featureTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.700')
}))

// 统计数据样式
const statsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(8),
  marginTop: getSpacing(6)
}))

const statStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
}))

const statNumberStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('primary.600'),
  lineHeight: '1'
}))

const statLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  marginTop: getSpacing(1)
}))

// 媒体区域样式
const mediaStyles = computed(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxHeight: '500px',
  overflow: 'hidden'
}))

const imageContainerStyles = computed(() => ({
  position: 'relative',
  width: '100%',
  maxWidth: '500px',
  borderRadius: tokens.borderRadius['2xl'],
  overflow: 'hidden',
  boxShadow: getShadow('large')
}))

const imageStyles = computed(() => ({
  width: '100%',
  height: 'auto',
  display: 'block',
  transition: `opacity ${tokens.animations.duration.normal} ${tokens.animations.easing.smooth}`
}))

const imageLoadingStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: getColor('gray.100'),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const spinnerStyles = computed(() => ({
  width: getSpacing(8),
  height: getSpacing(8),
  border: `2px solid ${getColor('primary.200')}`,
  borderTop: `2px solid ${getColor('primary.600')}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}))

const illustrationStyles = computed(() => ({
  width: '100%',
  maxWidth: '400px',
  height: 'auto'
}))

// 滚动指示器样式
const scrollIndicatorStyles = computed(() => ({
  position: 'absolute',
  bottom: getSpacing(8),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: getSpacing(2),
  zIndex: '3'
}))

const scrollLineStyles = computed(() => ({
  width: '1px',
  height: getSpacing(6),
  backgroundColor: getColor('gray.400'),
  animation: 'scroll-line 2s ease-in-out infinite'
}))

const scrollDotStyles = computed(() => ({
  width: getSpacing(2),
  height: getSpacing(2),
  backgroundColor: getColor('primary.600'),
  borderRadius: '50%',
  animation: 'scroll-dot 2s ease-in-out infinite'
}))

// 事件处理
const handlePrimaryAction = () => {
  emit('primaryAction')
}

const handleSecondaryAction = () => {
  emit('secondaryAction')
}

const handleImageLoad = () => {
  imageLoading.value = false
  emit('imageLoad')
}

const handleImageError = () => {
  imageLoading.value = false
  emit('imageError')
}

// 组件挂载
onMounted(() => {
  if (heroRef.value) {
    observe(heroRef.value)
    
    if (props.animation) {
      entranceAnimation.element.value = heroRef.value
      entranceAnimation.play()
    }
  }
})
</script>

<style scoped>
.ds-hero {
  position: relative;
  width: 100%;
}

/* 动画关键帧 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes scroll-line {
  0%, 100% {
    opacity: 0.4;
    transform: scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.5);
  }
}

@keyframes scroll-dot {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr !important;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .hero-features {
    align-items: center;
  }
}

@media (max-width: 640px) {
  .hero-container {
    padding: 0 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    flex-wrap: wrap;
    gap: 1rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-hero {
    animation: none !important;
  }
  
  .floating-element {
    animation: none !important;
  }
  
  .scroll-indicator-line,
  .scroll-indicator-dot {
    animation: none !important;
  }
  
  .loading-spinner {
    animation: none !important;
  }
}
</style>
