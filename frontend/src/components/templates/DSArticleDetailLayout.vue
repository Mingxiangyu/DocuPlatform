<template>
  <div class="article-detail-layout min-h-screen bg-gray-50">
    <!-- 滚动进度条 -->
    <div 
      class="progress-bar fixed top-0 left-0 h-1 bg-purple-600 z-50 transition-all duration-100"
      :style="{ width: scrollProgress + '%' }"
    ></div>

    <!-- 文档操作栏 - 完全匹配高保真原型 -->
    <div class="article-toolbar bg-white border-b border-gray-200 py-3 sticky top-16 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- 面包屑导航 -->
          <div class="flex items-center">
            <slot name="breadcrumb">
              <DSBreadcrumbNavigation />
            </slot>
          </div>

          <!-- 文章操作按钮 -->
          <div class="actions-container">
            <slot name="actions">
              <DSArticleActions />
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- 左侧目录导航 -->
        <div class="lg:col-span-3 order-2 lg:order-1">
          <div class="bg-white rounded-lg shadow-sm p-5 sticky top-28 self-start">
            <slot name="table-of-contents">
              <DSTableOfContents
                :content="articleContent"
                @section-click="handleSectionClick"
              />
            </slot>
          </div>
        </div>

        <!-- 中间文章内容 -->
        <div class="lg:col-span-6 order-1 lg:order-2">
          <article class="bg-white rounded-lg shadow-sm p-8 mb-6">
            <!-- 文章头部信息 -->
            <slot name="article-header">
              <DSArticleHeader 
                :article="article"
                :author="author"
                :tags="tags"
              />
            </slot>
            
            <!-- 文章内容 -->
            <slot name="article-content">
              <DSArticleContent 
                :content="articleContent"
                :is-paid="article?.isPaid"
                :is-purchased="article?.isPurchased"
                @highlight-created="handleHighlightCreated"
              />
            </slot>
          </article>
        </div>

        <!-- 右侧留白区域 -->
        <div class="lg:col-span-2 order-3 lg:order-3">
          <!-- 纯留白区域，匹配高保真原型 -->
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'
import DSBreadcrumbNavigation from '@/components/molecules/DSBreadcrumbNavigation.vue'
import DSTableOfContents from '@/components/molecules/DSTableOfContents.vue'
import DSArticleHeader from '@/components/molecules/DSArticleHeader.vue'
import DSArticleContent from '@/components/organisms/DSArticleContent.vue'
import DSArticleActions from '@/components/molecules/DSArticleActions.vue'

// Props
interface Props {
  article?: any
  author?: any
  tags?: string[]
  articleContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  article: null,
  author: null,
  tags: () => [],
  articleContent: ''
})

// Emits
const emit = defineEmits<{
  sectionClick: [sectionId: string]
  highlightCreated: [highlight: any]
}>()

// 设计令牌
const { tokens } = useDesignTokens()

// 滚动进度条
const scrollProgress = ref(0)

// 滚动监听
const handleScroll = () => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const scrolled = (winScroll / height) * 100
  scrollProgress.value = Math.min(100, Math.max(0, scrolled))
}

// 章节点击处理
const handleSectionClick = (sectionId: string) => {
  emit('sectionClick', sectionId)
  
  // 平滑滚动到目标章节
  const targetElement = document.querySelector(`#${sectionId}`)
  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop - 120,
      behavior: 'smooth'
    })
  }
}

// 高亮创建处理
const handleHighlightCreated = (highlight: any) => {
  emit('highlightCreated', highlight)
}

// 生命周期
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // 初始化进度条
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-detail-layout {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

.progress-bar {
  background: linear-gradient(90deg, 
    v-bind('tokens.colors.purple[500]') 0%, 
    v-bind('tokens.colors.purple[600]') 100%
  );
}

/* 响应式设计 */
@media (max-width: 767px) {
  .lg\:col-span-1 {
    position: static !important;
  }

  .sticky {
    position: static !important;
  }
}

/* 滚动优化 */
@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    transition: none;
  }
}
</style>
