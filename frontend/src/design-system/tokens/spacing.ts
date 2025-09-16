/**
 * 间距系统 - 设计令牌
 * 基于8px基准网格的完整间距系统
 */

import type { SpacingSystem } from './index'

// 8px基准网格间距系统
export const spacingTokens: SpacingSystem = {
  // 像素级精确控制
  px: '1px',
  0: '0px',
  
  // 基于0.25rem (4px) 的递增系统
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px - 基准单位
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px - 标准单位
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
}

// 语义化间距预设
export const spacingPresets = {
  // 组件内部间距
  component: {
    tight: spacingTokens[2],      // 8px
    normal: spacingTokens[4],     // 16px
    loose: spacingTokens[6],      // 24px
    spacious: spacingTokens[8]    // 32px
  },
  
  // 布局间距
  layout: {
    section: spacingTokens[16],   // 64px
    container: spacingTokens[20], // 80px
    page: spacingTokens[24],      // 96px
    hero: spacingTokens[32]       // 128px
  },
  
  // 卡片间距
  card: {
    padding: {
      small: spacingTokens[4],    // 16px
      medium: spacingTokens[6],   // 24px
      large: spacingTokens[8]     // 32px
    },
    gap: {
      small: spacingTokens[3],    // 12px
      medium: spacingTokens[4],   // 16px
      large: spacingTokens[6]     // 24px
    }
  },
  
  // 表单间距
  form: {
    fieldGap: spacingTokens[4],   // 16px
    labelGap: spacingTokens[2],   // 8px
    groupGap: spacingTokens[6],   // 24px
    submitGap: spacingTokens[8]   // 32px
  },
  
  // 导航间距
  navigation: {
    itemGap: spacingTokens[6],    // 24px
    sectionGap: spacingTokens[8], // 32px
    padding: spacingTokens[4]     // 16px
  },
  
  // 内容间距
  content: {
    paragraphGap: spacingTokens[4],  // 16px
    headingGap: spacingTokens[6],    // 24px
    sectionGap: spacingTokens[12],   // 48px
    listItemGap: spacingTokens[2]    // 8px
  }
}

// 响应式间距系统
export const responsiveSpacing = {
  // 容器边距
  container: {
    mobile: spacingTokens[4],     // 16px
    tablet: spacingTokens[6],     // 24px
    desktop: spacingTokens[8],    // 32px
    large: spacingTokens[12]      // 48px
  },
  
  // 区块间距
  section: {
    mobile: spacingTokens[8],     // 32px
    tablet: spacingTokens[12],    // 48px
    desktop: spacingTokens[16],   // 64px
    large: spacingTokens[20]      // 80px
  },
  
  // 英雄区域间距
  hero: {
    mobile: spacingTokens[12],    // 48px
    tablet: spacingTokens[16],    // 64px
    desktop: spacingTokens[20],   // 80px
    large: spacingTokens[24]      // 96px
  }
}

// 网格系统间距
export const gridSpacing = {
  // 列间距
  gap: {
    none: spacingTokens[0],       // 0px
    small: spacingTokens[2],      // 8px
    medium: spacingTokens[4],     // 16px
    large: spacingTokens[6],      // 24px
    xlarge: spacingTokens[8]      // 32px
  },
  
  // 行间距
  rowGap: {
    none: spacingTokens[0],       // 0px
    small: spacingTokens[3],      // 12px
    medium: spacingTokens[6],     // 24px
    large: spacingTokens[8],      // 32px
    xlarge: spacingTokens[12]     // 48px
  }
}

// 特殊用途间距
export const specialSpacing = {
  // 分类卡片间距
  categoryCard: {
    padding: spacingTokens[5],    // 20px
    iconGap: spacingTokens[3],    // 12px
    titleGap: spacingTokens[2],   // 8px
    gridGap: spacingTokens[4]     // 16px
  },
  
  // 文章卡片间距
  articleCard: {
    padding: spacingTokens[6],    // 24px
    imageGap: spacingTokens[4],   // 16px
    metaGap: spacingTokens[2],    // 8px
    tagGap: spacingTokens[1]      // 4px
  },
  
  // 英雄区域间距
  heroSection: {
    padding: spacingTokens[20],   // 80px
    contentGap: spacingTokens[8], // 32px
    buttonGap: spacingTokens[4],  // 16px
    visualGap: spacingTokens[12]  // 48px
  },
  
  // 导航栏间距
  header: {
    padding: spacingTokens[4],    // 16px
    logoGap: spacingTokens[8],    // 32px
    navGap: spacingTokens[6],     // 24px
    actionGap: spacingTokens[4]   // 16px
  }
}

// CSS变量映射
export const spacingCSSVariables = {
  // 基础间距变量
  '--spacing-px': spacingTokens.px,
  '--spacing-0': spacingTokens[0],
  '--spacing-1': spacingTokens[1],
  '--spacing-2': spacingTokens[2],
  '--spacing-3': spacingTokens[3],
  '--spacing-4': spacingTokens[4],
  '--spacing-5': spacingTokens[5],
  '--spacing-6': spacingTokens[6],
  '--spacing-8': spacingTokens[8],
  '--spacing-10': spacingTokens[10],
  '--spacing-12': spacingTokens[12],
  '--spacing-16': spacingTokens[16],
  '--spacing-20': spacingTokens[20],
  '--spacing-24': spacingTokens[24],
  '--spacing-32': spacingTokens[32],
  
  // 语义化间距变量
  '--spacing-component-tight': spacingPresets.component.tight,
  '--spacing-component-normal': spacingPresets.component.normal,
  '--spacing-component-loose': spacingPresets.component.loose,
  '--spacing-layout-section': spacingPresets.layout.section,
  '--spacing-layout-container': spacingPresets.layout.container,
  '--spacing-card-padding': spacingPresets.card.padding.medium,
  '--spacing-form-gap': spacingPresets.form.fieldGap,
  
  // 特殊用途间距变量
  '--spacing-category-card': specialSpacing.categoryCard.padding,
  '--spacing-article-card': specialSpacing.articleCard.padding,
  '--spacing-hero-section': specialSpacing.heroSection.padding,
  '--spacing-header': specialSpacing.header.padding
}

// 间距工具函数
export function getSpacing(key: string | number): string {
  return spacingTokens[key] || spacingTokens[4] // 默认返回16px
}

// 计算间距值（用于动态计算）
export function calculateSpacing(multiplier: number, base: number = 4): string {
  return `${multiplier * base}px`
}

// 响应式间距生成器
export function generateResponsiveSpacing(
  mobile: string,
  tablet?: string,
  desktop?: string,
  large?: string
) {
  return {
    mobile,
    tablet: tablet || mobile,
    desktop: desktop || tablet || mobile,
    large: large || desktop || tablet || mobile
  }
}

// 间距验证函数
export function validateSpacing(value: string): boolean {
  return Object.values(spacingTokens).includes(value)
}

export default spacingTokens
