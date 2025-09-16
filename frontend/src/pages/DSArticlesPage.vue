<!--
  设计系统文章列表页 - DSArticlesPage
  基于新设计系统重构的文章列表页面，集成面包屑、分类导航、搜索等功能
-->

<template>
  <DSDefaultLayout
    :show-scroll-progress="true"
    :show-search="true"
    :show-footer="true"
    :show-back-to-top="true"
    @search="handleGlobalSearch"
  >
    <!-- 页面容器 -->
    <div class="articles-page" :style="pageStyles">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container" :style="breadcrumbContainerStyles">
        <DSBreadcrumb
          :items="breadcrumbItems"
          :show-home="true"
          home-label="首页"
          home-to="/"
          size="md"
          variant="default"
          :scroll-animation="true"
          @item-click="handleBreadcrumbClick"
        />
      </div>

      <!-- 页面头部 -->
      <header class="page-header" :style="pageHeaderStyles">
        <div class="header-content" :style="headerContentStyles">
          <div class="header-text" :style="headerTextStyles">
            <h1 class="page-title" :style="pageTitleStyles">
              {{ pageTitle }}
            </h1>
            <p class="page-description" :style="pageDescriptionStyles">
              {{ pageDescription }}
            </p>
          </div>
          
          <!-- 统计信息 -->
          <div class="stats-container" :style="statsContainerStyles">
            <div class="stat-item" :style="statItemStyles">
              <span class="stat-number" :style="statNumberStyles">{{ totalArticles }}</span>
              <span class="stat-label" :style="statLabelStyles">篇文章</span>
            </div>
            <div class="stat-item" :style="statItemStyles">
              <span class="stat-number" :style="statNumberStyles">{{ totalAuthors }}</span>
              <span class="stat-label" :style="statLabelStyles">位作者</span>
            </div>
            <div class="stat-item" :style="statItemStyles">
              <span class="stat-number" :style="statNumberStyles">{{ totalViews }}</span>
              <span class="stat-label" :style="statLabelStyles">次阅读</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 分类导航 -->
      <section class="category-section" :style="categorySectionStyles">
        <DSCategoryNavigation
          :categories="categories"
          :selected-category="selectedCategory"
          title="按分类筛选"
          :show-title="false"
          :show-all-option="true"
          all-option-label="全部分类"
          :show-counts="true"
          :total-count="totalArticles"
          layout="horizontal"
          variant="pills"
          size="md"
          :scroll-animation="true"
          @category-select="handleCategorySelect"
        />
      </section>

      <!-- 筛选和搜索工具栏 -->
      <section class="toolbar-section" :style="toolbarSectionStyles">
        <div class="toolbar-content" :style="toolbarContentStyles">
          <!-- 左侧筛选器 -->
          <div class="filters-container" :style="filtersContainerStyles">
            <!-- 类型筛选 -->
            <div class="filter-group" :style="filterGroupStyles">
              <label class="filter-label" :style="filterLabelStyles">类型</label>
              <select
                v-model="selectedType"
                class="filter-select"
                :style="filterSelectStyles"
                @change="handleFilterChange"
              >
                <option value="">全部</option>
                <option value="free">免费</option>
                <option value="paid">付费</option>
                <option value="premium">会员专享</option>
              </select>
            </div>

            <!-- 排序选择 -->
            <div class="filter-group" :style="filterGroupStyles">
              <label class="filter-label" :style="filterLabelStyles">排序</label>
              <select
                v-model="selectedSort"
                class="filter-select"
                :style="filterSelectStyles"
                @change="handleFilterChange"
              >
                <option value="latest">最新发布</option>
                <option value="popular">最受欢迎</option>
                <option value="views">阅读量</option>
                <option value="rating">评分</option>
              </select>
            </div>

            <!-- 时间范围 -->
            <div class="filter-group" :style="filterGroupStyles">
              <label class="filter-label" :style="filterLabelStyles">时间</label>
              <select
                v-model="selectedTimeRange"
                class="filter-select"
                :style="filterSelectStyles"
                @change="handleFilterChange"
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="year">今年</option>
              </select>
            </div>
          </div>

          <!-- 右侧搜索和视图切换 -->
          <div class="actions-container" :style="actionsContainerStyles">
            <!-- 搜索框 -->
            <div class="search-container" :style="searchContainerStyles">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文章标题、内容..."
                class="search-input"
                :style="searchInputStyles"
                @input="handleSearchInput"
                @keyup.enter="handleSearch"
              />
              <button
                class="search-button"
                :style="searchButtonStyles"
                @click="handleSearch"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- 视图切换 -->
            <div class="view-toggle" :style="viewToggleStyles">
              <button
                :class="['view-button', { active: viewMode === 'grid' }]"
                :style="getViewButtonStyles('grid')"
                @click="setViewMode('grid')"
                aria-label="网格视图"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                :class="['view-button', { active: viewMode === 'list' }]"
                :style="getViewButtonStyles('list')"
                @click="setViewMode('list')"
                aria-label="列表视图"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 活跃筛选器显示 -->
      <section
        v-if="hasActiveFilters"
        class="active-filters-section"
        :style="activeFiltersSectionStyles"
      >
        <div class="active-filters" :style="activeFiltersStyles">
          <span class="filters-label" :style="filtersLabelStyles">当前筛选：</span>
          <div class="filter-tags" :style="filterTagsStyles">
            <span
              v-if="selectedCategory && selectedCategory !== 'all'"
              class="filter-tag"
              :style="filterTagStyles"
            >
              分类：{{ getCategoryLabel(selectedCategory) }}
              <button
                class="filter-tag-remove"
                :style="filterTagRemoveStyles"
                @click="clearCategoryFilter"
              >×</button>
            </span>
            <span
              v-if="selectedType"
              class="filter-tag"
              :style="filterTagStyles"
            >
              类型：{{ getTypeLabel(selectedType) }}
              <button
                class="filter-tag-remove"
                :style="filterTagRemoveStyles"
                @click="clearTypeFilter"
              >×</button>
            </span>
            <span
              v-if="selectedTimeRange"
              class="filter-tag"
              :style="filterTagStyles"
            >
              时间：{{ getTimeRangeLabel(selectedTimeRange) }}
              <button
                class="filter-tag-remove"
                :style="filterTagRemoveStyles"
                @click="clearTimeRangeFilter"
              >×</button>
            </span>
            <span
              v-if="searchQuery"
              class="filter-tag"
              :style="filterTagStyles"
            >
              搜索：{{ searchQuery }}
              <button
                class="filter-tag-remove"
                :style="filterTagRemoveStyles"
                @click="clearSearchFilter"
              >×</button>
            </span>
          </div>
          <button
            class="clear-all-filters"
            :style="clearAllFiltersStyles"
            @click="clearAllFilters"
          >
            清除所有筛选
          </button>
        </div>
      </section>

      <!-- 结果统计 -->
      <section class="results-section" :style="resultsSectionStyles">
        <div class="results-info" :style="resultsInfoStyles">
          <span class="results-count" :style="resultsCountStyles">
            找到 {{ filteredArticles.length }} 篇文章
          </span>
          <span v-if="pagination.total > pagination.limit" class="pagination-info" :style="paginationInfoStyles">
            第 {{ pagination.page }} 页，共 {{ Math.ceil(pagination.total / pagination.limit) }} 页
          </span>
        </div>
      </section>

      <!-- 文章列表内容 -->
      <main class="articles-main" :style="articlesMainStyles">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container" :style="loadingContainerStyles">
          <div :class="getLoadingGridClasses()" :style="loadingGridStyles">
            <DSSkeletonLoader
              v-for="i in 12"
              :key="i"
              :width="'100%'"
              :height="viewMode === 'grid' ? '320px' : '120px'"
              :animation="true"
              :delay="i * 50"
            />
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container" :style="errorContainerStyles">
          <div class="error-content" :style="errorContentStyles">
            <div class="error-icon" :style="errorIconStyles">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="error-title" :style="errorTitleStyles">加载失败</h2>
            <p class="error-message" :style="errorMessageStyles">{{ error }}</p>
            <button
              class="error-retry"
              :style="errorRetryStyles"
              @click="handleRetry"
            >
              重新加载
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredArticles.length === 0" class="empty-container" :style="emptyContainerStyles">
          <div class="empty-content" :style="emptyContentStyles">
            <div class="empty-icon" :style="emptyIconStyles">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="empty-title" :style="emptyTitleStyles">暂无文章</h2>
            <p class="empty-message" :style="emptyMessageStyles">
              {{ hasActiveFilters ? '没有找到符合条件的文章，请尝试调整筛选条件' : '还没有发布任何文章' }}
            </p>
            <button
              v-if="hasActiveFilters"
              class="empty-action"
              :style="emptyActionStyles"
              @click="clearAllFilters"
            >
              清除筛选条件
            </button>
          </div>
        </div>

        <!-- 文章列表 -->
        <div v-else :class="getArticlesGridClasses()" :style="articlesGridStyles">
          <DSArticleCard
            v-for="article in paginatedArticles"
            :key="article.id"
            :article="article"
            :variant="viewMode === 'grid' ? 'default' : 'horizontal'"
            :show-author="true"
            :show-stats="true"
            :show-tags="true"
            :show-excerpt="viewMode === 'list'"
            @click="handleArticleClick"
            @author-click="handleAuthorClick"
            @tag-click="handleTagClick"
          />
        </div>

        <!-- 分页 -->
        <div
          v-if="pagination.total > pagination.limit"
          class="pagination-container"
          :style="paginationContainerStyles"
        >
          <!-- 分页组件将在后续步骤中实现 -->
          <div class="pagination-placeholder" :style="paginationPlaceholderStyles">
            <button
              :disabled="pagination.page <= 1"
              class="pagination-button"
              :style="getPaginationButtonStyles(pagination.page <= 1)"
              @click="goToPage(pagination.page - 1)"
            >
              上一页
            </button>
            <span class="pagination-info" :style="paginationInfoStyles">
              第 {{ pagination.page }} 页，共 {{ Math.ceil(pagination.total / pagination.limit) }} 页
            </span>
            <button
              :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)"
              class="pagination-button"
              :style="getPaginationButtonStyles(pagination.page >= Math.ceil(pagination.total / pagination.limit))"
              @click="goToPage(pagination.page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </main>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDesignTokens } from '../design-system/composables'
import { eventBus, showNotification } from '../utils/EventBus'

// 导入组件
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSBreadcrumb from '../components/molecules/DSBreadcrumb.vue'
import DSCategoryNavigation from '../components/molecules/DSCategoryNavigation.vue'
import DSArticleCard from '../components/molecules/DSArticleCard.vue'
import DSSkeletonLoader from '../components/atoms/DSSkeletonLoader.vue'

// 文章接口
interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPaid: boolean
  price?: number
  coverImage?: string
}

// 分类接口
interface Category {
  id: string
  label: string
  count: number
  icon: any
  color: string
}

// 分页接口
interface Pagination {
  page: number
  limit: number
  total: number
}

// 路由和设计令牌
const router = useRouter()
const route = useRoute()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const isLoading = ref(false)
const error = ref('')
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])

// 筛选状态
const selectedCategory = ref('all')
const selectedType = ref('')
const selectedSort = ref('latest')
const selectedTimeRange = ref('')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

// 分页状态
const pagination = ref<Pagination>({
  page: 1,
  limit: 12,
  total: 0
})

// 统计数据
const totalArticles = ref(0)
const totalAuthors = ref(0)
const totalViews = ref(0)

// 计算属性
const pageTitle = computed(() => {
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.id === selectedCategory.value)
    return category ? `${category.label} - 文章列表` : '文章列表'
  }
  return '文章列表'
})

const pageDescription = computed(() => {
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    return `发现优质的${getCategoryLabel(selectedCategory.value)}文章和知识分享`
  }
  return '发现优质的技术文章和知识分享'
})

const breadcrumbItems = computed(() => {
  const items = [
    { label: '文章', to: '/articles' }
  ]
  
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    items.push({
      label: getCategoryLabel(selectedCategory.value),
      to: `/articles?category=${selectedCategory.value}`
    })
  }
  
  return items
})

const hasActiveFilters = computed(() => {
  return !!(
    (selectedCategory.value && selectedCategory.value !== 'all') ||
    selectedType.value ||
    selectedTimeRange.value ||
    searchQuery.value
  )
})

const filteredArticles = computed(() => {
  let filtered = [...articles.value]
  
  // 分类筛选
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(article => article.category === selectedCategory.value)
  }
  
  // 类型筛选
  if (selectedType.value) {
    if (selectedType.value === 'free') {
      filtered = filtered.filter(article => !article.isPaid)
    } else if (selectedType.value === 'paid') {
      filtered = filtered.filter(article => article.isPaid)
    }
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // 排序
  if (selectedSort.value === 'popular') {
    filtered.sort((a, b) => b.likeCount - a.likeCount)
  } else if (selectedSort.value === 'views') {
    filtered.sort((a, b) => b.viewCount - a.viewCount)
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }
  
  return filtered
})

const paginatedArticles = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filteredArticles.value.slice(start, end)
})

// 样式计算
const pageStyles = computed(() => ({
  maxWidth: '1280px',
  margin: '0 auto',
  padding: `0 ${getSpacing(4)}`,
  paddingTop: getSpacing(6),
  paddingBottom: getSpacing(12)
}))

const breadcrumbContainerStyles = computed(() => ({
  marginBottom: getSpacing(6)
}))

const pageHeaderStyles = computed(() => ({
  marginBottom: getSpacing(8)
}))

const headerContentStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: getSpacing(6)
}))

const headerTextStyles = computed(() => ({
  flex: '1',
  minWidth: '300px'
}))

const pageTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['3xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0 0 0.5rem 0'
}))

const pageDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  color: getColor('gray.600'),
  margin: '0'
}))

const statsContainerStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(6),
  flexWrap: 'wrap'
}))

const statItemStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
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

const categorySectionStyles = computed(() => ({
  marginBottom: getSpacing(8)
}))

const toolbarSectionStyles = computed(() => ({
  marginBottom: getSpacing(6)
}))

const toolbarContentStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: getSpacing(4),
  padding: getSpacing(4),
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: getShadow('soft'),
  border: `1px solid ${getColor('gray.200')}`
}))

const filtersContainerStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(4),
  flexWrap: 'wrap'
}))

const filterGroupStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(1)
}))

const filterLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.700'),
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}))

const filterSelectStyles = computed(() => ({
  padding: `${getSpacing(2)} ${getSpacing(3)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.700'),
  backgroundColor: 'white',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease'
}))

const actionsContainerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3)
}))

const searchContainerStyles = computed(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
}))

const searchInputStyles = computed(() => ({
  width: '300px',
  padding: `${getSpacing(2)} ${getSpacing(10)} ${getSpacing(2)} ${getSpacing(3)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  outline: 'none',
  transition: 'all 0.2s ease'
}))

const searchButtonStyles = computed(() => ({
  position: 'absolute',
  right: getSpacing(2),
  padding: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.500'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease'
}))

const viewToggleStyles = computed(() => ({
  display: 'flex',
  backgroundColor: getColor('gray.100'),
  borderRadius: tokens.borderRadius.md,
  padding: getSpacing(1)
}))

const getViewButtonStyles = (mode: 'grid' | 'list') => {
  const isActive = viewMode.value === mode
  return {
    padding: getSpacing(2),
    backgroundColor: isActive ? 'white' : 'transparent',
    border: 'none',
    borderRadius: tokens.borderRadius.sm,
    color: isActive ? getColor('primary.600') : getColor('gray.600'),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? getShadow('soft') : 'none'
  }
}

// 活跃筛选器样式
const activeFiltersSectionStyles = computed(() => ({
  marginBottom: getSpacing(4)
}))

const activeFiltersStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  flexWrap: 'wrap',
  padding: getSpacing(3),
  backgroundColor: getColor('blue.50'),
  borderRadius: tokens.borderRadius.md,
  border: `1px solid ${getColor('blue.200')}`
}))

const filtersLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('blue.700')
}))

const filterTagsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(2),
  flexWrap: 'wrap'
}))

const filterTagStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1),
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  backgroundColor: getColor('blue.100'),
  color: getColor('blue.800'),
  fontSize: tokens.typography.fontSize.xs[0],
  borderRadius: tokens.borderRadius.md,
  border: `1px solid ${getColor('blue.300')}`
}))

const filterTagRemoveStyles = computed(() => ({
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('blue.600'),
  cursor: 'pointer',
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.bold,
  padding: '0',
  marginLeft: getSpacing(1)
}))

const clearAllFiltersStyles = computed(() => ({
  padding: `${getSpacing(1)} ${getSpacing(3)}`,
  backgroundColor: 'transparent',
  border: `1px solid ${getColor('blue.300')}`,
  color: getColor('blue.700'),
  fontSize: tokens.typography.fontSize.xs[0],
  borderRadius: tokens.borderRadius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

// 结果统计样式
const resultsSectionStyles = computed(() => ({
  marginBottom: getSpacing(6)
}))

const resultsInfoStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: getSpacing(2)
}))

const resultsCountStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.700')
}))

const paginationInfoStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600')
}))

// 主内容样式
const articlesMainStyles = computed(() => ({
  minHeight: '400px'
}))

const getLoadingGridClasses = () => {
  return viewMode.value === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4'
}

const loadingGridStyles = computed(() => ({}))

const loadingContainerStyles = computed(() => ({
  padding: getSpacing(4)
}))

// 错误状态样式
const errorContainerStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  padding: getSpacing(8)
}))

const errorContentStyles = computed(() => ({
  textAlign: 'center',
  maxWidth: '400px'
}))

const errorIconStyles = computed(() => ({
  color: getColor('error.500'),
  marginBottom: getSpacing(4)
}))

const errorTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0 0 0.5rem 0'
}))

const errorMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.600'),
  marginBottom: getSpacing(6),
  margin: '0 0 1.5rem 0'
}))

const errorRetryStyles = computed(() => ({
  padding: `${getSpacing(3)} ${getSpacing(6)}`,
  backgroundColor: getColor('primary.600'),
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

// 空状态样式
const emptyContainerStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  padding: getSpacing(8)
}))

const emptyContentStyles = computed(() => ({
  textAlign: 'center',
  maxWidth: '400px'
}))

const emptyIconStyles = computed(() => ({
  color: getColor('gray.400'),
  marginBottom: getSpacing(4)
}))

const emptyTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0 0 0.5rem 0'
}))

const emptyMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.600'),
  marginBottom: getSpacing(6),
  margin: '0 0 1.5rem 0'
}))

const emptyActionStyles = computed(() => ({
  padding: `${getSpacing(3)} ${getSpacing(6)}`,
  backgroundColor: getColor('primary.600'),
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

// 文章网格样式
const getArticlesGridClasses = () => {
  return viewMode.value === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6'
}

const articlesGridStyles = computed(() => ({
  marginBottom: getSpacing(8)
}))

// 分页样式
const paginationContainerStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: getSpacing(8)
}))

const paginationPlaceholderStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4)
}))

const getPaginationButtonStyles = (disabled: boolean) => ({
  padding: `${getSpacing(2)} ${getSpacing(4)}`,
  backgroundColor: disabled ? getColor('gray.100') : getColor('primary.600'),
  color: disabled ? getColor('gray.400') : 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease'
})

// 工具函数
const getCategoryLabel = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.label || categoryId
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    free: '免费',
    paid: '付费',
    premium: '会员专享'
  }
  return typeMap[type] || type
}

const getTimeRangeLabel = (range: string) => {
  const rangeMap: Record<string, string> = {
    today: '今天',
    week: '本周',
    month: '本月',
    year: '今年'
  }
  return rangeMap[range] || range
}

// 事件处理函数
const handleGlobalSearch = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

const handleBreadcrumbClick = (item: any, index: number, event: Event) => {
  // 面包屑点击处理
}

const handleCategorySelect = (categoryId: string) => {
  selectedCategory.value = categoryId
  pagination.value.page = 1
  loadArticles()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadArticles()
}

const handleSearchInput = () => {
  // 可以添加防抖逻辑
}

const handleSearch = () => {
  pagination.value.page = 1
  loadArticles()
}

const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode
  localStorage.setItem('articles-view-mode', mode)
}

const clearCategoryFilter = () => {
  selectedCategory.value = 'all'
  handleFilterChange()
}

const clearTypeFilter = () => {
  selectedType.value = ''
  handleFilterChange()
}

const clearTimeRangeFilter = () => {
  selectedTimeRange.value = ''
  handleFilterChange()
}

const clearSearchFilter = () => {
  searchQuery.value = ''
  handleFilterChange()
}

const clearAllFilters = () => {
  selectedCategory.value = 'all'
  selectedType.value = ''
  selectedTimeRange.value = ''
  searchQuery.value = ''
  handleFilterChange()
}

const handleRetry = () => {
  error.value = ''
  loadArticles()
}

const handleArticleClick = (article: Article) => {
  router.push(`/articles/${article.id}`)
}

const handleAuthorClick = (author: any) => {
  router.push(`/authors/${author.id}`)
}

const handleTagClick = (tag: string) => {
  searchQuery.value = tag
  handleSearch()
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadArticles()
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 数据加载
const loadArticles = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'Vue 3 Composition API 深度解析',
        excerpt: '深入了解 Vue 3 Composition API 的设计理念和最佳实践',
        content: '',
        author: {
          id: '1',
          name: '张三',
          avatar: '/avatars/1.jpg'
        },
        category: 'frontend',
        tags: ['Vue', 'JavaScript', 'Frontend'],
        publishedAt: '2024-12-10T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z',
        viewCount: 1234,
        likeCount: 89,
        commentCount: 23,
        isPaid: false,
        coverImage: '/images/vue3.jpg'
      }
      // 更多模拟数据...
    ]
    
    articles.value = mockArticles
    pagination.value.total = mockArticles.length
    
    // 更新统计数据
    totalArticles.value = mockArticles.length
    totalAuthors.value = 45
    totalViews.value = 123456
    
  } catch (err) {
    error.value = '加载文章失败，请稍后重试'
    console.error('Load articles error:', err)
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    // 模拟分类数据
    const mockCategories: Category[] = [
      {
        id: 'frontend',
        label: '前端开发',
        count: 156,
        icon: { template: '<svg>...</svg>' },
        color: 'blue'
      },
      {
        id: 'backend',
        label: '后端开发',
        count: 89,
        icon: { template: '<svg>...</svg>' },
        color: 'green'
      }
      // 更多分类...
    ]
    
    categories.value = mockCategories
  } catch (err) {
    console.error('Load categories error:', err)
  }
}

// 监听路由变化
watch(route, (newRoute) => {
  if (newRoute.query.category) {
    selectedCategory.value = newRoute.query.category as string
  }
  if (newRoute.query.search) {
    searchQuery.value = newRoute.query.search as string
  }
}, { immediate: true })

// 监听筛选条件变化
watch([selectedCategory, selectedType, selectedSort, selectedTimeRange, searchQuery], () => {
  // 更新URL查询参数
  const query: Record<string, string> = {}
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    query.category = selectedCategory.value
  }
  if (selectedType.value) {
    query.type = selectedType.value
  }
  if (selectedSort.value && selectedSort.value !== 'latest') {
    query.sort = selectedSort.value
  }
  if (selectedTimeRange.value) {
    query.time = selectedTimeRange.value
  }
  if (searchQuery.value) {
    query.search = searchQuery.value
  }
  
  router.replace({ query })
})

// 组件挂载
onMounted(() => {
  // 恢复视图模式
  const savedViewMode = localStorage.getItem('articles-view-mode') as 'grid' | 'list'
  if (savedViewMode) {
    viewMode.value = savedViewMode
  }
  
  // 加载数据
  loadCategories()
  loadArticles()
})
</script>

<style scoped>
.filter-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-button:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary-600);
}

.view-button:hover {
  background-color: var(--color-gray-200);
}

.filter-tag-remove:hover {
  color: var(--color-blue-800);
}

.clear-all-filters:hover {
  background-color: var(--color-blue-100);
}

.error-retry:hover {
  background-color: var(--color-primary-700);
}

.empty-action:hover {
  background-color: var(--color-primary-700);
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-container {
    flex-direction: column;
  }
  
  .actions-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-container {
    justify-content: space-around;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pagination-placeholder {
    flex-direction: column;
    text-align: center;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .filter-select,
  .search-input,
  .search-button,
  .view-button,
  .clear-all-filters,
  .error-retry,
  .empty-action,
  .pagination-button {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .toolbar-content,
  .active-filters {
    border: 2px solid currentColor;
  }
  
  .filter-select,
  .search-input {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .toolbar-section,
  .active-filters-section,
  .pagination-container {
    display: none;
  }
}
</style>
