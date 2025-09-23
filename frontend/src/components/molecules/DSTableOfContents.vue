<template>
  <div class="toc-container">
    <h3 class="toc-title">
      目录
    </h3>

    <nav class="toc-nav">
      <ul class="toc-list">
        <li v-for="(item, index) in tocItems" :key="index" class="toc-item">
          <a
            :href="`#${item.id}`"
            :class="[
              'toc-link',
              item.level === 1 ? 'toc-level-1' : '',
              item.level === 2 ? 'toc-level-2' : '',
              item.level === 3 ? 'toc-level-3' : '',
              item.level === 4 ? 'toc-level-4' : '',
              activeSection === item.id ? 'toc-active' : ''
            ]"
            @click.prevent="handleTocClick(item.id)"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- 空状态 -->
    <div v-if="tocItems.length === 0" class="toc-empty">
      <i class="fas fa-list-ul"></i>
      <p>暂无目录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDesignTokens } from '@/design-system/composables/useDesignTokens'

// Props
interface Props {
  content?: string
  autoGenerate?: boolean
  maxLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  autoGenerate: true,
  maxLevel: 4
})

// Emits
const emit = defineEmits<{
  sectionClick: [sectionId: string]
}>()

// 设计令牌
const { tokens } = useDesignTokens()

// 响应式数据
const activeSection = ref('')
const tocItems = ref<Array<{
  id: string
  text: string
  level: number
  element?: HTMLElement
}>>([])

// 生成目录项
const generateTocItems = () => {
  if (!props.autoGenerate) return

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const items: typeof tocItems.value = []
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > props.maxLevel) return
    
    let id = heading.id
    if (!id) {
      // 如果没有id，自动生成一个
      id = `heading-${index}-${heading.textContent?.replace(/\s+/g, '-').toLowerCase()}`
      heading.id = id
    }
    
    items.push({
      id,
      text: heading.textContent || '',
      level,
      element: heading as HTMLElement
    })
  })
  
  tocItems.value = items
}

// 处理目录点击
const handleTocClick = (sectionId: string) => {
  emit('sectionClick', sectionId)
  
  const targetElement = document.querySelector(`#${sectionId}`)
  if (targetElement) {
    // 平滑滚动到目标位置
    window.scrollTo({
      top: targetElement.offsetTop - 120,
      behavior: 'smooth'
    })
  }
}

// 滚动监听，更新活跃章节
const handleScroll = () => {
  const scrollPosition = window.scrollY + 150
  
  // 找到当前可视区域内的章节
  let currentSection = ''
  
  for (const item of tocItems.value) {
    if (item.element) {
      const sectionTop = item.element.offsetTop
      const sectionHeight = item.element.offsetHeight
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = item.id
        break
      }
      
      // 如果滚动位置超过了当前章节，记录这个章节
      if (scrollPosition >= sectionTop) {
        currentSection = item.id
      }
    }
  }
  
  if (currentSection !== activeSection.value) {
    activeSection.value = currentSection
  }
}

// 防抖滚动处理
let scrollTimer: number | null = null
const debouncedHandleScroll = () => {
  if (scrollTimer) {
    cancelAnimationFrame(scrollTimer)
  }
  scrollTimer = requestAnimationFrame(handleScroll)
}

// 监听内容变化，重新生成目录
watch(() => props.content, () => {
  nextTick(() => {
    generateTocItems()
  })
}, { immediate: true })

// 生命周期
onMounted(() => {
  nextTick(() => {
    generateTocItems()
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
    handleScroll() // 初始化活跃章节
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', debouncedHandleScroll)
  if (scrollTimer) {
    cancelAnimationFrame(scrollTimer)
  }
})
</script>

<style scoped>
.table-of-contents {
  font-family: v-bind('tokens.typography.fontFamily.sans.join(", ")');
}

.toc-item {
  font-size: v-bind('tokens.typography.fontSize.sm[0]');
  line-height: v-bind('tokens.typography.fontSize.sm[1].lineHeight');
}

.toc-nav {
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: v-bind('tokens.colors.gray[300]') transparent;
}

.toc-nav::-webkit-scrollbar {
  width: 4px;
}

.toc-nav::-webkit-scrollbar-track {
  background: transparent;
}

.toc-nav::-webkit-scrollbar-thumb {
  background-color: v-bind('tokens.colors.gray[300]');
  border-radius: 2px;
}

.toc-nav::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('tokens.colors.gray[400]');
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .max-h-\[calc\(100vh-240px\)\] {
    max-height: 300px;
  }
}
</style>
