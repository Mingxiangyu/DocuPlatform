import type { 
  SelectionRange, 
  ITextSelector, 
  VirtualTextNode 
} from '../types/virtual-dom'
import type { VirtualDOMManager } from './VirtualDOMManager'

export class TextSelector implements ITextSelector {
  private virtualDOMManager: VirtualDOMManager
  private selectionCallbacks: Set<(range: SelectionRange | null) => void>
  private isListening: boolean
  private lastSelection: SelectionRange | null

  constructor(virtualDOMManager: VirtualDOMManager) {
    this.virtualDOMManager = virtualDOMManager
    this.selectionCallbacks = new Set()
    this.isListening = false
    this.lastSelection = null

    // 绑定事件处理器
    this.handleSelectionChange = this.handleSelectionChange.bind(this)
  }

  // 选择检测方法
  getSelection(): SelectionRange | null {
    try {
      const selection = window.getSelection()
      if (!selection || !this.isValidSelection(selection)) {
        return null
      }

      return this.calculateVirtualRange(selection)
    } catch (error) {
      console.error('TextSelector: Failed to get selection', error)
      return null
    }
  }

  isValidSelection(selection: Selection): boolean {
    if (!selection || selection.rangeCount === 0) {
      return false
    }

    const range = selection.getRangeAt(0)
    if (!range || range.collapsed) {
      return false
    }

    // 检查选择是否在有效的文本内容中
    const selectedText = selection.toString().trim()
    if (selectedText.length === 0) {
      return false
    }

    return true
  }

  calculateVirtualRange(selection: Selection): SelectionRange | null {
    try {
      const range = selection.getRangeAt(0)
      const selectedText = selection.toString()

      // 获取选择的起始和结束容器
      const startContainer = range.startContainer
      const endContainer = range.endContainer

      // 查找对应的虚拟节点
      const startVirtualNode = this.findVirtualNodeForDOMNode(startContainer)
      const endVirtualNode = this.findVirtualNodeForDOMNode(endContainer)

      if (!startVirtualNode || !endVirtualNode) {
        console.warn('TextSelector: Could not find virtual nodes for selection')
        return null
      }

      // 计算在虚拟节点中的偏移量
      const startOffset = this.calculateNodeOffset(startVirtualNode, range.startOffset)
      const endOffset = this.calculateNodeOffset(endVirtualNode, range.endOffset)

      // 获取选择范围内的所有虚拟节点
      const virtualNodes = this.getVirtualNodesInRange(startVirtualNode, endVirtualNode, startOffset, endOffset)

      const virtualRange: SelectionRange = {
        startNodeId: startVirtualNode.id,
        endNodeId: endVirtualNode.id,
        startOffset,
        endOffset,
        text: selectedText,
        virtualNodes,
        metadata: {
          domRange: range,
          boundingRect: range.getBoundingClientRect(),
          timestamp: Date.now()
        }
      }

      return virtualRange
    } catch (error) {
      console.error('TextSelector: Failed to calculate virtual range', error)
      return null
    }
  }

  // 选择操作方法
  selectRange(range: SelectionRange): void {
    try {
      const startNode = this.virtualDOMManager.getNode(range.startNodeId)
      const endNode = this.virtualDOMManager.getNode(range.endNodeId)

      if (!startNode || !endNode) {
        throw new Error('Virtual nodes not found for selection range')
      }

      // 获取对应的DOM节点
      const startDOMNode = this.getDOMNodeFromVirtual(startNode)
      const endDOMNode = this.getDOMNodeFromVirtual(endNode)

      if (!startDOMNode || !endDOMNode) {
        throw new Error('DOM nodes not found for virtual nodes')
      }

      // 创建DOM Range
      const domRange = document.createRange()
      domRange.setStart(startDOMNode, range.startOffset)
      domRange.setEnd(endDOMNode, range.endOffset)

      // 应用选择
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(domRange)
      }
    } catch (error) {
      console.error('TextSelector: Failed to select range', error)
    }
  }

  clearSelection(): void {
    try {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
      }
      this.lastSelection = null
    } catch (error) {
      console.error('TextSelector: Failed to clear selection', error)
    }
  }

  expandSelectionToWords(range: SelectionRange): SelectionRange {
    try {
      const startNode = this.virtualDOMManager.getNode(range.startNodeId)
      const endNode = this.virtualDOMManager.getNode(range.endNodeId)

      if (!startNode || !endNode || !startNode.textContent || !endNode.textContent) {
        return range
      }

      // 扩展到单词边界
      const startText = startNode.textContent
      const endText = endNode.textContent

      // 向前查找单词边界
      let newStartOffset = range.startOffset
      while (newStartOffset > 0 && /\w/.test(startText[newStartOffset - 1])) {
        newStartOffset--
      }

      // 向后查找单词边界
      let newEndOffset = range.endOffset
      while (newEndOffset < endText.length && /\w/.test(endText[newEndOffset])) {
        newEndOffset++
      }

      // 重新计算选择文本
      const expandedText = this.getTextInRange({
        ...range,
        startOffset: newStartOffset,
        endOffset: newEndOffset
      })

      return {
        ...range,
        startOffset: newStartOffset,
        endOffset: newEndOffset,
        text: expandedText
      }
    } catch (error) {
      console.error('TextSelector: Failed to expand selection to words', error)
      return range
    }
  }

  expandSelectionToSentences(range: SelectionRange): SelectionRange {
    try {
      const startNode = this.virtualDOMManager.getNode(range.startNodeId)
      const endNode = this.virtualDOMManager.getNode(range.endNodeId)

      if (!startNode || !endNode || !startNode.textContent || !endNode.textContent) {
        return range
      }

      // 扩展到句子边界
      const startText = startNode.textContent
      const endText = endNode.textContent

      // 向前查找句子边界
      let newStartOffset = range.startOffset
      while (newStartOffset > 0 && !/[.!?]/.test(startText[newStartOffset - 1])) {
        newStartOffset--
      }

      // 向后查找句子边界
      let newEndOffset = range.endOffset
      while (newEndOffset < endText.length && !/[.!?]/.test(endText[newEndOffset])) {
        newEndOffset++
      }
      if (newEndOffset < endText.length) {
        newEndOffset++ // 包含句号
      }

      // 重新计算选择文本
      const expandedText = this.getTextInRange({
        ...range,
        startOffset: newStartOffset,
        endOffset: newEndOffset
      })

      return {
        ...range,
        startOffset: newStartOffset,
        endOffset: newEndOffset,
        text: expandedText
      }
    } catch (error) {
      console.error('TextSelector: Failed to expand selection to sentences', error)
      return range
    }
  }

  // 事件监听
  startListening(): void {
    if (!this.isListening) {
      document.addEventListener('selectionchange', this.handleSelectionChange)
      this.isListening = true
    }
  }

  stopListening(): void {
    if (this.isListening) {
      document.removeEventListener('selectionchange', this.handleSelectionChange)
      this.isListening = false
    }
  }

  onSelectionChange(callback: (range: SelectionRange | null) => void): () => void {
    this.selectionCallbacks.add(callback)
    
    // 返回取消监听的函数
    return () => {
      this.selectionCallbacks.delete(callback)
    }
  }

  // 私有方法
  private handleSelectionChange(): void {
    const currentSelection = this.getSelection()
    
    // 检查选择是否真的发生了变化
    if (this.isSelectionChanged(currentSelection, this.lastSelection)) {
      this.lastSelection = currentSelection
      
      // 通知所有回调
      this.selectionCallbacks.forEach(callback => {
        try {
          callback(currentSelection)
        } catch (error) {
          console.error('TextSelector: Selection callback error', error)
        }
      })
    }
  }

  private isSelectionChanged(current: SelectionRange | null, last: SelectionRange | null): boolean {
    if (!current && !last) return false
    if (!current || !last) return true
    
    return (
      current.startNodeId !== last.startNodeId ||
      current.endNodeId !== last.endNodeId ||
      current.startOffset !== last.startOffset ||
      current.endOffset !== last.endOffset
    )
  }

  private findVirtualNodeForDOMNode(domNode: Node): VirtualTextNode | null {
    // 如果是文本节点，查找包含它的元素
    let targetElement: HTMLElement
    
    if (domNode.nodeType === Node.TEXT_NODE) {
      targetElement = domNode.parentElement as HTMLElement
    } else {
      targetElement = domNode as HTMLElement
    }

    if (!targetElement) return null

    // 在虚拟DOM中查找对应的节点
    return this.virtualDOMManager.findNodeByElement(targetElement)
  }

  private calculateNodeOffset(virtualNode: VirtualTextNode, domOffset: number): number {
    // 对于文本节点，偏移量直接对应
    if (virtualNode.type === 'text') {
      return virtualNode.position.startOffset + domOffset
    }

    // 对于元素节点，需要计算相对于虚拟DOM的偏移量
    return virtualNode.position.startOffset + domOffset
  }

  private getVirtualNodesInRange(
    startNode: VirtualTextNode, 
    endNode: VirtualTextNode, 
    startOffset: number, 
    endOffset: number
  ): VirtualTextNode[] {
    const nodes: VirtualTextNode[] = []

    // 如果是同一个节点
    if (startNode.id === endNode.id) {
      nodes.push(startNode)
      return nodes
    }

    // 获取范围内的所有节点
    // 这里需要实现更复杂的逻辑来获取范围内的所有虚拟节点
    // 简化实现：返回起始和结束节点
    nodes.push(startNode)
    if (startNode.id !== endNode.id) {
      nodes.push(endNode)
    }

    return nodes
  }

  private getDOMNodeFromVirtual(virtualNode: VirtualTextNode): Node | null {
    return virtualNode.metadata.originalElement || null
  }

  private getTextInRange(range: SelectionRange): string {
    try {
      const startNode = this.virtualDOMManager.getNode(range.startNodeId)
      const endNode = this.virtualDOMManager.getNode(range.endNodeId)

      if (!startNode || !endNode) {
        return ''
      }

      // 如果是同一个节点
      if (startNode.id === endNode.id && startNode.textContent) {
        return startNode.textContent.substring(
          range.startOffset - startNode.position.startOffset,
          range.endOffset - startNode.position.startOffset
        )
      }

      // 跨节点选择的文本提取
      let text = ''
      for (const virtualNode of range.virtualNodes) {
        if (virtualNode.textContent) {
          if (virtualNode.id === range.startNodeId) {
            text += virtualNode.textContent.substring(range.startOffset - virtualNode.position.startOffset)
          } else if (virtualNode.id === range.endNodeId) {
            text += virtualNode.textContent.substring(0, range.endOffset - virtualNode.position.startOffset)
          } else {
            text += virtualNode.textContent
          }
        }
      }

      return text
    } catch (error) {
      console.error('TextSelector: Failed to get text in range', error)
      return ''
    }
  }

  // 清理资源
  destroy(): void {
    this.stopListening()
    this.selectionCallbacks.clear()
    this.lastSelection = null
  }
}
