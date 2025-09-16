<template>
  <DSAdminLayout
    :menu-items="menuItems"
    brand-title="DocuVault"
    brand-subtitle="管理后台"
    @menu-click="handleMenuClick"
  >
    <!-- 统计概览 -->
    <div v-if="activeTab === 'articles' || activeTab === 'users'" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          v-for="stat in currentStats"
          :key="stat.key"
          :title="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
          :trend="stat.trend"
          :subtitle="stat.subtitle"
        />
      </div>
    </div>

    <!-- 文章管理 -->
    <div v-if="activeTab === 'articles'" class="space-y-6">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-serif mb-2">文章管理</h1>
          <p class="text-gray-600">管理平台的所有文章内容</p>
        </div>

        <div class="flex items-center space-x-3 mt-4 md:mt-0">
          <DSButton variant="secondary" size="sm" @click="exportArticles">
            <i class="fas fa-download mr-2"></i>
            导出数据
          </DSButton>
          <DSButton variant="primary" size="sm" @click="createArticle">
            <i class="fas fa-plus mr-2"></i>
            新建文章
          </DSButton>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <DSCard class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="articleFilters.search"
                type="text"
                placeholder="搜索文章标题、作者或标签..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- 筛选器 -->
          <div class="flex items-center space-x-3">
            <select
              v-model="articleFilters.status"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="PUBLISHED">已发布</option>
              <option value="DRAFT">草稿</option>
              <option value="ARCHIVED">已下架</option>
            </select>

            <select
              v-model="articleFilters.category"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部分类</option>
              <option value="前端开发">前端开发</option>
              <option value="后端开发">后端开发</option>
              <option value="产品设计">产品设计</option>
            </select>

            <DSButton variant="secondary" size="sm" @click="applyArticleFilters">
              <i class="fas fa-filter mr-1"></i>
              筛选
            </DSButton>
          </div>
        </div>
      </DSCard>

      <!-- 文章列表表格 -->
      <DataTable
        :columns="articleColumns"
        :data="filteredArticles"
        :loading="adminStore.isLoading"
        :selectable="true"
        :actions="articleActions"
        :batch-actions="articleBatchActions"
        :pagination="articlePagination"
        @action="handleArticleAction"
        @batch-action="handleArticleBatchAction"
        @selection-change="handleArticleSelectionChange"
        @sort-change="handleArticleSortChange"
        @page-change="handleArticlePageChange"
      >
        <!-- 自定义列渲染 -->
        <template #column-title="{ row }">
          <div class="flex items-start space-x-3">
            <img
              v-if="row.coverImageUrl"
              :src="row.coverImageUrl"
              :alt="row.title"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 truncate">{{ row.title }}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ row.excerpt }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span v-if="row.isPaid" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  付费 ¥{{ row.price }}
                </span>
                <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  免费
                </span>
              </div>
            </div>
          </div>
        </template>

        <template #column-author="{ row }">
          <div class="flex items-center space-x-2">
            <img
              v-if="row.author?.avatarUrl"
              :src="row.author.avatarUrl"
              :alt="row.author.nickname"
              class="w-8 h-8 rounded-full"
            />
            <div v-else class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-medium">
                {{ row.author?.nickname?.charAt(0) }}
              </span>
            </div>
            <span class="text-sm text-gray-900">{{ row.author?.nickname }}</span>
          </div>
        </template>

        <template #column-status="{ row }">
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              row.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              row.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
              'bg-gray-100 text-gray-800'
            ]"
          >
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <template #column-stats="{ row }">
          <div class="text-sm text-gray-600">
            <div class="flex items-center space-x-4">
              <span><i class="fas fa-eye mr-1"></i>{{ row.viewCount }}</span>
              <span><i class="fas fa-heart mr-1"></i>{{ row.likeCount }}</span>
            </div>
          </div>
        </template>

        <template #column-publishedAt="{ row }">
          <span class="text-sm text-gray-600">
            {{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}
          </span>
        </template>
      </DataTable>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="space-y-6">
      <!-- 页面标题和操作 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-serif mb-2">用户管理</h1>
          <p class="text-gray-600">管理平台用户和权限分配</p>
        </div>

        <div class="flex items-center space-x-3 mt-4 md:mt-0">
          <DSButton variant="secondary" size="sm" @click="exportUsers">
            <i class="fas fa-download mr-2"></i>
            导出用户
          </DSButton>
          <DSButton variant="primary" size="sm" @click="inviteUser">
            <i class="fas fa-user-plus mr-2"></i>
            邀请用户
          </DSButton>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <DSCard class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="adminStore.userFilters.search"
                type="text"
                placeholder="搜索用户邮箱、姓名..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- 筛选器 -->
          <div class="flex items-center space-x-3">
            <select
              v-model="adminStore.userFilters.role"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部角色</option>
              <option value="USER">普通用户</option>
              <option value="CONTENT_MANAGER">内容运营</option>
              <option value="ADMIN">系统管理员</option>
            </select>

            <select
              v-model="adminStore.userFilters.status"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="ACTIVE">活跃</option>
              <option value="INACTIVE">非活跃</option>
              <option value="SUSPENDED">已暂停</option>
            </select>

            <DSButton variant="secondary" size="sm" @click="applyUserFilters">
              <i class="fas fa-filter mr-1"></i>
              筛选
            </DSButton>
          </div>
        </div>
      </DSCard>

      <!-- 用户列表表格 -->
      <DataTable
        :columns="userColumns"
        :data="adminStore.filteredUsers"
        :loading="adminStore.isLoading"
        :selectable="true"
        :actions="userActions"
        :batch-actions="userBatchActions"
        :pagination="userPagination"
        @action="handleUserAction"
        @batch-action="handleUserBatchAction"
        @selection-change="handleUserSelectionChange"
        @sort-change="handleUserSortChange"
        @page-change="handleUserPageChange"
      >
        <!-- 自定义列渲染 -->
        <template #column-user="{ row }">
          <div class="flex items-center space-x-3">
            <img
              v-if="row.avatarUrl"
              :src="row.avatarUrl"
              :alt="row.nickname"
              class="w-10 h-10 rounded-full"
            />
            <div v-else class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ row.nickname?.charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ row.nickname }}</p>
              <p class="text-sm text-gray-500 truncate">{{ row.email }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span v-if="row.emailVerified" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <i class="fas fa-check mr-1"></i>已验证
                </span>
                <span v-else class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  <i class="fas fa-exclamation mr-1"></i>未验证
                </span>
              </div>
            </div>
          </div>
        </template>

        <template #column-role="{ row }">
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              row.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
              row.role === 'CONTENT_MANAGER' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            ]"
          >
            {{ getRoleText(row.role) }}
          </span>
        </template>

        <template #column-status="{ row }">
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              row.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            ]"
          >
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <template #column-stats="{ row }">
          <div class="text-sm text-gray-600">
            <div class="space-y-1">
              <div>文章: {{ row.articlesCount || 0 }}</div>
              <div>笔记: {{ row.notesCount || 0 }}</div>
              <div>购买: {{ row.purchasesCount || 0 }}</div>
            </div>
          </div>
        </template>

        <template #column-lastLoginAt="{ row }">
          <span class="text-sm text-gray-600">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未登录' }}
          </span>
        </template>

        <template #column-createdAt="{ row }">
          <span class="text-sm text-gray-600">
            {{ formatDate(row.createdAt) }}
          </span>
        </template>
      </DataTable>
    </div>

    <!-- 其他管理模块占位 -->
    <div v-if="!['articles', 'users'].includes(activeTab)" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <i class="fas fa-tools text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
        <p class="text-gray-600">{{ currentMenuItem?.label }}功能正在开发中，敬请期待...</p>
      </div>
    </div>
  </DSAdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DSAdminLayout from '../components/templates/DSAdminLayout.vue'
import DataTable from '../components/molecules/DataTable.vue'
import StatsCard from '../components/molecules/StatsCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSCard from '../components/atoms/DSCard.vue'
import { useAdminStore } from '../stores/admin'
import { useArticlesStore } from '../stores/articles'
import { useAuthStore } from '../stores/auth'
import type { TableColumn, TableAction, BatchAction, PaginationConfig } from '../components/molecules/DataTable.vue'
import type { AdminUser } from '../stores/admin'

// 状态管理
const adminStore = useAdminStore()
const articlesStore = useArticlesStore()
const authStore = useAuthStore()
const router = useRouter()

// 响应式状态
const activeTab = ref('articles')
const articleFilters = ref({
  search: '',
  status: '',
  category: ''
})

// DSAdminLayout 菜单配置
const menuItems = ref([
  {
    key: 'articles',
    label: '文章管理',
    icon: 'fas fa-file-alt',
    active: true,
    href: '#'
  },
  {
    key: 'users',
    label: '用户管理',
    icon: 'fas fa-users',
    active: false,
    href: '#'
  },
  {
    key: 'comments',
    label: '评论管理',
    icon: 'fas fa-comments',
    active: false,
    href: '#'
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: 'fas fa-cog',
    active: false,
    href: '#'
  }
])

// 计算属性
const currentStats = computed(() => {
  if (activeTab.value === 'articles') {
    return [
      {
        key: 'total',
        title: '总文章数',
        value: adminStore.stats.articles.total,
        icon: 'fas fa-file-alt',
        color: 'blue' as const,
        subtitle: '平台所有文章'
      },
      {
        key: 'published',
        title: '已发布',
        value: adminStore.stats.articles.published,
        icon: 'fas fa-check-circle',
        color: 'green' as const,
        trend: { type: 'up' as const, value: 12, unit: '%' }
      },
      {
        key: 'draft',
        title: '草稿',
        value: adminStore.stats.articles.draft,
        icon: 'fas fa-edit',
        color: 'amber' as const
      },
      {
        key: 'monthly',
        title: '本月新增',
        value: adminStore.stats.articles.monthlyNew,
        icon: 'fas fa-plus-circle',
        color: 'purple' as const,
        trend: { type: 'up' as const, value: 8, unit: '%' }
      }
    ]
  } else if (activeTab.value === 'users') {
    return [
      {
        key: 'total',
        title: '总用户数',
        value: adminStore.stats.users.total,
        icon: 'fas fa-users',
        color: 'blue' as const,
        subtitle: '平台注册用户'
      },
      {
        key: 'active',
        title: '活跃用户',
        value: adminStore.stats.users.active,
        icon: 'fas fa-user-check',
        color: 'green' as const,
        trend: { type: 'up' as const, value: 5, unit: '%' }
      },
      {
        key: 'managers',
        title: '内容运营',
        value: adminStore.stats.users.contentManagers,
        icon: 'fas fa-user-cog',
        color: 'purple' as const
      },
      {
        key: 'monthly',
        title: '本月新增',
        value: adminStore.stats.users.monthlyNew,
        icon: 'fas fa-user-plus',
        color: 'amber' as const,
        trend: { type: 'up' as const, value: 15, unit: '%' }
      }
    ]
  }
  return []
})

const filteredArticles = computed(() => {
  let articles = [...articlesStore.articles]

  // 搜索过滤
  if (articleFilters.value.search) {
    const search = articleFilters.value.search.toLowerCase()
    articles = articles.filter(article =>
      article.title.toLowerCase().includes(search) ||
      article.author?.nickname.toLowerCase().includes(search)
    )
  }

  // 状态过滤
  if (articleFilters.value.status) {
    articles = articles.filter(article => article.status === articleFilters.value.status)
  }

  // 分类过滤
  if (articleFilters.value.category) {
    articles = articles.filter(article => article.category?.name === articleFilters.value.category)
  }

  return articles
})

// 表格列定义
const articleColumns: TableColumn[] = [
  { key: 'title', title: '文章信息', sortable: true },
  { key: 'author', title: '作者' },
  { key: 'category', title: '分类' },
  { key: 'status', title: '状态' },
  { key: 'stats', title: '数据' },
  { key: 'publishedAt', title: '发布时间', sortable: true }
]

const userColumns: TableColumn[] = [
  { key: 'user', title: '用户信息' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' },
  { key: 'stats', title: '统计' },
  { key: 'lastLoginAt', title: '最后登录', sortable: true },
  { key: 'createdAt', title: '注册时间', sortable: true }
]

// 操作按钮定义
const articleActions: TableAction[] = [
  { key: 'edit', label: '编辑', icon: 'fas fa-edit', variant: 'primary' },
  { key: 'publish', label: '发布', icon: 'fas fa-eye', variant: 'success' },
  { key: 'archive', label: '下架', icon: 'fas fa-archive' },
  { key: 'delete', label: '删除', icon: 'fas fa-trash', variant: 'danger' }
]

const userActions: TableAction[] = [
  { key: 'edit', label: '编辑', icon: 'fas fa-edit', variant: 'primary' },
  { key: 'role', label: '角色', icon: 'fas fa-user-cog' },
  { key: 'status', label: '状态', icon: 'fas fa-toggle-on' },
  { key: 'delete', label: '删除', icon: 'fas fa-trash', variant: 'danger', disabled: (row: AdminUser) => row.role === 'ADMIN' }
]

// 批量操作定义
const articleBatchActions: BatchAction[] = [
  { key: 'publish', label: '批量发布', icon: 'fas fa-eye' },
  { key: 'archive', label: '批量下架', icon: 'fas fa-archive' },
  { key: 'delete', label: '批量删除', icon: 'fas fa-trash', variant: 'danger' }
]

const userBatchActions: BatchAction[] = [
  { key: 'activate', label: '批量激活', icon: 'fas fa-check' },
  { key: 'deactivate', label: '批量禁用', icon: 'fas fa-ban' },
  { key: 'delete', label: '批量删除', icon: 'fas fa-trash', variant: 'danger' }
]

// 分页配置
const articlePagination = ref<PaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0
})

const userPagination = ref<PaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0
})

// 工具方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PUBLISHED': '已发布',
    'DRAFT': '草稿',
    'ARCHIVED': '已下架',
    'ACTIVE': '活跃',
    'INACTIVE': '非活跃',
    'SUSPENDED': '已暂停'
  }
  return statusMap[status] || status
}

const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'USER': '普通用户',
    'CONTENT_MANAGER': '内容运营',
    'ADMIN': '系统管理员'
  }
  return roleMap[role] || role
}

// 文章管理方法
const applyArticleFilters = () => {
  // 应用筛选逻辑
  articlePagination.value.current = 1
  articlePagination.value.total = filteredArticles.value.length
}

const exportArticles = () => {
  // 导出文章数据
  console.log('导出文章数据')
}

const createArticle = () => {
  // 创建新文章
  router.push('/admin/articles/create')
}

const handleArticleAction = (action: string, row: any, index: number) => {
  console.log('文章操作:', action, row, index)
  switch (action) {
    case 'edit':
      router.push(`/admin/articles/${row.id}/edit`)
      break
    case 'publish':
      // 发布文章
      break
    case 'archive':
      // 下架文章
      break
    case 'delete':
      // 删除文章
      break
  }
}

const handleArticleBatchAction = (action: string, rows: any[]) => {
  console.log('文章批量操作:', action, rows)
  // 处理批量操作
}

const handleArticleSelectionChange = (selectedRows: any[]) => {
  console.log('文章选择变化:', selectedRows)
}

const handleArticleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  console.log('文章排序变化:', sortBy, sortOrder)
}

const handleArticlePageChange = (page: number) => {
  articlePagination.value.current = page
}

// 用户管理方法
const applyUserFilters = () => {
  // 应用用户筛选逻辑
  userPagination.value.current = 1
  userPagination.value.total = adminStore.filteredUsers.length
}

const exportUsers = () => {
  // 导出用户数据
  console.log('导出用户数据')
}

const inviteUser = () => {
  // 邀请新用户
  console.log('邀请新用户')
}

const handleUserAction = async (action: string, row: AdminUser, index: number) => {
  console.log('用户操作:', action, row, index)
  try {
    switch (action) {
      case 'edit':
        // 编辑用户
        break
      case 'role':
        // 更改角色
        const newRole = row.role === 'USER' ? 'CONTENT_MANAGER' : 'USER'
        await adminStore.updateUserRole(row.id, newRole)
        break
      case 'status':
        // 更改状态
        const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        await adminStore.updateUserStatus(row.id, newStatus)
        break
      case 'delete':
        // 删除用户
        if (confirm('确定要删除这个用户吗？')) {
          await adminStore.batchUpdateUsers([row.id], 'delete')
        }
        break
    }
  } catch (error) {
    console.error('用户操作失败:', error)
  }
}

const handleUserBatchAction = async (action: string, rows: AdminUser[]) => {
  console.log('用户批量操作:', action, rows)
  try {
    const userIds = rows.map(row => row.id)
    await adminStore.batchUpdateUsers(userIds, action as any)
  } catch (error) {
    console.error('批量操作失败:', error)
  }
}

// DSAdminLayout 菜单点击处理
const handleMenuClick = (item: any) => {
  // 更新活动状态
  menuItems.value.forEach(menu => menu.active = false)
  item.active = true
  // 更新当前标签
  activeTab.value = item.key
}

const handleUserSelectionChange = (selectedRows: AdminUser[]) => {
  console.log('用户选择变化:', selectedRows)
}

const handleUserSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  adminStore.updateUserFilters({ sortBy, sortOrder })
}

const handleUserPageChange = (page: number) => {
  userPagination.value.current = page
}

// 生命周期
onMounted(async () => {
  // 检查权限
  if (!authStore.isAdmin && !authStore.isContentManager) {
    router.push('/')
    return
  }

  // 初始化管理数据
  adminStore.initAdminData()
  await articlesStore.fetchArticles()

  // 更新分页信息
  articlePagination.value.total = articlesStore.articles.length
  userPagination.value.total = adminStore.users.length

  // 初始化菜单状态
  const currentMenuItem = menuItems.value.find(item => item.key === activeTab.value)
  if (currentMenuItem) {
    menuItems.value.forEach(menu => menu.active = false)
    currentMenuItem.active = true
  }
})
</script>
