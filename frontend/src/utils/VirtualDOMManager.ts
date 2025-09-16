import type { 
  VirtualTextNode, 
  IVirtualDOMManager, 
  VirtualDOMConfig,
  DEFAULT_VIRTUAL_DOM_CONFIG 
} from '../types/virtual-dom'

// LRU缓存实现
class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>
  private accessOrder: K[]

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
    this.accessOrder = []
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 更新访问顺序
      this.updateAccessOrder(key)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.set(key, value)
      this.updateAccessOrder(key)
    } else {
      if (this.cache.size >= this.capacity) {
        // 移除最少使用的项
        const lru = this.accessOrder.shift()
        if (lru !== undefined) {
          this.cache.delete(lru)
        }
      }
      this.cache.set(key, value)
      this.accessOrder.push(key)
    }
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  size(): number {
    return this.cache.size
  }
}

export class VirtualDOMManager implements IVirtualDOMManager {
  private nodes: Map<string, VirtualTextNode>
  private cache: LRUCache<string, VirtualTextNode>
  private config: VirtualDOMConfig
  private nodeIdCounter: number
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: Partial<VirtualDOMConfig> = {}) {
    this.config = { ...DEFAULT_VIRTUAL_DOM_CONFIG, ...config }
    this.nodes = new Map()
    this.cache = new LRUCache(this.config.cacheSize)
    this.nodeIdCounter = 0

    if (this.config.autoCleanup) {
      this.startCleanupTimer()
    }
  }

  // 节点管理方法
  createNode(element: HTMLElement, parentId?: string): VirtualTextNode {
    const nodeId = this.generateNodeId()
    const node: VirtualTextNode = {
      id: nodeId,
      type: element.nodeType === Node.TEXT_NODE ? 'text' : 'element',
      tagName: element.tagName?.toLowerCase(),
      textContent: element.nodeType === Node.TEXT_NODE ? element.textContent || '' : undefined,
      parentId,
      childIds: [],
      attributes: this.extractAttributes(element),
      position: {
        startOffset: 0,
        endOffset: 0,
        depth: this.calculateDepth(parentId)
      },
      metadata: {
        originalElement: element,
        xpath: this.generateXPath(element),
        cssSelector: this.generateCSSSelector(element),
        created: Date.now(),
        lastAccessed: Date.now()
      }
    }

    this.nodes.set(nodeId, node)
    this.cache.set(nodeId, node)

    // 更新父节点的子节点列表
    if (parentId) {
      const parent = this.getNode(parentId)
      if (parent) {
        parent.childIds.push(nodeId)
      }
    }

    if (this.config.debugMode) {
      console.log(`VirtualDOMManager: Created node ${nodeId}`, node)
    }

    return node
  }

  getNode(id: string): VirtualTextNode | null {
    // 先从缓存查找
    let node = this.cache.get(id)
    if (node) {
      node.metadata.lastAccessed = Date.now()
      return node
    }

    // 从主存储查找
    node = this.nodes.get(id) || null
    if (node && this.config.trackAccess) {
      node.metadata.lastAccessed = Date.now()
      this.cache.set(id, node)
    }

    return node
  }

  updateNode(id: string, updates: Partial<VirtualTextNode>): void {
    const node = this.getNode(id)
    if (node) {
      Object.assign(node, updates)
      node.metadata.lastAccessed = Date.now()
      this.cache.set(id, node)

      if (this.config.debugMode) {
        console.log(`VirtualDOMManager: Updated node ${id}`, updates)
      }
    }
  }

  deleteNode(id: string): void {
    const node = this.getNode(id)
    if (node) {
      // 递归删除子节点
      node.childIds.forEach(childId => this.deleteNode(childId))

      // 从父节点的子节点列表中移除
      if (node.parentId) {
        const parent = this.getNode(node.parentId)
        if (parent) {
          const index = parent.childIds.indexOf(id)
          if (index > -1) {
            parent.childIds.splice(index, 1)
          }
        }
      }

      // 从存储中删除
      this.nodes.delete(id)
      // 注意：不从缓存中删除，让LRU自然淘汰

      if (this.config.debugMode) {
        console.log(`VirtualDOMManager: Deleted node ${id}`)
      }
    }
  }

  // 树结构操作
  getChildren(nodeId: string): VirtualTextNode[] {
    const node = this.getNode(nodeId)
    if (!node) return []

    return node.childIds
      .map(childId => this.getNode(childId))
      .filter((child): child is VirtualTextNode => child !== null)
  }

  getParent(nodeId: string): VirtualTextNode | null {
    const node = this.getNode(nodeId)
    if (!node || !node.parentId) return null

    return this.getNode(node.parentId)
  }

  getAncestors(nodeId: string): VirtualTextNode[] {
    const ancestors: VirtualTextNode[] = []
    let current = this.getParent(nodeId)

    while (current) {
      ancestors.push(current)
      current = this.getParent(current.id)
    }

    return ancestors
  }

  getDescendants(nodeId: string): VirtualTextNode[] {
    const descendants: VirtualTextNode[] = []
    const children = this.getChildren(nodeId)

    for (const child of children) {
      descendants.push(child)
      descendants.push(...this.getDescendants(child.id))
    }

    return descendants
  }

  // 查找和搜索
  findNodeByElement(element: HTMLElement): VirtualTextNode | null {
    for (const node of this.nodes.values()) {
      if (node.metadata.originalElement === element) {
        return node
      }
    }
    return null
  }

  findNodesByText(text: string): VirtualTextNode[] {
    const results: VirtualTextNode[] = []
    const searchText = text.toLowerCase()

    for (const node of this.nodes.values()) {
      if (node.textContent && node.textContent.toLowerCase().includes(searchText)) {
        results.push(node)
      }
    }

    return results
  }

  findNodesByXPath(xpath: string): VirtualTextNode[] {
    const results: VirtualTextNode[] = []

    for (const node of this.nodes.values()) {
      if (node.metadata.xpath === xpath) {
        results.push(node)
      }
    }

    return results
  }

  // 位置计算
  getAbsoluteOffset(nodeId: string): number {
    const node = this.getNode(nodeId)
    if (!node) return 0

    return node.position.startOffset
  }

  getRelativeOffset(nodeId: string, ancestorId: string): number {
    const node = this.getNode(nodeId)
    const ancestor = this.getNode(ancestorId)
    
    if (!node || !ancestor) return 0

    return node.position.startOffset - ancestor.position.startOffset
  }

  findNodeAtOffset(offset: number): VirtualTextNode | null {
    for (const node of this.nodes.values()) {
      if (offset >= node.position.startOffset && offset <= node.position.endOffset) {
        return node
      }
    }
    return null
  }

  // 序列化和反序列化
  serialize(): string {
    const data = {
      nodes: Array.from(this.nodes.entries()),
      config: this.config,
      timestamp: Date.now()
    }
    return JSON.stringify(data)
  }

  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data)
      this.nodes = new Map(parsed.nodes)
      this.config = { ...this.config, ...parsed.config }
      
      // 重建缓存
      this.cache.clear()
      for (const [id, node] of this.nodes) {
        this.cache.set(id, node)
      }

      if (this.config.debugMode) {
        console.log('VirtualDOMManager: Deserialized data', parsed)
      }
    } catch (error) {
      console.error('VirtualDOMManager: Failed to deserialize data', error)
    }
  }

  // 缓存管理
  clearCache(): void {
    this.cache.clear()
  }

  getStats(): { nodeCount: number; cacheSize: number; memoryUsage: number } {
    return {
      nodeCount: this.nodes.size,
      cacheSize: this.cache.size(),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // 私有辅助方法
  private generateNodeId(): string {
    return `vnode_${++this.nodeIdCounter}_${Date.now()}`
  }

  private extractAttributes(element: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = {}
    
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        attributes[attr.name] = attr.value
      }
    }

    return attributes
  }

  private calculateDepth(parentId?: string): number {
    if (!parentId) return 0
    
    const parent = this.getNode(parentId)
    return parent ? parent.position.depth + 1 : 0
  }

  private generateXPath(element: HTMLElement): string {
    const parts: string[] = []
    let current: HTMLElement | null = element

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1
      let sibling = current.previousElementSibling

      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++
        }
        sibling = sibling.previousElementSibling
      }

      const tagName = current.tagName.toLowerCase()
      parts.unshift(`${tagName}[${index}]`)
      current = current.parentElement
    }

    return '/' + parts.join('/')
  }

  private generateCSSSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`
    }

    const parts: string[] = []
    let current: HTMLElement | null = element

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase()
      
      if (current.className) {
        selector += '.' + current.className.split(' ').join('.')
      }

      parts.unshift(selector)
      current = current.parentElement

      if (current && current.id) {
        parts.unshift(`#${current.id}`)
        break
      }
    }

    return parts.join(' > ')
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup()
    }, this.config.cleanupInterval)
  }

  private performCleanup(): void {
    const now = Date.now()
    const maxAge = this.config.cleanupInterval * 2 // 清理超过2个周期未访问的节点

    for (const [id, node] of this.nodes) {
      if (now - node.metadata.lastAccessed > maxAge) {
        this.deleteNode(id)
      }
    }

    if (this.config.debugMode) {
      console.log('VirtualDOMManager: Performed cleanup', this.getStats())
    }
  }

  private estimateMemoryUsage(): number {
    // 简单的内存使用估算
    let usage = 0
    
    for (const node of this.nodes.values()) {
      usage += JSON.stringify(node).length * 2 // 粗略估算，每字符2字节
    }

    return usage
  }

  // 内容解析方法
  parseContent(htmlContent: string): VirtualTextNode[] {
    // 创建临时DOM容器
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    // 构建虚拟节点树
    const rootNodes: VirtualTextNode[] = []
    let currentOffset = 0

    for (let i = 0; i < tempDiv.childNodes.length; i++) {
      const childNode = tempDiv.childNodes[i]
      const virtualNode = this.buildNodeTree(childNode as HTMLElement, undefined, currentOffset)
      if (virtualNode) {
        rootNodes.push(virtualNode)
        currentOffset = virtualNode.position.endOffset
      }
    }

    // 计算所有节点的位置
    this.calculatePositions(rootNodes)

    if (this.config.debugMode) {
      console.log('VirtualDOMManager: Parsed content', { rootNodes, totalNodes: this.nodes.size })
    }

    return rootNodes
  }

  buildNodeTree(element: Node, parentId?: string, startOffset: number = 0): VirtualTextNode | null {
    if (!element) return null

    let node: VirtualTextNode

    if (element.nodeType === Node.TEXT_NODE) {
      // 文本节点
      const textContent = element.textContent || ''
      if (textContent.trim().length === 0) {
        return null // 跳过空白文本节点
      }

      node = {
        id: this.generateNodeId(),
        type: 'text',
        textContent,
        parentId,
        childIds: [],
        attributes: {},
        position: {
          startOffset,
          endOffset: startOffset + textContent.length,
          depth: this.calculateDepth(parentId)
        },
        metadata: {
          originalElement: element as HTMLElement,
          xpath: this.generateTextNodeXPath(element, parentId),
          cssSelector: '',
          created: Date.now(),
          lastAccessed: Date.now()
        }
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      // 元素节点
      const htmlElement = element as HTMLElement
      node = {
        id: this.generateNodeId(),
        type: 'element',
        tagName: htmlElement.tagName.toLowerCase(),
        parentId,
        childIds: [],
        attributes: this.extractAttributes(htmlElement),
        position: {
          startOffset,
          endOffset: startOffset, // 将在处理子节点后更新
          depth: this.calculateDepth(parentId)
        },
        metadata: {
          originalElement: htmlElement,
          xpath: this.generateXPath(htmlElement),
          cssSelector: this.generateCSSSelector(htmlElement),
          created: Date.now(),
          lastAccessed: Date.now()
        }
      }

      // 处理子节点
      let currentChildOffset = startOffset
      for (let i = 0; i < element.childNodes.length; i++) {
        const childNode = element.childNodes[i]
        const childVirtualNode = this.buildNodeTree(childNode, node.id, currentChildOffset)

        if (childVirtualNode) {
          node.childIds.push(childVirtualNode.id)
          currentChildOffset = childVirtualNode.position.endOffset
        }
      }

      // 更新元素节点的结束位置
      node.position.endOffset = currentChildOffset
    } else {
      return null // 跳过其他类型的节点
    }

    // 存储节点
    this.nodes.set(node.id, node)
    this.cache.set(node.id, node)

    return node
  }

  calculatePositions(nodes: VirtualTextNode[]): void {
    let currentOffset = 0

    const calculateNodePositions = (node: VirtualTextNode) => {
      if (node.type === 'text') {
        node.position.startOffset = currentOffset
        node.position.endOffset = currentOffset + (node.textContent?.length || 0)
        currentOffset = node.position.endOffset
      } else {
        node.position.startOffset = currentOffset

        // 处理子节点
        for (const childId of node.childIds) {
          const child = this.getNode(childId)
          if (child) {
            calculateNodePositions(child)
          }
        }

        node.position.endOffset = currentOffset
      }
    }

    for (const node of nodes) {
      calculateNodePositions(node)
    }
  }

  private generateTextNodeXPath(textNode: Node, parentId?: string): string {
    if (!parentId) return '/text()'

    const parent = this.getNode(parentId)
    if (!parent || !parent.metadata.originalElement) {
      return '/text()'
    }

    // 计算文本节点在父元素中的位置
    let textIndex = 1
    const parentElement = parent.metadata.originalElement

    for (let i = 0; i < parentElement.childNodes.length; i++) {
      const child = parentElement.childNodes[i]
      if (child === textNode) {
        break
      }
      if (child.nodeType === Node.TEXT_NODE) {
        textIndex++
      }
    }

    return `${parent.metadata.xpath}/text()[${textIndex}]`
  }

  // 清理资源
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.nodes.clear()
    this.cache.clear()
  }
}
