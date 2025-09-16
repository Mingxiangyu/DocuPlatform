/**
 * 字体系统 - 设计令牌
 * 基于高保真原型的完整排版层次系统
 */

import type { TypographySystem } from './index'

// 字体族系统
const fontFamilySystem = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ],
  serif: [
    'Crimson Text',
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif'
  ],
  mono: [
    'JetBrains Mono',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ]
}

// 字体尺寸系统 - 基于模块化比例
const fontSizeSystem = {
  xs: ['0.75rem', { lineHeight: '1rem' }] as [string, { lineHeight: string }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }] as [string, { lineHeight: string }],   // 14px
  base: ['1rem', { lineHeight: '1.5rem' }] as [string, { lineHeight: string }],      // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],   // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],    // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }] as [string, { lineHeight: string }],     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as [string, { lineHeight: string }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as [string, { lineHeight: string }],  // 36px
  '5xl': ['3rem', { lineHeight: '1' }] as [string, { lineHeight: string }],          // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }] as [string, { lineHeight: string }]        // 60px
}

// 字体权重系统
const fontWeightSystem = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900'
}

// 行高系统
const lineHeightSystem = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
}

// 字母间距系统
const letterSpacingSystem = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
}

// 完整字体系统导出
export const typographyTokens: TypographySystem = {
  fontFamily: fontFamilySystem,
  fontSize: fontSizeSystem,
  fontWeight: fontWeightSystem,
  lineHeight: lineHeightSystem
}

// 排版预设 - 常用组合
export const typographyPresets = {
  // 标题预设
  heading: {
    h1: {
      fontFamily: fontFamilySystem.serif,
      fontSize: fontSizeSystem['5xl'][0],
      fontWeight: fontWeightSystem.bold,
      lineHeight: fontSizeSystem['5xl'][1].lineHeight,
      letterSpacing: letterSpacingSystem.tight
    },
    h2: {
      fontFamily: fontFamilySystem.serif,
      fontSize: fontSizeSystem['4xl'][0],
      fontWeight: fontWeightSystem.bold,
      lineHeight: fontSizeSystem['4xl'][1].lineHeight,
      letterSpacing: letterSpacingSystem.tight
    },
    h3: {
      fontFamily: fontFamilySystem.serif,
      fontSize: fontSizeSystem['3xl'][0],
      fontWeight: fontWeightSystem.semibold,
      lineHeight: fontSizeSystem['3xl'][1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    },
    h4: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem['2xl'][0],
      fontWeight: fontWeightSystem.semibold,
      lineHeight: fontSizeSystem['2xl'][1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    },
    h5: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.xl[0],
      fontWeight: fontWeightSystem.medium,
      lineHeight: fontSizeSystem.xl[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    },
    h6: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.lg[0],
      fontWeight: fontWeightSystem.medium,
      lineHeight: fontSizeSystem.lg[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    }
  },
  
  // 正文预设
  body: {
    large: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.lg[0],
      fontWeight: fontWeightSystem.normal,
      lineHeight: fontSizeSystem.lg[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    },
    base: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.base[0],
      fontWeight: fontWeightSystem.normal,
      lineHeight: fontSizeSystem.base[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    },
    small: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.sm[0],
      fontWeight: fontWeightSystem.normal,
      lineHeight: fontSizeSystem.sm[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    }
  },
  
  // 特殊用途预设
  special: {
    hero: {
      fontFamily: fontFamilySystem.serif,
      fontSize: fontSizeSystem['6xl'][0],
      fontWeight: fontWeightSystem.black,
      lineHeight: fontSizeSystem['6xl'][1].lineHeight,
      letterSpacing: letterSpacingSystem.tight
    },
    subtitle: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.xl[0],
      fontWeight: fontWeightSystem.normal,
      lineHeight: fontSizeSystem.xl[1].lineHeight,
      letterSpacing: letterSpacingSystem.wide
    },
    caption: {
      fontFamily: fontFamilySystem.sans,
      fontSize: fontSizeSystem.xs[0],
      fontWeight: fontWeightSystem.medium,
      lineHeight: fontSizeSystem.xs[1].lineHeight,
      letterSpacing: letterSpacingSystem.wide
    },
    code: {
      fontFamily: fontFamilySystem.mono,
      fontSize: fontSizeSystem.sm[0],
      fontWeight: fontWeightSystem.normal,
      lineHeight: fontSizeSystem.sm[1].lineHeight,
      letterSpacing: letterSpacingSystem.normal
    }
  }
}

// 响应式字体尺寸
export const responsiveTypography = {
  hero: {
    mobile: fontSizeSystem['3xl'][0],
    tablet: fontSizeSystem['4xl'][0],
    desktop: fontSizeSystem['5xl'][0],
    large: fontSizeSystem['6xl'][0]
  },
  heading: {
    mobile: fontSizeSystem.xl[0],
    tablet: fontSizeSystem['2xl'][0],
    desktop: fontSizeSystem['3xl'][0],
    large: fontSizeSystem['4xl'][0]
  },
  subheading: {
    mobile: fontSizeSystem.lg[0],
    tablet: fontSizeSystem.xl[0],
    desktop: fontSizeSystem['2xl'][0],
    large: fontSizeSystem['3xl'][0]
  }
}

// CSS变量映射
export const typographyCSSVariables = {
  // 字体族变量
  '--font-sans': fontFamilySystem.sans.join(', '),
  '--font-serif': fontFamilySystem.serif.join(', '),
  '--font-mono': fontFamilySystem.mono.join(', '),
  
  // 字体尺寸变量
  '--text-xs': fontSizeSystem.xs[0],
  '--text-sm': fontSizeSystem.sm[0],
  '--text-base': fontSizeSystem.base[0],
  '--text-lg': fontSizeSystem.lg[0],
  '--text-xl': fontSizeSystem.xl[0],
  '--text-2xl': fontSizeSystem['2xl'][0],
  '--text-3xl': fontSizeSystem['3xl'][0],
  '--text-4xl': fontSizeSystem['4xl'][0],
  '--text-5xl': fontSizeSystem['5xl'][0],
  '--text-6xl': fontSizeSystem['6xl'][0],
  
  // 字体权重变量
  '--font-thin': fontWeightSystem.thin,
  '--font-light': fontWeightSystem.light,
  '--font-normal': fontWeightSystem.normal,
  '--font-medium': fontWeightSystem.medium,
  '--font-semibold': fontWeightSystem.semibold,
  '--font-bold': fontWeightSystem.bold,
  '--font-black': fontWeightSystem.black,
  
  // 行高变量
  '--leading-none': lineHeightSystem.none,
  '--leading-tight': lineHeightSystem.tight,
  '--leading-normal': lineHeightSystem.normal,
  '--leading-relaxed': lineHeightSystem.relaxed,
  '--leading-loose': lineHeightSystem.loose
}

// 字体加载优化
export const fontLoadingStrategy = {
  preload: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
      as: 'style'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap',
      as: 'style'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
      as: 'style'
    }
  ],
  fallbacks: {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'Georgia, Times, serif',
    mono: 'Menlo, Monaco, monospace'
  }
}

export default typographyTokens
