<template>
  <DSDefaultLayout>
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="space-y-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="text-2xl font-bold mb-2">文章加载失败</h2>
          <p class="text-gray-600">{{ error }}</p>
        </div>
        <DSButton @click="loadArticle" variant="primary">重试</DSButton>
      </div>

      <!-- 文章内容 -->
      <article v-else-if="article" class="prose prose-lg max-w-none">
        <!-- 文章头部 -->
        <header class="mb-8 pb-8 border-b border-gray-200">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ article.title }}</h1>

          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <img
                :src="article.author?.avatarUrl || '/default-avatar.png'"
                :alt="article.author?.nickname"
                class="w-12 h-12 rounded-full"
              />
              <div>
                <p class="font-medium text-gray-900">{{ article.author?.nickname }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(article.publishedAt) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center text-gray-500">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                {{ article.viewCount }}
              </div>

              <div class="flex items-center text-gray-500">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                {{ article.likeCount }}
              </div>

              <div v-if="article.isPaid" class="flex items-center text-purple-600">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                ¥{{ article.price }}
              </div>
            </div>
          </div>

          <!-- 文章摘要 -->
          <p v-if="article.excerpt" class="text-xl text-gray-600 leading-relaxed">
            {{ article.excerpt }}
          </p>
        </header>

        <!-- 付费文章购买提示 -->
        <div v-if="article.isPaid && !hasPurchased" class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-purple-900 mb-2">这是一篇付费文章</h3>
              <p class="text-purple-700">购买后可以阅读完整内容，并支持高亮和笔记功能</p>
            </div>
            <DSButton @click="purchaseArticle" variant="primary" :loading="isPurchasing">
              购买 ¥{{ article.price }}
            </DSButton>
          </div>
        </div>

        <!-- 文章正文 -->
        <div
          ref="contentRef"
          class="article-content"
          :class="{ 'blur-sm': article.isPaid && !hasPurchased }"
        >
          <VirtualHighlightRenderer
            :content="renderedContent"
            :virtual-nodes="highlightsStore.virtualNodes"
            :highlights="highlightsStore.highlights"
            :readonly="!canHighlight"
            @highlight-click="handleHighlightClick"
            @highlight-hover="handleHighlightHover"
            @selection-change="handleSelectionChange"
          />
        </div>

        <!-- 高亮工具栏 -->
        <HighlightToolbar
          v-if="showHighlightToolbar && (hasPurchased || !article.isPaid)"
          :visible="showHighlightToolbar"
          :position="toolbarPosition"
          @create-highlight="createHighlight"
          @create-note="createNote"
          @close="hideHighlightToolbar"
        />

        <!-- 文章底部操作 -->
        <footer class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <DSButton
                @click="toggleLike"
                :variant="isLiked ? 'primary' : 'outline'"
                :loading="isLiking"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                {{ isLiked ? '已点赞' : '点赞' }} ({{ article.likeCount }})
              </DSButton>

              <DSButton @click="shareArticle" variant="outline">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                分享
              </DSButton>
            </div>

            <div class="text-sm text-gray-500">
              最后更新：{{ formatDate(article.updatedAt) }}
            </div>
          </div>
        </footer>
      </article>
    </div>

    <!-- 支付弹窗 -->
    <PaymentModal :article-title="article?.title || ''" />
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticlesStore } from '../stores/articles'
import { useAuthStore } from '../stores/auth'
import { usePaymentStore } from '../stores/payment'
import { useHighlightsStore } from '../stores/highlights'
import { useNotesStore } from '../stores/notes'
import { eventBus } from '../utils/EventBus'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSButton from '../components/atoms/DSButton.vue'
import HighlightToolbar from '../components/molecules/HighlightToolbar.vue'
import VirtualHighlightRenderer from '../components/molecules/VirtualHighlightRenderer.vue'
import PaymentModal from '../components/molecules/PaymentModal.vue'
import type { Article } from '../types/api'
import type { SelectionRange, HighlightInfo } from '../types/virtual-dom'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const highlightsStore = useHighlightsStore()
const notesStore = useNotesStore()

// 响应式数据
const article = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isPurchasing = ref(false)
const isLiking = ref(false)
const isLiked = ref(false)
const hasPurchased = ref(false)
const showHighlightToolbar = ref(false)
const toolbarPosition = ref({ x: 0, y: 0 })
const contentRef = ref<HTMLElement>()

// 计算属性
const renderedContent = computed(() => {
  if (!article.value) return ''
  return article.value.content
})

const canHighlight = computed(() => {
  return authStore.isAuthenticated && (hasPurchased.value || !article.value?.isPaid)
})

// 方法
const loadArticle = async () => {
  try {
    isLoading.value = true
    error.value = null

    const articleId = route.params.id as string
    const result = await articlesStore.fetchArticle(articleId)

    if (result.success && result.data) {
      article.value = result.data

      // 检查是否已购买
      if (article.value.isPaid && authStore.user) {
        // 检查payment store中的购买状态
        hasPurchased.value = paymentStore.checkPurchaseStatus(article.value.id)
      } else if (!article.value.isPaid) {
        // 免费文章，直接设置为已购买
        hasPurchased.value = true
      } else {
        // 付费文章但用户未登录，设置为未购买
        hasPurchased.value = false
      }

      // 检查是否已点赞
      // 这里应该调用API检查点赞状态
      isLiked.value = false

      // 加载虚拟DOM和高亮数据
      await loadHighlightData(articleId)

    } else {
      error.value = result.error || '文章不存在'
    }
  } catch (err: any) {
    error.value = err.message || '加载文章失败'
  } finally {
    isLoading.value = false
  }
}

const purchaseArticle = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  if (!article.value) return

  try {
    isPurchasing.value = true

    // 使用PaymentModal进行支付
    await paymentStore.initPayment(
      article.value.id,
      article.value.title,
      article.value.price || 0
    )

  } catch (err: any) {
    eventBus.emit('notification:show', {
      type: 'error',
      message: err.message || '支付初始化失败'
    })
  } finally {
    isPurchasing.value = false
  }
}

const toggleLike = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    isLiking.value = true

    // 这里应该调用点赞API
    // 暂时模拟
    await new Promise(resolve => setTimeout(resolve, 500))

    isLiked.value = !isLiked.value
    if (article.value) {
      article.value.likeCount += isLiked.value ? 1 : -1
    }

  } catch (err: any) {
    eventBus.emit('notification:show', {
      type: 'error',
      message: '操作失败'
    })
  } finally {
    isLiking.value = false
  }
}

const shareArticle = () => {
  if (navigator.share && article.value) {
    navigator.share({
      title: article.value.title,
      text: article.value.excerpt,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    eventBus.emit('notification:show', {
      type: 'success',
      message: '链接已复制到剪贴板'
    })
  }
}

// 虚拟DOM和高亮相关方法
const loadHighlightData = async (articleId: string) => {
  try {
    // 解析文章内容为虚拟DOM
    if (article.value?.content) {
      await highlightsStore.parseArticleContent(article.value.content)
    }

    // 加载高亮数据
    await highlightsStore.loadHighlights(articleId)
  } catch (error) {
    console.error('Failed to load highlight data:', error)
  }
}

const handleSelectionChange = (range: SelectionRange | null) => {
  if (!canHighlight.value) return

  if (range) {
    highlightsStore.setCurrentSelection(range)

    // 计算工具栏位置
    if (range.metadata?.boundingRect) {
      const rect = range.metadata.boundingRect
      toolbarPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
      showHighlightToolbar.value = true
    }
  } else {
    showHighlightToolbar.value = false
    highlightsStore.setCurrentSelection(null)
  }
}

const handleHighlightClick = (highlight: HighlightInfo, event: MouseEvent) => {
  console.log('高亮被点击:', highlight)
  // 可以在这里显示高亮详情或编辑选项
}

const handleHighlightHover = (highlight: HighlightInfo | null, event: MouseEvent) => {
  // 可以在这里显示高亮预览或工具提示
}

const createHighlight = async (color: string) => {
  try {
    const selection = highlightsStore.currentSelection
    if (!selection) {
      console.warn('No selection available for highlight creation')
      return
    }

    const result = await highlightsStore.createHighlight(selection, color)
    if (result.success) {
      eventBus.emit('notification:show', {
        type: 'success',
        message: '高亮创建成功'
      })
    } else {
      eventBus.emit('notification:show', {
        type: 'error',
        message: result.error || '创建高亮失败'
      })
    }
  } catch (error) {
    console.error('Failed to create highlight:', error)
    eventBus.emit('notification:show', {
      type: 'error',
      message: '创建高亮失败'
    })
  } finally {
    hideHighlightToolbar()
  }
}

const createNote = async (noteText: string, color?: string) => {
  try {
    const selection = highlightsStore.currentSelection
    if (!selection) {
      console.warn('No selection available for note creation')
      return
    }

    // 先创建高亮（如果指定了颜色）
    let highlightId: string | undefined
    if (color) {
      const highlightResult = await highlightsStore.createHighlight(selection, color)
      if (highlightResult.success && highlightResult.data) {
        highlightId = highlightResult.data.id
      }
    }

    // 创建笔记
    const noteResult = await notesStore.createNote({
      articleId: article.value!.id,
      content: noteText,
      type: color ? 'both' : 'note',
      highlightId,
      virtualNodeId: selection.startNodeId,
      positionData: {
        startOffset: selection.startOffset,
        endOffset: selection.endOffset,
        selectedText: selection.text
      }
    })

    if (noteResult.success) {
      eventBus.emit('notification:show', {
        type: 'success',
        message: color ? '高亮笔记创建成功' : '笔记创建成功'
      })
    } else {
      eventBus.emit('notification:show', {
        type: 'error',
        message: noteResult.error || '创建笔记失败'
      })
    }
  } catch (error) {
    console.error('Failed to create note:', error)
    eventBus.emit('notification:show', {
      type: 'error',
      message: '创建笔记失败'
    })
  } finally {
    hideHighlightToolbar()
  }
}

const hideHighlightToolbar = () => {
  showHighlightToolbar.value = false
  highlightsStore.setCurrentSelection(null)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 生命周期
onMounted(() => {
  loadArticle()

  // 监听支付成功事件
  eventBus.on('payment:completed', (payload) => {
    if (article.value && payload.orderId) {
      hasPurchased.value = true

      eventBus.emit('notification:show', {
        type: 'success',
        message: '支付成功！现在可以阅读完整内容了'
      })
    }
  })

  // 初始化payment store
  paymentStore.init()
})
</script>

<style scoped>
.article-content {
  line-height: 1.8;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  @apply font-bold text-gray-900 mt-8 mb-4;
}

.article-content :deep(h1) {
  @apply text-3xl;
}

.article-content :deep(h2) {
  @apply text-2xl;
}

.article-content :deep(h3) {
  @apply text-xl;
}

.article-content :deep(p) {
  @apply mb-4 text-gray-700;
}

.article-content :deep(blockquote) {
  @apply border-l-4 border-purple-500 pl-4 italic text-gray-600 my-6;
}

.article-content :deep(code) {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

.article-content :deep(pre) {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-6;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  @apply ml-6 mb-4;
}

.article-content :deep(li) {
  @apply mb-2;
}
</style>
