<template>
  <div class="article-content-wrapper">
    <!-- 付费文章购买提示 -->
    <div 
      v-if="isPaid && !isPurchased" 
      class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-purple-900 mb-2">
            <i class="fas fa-crown mr-2"></i>
            这是一篇付费文章
          </h3>
          <p class="text-purple-700">
            购买后可以阅读完整内容，并支持高亮和笔记功能
          </p>
        </div>
        <DSButton 
          @click="handlePurchase" 
          variant="primary" 
          :loading="isPurchasing"
          class="flex items-center space-x-2"
        >
          <i class="fas fa-shopping-cart"></i>
          <span>购买 ¥{{ price }}</span>
        </DSButton>
      </div>
    </div>

    <!-- 文章正文内容 -->
    <div
      ref="contentRef"
      class="article-content prose prose-lg max-w-none"
      :class="{ 
        'blur-sm pointer-events-none': isPaid && !isPurchased,
        'font-serif': useSerifFont 
      }"
    >
      <!-- 虚拟DOM高亮渲染器 -->
      <VirtualHighlightRenderer
        v-if="enableHighlights && (isPurchased || !isPaid)"
        :content="renderedContent"
        :virtual-nodes="virtualNodes"
        :highlights="highlights"
        :readonly="!canHighlight"
        @highlight-click="handleHighlightClick"
        @highlight-hover="handleHighlightHover"
        @selection-change="handleSelectionChange"
      />
      
      <!-- 普通内容渲染（无高亮功能） -->
      <div 
        v-else
        v-html="renderedContent"
        class="rendered-content"
      ></div>
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
// import { marked } from 'marked' // 暂时注释掉，使用简单的HTML渲染

// Props
interface Props {
  content?: string
  isPaid?: boolean
  isPurchased?: boolean
  price?: number
  enableHighlights?: boolean
  useSerifFont?: boolean
  isLoading?: boolean
  articleId?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  isPaid: false,
  isPurchased: false,
  price: 0,
  enableHighlights: true,
  useSerifFont: true,
  isLoading: false,
  articleId: ''
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
  if (!props.content) return ''

  // 简单的Markdown到HTML转换（临时解决方案）
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
