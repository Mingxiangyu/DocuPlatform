import type {
  HighlightInfo,
  IHighlightManager,
  SelectionRange,
  HighlightRenderConfig,
  DEFAULT_HIGHLIGHT_CONFIG
} from '../types/virtual-dom'
import type { VirtualDOMManager } from './VirtualDOMManager'
import type { TextSelector } from './TextSelector'
import { eventBus } from './EventBus'

export class HighlightManager implements IHighlightManager {
  private virtualDOMManager: VirtualDOMManager
  private textSelector: TextSelector
  private config: HighlightRenderConfig
  private highlights: Map<string, HighlightInfo>
  private highlightIdCounter: number

  constructor(
    virtualDOMManager: VirtualDOMManager, 
    textSelector: TextSelector,
    config: Partial<HighlightRenderConfig> = {}
  ) {
    this.virtualDOMManager = virtualDOMManager
    this.textSelector = textSelector
    this.config = { ...DEFAULT_HIGHLIGHT_CONFIG, ...config }
    this.highlights = new Map()
    this.highlightIdCounter = 0
  }

  // 高亮管理方法
  async createHighlight(range: SelectionRange, color: string, userId?: string): Promise<HighlightInfo> {
    try {
      const highlightId = this.generateHighlightId()
      
      // 验证选择范围
      if (!this.isValidRange(range)) {
        throw new Error('Invalid selection range')
      }

      // 创建高亮信息
      const highlight: HighlightInfo = {
        id: highlightId,
        virtualNodeId: range.startNodeId,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        color,
        text: range.text,
        userId: userId || 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          selectionRange: range,
          renderConfig: { ...this.config },
          version: 1
        }
      }

      // 存储高亮
      this.highlights.set(highlightId, highlight)

      // 发送创建事件
      eventBus.emit('highlight:created', { highlight })

      // 触发渲染更新
      this.updateHighlightDisplay(highlightId)

      if (this.config.debugMode) {
        console.log('HighlightManager: Created highlight', highlight)
      }

      return highlight
    } catch (error) {
      console.error('HighlightManager: Failed to create highlight', error)
      throw error
    }
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    try {
      const highlight = this.highlights.get(highlightId)
      if (!highlight) {
        throw new Error(`Highlight ${highlightId} not found`)
      }

      // 从存储中删除
      this.highlights.delete(highlightId)

      // 发送删除事件
      eventBus.emit('highlight:deleted', { highlightId, highlight })

      // 触发渲染更新
      this.clearHighlightDisplay(highlightId)

      if (this.config.debugMode) {
        console.log('HighlightManager: Deleted highlight', highlightId)
      }
    } catch (error) {
      console.error('HighlightManager: Failed to delete highlight', error)
      throw error
    }
  }

  async updateHighlightColor(highlightId: string, color: string): Promise<void> {
    try {
      const highlight = this.highlights.get(highlightId)
      if (!highlight) {
        throw new Error(`Highlight ${highlightId} not found`)
      }

      const oldColor = highlight.color
      highlight.color = color
      highlight.updatedAt = new Date().toISOString()
      highlight.metadata.version++

      // 发送更新事件
      eventBus.emit('highlight:updated', { 
        highlightId, 
        highlight, 
        changes: { color: { old: oldColor, new: color } }
      })

      // 触发渲染更新
      this.updateHighlightDisplay(highlightId)

      if (this.config.debugMode) {
        console.log('HighlightManager: Updated highlight color', { highlightId, color })
      }
    } catch (error) {
      console.error('HighlightManager: Failed to update highlight color', error)
      throw error
    }
  }

  // 查询方法
  getHighlight(highlightId: string): HighlightInfo | null {
    return this.highlights.get(highlightId) || null
  }

  getHighlightsByArticle(articleId: string): HighlightInfo[] {
    // 注意：这里需要根据实际的文章ID关联逻辑来实现
    // 目前返回所有高亮，实际应用中需要根据articleId筛选
    return Array.from(this.highlights.values())
  }

  getHighlightsByUser(userId: string): HighlightInfo[] {
    return Array.from(this.highlights.values()).filter(
      highlight => highlight.userId === userId
    )
  }

  getHighlightsByNode(nodeId: string): HighlightInfo[] {
    return Array.from(this.highlights.values()).filter(
      highlight => highlight.virtualNodeId === nodeId
    )
  }

  getAllHighlights(): HighlightInfo[] {
    return Array.from(this.highlights.values())
  }

  // 渲染方法
  renderHighlights(highlights: HighlightInfo[]): void {
    try {
      // 清除现有高亮显示
      this.clearAllHighlights()

      // 按位置排序高亮
      const sortedHighlights = highlights.sort((a, b) => a.startOffset - b.startOffset)

      // 批量渲染高亮
      for (const highlight of sortedHighlights) {
        this.renderSingleHighlight(highlight)
      }

      if (this.config.debugMode) {
        console.log('HighlightManager: Rendered highlights', highlights.length)
      }
    } catch (error) {
      console.error('HighlightManager: Failed to render highlights', error)
    }
  }

  clearHighlights(): void {
    this.clearAllHighlights()
    this.highlights.clear()
    
    eventBus.emit('highlight:all-cleared', {})
    
    if (this.config.debugMode) {
      console.log('HighlightManager: Cleared all highlights')
    }
  }

  updateHighlightDisplay(highlightId: string): void {
    const highlight = this.highlights.get(highlightId)
    if (highlight) {
      this.renderSingleHighlight(highlight)
    }
  }

  // 选择处理
  async handleSelection(selection: Selection): Promise<SelectionRange | null> {
    try {
      return this.textSelector.getSelection()
    } catch (error) {
      console.error('HighlightManager: Failed to handle selection', error)
      return null
    }
  }

  // 事件处理
  handleHighlightClick(highlightId: string, event: MouseEvent): void {
    const highlight = this.highlights.get(highlightId)
    if (highlight) {
      eventBus.emit('highlight:clicked', { highlight, event })
      
      if (this.config.debugMode) {
        console.log('HighlightManager: Highlight clicked', { highlightId, highlight })
      }
    }
  }

  handleHighlightHover(highlightId: string | null, event: MouseEvent): void {
    if (highlightId) {
      const highlight = this.highlights.get(highlightId)
      if (highlight) {
        eventBus.emit('highlight:hovered', { highlight, event })
      }
    } else {
      eventBus.emit('highlight:hover-end', { event })
    }
  }

  // 私有方法
  private generateHighlightId(): string {
    return `highlight_${++this.highlightIdCounter}_${Date.now()}`
  }

  private isValidRange(range: SelectionRange): boolean {
    if (!range.startNodeId || !range.endNodeId) {
      return false
    }

    if (range.startOffset < 0 || range.endOffset < 0) {
      return false
    }

    if (range.startOffset >= range.endOffset) {
      return false
    }

    // 验证虚拟节点是否存在
    const startNode = this.virtualDOMManager.getNode(range.startNodeId)
    const endNode = this.virtualDOMManager.getNode(range.endNodeId)

    return startNode !== null && endNode !== null
  }

  private renderSingleHighlight(highlight: HighlightInfo): void {
    try {
      // 获取虚拟节点
      const node = this.virtualDOMManager.getNode(highlight.virtualNodeId)
      if (!node || !node.metadata.originalElement) {
        console.warn('HighlightManager: Cannot render highlight, node not found', highlight.id)
        return
      }

      // 创建高亮标记元素
      const highlightElement = this.createHighlightElement(highlight)
      
      // 这里需要实现具体的DOM操作来插入高亮标记
      // 由于涉及复杂的DOM操作，这部分将在VirtualHighlightRenderer组件中实现
      
      if (this.config.debugMode) {
        console.log('HighlightManager: Rendered single highlight', highlight.id)
      }
    } catch (error) {
      console.error('HighlightManager: Failed to render single highlight', error)
    }
  }

  private createHighlightElement(highlight: HighlightInfo): HTMLElement {
    const element = document.createElement('span')
    element.className = `virtual-highlight virtual-highlight-${highlight.color}`
    element.dataset.highlightId = highlight.id
    element.dataset.userId = highlight.userId
    element.style.backgroundColor = this.getHighlightColor(highlight.color)
    element.style.opacity = this.config.opacity.toString()
    
    // 添加事件监听器
    element.addEventListener('click', (event) => {
      this.handleHighlightClick(highlight.id, event)
    })
    
    element.addEventListener('mouseenter', (event) => {
      this.handleHighlightHover(highlight.id, event)
    })
    
    element.addEventListener('mouseleave', (event) => {
      this.handleHighlightHover(null, event)
    })

    return element
  }

  private getHighlightColor(color: string): string {
    const colorMap: Record<string, string> = {
      'yellow': '#ffeb3b',
      'green': '#4caf50',
      'blue': '#2196f3',
      'red': '#f44336',
      'purple': '#9c27b0',
      'orange': '#ff9800'
    }

    return colorMap[color] || color
  }

  private clearAllHighlights(): void {
    // 移除所有高亮标记元素
    const highlightElements = document.querySelectorAll('.virtual-highlight')
    highlightElements.forEach(element => element.remove())
  }

  private clearHighlightDisplay(highlightId: string): void {
    // 移除特定高亮标记元素
    const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`)
    if (highlightElement) {
      highlightElement.remove()
    }
  }

  // 统计和调试
  getStats(): { 
    highlightCount: number
    colorDistribution: Record<string, number>
    userDistribution: Record<string, number>
  } {
    const highlights = Array.from(this.highlights.values())
    const colorDistribution: Record<string, number> = {}
    const userDistribution: Record<string, number> = {}

    highlights.forEach(highlight => {
      colorDistribution[highlight.color] = (colorDistribution[highlight.color] || 0) + 1
      userDistribution[highlight.userId] = (userDistribution[highlight.userId] || 0) + 1
    })

    return {
      highlightCount: highlights.length,
      colorDistribution,
      userDistribution
    }
  }

  // 清理资源
  destroy(): void {
    this.clearHighlights()
    this.highlights.clear()
  }
}
