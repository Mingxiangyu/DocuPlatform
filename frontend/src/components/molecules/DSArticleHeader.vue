<template>
  <header class="article-header">
    <!-- 文章状态和统计 -->
    <div class="article-meta">
      <!-- 付费状态标签 -->
      <span class="article-status">
        <i :class="article?.isPaid ? 'fas fa-crown' : 'fas fa-unlock'"></i>
        {{ article?.isPaid ? `¥${article.price}` : '免费阅读' }}
      </span>

      <!-- 文章统计 -->
      <div class="article-stats">
        <span class="stat-item">
          <i class="fas fa-eye"></i>
          <span>{{ formatNumber(article?.viewCount || 0) }} 阅读</span>
        </span>
        <span class="stat-item">
          <i class="fas fa-heart"></i>
          <span>{{ formatNumber(article?.likeCount || 0) }} 点赞</span>
        </span>
        <span v-if="article?.commentCount" class="stat-item">
          <i class="fas fa-comment"></i>
          <span>{{ formatNumber(article.commentCount) }} 评论</span>
        </span>
      </div>
    </div>

    <!-- 文章标题 -->
    <h1 class="article-title">
      {{ article?.title || '文章标题' }}
    </h1>

    <!-- 文章描述 -->
    <p v-if="article?.description" class="article-description">
      {{ article.description }}
    </p>

    <!-- 作者信息和发布时间 -->
    <div class="article-author-info">
      <!-- 作者信息 -->
      <div class="author-info">
        <img
          :src="author?.avatarUrl || '/default-avatar.png'"
          :alt="author?.nickname || '作者'"
          class="author-avatar"
          @error="handleAvatarError"
        >
        <div class="author-details">
          <div class="author-name">
            {{ author?.nickname || '匿名作者' }}
          </div>
          <div v-if="author?.title" class="author-title">
            {{ author.title }}
          </div>
        </div>
      </div>

      <!-- 发布时间 -->
      <div class="publish-info">
        <i class="far fa-calendar-alt"></i>
        <span>发布于 {{ formatDate(article?.createdAt) }}</span>
      </div>

      <!-- 更新时间（如果有） -->
      <div
        v-if="article?.updatedAt && article.updatedAt !== article.createdAt"
        class="update-info"
      >
        <i class="far fa-edit"></i>
        <span>更新于 {{ formatDate(article.updatedAt) }}</span>
      </div>

      <!-- 阅读时间估算 -->
      <div v-if="readingTime" class="reading-time">
        <i class="far fa-clock"></i>
        <span>约 {{ readingTime }} 分钟阅读</span>
      </div>
    </div>
    
    <!-- 文章标签 -->
    <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-2">
      <span 
        v-for="tag in tags" 
        :key="tag"
        class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
        @click="handleTagClick(tag)"
      >
        {{ tag }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'

// Props
interface Props {
  article?: {
    id: string
    title: string
    description?: string
    isPaid: boolean
    price?: number
    viewCount: number
    likeCount: number
    commentCount?: number
    createdAt: string
    updatedAt?: string
    content?: string
  }
  author?: {
    id: string
    nickname: string
    avatarUrl?: string
    title?: string
  }
  tags?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  article: undefined,
  author: undefined,
  tags: () => []
})

// Emits
const emit = defineEmits<{
  tagClick: [tag: string]
  authorClick: [authorId: string]
}>()

// 设计令牌
const { tokens } = useDesignTokens()

// 路由
const router = useRouter()

// 计算阅读时间（基于内容长度估算）
const readingTime = computed(() => {
  if (!props.article?.content) return null
  
  const wordsPerMinute = 200 // 中文阅读速度约200字/分钟
  const contentLength = props.article.content.length
  const minutes = Math.ceil(contentLength / wordsPerMinute)
  
  return minutes
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// 处理头像加载错误
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-avatar.png'
}

// 处理标签点击
const handleTagClick = (tag: string) => {
  emit('tagClick', tag)
  router.push(`/articles?tag=${encodeURIComponent(tag)}`)
}

// 处理作者点击
const handleAuthorClick = () => {
  if (props.author?.id) {
    emit('authorClick', props.author.id)
    router.push(`/authors/${props.author.id}`)
  }
}
</script>

<style scoped>
.article-header {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

/* 修复SVG图标尺寸问题 */
.icon-size {
  width: 1rem !important;
  height: 1rem !important;
  flex-shrink: 0;
}

/* 标题字体 */
h1 {
  font-family: v-bind('tokens.typography.fontFamily.serif?.join(", ") || tokens.typography.fontFamily.sans.join(", ")');
}

/* 头像悬停效果 */
.article-header img {
  transition: transform 0.2s ease;
}

.article-header img:hover {
  transform: scale(1.05);
}

/* 标签悬停效果 */
.article-header span[role="button"] {
  transition: all 0.2s ease;
}

/* 响应式设计 */
@media (max-width: 640px) {
  h1 {
    font-size: v-bind('tokens.typography.fontSize.xl[0]');
    line-height: v-bind('tokens.typography.fontSize.xl[1].lineHeight');
  }
  
  .flex-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
