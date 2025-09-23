<template>
  <div class="toc-container">
    <h3 class="toc-title">
      目录
    </h3>

    <!-- 使用 md-editor-v3 的目录组件 -->
    <MdCatalog
      v-if="showCatalog"
      :editorId="'article-preview-art-paid-purchased'"
      :scrollElement="scrollElement"
      :theme="'default'"
      class="md-catalog-custom"
    />

    <!-- 空状态 -->
    <div v-else class="toc-empty">
      <i class="fas fa-list-ul"></i>
      <p>暂无目录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'
import { MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

// Props
interface Props {
  editorId?: string
  scrollElement?: string | HTMLElement
  content?: string
  autoGenerate?: boolean
  maxLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  editorId: '',
  scrollElement: 'html',
  content: '',
  autoGenerate: true,
  maxLevel: 4
})

// 响应式状态
const showCatalog = ref(false)

// 调试信息
console.log('DSTableOfContents - editorId:', props.editorId)
console.log('DSTableOfContents - editorId type:', typeof props.editorId)
console.log('DSTableOfContents - editorId length:', props.editorId?.length)

// 延迟显示目录，等待 MdPreview 组件完全渲染
onMounted(() => {
  setTimeout(() => {
    showCatalog.value = true
  }, 1000) // 1秒延迟
})

// Emits
const emit = defineEmits<{
  sectionClick: [sectionId: string]
}>()

// 设计令牌
const { tokens } = useDesignTokens()

// MdCatalog 组件会自动处理目录生成和滚动监听
// 这里只需要保留基本的响应式数据和生命周期管理
</script>

<style scoped>
.toc-container {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

.toc-title {
  font-size: v-bind('tokens.typography.fontSize.lg[0]');
  font-weight: 600;
  color: v-bind('tokens.colors.gray[900]');
  margin-bottom: 1rem;
}

.toc-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: v-bind('tokens.colors.gray[500]');
}

.toc-empty i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* MdCatalog 自定义样式 */
.md-catalog-custom {
  background: transparent;
  border: none;
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

/* 自定义滚动条样式 */
.md-catalog-custom :deep(.md-catalog-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: v-bind('tokens.colors.gray[300]') transparent;
}

.md-catalog-custom :deep(.md-catalog-wrapper)::-webkit-scrollbar {
  width: 4px;
}

.md-catalog-custom :deep(.md-catalog-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}

.md-catalog-custom :deep(.md-catalog-wrapper)::-webkit-scrollbar-thumb {
  background-color: v-bind('tokens.colors.gray[300]');
  border-radius: 2px;
}

.md-catalog-custom :deep(.md-catalog-wrapper)::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('tokens.colors.gray[400]');
}

/* 目录项样式 */
.md-catalog-custom :deep(.md-catalog-link) {
  color: v-bind('tokens.colors.gray[600]');
  font-size: v-bind('tokens.typography.fontSize.sm[0]');
  line-height: v-bind('tokens.typography.fontSize.sm[1].lineHeight');
  padding: 0.25rem 0;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.md-catalog-custom :deep(.md-catalog-link:hover) {
  color: v-bind('tokens.colors.purple[600]');
  background-color: v-bind('tokens.colors.purple[50]');
}

.md-catalog-custom :deep(.md-catalog-link.active) {
  color: v-bind('tokens.colors.purple[700]');
  background-color: v-bind('tokens.colors.purple[100]');
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .md-catalog-custom {
    max-height: 300px;
  }
}
</style>
