<template>
  <Card :hover="true" class="article-card">
    <div class="relative">
      <img
        v-if="article.coverImageUrl"
        :src="article.coverImageUrl"
        :alt="article.title"
        class="w-full h-48 object-cover rounded-t-md"
      />
      <div
        v-else
        class="w-full h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-md flex items-center justify-center"
      >
        <span class="text-white text-lg font-medium">{{ article.title.charAt(0) }}</span>
      </div>
      
      <!-- 付费标识 -->
      <div v-if="article.isPaid" class="absolute top-2 right-2">
        <span class="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          ¥{{ article.price }}
        </span>
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <span v-if="article.category" class="text-xs text-purple-600 font-medium">
          {{ article.category.name }}
        </span>
        <span class="text-xs text-gray-500">
          {{ formatDate(article.publishedAt || article.createdAt) }}
        </span>
      </div>

      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ article.title }}
      </h3>

      <p v-if="article.excerpt" class="text-gray-600 text-sm mb-4 line-clamp-3">
        {{ article.excerpt }}
      </p>

      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            {{ article.viewCount }}
          </span>
          
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
            {{ article.likeCount }}
          </span>
        </div>

        <div class="flex items-center">
          <img
            v-if="article.author.avatarUrl"
            :src="article.author.avatarUrl"
            :alt="article.author.nickname"
            class="w-6 h-6 rounded-full mr-2"
          />
          <span class="text-sm text-gray-600">{{ article.author.nickname }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="$emit('view', article.id)"
        >
          阅读
        </Button>
        
        <Button
          v-if="article.isPaid && !isPurchased"
          variant="primary"
          size="sm"
          @click="$emit('purchase', article.id)"
        >
          购买
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('like', article.id)"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
        </Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '../atoms/Card.vue'
import Button from '../atoms/Button.vue'
import type { Article } from '../../types/api'

interface Props {
  article: Article
  isPurchased?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPurchased: false
})

const emit = defineEmits<{
  view: [articleId: string]
  purchase: [articleId: string]
  like: [articleId: string]
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.article-card {
  @apply overflow-hidden;
}

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
</style>
