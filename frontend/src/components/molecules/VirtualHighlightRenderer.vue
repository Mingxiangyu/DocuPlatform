<template>
  <div 
    ref="contentContainer"
    class="virtual-highlight-renderer"
    @mouseup="handleMouseUp"
    @touchend="handleTouchEnd"
  >
    <div 
      v-html="renderedContent" 
      class="highlight-content"
      :class="{ 'readonly': readonly }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { 
  VirtualTextNode, 
  HighlightInfo, 
  SelectionRange,
  HighlightRenderConfig,
  DEFAULT_HIGHLIGHT_CONFIG 
} from '../../types/virtual-dom'

interface Props {
  content: string
  virtualNodes: VirtualTextNode[]
  highlights: HighlightInfo[]
  config?: Partial<HighlightRenderConfig>
  readonly?: boolean
}

interface Emits {
  (e: 'highlight-click', highlight: HighlightInfo, event: MouseEvent): void
  (e: 'highlight-hover', highlight: HighlightInfo | null, event: MouseEvent): void
  (e: 'selection-change', range: SelectionRange | null): void
  (e: 'content-ready'): void
}

const props = withDefaults(defineProps<Props>(), {
  virtualNodes: () => [],
  highlights: () => [],
  config: () => ({}),
  readonly: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const contentContainer = ref<HTMLElement>()
const isContentReady = ref(false)
const currentSelection = ref<SelectionRange | null>(null)

// 计算属性
const mergedConfig = computed(() => ({
  ...DEFAULT_HIGHLIGHT_CONFIG,
  ...props.config
}))

const renderedContent = computed(() => {
  if (!props.content || props.highlights.length === 0) {
    return props.content
  }

  return renderContentWithHighlights()
})

// 方法
const renderContentWithHighlights = (): string => {
  try {
    let content = props.content
    const sortedHighlights = [...props.highlights].sort((a, b) => b.startOffset - a.startOffset)

    // 从后往前插入高亮标记，避免偏移量问题
    for (const highlight of sortedHighlights) {
      content = insertHighlightMarkers(content, highlight)
    }

    return content
  } catch (error) {
    console.error('VirtualHighlightRenderer: Failed to render highlights', error)
    return props.content
  }
}

const insertHighlightMarkers = (content: string, highlight: HighlightInfo): string => {
  const { startOffset, endOffset, color, id } = highlight
  
  if (startOffset >= content.length || endOffset > content.length || startOffset >= endOffset) {
    return content
  }

  const beforeText = content.substring(0, startOffset)
  const highlightText = content.substring(startOffset, endOffset)
  const afterText = content.substring(endOffset)

  const highlightClass = `virtual-highlight highlight-${color}`
  const highlightStyle = `background-color: ${getHighlightColor(color)}; opacity: ${mergedConfig.value.opacity};`
  
  const highlightMarker = `<span 
    class="${highlightClass}" 
    style="${highlightStyle}"
    data-highlight-id="${id}"
    data-highlight-color="${color}"
    data-highlight-start="${startOffset}"
    data-highlight-end="${endOffset}"
  >${highlightText}</span>`

  return beforeText + highlightMarker + afterText
}

const getHighlightColor = (color: string): string => {
  const colorMap = mergedConfig.value.colors
  return colorMap[color as keyof typeof colorMap] || color
}

const handleMouseUp = (event: MouseEvent) => {
  if (props.readonly) return
  
  setTimeout(() => {
    handleSelectionChange(event)
  }, 10) // 延迟处理，确保选择已完成
}

const handleTouchEnd = (event: TouchEvent) => {
  if (props.readonly) return
  
  setTimeout(() => {
    handleSelectionChange(event as any)
  }, 10)
}

const handleSelectionChange = (event: MouseEvent | TouchEvent) => {
  try {
    const selection = window.getSelection()
    
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      if (currentSelection.value) {
        currentSelection.value = null
        emit('selection-change', null)
      }
      return
    }

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    if (selectedText.length === 0) {
      return
    }

    // 检查选择是否在当前容器内
    if (!contentContainer.value?.contains(range.commonAncestorContainer)) {
      return
    }

    // 创建虚拟选择范围
    const virtualRange = createVirtualSelectionRange(range, selectedText)
    
    if (virtualRange) {
      currentSelection.value = virtualRange
      emit('selection-change', virtualRange)
    }
  } catch (error) {
    console.error('VirtualHighlightRenderer: Failed to handle selection change', error)
  }
}

const createVirtualSelectionRange = (range: Range, text: string): SelectionRange | null => {
  try {
    // 计算选择在原始内容中的位置
    const containerText = contentContainer.value?.textContent || ''
    const beforeRange = document.createRange()
    beforeRange.setStart(contentContainer.value!, 0)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    
    const startOffset = beforeRange.toString().length
    const endOffset = startOffset + text.length

    // 查找对应的虚拟节点
    const startNode = findVirtualNodeAtOffset(startOffset)
    const endNode = findVirtualNodeAtOffset(endOffset - 1)

    if (!startNode || !endNode) {
      return null
    }

    return {
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      startOffset,
      endOffset,
      text,
      virtualNodes: [startNode, endNode],
      metadata: {
        domRange: range,
        boundingRect: range.getBoundingClientRect(),
        timestamp: Date.now()
      }
    }
  } catch (error) {
    console.error('VirtualHighlightRenderer: Failed to create virtual selection range', error)
    return null
  }
}

const findVirtualNodeAtOffset = (offset: number): VirtualTextNode | null => {
  for (const node of props.virtualNodes) {
    if (offset >= node.position.startOffset && offset <= node.position.endOffset) {
      return node
    }
  }
  return null
}

const handleHighlightClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const highlightElement = target.closest('[data-highlight-id]') as HTMLElement
  
  if (highlightElement) {
    const highlightId = highlightElement.dataset.highlightId
    const highlight = props.highlights.find(h => h.id === highlightId)
    
    if (highlight) {
      emit('highlight-click', highlight, event)
    }
  }
}

const handleHighlightHover = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const highlightElement = target.closest('[data-highlight-id]') as HTMLElement
  
  if (highlightElement) {
    const highlightId = highlightElement.dataset.highlightId
    const highlight = props.highlights.find(h => h.id === highlightId)
    
    if (highlight) {
      emit('highlight-hover', highlight, event)
    }
  } else {
    emit('highlight-hover', null, event)
  }
}

const setupEventListeners = () => {
  if (!contentContainer.value) return

  // 高亮点击事件
  contentContainer.value.addEventListener('click', handleHighlightClick)
  
  // 高亮悬停事件
  contentContainer.value.addEventListener('mouseenter', handleHighlightHover, true)
  contentContainer.value.addEventListener('mouseleave', handleHighlightHover, true)
}

const removeEventListeners = () => {
  if (!contentContainer.value) return

  contentContainer.value.removeEventListener('click', handleHighlightClick)
  contentContainer.value.removeEventListener('mouseenter', handleHighlightHover, true)
  contentContainer.value.removeEventListener('mouseleave', handleHighlightHover, true)
}

// 生命周期
onMounted(() => {
  setupEventListeners()
  isContentReady.value = true
  emit('content-ready')
})

onUnmounted(() => {
  removeEventListeners()
})

// 监听器
watch(() => props.highlights, () => {
  // 高亮变化时重新设置事件监听器
  removeEventListeners()
  setTimeout(() => {
    setupEventListeners()
  }, 0)
}, { deep: true })

watch(() => props.content, () => {
  isContentReady.value = false
  setTimeout(() => {
    isContentReady.value = true
    emit('content-ready')
  }, 0)
})
</script>

<style scoped>
.virtual-highlight-renderer {
  position: relative;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}

.highlight-content {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.highlight-content.readonly {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 高亮样式 */
:deep(.virtual-highlight) {
  position: relative;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;
  padding: 1px 2px;
  margin: -1px -2px;
}

:deep(.virtual-highlight:hover) {
  opacity: 0.8 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 不同颜色的高亮样式 */
:deep(.highlight-yellow) {
  background-color: #fff3cd;
}

:deep(.highlight-green) {
  background-color: #d4edda;
}

:deep(.highlight-blue) {
  background-color: #cce7ff;
}

:deep(.highlight-pink) {
  background-color: #f8d7da;
}

:deep(.highlight-orange) {
  background-color: #ffeaa7;
}

:deep(.highlight-purple) {
  background-color: #e9d5ff;
}

:deep(.highlight-red) {
  background-color: #fecaca;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .virtual-highlight-renderer {
    font-size: 14px;
  }
  
  :deep(.virtual-highlight) {
    padding: 2px 3px;
    margin: -2px -3px;
  }
}

/* 打印样式 */
@media print {
  :deep(.virtual-highlight) {
    background-color: transparent !important;
    border: 1px solid #ccc;
  }
}
</style>
