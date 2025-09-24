<template>
  <div class="article-content-wrapper">
    <!-- 增强的付费界面 -->
    <EnhancedPaywall
      v-if="isPaid && !isPurchased"
      :price="price || 29.99"
      :original-price="originalPrice || (price || 29.99) * 1.67"
      :word-count="articleWordCount"
      :knowledge-points="articleKnowledgePoints"
      :purchase-count="purchaseCount || 0"
      :satisfaction-rate="satisfactionRate || 0"
      :reading-time="articleReadingTime"
      :author="articleAuthor"
      :reviews="articleReviews"
      :is-purchasing="isPurchasing"
      @purchase="handlePurchase"
    />

    <!-- 文章正文内容 -->
    <div
      ref="contentRef"
      class="article-content"
      :class="{
        'blur-sm pointer-events-none': isPaid && !isPurchased,
        'font-serif': useSerifFont
      }"
    >
      <!-- Markdown 预览组件（暂时强制使用以测试） -->
      <MdPreview
        :id="props.previewId || `article-preview-${props.articleId || Date.now()}`"
        :modelValue="props.content"
        :theme="'default'"
        :codeTheme="'github'"
        class="md-preview-custom"
      />
    </div>

    <!-- 高亮工具栏 -->
    <HighlightToolbar
      v-if="showHighlightToolbar && (isPurchased || !isPaid) && enableHighlights"
      :visible="showHighlightToolbar"
      :position="toolbarPosition"
      @create-highlight="handleCreateHighlight"
      @create-note="handleCreateNote"
      @close="hideHighlightToolbar"
    />

    <!-- 内容加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <DSSkeletonLoader 
        variant="text" 
        :lines="8" 
        animated 
        class="w-full max-w-4xl"
      />
    </div>

    <!-- 内容为空状态 -->
    <div v-if="!isLoading && !content" class="text-center py-12 text-gray-500">
      <i class="fas fa-file-alt text-4xl mb-4 opacity-50"></i>
      <p>暂无内容</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'
import { useHighlightsStore } from '@/stores/highlights'
import { usePaymentStore } from '@/stores/payment'
import { useAuthStore } from '@/stores/auth'
import DSButton from '@/components/atoms/DSButton.vue'
import DSSkeletonLoader from '@/components/atoms/DSSkeletonLoader.vue'
import VirtualHighlightRenderer from '@/components/molecules/VirtualHighlightRenderer.vue'
import HighlightToolbar from '@/components/molecules/HighlightToolbar.vue'
import EnhancedPaywall from '@/components/molecules/EnhancedPaywall.vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import 'md-editor-v3/lib/style.css'

// Props
interface Props {
  content?: string
  isPaid?: boolean
  isPurchased?: boolean
  price?: number
  originalPrice?: number
  wordCount?: number
  knowledgePoints?: number
  purchaseCount?: number
  satisfactionRate?: number
  readingTime?: number
  author?: {
    id: string
    nickname: string
    avatarUrl?: string
    bio?: string
    rating?: number
    reviewCount?: number
    quote?: string
  }
  reviews?: Array<{
    id: string
    name: string
    avatarUrl: string
    rating: number
    comment: string
  }>
  enableHighlights?: boolean
  useSerifFont?: boolean
  isLoading?: boolean
  articleId?: string
  previewId?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  isPaid: false,
  isPurchased: false,
  price: 0,
  originalPrice: 0,
  wordCount: 0,
  knowledgePoints: 0,
  purchaseCount: 0,
  satisfactionRate: 0,
  readingTime: 0,
  enableHighlights: true,
  useSerifFont: true,
  isLoading: false,
  articleId: '',
  previewId: ''
})

// Emits
const emit = defineEmits<{
  purchase: [articleId: string]
  highlightCreated: [highlight: any]
  noteCreated: [note: any]
  highlightClick: [highlight: any]
}>()

// Stores
const highlightsStore = useHighlightsStore()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

// 设计令牌
const { tokens } = useDesignTokens()

// 响应式数据
const contentRef = ref<HTMLElement>()
const isPurchasing = ref(false)
const showHighlightToolbar = ref(false)
const toolbarPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const selectedRange = ref<Range | null>(null)


// 计算属性
const renderedContent = computed(() => {
  // 保留用于高亮功能的简单渲染
  if (!props.content) return ''
  return props.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
})

const canHighlight = computed(() => {
  return authStore.isAuthenticated && (props.isPurchased || !props.isPaid)
})

const virtualNodes = computed(() => {
  return highlightsStore.virtualNodes
})

const highlights = computed(() => {
  return highlightsStore.highlights.filter(h => h.articleId === props.articleId)
})

// 文章统计信息 - 使用真实数据或计算fallback
const articleWordCount = computed(() => {
  if (props.wordCount && props.wordCount > 0) {
    return props.wordCount
  }
  if (!props.content) return 0
  // Fallback: 简单的中文字数统计
  const chineseChars = (props.content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (props.content.match(/[a-zA-Z]+/g) || []).length
  return chineseChars + englishWords
})

const articleReadingTime = computed(() => {
  if (props.readingTime && props.readingTime > 0) {
    return props.readingTime
  }
  // Fallback: 按照中文每分钟300字计算
  return Math.ceil(articleWordCount.value / 300)
})

const articleKnowledgePoints = computed(() => {
  if (props.knowledgePoints && props.knowledgePoints > 0) {
    return props.knowledgePoints
  }
  if (!props.content) return 0
  // Fallback: 根据标题数量估算知识点
  const headings = (props.content.match(/#{1,6}\s/g) || []).length
  return Math.max(headings, 3)
})

// 作者信息 - 使用真实数据
const articleAuthor = computed(() => {
  if (props.author) {
    return {
      name: props.author.nickname || '匿名作者',
      title: props.author.bio || '内容创作者',
      avatarUrl: props.author.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
      rating: props.author.rating || 4.5,
      reviewCount: props.author.reviewCount || 0,
      quote: props.author.quote || '感谢您阅读我的文章，希望对您有所帮助。'
    }
  }
  return null
})

// 评价信息 - 使用真实数据
const articleReviews = computed(() => {
  return props.reviews || []
})

// 购买处理
const handlePurchase = async () => {
  if (!authStore.isAuthenticated) {
    // 跳转到登录页面
    return
  }
  
  isPurchasing.value = true
  try {
    await paymentStore.purchaseArticle(props.articleId)
    emit('purchase', props.articleId)
  } catch (error) {
    console.error('购买失败:', error)
  } finally {
    isPurchasing.value = false
  }
}

// 高亮相关处理
const handleHighlightClick = (highlight: any) => {
  emit('highlightClick', highlight)
}

const handleHighlightHover = (highlight: any) => {
  // 处理高亮悬停
}

const handleSelectionChange = (selection: any) => {
  if (!selection || !selection.text.trim()) {
    hideHighlightToolbar()
    return
  }
  
  selectedText.value = selection.text
  selectedRange.value = selection.range
  
  // 计算工具栏位置
  const rect = selection.range.getBoundingClientRect()
  toolbarPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  }
  
  showHighlightToolbar.value = true
}

const handleCreateHighlight = async (color: string) => {
  if (!selectedRange.value || !selectedText.value) return
  
  try {
    const highlight = await highlightsStore.createHighlight({
      articleId: props.articleId,
      text: selectedText.value,
      color,
      range: selectedRange.value
    })
    
    emit('highlightCreated', highlight)
    hideHighlightToolbar()
  } catch (error) {
    console.error('创建高亮失败:', error)
  }
}

const handleCreateNote = async (noteText: string, color: string) => {
  if (!selectedRange.value || !selectedText.value) return
  
  try {
    const note = await highlightsStore.createNote({
      articleId: props.articleId,
      text: selectedText.value,
      note: noteText,
      color,
      range: selectedRange.value
    })
    
    emit('noteCreated', note)
    hideHighlightToolbar()
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

const hideHighlightToolbar = () => {
  showHighlightToolbar.value = false
  selectedText.value = ''
  selectedRange.value = null
  
  // 清除选择
  if (window.getSelection) {
    window.getSelection()?.removeAllRanges()
  }
}

// 生命周期
onMounted(async () => {
  if (props.articleId && props.enableHighlights) {
    await nextTick()
    // 初始化虚拟DOM高亮系统
    await highlightsStore.initializeForArticle(props.articleId)
  }
})

onUnmounted(() => {
  hideHighlightToolbar()
})
</script>

<style scoped>
.article-content-wrapper {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

/* 文章内容样式 */
.article-content {
  line-height: 1.8;
  color: v-bind('tokens.colors.gray[700]');
}

.article-content.font-serif {
  font-family: v-bind('tokens.typography.fontFamily.serif?.join(", ") || tokens.typography.fontFamily.sans.join(", ")');
}

/* MdPreview 自定义样式 */
.md-preview-custom {
  background: transparent;
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

.md-preview-custom.font-serif {
  font-family: v-bind('tokens.typography.fontFamily.serif?.join(", ") || tokens.typography.fontFamily.sans.join(", ")');
}

/* 修复代码块样式 */
.md-preview-custom :deep(.md-editor-code) {
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid v-bind('tokens.colors.gray[200]');
}

.md-preview-custom :deep(.md-editor-code summary) {
  background: v-bind('tokens.colors.gray[50]');
  padding: 0.75rem 1rem;
  border-bottom: 1px solid v-bind('tokens.colors.gray[200]');
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('tokens.colors.gray[700]');
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.md-preview-custom :deep(.md-editor-code summary:hover) {
  background: v-bind('tokens.colors.gray[100]');
}

.md-preview-custom :deep(.md-editor-code pre) {
  margin: 0 !important;
  background: v-bind('tokens.colors.gray[900]') !important;
  padding: 1.5rem !important;
  border-radius: 0 !important;
  overflow-x: auto;
}

.md-preview-custom :deep(.md-editor-code code) {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: v-bind('tokens.colors.gray[100]') !important;
  display: block !important;
  white-space: pre !important;
}

/* 语法高亮颜色修复 */
.md-preview-custom :deep(.hljs-keyword) {
  color: #c678dd !important;
}

.md-preview-custom :deep(.hljs-string) {
  color: #98c379 !important;
}

.md-preview-custom :deep(.hljs-number) {
  color: #d19a66 !important;
}

.md-preview-custom :deep(.hljs-comment) {
  color: #5c6370 !important;
  font-style: italic;
}

.md-preview-custom :deep(.hljs-function) {
  color: #61afef !important;
}

.md-preview-custom :deep(.hljs-title) {
  color: #e06c75 !important;
}

.md-preview-custom :deep(.hljs-built_in) {
  color: #e5c07b !important;
}

.md-preview-custom :deep(.hljs-attr) {
  color: #d19a66 !important;
}

.md-preview-custom :deep(.hljs-params) {
  color: #abb2bf !important;
}

/* 复制按钮样式 */
.md-preview-custom :deep(.md-editor-code .copy-button) {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: v-bind('tokens.colors.gray[700]');
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.md-preview-custom :deep(.md-editor-code .copy-button:hover) {
  opacity: 1;
  background: v-bind('tokens.colors.gray[600]');
}

/* 行号样式（如果启用） */
.md-preview-custom :deep(.md-editor-code .line-numbers) {
  background: v-bind('tokens.colors.gray[800]');
  color: v-bind('tokens.colors.gray[400]');
  padding: 1.5rem 0.75rem;
  border-right: 1px solid v-bind('tokens.colors.gray[700]');
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  user-select: none;
}

/* 代码块容器的相对定位 */
.md-preview-custom :deep(.md-editor-code) {
  position: relative;
}

/* 确保代码块在整体布局中的间距 */
.md-preview-custom :deep(.md-editor-code + .md-editor-code) {
  margin-top: 2rem;
}

/* 内联代码样式 */
.md-preview-custom :deep(p code),
.md-preview-custom :deep(li code),
.md-preview-custom :deep(td code) {
  background: v-bind('tokens.colors.purple[50]') !important;
  color: v-bind('tokens.colors.purple[700]') !important;
  padding: 0.125rem 0.375rem !important;
  border-radius: 4px !important;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace !important;
  font-size: 0.875em !important;
  border: 1px solid v-bind('tokens.colors.purple[200]') !important;
}

/* Prose样式优化 */
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  color: v-bind('tokens.colors.gray[900]');
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(h1) { font-size: 2rem; }
.prose :deep(h2) { font-size: 1.75rem; }
.prose :deep(h3) { font-size: 1.5rem; }
.prose :deep(h4) { font-size: 1.25rem; }

.prose :deep(p) {
  margin-bottom: 1.5rem;
  text-align: justify;
}

.prose :deep(blockquote) {
  border-left: 4px solid v-bind('tokens.colors.purple[500]');
  padding-left: 1rem;
  font-style: italic;
  color: v-bind('tokens.colors.gray[600]');
  margin: 1.5rem 0;
}

.prose :deep(code) {
  background-color: v-bind('tokens.colors.gray[100]');
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.prose :deep(pre) {
  background-color: v-bind('tokens.colors.gray[900]');
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

/* 付费内容模糊效果 */
.blur-sm {
  filter: blur(4px);
  user-select: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prose {
    font-size: 1rem;
  }
  
  .prose :deep(h1) { font-size: 1.75rem; }
  .prose :deep(h2) { font-size: 1.5rem; }
  .prose :deep(h3) { font-size: 1.25rem; }
}
</style>
