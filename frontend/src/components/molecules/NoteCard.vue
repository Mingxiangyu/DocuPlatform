<template>
  <div class="note-card bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
    <!-- 笔记头部信息 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <span>{{ note.position }}</span>
        <span>•</span>
        <span>{{ formatDate(note.createdAt) }}</span>
        
        <!-- 笔记类型标识 -->
        <span
          v-if="note.type === 'both'"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
          </svg>
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </span>
        <span
          v-else-if="note.type === 'highlight'"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
          </svg>
          划线
        </span>
        <span
          v-else
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          笔记
        </span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center space-x-2">
        <DSButton
          @click="$emit('edit', note)"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-purple-600"
          title="编辑"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </DSButton>
        
        <DSButton
          @click="$emit('delete', note)"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-red-600"
          title="删除"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </DSButton>
      </div>
    </div>

    <!-- 高亮文本 -->
    <div
      v-if="note.highlightText"
      :class="[
        'p-3 rounded-lg mb-3 border-l-2',
        highlightColorClasses[note.highlightColor]
      ]"
    >
      <div class="text-gray-800 leading-relaxed">
        "{{ note.highlightText }}"
      </div>
    </div>

    <!-- 笔记文本 -->
    <div v-if="note.noteText" class="bg-gray-50 p-3 rounded-lg">
      <div class="flex items-center mb-2">
        <svg class="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span class="text-sm font-medium text-gray-700">我的想法</span>
      </div>
      <p class="text-gray-700 leading-relaxed">{{ note.noteText }}</p>
    </div>

    <!-- 文章信息（仅在时间线视图中显示） -->
    <div v-if="showArticleInfo" class="mt-4 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-900 text-sm">{{ note.articleTitle }}</h4>
          <p class="text-xs text-gray-500">作者：{{ note.articleAuthor }}</p>
        </div>
        <DSButton
          @click="$emit('view-article', note.articleId)"
          variant="outline"
          size="sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          查看原文
        </DSButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DSButton from '../atoms/DSButton.vue'
import type { Note } from '../../stores/notes'

interface Props {
  note: Note
  showArticleInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showArticleInfo: false
})

const emit = defineEmits<{
  edit: [note: Note]
  delete: [note: Note]
  'view-article': [articleId: string]
}>()

// 高亮颜色样式映射
const highlightColorClasses = {
  yellow: 'bg-yellow-100 border-yellow-400',
  blue: 'bg-blue-100 border-blue-400',
  green: 'bg-green-100 border-green-400',
  purple: 'bg-purple-100 border-purple-400'
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return '刚刚'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}小时前`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.note-card {
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-2px);
}
</style>
