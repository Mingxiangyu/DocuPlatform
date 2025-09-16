<!--
  设计系统分类导航组件 - DSCategoryNavigation
  用于文章列表页等页面的分类筛选导航，支持多种布局和交互模式
-->

<template>
  <nav
    ref="navigationRef"
    :class="navigationClasses"
    :style="navigationStyles"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <!-- 导航标题 -->
    <div
      v-if="showTitle"
      class="navigation-header"
      :style="headerStyles"
    >
      <h3 class="navigation-title" :style="titleStyles">
        {{ title }}
      </h3>
      <p
        v-if="subtitle"
        class="navigation-subtitle"
        :style="subtitleStyles"
      >
        {{ subtitle }}
      </p>
    </div>

    <!-- 分类导航列表 -->
    <div
      class="navigation-content"
      :style="contentStyles"
    >
      <!-- 全部分类选项 -->
      <button
        v-if="showAllOption"
        :class="getCategoryItemClasses('all')"
        :style="getCategoryItemStyles('all')"
        :aria-pressed="selectedCategory === 'all'"
        @click="handleCategorySelect('all')"
        @mouseenter="handleCategoryHover('all', $event)"
        @focus="handleCategoryFocus('all', $event)"
      >
        <div class="category-item-content" :style="itemContentStyles">
          <div class="category-icon" :style="getCategoryIconStyles('all')">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="category-label" :style="categoryLabelStyles">
            {{ allOptionLabel }}
          </span>
          <span
            v-if="showCounts && totalCount"
            class="category-count"
            :style="categoryCountStyles"
          >
            {{ totalCount }}
          </span>
        </div>
        <div
          v-if="selectedCategory === 'all'"
          class="category-indicator"
          :style="categoryIndicatorStyles"
        />
      </button>

      <!-- 分类选项 -->
      <button
        v-for="category in processedCategories"
        :key="category.id"
        :class="getCategoryItemClasses(category.id)"
        :style="getCategoryItemStyles(category.id)"
        :aria-pressed="selectedCategory === category.id"
        @click="handleCategorySelect(category.id)"
        @mouseenter="handleCategoryHover(category.id, $event)"
        @focus="handleCategoryFocus(category.id, $event)"
      >
        <div class="category-item-content" :style="itemContentStyles">
          <div class="category-icon" :style="getCategoryIconStyles(category.id)">
            <component :is="category.icon" />
          </div>
          <span class="category-label" :style="categoryLabelStyles">
            {{ category.label }}
          </span>
          <span
            v-if="showCounts && category.count"
            class="category-count"
            :style="categoryCountStyles"
          >
            {{ category.count }}
          </span>
        </div>
        <div
          v-if="selectedCategory === category.id"
          class="category-indicator"
          :style="categoryIndicatorStyles"
        />
      </button>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="navigation-loading"
      :style="loadingStyles"
    >
      <div
        v-for="index in skeletonCount"
        :key="`skeleton-${index}`"
        class="skeleton-item"
        :style="skeletonItemStyles"
      >
        <DSSkeletonLoader
          :width="'100%'"
          :height="'40px'"
          :animation="true"
          :delay="index * 100"
        />
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-if="error"
      class="navigation-error"
      :style="errorStyles"
    >
      <div class="error-content">
        <div class="error-icon" :style="errorIconStyles">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="error-message" :style="errorMessageStyles">{{ error }}</p>
        <button
          class="error-retry"
          :style="errorRetryStyles"
          @click="handleRetry"
        >
          重试
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDesignTokens, useScrollTrigger } from '../../design-system/composables'
import DSSkeletonLoader from '../atoms/DSSkeletonLoader.vue'

// 分类数据接口
interface CategoryItem {
  id: string
  label: string
  count?: number
  icon: any
  color?: string
}

// 组件属性接口
interface Props {
  categories?: CategoryItem[]
  selectedCategory?: string
  title?: string
  subtitle?: string
  showTitle?: boolean
  showAllOption?: boolean
  allOptionLabel?: string
  showCounts?: boolean
  totalCount?: number
  loading?: boolean
  error?: string
  layout?: 'horizontal' | 'vertical' | 'grid'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'pills' | 'tabs' | 'sidebar'
  scrollAnimation?: boolean
  ariaLabel?: string
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  selectedCategory: 'all',
  title: '分类筛选',
  subtitle: '',
  showTitle: true,
  showAllOption: true,
  allOptionLabel: '全部',
  showCounts: true,
  totalCount: 0,
  loading: false,
  error: '',
  layout: 'horizontal',
  size: 'md',
  variant: 'default',
  scrollAnimation: false,
  ariaLabel: '分类导航',
  skeletonCount: 6
})

// 事件定义
const emit = defineEmits<{
  categorySelect: [categoryId: string]
  categoryHover: [categoryId: string, event: MouseEvent]
  categoryFocus: [categoryId: string, event: FocusEvent]
  retry: []
}>()

// 设计令牌和组合式API
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const navigationRef = ref<HTMLElement | null>(null)

// 滚动触发动画
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.1,
  triggerOnce: true
})

// 处理后的分类数据
const processedCategories = computed(() => {
  return props.categories.filter(category => category.id && category.label)
})

// 分类颜色配置
const categoryColors = computed(() => {
  const colorMap: Record<string, string> = {
    all: getColor('gray.600'),
    frontend: getColor('primary.600'),
    backend: getColor('blue.600'),
    mobile: getColor('green.600'),
    design: getColor('amber.600'),
    devops: getColor('red.600'),
    ai: getColor('purple.600')
  }
  return colorMap
})

// 导航样式类
const navigationClasses = computed(() => [
  'ds-category-navigation',
  `ds-navigation-${props.layout}`,
  `ds-navigation-${props.size}`,
  `ds-navigation-${props.variant}`,
  {
    'ds-navigation-loading': props.loading,
    'ds-navigation-error': props.error,
    'ds-navigation-animated': props.scrollAnimation && isVisible.value
  }
])

// 导航样式
const navigationStyles = computed(() => {
  const styles: Record<string, string> = {
    width: '100%'
  }

  if (props.variant === 'sidebar') {
    styles.backgroundColor = 'white'
    styles.borderRadius = tokens.borderRadius.lg
    styles.boxShadow = getShadow('soft')
    styles.padding = getSpacing(6)
  }

  return styles
})

// 头部样式
const headerStyles = computed(() => ({
  marginBottom: getSpacing(4),
  textAlign: props.layout === 'vertical' ? 'left' : 'center'
}))

const titleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  margin: '0',
  marginBottom: getSpacing(1)
}))

const subtitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

// 内容样式
const contentStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.layout === 'horizontal') {
    styles.display = 'flex'
    styles.flexWrap = 'wrap'
    styles.gap = getSpacing(2)
    styles.justifyContent = 'center'
  } else if (props.layout === 'vertical') {
    styles.display = 'flex'
    styles.flexDirection = 'column'
    styles.gap = getSpacing(1)
  } else if (props.layout === 'grid') {
    styles.display = 'grid'
    styles.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))'
    styles.gap = getSpacing(3)
  }

  return styles
})

// 分类项样式
const getCategoryItemClasses = (categoryId: string) => [
  'category-item',
  `category-item-${props.variant}`,
  `category-item-${props.size}`,
  {
    'category-item-active': props.selectedCategory === categoryId,
    'category-item-horizontal': props.layout === 'horizontal',
    'category-item-vertical': props.layout === 'vertical'
  }
]

const getCategoryItemStyles = (categoryId: string) => {
  const isActive = props.selectedCategory === categoryId
  const categoryColor = categoryColors.value[categoryId] || getColor('gray.600')

  const baseStyles: Record<string, string> = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: props.layout === 'vertical' ? '100%' : 'auto'
  }

  // 尺寸样式
  const sizeMap = {
    sm: {
      padding: `${getSpacing(2)} ${getSpacing(3)}`,
      borderRadius: tokens.borderRadius.md
    },
    md: {
      padding: `${getSpacing(3)} ${getSpacing(4)}`,
      borderRadius: tokens.borderRadius.lg
    },
    lg: {
      padding: `${getSpacing(4)} ${getSpacing(5)}`,
      borderRadius: tokens.borderRadius.xl
    }
  }
  Object.assign(baseStyles, sizeMap[props.size])

  // 变体样式
  if (props.variant === 'pills') {
    baseStyles.borderRadius = tokens.borderRadius.full
    baseStyles.backgroundColor = isActive ? categoryColor : getColor('gray.100')
    baseStyles.color = isActive ? 'white' : getColor('gray.700')
  } else if (props.variant === 'tabs') {
    baseStyles.borderBottom = `2px solid ${isActive ? categoryColor : 'transparent'}`
    baseStyles.color = isActive ? categoryColor : getColor('gray.600')
  } else if (props.variant === 'sidebar') {
    baseStyles.backgroundColor = isActive ? getColor('primary.50') : 'transparent'
    baseStyles.color = isActive ? getColor('primary.700') : getColor('gray.700')
    baseStyles.borderLeft = `3px solid ${isActive ? categoryColor : 'transparent'}`
  } else {
    // default variant
    baseStyles.backgroundColor = isActive ? getColor('gray.100') : 'transparent'
    baseStyles.color = isActive ? categoryColor : getColor('gray.700')
  }

  return baseStyles
}

// 分类图标样式
const getCategoryIconStyles = (categoryId: string) => {
  const isActive = props.selectedCategory === categoryId
  const categoryColor = categoryColors.value[categoryId] || getColor('gray.600')

  return {
    width: '20px',
    height: '20px',
    color: isActive && props.variant === 'pills' ? 'white' : categoryColor,
    marginRight: getSpacing(2)
  }
}

// 项目内容样式
const itemContentStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%'
}))

const categoryLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  flex: '1'
}))

const categoryCountStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.500'),
  marginLeft: getSpacing(2),
  fontWeight: tokens.typography.fontWeight.medium
}))

// 活跃指示器样式
const categoryIndicatorStyles = computed(() => {
  const styles: Record<string, string> = {
    position: 'absolute',
    backgroundColor: getColor('primary.600')
  }

  if (props.variant === 'tabs') {
    styles.bottom = '-2px'
    styles.left = '0'
    styles.right = '0'
    styles.height = '2px'
  } else if (props.variant === 'sidebar') {
    styles.left = '-3px'
    styles.top = '0'
    styles.bottom = '0'
    styles.width = '3px'
  } else {
    styles.top = '50%'
    styles.right = getSpacing(2)
    styles.transform = 'translateY(-50%)'
    styles.width = '4px'
    styles.height = '4px'
    styles.borderRadius = '50%'
  }

  return styles
})

// 加载状态样式
const loadingStyles = computed(() => ({
  display: 'flex',
  flexDirection: props.layout === 'vertical' ? 'column' : 'row',
  gap: getSpacing(2),
  flexWrap: 'wrap'
}))

const skeletonItemStyles = computed(() => ({
  flex: props.layout === 'horizontal' ? '0 0 auto' : '1',
  minWidth: props.layout === 'horizontal' ? '80px' : 'auto'
}))

// 错误状态样式
const errorStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(6),
  textAlign: 'center'
}))

const errorIconStyles = computed(() => ({
  color: getColor('error.500'),
  marginBottom: getSpacing(2)
}))

const errorMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  marginBottom: getSpacing(3),
  margin: '0'
}))

const errorRetryStyles = computed(() => ({
  backgroundColor: getColor('primary.600'),
  color: 'white',
  padding: `${getSpacing(2)} ${getSpacing(4)}`,
  borderRadius: tokens.borderRadius.md,
  border: 'none',
  cursor: 'pointer',
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium
}))

// 事件处理函数
const handleCategorySelect = (categoryId: string) => {
  if (props.loading) return
  emit('categorySelect', categoryId)
}

const handleCategoryHover = (categoryId: string, event: MouseEvent) => {
  if (props.loading) return
  emit('categoryHover', categoryId, event)
}

const handleCategoryFocus = (categoryId: string, event: FocusEvent) => {
  if (props.loading) return
  emit('categoryFocus', categoryId, event)
}

const handleRetry = () => {
  emit('retry')
}

// 组件挂载
onMounted(() => {
  if (navigationRef.value && props.scrollAnimation) {
    observe(navigationRef.value)
  }
})
</script>

<style scoped>
.ds-category-navigation {
  position: relative;
}

.category-item {
  outline: none;
}

.category-item:hover {
  background-color: var(--color-gray-50);
}

.category-item:focus {
  box-shadow: 0 0 0 2px var(--color-primary-500);
}

.category-item-pills:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-item-active.category-item-pills {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-retry:hover {
  background-color: var(--color-primary-700);
}

/* 动画 */
.ds-navigation-animated {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-navigation-horizontal .category-item {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  
  .ds-navigation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .category-item,
  .ds-navigation-animated {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .category-item {
    border: 1px solid currentColor;
  }
  
  .category-item-active {
    background-color: currentColor;
    color: white;
  }
}
</style>
