<!--
  设计系统数据表格组件 - DSDataTable
  企业级数据表格组件，支持排序、筛选、分页、选择等功能
-->

<template>
  <div class="data-table" :style="tableStyles">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" class="table-toolbar" :style="toolbarStyles">
      <div class="toolbar-left" :style="toolbarLeftStyles">
        <slot name="toolbar-left">
          <h3 v-if="title" class="table-title" :style="titleStyles">
            {{ title }}
          </h3>
          <p v-if="description" class="table-description" :style="descriptionStyles">
            {{ description }}
          </p>
        </slot>
      </div>
      
      <div class="toolbar-right" :style="toolbarRightStyles">
        <slot name="toolbar-right">
          <!-- 搜索框 -->
          <div v-if="searchable" class="table-search" :style="searchStyles">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="search-input"
              :style="searchInputStyles"
            />
          </div>
          
          <!-- 列显示控制 -->
          <button
            v-if="columnToggle"
            class="column-toggle-btn"
            :style="columnToggleStyles"
            @click="showColumnToggle = !showColumnToggle"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-container" :style="containerStyles">
      <table class="table" :style="tableElementStyles">
        <!-- 表头 -->
        <thead class="table-head" :style="headStyles">
          <tr class="head-row" :style="headRowStyles">
            <!-- 选择列 -->
            <th v-if="selectable" class="select-cell" :style="selectCellStyles">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
                class="select-checkbox"
                :style="checkboxStyles"
              />
            </th>
            
            <!-- 数据列 -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="table-cell head-cell"
              :style="getHeadCellStyles(column)"
              @click="handleSort(column)"
            >
              <div class="cell-content" :style="cellContentStyles">
                <span class="cell-label">{{ column.title }}</span>
                
                <!-- 排序图标 -->
                <span
                  v-if="column.sortable"
                  class="sort-icon"
                  :style="getSortIconStyles(column)"
                >
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="table-body" :style="bodyStyles">
          <tr
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            class="body-row"
            :style="getBodyRowStyles(row, index)"
            @click="handleRowClick(row, index)"
          >
            <!-- 选择列 -->
            <td v-if="selectable" class="select-cell" :style="selectCellStyles">
              <input
                type="checkbox"
                :checked="isRowSelected(row)"
                @change="handleRowSelect(row, $event)"
                class="select-checkbox"
                :style="checkboxStyles"
              />
            </td>
            
            <!-- 数据列 -->
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              class="table-cell body-cell"
              :style="getBodyCellStyles(column)"
            >
              <div class="cell-content" :style="cellContentStyles">
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :column="column"
                  :value="getCellValue(row, column.key)"
                  :index="index"
                >
                  {{ formatCellValue(getCellValue(row, column.key), column) }}
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div
        v-if="filteredData.length === 0"
        class="empty-state"
        :style="emptyStateStyles"
      >
        <slot name="empty">
          <div class="empty-content" :style="emptyContentStyles">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20" :style="emptyIconStyles">
              <path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clip-rule="evenodd" />
            </svg>
            <p class="empty-text" :style="emptyTextStyles">{{ emptyText }}</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- 分页器 -->
    <div
      v-if="pagination && filteredData.length > 0"
      class="table-pagination"
      :style="paginationStyles"
    >
      <slot name="pagination" :pagination="paginationInfo">
        <DSPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :total="filteredData.length"
          :show-info="true"
          :show-size-changer="true"
          :page-size-options="pageSizeOptions"
          @change="handlePaginationChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDesignTokens } from '../../design-system/composables'
import DSPagination from '../molecules/DSPagination.vue'

// 列配置接口
interface TableColumn {
  key: string
  title: string
  width?: string
  minWidth?: string
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  formatter?: (value: any, row: any) => string
  visible?: boolean
}

// 排序配置
interface SortConfig {
  key: string
  order: 'asc' | 'desc'
}

// 组件属性
interface Props {
  // 数据
  data?: any[]
  columns?: TableColumn[]
  
  // 基础配置
  title?: string
  description?: string
  emptyText?: string
  
  // 功能配置
  selectable?: boolean
  searchable?: boolean
  pagination?: boolean
  columnToggle?: boolean
  
  // 样式配置
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  
  // 分页配置
  pageSize?: number
  pageSizeOptions?: number[]
  
  // 搜索配置
  searchPlaceholder?: string
  
  // 工具栏
  showToolbar?: boolean
  
  // 行配置
  rowKey?: string | ((row: any) => string)
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  emptyText: '暂无数据',
  selectable: false,
  searchable: true,
  pagination: true,
  columnToggle: true,
  size: 'md',
  bordered: true,
  striped: false,
  hoverable: true,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 50, 100],
  searchPlaceholder: '搜索...',
  showToolbar: true,
  rowKey: 'id'
})

// 组件事件
interface Emits {
  (e: 'select', selectedRows: any[]): void
  (e: 'row-click', row: any, index: number): void
  (e: 'sort-change', sort: SortConfig): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const searchQuery = ref('')
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const selectedRows = ref<any[]>([])
const sortConfig = ref<SortConfig | null>(null)
const showColumnToggle = ref(false)

// 计算属性
const visibleColumns = computed(() => 
  props.columns.filter(column => column.visible !== false)
)

const filteredData = computed(() => {
  let result = [...props.data]
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      visibleColumns.value.some(column => {
        const value = getCellValue(row, column.key)
        return String(value).toLowerCase().includes(query)
      })
    )
  }
  
  // 排序
  if (sortConfig.value) {
    const { key, order } = sortConfig.value
    result.sort((a, b) => {
      const aVal = getCellValue(a, key)
      const bVal = getCellValue(b, key)
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return result
})

const totalPages = computed(() => 
  Math.ceil(filteredData.value.length / currentPageSize.value)
)

const paginatedData = computed(() => {
  if (!props.pagination) return filteredData.value
  
  const start = (currentPage.value - 1) * currentPageSize.value
  const end = start + currentPageSize.value
  return filteredData.value.slice(start, end)
})

const isAllSelected = computed(() => 
  paginatedData.value.length > 0 && 
  paginatedData.value.every(row => isRowSelected(row))
)

const isIndeterminate = computed(() => 
  selectedRows.value.length > 0 && !isAllSelected.value
)

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value,
  pageSize: currentPageSize.value,
  total: filteredData.value.length
}))

// 样式计算
const tableStyles = computed(() => ({
  width: '100%',
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  boxShadow: getShadow('medium'),
  overflow: 'hidden'
}))

const toolbarStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: getSpacing(4),
  borderBottom: `1px solid ${getColor('gray.200')}`
}))

const toolbarLeftStyles = computed(() => ({
  flex: '1',
  minWidth: '0'
}))

const toolbarRightStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3)
}))

const titleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  margin: '0'
}))

const descriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: `${getSpacing(1)} 0 0 0`
}))

const searchStyles = computed(() => ({
  position: 'relative'
}))

const searchInputStyles = computed(() => ({
  padding: `${getSpacing(2)} ${getSpacing(3)}`,
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  width: '200px',
  outline: 'none',
  transition: 'border-color 0.2s ease'
}))

const columnToggleStyles = computed(() => ({
  padding: getSpacing(2),
  backgroundColor: 'transparent',
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  color: getColor('gray.600'),
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

const containerStyles = computed(() => ({
  overflow: 'auto',
  maxHeight: '600px'
}))

const tableElementStyles = computed(() => ({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: tokens.typography.fontSize.sm[0]
}))

const headStyles = computed(() => ({
  backgroundColor: getColor('gray.50'),
  borderBottom: `2px solid ${getColor('gray.200')}`
}))

const headRowStyles = computed(() => ({}))

const bodyStyles = computed(() => ({}))

const selectCellStyles = computed(() => ({
  width: '48px',
  padding: getSpacing(3),
  textAlign: 'center',
  borderRight: props.bordered ? `1px solid ${getColor('gray.200')}` : 'none'
}))

const checkboxStyles = computed(() => ({
  width: '16px',
  height: '16px',
  cursor: 'pointer'
}))

const getHeadCellStyles = (column: TableColumn) => ({
  padding: getSpacing(3),
  textAlign: column.align || 'left',
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  backgroundColor: getColor('gray.50'),
  borderRight: props.bordered ? `1px solid ${getColor('gray.200')}` : 'none',
  cursor: column.sortable ? 'pointer' : 'default',
  userSelect: 'none',
  width: column.width,
  minWidth: column.minWidth
})

const getBodyRowStyles = (row: any, index: number) => ({
  backgroundColor: props.striped && index % 2 === 1 ? getColor('gray.25') : 'white',
  borderBottom: `1px solid ${getColor('gray.200')}`,
  transition: 'background-color 0.2s ease',
  cursor: 'pointer'
})

const getBodyCellStyles = (column: TableColumn) => ({
  padding: getSpacing(3),
  textAlign: column.align || 'left',
  color: getColor('gray.700'),
  borderRight: props.bordered ? `1px solid ${getColor('gray.200')}` : 'none',
  width: column.width,
  minWidth: column.minWidth
})

const cellContentStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2)
}))

const getSortIconStyles = (column: TableColumn) => {
  const isActive = sortConfig.value?.key === column.key
  const isDesc = isActive && sortConfig.value?.order === 'desc'
  
  return {
    transform: isDesc ? 'rotate(180deg)' : 'rotate(0deg)',
    opacity: isActive ? '1' : '0.5',
    transition: 'all 0.2s ease'
  }
}

const emptyStateStyles = computed(() => ({
  padding: getSpacing(8),
  textAlign: 'center'
}))

const emptyContentStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: getSpacing(4)
}))

const emptyIconStyles = computed(() => ({
  color: getColor('gray.400')
}))

const emptyTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.500'),
  margin: '0'
}))

const paginationStyles = computed(() => ({
  padding: getSpacing(4),
  borderTop: `1px solid ${getColor('gray.200')}`,
  backgroundColor: getColor('gray.50')
}))

// 工具函数
const getCellValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const formatCellValue = (value: any, column: TableColumn) => {
  if (column.formatter) {
    return column.formatter(value, {})
  }
  return value ?? ''
}

const getRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return getCellValue(row, props.rowKey) ?? index
}

const isRowSelected = (row: any) => {
  const key = getRowKey(row, 0)
  return selectedRows.value.some(selectedRow => 
    getRowKey(selectedRow, 0) === key
  )
}

// 事件处理
const handleSort = (column: TableColumn) => {
  if (!column.sortable) return
  
  if (sortConfig.value?.key === column.key) {
    // 切换排序方向
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    // 新的排序列
    sortConfig.value = { key: column.key, order: 'asc' }
  }
  
  emit('sort-change', sortConfig.value)
}

const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedRows.value = [...paginatedData.value]
  } else {
    selectedRows.value = []
  }
  emit('select', selectedRows.value)
}

const handleRowSelect = (row: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const key = getRowKey(row, 0)
  
  if (target.checked) {
    if (!isRowSelected(row)) {
      selectedRows.value.push(row)
    }
  } else {
    selectedRows.value = selectedRows.value.filter(selectedRow => 
      getRowKey(selectedRow, 0) !== key
    )
  }
  
  emit('select', selectedRows.value)
}

const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index)
}

const handlePaginationChange = (page: number, pageSize: number) => {
  currentPage.value = page
  currentPageSize.value = pageSize
}

// 监听搜索变化，重置页码
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* 表格样式 */
.table-cell {
  vertical-align: middle;
}

.body-row:hover {
  background-color: var(--color-gray-50) !important;
}

.search-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.column-toggle-btn:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .toolbar-right {
    justify-content: space-between;
  }
  
  .search-input {
    width: 100%;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .body-row,
  .search-input,
  .column-toggle-btn,
  .sort-icon {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .table {
    border: 2px solid currentColor;
  }
  
  .table-cell {
    border: 1px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .table-toolbar,
  .table-pagination {
    display: none;
  }
  
  .table-container {
    max-height: none;
    overflow: visible;
  }
}
</style>
