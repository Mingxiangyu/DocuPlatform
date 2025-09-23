<template>
  <div class="flex items-center space-x-3">
    <!-- 分享按钮 -->
    <button
      @click="handleShare"
      class="btn-secondary"
      :disabled="false"
    >
      <i class="fas fa-share-alt text-sm"></i>
      <span>分享</span>
    </button>

    <!-- 收藏按钮 -->
    <button
      @click="handleBookmark"
      :class="[
        isBookmarked ? 'btn-primary' : 'btn-secondary'
      ]"
      :disabled="isBookmarking"
    >
      <i :class="[
        'text-sm',
        isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'
      ]"></i>
      <span>{{ isBookmarked ? '已收藏' : '收藏' }}</span>
    </button>

    <!-- 下载按钮 -->
    <button
      @click="handleDownload"
      class="btn-secondary"
      :disabled="isDownloading"
    >
      <i class="fas fa-download text-sm"></i>
      <span>{{ isDownloading ? '下载中...' : '下载' }}</span>
    </button>

    <!-- 完整阅读按钮 -->
    <button
      @click="handlePurchase"
      class="btn-primary"
      :disabled="isPurchasing"
      style="background: #9333ea !important; color: white !important;"
    >
      <i class="fas fa-crown text-sm"></i>
      <span>{{ isPurchasing ? '购买中...' : '完整阅读' }}</span>
    </button>
  </div>

  <!-- 分享弹窗 -->
  <DSModal
    v-if="showShareModal"
    @close="showShareModal = false"
    title="分享文章"
    size="sm"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <button
          @click="shareToWeChat"
          class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <i class="fab fa-weixin text-2xl text-green-500 mb-2"></i>
          <span class="text-sm">微信</span>
        </button>
        
        <button
          @click="shareToWeibo"
          class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <i class="fab fa-weibo text-2xl text-red-500 mb-2"></i>
          <span class="text-sm">微博</span>
        </button>
        
        <button
          @click="shareToQQ"
          class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <i class="fab fa-qq text-2xl text-blue-500 mb-2"></i>
          <span class="text-sm">QQ</span>
        </button>
        
        <button
          @click="handleCopyLink"
          class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <i class="fas fa-link text-2xl text-gray-500 mb-2"></i>
          <span class="text-sm">复制链接</span>
        </button>
      </div>
    </div>
  </DSModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'
import { usePaymentStore } from '@/stores/payment'
import DSButton from '@/components/atoms/DSButton.vue'
import DSModal from '@/components/molecules/DSModal.vue'

// Props
interface Props {
  articleId?: string
  isPaid?: boolean
  isPurchased?: boolean
  price?: number
  isLiked?: boolean
  isBookmarked?: boolean
  likeCount?: number
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  articleId: '',
  isPaid: false,
  isPurchased: false,
  price: 0,
  isLiked: false,
  isBookmarked: false,
  likeCount: 0,
  canEdit: false
})

// Emits
const emit = defineEmits<{
  like: [articleId: string]
  bookmark: [articleId: string]
  share: [platform: string, articleId: string]
  download: [articleId: string]
  purchase: [articleId: string]
  edit: [articleId: string]
  report: [articleId: string]
}>()

// Stores
const authStore = useAuthStore()
const articlesStore = useArticlesStore()
const paymentStore = usePaymentStore()

// 设计令牌
const { tokens } = useDesignTokens()

// 路由
const router = useRouter()

// 响应式数据
const isLiking = ref(false)
const isBookmarking = ref(false)
const isDownloading = ref(false)
const isPurchasing = ref(false)
const showDropdown = ref(false)
const showShareModal = ref(false)
const dropdownRef = ref<HTMLElement>()

// 计算属性 - 简化版本，匹配高保真原型

// 移除点赞处理 - 高保真原型中无此功能

// 收藏处理
const handleBookmark = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  isBookmarking.value = true
  try {
    await articlesStore.toggleBookmark(props.articleId)
    emit('bookmark', props.articleId)
  } catch (error) {
    console.error('收藏失败:', error)
  } finally {
    isBookmarking.value = false
  }
}

// 分享处理
const handleShare = () => {
  showShareModal.value = true
}

const shareToWeChat = () => {
  emit('share', 'wechat', props.articleId)
  showShareModal.value = false
}

const shareToWeibo = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(document.title)
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`)
  emit('share', 'weibo', props.articleId)
  showShareModal.value = false
}

const shareToQQ = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(document.title)
  window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`)
  emit('share', 'qq', props.articleId)
  showShareModal.value = false
}

// 复制链接
const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    // 显示成功提示
    showShareModal.value = false
    showDropdown.value = false
  } catch (error) {
    console.error('复制链接失败:', error)
  }
}

// 下载处理
const handleDownload = async () => {
  isDownloading.value = true
  try {
    await articlesStore.downloadArticle(props.articleId)
    emit('download', props.articleId)
  } catch (error) {
    console.error('下载失败:', error)
  } finally {
    isDownloading.value = false
  }
}

// 购买处理
const handlePurchase = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
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

// 编辑处理
const handleEdit = () => {
  emit('edit', props.articleId)
  router.push(`/articles/${props.articleId}/edit`)
  showDropdown.value = false
}

// 举报处理
const handleReport = () => {
  emit('report', props.articleId)
  showDropdown.value = false
}

// 下拉菜单切换
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.article-actions {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

/* 修复SVG图标尺寸问题 */
.icon-size {
  width: 1rem !important;
  height: 1rem !important;
  flex-shrink: 0;
}

/* 下拉菜单动画 */
.article-actions .absolute {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .article-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .article-actions .space-x-3 > * + * {
    margin-left: 0;
  }
}
</style>
