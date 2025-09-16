<!--
  设计系统面包屑导航组件 - DSBreadcrumb
  提供层级导航路径，支持多种样式和交互模式
-->

<template>
  <nav
    ref="breadcrumbRef"
    :class="breadcrumbClasses"
    :style="breadcrumbStyles"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <!-- 面包屑列表 -->
    <ol class="breadcrumb-list" :style="listStyles">
      <li
        v-for="(item, index) in processedItems"
        :key="item.key || index"
        class="breadcrumb-item"
        :class="getBreadcrumbItemClasses(item, index)"
        :style="getBreadcrumbItemStyles(item, index)"
      >
        <!-- 面包屑链接或文本 -->
        <component
          :is="item.href || item.to ? (item.to ? 'router-link' : 'a') : 'span'"
          :href="item.href"
          :to="item.to"
          :class="getBreadcrumbLinkClasses(item, index)"
          :style="getBreadcrumbLinkStyles(item, index)"
          :aria-current="isCurrentPage(index) ? 'page' : undefined"
          @click="handleItemClick(item, index, $event)"
          @mouseenter="handleItemHover(item, index, $event)"
          @focus="handleItemFocus(item, index, $event)"
        >
          <!-- 图标 -->
          <span
            v-if="item.icon"
            class="breadcrumb-icon"
            :style="getBreadcrumbIconStyles(item, index)"
          >
            <component :is="item.icon" />
          </span>
          
          <!-- 文本 -->
          <span class="breadcrumb-text" :style="breadcrumbTextStyles">
            {{ item.label }}
          </span>
        </component>

        <!-- 分隔符 -->
        <span
          v-if="!isLastItem(index)"
          class="breadcrumb-separator"
          :style="separatorStyles"
          aria-hidden="true"
        >
          <component
            v-if="separatorIcon"
            :is="separatorIcon"
          />
          <span v-else>{{ separator }}</span>
        </span>
      </li>
    </ol>

    <!-- 折叠指示器（当项目过多时） -->
    <div
      v-if="showCollapsed && collapsedItems.length > 0"
      class="breadcrumb-collapsed"
      :style="collapsedStyles"
    >
      <button
        class="collapsed-toggle"
        :style="collapsedToggleStyles"
        :aria-label="`显示 ${collapsedItems.length} 个隐藏的导航项`"
        @click="toggleCollapsed"
      >
        <span class="collapsed-dots">...</span>
        <span class="collapsed-count">({{ collapsedItems.length }})</span>
      </button>
      
      <!-- 展开的折叠项目 -->
      <div
        v-if="isCollapsedExpanded"
        class="collapsed-dropdown"
        :style="collapsedDropdownStyles"
      >
        <div
          v-for="(item, index) in collapsedItems"
          :key="item.key || `collapsed-${index}`"
          class="collapsed-item"
          :style="collapsedItemStyles"
        >
          <component
            :is="item.href || item.to ? (item.to ? 'router-link' : 'a') : 'span'"
            :href="item.href"
            :to="item.to"
            class="collapsed-link"
            :style="collapsedLinkStyles"
            @click="handleCollapsedItemClick(item, index, $event)"
          >
            <span v-if="item.icon" class="collapsed-icon">
              <component :is="item.icon" />
            </span>
            <span class="collapsed-text">{{ item.label }}</span>
          </component>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDesignTokens, useScrollTrigger } from '../../design-system/composables'

// 面包屑项目接口
interface BreadcrumbItem {
  key?: string
  label: string
  href?: string
  to?: string | object
  icon?: any
  disabled?: boolean
  meta?: Record<string, any>
}

// 组件属性接口
interface Props {
  items?: BreadcrumbItem[]
  separator?: string
  separatorIcon?: any
  maxItems?: number
  showHome?: boolean
  homeLabel?: string
  homeIcon?: any
  homeTo?: string | object
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'pills' | 'underline'
  color?: 'default' | 'primary' | 'secondary'
  showIcons?: boolean
  collapsible?: boolean
  ariaLabel?: string
  scrollAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  separator: '/',
  separatorIcon: undefined,
  maxItems: 5,
  showHome: true,
  homeLabel: '首页',
  homeIcon: undefined,
  homeTo: '/',
  size: 'md',
  variant: 'default',
  color: 'default',
  showIcons: true,
  collapsible: true,
  ariaLabel: '面包屑导航',
  scrollAnimation: false
})

// 事件定义
const emit = defineEmits<{
  itemClick: [item: BreadcrumbItem, index: number, event: Event]
  itemHover: [item: BreadcrumbItem, index: number, event: MouseEvent]
  itemFocus: [item: BreadcrumbItem, index: number, event: FocusEvent]
}>()

// 路由和设计令牌
const router = useRouter()
const route = useRoute()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()
const breadcrumbRef = ref<HTMLElement | null>(null)

// 滚动触发动画
const { observe, isVisible } = useScrollTrigger({
  threshold: 0.1,
  triggerOnce: true
})

// 状态管理
const isCollapsedExpanded = ref(false)

// 处理后的面包屑项目
const processedItems = computed(() => {
  const allItems: BreadcrumbItem[] = []
  
  // 添加首页项目
  if (props.showHome) {
    allItems.push({
      key: 'home',
      label: props.homeLabel,
      to: props.homeTo,
      icon: props.homeIcon || {
        template: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>'
      }
    })
  }
  
  // 添加用户提供的项目
  allItems.push(...props.items)
  
  return allItems
})

// 折叠逻辑
const showCollapsed = computed(() => {
  return props.collapsible && processedItems.value.length > props.maxItems
})

const visibleItems = computed(() => {
  if (!showCollapsed.value) {
    return processedItems.value
  }
  
  const items = [...processedItems.value]
  const maxVisible = props.maxItems - 1 // 为折叠指示器留出空间
  
  if (items.length <= maxVisible) {
    return items
  }
  
  // 保留第一个和最后几个项目
  const firstItem = items[0]
  const lastItems = items.slice(-Math.floor(maxVisible / 2))
  
  return [firstItem, ...lastItems]
})

const collapsedItems = computed(() => {
  if (!showCollapsed.value) {
    return []
  }
  
  const allItems = processedItems.value
  const visible = visibleItems.value
  
  return allItems.filter(item => !visible.includes(item))
})

// 样式计算
const breadcrumbClasses = computed(() => [
  'ds-breadcrumb',
  `ds-breadcrumb-${props.size}`,
  `ds-breadcrumb-${props.variant}`,
  `ds-breadcrumb-${props.color}`,
  {
    'ds-breadcrumb-animated': props.scrollAnimation && isVisible.value,
    'ds-breadcrumb-collapsible': props.collapsible
  }
])

const breadcrumbStyles = computed(() => ({
  fontFamily: tokens.typography.fontFamily.sans.join(', ')
}))

const listStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: getSpacing(1),
  listStyle: 'none',
  margin: '0',
  padding: '0'
}))

// 面包屑项目样式
const getBreadcrumbItemClasses = (item: BreadcrumbItem, index: number) => [
  'breadcrumb-item',
  {
    'breadcrumb-item-current': isCurrentPage(index),
    'breadcrumb-item-disabled': item.disabled,
    'breadcrumb-item-clickable': !item.disabled && (item.href || item.to)
  }
]

const getBreadcrumbItemStyles = (item: BreadcrumbItem, index: number) => {
  const styles: Record<string, string> = {
    display: 'flex',
    alignItems: 'center'
  }
  
  if (props.variant === 'pills') {
    styles.backgroundColor = isCurrentPage(index) ? getColor('primary.100') : 'transparent'
    styles.borderRadius = tokens.borderRadius.full
    styles.padding = `${getSpacing(1)} ${getSpacing(3)}`
  }
  
  return styles
}

// 面包屑链接样式
const getBreadcrumbLinkClasses = (item: BreadcrumbItem, index: number) => [
  'breadcrumb-link',
  {
    'breadcrumb-link-current': isCurrentPage(index),
    'breadcrumb-link-disabled': item.disabled
  }
]

const getBreadcrumbLinkStyles = (item: BreadcrumbItem, index: number) => {
  const isCurrent = isCurrentPage(index)
  const isClickable = !item.disabled && (item.href || item.to)
  
  const baseStyles: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(1),
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    outline: 'none'
  }
  
  // 尺寸样式
  const sizeMap = {
    sm: {
      fontSize: tokens.typography.fontSize.xs[0],
      padding: `${getSpacing(1)} ${getSpacing(2)}`
    },
    md: {
      fontSize: tokens.typography.fontSize.sm[0],
      padding: `${getSpacing(2)} ${getSpacing(3)}`
    },
    lg: {
      fontSize: tokens.typography.fontSize.base[0],
      padding: `${getSpacing(3)} ${getSpacing(4)}`
    }
  }
  Object.assign(baseStyles, sizeMap[props.size])
  
  // 颜色样式
  if (isCurrent) {
    baseStyles.color = getColor('gray.900')
    baseStyles.fontWeight = tokens.typography.fontWeight.semibold
  } else if (item.disabled) {
    baseStyles.color = getColor('gray.400')
    baseStyles.cursor = 'not-allowed'
  } else if (isClickable) {
    baseStyles.color = getColor('gray.600')
    baseStyles.cursor = 'pointer'
  } else {
    baseStyles.color = getColor('gray.500')
  }
  
  // 变体样式
  if (props.variant === 'underline' && isClickable) {
    baseStyles.borderBottom = `1px solid transparent`
    if (isCurrent) {
      baseStyles.borderBottomColor = getColor('primary.600')
    }
  }
  
  return baseStyles
}

// 图标样式
const getBreadcrumbIconStyles = (item: BreadcrumbItem, index: number) => ({
  width: '16px',
  height: '16px',
  flexShrink: '0'
})

const breadcrumbTextStyles = computed(() => ({
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px'
}))

// 分隔符样式
const separatorStyles = computed(() => ({
  color: getColor('gray.400'),
  fontSize: tokens.typography.fontSize.sm[0],
  margin: `0 ${getSpacing(2)}`,
  userSelect: 'none'
}))

// 折叠相关样式
const collapsedStyles = computed(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center'
}))

const collapsedToggleStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.600'),
  fontSize: tokens.typography.fontSize.sm[0],
  cursor: 'pointer',
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  borderRadius: tokens.borderRadius.md,
  transition: 'all 0.2s ease'
}))

const collapsedDropdownStyles = computed(() => ({
  position: 'absolute',
  top: '100%',
  left: '0',
  marginTop: getSpacing(1),
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: getShadow('large'),
  border: `1px solid ${getColor('gray.200')}`,
  minWidth: '200px',
  zIndex: '100',
  overflow: 'hidden'
}))

const collapsedItemStyles = computed(() => ({
  borderBottom: `1px solid ${getColor('gray.100')}`
}))

const collapsedLinkStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  color: getColor('gray.700'),
  textDecoration: 'none',
  fontSize: tokens.typography.fontSize.sm[0],
  transition: 'background-color 0.2s ease'
}))

// 工具函数
const isCurrentPage = (index: number) => {
  return index === processedItems.value.length - 1
}

const isLastItem = (index: number) => {
  return index === visibleItems.value.length - 1
}

// 事件处理函数
const handleItemClick = (item: BreadcrumbItem, index: number, event: Event) => {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  
  emit('itemClick', item, index, event)
}

const handleItemHover = (item: BreadcrumbItem, index: number, event: MouseEvent) => {
  if (item.disabled) return
  emit('itemHover', item, index, event)
}

const handleItemFocus = (item: BreadcrumbItem, index: number, event: FocusEvent) => {
  if (item.disabled) return
  emit('itemFocus', item, index, event)
}

const toggleCollapsed = () => {
  isCollapsedExpanded.value = !isCollapsedExpanded.value
}

const handleCollapsedItemClick = (item: BreadcrumbItem, index: number, event: Event) => {
  isCollapsedExpanded.value = false
  handleItemClick(item, index, event)
}

// 点击外部关闭折叠菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (breadcrumbRef.value && !breadcrumbRef.value.contains(target)) {
    isCollapsedExpanded.value = false
  }
}

// 生命周期
onMounted(() => {
  if (breadcrumbRef.value && props.scrollAnimation) {
    observe(breadcrumbRef.value)
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.ds-breadcrumb {
  width: 100%;
}

.breadcrumb-link:hover {
  color: var(--color-primary-600);
}

.breadcrumb-link:focus {
  box-shadow: 0 0 0 2px var(--color-primary-500);
  border-radius: 4px;
}

.breadcrumb-link-disabled:hover {
  color: var(--color-gray-400);
}

.collapsed-toggle:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.collapsed-link:hover {
  background-color: var(--color-gray-50);
}

/* 变体样式 */
.ds-breadcrumb-pills .breadcrumb-link:hover {
  background-color: var(--color-gray-100);
}

.ds-breadcrumb-underline .breadcrumb-link:hover {
  border-bottom-color: var(--color-primary-400);
}

/* 动画 */
.ds-breadcrumb-animated {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.collapsed-dropdown {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .breadcrumb-text {
    max-width: 120px;
  }
  
  .ds-breadcrumb-sm .breadcrumb-text {
    max-width: 80px;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .ds-breadcrumb-animated,
  .collapsed-dropdown,
  .breadcrumb-link,
  .collapsed-toggle,
  .collapsed-link {
    animation: none !important;
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    border: 1px solid transparent;
  }
  
  .breadcrumb-link:focus {
    border-color: currentColor;
  }
  
  .collapsed-dropdown {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .collapsed-dropdown {
    display: none;
  }
  
  .collapsed-toggle {
    display: none;
  }
}
</style>
