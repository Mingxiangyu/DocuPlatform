import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import type { Order, CreateOrderRequest } from '../types/api'
import { eventBus } from '../utils/EventBus'
import { apiClient } from '../services/ApiClient'
import { useAuthStore } from './auth'

// 支付状态类型
export type PaymentState = 'idle' | 'creating' | 'pending' | 'polling' | 'success' | 'failed' | 'timeout' | 'cancelled'

// 支付方式类型
export type PaymentMethod = 'wechat' | 'alipay'

// 支付配置接口
interface PaymentConfig {
  timeout: number // 支付超时时间（秒）
  pollingInterval: number // 轮询间隔（毫秒）
  mockPaymentDelay: number // 模拟支付延迟（毫秒）
}

// 默认配置
const DEFAULT_CONFIG: PaymentConfig = {
  timeout: 300, // 5分钟
  pollingInterval: 2000, // 2秒
  mockPaymentDelay: 8000 // 8秒
}

// 生成订单号
const generateOrderId = (): string => {
  const now = new Date()
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `DV${timestamp}${random}`
}

// 模拟二维码URL生成
const generateQRCodeUrl = (orderId: string, method: PaymentMethod): string => {
  const baseUrl = method === 'wechat' ? 'weixin://wxpay/bizpayurl' : 'alipays://platformapi/startapp'
  return `${baseUrl}?order_id=${orderId}&timestamp=${Date.now()}`
}

export const usePaymentStore = defineStore('payment', () => {
  // Auth store引用
  const authStore = useAuthStore()

  // 状态
  const currentState = ref<PaymentState>('idle')
  const currentOrder = ref<Order | null>(null)
  const paymentMethod = ref<PaymentMethod>('wechat')
  const isModalVisible = ref(false)
  const countdown = ref(DEFAULT_CONFIG.timeout)
  const qrCodeUrl = ref('')
  const error = ref<string | null>(null)

  // 定时器引用
  const countdownTimer = ref<NodeJS.Timeout | null>(null)
  const pollingTimer = ref<NodeJS.Timeout | null>(null)
  const mockPaymentTimer = ref<NodeJS.Timeout | null>(null)

  // 历史记录（从localStorage加载）
  const orderHistory = ref<Order[]>([])
  const purchasedArticles = ref<string[]>([])
  
  // 计算属性
  const isPaymentInProgress = computed(() => 
    ['creating', 'pending', 'polling'].includes(currentState.value)
  )
  
  const canRefreshQR = computed(() => 
    currentState.value === 'pending' || currentState.value === 'timeout'
  )
  
  const currentOrderInfo = computed(() => {
    if (!currentOrder.value) return null
    
    return {
      orderId: currentOrder.value.id,
      amount: currentOrder.value.amount,
      articleTitle: '文章标题', // 这里应该从文章数据获取
      paymentMethodText: paymentMethod.value === 'wechat' ? '微信支付' : '支付宝'
    }
  })

  // 从后端API加载用户购买记录
  const loadUserPurchases = async () => {
    try {
      // 临时使用模拟数据，直到后端服务正常启动
      await new Promise(resolve => setTimeout(resolve, 300)) // 模拟网络延迟

      // 模拟购买记录数据 - 用户未购买任何文章
      const mockPurchases: any[] = []

      const articleIds = mockPurchases.map((order: any) => order.articleId).filter(Boolean)
      purchasedArticles.value = [...new Set(articleIds)] // 去重
      console.log('购买记录加载成功（模拟数据）:', articleIds)
    } catch (error) {
      console.error('Failed to load user purchases:', error)
      // 如果失败，继续使用Pinia持久化的数据
    }
  }

  // 清除所有定时器
  const clearTimers = () => {
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
    
    if (pollingTimer.value) {
      clearTimeout(pollingTimer.value)
      pollingTimer.value = null
    }
    
    if (mockPaymentTimer.value) {
      clearTimeout(mockPaymentTimer.value)
      mockPaymentTimer.value = null
    }
  }

  // 重置状态
  const resetState = () => {
    clearTimers()
    currentState.value = 'idle'
    currentOrder.value = null
    countdown.value = DEFAULT_CONFIG.timeout
    qrCodeUrl.value = ''
    error.value = null
  }

  // 初始化支付流程
  const initPayment = async (articleId: string, articleTitle: string, price: number) => {
    try {
      resetState()
      currentState.value = 'creating'
      isModalVisible.value = true

      // 发送支付初始化事件
      eventBus.emit('payment:initiated', {
        orderId: '',
        amount: price,
        method: paymentMethod.value
      })

      // 模拟创建订单延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 创建订单
      await createOrder(articleId, articleTitle, price)

    } catch (err: any) {
      currentState.value = 'failed'
      error.value = err.message || '支付初始化失败'

      eventBus.emit('payment:failed', {
        orderId: currentOrder.value?.id || '',
        error: error.value
      })
    }
  }

  // 创建订单
  const createOrder = async (articleId: string, articleTitle: string, price: number) => {
    const orderId = generateOrderId()

    const order: Order = {
      id: orderId,
      userId: 'current-user', // 这里应该从auth store获取
      articleId,
      amount: price,
      status: 'PENDING',
      paymentMethod: paymentMethod.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    currentOrder.value = order
    qrCodeUrl.value = generateQRCodeUrl(orderId, paymentMethod.value)

    // 添加到订单历史
    orderHistory.value.unshift(order)

    // 开始支付流程
    currentState.value = 'pending'
    startCountdown()
    startPaymentPolling()
    startMockPayment()
  }

  // 开始倒计时
  const startCountdown = () => {
    countdown.value = DEFAULT_CONFIG.timeout

    countdownTimer.value = setInterval(() => {
      countdown.value--

      if (countdown.value <= 0) {
        handlePaymentTimeout()
      }
    }, 1000)
  }

  // 开始支付状态轮询
  const startPaymentPolling = () => {
    if (!currentOrder.value) return

    currentState.value = 'polling'

    const poll = () => {
      if (currentState.value !== 'polling') return

      // 这里应该调用真实的API检查支付状态
      // 现在使用模拟逻辑，实际由startMockPayment处理

      pollingTimer.value = setTimeout(poll, DEFAULT_CONFIG.pollingInterval)
    }

    poll()
  }

  // 模拟支付成功
  const startMockPayment = () => {
    mockPaymentTimer.value = setTimeout(() => {
      if (currentState.value === 'polling') {
        completePayment()
      }
    }, DEFAULT_CONFIG.mockPaymentDelay)
  }

  // 完成支付
  const completePayment = () => {
    if (!currentOrder.value) return

    clearTimers()
    currentState.value = 'success'

    // 更新订单状态
    currentOrder.value.status = 'COMPLETED'
    currentOrder.value.paidAt = new Date().toISOString()
    currentOrder.value.paymentId = `pay_${Date.now()}`

    // 添加到购买记录
    if (currentOrder.value.articleId && !purchasedArticles.value.includes(currentOrder.value.articleId)) {
      purchasedArticles.value.push(currentOrder.value.articleId)
    }

    // 发送支付成功事件
    eventBus.emit('payment:completed', {
      orderId: currentOrder.value.id,
      paymentId: currentOrder.value.paymentId
    })

    if (currentOrder.value.articleId) {
      eventBus.emit('article:purchased', {
        articleId: currentOrder.value.articleId,
        userId: currentOrder.value.userId,
        orderId: currentOrder.value.id
      })
    }
  }

  // 处理支付超时
  const handlePaymentTimeout = () => {
    clearTimers()
    currentState.value = 'timeout'

    if (currentOrder.value) {
      currentOrder.value.status = 'CANCELLED'
    }
  }

  return {
    // 状态
    currentState,
    currentOrder,
    paymentMethod,
    isModalVisible,
    countdown,
    qrCodeUrl,
    error,
    orderHistory,
    purchasedArticles,

    // 计算属性
    isPaymentInProgress,
    canRefreshQR,
    currentOrderInfo,

    // 方法
    resetState,
    clearTimers,
    initPayment,
    createOrder,
    completePayment,

    // 其他支付操作方法
    cancelPayment: () => {
      clearTimers()
      currentState.value = 'cancelled'
      isModalVisible.value = false

      if (currentOrder.value) {
        currentOrder.value.status = 'CANCELLED'
      }
    },

    changePaymentMethod: (method: PaymentMethod) => {
      paymentMethod.value = method

      // 如果有当前订单，重新生成二维码
      if (currentOrder.value) {
        qrCodeUrl.value = generateQRCodeUrl(currentOrder.value.id, method)
      }

      eventBus.emit('payment:method-changed', method)
    },

    refreshQRCode: async () => {
      if (!currentOrder.value || !canRefreshQR.value) return

      try {
        // 模拟刷新延迟
        await new Promise(resolve => setTimeout(resolve, 300))

        // 重新生成二维码
        qrCodeUrl.value = generateQRCodeUrl(currentOrder.value.id, paymentMethod.value)

        // 重置倒计时
        if (currentState.value === 'timeout') {
          currentState.value = 'pending'
          startCountdown()
          startPaymentPolling()
          startMockPayment()
        }

        eventBus.emit('payment:qr-refreshed', {
          orderId: currentOrder.value.id,
          qrCodeUrl: qrCodeUrl.value
        })

      } catch (err: any) {
        error.value = '刷新二维码失败'
      }
    },

    checkPurchaseStatus: (articleId: string): boolean => {
      return purchasedArticles.value.includes(articleId)
    },

    hasPurchased: (articleId: string): boolean => {
      return purchasedArticles.value.includes(articleId)
    },

    closeModal: () => {
      isModalVisible.value = false

      // 如果支付未完成，取消支付
      if (isPaymentInProgress.value) {
        clearTimers()
        currentState.value = 'cancelled'

        if (currentOrder.value) {
          currentOrder.value.status = 'CANCELLED'
        }
      }
    },

    // 获取订单历史
    getOrderHistory: () => orderHistory.value,

    // 获取购买的文章列表
    getPurchasedArticles: () => purchasedArticles.value,

    // 加载用户购买记录
    loadUserPurchases
  }

  // 监听认证状态变化，自动加载购买记录
  watch(() => authStore.isAuthenticated, async (isAuth) => {
    console.log('Payment store: 认证状态变化', isAuth)
    if (isAuth) {
      console.log('Payment store: 用户已登录，加载购买记录')
      await loadUserPurchases()
    } else {
      console.log('Payment store: 用户已登出，清空购买记录')
      purchasedArticles.value = []
    }
  }, { immediate: true })

  // 确保在 store 初始化时立即检查认证状态并加载购买记录
  // 使用 nextTick 确保在 DOM 更新后执行，避免时序问题
  nextTick(() => {
    if (authStore.isAuthenticated) {
      console.log('Payment store: nextTick 检查到用户已登录，立即加载购买记录')
      loadUserPurchases().catch(error => {
        console.error('Payment store: nextTick 加载购买记录失败:', error)
      })
    }
  })

  return {
    // 状态
    currentState,
    currentOrder,
    paymentMethod,
    isModalVisible,
    countdown,
    qrCodeUrl,
    error,
    orderHistory,
    purchasedArticles,

    // 计算属性
    isPaymentInProgress,
    canRefreshQR,
    currentOrderInfo,



    // 其他支付操作方法
    cancelPayment: () => {
      clearTimers()
      currentState.value = 'cancelled'
      isModalVisible.value = false

      if (currentOrder.value) {
        currentOrder.value.status = 'CANCELLED'
      }
    },

    changePaymentMethod: (method: PaymentMethod) => {
      paymentMethod.value = method

      // 如果有当前订单，重新生成二维码
      if (currentOrder.value) {
        qrCodeUrl.value = generateQRCodeUrl(currentOrder.value.id, method)
      }

      eventBus.emit('payment:method-changed', method)
    },

    refreshQRCode: async () => {
      if (!currentOrder.value || !canRefreshQR.value) return

      try {
        // 模拟刷新延迟
        await new Promise(resolve => setTimeout(resolve, 300))

        // 重新生成二维码
        qrCodeUrl.value = generateQRCodeUrl(currentOrder.value.id, paymentMethod.value)

        // 重置倒计时
        if (currentState.value === 'timeout') {
          currentState.value = 'pending'
          startCountdown()
          startPaymentPolling()
          startMockPayment()
        }

        eventBus.emit('payment:qr-refreshed', {
          orderId: currentOrder.value.id,
          qrCodeUrl: qrCodeUrl.value
        })

      } catch (err: any) {
        error.value = '刷新二维码失败'
      }
    },

    checkPurchaseStatus: (articleId: string): boolean => {
      return purchasedArticles.value.includes(articleId)
    },

    hasPurchased: (articleId: string): boolean => {
      return purchasedArticles.value.includes(articleId)
    },

    closeModal: () => {
      isModalVisible.value = false

      // 如果支付未完成，取消支付
      if (isPaymentInProgress.value) {
        clearTimers()
        currentState.value = 'cancelled'

        if (currentOrder.value) {
          currentOrder.value.status = 'CANCELLED'
        }
      }
    },

    // 获取订单历史
    getOrderHistory: () => orderHistory.value,

    // 获取购买的文章列表
    getPurchasedArticles: () => purchasedArticles.value,

    // 加载用户购买记录
    loadUserPurchases
  }
}, {
  persist: {
    storage: localStorage,
    pick: ['purchasedArticles', 'orderHistory'],
    beforeHydrate: (ctx) => {
      console.log('Payment store: 状态恢复中...')
    },
    afterHydrate: (ctx) => {
      console.log('Payment store: 状态已恢复，购买记录:', ctx.store.purchasedArticles)
    }
  }
})
