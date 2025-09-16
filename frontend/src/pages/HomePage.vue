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

    <!-- 新的英雄区域 -->
    <DSHeroSection
      title="发现知识的无限可能"
      subtitle="知识付费平台"
      description="在DocuVault，与优秀的创作者一起探索知识的边界，发现、学习、分享优质内容"
      :image="{
        src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        alt: 'DocuVault知识平台插图'
      }"
      :primary-action="{
        text: '开始探索',
        variant: 'primary',
        size: 'lg'
      }"
      :secondary-action="{
        text: '加入我们',
        variant: 'outline',
        size: 'lg'
      }"
      :features="[
        '智能推荐算法，发现感兴趣的内容',
        '深度阅读体验，支持笔记和高亮',
        '活跃的社区互动和讨论'
      ]"
      :stats="[
        { number: '10,000+', label: '优质文章' },
        { number: '5,000+', label: '活跃作者' },
        { number: '100,000+', label: '注册用户' }
      ]"
      size="lg"
      :show-floating-elements="true"
      :animation="true"
      @primary-action="handleStartExploring"
      @secondary-action="handleJoinUs"
    >
      <template #media>
        <div class="hero-illustration-container">
          <!-- 自定义插图或图片 -->
          <div class="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="知识探索插图"
              class="w-full h-auto rounded-2xl shadow-2xl"
              @error="handleImageError"
            />
            <!-- 浮动卡片装饰 -->
            <div class="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 animate-float">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">实时更新</span>
              </div>
            </div>
            <div class="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 animate-float-delayed">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">AI推荐</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DSHeroSection>

    <!-- 分类导航区域 -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">探索知识分类</h2>
          <p class="text-lg text-gray-600">选择你感兴趣的领域，开始学习之旅</p>
        </div>

        <DSCategoryGrid
          :categories="categories"
          :loading="loading"
          :scroll-animation="true"
          :animation-stagger="100"
          gap="md"
          variant="default"
          card-size="md"
          :card-animation="true"
          aria-label="知识分类导航"
          @category-click="handleCategoryClick"
          @category-hover="handleCategoryHover"
        />
      </div>
    </section>

    <!-- Featured Articles -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">精选文章</h2>
          <p class="text-lg text-gray-600">发现最受欢迎的优质内容</p>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DSSkeletonLoader
            v-for="i in 6"
            :key="i"
            variant="card"
            :show-avatar="true"
            :show-actions="true"
            :animation="true"
            animation-type="shimmer"
            :stagger="true"
            :delay="i * 100"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DSCard
            v-for="article in featuredArticles"
            :key="article.id"
            variant="elevated"
            :hover="true"
            :clickable="true"
            :scroll-animation="true"
            @click="handleViewArticle(article.id)"
          >
            <template #header>
              <div class="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-lg overflow-hidden">
                <img
                  v-if="article.coverImage"
                  :src="article.coverImage"
                  :alt="article.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </template>

            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ article.title }}
              </h3>
              <p class="text-gray-600 mb-4 line-clamp-3">
                {{ article.summary }}
              </p>

              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-purple-600">
                      {{ article.author?.name?.charAt(0) || 'A' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-700">{{ article.author?.name || '匿名作者' }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(article.createdAt) }}</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span>{{ article.viewCount || 0 }} 阅读</span>
                  <span>{{ article.likeCount || 0 }} 点赞</span>
                </div>
                <div class="text-lg font-semibold text-purple-600">
                  {{ article.price > 0 ? `¥${article.price}` : '免费' }}
                </div>
              </div>
            </div>

            <template #footer>
              <div class="px-6 py-4 bg-gray-50 flex gap-2">
                <DSButton
                  variant="primary"
                  size="sm"
                  class="flex-1"
                  @click.stop="handleViewArticle(article.id)"
                >
                  阅读文章
                </DSButton>
                <DSButton
                  v-if="article.price > 0"
                  variant="outline"
                  size="sm"
                  @click.stop="handlePurchaseArticle(article.id)"
                >
                  购买
                </DSButton>
                <DSButton
                  variant="ghost"
                  size="sm"
                  @click.stop="handleLikeArticle(article.id)"
                >
                  ❤️
                </DSButton>
              </div>
            </template>
          </DSCard>
        </div>

        <div class="text-center mt-12">
          <DSButton
            variant="outline"
            size="lg"
            @click="$router.push('/articles')"
          >
            查看更多文章
          </DSButton>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">为什么选择DocuVault</h2>
          <p class="text-lg text-gray-600">我们为创作者和读者提供最佳的知识分享体验</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DSCard
            variant="elevated"
            :hover="true"
            :scroll-animation="true"
            class="text-center"
          >
            <div class="p-8">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">智能推荐</h3>
              <p class="text-gray-600">基于AI算法的个性化内容推荐，发现你感兴趣的知识</p>
            </div>
          </DSCard>

          <DSCard
            variant="elevated"
            :hover="true"
            :scroll-animation="true"
            class="text-center"
          >
            <div class="p-8">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">深度阅读</h3>
              <p class="text-gray-600">支持笔记、高亮、收藏等功能，让阅读更有价值</p>
            </div>
          </DSCard>

          <DSCard
            variant="elevated"
            :hover="true"
            :scroll-animation="true"
            class="text-center"
          >
            <div class="p-8">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">社区互动</h3>
              <p class="text-gray-600">与作者和其他读者交流讨论，共同成长</p>
            </div>
          </DSCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-purple-600 to-purple-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          准备好开始你的知识之旅了吗？
        </h2>
        <p class="text-xl text-purple-100 mb-8">
          加入我们，发现无限可能
        </p>
        <DSButton
          variant="primary"
          size="lg"
          class="bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          @click="$router.push('/register')"
        >
          立即注册
        </DSButton>
      </div>
    </section>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSHeroSection from '../components/organisms/DSHeroSection.vue'
import DSCategoryGrid from '../components/organisms/DSCategoryGrid.vue'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSSkeletonLoader from '../components/atoms/DSSkeletonLoader.vue'
import DSProgressBar from '../components/atoms/DSProgressBar.vue'
import { useArticlesStore } from '../stores/articles'
import { eventBus } from '../utils/EventBus'
import type { Article } from '../types/api'

// 图标组件（简化版）
const CodeIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>' }
const ServerIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM4 7h12V5H4v2zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM4 15h12v-2H4v2z" clip-rule="evenodd" /></svg>' }
const MobileIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM8 16a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd" /></svg>' }
const DesignIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1z" clip-rule="evenodd" /></svg>' }
const CloudIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /></svg>' }
const AIIcon = { template: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>' }

const router = useRouter()
const articlesStore = useArticlesStore()

const loading = ref(true)
const featuredArticles = ref<Article[]>([])

// 分类数据
const categories = ref([
  {
    id: 'frontend',
    title: '前端开发',
    description: 'React, Vue, Angular等现代前端技术',
    type: 'frontend' as const,
    articleCount: 1250,
    authorCount: 89,
    tags: ['React', 'Vue', 'TypeScript'],
    icon: CodeIcon
  },
  {
    id: 'backend',
    title: '后端开发',
    description: 'Node.js, Python, Java等后端技术栈',
    type: 'backend' as const,
    articleCount: 980,
    authorCount: 67,
    tags: ['Node.js', 'Python', 'Java'],
    icon: ServerIcon
  },
  {
    id: 'mobile',
    title: '移动开发',
    description: 'iOS, Android, React Native等移动端开发',
    type: 'mobile' as const,
    articleCount: 650,
    authorCount: 45,
    tags: ['iOS', 'Android', 'Flutter'],
    icon: MobileIcon
  },
  {
    id: 'design',
    title: 'UI/UX设计',
    description: '用户界面设计和用户体验优化',
    type: 'design' as const,
    articleCount: 420,
    authorCount: 32,
    tags: ['Figma', 'Sketch', 'Prototyping'],
    icon: DesignIcon
  },
  {
    id: 'devops',
    title: 'DevOps运维',
    description: 'Docker, Kubernetes, CI/CD等运维技术',
    type: 'devops' as const,
    articleCount: 380,
    authorCount: 28,
    tags: ['Docker', 'K8s', 'AWS'],
    icon: CloudIcon
  },
  {
    id: 'ai',
    title: '人工智能',
    description: '机器学习, 深度学习, AI应用开发',
    type: 'ai' as const,
    articleCount: 520,
    authorCount: 41,
    tags: ['TensorFlow', 'PyTorch', 'OpenAI'],
    icon: AIIcon
  }
])

const loadFeaturedArticles = async () => {
  try {
    loading.value = true
    const result = await articlesStore.fetchArticles({
      limit: 6,
      status: 'PUBLISHED',
      sortBy: 'viewCount',
      sortOrder: 'desc'
    })

    if (result.success) {
      featuredArticles.value = articlesStore.articles
    }
  } catch (error) {
    console.error('加载精选文章失败:', error)
    eventBus.emit('ui:notification', {
      type: 'error',
      message: '加载精选文章失败'
    })
  } finally {
    loading.value = false
  }
}

// 英雄区域事件处理
const handleStartExploring = () => {
  router.push('/articles')
}

const handleJoinUs = () => {
  router.push('/register')
}

const handleImageError = () => {
  console.log('英雄区域图片加载失败，使用默认插图')
}

// 分类点击处理
const handleCategoryClick = (category: any) => {
  router.push(`/articles?category=${category.type}`)
}

// 分类悬停处理
const handleCategoryHover = (category: any, event: MouseEvent) => {
  // 可以在这里添加悬停预览逻辑
  console.log('分类悬停:', category.title)
}

// 文章相关处理
const handleViewArticle = (articleId: string) => {
  router.push(`/articles/${articleId}`)
}

const handlePurchaseArticle = (articleId: string) => {
  router.push(`/articles/${articleId}/purchase`)
}

const handleLikeArticle = async (articleId: string) => {
  try {
    await articlesStore.likeArticle(articleId)
    eventBus.emit('ui:notification', {
      type: 'success',
      message: '点赞成功'
    })
  } catch (error) {
    eventBus.emit('ui:notification', {
      type: 'error',
      message: '点赞失败'
    })
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadFeaturedArticles()
})
</script>

<style scoped>
/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite 1.5s;
}

/* 文本截断 */
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

/* 响应式调整 */
@media (max-width: 640px) {
  .hero-illustration-container {
    margin-top: 2rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-float-delayed {
    animation: none !important;
  }
}
</style>
