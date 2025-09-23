import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  HighlightInfo,
  VirtualTextNode,
  SelectionRange,
  HighlightRenderConfig
} from '../types/virtual-dom'
import { DEFAULT_HIGHLIGHT_CONFIG } from '../types/virtual-dom'
import { VirtualDOMManager } from '../utils/VirtualDOMManager'
import { HighlightManager } from '../utils/HighlightManager'
import { TextSelector } from '../utils/TextSelector'
import { eventBus } from '../utils/EventBus'

// 模拟高亮数据
const mockHighlights: HighlightInfo[] = [
  {
    id: 'highlight_1',
    virtualNodeId: 'vnode_1',
    startOffset: 50,
    endOffset: 120,
    color: 'yellow',
    text: 'Vue 3 Composition API为开发者提供了更灵活的组件逻辑组织方式',
    userId: 'user_1',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
    metadata: {
      selectionRange: {
        startNodeId: 'vnode_1',
        endNodeId: 'vnode_1',
        startOffset: 50,
        endOffset: 120,
        text: 'Vue 3 Composition API为开发者提供了更灵活的组件逻辑组织方式',
        virtualNodes: [],
        metadata: { timestamp: Date.now() }
      },
      renderConfig: DEFAULT_HIGHLIGHT_CONFIG,
      version: 1
    }
  },
  {
    id: 'highlight_2',
    virtualNodeId: 'vnode_2',
    startOffset: 200,
    endOffset: 280,
    color: 'green',
    text: 'TypeScript的高级类型系统让代码更加类型安全',
    userId: 'user_1',
    createdAt: '2024-12-10T11:00:00Z',
    updatedAt: '2024-12-10T11:00:00Z',
    metadata: {
      selectionRange: {
        startNodeId: 'vnode_2',
        endNodeId: 'vnode_2',
        startOffset: 200,
        endOffset: 280,
        text: 'TypeScript的高级类型系统让代码更加类型安全',
        virtualNodes: [],
        metadata: { timestamp: Date.now() }
      },
      renderConfig: DEFAULT_HIGHLIGHT_CONFIG,
      version: 1
    }
  }
]

export const useHighlightsStore = defineStore('highlights', () => {
  // 状态定义
  const highlights = ref<HighlightInfo[]>([])
  const virtualNodes = ref<Map<string, VirtualTextNode>>(new Map())
  const currentSelection = ref<SelectionRange | null>(null)
  const currentArticleId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 管理器实例
  const virtualDOMManager = new VirtualDOMManager()
  const textSelector = new TextSelector(virtualDOMManager)
  const highlightManager = new HighlightManager(virtualDOMManager, textSelector)

  // 筛选和排序状态
  const filterColor = ref<string>('all')
  const filterUser = ref<string>('all')
  const sortBy = ref<'newest' | 'oldest' | 'position'>('newest')

  // 计算属性
  const filteredHighlights = computed(() => {
    let filtered = highlights.value

    // 颜色筛选
    if (filterColor.value !== 'all') {
      filtered = filtered.filter(h => h.color === filterColor.value)
    }

    // 用户筛选
    if (filterUser.value !== 'all') {
      filtered = filtered.filter(h => h.userId === filterUser.value)
    }

    // 排序
    return filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'position':
          return a.startOffset - b.startOffset
        default:
          return 0
      }
    })
  })

  const highlightStats = computed(() => {
    const stats = {
      total: highlights.value.length,
      byColor: {} as Record<string, number>,
      byUser: {} as Record<string, number>
    }

    highlights.value.forEach(highlight => {
      stats.byColor[highlight.color] = (stats.byColor[highlight.color] || 0) + 1
      stats.byUser[highlight.userId] = (stats.byUser[highlight.userId] || 0) + 1
    })

    return stats
  })

  const virtualNodesArray = computed(() => {
    return Array.from(virtualNodes.value.values())
  })

  // 方法定义
  const loadHighlights = async (articleId: string): Promise<{ success: boolean; data?: HighlightInfo[]; error?: string }> => {
    try {
      isLoading.value = true
      error.value = null
      currentArticleId.value = articleId

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      // 加载模拟数据
      highlights.value = [...mockHighlights]

      // 发送加载完成事件
      eventBus.emit('highlights:loaded', { 
        articleId, 
        count: highlights.value.length 
      })

      return { success: true, data: highlights.value }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载高亮失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const parseArticleContent = async (content: string): Promise<{ success: boolean; nodes?: VirtualTextNode[]; error?: string }> => {
    try {
      isLoading.value = true
      error.value = null

      // 解析内容为虚拟DOM
      const nodes = virtualDOMManager.parseContent(content)
      
      // 更新虚拟节点映射
      virtualNodes.value.clear()
      nodes.forEach(node => {
        virtualNodes.value.set(node.id, node)
        // 递归添加子节点
        addChildNodesToMap(node)
      })

      // 发送解析完成事件
      eventBus.emit('virtual-dom:parsed', { 
        nodeCount: virtualNodes.value.size 
      })

      return { success: true, nodes }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '解析内容失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const createHighlight = async (range: SelectionRange, color: string): Promise<{ success: boolean; data?: HighlightInfo; error?: string }> => {
    try {
      isLoading.value = true
      error.value = null

      // 使用HighlightManager创建高亮
      const highlight = await highlightManager.createHighlight(range, color)
      
      // 添加到本地状态
      highlights.value.push(highlight)

      // 保存到本地存储
      saveToLocalStorage()

      // 发送创建事件
      eventBus.emit('highlight:created', { 
        highlightId: highlight.id,
        articleId: currentArticleId.value || '',
        userId: highlight.userId,
        virtualNodeId: highlight.virtualNodeId
      })

      return { success: true, data: highlight }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建高亮失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const deleteHighlight = async (highlightId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      isLoading.value = true
      error.value = null

      const highlight = highlights.value.find(h => h.id === highlightId)
      if (!highlight) {
        throw new Error('高亮不存在')
      }

      // 使用HighlightManager删除高亮
      await highlightManager.deleteHighlight(highlightId)

      // 从本地状态删除
      const index = highlights.value.findIndex(h => h.id === highlightId)
      if (index > -1) {
        highlights.value.splice(index, 1)
      }

      // 保存到本地存储
      saveToLocalStorage()

      // 发送删除事件
      eventBus.emit('highlight:deleted', { 
        highlightId,
        articleId: currentArticleId.value || '',
        userId: highlight.userId
      })

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除高亮失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const updateHighlightColor = async (highlightId: string, color: string): Promise<{ success: boolean; error?: string }> => {
    try {
      isLoading.value = true
      error.value = null

      // 使用HighlightManager更新颜色
      await highlightManager.updateHighlightColor(highlightId, color)

      // 更新本地状态
      const highlight = highlights.value.find(h => h.id === highlightId)
      if (highlight) {
        highlight.color = color
        highlight.updatedAt = new Date().toISOString()
        highlight.metadata.version++
      }

      // 保存到本地存储
      saveToLocalStorage()

      // 发送更新事件
      eventBus.emit('highlight:color-changed', { 
        highlightId, 
        newColor: color 
      })

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新高亮颜色失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentSelection = (range: SelectionRange | null) => {
    currentSelection.value = range
    
    if (range) {
      eventBus.emit('virtual-dom:selection-changed', {
        startNodeId: range.startNodeId,
        endNodeId: range.endNodeId,
        text: range.text
      })
    }
  }

  const getHighlightsByNode = (nodeId: string): HighlightInfo[] => {
    return highlights.value.filter(h => h.virtualNodeId === nodeId)
  }

  const getHighlightsByColor = (color: string): HighlightInfo[] => {
    return highlights.value.filter(h => h.color === color)
  }

  const getHighlightsByUser = (userId: string): HighlightInfo[] => {
    return highlights.value.filter(h => h.userId === userId)
  }

  // 筛选和排序方法
  const setColorFilter = (color: string) => {
    filterColor.value = color
    eventBus.emit('highlights:filter-changed', { type: 'color', value: color })
  }

  const setUserFilter = (userId: string) => {
    filterUser.value = userId
    eventBus.emit('highlights:filter-changed', { type: 'user', value: userId })
  }

  const setSortBy = (sort: 'newest' | 'oldest' | 'position') => {
    sortBy.value = sort
    eventBus.emit('highlights:sort-changed', sort)
  }

  // 本地存储方法
  const saveToLocalStorage = () => {
    try {
      const data = {
        highlights: highlights.value,
        virtualNodes: Array.from(virtualNodes.value.entries()),
        timestamp: Date.now()
      }
      localStorage.setItem('docuvault_highlights', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save highlights to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('docuvault_highlights')
      if (data) {
        const parsed = JSON.parse(data)
        highlights.value = parsed.highlights || []
        
        if (parsed.virtualNodes) {
          virtualNodes.value = new Map(parsed.virtualNodes)
        }
      }
    } catch (error) {
      console.error('Failed to load highlights from localStorage:', error)
    }
  }

  // 辅助方法
  const addChildNodesToMap = (node: VirtualTextNode) => {
    node.childIds.forEach(childId => {
      const childNode = virtualDOMManager.getNode(childId)
      if (childNode) {
        virtualNodes.value.set(childId, childNode)
        addChildNodesToMap(childNode)
      }
    })
  }

  // 清理方法
  const clearAll = () => {
    highlights.value = []
    virtualNodes.value.clear()
    currentSelection.value = null
    currentArticleId.value = null
    error.value = null

    // 清理管理器
    highlightManager.clearHighlights()
    virtualDOMManager.clearCache()

    // 清理本地存储
    localStorage.removeItem('docuvault_highlights')

    eventBus.emit('highlights:cleared', {})
  }

  // 为文章初始化高亮系统
  const initializeForArticle = async (articleId: string) => {
    try {
      currentArticleId.value = articleId

      // 加载该文章的高亮数据
      await loadHighlights(articleId)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '初始化高亮系统失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    }
  }

  // 初始化
  loadFromLocalStorage()

  return {
    // 状态
    highlights: filteredHighlights,
    allHighlights: highlights,
    virtualNodes: virtualNodesArray,
    currentSelection,
    currentArticleId,
    isLoading,
    error,
    
    // 筛选状态
    filterColor,
    filterUser,
    sortBy,
    
    // 计算属性
    highlightStats,
    
    // 方法
    loadHighlights,
    parseArticleContent,
    createHighlight,
    deleteHighlight,
    updateHighlightColor,
    setCurrentSelection,
    getHighlightsByNode,
    getHighlightsByColor,
    getHighlightsByUser,
    setColorFilter,
    setUserFilter,
    setSortBy,
    clearAll,
    initializeForArticle,
    
    // 管理器实例（供外部使用）
    virtualDOMManager,
    highlightManager,
    textSelector
  }
})
