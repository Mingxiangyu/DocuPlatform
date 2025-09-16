<!--
  设计系统输入框组件 - DSInput
  基于设计令牌的完整输入框系统，支持多种状态和高级焦点效果
-->

<template>
  <div class="ds-input-wrapper" :class="wrapperClasses">
    <!-- 标签 -->
    <label 
      v-if="label" 
      :for="inputId" 
      class="ds-input-label"
      :class="labelClasses"
      :style="labelStyles"
    >
      {{ label }}
      <span v-if="required" class="required-indicator" :style="requiredStyles">*</span>
    </label>
    
    <!-- 输入框容器 -->
    <div class="ds-input-container" :class="containerClasses">
      <!-- 前缀图标 -->
      <div 
        v-if="$slots.prefix" 
        class="input-prefix"
        :class="prefixClasses"
        :style="prefixStyles"
      >
        <slot name="prefix" />
      </div>
      
      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :class="inputClasses"
        :style="inputStyles"
        :aria-invalid="!!error"
        :aria-describedby="ariaDescribedby"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      />
      
      <!-- 后缀图标 -->
      <div 
        v-if="$slots.suffix || showClearButton" 
        class="input-suffix"
        :class="suffixClasses"
        :style="suffixStyles"
      >
        <!-- 清除按钮 -->
        <button
          v-if="showClearButton"
          type="button"
          class="clear-button"
          :style="clearButtonStyles"
          @click="handleClear"
          :aria-label="clearButtonLabel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <slot name="suffix" />
      </div>
      
      <!-- 加载指示器 -->
      <div 
        v-if="loading" 
        class="input-loading"
        :style="loadingStyles"
      >
        <div class="loading-spinner"></div>
      </div>
    </div>
    
    <!-- 帮助文本和错误信息 -->
    <div v-if="error || hint || showCharCount" class="ds-input-help" :style="helpStyles">
      <p v-if="error" class="error-text" :style="errorStyles">{{ error }}</p>
      <p v-else-if="hint" class="hint-text" :style="hintStyles">{{ hint }}</p>
      
      <!-- 字符计数 -->
      <div v-if="showCharCount" class="char-count" :style="charCountStyles">
        {{ currentLength }}<span v-if="maxlength">/{{ maxlength }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 组件属性接口
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'filled' | 'outlined' | 'underlined'
  loading?: boolean
  clearable?: boolean
  showCharCount?: boolean
  autocomplete?: string
  maxlength?: number
  minlength?: number
  min?: number | string
  max?: number | string
  step?: number | string
  pattern?: string
  clearButtonLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
  variant: 'default',
  loading: false,
  clearable: false,
  showCharCount: false,
  clearButtonLabel: '清除'
})

// 事件定义
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
  clear: []
}>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 引用和状态
const inputRef = ref<HTMLInputElement | null>(null)
const inputId = ref(`ds-input-${Math.random().toString(36).substr(2, 9)}`)
const isFocused = ref(false)

// 计算属性
const currentLength = computed(() => String(props.modelValue).length)
const showClearButton = computed(() => 
  props.clearable && 
  !props.disabled && 
  !props.readonly && 
  currentLength.value > 0
)

const ariaDescribedby = computed(() => {
  const ids = []
  if (props.error) ids.push(`${inputId.value}-error`)
  if (props.hint) ids.push(`${inputId.value}-hint`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

// 样式计算
const wrapperClasses = computed(() => [
  'ds-input-wrapper',
  `ds-input-size-${props.size}`,
  `ds-input-variant-${props.variant}`,
  {
    'ds-input-disabled': props.disabled,
    'ds-input-readonly': props.readonly,
    'ds-input-error': !!props.error,
    'ds-input-focused': isFocused.value,
    'ds-input-loading': props.loading
  }
])

const containerClasses = computed(() => [
  'relative',
  'flex',
  'items-center',
  'transition-all',
  'duration-200',
  'ease-out'
])

const inputClasses = computed(() => {
  const baseClasses = [
    'ds-input',
    'block',
    'w-full',
    'border-0',
    'bg-transparent',
    'text-gray-900',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-0',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'dark:text-white',
    'dark:placeholder-gray-500'
  ]

  // 尺寸类
  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-3', 'py-2', 'text-base'],
    lg: ['px-4', 'py-3', 'text-lg'],
    xl: ['px-5', 'py-4', 'text-xl']
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size]
  ]
})

const inputStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 根据前缀和后缀调整padding
  if (props.$slots?.prefix) {
    styles.paddingLeft = getSpacing(10)
  }
  
  if (props.$slots?.suffix || showClearButton.value || props.loading) {
    styles.paddingRight = getSpacing(10)
  }
  
  return styles
})

const labelClasses = computed(() => [
  'block',
  'text-sm',
  'font-medium',
  'mb-1',
  'transition-colors',
  'duration-200'
])

const labelStyles = computed(() => ({
  color: props.error 
    ? getColor('error.600')
    : isFocused.value 
      ? getColor('primary.600')
      : getColor('gray.700')
}))

const requiredStyles = computed(() => ({
  color: getColor('error.500')
}))

// 容器样式
const containerStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 变体样式
  switch (props.variant) {
    case 'default':
      styles.backgroundColor = 'white'
      styles.border = `1px solid ${props.error ? getColor('error.300') : getColor('gray.300')}`
      styles.borderRadius = tokens.borderRadius.md
      if (isFocused.value) {
        styles.borderColor = getColor('primary.500')
        styles.boxShadow = `0 0 0 3px ${getColor('primary.100')}`
      }
      break
      
    case 'filled':
      styles.backgroundColor = getColor('gray.50')
      styles.border = `1px solid transparent`
      styles.borderRadius = tokens.borderRadius.md
      if (isFocused.value) {
        styles.backgroundColor = 'white'
        styles.borderColor = getColor('primary.500')
        styles.boxShadow = `0 0 0 3px ${getColor('primary.100')}`
      }
      break
      
    case 'outlined':
      styles.backgroundColor = 'transparent'
      styles.border = `2px solid ${props.error ? getColor('error.300') : getColor('gray.300')}`
      styles.borderRadius = tokens.borderRadius.md
      if (isFocused.value) {
        styles.borderColor = getColor('primary.500')
      }
      break
      
    case 'underlined':
      styles.backgroundColor = 'transparent'
      styles.borderBottom = `2px solid ${props.error ? getColor('error.300') : getColor('gray.300')}`
      styles.borderRadius = '0'
      if (isFocused.value) {
        styles.borderBottomColor = getColor('primary.500')
      }
      break
  }
  
  return styles
})

// 前缀和后缀样式
const prefixClasses = computed(() => [
  'absolute',
  'left-0',
  'inset-y-0',
  'flex',
  'items-center',
  'pl-3',
  'pointer-events-none'
])

const prefixStyles = computed(() => ({
  color: getColor('gray.400')
}))

const suffixClasses = computed(() => [
  'absolute',
  'right-0',
  'inset-y-0',
  'flex',
  'items-center',
  'pr-3'
])

const suffixStyles = computed(() => ({
  color: getColor('gray.400')
}))

// 清除按钮样式
const clearButtonStyles = computed(() => ({
  color: getColor('gray.400'),
  padding: getSpacing(1),
  borderRadius: tokens.borderRadius.sm,
  transition: `color ${tokens.animations.duration.fast} ${tokens.animations.easing.smooth}`,
  ':hover': {
    color: getColor('gray.600')
  }
}))

// 加载样式
const loadingStyles = computed(() => ({
  position: 'absolute',
  right: getSpacing(3),
  top: '50%',
  transform: 'translateY(-50%)'
}))

// 帮助文本样式
const helpStyles = computed(() => ({
  marginTop: getSpacing(1),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
}))

const errorStyles = computed(() => ({
  color: getColor('error.600'),
  fontSize: tokens.typography.fontSize.sm[0],
  margin: 0
}))

const hintStyles = computed(() => ({
  color: getColor('gray.500'),
  fontSize: tokens.typography.fontSize.sm[0],
  margin: 0
}))

const charCountStyles = computed(() => ({
  color: getColor('gray.400'),
  fontSize: tokens.typography.fontSize.xs[0],
  marginLeft: getSpacing(2)
}))

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 公开方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  inputRef
})
</script>

<style scoped>
.ds-input-wrapper {
  position: relative;
}

.ds-input-container {
  position: relative;
}

.ds-input {
  font-family: var(--font-sans);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(168, 85, 247, 0.2);
  border-top: 2px solid rgb(168, 85, 247);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-button:hover {
  color: rgb(75, 85, 99);
  transform: scale(1.1);
}

/* 动画关键帧 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .ds-input-size-lg,
  .ds-input-size-xl {
    font-size: 1rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ds-input-container,
  .ds-input-label,
  .clear-button {
    transition: none !important;
  }
  
  .loading-spinner {
    animation: none !important;
  }
}
</style>
