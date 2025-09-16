<template>
  <div class="data-table bg-white rounded-lg shadow-sm overflow-hidden">
    <!-- 表格头部操作 -->
    <div v-if="batchActions && batchActions.length > 0" class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <input 
            type="checkbox" 
            :checked="isAllSelected"
            :indeterminate="isPartiallySelected"
            @change="toggleSelectAll"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          >
          <span class="text-sm text-gray-600">
            已选择 <span class="font-medium">{{ selectedRows.length }}</span> 项
          </span>
        </div>

        <div v-if="selectedRows.length > 0" class="flex items-center space-x-2">
          <button
            v-for="action in batchActions"
            :key="action.key"
            @click="handleBatchAction(action.key)"
            :disabled="loading"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200',
              action.variant === 'danger' 
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                : 'btn-secondary'
            ]"
          >
            <i v-if="action.icon" :class="[action.icon, 'mr-1']"></i>
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th v-if="selectable" class="px-6 py-3 text-left">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                :indeterminate="isPartiallySelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              >
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.title }}</span>
                <button
                  v-if="column.sortable"
                  @click="handleSort(column.key)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <i 
                    :class="[
                      'fas text-xs',
                      sortBy === column.key && sortOrder === 'asc' ? 'fa-sort-up' :
                      sortBy === column.key && sortOrder === 'desc' ? 'fa-sort-down' :
                      'fa-sort'
                    ]"
                  ></i>
                </button>
              </div>
            </th>
            <th v-if="actions && actions.length > 0" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="animate-pulse">
            <td :colspan="totalColumns" class="px-6 py-4 text-center text-gray-500">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              加载中...
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
              <i class="fas fa-inbox text-2xl mb-2 block"></i>
              暂无数据
            </td>
          </tr>
          <tr 
            v-else
            v-for="(row, index) in data" 
            :key="getRowKey(row, index)"
            class="hover:bg-gray-50 transition-colors duration-200"
          >
            <td v-if="selectable" class="px-6 py-4">
              <input 
                type="checkbox" 
                :checked="isRowSelected(row)"
                @change="toggleRowSelection(row)"
                class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              >
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
            >
              <slot 
                v-if="$slots[`column-${column.key}`]"
                :name="`column-${column.key}`"
                :row="row"
                :value="getColumnValue(row, column.key)"
                :index="index"
              />
              <component
                v-else-if="column.render"
                :is="column.render"
                :row="row"
                :value="getColumnValue(row, column.key)"
                :index="index"
              />
              <span v-else class="text-sm text-gray-900">
                {{ getColumnValue(row, column.key) }}
              </span>
            </td>
            <td v-if="actions && actions.length > 0" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  @click="handleAction(action.key, row, index)"
                  :disabled="loading || (action.disabled && action.disabled(row))"
                  :class="[
                    'inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
                    action.variant === 'danger' 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                      : action.variant === 'success'
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                  ]"
                >
                  <i v-if="action.icon" :class="[action.icon, 'mr-1']"></i>
                  {{ action.label }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="px-6 py-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">
          显示第 {{ (pagination.current - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.current * pagination.pageSize, pagination.total) }} 项，共 {{ pagination.total }} 项
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="handlePageChange(pagination.current - 1)"
            :disabled="pagination.current <= 1"
            class="btn-secondary px-3 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="handlePageChange(page as number)"
              :class="[
                'px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200',
                page === pagination.current 
                  ? 'bg-purple-600 text-white' 
                  : 'btn-secondary'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="text-gray-500 px-2">...</span>
          </template>
          
          <button 
            @click="handlePageChange(pagination.current + 1)"
            :disabled="pagination.current >= Math.ceil(pagination.total / pagination.pageSize)"
            class="btn-secondary px-3 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 类型定义
export interface TableColumn {
  key: string
  title: string
  sortable?: boolean
  render?: any
  width?: string
}

export interface TableAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'success' | 'danger'
  disabled?: (row: any) => boolean
}

export interface BatchAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'danger'
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
}

// Props
interface Props {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  selectable?: boolean
  rowKey?: string | ((row: any) => string)
  actions?: TableAction[]
  batchActions?: BatchAction[]
  pagination?: PaginationConfig
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  rowKey: 'id',
  sortBy: '',
  sortOrder: 'desc'
})

// Emits
const emit = defineEmits<{
  'action': [key: string, row: any, index: number]
  'batch-action': [key: string, rows: any[]]
  'selection-change': [selectedRows: any[]]
  'sort-change': [sortBy: string, sortOrder: 'asc' | 'desc']
  'page-change': [page: number]
}>()

// 状态
const selectedRows = ref<any[]>([])
const sortBy = ref(props.sortBy)
const sortOrder = ref<'asc' | 'desc'>(props.sortOrder)

// 计算属性
const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (props.actions && props.actions.length > 0) count++
  return count
})

const isAllSelected = computed(() => 
  props.data.length > 0 && selectedRows.value.length === props.data.length
)

const isPartiallySelected = computed(() => 
  selectedRows.value.length > 0 && selectedRows.value.length < props.data.length
)

const visiblePages = computed(() => {
  if (!props.pagination) return []
  
  const { current, total, pageSize } = props.pagination
  const totalPages = Math.ceil(total / pageSize)
  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    
    const start = Math.max(2, current - 2)
    const end = Math.min(totalPages - 1, current + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < totalPages - 3) pages.push('...')
    pages.push(totalPages)
  }
  
  return pages
})

// 方法
const getRowKey = (row: any, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || index.toString()
}

const getColumnValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const isRowSelected = (row: any): boolean => {
  const key = getRowKey(row, 0)
  return selectedRows.value.some(selectedRow => getRowKey(selectedRow, 0) === key)
}

const toggleRowSelection = (row: any) => {
  const key = getRowKey(row, 0)
  const index = selectedRows.value.findIndex(selectedRow => getRowKey(selectedRow, 0) === key)
  
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(row)
  }
  
  emit('selection-change', selectedRows.value)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = [...props.data]
  }
  emit('selection-change', selectedRows.value)
}

const handleAction = (key: string, row: any, index: number) => {
  emit('action', key, row, index)
}

const handleBatchAction = (key: string) => {
  emit('batch-action', key, selectedRows.value)
}

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  emit('sort-change', sortBy.value, sortOrder.value)
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

// 监听选择变化
watch(() => props.data, () => {
  selectedRows.value = []
}, { deep: true })
</script>
