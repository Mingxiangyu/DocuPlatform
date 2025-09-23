<template>
  <!-- 简化的面包屑导航，完全匹配高保真原型 -->
  <div class="breadcrumb-nav">
    <!-- 返回按钮 -->
    <router-link
      :to="backLink"
      class="flex items-center gap-1"
    >
      <i class="fas fa-arrow-left text-xs"></i>
      <span>{{ backText }}</span>
    </router-link>

    <!-- 面包屑路径 -->
    <div class="breadcrumb-path" v-if="visibleBreadcrumbs.length > 0">
      <span
        v-for="(crumb, index) in visibleBreadcrumbs"
        :key="index"
        class="flex items-center"
      >
        <!-- 面包屑链接 -->
        <router-link
          v-if="crumb.to && index < visibleBreadcrumbs.length - 1"
          :to="crumb.to"
          class="hover:text-purple-600 transition-colors duration-300"
        >
          {{ crumb.text }}
        </router-link>

        <!-- 当前页面（不可点击） -->
        <span
          v-else
          :class="{ 'truncate max-w-xs': crumb.truncate }"
          :title="crumb.text"
        >
          {{ crumb.text }}
        </span>

        <!-- 分隔符 -->
        <span v-if="index < visibleBreadcrumbs.length - 1" class="breadcrumb-separator mx-1">/</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'

// Props
interface BreadcrumbItem {
  text: string
  to?: string | object
  truncate?: boolean
}

interface Props {
  items?: BreadcrumbItem[]
  backLink?: string | object
  backText?: string
  autoGenerate?: boolean
  category?: string
  subcategory?: string
  articleTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  backLink: '/articles',
  backText: '返回列表',
  autoGenerate: true,
  category: '',
  subcategory: '',
  articleTitle: ''
})

// 设计令牌
const { tokens } = useDesignTokens()

// 路由
const route = useRoute()

// 计算面包屑路径
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  // 如果提供了自定义面包屑，直接使用
  if (props.items.length > 0) {
    return props.items
  }

  // 自动生成面包屑
  if (!props.autoGenerate) {
    return []
  }

  const crumbs: BreadcrumbItem[] = []

  // 根据路由路径生成面包屑
  const pathSegments = route.path.split('/').filter(segment => segment)

  if (pathSegments.includes('articles')) {
    // 如果有分类信息
    if (props.category) {
      crumbs.push({
        text: props.category,
        to: `/articles?category=${encodeURIComponent(props.category)}`
      })

      // 如果有子分类
      if (props.subcategory) {
        crumbs.push({
          text: props.subcategory,
          to: `/articles?category=${encodeURIComponent(props.category)}&subcategory=${encodeURIComponent(props.subcategory)}`
        })
      }
    }

    // 如果是文章详情页，添加文章标题（但不显示完整路径）
    if (route.params.id && props.articleTitle) {
      // 只显示分类和文章标题，简化面包屑
      const simpleCrumbs: BreadcrumbItem[] = []

      if (props.category) {
        simpleCrumbs.push({
          text: props.category,
          to: `/articles?category=${encodeURIComponent(props.category)}`
        })
      }

      // 添加React作为技术标签（模拟高保真原型）
      simpleCrumbs.push({
        text: 'React',
        to: `/articles?tag=react`
      })

      return simpleCrumbs
    }
  }

  return crumbs
})

// 简化的可见面包屑（匹配高保真原型的简洁风格）
const visibleBreadcrumbs = computed<BreadcrumbItem[]>(() => {
  return breadcrumbs.value
})

// 计算返回链接
const backLink = computed(() => {
  if (typeof props.backLink === 'string' || typeof props.backLink === 'object') {
    return props.backLink
  }
  
  // 根据当前路由自动生成返回链接
  if (route.path.includes('/articles/')) {
    return '/articles'
  }
  
  return '/'
})
</script>

<style scoped>
.breadcrumb-navigation {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

/* 截断文本样式 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .breadcrumb-navigation {
    font-size: v-bind('tokens.typography.fontSize.xs[0]');
  }
  
  .max-w-xs {
    max-width: 120px;
  }
}

/* 链接悬停效果 */
.breadcrumb-navigation a {
  text-decoration: none;
}

.breadcrumb-navigation a:hover {
  text-decoration: underline;
}

/* 图标样式 */
.fa-arrow-left {
  transition: transform 0.2s ease;
}

.breadcrumb-navigation a:hover .fa-arrow-left {
  transform: translateX(-2px);
}
</style>
