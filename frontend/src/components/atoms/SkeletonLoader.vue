<template>
  <div 
    :class="[
      'skeleton-loader',
      `skeleton-${variant}`,
      {
        'skeleton-animated': animated,
        'skeleton-rounded': rounded
      },
      customClass
    ]"
    :style="customStyle"
  >
    <div v-if="variant === 'text'" class="skeleton-lines">
      <div 
        v-for="line in lines" 
        :key="line"
        class="skeleton-line"
        :class="{ 'skeleton-line-last': line === lines }"
      />
    </div>
    
    <div v-else-if="variant === 'card'" class="skeleton-card">
      <div v-if="showAvatar" class="skeleton-avatar" />
      <div class="skeleton-content">
        <div class="skeleton-title" />
        <div class="skeleton-description" />
        <div v-if="showActions" class="skeleton-actions">
          <div class="skeleton-button" />
          <div class="skeleton-button" />
        </div>
      </div>
    </div>
    
    <div v-else-if="variant === 'list'" class="skeleton-list">
      <div 
        v-for="item in count" 
        :key="item"
        class="skeleton-list-item"
      >
        <div v-if="showAvatar" class="skeleton-avatar skeleton-avatar-sm" />
        <div class="skeleton-list-content">
          <div class="skeleton-list-title" />
          <div class="skeleton-list-subtitle" />
        </div>
      </div>
    </div>
    
    <div v-else-if="variant === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div 
          v-for="col in columns" 
          :key="col"
          class="skeleton-table-header-cell"
        />
      </div>
      <div 
        v-for="row in rows" 
        :key="row"
        class="skeleton-table-row"
      >
        <div 
          v-for="col in columns" 
          :key="col"
          class="skeleton-table-cell"
        />
      </div>
    </div>
    
    <!-- 默认矩形骨架 -->
    <div v-else class="skeleton-rect" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'rect' | 'circle' | 'text' | 'card' | 'list' | 'table'
  width?: string | number
  height?: string | number
  lines?: number
  count?: number
  columns?: number
  rows?: number
  animated?: boolean
  rounded?: boolean
  showAvatar?: boolean
  showActions?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rect',
  width: '100%',
  height: '20px',
  lines: 3,
  count: 3,
  columns: 4,
  rows: 5,
  animated: true,
  rounded: false,
  showAvatar: false,
  showActions: false,
  customClass: ''
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.variant === 'rect' || props.variant === 'circle') {
    if (typeof props.width === 'number') {
      style.width = `${props.width}px`
    } else {
      style.width = props.width
    }
    
    if (typeof props.height === 'number') {
      style.height = `${props.height}px`
    } else {
      style.height = props.height
    }
  }
  
  return style
})
</script>

<style scoped>
.skeleton-loader {
  @apply relative overflow-hidden;
}

.skeleton-animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: skeleton-loading 1.5s infinite;
  z-index: 1;
}

@keyframes skeleton-loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 基础形状 */
.skeleton-rect {
  @apply bg-gray-200 dark:bg-gray-700;
}

.skeleton-circle {
  @apply bg-gray-200 dark:bg-gray-700 rounded-full;
}

.skeleton-rounded .skeleton-rect {
  @apply rounded-md;
}

/* 文本骨架 */
.skeleton-text .skeleton-lines {
  @apply space-y-2;
}

.skeleton-line {
  @apply h-4 bg-gray-200 dark:bg-gray-700 rounded;
}

.skeleton-line-last {
  @apply w-3/4;
}

/* 卡片骨架 */
.skeleton-card {
  @apply flex space-x-4 p-4;
}

.skeleton-avatar {
  @apply w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0;
}

.skeleton-avatar-sm {
  @apply w-8 h-8;
}

.skeleton-content {
  @apply flex-1 space-y-3;
}

.skeleton-title {
  @apply h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4;
}

.skeleton-description {
  @apply h-4 bg-gray-200 dark:bg-gray-700 rounded w-full;
}

.skeleton-actions {
  @apply flex space-x-2 pt-2;
}

.skeleton-button {
  @apply h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded;
}

/* 列表骨架 */
.skeleton-list {
  @apply space-y-3;
}

.skeleton-list-item {
  @apply flex items-center space-x-3 p-3;
}

.skeleton-list-content {
  @apply flex-1 space-y-2;
}

.skeleton-list-title {
  @apply h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3;
}

.skeleton-list-subtitle {
  @apply h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2;
}

/* 表格骨架 */
.skeleton-table {
  @apply w-full;
}

.skeleton-table-header {
  @apply flex space-x-4 p-4 border-b border-gray-200 dark:border-gray-700;
}

.skeleton-table-header-cell {
  @apply h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1;
}

.skeleton-table-row {
  @apply flex space-x-4 p-4 border-b border-gray-100 dark:border-gray-800;
}

.skeleton-table-cell {
  @apply h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .skeleton-card {
    @apply flex-col space-x-0 space-y-3;
  }
  
  .skeleton-list-item {
    @apply flex-col items-start space-x-0 space-y-2;
  }
  
  .skeleton-table-header,
  .skeleton-table-row {
    @apply space-x-2 p-2;
  }
}

/* 暗色主题优化 */
@media (prefers-color-scheme: dark) {
  .skeleton-animated::before {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-animated::before {
    animation: none;
  }
}
</style>
