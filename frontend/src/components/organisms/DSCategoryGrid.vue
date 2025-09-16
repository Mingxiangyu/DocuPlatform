<!--
  设计系统分类网格组件 - DSCategoryGrid
  智能网格容器，统一管理分类卡片的布局、动画和数据处理
-->

<template>
  <div
    ref="gridContainerRef"
    :class="containerClasses"
    :style="containerStyles"
    role="region"
    :aria-label="ariaLabel"
    :aria-busy="loading"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="grid-loading" :style="loadingContainerStyles">
      <div
        v-for="index in skeletonCount"
        :key="`skeleton-${index}`"
        class="skeleton-card"
        :style="skeletonCardStyles"
      >
        <DSSkeletonLoader
          :width="'100%'"
          :height="'160px'"
          :animation="true"
          :delay="index * 100"
        />
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="grid-error" :style="errorStyles">
      <div class="error-content">
        <div class="error-icon" :style="errorIconStyles">
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="error-title" :style="errorTitleStyles">加载失败</h3>
        <p class="error-message" :style="errorMessageStyles">{{ error }}</p>
        <button
          class="error-retry"
          :style="errorRetryStyles"
          @click="handleRetry"
          type="button"
        >
          重试
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!processedCategories.length" class="grid-empty" :style="emptyStyles">
      <div class="empty-content">
        <div class="empty-icon" :style="emptyIconStyles">
          <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="empty-title" :style="emptyTitleStyles">暂无分类</h3>
        <p class="empty-message" :style="emptyMessageStyles">当前没有可显示的分类内容</p>
      </div>
    </div>

    <!-- 分类网格 -->
    <div
      v-else
      :class="gridClasses"
      :style="gridStyles"
      role="grid"
      :aria-rowcount="gridRowCount"
      :aria-colcount="currentColumns"
    >
      <DSCategoryCard
        v-for="(category, index) in displayCategories"
        :key="category.id"
        :title="category.title"
        :description="category.description"
        :category="category.type"
        :article-count="category.articleCount"
        :author-count="category.authorCount"
        :tags="category.tags"
        :size="cardSize"
        :variant="cardVariant"
        :animation="cardAnimation"
        :scroll-animation="scrollAnimation && isVisible"
        :loading="false"
        :clickable="!loading"
        :aria-label="`${category.title}分类，包含${category.articleCount}篇文章`"
        :style="getCategoryCardStyles(index)"
        role="gridcell"
        :aria-rowindex="Math.floor(index / currentColumns) + 1"
        :aria-colindex="(index % currentColumns) + 1"
        @click="handleCategoryClick(category)"
        @mouseenter="handleCategoryHover(category, $event)"
        @focus="handleCategoryFocus(category, $event)"
      >
        <template #icon>
          <component :is="category.icon" class="w-6 h-6" />
        </template>
      </DSCategoryCard>
    </div>

    <!-- 加载更多按钮 -->
    <div
      v-if="showLoadMore && hasMoreCategories"
      class="load-more-container"
      :style="loadMoreContainerStyles"
    >
      <DSButton
        variant="outline"
        size="md"
        :loading="loadingMore"
        :disabled="loading"
        @click="handleLoadMore"
        class="load-more-button"
      >
        {{ loadingMore ? '加载中...' : '加载更多分类' }}
      </DSButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useDesignTokens, useAnimation, useScrollTrigger } from '../../design-system/composables'
import DSCategoryCard from '../molecules/DSCategoryCard.vue'
import DSSkeletonLoader from '../atoms/DSSkeletonLoader.vue'
import DSButton from '../atoms/DSButton.vue'

// 类型定义
interface CategoryData {
  id: string
  title: string
  description: string
  type: 'frontend' | 'backend' | 'mobile' | 'design' | 'devops' | 'ai'
  articleCount: number
  authorCount: number
  tags: string[]
  icon: any
}

interface ResponsiveColumns {
  base: number
  sm: number
  md: number
  lg: number
  xl: number
}

// 组件属性接口
interface Props {
  categories?: CategoryData[]
  columns?: Partial<ResponsiveColumns>
  gap?: 'sm' | 'md' | 'lg'
  animationStagger?: number
  scrollAnimation?: boolean
  loading?: boolean
  error?: string
  variant?: 'default' | 'compact' | 'featured'
  maxItems?: number
  showLoadMore?: boolean
  cardSize?: 'sm' | 'md' | 'lg'
  cardVariant?: 'default' | 'minimal' | 'featured'
  cardAnimation?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  columns: () => ({}),
  gap: 'md',
  animationStagger: 100,
  scrollAnimation: true,
  loading: false,
  error: '',
  variant: 'default',
  maxItems: 0,
  showLoadMore: false,
  cardSize: 'md',
  cardVariant: 'default',
  cardAnimation: true,
  ariaLabel: '分类网格'
})

// 事件定义
const emit = defineEmits<{
  categoryClick: [category: CategoryData]
  categoryHover: [category: CategoryData, event: MouseEvent]
  categoryFocus: [category: CategoryData, event: FocusEvent]
  loadMore: []
  retry: []
}>()

// 设计令牌和组合式API
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const gridContainerRef = ref<HTMLElement | null>(null)

// 滚动触发动画
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.2,
  rootMargin: '0px 0px -10% 0px',
  triggerOnce: true
})

// 状态管理
const loadingMore = ref(false)
const currentPage = ref(1)

// 默认响应式列配置
const defaultColumns: ResponsiveColumns = {
  base: 2,  // 移动端
  sm: 3,    // 小屏幕
  md: 4,    // 中等屏幕
  lg: 6,    // 大屏幕（匹配高保真原型）
  xl: 6     // 超大屏幕
}

// 合并列配置
const responsiveColumns = computed<ResponsiveColumns>(() => ({
  ...defaultColumns,
  ...props.columns
}))

// 当前列数（用于可访问性）
const currentColumns = computed(() => {
  // 这里简化处理，实际应该根据当前断点计算
  return responsiveColumns.value.lg
})

// 网格行数（用于可访问性）
const gridRowCount = computed(() => {
  const itemCount = displayCategories.value.length
  return Math.ceil(itemCount / currentColumns.value)
})

// 处理后的分类数据
const processedCategories = computed(() => {
  if (!props.categories?.length) return []
  
  // 数据验证和处理
  return props.categories.filter(category => 
    category.id && 
    category.title && 
    category.type
  )
})

// 显示的分类（考虑maxItems限制）
const displayCategories = computed(() => {
  const categories = processedCategories.value
  if (props.maxItems && props.maxItems > 0) {
    return categories.slice(0, props.maxItems)
  }
  return categories
})

// 是否有更多分类
const hasMoreCategories = computed(() => {
  if (!props.maxItems) return false
  return processedCategories.value.length > props.maxItems
})

// 骨架屏数量
const skeletonCount = computed(() => {
  return responsiveColumns.value.lg // 显示一行的骨架屏
})

// 间距配置
const gapConfig = computed(() => {
  const gapMap = {
    sm: tokens.spacing[3],   // 12px
    md: tokens.spacing[4],   // 16px
    lg: tokens.spacing[6]    // 24px
  }
  return gapMap[props.gap]
})

// 容器样式类
const containerClasses = computed(() => [
  'ds-category-grid',
  `ds-category-grid-${props.variant}`,
  'w-full',
  'relative'
])

// 容器样式
const containerStyles = computed(() => ({
  minHeight: props.loading ? '200px' : 'auto'
}))

// 网格样式类
const gridClasses = computed(() => {
  const classes = [
    'category-grid',
    'grid',
    'w-full',
    'transition-all',
    'duration-500',
    'ease-out'
  ]

  // 响应式列数
  classes.push(`grid-cols-${responsiveColumns.value.base}`)
  classes.push(`sm:grid-cols-${responsiveColumns.value.sm}`)
  classes.push(`md:grid-cols-${responsiveColumns.value.md}`)
  classes.push(`lg:grid-cols-${responsiveColumns.value.lg}`)
  classes.push(`xl:grid-cols-${responsiveColumns.value.xl}`)

  // 间距
  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  }[props.gap]
  classes.push(gapClass)

  return classes
})

// 网格样式
const gridStyles = computed(() => ({
  gap: gapConfig.value
}))

// 分类卡片样式
const getCategoryCardStyles = (index: number) => {
  const styles: Record<string, string> = {}

  if (props.scrollAnimation && isVisible.value) {
    styles.animationDelay = `${index * props.animationStagger}ms`
  }

  return styles
}

// 加载容器样式
const loadingContainerStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${responsiveColumns.value.lg}, 1fr)`,
  gap: gapConfig.value,
  width: '100%'
}))

// 骨架卡片样式
const skeletonCardStyles = computed(() => ({
  borderRadius: tokens.borderRadius.xl,
  overflow: 'hidden'
}))

// 错误状态样式
const errorStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: getSpacing(8),
  textAlign: 'center'
}))

const errorIconStyles = computed(() => ({
  color: getColor('error.500'),
  marginBottom: getSpacing(4)
}))

const errorTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0'
}))

const errorMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  marginBottom: getSpacing(4),
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
  fontWeight: tokens.typography.fontWeight.medium,
  transition: 'background-color 0.2s ease'
}))

// 空状态样式
const emptyStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  padding: getSpacing(8),
  textAlign: 'center'
}))

const emptyIconStyles = computed(() => ({
  color: getColor('gray.400'),
  marginBottom: getSpacing(4)
}))

const emptyTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0'
}))

const emptyMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

// 加载更多容器样式
const loadMoreContainerStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: getSpacing(8),
  padding: getSpacing(4)
}))

// 事件处理函数
const handleCategoryClick = (category: CategoryData) => {
  if (props.loading || loadingMore.value) return
  emit('categoryClick', category)
}

const handleCategoryHover = (category: CategoryData, event: MouseEvent) => {
  if (props.loading || loadingMore.value) return
  emit('categoryHover', category, event)
}

const handleCategoryFocus = (category: CategoryData, event: FocusEvent) => {
  if (props.loading || loadingMore.value) return
  emit('categoryFocus', category, event)
}

const handleLoadMore = async () => {
  if (loadingMore.value || props.loading) return

  loadingMore.value = true
  try {
    emit('loadMore')
    currentPage.value++
  } finally {
    // 延迟重置加载状态，确保动画完成
    setTimeout(() => {
      loadingMore.value = false
    }, 300)
  }
}

const handleRetry = () => {
  if (props.loading || loadingMore.value) return
  emit('retry')
}

// 监听分类数据变化
watch(
  () => props.categories,
  (newCategories) => {
    if (newCategories?.length) {
      // 数据更新后重新触发滚动动画观察
      nextTick(() => {
        if (gridContainerRef.value && props.scrollAnimation) {
          observe(gridContainerRef.value)
        }
      })
    }
  },
  { deep: true }
)

// 组件挂载
onMounted(() => {
  if (gridContainerRef.value && props.scrollAnimation) {
    observe(gridContainerRef.value)
  }
})
</script>

<style scoped>
.ds-category-grid {
  position: relative;
  will-change: transform;
}

.category-grid {
  position: relative;
  z-index: 1;
}

.grid-loading,
.grid-error,
.grid-empty {
  position: relative;
  z-index: 2;
}

.skeleton-card {
  position: relative;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
}

.error-content,
.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.error-retry:hover {
  background-color: var(--color-primary-700) !important;
}

.error-retry:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.load-more-container {
  position: relative;
  z-index: 1;
}

/* 响应式优化 */
@media (max-width: 640px) {
  .ds-category-grid {
    padding: 0 0.5rem;
  }

  .error-content,
  .empty-content {
    padding: 1rem;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .category-grid {
    transition: none !important;
  }

  .skeleton-card {
    animation: none !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .error-retry {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .ds-category-grid {
    break-inside: avoid;
  }

  .load-more-container {
    display: none;
  }
}
</style>
