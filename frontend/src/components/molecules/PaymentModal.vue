<template>
  <!-- 支付弹窗遮罩层 -->
  <Teleport to="body">
    <div
      v-if="paymentStore.isModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="handleOverlayClick"
      @keydown.esc="handleClose"
    >
      <!-- 支付弹窗内容 -->
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300"
        :class="modalClasses"
        @click.stop
      >
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="fas fa-credit-card text-purple-600"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">完成支付</h3>
              <p class="text-sm text-gray-500">{{ articleTitle }}</p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- 支付内容 -->
        <div class="p-6">
          <!-- 支付方式选择 -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-3">选择支付方式</h4>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                :class="getPaymentMethodClasses(method.value)"
                @click="changePaymentMethod(method.value)"
              >
                <i :class="method.icon" class="text-2xl mb-2"></i>
                <div class="text-sm font-medium">{{ method.label }}</div>
              </button>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">商品名称</span>
              <span class="text-sm font-medium text-gray-900">{{ articleTitle }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">订单编号</span>
              <span class="text-sm font-mono text-gray-900">{{ paymentStore.currentOrder?.id || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">支付金额</span>
              <span class="text-lg font-bold text-purple-600">¥{{ paymentStore.currentOrder?.amount || 0 }}</span>
            </div>
          </div>

          <!-- 支付状态内容 -->
          <div v-if="showQRCode" class="text-center">
            <!-- 二维码区域 -->
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-4">
              <div class="w-48 h-48 mx-auto bg-white rounded-lg p-4 relative">
                <!-- 模拟二维码图案 -->
                <div class="w-full h-full relative">
                  <div class="absolute inset-2 grid grid-cols-6 gap-1">
                    <!-- 模拟二维码方块 -->
                    <div v-for="i in 36" :key="i" 
                         :class="getQRCodeBlockClass(i)"
                         class="rounded-sm">
                    </div>
                  </div>
                  
                  <!-- 中心Logo -->
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <i :class="currentPaymentIcon" class="text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 支付状态提示 -->
            <div class="flex items-center justify-center space-x-2 mb-4">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">{{ paymentStatusText }}</span>
            </div>
            
            <!-- 倒计时 -->
            <div class="flex items-center justify-center space-x-2 mb-4">
              <svg class="w-6 h-6 transform -rotate-90">
                <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="2" fill="none"></circle>
                <circle 
                  cx="12" cy="12" r="10" 
                  stroke="#22c55e" 
                  stroke-width="2" 
                  fill="none" 
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="countdownOffset"
                  class="transition-all duration-1000 ease-linear"
                ></circle>
              </svg>
              <span class="text-sm text-gray-500">
                {{ paymentStore.countdown }} 秒后过期
              </span>
            </div>
          </div>

          <!-- 支付成功状态 -->
          <div v-if="showSuccess" class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i class="fas fa-check text-3xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">支付成功！</h3>
            <p class="text-gray-600 mb-6">您已获得文章的永久阅读权限</p>
            <Button @click="handleContinueReading" variant="primary" class="w-full">
              <i class="fas fa-book-open mr-2"></i>
              继续阅读
            </Button>
          </div>

          <!-- 支付失败状态 -->
          <div v-if="showError" class="text-center">
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-times text-3xl text-red-600"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">支付失败</h3>
            <p class="text-gray-600 mb-6">{{ paymentStore.error || '支付过程中出现错误' }}</p>
            <div class="space-y-3">
              <Button @click="handleRetry" variant="primary" class="w-full">
                <i class="fas fa-redo mr-2"></i>
                重新支付
              </Button>
              <Button @click="handleClose" variant="secondary" class="w-full">
                取消
              </Button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="showActions" class="space-y-3">
            <Button 
              @click="handleRefreshQR" 
              variant="secondary" 
              class="w-full"
              :disabled="!paymentStore.canRefreshQR"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              刷新二维码
            </Button>
            <div class="text-center">
              <button 
                @click="handlePaymentHelp"
                class="text-sm text-gray-500 hover:text-purple-600 transition-colors duration-300"
              >
                <i class="fas fa-question-circle mr-1"></i>
                支付遇到问题？
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { usePaymentStore } from '../../stores/payment'
import type { PaymentMethod } from '../../stores/payment'
import Button from '../atoms/Button.vue'

// Props
interface Props {
  articleTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  articleTitle: '文章标题'
})

// Store
const paymentStore = usePaymentStore()

// 支付方式配置
const paymentMethods = [
  {
    value: 'wechat' as PaymentMethod,
    label: '微信支付',
    icon: 'fab fa-weixin text-green-500'
  },
  {
    value: 'alipay' as PaymentMethod,
    label: '支付宝',
    icon: 'fab fa-alipay text-blue-500'
  }
]

// 计算属性
const modalClasses = computed(() => ({
  'scale-100 opacity-100': paymentStore.isModalVisible,
  'scale-95 opacity-0': !paymentStore.isModalVisible
}))

const showQRCode = computed(() => 
  ['pending', 'polling'].includes(paymentStore.currentState)
)

const showSuccess = computed(() => 
  paymentStore.currentState === 'success'
)

const showError = computed(() => 
  ['failed', 'timeout'].includes(paymentStore.currentState)
)

const showActions = computed(() => 
  ['pending', 'polling', 'timeout'].includes(paymentStore.currentState)
)

const currentPaymentIcon = computed(() => {
  const method = paymentMethods.find(m => m.value === paymentStore.paymentMethod)
  return method?.icon || 'fas fa-qrcode'
})

const paymentStatusText = computed(() => {
  const methodText = paymentStore.paymentMethod === 'wechat' ? '微信' : '支付宝'
  return `请使用${methodText}扫描二维码完成支付`
})

// 倒计时圆形进度条
const circumference = 2 * Math.PI * 10
const countdownOffset = computed(() => {
  const progress = (300 - paymentStore.countdown) / 300
  return circumference * progress
})

// 方法
const getPaymentMethodClasses = (method: PaymentMethod) => {
  const baseClasses = 'border-2 rounded-lg p-3 text-center transition-all duration-300'
  const isActive = paymentStore.paymentMethod === method
  
  return isActive
    ? `${baseClasses} bg-purple-50 border-purple-500 text-purple-700`
    : `${baseClasses} bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50`
}

const getQRCodeBlockClass = (index: number) => {
  // 模拟二维码图案，随机生成黑白方块
  const pattern = [1,1,1,0,1,1,1,0,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,1,0,0,1,1,1,1,0,1,0,1,1]
  return pattern[index % pattern.length] ? 'bg-gray-800' : 'bg-white'
}

const changePaymentMethod = (method: PaymentMethod) => {
  paymentStore.changePaymentMethod(method)
}

const handleOverlayClick = () => {
  handleClose()
}

const handleClose = () => {
  paymentStore.closeModal()
}

const handleRefreshQR = () => {
  paymentStore.refreshQRCode()
}

const handleContinueReading = () => {
  handleClose()
  // 这里可以添加跳转到文章的逻辑
}

const handleRetry = () => {
  // 重新开始支付流程
  if (paymentStore.currentOrder) {
    paymentStore.initPayment(
      paymentStore.currentOrder.articleId || '',
      props.articleTitle,
      paymentStore.currentOrder.amount
    )
  }
}

const handlePaymentHelp = () => {
  alert('如遇支付问题，请联系客服：service@docuvault.com')
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && paymentStore.isModalVisible) {
    handleClose()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 动画样式 */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}
</style>
