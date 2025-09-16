/**
 * DocuVault 设计系统 - 主入口文件
 * 统一导出所有设计系统组件、工具和配置
 * 
 * @version 2.0.0
 * @author DocuVault Team
 */

// 设计令牌和工具
export { useDesignTokens } from './composables/useDesignTokens'
export { useTheme } from './composables/useTheme'
export { useAnimation } from './composables/useAnimation'
export { useResponsive } from './composables/useResponsive'

// 设计令牌
export { designTokens } from './tokens'
export type { DesignTokens, ColorTokens, TypographyTokens, SpacingTokens } from './tokens'

// 提供者组件
export { default as DesignSystemProvider } from './providers/DesignSystemProvider.vue'
export { default as ThemeProvider } from './providers/ThemeProvider.vue'

// 原子组件 (Atoms)
export { default as DSButton } from '../components/atoms/DSButton.vue'
export { default as DSInput } from '../components/atoms/DSInput.vue'
export { default as DSTextarea } from '../components/atoms/DSTextarea.vue'
export { default as DSSelect } from '../components/atoms/DSSelect.vue'
export { default as DSCheckbox } from '../components/atoms/DSCheckbox.vue'
export { default as DSRadio } from '../components/atoms/DSRadio.vue'
export { default as DSSwitch } from '../components/atoms/DSSwitch.vue'
export { default as DSSkeletonLoader } from '../components/atoms/DSSkeletonLoader.vue'
export { default as DSBadge } from '../components/atoms/DSBadge.vue'
export { default as DSTooltip } from '../components/atoms/DSTooltip.vue'

// 分子组件 (Molecules)
export { default as DSSearchBox } from '../components/molecules/DSSearchBox.vue'
export { default as DSCategoryNavigation } from '../components/molecules/DSCategoryNavigation.vue'
export { default as DSArticleCard } from '../components/molecules/DSArticleCard.vue'
export { default as DSUserAvatar } from '../components/molecules/DSUserAvatar.vue'
export { default as DSStatsCard } from '../components/molecules/DSStatsCard.vue'
export { default as DSBreadcrumb } from '../components/molecules/DSBreadcrumb.vue'
export { default as DSPagination } from '../components/molecules/DSPagination.vue'
export { default as DSModal } from '../components/molecules/DSModal.vue'
export { default as DSToast } from '../components/molecules/DSToast.vue'
export { default as DSDropdown } from '../components/molecules/DSDropdown.vue'
export { default as DSTagInput } from '../components/molecules/DSTagInput.vue'
export { default as DSProgressBar } from '../components/molecules/DSProgressBar.vue'
export { default as DSFileUpload } from '../components/molecules/DSFileUpload.vue'

// 有机组件 (Organisms)
export { default as DSHeroSection } from '../components/organisms/DSHeroSection.vue'
export { default as DSFeatureGrid } from '../components/organisms/DSFeatureGrid.vue'
export { default as DSTestimonialCard } from '../components/organisms/DSTestimonialCard.vue'
export { default as DSNewsletterSignup } from '../components/organisms/DSNewsletterSignup.vue'
export { default as DSDataTable } from '../components/organisms/DSDataTable.vue'

// 模板组件 (Templates)
export { default as DSDefaultLayout } from '../components/templates/DSDefaultLayout.vue'
export { default as DSAuthLayout } from '../components/templates/DSAuthLayout.vue'
export { default as DSAdminLayout } from '../components/templates/DSAdminLayout.vue'

// 页面组件 (Pages)
export { default as HomePage } from '../pages/HomePage.vue'
export { default as DSArticlesPage } from '../pages/DSArticlesPage.vue'
export { default as DSProfilePage } from '../pages/DSProfilePage.vue'
export { default as DSLoginPage } from '../pages/DSLoginPage.vue'
export { default as DSRegisterPage } from '../pages/DSRegisterPage.vue'

// 组件注册表
export { componentRegistry } from './registry/ComponentRegistry'

// 工具函数
export { formatFileSize, generateId, debounce, throttle } from './utils'

// 类型定义
export type {
  ComponentConfig,
  ComponentType,
  ComponentSize,
  ComponentVariant,
  ThemeConfig,
  AnimationConfig,
  ResponsiveConfig
} from './types'

// 版本信息
export const VERSION = '2.0.0'
export const BUILD_DATE = new Date().toISOString()

/**
 * 设计系统配置
 */
export interface DesignSystemConfig {
  theme?: 'light' | 'dark' | 'auto'
  locale?: string
  rtl?: boolean
  animations?: boolean
  accessibility?: {
    reducedMotion?: boolean
    highContrast?: boolean
    screenReader?: boolean
  }
}

/**
 * 默认配置
 */
export const defaultConfig: DesignSystemConfig = {
  theme: 'light',
  locale: 'zh-CN',
  rtl: false,
  animations: true,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReader: true
  }
}

/**
 * 组件分类映射
 */
export const componentCategories = {
  atoms: [
    'DSButton', 'DSInput', 'DSTextarea', 'DSSelect', 'DSCheckbox', 
    'DSRadio', 'DSSwitch', 'DSSkeletonLoader', 'DSBadge', 'DSTooltip'
  ],
  molecules: [
    'DSSearchBox', 'DSCategoryNavigation', 'DSArticleCard', 'DSUserAvatar',
    'DSStatsCard', 'DSBreadcrumb', 'DSPagination', 'DSModal', 'DSToast',
    'DSDropdown', 'DSTagInput', 'DSProgressBar', 'DSFileUpload'
  ],
  organisms: [
    'DSHeroSection', 'DSFeatureGrid', 'DSTestimonialCard', 
    'DSNewsletterSignup', 'DSDataTable'
  ],
  templates: [
    'DSDefaultLayout', 'DSAuthLayout', 'DSAdminLayout'
  ],
  pages: [
    'HomePage', 'DSArticlesPage', 'DSProfilePage', 'DSLoginPage', 'DSRegisterPage'
  ]
}

/**
 * 组件统计信息
 */
export const componentStats = {
  total: Object.values(componentCategories).flat().length,
  atoms: componentCategories.atoms.length,
  molecules: componentCategories.molecules.length,
  organisms: componentCategories.organisms.length,
  templates: componentCategories.templates.length,
  pages: componentCategories.pages.length
}

/**
 * 设计系统元数据
 */
export const designSystemMeta = {
  name: 'DocuVault Design System',
  version: VERSION,
  description: '企业级知识付费平台设计系统',
  author: 'DocuVault Team',
  license: 'MIT',
  repository: 'https://github.com/docuvault/design-system',
  documentation: 'https://design.docuvault.com',
  components: componentStats,
  features: [
    '36个高质量组件',
    '完整的设计令牌系统',
    '企业级可访问性支持',
    '响应式设计',
    'TypeScript 支持',
    '主题定制',
    '国际化支持',
    '性能优化'
  ],
  technologies: [
    'Vue 3',
    'TypeScript',
    'Composition API',
    'CSS Variables',
    'Tailwind CSS',
    'Vite'
  ]
}

/**
 * 快速开始指南
 */
export const quickStart = {
  installation: `
    # 安装依赖
    npm install @docuvault/design-system
    
    # 或使用 yarn
    yarn add @docuvault/design-system
  `,
  
  basicUsage: `
    // main.ts
    import { createApp } from 'vue'
    import { DesignSystemProvider } from '@docuvault/design-system'
    import '@docuvault/design-system/dist/style.css'
    
    const app = createApp(App)
    app.use(DesignSystemProvider)
    app.mount('#app')
  `,
  
  componentUsage: `
    <template>
      <DSButton variant="primary" size="lg" @click="handleClick">
        点击我
      </DSButton>
    </template>
    
    <script setup>
    import { DSButton } from '@docuvault/design-system'
    
    const handleClick = () => {
      console.log('按钮被点击了！')
    }
    </script>
  `
}

/**
 * 设计原则
 */
export const designPrinciples = {
  consistency: {
    title: '一致性',
    description: '保持视觉和交互的一致性，降低用户学习成本'
  },
  accessibility: {
    title: '可访问性',
    description: '确保所有用户都能无障碍地使用我们的产品'
  },
  performance: {
    title: '性能',
    description: '优化加载速度和运行性能，提供流畅的用户体验'
  },
  scalability: {
    title: '可扩展性',
    description: '支持大规模应用和团队协作，易于维护和扩展'
  },
  usability: {
    title: '易用性',
    description: '简化复杂操作，提供直观的用户界面'
  },
  aesthetics: {
    title: '美观性',
    description: '现代化的视觉设计，提升品牌形象和用户满意度'
  }
}

/**
 * 浏览器支持
 */
export const browserSupport = {
  modern: [
    'Chrome >= 88',
    'Firefox >= 85',
    'Safari >= 14',
    'Edge >= 88'
  ],
  mobile: [
    'iOS Safari >= 14',
    'Chrome Mobile >= 88',
    'Samsung Internet >= 15'
  ],
  note: '不支持 Internet Explorer'
}

/**
 * 更新日志摘要
 */
export const changelog = {
  '2.0.0': {
    date: '2024-12-11',
    type: 'major',
    changes: [
      '完整重构设计系统架构',
      '新增36个企业级组件',
      '建立完整的设计令牌系统',
      '实现100%TypeScript支持',
      '添加完整的可访问性支持',
      '优化性能和包体积',
      '支持主题定制和暗色模式'
    ]
  },
  '1.0.0': {
    date: '2024-10-01',
    type: 'major',
    changes: [
      '初始版本发布',
      '基础组件库',
      '简单的主题系统'
    ]
  }
}

// 默认导出设计系统配置
export default {
  version: VERSION,
  config: defaultConfig,
  meta: designSystemMeta,
  components: componentCategories,
  stats: componentStats,
  principles: designPrinciples,
  browserSupport,
  changelog,
  quickStart
}
