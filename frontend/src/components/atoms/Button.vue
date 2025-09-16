<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-if="!loading" />
    <span v-if="loading">{{ loadingText }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingText: '加载中...',
  type: 'button',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ]

  // 尺寸样式
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-base'],
    lg: ['px-6', 'py-3', 'text-lg']
  }

  // 变体样式
  const variantClasses = {
    primary: [
      'bg-purple-600',
      'text-white',
      'hover:bg-purple-700',
      'focus:ring-purple-500'
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500'
    ],
    outline: [
      'border',
      'border-purple-600',
      'text-purple-600',
      'bg-transparent',
      'hover:bg-purple-50',
      'focus:ring-purple-500'
    ],
    ghost: [
      'text-purple-600',
      'bg-transparent',
      'hover:bg-purple-50',
      'focus:ring-purple-500'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500'
    ]
  }

  const classes = [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant]
  ]

  if (props.fullWidth) {
    classes.push('w-full')
  }

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2;
}
</style>
