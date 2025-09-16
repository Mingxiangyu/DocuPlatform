<template>
  <DSDefaultLayout>
    <!-- 滚动进度条 -->
    <DSProgressBar
      :scroll-progress="true"
      position="fixed-top"
      variant="gradient"
      size="xs"
      :animated="true"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面头部 -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">文章列表</h1>
          <p class="text-gray-600">发现优质的技术文章和知识分享</p>
        </div>

        <!-- 筛选和搜索 -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <!-- 分类筛选 -->
          <DSCard variant="outlined" padding="sm" class="min-w-[160px]">
            <select
              v-model="selectedCategory"
              @change="loadArticles"
              class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            >
              <option value="">所有分类</option>
              <option value="frontend">前端开发</option>
              <option value="backend">后端开发</option>
              <option value="mobile">移动开发</option>
              <option value="database">数据库</option>
              <option value="devops">DevOps</option>
              <option value="design">UI/UX设计</option>
            </select>
          </DSCard>

          <!-- 类型筛选 -->
          <DSCard variant="outlined" padding="sm" class="min-w-[140px]">
            <select
              v-model="selectedType"
              @change="loadArticles"
              class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            >
              <option value="">全部文章</option>
              <option value="free">免费文章</option>
              <option value="paid">付费文章</option>
            </select>
          </DSCard>

          <!-- 排序选择 -->
          <DSCard variant="outlined" padding="sm" class="min-w-[140px]">
            <select
              v-model="selectedSort"
              @change="loadArticles"
              class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            >
              <option value="latest">最新发布</option>
              <option value="popular">最受欢迎</option>
              <option value="views">阅读量</option>
            </select>
          </DSCard>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DSSkeletonLoader
          v-for="i in 9"
          :key="i"
          type="card"
          :animated="true"
          class="h-80"
        />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-16">
        <DSCard variant="outlined" padding="xl" class="max-w-md mx-auto">
          <div class="text-red-500 mb-6">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
            <p class="text-gray-600 mb-6">{{ error }}</p>
          </div>
          <DSButton @click="loadArticles" variant="primary" size="lg" class="w-full">
            重新加载
          </DSButton>
        </DSCard>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="articles.length > 0" class="space-y-8">
        <!-- 结果统计 -->
        <div class="flex items-center justify-between text-sm text-gray-600 mb-6">
          <span>找到 {{ pagination.total }} 篇文章</span>
          <span>第 {{ pagination.page }} 页，共 {{ Math.ceil(pagination.total / pagination.limit) }} 页</span>
        </div>

        <!-- 文章网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DSCard
            v-for="article in articles"
            :key="article.id"
            variant="elevated"
            :hover="true"
            :clickable="true"
            :animation="true"
            @click="goToArticle(article.id)"
            class="group cursor-pointer"
          >
            <!-- 文章封面 -->
            <div class="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg mb-4 overflow-hidden">
              <img
                v-if="article.coverImage"
                :src="article.coverImage"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>

            <!-- 文章信息 -->
            <div class="space-y-3">
              <!-- 标题 -->
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {{ article.title }}
              </h3>

              <!-- 摘要 -->
              <p class="text-gray-600 text-sm line-clamp-3">
                {{ article.excerpt || '暂无摘要' }}
              </p>

              <!-- 元信息 -->
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-3">
                  <span>{{ article.author?.name || '匿名作者' }}</span>
                  <span>{{ formatDate(article.publishedAt) }}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <span>{{ article.viewCount || 0 }} 阅读</span>
                  <span v-if="article.isPaid" class="text-purple-600 font-medium">
                    ¥{{ article.price }}
                  </span>
                  <span v-else class="text-green-600 font-medium">免费</span>
                </div>
              </div>

              <!-- 分类标签 -->
              <div v-if="article.category" class="flex items-center">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {{ getCategoryName(typeof article.category === 'string' ? article.category : article.category.slug) }}
                </span>
              </div>
            </div>
          </DSCard>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > pagination.limit" class="flex items-center justify-center space-x-3 pt-8">
          <DSButton
            @click="loadPage(pagination.page - 1)"
            :disabled="!pagination.hasPrev"
            variant="outline"
            size="md"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            上一页
          </DSButton>

          <!-- 页码指示器 -->
          <div class="flex items-center space-x-2">
            <template v-for="page in getPageNumbers()" :key="page">
              <DSButton
                v-if="page !== '...'"
                @click="loadPage(page)"
                :variant="page === pagination.page ? 'primary' : 'ghost'"
                size="sm"
                class="min-w-[40px]"
              >
                {{ page }}
              </DSButton>
              <span v-else class="px-2 text-gray-400">...</span>
            </template>
          </div>

          <DSButton
            @click="loadPage(pagination.page + 1)"
            :disabled="!pagination.hasNext"
            variant="outline"
            size="md"
          >
            下一页
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </DSButton>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <DSCard variant="outlined" padding="xl" class="max-w-md mx-auto">
          <div class="text-gray-400 mb-6">
            <svg class="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">暂无文章</h2>
            <p class="text-gray-600 mb-6">当前筛选条件下没有找到文章，试试调整筛选条件</p>
          </div>
          <DSButton @click="clearFilters" variant="outline" size="lg" class="w-full">
            清除筛选条件
          </DSButton>
        </DSCard>
      </div>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '../stores/articles'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSSkeletonLoader from '../components/atoms/DSSkeletonLoader.vue'
import DSProgressBar from '../components/atoms/DSProgressBar.vue'
import type { Article } from '../types/api'

const router = useRouter()
const articlesStore = useArticlesStore()

// 响应式数据
const selectedCategory = ref('')
const selectedType = ref('')
const selectedSort = ref('latest')

// 计算属性
const articles = computed(() => articlesStore.articles)
const isLoading = computed(() => articlesStore.isLoading)
const error = computed(() => articlesStore.error)
const pagination = computed(() => articlesStore.pagination)

// 方法
const loadArticles = async () => {
  const params: any = {
    page: 1,
    limit: 12,
    status: 'PUBLISHED'
  }

  if (selectedCategory.value) {
    params.categoryId = selectedCategory.value
  }

  if (selectedType.value === 'free') {
    params.isPaid = false
  } else if (selectedType.value === 'paid') {
    params.isPaid = true
  }

  // 添加排序参数
  if (selectedSort.value === 'popular') {
    params.sortBy = 'likes'
    params.sortOrder = 'desc'
  } else if (selectedSort.value === 'views') {
    params.sortBy = 'viewCount'
    params.sortOrder = 'desc'
  } else {
    params.sortBy = 'publishedAt'
    params.sortOrder = 'desc'
  }

  await articlesStore.fetchArticles(params)
}

const loadPage = async (page: number) => {
  const params: any = {
    page,
    limit: 12,
    status: 'PUBLISHED'
  }

  if (selectedCategory.value) {
    params.categoryId = selectedCategory.value
  }

  if (selectedType.value === 'free') {
    params.isPaid = false
  } else if (selectedType.value === 'paid') {
    params.isPaid = true
  }

  // 添加排序参数
  if (selectedSort.value === 'popular') {
    params.sortBy = 'likes'
    params.sortOrder = 'desc'
  } else if (selectedSort.value === 'views') {
    params.sortBy = 'viewCount'
    params.sortOrder = 'desc'
  } else {
    params.sortBy = 'publishedAt'
    params.sortOrder = 'desc'
  }

  await articlesStore.fetchArticles(params)
}

const goToArticle = (articleId: string) => {
  router.push(`/articles/${articleId}`)
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedType.value = ''
  selectedSort.value = 'latest'
  loadArticles()
}

// 工具方法
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    frontend: '前端开发',
    backend: '后端开发',
    mobile: '移动开发',
    database: '数据库',
    devops: 'DevOps',
    design: 'UI/UX设计'
  }
  return categoryMap[category] || category
}

const getPageNumbers = () => {
  const current = pagination.value.page
  const total = Math.ceil(pagination.value.total / pagination.value.limit)
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
}

// 生命周期
onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

/* 筛选器样式 */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
