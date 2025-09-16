/**
 * 动画系统 - 设计令牌
 * 完整的动画持续时间、缓动函数和关键帧系统
 */

import type { AnimationSystem } from './index'

// 动画持续时间系统
const durationSystem = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  slowest: '1000ms'
}

// 缓动函数系统
const easingSystem = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}

// 关键帧系统
const keyframeSystem = {
  // 基础淡入动画
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' }
  },
  
  // 向上淡入动画
  fadeInUp: {
    '0%': { 
      opacity: '0', 
      transform: 'translateY(30px)' 
    },
    '100%': { 
      opacity: '1', 
      transform: 'translateY(0)' 
    }
  },
  
  // 向下淡入动画
  fadeInDown: {
    '0%': { 
      opacity: '0', 
      transform: 'translateY(-30px)' 
    },
    '100%': { 
      opacity: '1', 
      transform: 'translateY(0)' 
    }
  },
  
  // 向左淡入动画
  fadeInLeft: {
    '0%': { 
      opacity: '0', 
      transform: 'translateX(-30px)' 
    },
    '100%': { 
      opacity: '1', 
      transform: 'translateX(0)' 
    }
  },
  
  // 向右淡入动画
  fadeInRight: {
    '0%': { 
      opacity: '0', 
      transform: 'translateX(30px)' 
    },
    '100%': { 
      opacity: '1', 
      transform: 'translateX(0)' 
    }
  },
  
  // 缩放淡入动画
  scaleIn: {
    '0%': { 
      opacity: '0', 
      transform: 'scale(0.9)' 
    },
    '100%': { 
      opacity: '1', 
      transform: 'scale(1)' 
    }
  },
  
  // 向上滑动动画
  slideUp: {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' }
  },
  
  // 向下滑动动画
  slideDown: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' }
  },
  
  // 温和弹跳动画
  bounceGentle: {
    '0%, 20%, 53%, 80%, 100%': { 
      transform: 'translateY(0)' 
    },
    '40%, 43%': { 
      transform: 'translateY(-8px)' 
    },
    '70%': { 
      transform: 'translateY(-4px)' 
    },
    '90%': { 
      transform: 'translateY(-2px)' 
    }
  },
  
  // 进度条动画
  progress: {
    '0%': { width: '0%' },
    '100%': { width: '100%' }
  },
  
  // 脉冲动画
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' }
  },
  
  // 旋转动画
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  
  // 波纹动画
  ping: {
    '75%, 100%': { 
      transform: 'scale(2)', 
      opacity: '0' 
    }
  },
  
  // 摇摆动画
  wiggle: {
    '0%, 100%': { transform: 'rotate(-3deg)' },
    '50%': { transform: 'rotate(3deg)' }
  },
  
  // 心跳动画
  heartbeat: {
    '0%': { transform: 'scale(1)' },
    '14%': { transform: 'scale(1.3)' },
    '28%': { transform: 'scale(1)' },
    '42%': { transform: 'scale(1.3)' },
    '70%': { transform: 'scale(1)' }
  },
  
  // 加载骨架屏动画
  skeleton: {
    '0%': { 
      backgroundPosition: '200% 0' 
    },
    '100%': { 
      backgroundPosition: '-200% 0' 
    }
  },
  
  // 卡片悬停动画
  cardHover: {
    '0%': { 
      transform: 'translateY(0) scale(1)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    '100%': { 
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  },
  
  // 按钮点击动画
  buttonPress: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(0.95)' },
    '100%': { transform: 'scale(1)' }
  },
  
  // 文字渐变动画
  textShimmer: {
    '0%': { 
      backgroundPosition: '-200% center' 
    },
    '100%': { 
      backgroundPosition: '200% center' 
    }
  }
}

// 完整动画系统导出
export const animationTokens: AnimationSystem = {
  duration: durationSystem,
  easing: easingSystem,
  keyframes: keyframeSystem
}

// 预定义动画组合
export const animationPresets = {
  // 页面进入动画
  pageEnter: {
    name: 'fadeInUp',
    duration: durationSystem.slow,
    easing: easingSystem.smooth,
    delay: '0ms'
  },
  
  // 卡片悬停动画
  cardHover: {
    name: 'cardHover',
    duration: durationSystem.normal,
    easing: easingSystem.smooth,
    delay: '0ms'
  },
  
  // 按钮交互动画
  buttonInteraction: {
    name: 'buttonPress',
    duration: durationSystem.fast,
    easing: easingSystem.easeOut,
    delay: '0ms'
  },
  
  // 模态框动画
  modalEnter: {
    name: 'scaleIn',
    duration: durationSystem.normal,
    easing: easingSystem.spring,
    delay: '0ms'
  },
  
  // 加载动画
  loading: {
    name: 'spin',
    duration: durationSystem.slowest,
    easing: easingSystem.linear,
    delay: '0ms',
    iterationCount: 'infinite'
  },
  
  // 骨架屏动画
  skeleton: {
    name: 'skeleton',
    duration: '1500ms',
    easing: easingSystem.linear,
    delay: '0ms',
    iterationCount: 'infinite'
  }
}

// 滚动触发动画配置
export const scrollAnimations = {
  // 分类卡片交错动画
  categoryCards: {
    animation: 'fadeInUp',
    duration: durationSystem.slow,
    easing: easingSystem.smooth,
    stagger: 100, // 每个卡片延迟100ms
    threshold: 0.1
  },
  
  // 文章卡片动画
  articleCards: {
    animation: 'fadeInUp',
    duration: durationSystem.normal,
    easing: easingSystem.smooth,
    stagger: 150,
    threshold: 0.2
  },
  
  // 统计数字动画
  statsCounters: {
    animation: 'fadeInUp',
    duration: durationSystem.slower,
    easing: easingSystem.smooth,
    stagger: 200,
    threshold: 0.3
  }
}

// CSS变量映射
export const animationCSSVariables = {
  // 持续时间变量
  '--duration-instant': durationSystem.instant,
  '--duration-fast': durationSystem.fast,
  '--duration-normal': durationSystem.normal,
  '--duration-slow': durationSystem.slow,
  '--duration-slower': durationSystem.slower,
  '--duration-slowest': durationSystem.slowest,
  
  // 缓动函数变量
  '--easing-linear': easingSystem.linear,
  '--easing-ease': easingSystem.ease,
  '--easing-ease-in': easingSystem.easeIn,
  '--easing-ease-out': easingSystem.easeOut,
  '--easing-ease-in-out': easingSystem.easeInOut,
  '--easing-spring': easingSystem.spring,
  '--easing-bounce': easingSystem.bounce,
  '--easing-smooth': easingSystem.smooth,
  
  // 预设动画变量
  '--animation-page-enter': `fadeInUp ${durationSystem.slow} ${easingSystem.smooth}`,
  '--animation-card-hover': `cardHover ${durationSystem.normal} ${easingSystem.smooth}`,
  '--animation-button-press': `buttonPress ${durationSystem.fast} ${easingSystem.easeOut}`,
  '--animation-modal-enter': `scaleIn ${durationSystem.normal} ${easingSystem.spring}`,
  '--animation-loading': `spin ${durationSystem.slowest} ${easingSystem.linear} infinite`
}

// 动画工具函数
export function createAnimation(
  name: string,
  duration: string = durationSystem.normal,
  easing: string = easingSystem.smooth,
  delay: string = '0ms',
  iterationCount: string = '1'
): string {
  return `${name} ${duration} ${easing} ${delay} ${iterationCount}`
}

// 交错动画生成器
export function createStaggeredAnimation(
  baseAnimation: string,
  itemCount: number,
  staggerDelay: number = 100
): string[] {
  return Array.from({ length: itemCount }, (_, index) => {
    const delay = `${index * staggerDelay}ms`
    return `${baseAnimation} ${delay}`
  })
}

// 响应式动画配置
export function createResponsiveAnimation(config: {
  mobile?: string
  tablet?: string
  desktop?: string
}) {
  return {
    mobile: config.mobile || durationSystem.fast,
    tablet: config.tablet || durationSystem.normal,
    desktop: config.desktop || durationSystem.slow
  }
}

export default animationTokens
