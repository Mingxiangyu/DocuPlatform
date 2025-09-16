/**
 * 动画组合式API
 * 提供统一的动画控制和管理功能
 */

import { 
  ref, 
  computed, 
  inject, 
  onMounted, 
  onUnmounted, 
  nextTick,
  type Ref 
} from 'vue'
import type { CompleteDesignTokens } from '../tokens'

// 动画选项接口
export interface AnimationOptions {
  duration?: string
  easing?: string
  delay?: string
  iterationCount?: string | number
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

// 动画控制返回类型
export interface UseAnimationReturn {
  play: () => Promise<void>
  pause: () => void
  reset: () => void
  reverse: () => void
  finish: () => void
  isPlaying: Ref<boolean>
  isPaused: Ref<boolean>
  isFinished: Ref<boolean>
  progress: Ref<number>
  element: Ref<HTMLElement | null>
}

// 滚动动画选项
export interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  stagger?: number
  animationName?: string
  duration?: string
  easing?: string
}

/**
 * 基础动画组合式API
 */
export function useAnimation(
  animationName: string, 
  options: AnimationOptions = {}
): UseAnimationReturn {
  const tokens = inject<CompleteDesignTokens>('designTokens')
  const enableAnimations = inject<Ref<boolean>>('enableAnimations', ref(true))
  
  if (!tokens) {
    throw new Error('useAnimation must be used within a DesignSystemProvider')
  }

  // 状态管理
  const element = ref<HTMLElement | null>(null)
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const isFinished = ref(false)
  const progress = ref(0)
  
  let animationInstance: Animation | null = null
  let progressInterval: number | null = null

  // 动画配置
  const animationConfig = computed(() => ({
    duration: options.duration || tokens.animations.duration.normal,
    easing: options.easing || tokens.animations.easing.smooth,
    delay: options.delay || '0ms',
    iterationCount: options.iterationCount || 1,
    fill: options.fillMode || 'forwards',
    direction: options.direction || 'normal'
  }))

  // 播放动画
  const play = async (): Promise<void> => {
    if (!element.value || !enableAnimations.value) return

    const keyframes = tokens.animations.keyframes[animationName]
    if (!keyframes) {
      console.warn(`Animation "${animationName}" not found in design tokens`)
      return
    }

    try {
      // 重置状态
      isFinished.value = false
      isPaused.value = false
      
      // 创建动画实例
      animationInstance = element.value.animate(keyframes, {
        duration: parseFloat(animationConfig.value.duration),
        easing: animationConfig.value.easing,
        delay: parseFloat(animationConfig.value.delay),
        iterations: animationConfig.value.iterationCount,
        fill: animationConfig.value.fill,
        direction: animationConfig.value.direction
      })

      isPlaying.value = true

      // 监听动画事件
      animationInstance.addEventListener('finish', () => {
        isPlaying.value = false
        isFinished.value = true
        progress.value = 100
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
      })

      // 更新进度
      startProgressTracking()

      await animationInstance.finished
    } catch (error) {
      console.error('Animation playback failed:', error)
      isPlaying.value = false
    }
  }

  // 暂停动画
  const pause = (): void => {
    if (animationInstance && isPlaying.value) {
      animationInstance.pause()
      isPlaying.value = false
      isPaused.value = true
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    }
  }

  // 重置动画
  const reset = (): void => {
    if (animationInstance) {
      animationInstance.cancel()
      animationInstance = null
    }
    isPlaying.value = false
    isPaused.value = false
    isFinished.value = false
    progress.value = 0
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }

  // 反向播放
  const reverse = (): void => {
    if (animationInstance) {
      animationInstance.reverse()
    }
  }

  // 完成动画
  const finish = (): void => {
    if (animationInstance) {
      animationInstance.finish()
    }
  }

  // 进度跟踪
  const startProgressTracking = (): void => {
    if (!animationInstance) return

    progressInterval = window.setInterval(() => {
      if (animationInstance) {
        const currentTime = animationInstance.currentTime || 0
        const totalTime = animationInstance.effect?.getTiming().duration || 1
        progress.value = Math.min(100, (Number(currentTime) / Number(totalTime)) * 100)
      }
    }, 16) // 60fps
  }

  // 清理
  onUnmounted(() => {
    reset()
  })

  return {
    play,
    pause,
    reset,
    reverse,
    finish,
    isPlaying,
    isPaused,
    isFinished,
    progress,
    element
  }
}

/**
 * 滚动触发动画组合式API
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const tokens = inject<CompleteDesignTokens>('designTokens')
  const enableAnimations = inject<Ref<boolean>>('enableAnimations', ref(true))
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    stagger = 0,
    animationName = 'fadeInUp',
    duration = tokens?.animations.duration.normal || '300ms',
    easing = tokens?.animations.easing.smooth || 'ease'
  } = options

  const elements = ref<HTMLElement[]>([])
  const isVisible = ref<boolean[]>([])
  const hasTriggered = ref<boolean[]>([])
  
  let observer: IntersectionObserver | null = null

  // 观察元素
  const observe = (element: HTMLElement, index: number = 0): void => {
    if (!enableAnimations.value) return

    elements.value[index] = element
    isVisible.value[index] = false
    hasTriggered.value[index] = false

    if (!observer) {
      createObserver()
    }

    observer?.observe(element)
  }

  // 取消观察
  const unobserve = (element: HTMLElement): void => {
    observer?.unobserve(element)
  }

  // 创建观察器
  const createObserver = (): void => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, entryIndex) => {
          const elementIndex = elements.value.findIndex(el => el === entry.target)
          if (elementIndex === -1) return

          if (entry.isIntersecting) {
            if (!hasTriggered.value[elementIndex] || !triggerOnce) {
              isVisible.value[elementIndex] = true
              hasTriggered.value[elementIndex] = true
              
              // 应用动画
              setTimeout(() => {
                triggerAnimation(entry.target as HTMLElement, elementIndex)
              }, elementIndex * stagger)
            }
          } else if (!triggerOnce) {
            isVisible.value[elementIndex] = false
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
  }

  // 触发动画
  const triggerAnimation = (element: HTMLElement, index: number): void => {
    if (!tokens?.animations.keyframes[animationName]) {
      console.warn(`Animation "${animationName}" not found`)
      return
    }

    const keyframes = tokens.animations.keyframes[animationName]
    
    element.animate(keyframes, {
      duration: parseFloat(duration),
      easing,
      fill: 'forwards'
    })
  }

  // 清理
  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    observe,
    unobserve,
    isVisible: computed(() => isVisible.value),
    hasTriggered: computed(() => hasTriggered.value)
  }
}

/**
 * 交错动画组合式API
 */
export function useStaggeredAnimation(
  animationName: string,
  itemCount: number,
  staggerDelay: number = 100
) {
  const tokens = inject<CompleteDesignTokens>('designTokens')
  const enableAnimations = inject<Ref<boolean>>('enableAnimations', ref(true))
  
  const elements = ref<HTMLElement[]>([])
  const isPlaying = ref(false)

  // 播放交错动画
  const playStaggered = async (): Promise<void> => {
    if (!enableAnimations.value || elements.value.length === 0) return

    isPlaying.value = true

    const keyframes = tokens?.animations.keyframes[animationName]
    if (!keyframes) {
      console.warn(`Animation "${animationName}" not found`)
      return
    }

    const animations = elements.value.map((element, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const animation = element.animate(keyframes, {
            duration: parseFloat(tokens?.animations.duration.normal || '300ms'),
            easing: tokens?.animations.easing.smooth || 'ease',
            fill: 'forwards'
          })
          
          animation.addEventListener('finish', () => resolve())
        }, index * staggerDelay)
      })
    })

    await Promise.all(animations)
    isPlaying.value = false
  }

  // 注册元素
  const registerElement = (element: HTMLElement, index: number): void => {
    elements.value[index] = element
  }

  return {
    playStaggered,
    registerElement,
    isPlaying,
    elements
  }
}

/**
 * 动画序列组合式API
 */
export function useAnimationSequence(animations: Array<{
  name: string
  target?: string
  options?: AnimationOptions
}>) {
  const tokens = inject<CompleteDesignTokens>('designTokens')
  const enableAnimations = inject<Ref<boolean>>('enableAnimations', ref(true))
  
  const container = ref<HTMLElement | null>(null)
  const isPlaying = ref(false)
  const currentStep = ref(0)

  // 播放动画序列
  const playSequence = async (): Promise<void> => {
    if (!enableAnimations.value || !container.value) return

    isPlaying.value = true
    currentStep.value = 0

    for (let i = 0; i < animations.length; i++) {
      currentStep.value = i
      const animation = animations[i]
      
      const target = animation.target 
        ? container.value.querySelector(animation.target) as HTMLElement
        : container.value

      if (target) {
        await playAnimationStep(target, animation.name, animation.options)
      }
    }

    isPlaying.value = false
    currentStep.value = animations.length
  }

  // 播放单个动画步骤
  const playAnimationStep = (
    element: HTMLElement, 
    animationName: string, 
    options: AnimationOptions = {}
  ): Promise<void> => {
    return new Promise((resolve) => {
      const keyframes = tokens?.animations.keyframes[animationName]
      if (!keyframes) {
        console.warn(`Animation "${animationName}" not found`)
        resolve()
        return
      }

      const animation = element.animate(keyframes, {
        duration: parseFloat(options.duration || tokens?.animations.duration.normal || '300ms'),
        easing: options.easing || tokens?.animations.easing.smooth || 'ease',
        delay: parseFloat(options.delay || '0ms'),
        fill: options.fillMode || 'forwards'
      })

      animation.addEventListener('finish', () => resolve())
    })
  }

  return {
    playSequence,
    isPlaying,
    currentStep,
    container
  }
}

export default useAnimation
