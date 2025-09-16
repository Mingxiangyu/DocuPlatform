<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div :class="['card-body', `padding-${padding}`]">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'md',
  shadow: 'md',
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = ['bg-white', 'transition-all', 'duration-200']

  // 变体样式
  const variantClasses = {
    default: ['border', 'border-gray-200'],
    elevated: [],
    outlined: ['border-2', 'border-gray-300'],
    filled: ['bg-gray-50', 'border', 'border-gray-200']
  }

  // 圆角样式
  const roundedClasses = {
    none: [],
    sm: ['rounded-sm'],
    md: ['rounded-md'],
    lg: ['rounded-lg'],
    xl: ['rounded-xl']
  }

  // 阴影样式
  const shadowClasses = {
    none: [],
    sm: ['shadow-sm'],
    md: ['shadow'],
    lg: ['shadow-lg'],
    xl: ['shadow-xl']
  }

  // 悬停效果
  const hoverClasses = props.hover
    ? ['hover:shadow-lg', 'hover:-translate-y-1', 'cursor-pointer']
    : []

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...roundedClasses[props.rounded],
    ...shadowClasses[props.shadow],
    ...hoverClasses
  ]
})
</script>

<style scoped>
.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply p-6;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}

/* 动态padding支持 */
.card-body.padding-none { @apply p-0; }
.card-body.padding-sm { @apply p-3; }
.card-body.padding-md { @apply p-6; }
.card-body.padding-lg { @apply p-8; }
</style>
