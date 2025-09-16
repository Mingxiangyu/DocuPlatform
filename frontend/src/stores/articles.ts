import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, CreateArticleRequest, UpdateArticleRequest, PaginationParams } from '../types/api'
import { apiClient } from '../services/ApiClient'
import { eventBus } from '../utils/EventBus'

// 模拟文章数据
const mockArticles: Article[] = [
  {
    id: '1',
    title: '深入理解Vue 3 Composition API',
    content: '这是一篇关于Vue 3 Composition API的详细介绍...',
    excerpt: 'Vue 3 Composition API为开发者提供了更灵活的组件逻辑组织方式',
    coverImageUrl: '',
    authorId: '1',
    author: { id: '1', nickname: '技术专家', avatarUrl: '' },
    categoryId: '1',
    category: { id: '1', name: '前端开发', slug: 'frontend' },
    isPaid: false,
    price: 0,
    status: 'PUBLISHED',
    viewCount: 1250,
    likeCount: 89,
    publishedAt: '2024-12-01T10:00:00Z',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'TypeScript高级类型系统详解',
    content: '本文将深入探讨TypeScript的高级类型系统...',
    excerpt: '掌握TypeScript高级类型，让你的代码更加类型安全',
    coverImageUrl: '',
    authorId: '2',
    author: { id: '2', nickname: 'TS大师', avatarUrl: '' },
    categoryId: '1',
    category: { id: '1', name: '前端开发', slug: 'frontend' },
    isPaid: true,
    price: 29.9,
    status: 'PUBLISHED',
    viewCount: 890,
    likeCount: 67,
    publishedAt: '2024-12-02T14:30:00Z',
    createdAt: '2024-12-02T14:30:00Z',
    updatedAt: '2024-12-02T14:30:00Z'
  },
  {
    id: '3',
    title: 'Node.js性能优化实战',
    content: '分享Node.js应用性能优化的实战经验...',
    excerpt: '从内存管理到异步优化，全面提升Node.js应用性能',
    coverImageUrl: '',
    authorId: '3',
    author: { id: '3', nickname: '后端架构师', avatarUrl: '' },
    categoryId: '2',
    category: { id: '2', name: '后端开发', slug: 'backend' },
    isPaid: true,
    price: 39.9,
    status: 'PUBLISHED',
    viewCount: 756,
    likeCount: 45,
    publishedAt: '2024-12-03T09:15:00Z',
    createdAt: '2024-12-03T09:15:00Z',
    updatedAt: '2024-12-03T09:15:00Z'
  }
]

// 检查后端是否可用
const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch('/health', {
      method: 'GET',
      timeout: 3000
    } as any)
    return response.ok
  } catch {
    return false
  }
}

export const useArticlesStore = defineStore('articles', () => {
  // 状态
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false
  })

  // 计算属性
  const publishedArticles = computed(() => 
    articles.value.filter(article => article.status === 'PUBLISHED')
  )
  
  const draftArticles = computed(() => 
    articles.value.filter(article => article.status === 'DRAFT')
  )
  
  const paidArticles = computed(() => 
    articles.value.filter(article => article.isPaid)
  )
  
  const freeArticles = computed(() => 
    articles.value.filter(article => !article.isPaid)
  )

  // 获取文章列表
  const fetchArticles = async (params: PaginationParams & {
    categoryId?: string
    authorId?: string
    status?: string
    isPaid?: boolean
  } = {}) => {
    try {
      isLoading.value = true
      error.value = null

      // 检查是否为开发模式且后端不可用，使用模拟数据
      const isDev = import.meta.env.DEV
      const useMockData = isDev // 暂时总是使用模拟数据

      if (useMockData) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 过滤模拟数据
        let filteredArticles = [...mockArticles]

        if (params.status) {
          filteredArticles = filteredArticles.filter(article => article.status === params.status)
        }

        if (params.isPaid !== undefined) {
          filteredArticles = filteredArticles.filter(article => article.isPaid === params.isPaid)
        }

        // 排序
        if (params.sortBy === 'viewCount') {
          filteredArticles.sort((a, b) =>
            params.sortOrder === 'asc' ? a.viewCount - b.viewCount : b.viewCount - a.viewCount
          )
        }

        // 分页
        const page = params.page || 1
        const limit = params.limit || 10
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

        articles.value = paginatedArticles

        // 更新分页信息
        pagination.value = {
          page,
          limit,
          total: filteredArticles.length,
          hasNext: endIndex < filteredArticles.length,
          hasPrev: page > 1
        }

        return { success: true }
      } else {
        // 真实API调用
        const response = await apiClient.get('/articles', params)

        if (response.success && response.data) {
          articles.value = response.data

          if (response.meta) {
            pagination.value = {
              page: response.meta.page || 1,
              limit: response.meta.limit || 10,
              total: response.meta.total || 0,
              hasNext: response.meta.hasNext || false,
              hasPrev: response.meta.hasPrev || false
            }
          }

          return { success: true }
        } else {
          throw new Error(response.message || '获取文章列表失败')
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '获取文章列表失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 获取单篇文章
  const fetchArticle = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      // 检查是否为开发模式且后端不可用，使用模拟数据
      const isDev = import.meta.env.DEV
      const useMockData = isDev // 暂时总是使用模拟数据

      if (useMockData) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800))

        // 查找模拟文章
        const mockArticle = mockArticles.find(article => article.id === id)

        if (mockArticle) {
          // 创建完整的文章内容
          const fullArticle: Article = {
            ...mockArticle,
            content: `
              <h2>引言</h2>
              <p>这是一篇关于${mockArticle.title}的详细文章。在这里我们将深入探讨相关的技术概念和实践经验。</p>

              <h2>核心概念</h2>
              <p>首先，让我们了解一些基础概念。这些概念对于理解后续内容至关重要。</p>

              <blockquote>
                <p>知识的价值在于分享和传播，通过深入的学习和实践，我们能够不断提升自己的技能水平。</p>
              </blockquote>

              <h3>技术要点</h3>
              <ul>
                <li>理解基础原理和概念</li>
                <li>掌握实际应用场景</li>
                <li>学会最佳实践方法</li>
                <li>避免常见的陷阱和错误</li>
              </ul>

              <h2>实践案例</h2>
              <p>让我们通过一个具体的例子来说明这些概念的应用：</p>

              <pre><code>// 示例代码
function example() {
  console.log('这是一个示例');
  return 'success';
}</code></pre>

              <h2>总结</h2>
              <p>通过本文的学习，我们了解了相关的技术概念和实践方法。希望这些内容对你的学习和工作有所帮助。</p>

              <p>如果你有任何问题或建议，欢迎在评论区留言讨论。</p>
            `
          }

          currentArticle.value = fullArticle

          // 更新文章列表中的对应项
          const index = articles.value.findIndex(article => article.id === id)
          if (index !== -1) {
            articles.value[index] = fullArticle
          }

          // 触发文章查看事件
          eventBus.emit('article:viewed', { articleId: id })

          return { success: true, data: fullArticle }
        } else {
          throw new Error('文章不存在')
        }
      } else {
        // 真实API调用
        const response = await apiClient.get<Article>(`/articles/${id}`)

        if (response.success && response.data) {
          currentArticle.value = response.data

          // 更新文章列表中的对应项
          const index = articles.value.findIndex(article => article.id === id)
          if (index !== -1) {
            articles.value[index] = response.data
          }

          // 触发文章查看事件
          eventBus.emit('article:viewed', { articleId: id })

          return { success: true, data: response.data }
        } else {
          throw new Error(response.message || '获取文章失败')
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '获取文章失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 创建文章
  const createArticle = async (articleData: CreateArticleRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.post<Article>('/articles', articleData)
      
      if (response.success && response.data) {
        articles.value.unshift(response.data)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || '创建文章失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '创建文章失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 更新文章
  const updateArticle = async (id: string, updates: UpdateArticleRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.put<Article>(`/articles/${id}`, updates)
      
      if (response.success && response.data) {
        const updatedArticle = response.data
        
        // 更新文章列表
        const index = articles.value.findIndex(article => article.id === id)
        if (index !== -1) {
          articles.value[index] = updatedArticle
        }
        
        // 更新当前文章
        if (currentArticle.value?.id === id) {
          currentArticle.value = updatedArticle
        }
        
        return { success: true, data: updatedArticle }
      } else {
        throw new Error(response.message || '更新文章失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '更新文章失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 删除文章
  const deleteArticle = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.delete(`/articles/${id}`)
      
      if (response.success) {
        // 从文章列表中移除
        articles.value = articles.value.filter(article => article.id !== id)
        
        // 清除当前文章
        if (currentArticle.value?.id === id) {
          currentArticle.value = null
        }
        
        return { success: true }
      } else {
        throw new Error(response.message || '删除文章失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '删除文章失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 点赞文章
  const likeArticle = async (id: string) => {
    try {
      const response = await apiClient.post(`/articles/${id}/like`)
      
      if (response.success) {
        // 更新文章点赞数
        const article = articles.value.find(a => a.id === id)
        if (article) {
          article.likeCount += 1
        }
        
        if (currentArticle.value?.id === id) {
          currentArticle.value.likeCount += 1
        }

        // 触发点赞事件
        eventBus.emit('article:liked', { articleId: id, userId: '' })
        
        return { success: true }
      } else {
        throw new Error(response.message || '点赞失败')
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }

  // 取消点赞
  const unlikeArticle = async (id: string) => {
    try {
      const response = await apiClient.delete(`/articles/${id}/like`)
      
      if (response.success) {
        // 更新文章点赞数
        const article = articles.value.find(a => a.id === id)
        if (article) {
          article.likeCount = Math.max(0, article.likeCount - 1)
        }
        
        if (currentArticle.value?.id === id) {
          currentArticle.value.likeCount = Math.max(0, currentArticle.value.likeCount - 1)
        }

        // 触发取消点赞事件
        eventBus.emit('article:unliked', { articleId: id, userId: '' })
        
        return { success: true }
      } else {
        throw new Error(response.message || '取消点赞失败')
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }

  // 购买文章
  const purchaseArticle = async (id: string, paymentMethod: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiClient.post(`/articles/${id}/purchase`, { paymentMethod })
      
      if (response.success && response.data) {
        // 触发购买事件
        eventBus.emit('article:purchased', { 
          articleId: id, 
          userId: '', 
          orderId: response.data.orderId 
        })
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || '购买失败')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '购买失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 清除当前文章
  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  return {
    // 状态
    articles,
    currentArticle,
    isLoading,
    error,
    pagination,
    
    // 计算属性
    publishedArticles,
    draftArticles,
    paidArticles,
    freeArticles,
    
    // 方法
    fetchArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    unlikeArticle,
    purchaseArticle,
    clearError,
    clearCurrentArticle
  }
})
