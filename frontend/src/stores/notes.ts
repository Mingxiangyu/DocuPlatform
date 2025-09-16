import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventBus } from '../utils/EventBus'

// 笔记数据模型
export interface Note {
  id: string
  userId: string
  articleId: string
  articleTitle: string
  articleAuthor: string
  type: 'highlight' | 'note' | 'both'
  highlightText?: string
  noteText?: string
  highlightColor: 'yellow' | 'blue' | 'green' | 'purple'
  position: string
  createdAt: string
  updatedAt: string
  // 为虚拟DOM高亮系统预留字段
  highlightId?: string
  virtualNodeId?: string
  positionData?: any
}

// 筛选和排序选项
export type NoteFilterType = 'all' | 'highlight' | 'note' | 'both'
export type NoteSortType = 'newest' | 'oldest' | 'article'
export type NoteViewType = 'grouped' | 'timeline'

// 统计数据接口
export interface NoteStats {
  totalNotes: number
  totalHighlights: number
  totalArticles: number
}

// 检查后端是否可用
const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

export const useNotesStore = defineStore('notes', () => {
  // 状态
  const notes = ref<Note[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentView = ref<NoteViewType>('grouped')
  const currentFilter = ref<NoteFilterType>('all')
  const currentSort = ref<NoteSortType>('newest')
  const searchTerm = ref('')

  // 模拟数据
  const mockNotes: Note[] = [
    {
      id: '1',
      userId: 'demo-user',
      articleId: '1',
      articleTitle: 'Modern React Hooks 完全指南',
      articleAuthor: '张三',
      type: 'both',
      highlightText: 'useState 是 React 中最基础也是最重要的 Hook，它允许函数组件拥有自己的状态。',
      noteText: '这个概念很重要，useState 确实是 React Hooks 的基础。需要深入理解其工作原理。',
      highlightColor: 'yellow',
      position: '第2章 - useState 详解',
      createdAt: '2024-12-08T14:30:00Z',
      updatedAt: '2024-12-08T14:30:00Z'
    },
    {
      id: '2',
      userId: 'demo-user',
      articleId: '1',
      articleTitle: 'Modern React Hooks 完全指南',
      articleAuthor: '张三',
      type: 'highlight',
      highlightText: 'useEffect 的依赖数组是性能优化的关键，错误的依赖配置可能导致无限循环或内存泄漏。',
      highlightColor: 'blue',
      position: '第3章 - useEffect 副作用处理',
      createdAt: '2024-12-08T14:45:00Z',
      updatedAt: '2024-12-08T14:45:00Z'
    },
    {
      id: '3',
      userId: 'demo-user',
      articleId: '2',
      articleTitle: 'TypeScript 高级类型系统详解',
      articleAuthor: '王五',
      type: 'note',
      highlightText: '泛型约束（Generic Constraints）允许我们限制泛型参数必须满足某些条件。',
      noteText: '泛型约束的使用场景很多，特别是在编写工具函数时。可以结合 keyof 操作符实现更强大的类型推导。',
      highlightColor: 'green',
      position: '第4章 - 泛型进阶',
      createdAt: '2024-12-05T16:20:00Z',
      updatedAt: '2024-12-05T16:20:00Z'
    },
    {
      id: '4',
      userId: 'demo-user',
      articleId: '1',
      articleTitle: 'Modern React Hooks 完全指南',
      articleAuthor: '张三',
      type: 'both',
      highlightText: '自定义 Hook 的命名必须以 "use" 开头，这是 React 的约定，也是 ESLint 规则检查的依据。',
      noteText: '命名约定很重要，不仅是为了规范，也是为了让 React 的开发工具能够正确识别和处理 Hook。',
      highlightColor: 'yellow',
      position: '第6章 - 自定义 Hooks 开发',
      createdAt: '2024-12-08T15:10:00Z',
      updatedAt: '2024-12-08T15:10:00Z'
    },
    {
      id: '5',
      userId: 'demo-user',
      articleId: '3',
      articleTitle: 'Node.js 微服务架构实战',
      articleAuthor: '赵六',
      type: 'highlight',
      highlightText: '服务发现是微服务架构中的核心组件，它解决了服务实例动态变化的问题。',
      highlightColor: 'blue',
      position: '第2章 - 服务发现机制',
      createdAt: '2024-11-30T10:15:00Z',
      updatedAt: '2024-11-30T10:15:00Z'
    }
  ]

  // 计算属性
  const filteredNotes = computed(() => {
    let filtered = notes.value

    // 按类型筛选
    if (currentFilter.value !== 'all') {
      filtered = filtered.filter(note => note.type === currentFilter.value)
    }

    // 按搜索词筛选
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      filtered = filtered.filter(note =>
        note.articleTitle.toLowerCase().includes(term) ||
        note.highlightText?.toLowerCase().includes(term) ||
        note.noteText?.toLowerCase().includes(term) ||
        note.position.toLowerCase().includes(term)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      switch (currentSort.value) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'article':
          return a.articleTitle.localeCompare(b.articleTitle)
        default:
          return 0
      }
    })

    return filtered
  })

  const groupedNotes = computed(() => {
    const grouped: Record<string, { articleTitle: string; articleAuthor: string; notes: Note[] }> = {}
    
    filteredNotes.value.forEach(note => {
      if (!grouped[note.articleId]) {
        grouped[note.articleId] = {
          articleTitle: note.articleTitle,
          articleAuthor: note.articleAuthor,
          notes: []
        }
      }
      grouped[note.articleId].notes.push(note)
    })

    return grouped
  })

  const stats = computed((): NoteStats => {
    const totalNotes = notes.value.length
    const totalHighlights = notes.value.filter(note => 
      note.type === 'highlight' || note.type === 'both'
    ).length
    const uniqueArticles = new Set(notes.value.map(note => note.articleId))
    
    return {
      totalNotes,
      totalHighlights,
      totalArticles: uniqueArticles.size
    }
  })

  // 初始化笔记数据
  const initNotes = () => {
    const storedNotes = localStorage.getItem('docuvault_notes')
    if (storedNotes) {
      try {
        notes.value = JSON.parse(storedNotes)
      } catch (err) {
        console.error('Failed to parse stored notes:', err)
        notes.value = mockNotes
      }
    } else {
      notes.value = mockNotes
    }
  }

  // 保存笔记到本地存储
  const saveNotesToStorage = () => {
    try {
      localStorage.setItem('docuvault_notes', JSON.stringify(notes.value))
    } catch (err) {
      console.error('Failed to save notes to storage:', err)
    }
  }

  // 加载笔记列表
  const loadNotes = async () => {
    try {
      isLoading.value = true
      error.value = null

      const backendAvailable = await checkBackendAvailable()

      if (backendAvailable) {
        // TODO: 实际API调用
        // const response = await apiClient.get('/notes')
        // notes.value = response.data
      } else {
        // 使用模拟数据
        initNotes()
      }

      eventBus.emit('notes:loaded', { count: notes.value.length })
    } catch (err: any) {
      error.value = err.message || '加载笔记失败'
      eventBus.emit('notification:show', {
        type: 'error',
        message: error.value
      })
    } finally {
      isLoading.value = false
    }
  }

  // 创建笔记
  const createNote = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      isLoading.value = true
      error.value = null

      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        userId: 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const backendAvailable = await checkBackendAvailable()

      if (backendAvailable) {
        // TODO: 实际API调用
        // const response = await apiClient.post('/notes', newNote)
        // notes.value.unshift(response.data)
      } else {
        // 模拟数据操作
        notes.value.unshift(newNote)
        saveNotesToStorage()
      }

      eventBus.emit('note:created', {
        noteId: newNote.id,
        articleId: newNote.articleId,
        userId: newNote.userId
      })

      // 如果有关联的高亮，发送关联事件
      if (newNote.highlightId) {
        eventBus.emit('highlight:linked-to-note', {
          highlightId: newNote.highlightId,
          noteId: newNote.id,
          articleId: newNote.articleId
        })
      }

      eventBus.emit('notification:show', {
        type: 'success',
        message: '笔记创建成功'
      })

      return { success: true, data: newNote }
    } catch (err: any) {
      error.value = err.message || '创建笔记失败'
      eventBus.emit('notification:show', {
        type: 'error',
        message: error.value
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 更新笔记
  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      isLoading.value = true
      error.value = null

      const noteIndex = notes.value.findIndex(note => note.id === noteId)
      if (noteIndex === -1) {
        throw new Error('笔记不存在')
      }

      const updatedNote = {
        ...notes.value[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      const backendAvailable = await checkBackendAvailable()

      if (backendAvailable) {
        // TODO: 实际API调用
        // const response = await apiClient.put(`/notes/${noteId}`, updatedNote)
        // notes.value[noteIndex] = response.data
      } else {
        // 模拟数据操作
        notes.value[noteIndex] = updatedNote
        saveNotesToStorage()
      }

      eventBus.emit('note:updated', updatedNote)
      eventBus.emit('notification:show', {
        type: 'success',
        message: '笔记更新成功'
      })

      return updatedNote
    } catch (err: any) {
      error.value = err.message || '更新笔记失败'
      eventBus.emit('notification:show', {
        type: 'error',
        message: error.value
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 删除笔记
  const deleteNote = async (noteId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const noteIndex = notes.value.findIndex(note => note.id === noteId)
      if (noteIndex === -1) {
        throw new Error('笔记不存在')
      }

      const deletedNote = notes.value[noteIndex]

      const backendAvailable = await checkBackendAvailable()

      if (backendAvailable) {
        // TODO: 实际API调用
        // await apiClient.delete(`/notes/${noteId}`)
      }

      // 从数组中移除
      notes.value.splice(noteIndex, 1)
      saveNotesToStorage()

      eventBus.emit('note:deleted', deletedNote)
      eventBus.emit('notification:show', {
        type: 'success',
        message: '笔记删除成功'
      })

      return deletedNote
    } catch (err: any) {
      error.value = err.message || '删除笔记失败'
      eventBus.emit('notification:show', {
        type: 'error',
        message: error.value
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 设置视图模式
  const setView = (view: NoteViewType) => {
    currentView.value = view
    eventBus.emit('notes:view-changed', view)
  }

  // 设置筛选条件
  const setFilter = (filter: NoteFilterType) => {
    currentFilter.value = filter
    eventBus.emit('notes:filter-changed', filter)
  }

  // 设置排序方式
  const setSort = (sort: NoteSortType) => {
    currentSort.value = sort
    eventBus.emit('notes:sort-changed', sort)
  }

  // 设置搜索词
  const setSearchTerm = (term: string) => {
    searchTerm.value = term
    eventBus.emit('notes:search-changed', term)
  }

  // 根据ID获取笔记
  const getNoteById = (noteId: string) => {
    return notes.value.find(note => note.id === noteId)
  }

  // 根据文章ID获取笔记
  const getNotesByArticleId = (articleId: string) => {
    return notes.value.filter(note => note.articleId === articleId)
  }

  // 高亮相关方法
  const linkHighlightToNote = async (highlightId: string, noteId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const note = notes.value.find(n => n.id === noteId)
      if (!note) {
        return { success: false, error: '笔记不存在' }
      }

      note.highlightId = highlightId
      note.type = note.type === 'note' ? 'both' : note.type
      note.updatedAt = new Date().toISOString()

      saveNotesToStorage()

      eventBus.emit('highlight:linked-to-note', {
        highlightId,
        noteId,
        articleId: note.articleId
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: '关联高亮失败' }
    }
  }

  const unlinkHighlightFromNote = async (highlightId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const note = notes.value.find(n => n.highlightId === highlightId)
      if (!note) {
        return { success: false, error: '关联笔记不存在' }
      }

      note.highlightId = undefined
      note.type = note.type === 'both' ? 'note' : note.type
      note.updatedAt = new Date().toISOString()

      saveNotesToStorage()

      return { success: true }
    } catch (error) {
      return { success: false, error: '取消关联失败' }
    }
  }

  const getNotesWithHighlights = () => {
    return notes.value.filter(note => note.highlightId)
  }

  const createNoteWithHighlight = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, highlightId: string) => {
    const noteWithHighlight = {
      ...noteData,
      highlightId,
      type: 'both' as const
    }
    return await createNote(noteWithHighlight)
  }

  return {
    // 状态
    notes: computed(() => notes.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentView: computed(() => currentView.value),
    currentFilter: computed(() => currentFilter.value),
    currentSort: computed(() => currentSort.value),
    searchTerm: computed(() => searchTerm.value),

    // 计算属性
    filteredNotes,
    groupedNotes,
    stats,

    // 方法
    initNotes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    setView,
    setFilter,
    setSort,
    setSearchTerm,
    getNoteById,
    getNotesByArticleId,

    // 高亮关联方法
    linkHighlightToNote,
    unlinkHighlightFromNote,
    getNotesWithHighlights,
    createNoteWithHighlight
  }
})
