<template>
  <DSDefaultLayout>
    <!-- 加载状态 -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 py-8">
      <DSSkeletonLoader 
        variant="text" 
        :lines="8"
        animated 
        class="w-full"
      />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <div class="text-red-600 mb-4">
        <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
        <h2 class="text-2xl font-bold mb-2">文章加载失败</h2>
        <p class="text-gray-600">{{ error }}</p>
      </div>
      <DSButton @click="loadArticle" variant="primary">重试</DSButton>
    </div>

    <!-- 使用新的文章详情布局组件 -->
    <DSArticleDetailLayout
      v-else-if="enhancedArticle"
      :article="enhancedArticle"
      :author="enhancedArticle?.author"
      :tags="enhancedArticle?.tags || []"
      :article-content="enhancedArticle?.content || ''"
      @section-click="handleSectionClick"
      @highlight-created="handleHighlightCreated"
    >
      <!-- 面包屑导航插槽 -->
      <template #breadcrumb>
        <DSBreadcrumbNavigation
          :category="article?.category?.name"
          :subcategory="article?.subcategory?.name"
          :article-title="article?.title"
          back-link="/articles"
          back-text="返回列表"
        />
      </template>

      <!-- 文章操作按钮插槽 -->
      <template #actions>
        <DSArticleActions
          :article-id="article?.id"
          :is-paid="article?.isPaid"
          :is-purchased="hasPurchased"
          :price="article?.price"
          :is-liked="isLiked"
          :is-bookmarked="isBookmarked"
          :like-count="article?.likeCount || 0"
          :can-edit="canEdit"
          @like="handleLike"
          @bookmark="handleBookmark"
          @share="handleShare"
          @download="handleDownload"
          @purchase="handlePurchase"
          @edit="handleEdit"
          @report="handleReport"
        />
      </template>

      <!-- 目录导航插槽 -->
      <template #table-of-contents>
        <DSTableOfContents
          :content="article?.content || ''"
          @section-click="handleSectionClick"
        />
      </template>

      <!-- 文章头部插槽 -->
      <template #article-header>
        <DSArticleHeader
          :article="article"
          :author="article?.author"
          :tags="article?.tags || []"
          @tag-click="handleTagClick"
          @author-click="handleAuthorClick"
        />
      </template>

      <!-- 文章内容插槽 -->
      <template #article-content>
        <DSArticleContent
          :content="article?.content || ''"
          :is-paid="article?.isPaid"
          :is-purchased="hasPurchased"
          :price="article?.price"
          :article-id="article?.id"
          :is-loading="isLoading"
          @purchase="handlePurchase"
          @highlight-created="handleHighlightCreated"
          @note-created="handleNoteCreated"
          @highlight-click="handleHighlightClick"
        />
      </template>
    </DSArticleDetailLayout>

    <!-- 文章不存在状态 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-12 text-center">
      <div class="text-gray-500 mb-4">
        <i class="fas fa-file-alt text-6xl mb-4 opacity-50"></i>
        <h2 class="text-2xl font-bold mb-2">文章不存在</h2>
        <p>您访问的文章可能已被删除或不存在</p>
      </div>
      <DSButton @click="$router.push('/articles')" variant="primary">
        返回文章列表
      </DSButton>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 组件导入
import DSDefaultLayout from '@/components/templates/DSDefaultLayout.vue'
import DSArticleDetailLayout from '@/components/templates/DSArticleDetailLayout.vue'
import DSBreadcrumbNavigation from '@/components/molecules/DSBreadcrumbNavigation.vue'
import DSArticleActions from '@/components/molecules/DSArticleActions.vue'
import DSTableOfContents from '@/components/molecules/DSTableOfContents.vue'
import DSArticleHeader from '@/components/molecules/DSArticleHeader.vue'
import DSArticleContent from '@/components/organisms/DSArticleContent.vue'
import DSButton from '@/components/atoms/DSButton.vue'
import DSSkeletonLoader from '@/components/atoms/DSSkeletonLoader.vue'

// Store导入
import { useArticlesStore } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useHighlightsStore } from '@/stores/highlights'
import { usePaymentStore } from '@/stores/payment'

// 路由和Store
const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const authStore = useAuthStore()
const highlightsStore = useHighlightsStore()
const paymentStore = usePaymentStore()

// 响应式数据
const isLoading = ref(true)
const error = ref('')
const article = ref<any>(null)

// 计算属性
const hasPurchased = computed(() => {
  if (!article.value?.isPaid) return true
  return paymentStore.hasPurchased(article.value.id)
})

// 增强的文章对象，包含购买状态
const enhancedArticle = computed(() => {
  if (!article.value) return null
  return {
    ...article.value,
    isPurchased: hasPurchased.value
  }
})

const isLiked = computed(() => {
  return articlesStore.isLiked(article.value?.id)
})

const isBookmarked = computed(() => {
  return articlesStore.isBookmarked(article.value?.id)
})

const canEdit = computed(() => {
  return authStore.user?.id === article.value?.author?.id || authStore.user?.role === 'admin'
})

// 方法
const loadArticle = async () => {
  const articleId = route.params.id as string
  if (!articleId) {
    error.value = '文章ID无效'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    // 如果用户已登录，先加载购买记录
    if (authStore.isAuthenticated) {
      await paymentStore.loadUserPurchases()
    }

    await articlesStore.fetchArticle(articleId)
    article.value = articlesStore.currentArticle

    if (!article.value) {
      error.value = '文章不存在'
      return
    }

    // 增加浏览量
    await articlesStore.incrementViewCount(articleId)

    // 初始化高亮系统
    if (hasPurchased.value || !article.value.isPaid) {
      await highlightsStore.initializeForArticle(articleId)
    }

  } catch (err: any) {
    console.error('加载文章失败:', err)
    error.value = err.message || '加载文章时发生错误'
  } finally {
    isLoading.value = false
  }
}

// 事件处理
const handleSectionClick = (sectionId: string) => {
  const element = document.querySelector(`#${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleHighlightCreated = (highlight: any) => {
  console.log('高亮创建:', highlight)
}

const handleNoteCreated = (note: any) => {
  console.log('笔记创建:', note)
}

const handleHighlightClick = (highlight: any) => {
  console.log('高亮点击:', highlight)
}

const handleLike = async (articleId: string) => {
  try {
    await articlesStore.toggleLike(articleId)
    if (article.value) {
      article.value.likeCount = articlesStore.isLiked(articleId) 
        ? article.value.likeCount + 1 
        : article.value.likeCount - 1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const handleBookmark = async (articleId: string) => {
  try {
    await articlesStore.toggleBookmark(articleId)
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const handleShare = (platform: string, articleId: string) => {
  console.log('分享到:', platform, articleId)
}

const handleDownload = (articleId: string) => {
  console.log('下载文章:', articleId)
}

const handlePurchase = async (articleId: string) => {
  try {
    await paymentStore.purchaseArticle(articleId)
    await loadArticle()
  } catch (error) {
    console.error('购买失败:', error)
  }
}

const handleEdit = (articleId: string) => {
  router.push(`/articles/${articleId}/edit`)
}

const handleReport = (articleId: string) => {
  console.log('举报文章:', articleId)
}

const handleTagClick = (tag: string) => {
  router.push(`/articles?tag=${encodeURIComponent(tag)}`)
}

const handleAuthorClick = (authorId: string) => {
  router.push(`/authors/${authorId}`)
}

// 监听路由变化
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadArticle()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
/* 组件特定样式 */
</style>
