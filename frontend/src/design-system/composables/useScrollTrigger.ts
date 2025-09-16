/**
 * 滚动触发组合式API
 * 提供基于滚动位置的动画和交互触发功能
 */

import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  nextTick,
  type Ref 
} from 'vue'
import { useThrottleFn } from '@vueuse/core'

// 滚动触发选项接口
export interface ScrollTriggerOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  offset?: number
  direction?: 'up' | 'down' | 'both'
}

// 滚动进度选项接口
export interface ScrollProgressOptions {
  container?: HTMLElement | Window
  throttle?: number
}

// 滚动方向类型
export type ScrollDirection = 'up' | 'down' | 'none'

/**
 * 基础滚动触发组合式API
 */
export function useScrollTrigger(options: ScrollTriggerOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    offset = 0,
    direction = 'both'
  } = options

  const isVisible = ref(false)
  const hasTriggered = ref(false)
  const element = ref<HTMLElement | null>(null)
  
  let observer: IntersectionObserver | null = null

  // 观察元素
  const observe = (el: HTMLElement): void => {
    element.value = el
    
    if (!observer) {
      createObserver()
    }
    
    observer?.observe(el)
  }

  // 取消观察
  const unobserve = (el?: HTMLElement): void => {
    const target = el || element.value
    if (target && observer) {
      observer.unobserve(target)
    }
  }

  // 创建观察器
  const createObserver = (): void => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting
          const boundingRect = entry.boundingClientRect
          const shouldTrigger = checkDirectionCondition(boundingRect)
          
          if (isIntersecting && shouldTrigger) {
            if (!hasTriggered.value || !triggerOnce) {
              isVisible.value = true
              hasTriggered.value = true
            }
          } else if (!triggerOnce) {
            isVisible.value = false
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
  }

  // 检查方向条件
  const checkDirectionCondition = (rect: DOMRectReadOnly): boolean => {
    if (direction === 'both') return true
    
    const viewportHeight = window.innerHeight
    const elementCenter = rect.top + rect.height / 2
    const viewportCenter = viewportHeight / 2
    
    if (direction === 'up') {
      return elementCenter < viewportCenter
    } else if (direction === 'down') {
      return elementCenter > viewportCenter
    }
    
    return true
  }

  // 清理
  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    isVisible,
    hasTriggered,
    element,
    observe,
    unobserve
  }
}

/**
 * 滚动进度组合式API
 */
export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const {
    container = window,
    throttle = 16
  } = options

  const scrollY = ref(0)
  const scrollX = ref(0)
  const progress = ref(0)
  const direction = ref<ScrollDirection>('none')
  const isScrolling = ref(false)
  
  let lastScrollY = 0
  let scrollTimeout: number | null = null

  // 更新滚动状态
  const updateScrollState = (): void => {
    const currentScrollY = container === window 
      ? window.scrollY 
      : (container as HTMLElement).scrollTop
      
    const currentScrollX = container === window 
      ? window.scrollX 
      : (container as HTMLElement).scrollLeft

    // 更新滚动位置
    scrollY.value = currentScrollY
    scrollX.value = currentScrollX

    // 计算滚动进度
    const maxScroll = container === window
      ? document.documentElement.scrollHeight - window.innerHeight
      : (container as HTMLElement).scrollHeight - (container as HTMLElement).clientHeight

    progress.value = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0

    // 确定滚动方向
    if (currentScrollY > lastScrollY) {
      direction.value = 'down'
    } else if (currentScrollY < lastScrollY) {
      direction.value = 'up'
    } else {
      direction.value = 'none'
    }

    lastScrollY = currentScrollY

    // 设置滚动状态
    isScrolling.value = true
    
    // 清除之前的超时
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    
    // 设置滚动结束检测
    scrollTimeout = window.setTimeout(() => {
      isScrolling.value = false
      direction.value = 'none'
    }, 150)
  }

  // 节流的滚动处理函数
  const throttledScrollHandler = useThrottleFn(updateScrollState, throttle)

  // 初始化
  onMounted(() => {
    updateScrollState()
    container.addEventListener('scroll', throttledScrollHandler, { passive: true })
  })

  // 清理
  onUnmounted(() => {
    container.removeEventListener('scroll', throttledScrollHandler)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
  })

  return {
    scrollY,
    scrollX,
    progress,
    direction,
    isScrolling
  }
}

/**
 * 滚动到元素组合式API
 */
export function useScrollToElement() {
  // 滚动到指定元素
  const scrollToElement = (
    element: HTMLElement | string,
    options: ScrollIntoViewOptions = {}
  ): void => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element

    if (!target) {
      console.warn('Scroll target element not found')
      return
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    })
  }

  // 滚动到顶部
  const scrollToTop = (smooth: boolean = true): void => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  // 滚动到底部
  const scrollToBottom = (smooth: boolean = true): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  // 滚动指定距离
  const scrollBy = (x: number, y: number, smooth: boolean = true): void => {
    window.scrollBy({
      top: y,
      left: x,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  return {
    scrollToElement,
    scrollToTop,
    scrollToBottom,
    scrollBy
  }
}

/**
 * 视差滚动组合式API
 */
export function useParallaxScroll(speed: number = 0.5) {
  const element = ref<HTMLElement | null>(null)
  const transform = ref('translateY(0px)')
  
  const { scrollY } = useScrollProgress()

  // 更新视差效果
  const updateParallax = (): void => {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const elementTop = rect.top + scrollY.value
    const elementHeight = rect.height
    const windowHeight = window.innerHeight

    // 计算元素是否在视口中
    const isInViewport = rect.top < windowHeight && rect.bottom > 0

    if (isInViewport) {
      const scrolled = scrollY.value - elementTop + windowHeight
      const rate = scrolled * speed
      transform.value = `translateY(${rate}px)`
    }
  }

  // 节流的更新函数
  const throttledUpdate = useThrottleFn(updateParallax, 16)

  onMounted(() => {
    window.addEventListener('scroll', throttledUpdate, { passive: true })
    nextTick(updateParallax)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', throttledUpdate)
  })

  return {
    element,
    transform
  }
}

/**
 * 滚动锁定组合式API
 */
export function useScrollLock() {
  const isLocked = ref(false)
  let originalOverflow = ''
  let originalPaddingRight = ''

  // 锁定滚动
  const lock = (): void => {
    if (isLocked.value) return

    // 保存原始样式
    originalOverflow = document.body.style.overflow
    originalPaddingRight = document.body.style.paddingRight

    // 计算滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // 应用锁定样式
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    isLocked.value = true
  }

  // 解锁滚动
  const unlock = (): void => {
    if (!isLocked.value) return

    // 恢复原始样式
    document.body.style.overflow = originalOverflow
    document.body.style.paddingRight = originalPaddingRight

    isLocked.value = false
  }

  // 切换锁定状态
  const toggle = (): void => {
    if (isLocked.value) {
      unlock()
    } else {
      lock()
    }
  }

  // 自动清理
  onUnmounted(() => {
    if (isLocked.value) {
      unlock()
    }
  })

  return {
    isLocked,
    lock,
    unlock,
    toggle
  }
}

/**
 * 无限滚动组合式API
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: {
    distance?: number
    throttle?: number
    immediate?: boolean
  } = {}
) {
  const {
    distance = 100,
    throttle = 300,
    immediate = true
  } = options

  const isLoading = ref(false)
  const element = ref<HTMLElement | null>(null)

  // 检查是否需要加载更多
  const checkLoadMore = async (): Promise<void> => {
    if (isLoading.value) return

    const container = element.value || document.documentElement
    const scrollTop = container.scrollTop || window.scrollY
    const scrollHeight = container.scrollHeight || document.documentElement.scrollHeight
    const clientHeight = container.clientHeight || window.innerHeight

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom <= distance) {
      isLoading.value = true
      try {
        await callback()
      } finally {
        isLoading.value = false
      }
    }
  }

  // 节流的检查函数
  const throttledCheck = useThrottleFn(checkLoadMore, throttle)

  onMounted(() => {
    const target = element.value || window
    target.addEventListener('scroll', throttledCheck, { passive: true })
    
    if (immediate) {
      nextTick(checkLoadMore)
    }
  })

  onUnmounted(() => {
    const target = element.value || window
    target.removeEventListener('scroll', throttledCheck)
  })

  return {
    isLoading,
    element
  }
}

export default useScrollTrigger
