import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点定义
export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

// 默认断点（与 Tailwind CSS 保持一致）
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

// 屏幕方向
export type Orientation = 'portrait' | 'landscape'

// 响应式状态
export interface ResponsiveState {
  width: number
  height: number
  breakpoint: keyof Breakpoints
  deviceType: DeviceType
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
}

export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints }
  
  // 响应式状态
  const width = ref(0)
  const height = ref(0)
  const isTouch = ref(false)

  // 计算属性
  const breakpoint = computed((): keyof Breakpoints => {
    const w = width.value
    if (w >= breakpoints['2xl']) return '2xl'
    if (w >= breakpoints.xl) return 'xl'
    if (w >= breakpoints.lg) return 'lg'
    if (w >= breakpoints.md) return 'md'
    if (w >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  const deviceType = computed((): DeviceType => {
    const w = width.value
    if (w < breakpoints.md) return 'mobile'
    if (w < breakpoints.lg) return 'tablet'
    return 'desktop'
  })

  const orientation = computed((): Orientation => {
    return width.value > height.value ? 'landscape' : 'portrait'
  })

  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')

  // 断点检查函数
  const isBreakpoint = (bp: keyof Breakpoints) => computed(() => breakpoint.value === bp)
  const isBreakpointOrAbove = (bp: keyof Breakpoints) => computed(() => width.value >= breakpoints[bp])
  const isBreakpointOrBelow = (bp: keyof Breakpoints) => computed(() => {
    const bpKeys = Object.keys(breakpoints) as (keyof Breakpoints)[]
    const currentIndex = bpKeys.indexOf(breakpoint.value)
    const targetIndex = bpKeys.indexOf(bp)
    return currentIndex <= targetIndex
  })

  // 更新尺寸
  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  // 检测触摸设备
  const detectTouch = () => {
    isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // 事件监听器
  let resizeObserver: ResizeObserver | null = null

  const startListening = () => {
    updateSize()
    detectTouch()

    // 使用 ResizeObserver 监听窗口大小变化（更高效）
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateSize)
      resizeObserver.observe(document.documentElement)
    } else {
      // 降级到 resize 事件
      window.addEventListener('resize', updateSize, { passive: true })
    }

    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSize, 100) // 延迟更新，等待方向变化完成
    }, { passive: true })
  }

  const stopListening = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    } else {
      window.removeEventListener('resize', updateSize)
    }
    window.removeEventListener('orientationchange', updateSize)
  }

  // 生命周期
  onMounted(startListening)
  onUnmounted(stopListening)

  // 响应式状态对象
  const state = computed((): ResponsiveState => ({
    width: width.value,
    height: height.value,
    breakpoint: breakpoint.value,
    deviceType: deviceType.value,
    orientation: orientation.value,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    isTouch: isTouch.value
  }))

  return {
    // 基础状态
    width,
    height,
    breakpoint,
    deviceType,
    orientation,
    isTouch,
    
    // 设备类型检查
    isMobile,
    isTablet,
    isDesktop,
    
    // 断点检查函数
    isBreakpoint,
    isBreakpointOrAbove,
    isBreakpointOrBelow,
    
    // 便捷的断点检查
    isXs: isBreakpoint('xs'),
    isSm: isBreakpoint('sm'),
    isMd: isBreakpoint('md'),
    isLg: isBreakpoint('lg'),
    isXl: isBreakpoint('xl'),
    is2Xl: isBreakpoint('2xl'),
    
    // 便捷的范围检查
    isSmOrAbove: isBreakpointOrAbove('sm'),
    isMdOrAbove: isBreakpointOrAbove('md'),
    isLgOrAbove: isBreakpointOrAbove('lg'),
    isXlOrAbove: isBreakpointOrAbove('xl'),
    
    isSmOrBelow: isBreakpointOrBelow('sm'),
    isMdOrBelow: isBreakpointOrBelow('md'),
    isLgOrBelow: isBreakpointOrBelow('lg'),
    
    // 完整状态
    state,
    
    // 工具方法
    updateSize,
    breakpoints
  }
}

// 全局响应式状态（可选）
let globalResponsive: ReturnType<typeof useResponsive> | null = null

export function useGlobalResponsive() {
  if (!globalResponsive) {
    globalResponsive = useResponsive()
  }
  return globalResponsive
}

// 响应式类名生成器
export function useResponsiveClasses() {
  const responsive = useResponsive()

  const getResponsiveClasses = (classMap: Partial<Record<keyof Breakpoints | DeviceType, string>>) => {
    const classes: string[] = []

    // 按设备类型添加类名
    if (classMap[responsive.deviceType.value]) {
      classes.push(classMap[responsive.deviceType.value]!)
    }

    // 按断点添加类名
    if (classMap[responsive.breakpoint.value]) {
      classes.push(classMap[responsive.breakpoint.value]!)
    }

    return classes.join(' ')
  }

  const getDeviceClass = (mobileClass: string, tabletClass?: string, desktopClass?: string) => {
    if (responsive.isMobile.value) return mobileClass
    if (responsive.isTablet.value) return tabletClass || mobileClass
    return desktopClass || tabletClass || mobileClass
  }

  return {
    getResponsiveClasses,
    getDeviceClass,
    ...responsive
  }
}

// 响应式值选择器
export function useResponsiveValue<T>(values: Partial<Record<keyof Breakpoints | DeviceType, T>>, defaultValue: T) {
  const responsive = useResponsive()

  const value = computed(() => {
    // 优先按设备类型匹配
    if (values[responsive.deviceType.value] !== undefined) {
      return values[responsive.deviceType.value]!
    }

    // 按断点匹配
    if (values[responsive.breakpoint.value] !== undefined) {
      return values[responsive.breakpoint.value]!
    }

    // 按断点优先级匹配（从大到小）
    const breakpointOrder: (keyof Breakpoints)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    for (const bp of breakpointOrder) {
      if (values[bp] !== undefined && responsive.isBreakpointOrAbove(bp).value) {
        return values[bp]!
      }
    }

    return defaultValue
  })

  return value
}

// 媒体查询 Hook
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const updateMatches = (e: MediaQueryListEvent) => {
    matches.value = e.matches
  }

  onMounted(() => {
    if (window.matchMedia) {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches
      
      // 现代浏览器使用 addEventListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateMatches)
      } else {
        // 旧浏览器降级
        mediaQuery.addListener(updateMatches)
      }
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches)
      } else {
        mediaQuery.removeListener(updateMatches)
      }
    }
  })

  return matches
}

// 预设媒体查询
export function useCommonMediaQueries() {
  return {
    prefersDark: useMediaQuery('(prefers-color-scheme: dark)'),
    prefersReducedMotion: useMediaQuery('(prefers-reduced-motion: reduce)'),
    prefersHighContrast: useMediaQuery('(prefers-contrast: high)'),
    isRetina: useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)')
  }
}
