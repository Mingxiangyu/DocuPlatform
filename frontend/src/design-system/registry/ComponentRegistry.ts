/**
 * 设计系统组件注册表 - ComponentRegistry
 * 统一管理所有设计系统组件的注册、配置和导出
 */

import type { Component } from 'vue'

// 导入所有设计系统组件
// 原子组件 (Atoms)
import DSButton from '../../components/atoms/DSButton.vue'
import DSInput from '../../components/atoms/DSInput.vue'
import DSSkeletonLoader from '../../components/atoms/DSSkeletonLoader.vue'
import DSScrollProgress from '../../components/atoms/DSScrollProgress.vue'

// 分子组件 (Molecules)
import DSCategoryCard from '../../components/molecules/DSCategoryCard.vue'
import DSArticleCard from '../../components/molecules/DSArticleCard.vue'
import DSCategoryNavigation from '../../components/molecules/DSCategoryNavigation.vue'

// 有机组件 (Organisms)
import DSCategoryGrid from '../../components/organisms/DSCategoryGrid.vue'
import DSHeader from '../../components/organisms/DSHeader.vue'

// 模板组件 (Templates)
import DSDefaultLayout from '../../components/templates/DSDefaultLayout.vue'

// 组件配置接口
interface ComponentConfig {
  component: Component
  category: 'atom' | 'molecule' | 'organism' | 'template'
  version: string
  description: string
  defaultProps?: Record<string, any>
  dependencies?: string[]
  tags?: string[]
}

// 组件注册表
export const componentRegistry: Record<string, ComponentConfig> = {
  // 原子组件
  'DSButton': {
    component: DSButton,
    category: 'atom',
    version: '2.0.0',
    description: '设计系统按钮组件，支持多种变体和状态',
    defaultProps: {
      variant: 'primary',
      size: 'md',
      disabled: false
    },
    tags: ['button', 'interactive', 'form']
  },
  
  'DSInput': {
    component: DSInput,
    category: 'atom',
    version: '2.0.0',
    description: '设计系统输入框组件，支持多种类型和验证',
    defaultProps: {
      type: 'text',
      size: 'md',
      disabled: false
    },
    tags: ['input', 'form', 'text']
  },
  
  'DSSkeletonLoader': {
    component: DSSkeletonLoader,
    category: 'atom',
    version: '2.0.0',
    description: '骨架屏加载组件，提供优雅的加载状态',
    defaultProps: {
      width: '100%',
      height: '20px',
      animation: true
    },
    tags: ['loading', 'skeleton', 'placeholder']
  },
  
  'DSScrollProgress': {
    component: DSScrollProgress,
    category: 'atom',
    version: '2.0.0',
    description: '滚动进度指示器，支持多种位置和样式',
    defaultProps: {
      position: 'top',
      height: 3,
      animated: true,
      gradient: true
    },
    tags: ['scroll', 'progress', 'indicator']
  },
  
  // 分子组件
  'DSCategoryCard': {
    component: DSCategoryCard,
    category: 'molecule',
    version: '2.0.0',
    description: '分类卡片组件，展示分类信息和统计',
    defaultProps: {
      size: 'md',
      variant: 'default',
      showStats: true
    },
    dependencies: ['DSButton'],
    tags: ['card', 'category', 'navigation']
  },
  
  'DSArticleCard': {
    component: DSArticleCard,
    category: 'molecule',
    version: '2.0.0',
    description: '文章卡片组件，展示文章信息和操作',
    defaultProps: {
      variant: 'default',
      showAuthor: true,
      showStats: true
    },
    dependencies: ['DSButton'],
    tags: ['card', 'article', 'content']
  },
  
  'DSCategoryNavigation': {
    component: DSCategoryNavigation,
    category: 'molecule',
    version: '2.0.0',
    description: '分类导航组件，支持多种布局和变体',
    defaultProps: {
      layout: 'horizontal',
      variant: 'default',
      size: 'md',
      showCounts: true
    },
    dependencies: ['DSSkeletonLoader'],
    tags: ['navigation', 'category', 'filter']
  },
  
  // 有机组件
  'DSCategoryGrid': {
    component: DSCategoryGrid,
    category: 'organism',
    version: '2.0.0',
    description: '智能分类网格容器，支持响应式布局和动画',
    defaultProps: {
      columns: { base: 2, sm: 3, md: 4, lg: 6, xl: 6 },
      gap: 'md',
      animationStagger: 100,
      scrollAnimation: true
    },
    dependencies: ['DSCategoryCard', 'DSSkeletonLoader'],
    tags: ['grid', 'category', 'responsive', 'animation']
  },
  
  'DSHeader': {
    component: DSHeader,
    category: 'organism',
    version: '2.0.0',
    description: '导航头部组件，集成搜索、用户菜单和响应式设计',
    defaultProps: {
      sticky: true,
      elevation: 'sm',
      showSearch: true,
      showScrollProgress: false
    },
    dependencies: ['DSInput', 'DSButton'],
    tags: ['header', 'navigation', 'search', 'responsive']
  },
  
  // 模板组件
  'DSDefaultLayout': {
    component: DSDefaultLayout,
    category: 'template',
    version: '2.0.0',
    description: '默认布局模板，集成头部、页脚、通知和全局功能',
    defaultProps: {
      showScrollProgress: true,
      showFooter: true,
      showBackToTop: true,
      stickyHeader: true
    },
    dependencies: ['DSHeader', 'DSScrollProgress'],
    tags: ['layout', 'template', 'global', 'responsive']
  }
}

// 组件别名映射
export const componentAliases: Record<string, string> = {
  'Button': 'DSButton',
  'Input': 'DSInput',
  'SkeletonLoader': 'DSSkeletonLoader',
  'ScrollProgress': 'DSScrollProgress',
  'CategoryCard': 'DSCategoryCard',
  'ArticleCard': 'DSArticleCard',
  'CategoryNavigation': 'DSCategoryNavigation',
  'CategoryGrid': 'DSCategoryGrid',
  'Header': 'DSHeader',
  'DefaultLayout': 'DSDefaultLayout'
}

// 按类别获取组件
export const getComponentsByCategory = (category: ComponentConfig['category']) => {
  return Object.entries(componentRegistry)
    .filter(([_, config]) => config.category === category)
    .reduce((acc, [name, config]) => {
      acc[name] = config
      return acc
    }, {} as Record<string, ComponentConfig>)
}

// 获取组件依赖关系
export const getComponentDependencies = (componentName: string): string[] => {
  const config = componentRegistry[componentName]
  if (!config) return []
  
  const dependencies = config.dependencies || []
  const allDependencies = [...dependencies]
  
  // 递归获取依赖的依赖
  dependencies.forEach(dep => {
    const subDependencies = getComponentDependencies(dep)
    allDependencies.push(...subDependencies)
  })
  
  // 去重并返回
  return [...new Set(allDependencies)]
}

// 按标签搜索组件
export const searchComponentsByTag = (tag: string) => {
  return Object.entries(componentRegistry)
    .filter(([_, config]) => config.tags?.includes(tag))
    .reduce((acc, [name, config]) => {
      acc[name] = config
      return acc
    }, {} as Record<string, ComponentConfig>)
}

// 获取组件统计信息
export const getComponentStats = () => {
  const stats = {
    total: Object.keys(componentRegistry).length,
    byCategory: {} as Record<string, number>,
    byVersion: {} as Record<string, number>,
    totalTags: new Set<string>()
  }
  
  Object.values(componentRegistry).forEach(config => {
    // 按类别统计
    stats.byCategory[config.category] = (stats.byCategory[config.category] || 0) + 1
    
    // 按版本统计
    stats.byVersion[config.version] = (stats.byVersion[config.version] || 0) + 1
    
    // 收集所有标签
    config.tags?.forEach(tag => stats.totalTags.add(tag))
  })
  
  return {
    ...stats,
    totalTags: stats.totalTags.size
  }
}

// 验证组件依赖关系
export const validateComponentDependencies = () => {
  const errors: string[] = []
  
  Object.entries(componentRegistry).forEach(([name, config]) => {
    config.dependencies?.forEach(dep => {
      if (!componentRegistry[dep] && !componentAliases[dep]) {
        errors.push(`Component "${name}" depends on "${dep}" which is not registered`)
      }
    })
  })
  
  return errors
}

// 导出所有组件
export const allComponents = Object.fromEntries(
  Object.entries(componentRegistry).map(([name, config]) => [name, config.component])
)

// 导出组件配置
export const allComponentConfigs = componentRegistry

// 默认导出
export default {
  registry: componentRegistry,
  aliases: componentAliases,
  components: allComponents,
  configs: allComponentConfigs,
  getComponentsByCategory,
  getComponentDependencies,
  searchComponentsByTag,
  getComponentStats,
  validateComponentDependencies
}
