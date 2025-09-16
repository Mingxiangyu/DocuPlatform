<template>
  <div
    v-if="visible"
    class="highlight-toolbar"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px',
      transform: 'translateX(-50%)'
    }"
  >
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <!-- 高亮颜色选择 -->
      <div class="flex items-center space-x-2 mb-3">
        <span class="text-sm font-medium text-gray-700">高亮颜色：</span>
        <div class="flex space-x-1">
          <button
            v-for="color in highlightColors"
            :key="color.name"
            @click="selectColor(color.value)"
            :class="[
              'w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform',
              selectedColor === color.value ? 'ring-2 ring-purple-500' : ''
            ]"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center space-x-2">
        <Button
          @click="createHighlight"
          variant="primary"
          size="sm"
          :disabled="!selectedColor"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
          </svg>
          高亮
        </Button>

        <Button
          @click="showNoteInput = !showNoteInput"
          variant="outline"
          size="sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          笔记
        </Button>

        <Button
          @click="$emit('close')"
          variant="ghost"
          size="sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </Button>
      </div>

      <!-- 笔记输入框 -->
      <div v-if="showNoteInput" class="mt-3 pt-3 border-t border-gray-200">
        <textarea
          v-model="noteText"
          placeholder="输入你的笔记..."
          class="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="3"
          @keydown.enter.ctrl="createNoteWithHighlight"
        />
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-500">Ctrl+Enter 保存</span>
          <div class="flex space-x-2">
            <Button
              @click="showNoteInput = false; noteText = ''"
              variant="ghost"
              size="sm"
            >
              取消
            </Button>
            <Button
              @click="createNoteWithHighlight"
              variant="primary"
              size="sm"
              :disabled="!noteText.trim()"
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 箭头指示器 -->
    <div class="absolute top-full left-1/2 transform -translate-x-1/2">
      <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 -mt-px"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '../atoms/Button.vue'

interface Props {
  visible: boolean
  position: { x: number; y: number }
}

interface Emits {
  (e: 'create-highlight', color: string): void
  (e: 'create-note', noteText: string, color?: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const selectedColor = ref('#fef08a') // 默认黄色
const showNoteInput = ref(false)
const noteText = ref('')

// 高亮颜色选项
const highlightColors = [
  { name: '黄色', value: '#fef08a' },
  { name: '绿色', value: '#bbf7d0' },
  { name: '蓝色', value: '#bfdbfe' },
  { name: '紫色', value: '#e9d5ff' },
  { name: '粉色', value: '#fce7f3' },
  { name: '橙色', value: '#fed7aa' },
  { name: '红色', value: '#fecaca' },
  { name: '灰色', value: '#e5e7eb' }
]

// 方法
const selectColor = (color: string) => {
  selectedColor.value = color
}

const createHighlight = () => {
  if (selectedColor.value) {
    emit('create-highlight', selectedColor.value)
  }
}

const createNoteWithHighlight = () => {
  if (noteText.value.trim()) {
    emit('create-note', noteText.value.trim(), selectedColor.value)
    noteText.value = ''
    showNoteInput.value = false
  }
}

// 监听visible变化，重置状态
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    showNoteInput.value = false
    noteText.value = ''
  }
})
</script>

<style scoped>
.highlight-toolbar {
  position: fixed;
  z-index: 1000;
  pointer-events: auto;
}

.highlight-toolbar::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
</style>
