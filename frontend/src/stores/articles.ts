import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, CreateArticleRequest, UpdateArticleRequest, PaginationParams } from '../types/api'
import { apiClient } from '../services/ApiClient'
import { eventBus } from '../utils/EventBus'

// 检查后端健康状态
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      timeout: 3000
    } as RequestInit)
    return response.ok
  } catch (error) {
    console.warn('Backend health check failed:', error)
    return false
  }
}

// 模拟文章数据 - 基于后端Prisma Schema构建
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Modern React Hooks 完全指南',
    content: `# Modern React Hooks 完全指南

## 1. 介绍

React Hooks 是 React 16.8 引入的一项重大特性，它允许我们在不编写类组件的情况下使用状态和其他 React 特性。本指南将深入探讨 React Hooks 的设计原理、核心 API 以及实战应用，帮助你掌握这一现代 React 开发的必备技能。

在 Hooks 出现之前，函数组件无法拥有自己的状态，也不能访问生命周期方法。Hooks 的出现彻底改变了这一局面，使得函数组件可以完成类组件所能做的所有事情，同时带来了更简洁的代码结构和更好的复用性。

## 2. useState 详解

\`useState\` 是最基础也是最常用的 Hook，它让函数组件能够拥有自己的状态。

### 基本用法

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
\`\`\`

### 状态更新的异步性

需要注意的是，状态更新是异步的，React 会批量处理状态更新以提高性能。

## 3. useEffect 副作用处理

\`useEffect\` Hook 让我们能够在函数组件中执行副作用操作，相当于类组件中的 \`componentDidMount\`、\`componentDidUpdate\` 和 \`componentWillUnmount\` 的组合。

### 基本语法

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    document.title = \`点击了 \${count} 次\`;
  });

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
\`\`\`

## 4. useContext 上下文管理

\`useContext\` Hook 让我们能够更简洁地使用 React Context。

### 创建和使用 Context

\`\`\`javascript
import React, { useContext, createContext } from 'react';

const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      我是一个 {theme} 主题的按钮
    </button>
  );
}
\`\`\`

## 5. useReducer 状态管理

对于复杂的状态逻辑，\`useReducer\` 通常比 \`useState\` 更适用。

### 基本用法

\`\`\`javascript
import React, { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      计数: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
\`\`\`

## 6. 自定义 Hooks 开发

自定义 Hooks 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

### 创建自定义 Hook

\`\`\`javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// 使用自定义 Hook
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>减少</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
\`\`\`

## 7. 最佳实践与性能优化

### Hook 使用规则

1. **只在最顶层使用 Hook**：不要在循环、条件或嵌套函数中调用 Hook
2. **只在 React 函数中调用 Hook**：不要在普通的 JavaScript 函数中调用 Hook

### 性能优化技巧

使用 \`useMemo\` 和 \`useCallback\` 来优化性能：

\`\`\`javascript
import React, { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items, onItemClick }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const handleClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <div>
      <p>总值: {expensiveValue}</p>
      {items.map(item => (
        <button key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}
\`\`\`

## 8. 总结与展望

React Hooks 为函数组件带来了强大的能力，让我们能够以更简洁、更直观的方式编写 React 应用。通过本指南的学习，你应该已经掌握了：

- useState 的基本用法和状态管理
- useEffect 的副作用处理机制
- useContext 的上下文管理
- useReducer 的复杂状态管理
- 自定义 Hooks 的开发技巧
- 性能优化的最佳实践

随着 React 的不断发展，Hooks 生态系统也在不断完善。建议继续关注 React 官方文档和社区最佳实践，持续提升你的 React 开发技能。

如果你有任何问题或建议，欢迎在评论区留言讨论。让我们一起在 React 的世界中不断探索和成长！`,
    excerpt: '深入探讨 React Hooks 的设计原理、核心 API 以及实战应用，帮助你掌握这一现代 React 开发的必备技能。',
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    authorId: '1',
    author: {
      id: '1',
      nickname: '张三',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    categoryId: '1',
    category: { id: '1', name: '前端开发', slug: 'frontend' },
    isPaid: true,
    price: 19.99,
    status: 'PUBLISHED',
    viewCount: 1200,
    likeCount: 89,
    publishedAt: '2024-08-15T10:00:00Z',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-08-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Python 数据分析实战：从入门到精通',
    content: `# Python 数据分析实战：从入门到精通

## 引言

Python 已经成为数据科学领域最受欢迎的编程语言之一。本文将带你从零开始，逐步掌握使用 Python 进行数据分析的核心技能。

## 环境准备

首先，我们需要安装必要的库：

\`\`\`bash
pip install pandas numpy matplotlib seaborn jupyter
\`\`\`

## 数据加载与探索

使用 Pandas 加载数据是数据分析的第一步：

\`\`\`python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 加载数据
df = pd.read_csv('data.csv')

# 查看数据基本信息
print(df.head())
print(df.info())
print(df.describe())
\`\`\`

## 数据清洗

数据清洗是数据分析中最重要的步骤之一：

\`\`\`python
# 处理缺失值
df.dropna()  # 删除缺失值
df.fillna(df.mean())  # 用均值填充

# 处理重复值
df.drop_duplicates()

# 数据类型转换
df['date'] = pd.to_datetime(df['date'])
\`\`\`

## 数据可视化

使用 Matplotlib 和 Seaborn 创建图表：

\`\`\`python
# 创建基本图表
plt.figure(figsize=(10, 6))
plt.plot(df['x'], df['y'])
plt.title('数据趋势图')
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.show()

# 使用 Seaborn 创建更美观的图表
sns.scatterplot(data=df, x='feature1', y='feature2', hue='category')
plt.show()
\`\`\`

## 统计分析

进行基本的统计分析：

\`\`\`python
# 相关性分析
correlation_matrix = df.corr()
sns.heatmap(correlation_matrix, annot=True)

# 分组统计
grouped_data = df.groupby('category').agg({
    'value': ['mean', 'std', 'count']
})
\`\`\`

## 总结

通过本文的学习，你已经掌握了 Python 数据分析的基础技能。继续实践和探索，你将能够处理更复杂的数据分析任务。`,
    excerpt: '使用 Pandas、NumPy 和 Matplotlib 进行数据分析的完整指南，包含实际案例和最佳实践。',
    coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    authorId: '2',
    author: {
      id: '2',
      nickname: '李四',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    categoryId: '2',
    category: { id: '2', name: '数据科学', slug: 'data-science' },
    isPaid: true,
    price: 29.99,
    status: 'PUBLISHED',
    viewCount: 2500,
    likeCount: 156,
    publishedAt: '2024-09-03T14:30:00Z',
    createdAt: '2024-09-03T14:30:00Z',
    updatedAt: '2024-09-03T14:30:00Z'
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
      const backendAvailable = await checkBackendHealth()
      const useMockData = isDev && !backendAvailable

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
        const response = await apiClient.get<Article>(`/api/articles/${id}`)

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

  // 增加浏览量
  const incrementViewCount = async (id: string) => {
    try {
      const article = articles.value.find(a => a.id === id)
      if (article) {
        article.viewCount = (article.viewCount || 0) + 1
      }
      if (currentArticle.value?.id === id) {
        currentArticle.value.viewCount = (currentArticle.value.viewCount || 0) + 1
      }
    } catch (err) {
      console.error('增加浏览量失败:', err)
    }
  }

  // 切换点赞状态
  const toggleLike = async (id: string) => {
    try {
      const article = articles.value.find(a => a.id === id)
      if (article) {
        const isCurrentlyLiked = isLiked(id)
        article.likeCount = isCurrentlyLiked
          ? (article.likeCount || 0) - 1
          : (article.likeCount || 0) + 1
      }
      if (currentArticle.value?.id === id) {
        const isCurrentlyLiked = isLiked(id)
        currentArticle.value.likeCount = isCurrentlyLiked
          ? (currentArticle.value.likeCount || 0) - 1
          : (currentArticle.value.likeCount || 0) + 1
      }
    } catch (err) {
      console.error('切换点赞状态失败:', err)
    }
  }

  // 切换收藏状态
  const toggleBookmark = async (id: string) => {
    try {
      // 这里可以添加实际的收藏逻辑
      console.log('切换收藏状态:', id)
    } catch (err) {
      console.error('切换收藏状态失败:', err)
    }
  }

  // 检查是否已点赞
  const isLiked = (id: string) => {
    // 这里应该检查用户的点赞状态，暂时返回false
    return false
  }

  // 检查是否已收藏
  const isBookmarked = (id: string) => {
    // 这里应该检查用户的收藏状态，暂时返回false
    return false
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
    clearCurrentArticle,
    incrementViewCount,
    toggleLike,
    toggleBookmark,
    isLiked,
    isBookmarked
  }
})
