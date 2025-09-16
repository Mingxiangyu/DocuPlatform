// 虚拟DOM节点类型
export interface VirtualTextNode {
  id: string
  type: 'text' | 'element'
  tagName?: string
  textContent?: string
  parentId?: string
  childIds: string[]
  attributes?: Record<string, string>
  position: {
    startOffset: number
    endOffset: number
    depth: number
  }
  metadata: {
    originalElement?: HTMLElement
    xpath?: string
    cssSelector?: string
    created: number
    lastAccessed: number
  }
}

// 高亮信息接口
export interface HighlightInfo {
  id: string
  virtualNodeId: string
  startOffset: number
  endOffset: number
  color: string
  userId: string
  articleId: string
  createdAt: Date
  text?: string
}

// 选择范围接口
export interface SelectionRange {
  startNodeId: string
  startOffset: number
  endNodeId: string
  endOffset: number
  text: string
  virtualNodes: VirtualTextNode[]
}

// 高亮渲染配置
export interface HighlightRenderConfig {
  colors: {
    yellow: string
    green: string
    blue: string
    pink: string
    orange: string
  }
  defaultColor: string
  opacity: number
  borderRadius: string
  transition: string
}

// 虚拟DOM管理器接口
export interface IVirtualDOMManager {
  // 节点管理
  createNode(element: HTMLElement, parentId?: string): VirtualTextNode
  getNode(id: string): VirtualTextNode | null
  updateNode(id: string, updates: Partial<VirtualTextNode>): void
  deleteNode(id: string): void
  
  // 树结构操作
  getChildren(nodeId: string): VirtualTextNode[]
  getParent(nodeId: string): VirtualTextNode | null
  getAncestors(nodeId: string): VirtualTextNode[]
  getDescendants(nodeId: string): VirtualTextNode[]
  
  // 查找和搜索
  findNodeByElement(element: HTMLElement): VirtualTextNode | null
  findNodesByText(text: string): VirtualTextNode[]
  findNodesByXPath(xpath: string): VirtualTextNode[]
  
  // 位置计算
  getAbsoluteOffset(nodeId: string): number
  getRelativeOffset(nodeId: string, ancestorId: string): number
  findNodeAtOffset(offset: number): VirtualTextNode | null
  
  // 序列化和反序列化
  serialize(): string
  deserialize(data: string): void
  
  // 缓存管理
  clearCache(): void
  getStats(): {
    nodeCount: number
    cacheSize: number
    memoryUsage: number
  }
}

// 高亮管理器接口
export interface IHighlightManager {
  // 高亮创建和删除
  createHighlight(range: SelectionRange, color: string): Promise<HighlightInfo>
  deleteHighlight(highlightId: string): Promise<void>
  updateHighlightColor(highlightId: string, color: string): Promise<void>
  
  // 高亮查询
  getHighlights(articleId: string, userId?: string): Promise<HighlightInfo[]>
  getHighlightsByNode(virtualNodeId: string): Promise<HighlightInfo[]>
  getHighlight(highlightId: string): Promise<HighlightInfo | null>
  
  // 高亮渲染
  renderHighlights(highlights: HighlightInfo[]): void
  clearHighlights(): void
  updateHighlightDisplay(highlightId: string): void
  
  // 选择处理
  handleSelection(): SelectionRange | null
  clearSelection(): void
  
  // 事件处理
  onHighlightClick(callback: (highlight: HighlightInfo) => void): () => void
  onHighlightHover(callback: (highlight: HighlightInfo | null) => void): () => void
}

// 文本选择工具接口
export interface ITextSelector {
  // 选择检测
  getSelection(): SelectionRange | null
  isValidSelection(selection: Selection): boolean
  
  // 范围计算
  calculateVirtualRange(selection: Selection): SelectionRange | null
  expandSelectionToWords(range: SelectionRange): SelectionRange
  
  // 选择操作
  selectRange(range: SelectionRange): void
  clearSelection(): void
  
  // 事件处理
  onSelectionChange(callback: (range: SelectionRange | null) => void): () => void
}

// 高亮样式配置
export const DEFAULT_HIGHLIGHT_CONFIG: HighlightRenderConfig = {
  colors: {
    yellow: '#fff3cd',
    green: '#d4edda', 
    blue: '#cce7ff',
    pink: '#f8d7da',
    orange: '#ffeaa7'
  },
  defaultColor: '#fff3cd',
  opacity: 0.6,
  borderRadius: '2px',
  transition: 'all 0.2s ease'
}

// 虚拟DOM配置
export interface VirtualDOMConfig {
  cacheSize: number
  autoCleanup: boolean
  cleanupInterval: number
  debugMode: boolean
  trackAccess: boolean
}

export const DEFAULT_VIRTUAL_DOM_CONFIG: VirtualDOMConfig = {
  cacheSize: parseInt(import.meta.env.VITE_VIRTUAL_DOM_CACHE_SIZE) || 1000,
  autoCleanup: true,
  cleanupInterval: 300000, // 5分钟
  debugMode: import.meta.env.VITE_VIRTUAL_DOM_DEBUG === 'true',
  trackAccess: true
}
