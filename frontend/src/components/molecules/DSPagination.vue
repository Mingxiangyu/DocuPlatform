<!--
  设计系统分页组件 - DSPagination
  企业级分页组件，支持多种样式、尺寸和配置选项
-->

<template>
  <nav
    class="ds-pagination"
    :style="paginationStyles"
    :aria-label="ariaLabel"
    role="navigation"
  >
    <!-- 分页信息 -->
    <div
      v-if="showInfo"
      class="pagination-info"
      :style="paginationInfoStyles"
    >
      <span class="info-text" :style="infoTextStyles">
        {{ infoText }}
      </span>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-controls" :style="paginationControlsStyles">
      <!-- 首页按钮 -->
      <button
        v-if="showFirstLast"
        :disabled="currentPage <= 1"
        class="pagination-button first"
        :style="getButtonStyles('first', currentPage <= 1)"
        @click="handlePageChange(1)"
        :aria-label="firstLabel"
      >
        <svg
          v-if="!hideIcons"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414zM9 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L4.707 9H10a1 1 0 110 2H4.707l4.293 4.293A1 1 0 019 15.707z" clip-rule="evenodd" />
        </svg>
        <span v-if="!hideLabels">{{ firstLabel }}</span>
      </button>

      <!-- 上一页按钮 -->
      <button
        :disabled="currentPage <= 1"
        class="pagination-button prev"
        :style="getButtonStyles('prev', currentPage <= 1)"
        @click="handlePageChange(currentPage - 1)"
        :aria-label="prevLabel"
      >
        <svg
          v-if="!hideIcons"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span v-if="!hideLabels">{{ prevLabel }}</span>
      </button>

      <!-- 页码按钮 -->
      <div class="page-numbers" :style="pageNumbersStyles">
        <!-- 第一页 -->
        <button
          v-if="showFirstPage"
          class="pagination-button page-number"
          :style="getPageButtonStyles(1)"
          @click="handlePageChange(1)"
          :aria-label="`第 1 页`"
          :aria-current="currentPage === 1 ? 'page' : undefined"
        >
          1
        </button>

        <!-- 左侧省略号 -->
        <span
          v-if="showLeftEllipsis"
          class="pagination-ellipsis"
          :style="ellipsisStyles"
          aria-hidden="true"
        >
          ...
        </span>

        <!-- 中间页码 -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-button page-number"
          :style="getPageButtonStyles(page)"
          @click="handlePageChange(page)"
          :aria-label="`第 ${page} 页`"
          :aria-current="currentPage === page ? 'page' : undefined"
        >
          {{ page }}
        </button>

        <!-- 右侧省略号 -->
        <span
          v-if="showRightEllipsis"
          class="pagination-ellipsis"
          :style="ellipsisStyles"
          aria-hidden="true"
        >
          ...
        </span>

        <!-- 最后一页 -->
        <button
          v-if="showLastPage"
          class="pagination-button page-number"
          :style="getPageButtonStyles(totalPages)"
          @click="handlePageChange(totalPages)"
          :aria-label="`第 ${totalPages} 页`"
          :aria-current="currentPage === totalPages ? 'page' : undefined"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- 下一页按钮 -->
      <button
        :disabled="currentPage >= totalPages"
        class="pagination-button next"
        :style="getButtonStyles('next', currentPage >= totalPages)"
        @click="handlePageChange(currentPage + 1)"
        :aria-label="nextLabel"
      >
        <span v-if="!hideLabels">{{ nextLabel }}</span>
        <svg
          v-if="!hideIcons"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- 末页按钮 -->
      <button
        v-if="showFirstLast"
        :disabled="currentPage >= totalPages"
        class="pagination-button last"
        :style="getButtonStyles('last', currentPage >= totalPages)"
        @click="handlePageChange(totalPages)"
        :aria-label="lastLabel"
      >
        <span v-if="!hideLabels">{{ lastLabel }}</span>
        <svg
          v-if="!hideIcons"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zM4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 页面跳转 -->
    <div
      v-if="showJumper"
      class="pagination-jumper"
      :style="paginationJumperStyles"
    >
      <span class="jumper-label" :style="jumperLabelStyles">
        {{ jumperLabel }}
      </span>
      <input
        v-model="jumpPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="jumper-input"
        :style="jumperInputStyles"
        @keyup.enter="handleJump"
        @blur="handleJump"
        :aria-label="jumperAriaLabel"
      />
    </div>

    <!-- 每页条数选择 -->
    <div
      v-if="showSizeChanger"
      class="pagination-size-changer"
      :style="paginationSizeChangerStyles"
    >
      <span class="size-label" :style="sizeLabelStyles">
        {{ sizeLabel }}
      </span>
      <select
        :value="pageSize"
        class="size-select"
        :style="sizeSelectStyles"
        @change="handleSizeChange"
        :aria-label="sizeAriaLabel"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }} {{ sizeUnit }}
        </option>
      </select>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 组件属性
interface Props {
  // 基础分页属性
  currentPage?: number
  totalPages?: number
  pageSize?: number
  total?: number
  
  // 显示控制
  showInfo?: boolean
  showFirstLast?: boolean
  showJumper?: boolean
  showSizeChanger?: boolean
  hideLabels?: boolean
  hideIcons?: boolean
  
  // 页码显示控制
  maxVisiblePages?: number
  
  // 样式配置
  variant?: 'default' | 'minimal' | 'rounded' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  alignment?: 'left' | 'center' | 'right'
  
  // 每页条数选项
  pageSizeOptions?: number[]
  
  // 文本配置
  prevLabel?: string
  nextLabel?: string
  firstLabel?: string
  lastLabel?: string
  jumperLabel?: string
  sizeLabel?: string
  sizeUnit?: string
  infoTemplate?: string
  
  // 无障碍访问
  ariaLabel?: string
  jumperAriaLabel?: string
  sizeAriaLabel?: string
  
  // 功能配置
  disabled?: boolean
  simple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  total: 0,
  showInfo: true,
  showFirstLast: false,
  showJumper: false,
  showSizeChanger: false,
  hideLabels: false,
  hideIcons: false,
  maxVisiblePages: 7,
  variant: 'default',
  size: 'md',
  alignment: 'center',
  pageSizeOptions: () => [10, 20, 50, 100],
  prevLabel: '上一页',
  nextLabel: '下一页',
  firstLabel: '首页',
  lastLabel: '末页',
  jumperLabel: '跳至',
  sizeLabel: '每页',
  sizeUnit: '条',
  infoTemplate: '共 {total} 条，第 {current} / {pages} 页',
  ariaLabel: '分页导航',
  jumperAriaLabel: '跳转到指定页面',
  sizeAriaLabel: '选择每页显示条数',
  disabled: false,
  simple: false
})

// 组件事件
interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'change', page: number, pageSize: number): void
  (e: 'pageChange', page: number): void
  (e: 'sizeChange', size: number): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 内部状态
const jumpPage = ref<string>('')

// 计算属性
const infoText = computed(() => {
  return props.infoTemplate
    .replace('{total}', props.total.toString())
    .replace('{current}', props.currentPage.toString())
    .replace('{pages}', props.totalPages.toString())
})

// 可见页码计算
const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  const pages: number[] = []
  
  if (totalPages <= maxVisiblePages) {
    // 总页数少于最大显示页数，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 计算显示范围
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    // 调整起始位置
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    // 排除首页和末页（它们单独显示）
    const excludeFirst = start > 1
    const excludeLast = end < totalPages
    
    if (excludeFirst) start = Math.max(2, start)
    if (excludeLast) end = Math.min(totalPages - 1, end)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

const showFirstPage = computed(() => {
  return props.totalPages > props.maxVisiblePages && !visiblePages.value.includes(1)
})

const showLastPage = computed(() => {
  return props.totalPages > props.maxVisiblePages && !visiblePages.value.includes(props.totalPages)
})

const showLeftEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2
})

const showRightEllipsis = computed(() => {
  return showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1
})

// 样式计算
const paginationStyles = computed(() => {
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(4),
    fontFamily: tokens.typography.fontFamily.sans.join(', ')
  }
  
  // 对齐方式
  if (props.alignment === 'left') {
    baseStyles.justifyContent = 'flex-start'
  } else if (props.alignment === 'right') {
    baseStyles.justifyContent = 'flex-end'
  } else {
    baseStyles.justifyContent = 'center'
  }
  
  // 简单模式
  if (props.simple) {
    baseStyles.gap = getSpacing(2)
  }
  
  return baseStyles
})

const paginationInfoStyles = computed(() => ({
  fontSize: getSizeStyles().fontSize,
  color: getColor('gray.600'),
  fontWeight: tokens.typography.fontWeight.medium
}))

const infoTextStyles = computed(() => ({}))

const paginationControlsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1)
}))

const pageNumbersStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1)
}))

const ellipsisStyles = computed(() => ({
  padding: getSizeStyles().padding,
  fontSize: getSizeStyles().fontSize,
  color: getColor('gray.400'),
  userSelect: 'none'
}))

const paginationJumperStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2)
}))

const jumperLabelStyles = computed(() => ({
  fontSize: getSizeStyles().fontSize,
  color: getColor('gray.600'),
  fontWeight: tokens.typography.fontWeight.medium
}))

const jumperInputStyles = computed(() => ({
  width: '60px',
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: getSizeStyles().fontSize,
  textAlign: 'center',
  outline: 'none',
  transition: 'all 0.2s ease'
}))

const paginationSizeChangerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2)
}))

const sizeLabelStyles = computed(() => ({
  fontSize: getSizeStyles().fontSize,
  color: getColor('gray.600'),
  fontWeight: tokens.typography.fontWeight.medium
}))

const sizeSelectStyles = computed(() => ({
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: getSizeStyles().fontSize,
  backgroundColor: 'white',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease'
}))

// 尺寸样式
const getSizeStyles = () => {
  const sizeMap = {
    sm: {
      padding: `${getSpacing(1)} ${getSpacing(2)}`,
      fontSize: tokens.typography.fontSize.xs[0],
      minWidth: '28px',
      height: '28px'
    },
    md: {
      padding: `${getSpacing(2)} ${getSpacing(3)}`,
      fontSize: tokens.typography.fontSize.sm[0],
      minWidth: '32px',
      height: '32px'
    },
    lg: {
      padding: `${getSpacing(3)} ${getSpacing(4)}`,
      fontSize: tokens.typography.fontSize.base[0],
      minWidth: '40px',
      height: '40px'
    }
  }
  
  return sizeMap[props.size]
}

// 按钮样式
const getButtonStyles = (type: string, disabled: boolean) => {
  const sizeStyles = getSizeStyles()
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(1),
    padding: sizeStyles.padding,
    minWidth: sizeStyles.minWidth,
    height: sizeStyles.height,
    fontSize: sizeStyles.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    border: 'none',
    borderRadius: getVariantStyles().borderRadius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    outline: 'none'
  }
  
  // 禁用状态
  if (disabled || props.disabled) {
    return {
      ...baseStyles,
      backgroundColor: getColor('gray.100'),
      color: getColor('gray.400'),
      cursor: 'not-allowed'
    }
  }
  
  // 变体样式
  const variantStyles = getVariantStyles()
  
  return {
    ...baseStyles,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    border: variantStyles.border,
    boxShadow: variantStyles.boxShadow
  }
}

const getPageButtonStyles = (page: number) => {
  const isActive = page === props.currentPage
  const sizeStyles = getSizeStyles()
  const variantStyles = getVariantStyles()
  
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeStyles.padding,
    minWidth: sizeStyles.minWidth,
    height: sizeStyles.height,
    fontSize: sizeStyles.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
    border: 'none',
    borderRadius: variantStyles.borderRadius,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    outline: 'none'
  }
  
  if (props.disabled) {
    return {
      ...baseStyles,
      backgroundColor: getColor('gray.100'),
      color: getColor('gray.400'),
      cursor: 'not-allowed'
    }
  }
  
  if (isActive) {
    return {
      ...baseStyles,
      backgroundColor: variantStyles.activeBackgroundColor,
      color: variantStyles.activeColor,
      border: variantStyles.activeBorder,
      boxShadow: variantStyles.activeBoxShadow
    }
  }
  
  return {
    ...baseStyles,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    border: variantStyles.border,
    boxShadow: variantStyles.boxShadow
  }
}

// 变体样式
const getVariantStyles = () => {
  const variantMap = {
    default: {
      backgroundColor: 'white',
      color: getColor('gray.700'),
      border: `1px solid ${getColor('gray.300')}`,
      borderRadius: tokens.borderRadius.md,
      boxShadow: getShadow('soft'),
      activeBackgroundColor: getColor('primary.600'),
      activeColor: 'white',
      activeBorder: `1px solid ${getColor('primary.600')}`,
      activeBoxShadow: getShadow('soft')
    },
    minimal: {
      backgroundColor: 'transparent',
      color: getColor('gray.700'),
      border: 'none',
      borderRadius: tokens.borderRadius.md,
      boxShadow: 'none',
      activeBackgroundColor: getColor('primary.100'),
      activeColor: getColor('primary.700'),
      activeBorder: 'none',
      activeBoxShadow: 'none'
    },
    rounded: {
      backgroundColor: 'white',
      color: getColor('gray.700'),
      border: `1px solid ${getColor('gray.300')}`,
      borderRadius: tokens.borderRadius.full,
      boxShadow: getShadow('soft'),
      activeBackgroundColor: getColor('primary.600'),
      activeColor: 'white',
      activeBorder: `1px solid ${getColor('primary.600')}`,
      activeBoxShadow: getShadow('soft')
    },
    outlined: {
      backgroundColor: 'transparent',
      color: getColor('gray.700'),
      border: `1px solid ${getColor('gray.300')}`,
      borderRadius: tokens.borderRadius.md,
      boxShadow: 'none',
      activeBackgroundColor: 'transparent',
      activeColor: getColor('primary.600'),
      activeBorder: `1px solid ${getColor('primary.600')}`,
      activeBoxShadow: 'none'
    }
  }
  
  return variantMap[props.variant]
}

// 事件处理
const handlePageChange = (page: number) => {
  if (props.disabled || page < 1 || page > props.totalPages || page === props.currentPage) {
    return
  }
  
  emit('update:currentPage', page)
  emit('pageChange', page)
  emit('change', page, props.pageSize)
}

const handleJump = () => {
  const page = parseInt(jumpPage.value)
  if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
    handlePageChange(page)
  }
  jumpPage.value = ''
}

const handleSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const size = parseInt(target.value)
  
  emit('update:pageSize', size)
  emit('sizeChange', size)
  emit('change', props.currentPage, size)
}

// 监听页面变化，清空跳转输入
watch(() => props.currentPage, () => {
  jumpPage.value = ''
})
</script>

<style scoped>
.pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.pagination-button.page-number[aria-current="page"]:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  color: white;
}

.jumper-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.size-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* 变体特定样式 */
.ds-pagination[data-variant="minimal"] .pagination-button:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.ds-pagination[data-variant="outlined"] .pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .pagination-info {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .pagination-jumper,
  .pagination-size-changer {
    order: 1;
    margin-top: 0.5rem;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .pagination-button,
  .jumper-input,
  .size-select {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .pagination-button,
  .jumper-input,
  .size-select {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .ds-pagination {
    display: none;
  }
}
</style>
