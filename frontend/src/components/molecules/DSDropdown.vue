<!--
  设计系统下拉菜单组件 - DSDropdown
  企业级下拉菜单组件，支持多种触发方式、位置和配置选项
-->

<template>
  <div
    class="dropdown"
    :style="dropdownStyles"
    @keydown="handleKeydown"
  >
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="dropdown-trigger"
      :style="triggerStyles"
      @click="handleTriggerClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focus="handleFocus"
      @blur="handleBlur"
      :tabindex="disabled ? -1 : 0"
      role="button"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-disabled="disabled"
    >
      <slot name="trigger" :isOpen="isOpen" :disabled="disabled">
        <button
          class="default-trigger"
          :style="getDefaultTriggerStyles()"
          :disabled="disabled"
        >
          <span>{{ triggerText }}</span>
          <svg
            class="trigger-icon"
            :style="getTriggerIconStyles()"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </slot>
    </div>

    <!-- 下拉菜单 -->
    <teleport to="body">
      <transition
        name="dropdown"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="isOpen"
          ref="menuRef"
          class="dropdown-menu"
          :style="menuStyles"
          role="menu"
          :aria-labelledby="triggerId"
        >
          <div class="menu-content" :style="menuContentStyles">
            <slot name="content" :close="close">
              <!-- 默认菜单项 -->
              <div
                v-for="(item, index) in items"
                :key="item.key || index"
                class="menu-item"
                :style="getMenuItemStyles(item)"
                @click="handleItemClick(item)"
                @mouseenter="handleItemHover(item, index)"
                role="menuitem"
                :tabindex="item.disabled ? -1 : 0"
                :aria-disabled="item.disabled"
              >
                <!-- 图标 -->
                <div
                  v-if="item.icon"
                  class="item-icon"
                  :style="itemIconStyles"
                >
                  <component :is="item.icon" />
                </div>

                <!-- 内容 -->
                <div class="item-content" :style="itemContentStyles">
                  <div class="item-label" :style="itemLabelStyles">
                    {{ item.label }}
                  </div>
                  <div
                    v-if="item.description"
                    class="item-description"
                    :style="itemDescriptionStyles"
                  >
                    {{ item.description }}
                  </div>
                </div>

                <!-- 快捷键 -->
                <div
                  v-if="item.shortcut"
                  class="item-shortcut"
                  :style="itemShortcutStyles"
                >
                  {{ item.shortcut }}
                </div>

                <!-- 子菜单指示器 -->
                <div
                  v-if="item.children"
                  class="item-arrow"
                  :style="itemArrowStyles"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- 分割线 -->
              <div
                v-for="(divider, index) in dividers"
                :key="`divider-${index}`"
                class="menu-divider"
                :style="menuDividerStyles"
                role="separator"
              ></div>
            </slot>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 菜单项接口
interface MenuItem {
  key?: string
  label: string
  description?: string
  icon?: any
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  children?: MenuItem[]
  handler?: () => void
}

// 位置类型
type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'

// 触发方式
type DropdownTrigger = 'click' | 'hover' | 'focus' | 'contextmenu'

// 组件属性
interface Props {
  // 基础属性
  items?: MenuItem[]
  triggerText?: string
  
  // 行为控制
  trigger?: DropdownTrigger[]
  placement?: DropdownPlacement
  disabled?: boolean
  closeOnClick?: boolean
  
  // 样式配置
  size?: 'sm' | 'md' | 'lg'
  maxHeight?: string
  minWidth?: string
  
  // 延迟配置
  openDelay?: number
  closeDelay?: number
  
  // 无障碍访问
  triggerId?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  triggerText: '选择',
  trigger: () => ['click'],
  placement: 'bottom-start',
  disabled: false,
  closeOnClick: true,
  size: 'md',
  maxHeight: '300px',
  minWidth: '200px',
  openDelay: 0,
  closeDelay: 100,
  triggerId: 'dropdown-trigger'
})

// 组件事件
interface Emits {
  (e: 'open'): void
  (e: 'close'): void
  (e: 'select', item: MenuItem): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()
const focusedIndex = ref(-1)
const openTimer = ref<NodeJS.Timeout>()
const closeTimer = ref<NodeJS.Timeout>()

// 分割线数据（示例）
const dividers = ref<number[]>([])

// 样式计算
const dropdownStyles = computed(() => ({
  position: 'relative',
  display: 'inline-block'
}))

const triggerStyles = computed(() => ({
  outline: 'none'
}))

const getDefaultTriggerStyles = () => {
  const sizeMap = {
    sm: {
      padding: `${getSpacing(1)} ${getSpacing(2)}`,
      fontSize: tokens.typography.fontSize.sm[0]
    },
    md: {
      padding: `${getSpacing(2)} ${getSpacing(3)}`,
      fontSize: tokens.typography.fontSize.base[0]
    },
    lg: {
      padding: `${getSpacing(3)} ${getSpacing(4)}`,
      fontSize: tokens.typography.fontSize.lg[0]
    }
  }
  
  const size = sizeMap[props.size]
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: getSpacing(2),
    width: '100%',
    ...size,
    backgroundColor: 'white',
    border: `1px solid ${getColor('gray.300')}`,
    borderRadius: tokens.borderRadius.md,
    color: props.disabled ? getColor('gray.400') : getColor('gray.700'),
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  }
}

const getTriggerIconStyles = () => ({
  transform: isOpen.value ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease',
  color: props.disabled ? getColor('gray.400') : getColor('gray.500')
})

const menuStyles = computed(() => {
  if (!triggerRef.value) return {}
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const placement = props.placement
  
  let top = 0
  let left = 0
  
  // 计算位置
  switch (placement) {
    case 'bottom-start':
      top = triggerRect.bottom + window.scrollY + 4
      left = triggerRect.left + window.scrollX
      break
    case 'bottom-end':
      top = triggerRect.bottom + window.scrollY + 4
      left = triggerRect.right + window.scrollX
      break
    case 'top-start':
      top = triggerRect.top + window.scrollY - 4
      left = triggerRect.left + window.scrollX
      break
    case 'top-end':
      top = triggerRect.top + window.scrollY - 4
      left = triggerRect.right + window.scrollX
      break
    case 'left-start':
      top = triggerRect.top + window.scrollY
      left = triggerRect.left + window.scrollX - 4
      break
    case 'left-end':
      top = triggerRect.bottom + window.scrollY
      left = triggerRect.left + window.scrollX - 4
      break
    case 'right-start':
      top = triggerRect.top + window.scrollY
      left = triggerRect.right + window.scrollX + 4
      break
    case 'right-end':
      top = triggerRect.bottom + window.scrollY
      left = triggerRect.right + window.scrollX + 4
      break
  }
  
  return {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '1000',
    minWidth: props.minWidth,
    maxHeight: props.maxHeight,
    backgroundColor: 'white',
    border: `1px solid ${getColor('gray.200')}`,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: getShadow('large'),
    overflow: 'hidden'
  }
})

const menuContentStyles = computed(() => ({
  maxHeight: props.maxHeight,
  overflow: 'auto',
  padding: getSpacing(1)
}))

const getMenuItemStyles = (item: MenuItem) => {
  const isDisabled = item.disabled
  const isFocused = props.items.indexOf(item) === focusedIndex.value
  
  return {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(3),
    padding: `${getSpacing(2)} ${getSpacing(3)}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm[0],
    color: isDisabled ? getColor('gray.400') : item.danger ? getColor('error.600') : getColor('gray.700'),
    backgroundColor: isFocused && !isDisabled ? getColor('gray.100') : 'transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  }
}

const itemIconStyles = computed(() => ({
  flexShrink: '0',
  width: '16px',
  height: '16px'
}))

const itemContentStyles = computed(() => ({
  flex: '1',
  minWidth: '0'
}))

const itemLabelStyles = computed(() => ({
  fontWeight: tokens.typography.fontWeight.medium,
  margin: '0'
}))

const itemDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.500'),
  marginTop: getSpacing(1),
  margin: `${getSpacing(1)} 0 0 0`
}))

const itemShortcutStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.500'),
  fontFamily: tokens.typography.fontFamily.mono.join(', ')
}))

const itemArrowStyles = computed(() => ({
  flexShrink: '0',
  color: getColor('gray.400')
}))

const menuDividerStyles = computed(() => ({
  height: '1px',
  backgroundColor: getColor('gray.200'),
  margin: `${getSpacing(1)} 0`
}))

// 事件处理
const open = () => {
  if (props.disabled || isOpen.value) return
  
  clearTimeout(closeTimer.value)
  
  if (props.openDelay > 0) {
    openTimer.value = setTimeout(() => {
      isOpen.value = true
      emit('open')
    }, props.openDelay)
  } else {
    isOpen.value = true
    emit('open')
  }
}

const close = () => {
  if (!isOpen.value) return
  
  clearTimeout(openTimer.value)
  
  if (props.closeDelay > 0) {
    closeTimer.value = setTimeout(() => {
      isOpen.value = false
      focusedIndex.value = -1
      emit('close')
    }, props.closeDelay)
  } else {
    isOpen.value = false
    focusedIndex.value = -1
    emit('close')
  }
}

const toggle = () => {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const handleTriggerClick = () => {
  if (props.trigger.includes('click')) {
    toggle()
  }
}

const handleMouseEnter = () => {
  if (props.trigger.includes('hover')) {
    open()
  }
}

const handleMouseLeave = () => {
  if (props.trigger.includes('hover')) {
    close()
  }
}

const handleFocus = () => {
  if (props.trigger.includes('focus')) {
    open()
  }
}

const handleBlur = () => {
  if (props.trigger.includes('focus')) {
    // 延迟关闭，允许用户点击菜单项
    setTimeout(() => {
      if (!menuRef.value?.contains(document.activeElement)) {
        close()
      }
    }, 100)
  }
}

const handleItemClick = (item: MenuItem) => {
  if (item.disabled) return
  
  emit('select', item)
  
  if (item.handler) {
    item.handler()
  }
  
  if (props.closeOnClick) {
    close()
  }
}

const handleItemHover = (item: MenuItem, index: number) => {
  if (!item.disabled) {
    focusedIndex.value = index
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
    return
  }
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      close()
      triggerRef.value?.focus()
      break
    case 'ArrowDown':
      event.preventDefault()
      focusNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPrevious()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (focusedIndex.value >= 0) {
        const item = props.items[focusedIndex.value]
        if (item && !item.disabled) {
          handleItemClick(item)
        }
      }
      break
  }
}

const focusNext = () => {
  const enabledItems = props.items.filter(item => !item.disabled)
  if (enabledItems.length === 0) return
  
  let nextIndex = focusedIndex.value + 1
  while (nextIndex < props.items.length && props.items[nextIndex].disabled) {
    nextIndex++
  }
  
  if (nextIndex >= props.items.length) {
    // 循环到第一个可用项
    nextIndex = props.items.findIndex(item => !item.disabled)
  }
  
  focusedIndex.value = nextIndex
}

const focusPrevious = () => {
  const enabledItems = props.items.filter(item => !item.disabled)
  if (enabledItems.length === 0) return
  
  let prevIndex = focusedIndex.value - 1
  while (prevIndex >= 0 && props.items[prevIndex].disabled) {
    prevIndex--
  }
  
  if (prevIndex < 0) {
    // 循环到最后一个可用项
    for (let i = props.items.length - 1; i >= 0; i--) {
      if (!props.items[i].disabled) {
        prevIndex = i
        break
      }
    }
  }
  
  focusedIndex.value = prevIndex
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Node
  if (
    isOpen.value &&
    triggerRef.value &&
    menuRef.value &&
    !triggerRef.value.contains(target) &&
    !menuRef.value.contains(target)
  ) {
    close()
  }
}

// 动画钩子
const onEnter = (el: Element) => {
  // 进入动画开始
}

const onAfterEnter = (el: Element) => {
  // 聚焦到菜单
  nextTick(() => {
    if (menuRef.value) {
      menuRef.value.focus()
    }
  })
}

const onLeave = (el: Element) => {
  // 离开动画开始
}

const onAfterLeave = (el: Element) => {
  // 动画完成
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(openTimer.value)
  clearTimeout(closeTimer.value)
})

// 暴露方法
defineExpose({
  open,
  close,
  toggle,
  isOpen: computed(() => isOpen.value)
})
</script>

<style scoped>
/* 下拉菜单动画 */
.dropdown-enter-active {
  transition: all 0.2s ease;
}

.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 交互样式 */
.default-trigger:hover:not(:disabled) {
  border-color: var(--color-primary-300);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.default-trigger:focus:not(:disabled) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.menu-item:hover:not([aria-disabled="true"]) {
  background-color: var(--color-gray-100);
}

.menu-item[aria-disabled="true"] {
  opacity: 0.5;
}

.menu-item.danger:hover:not([aria-disabled="true"]) {
  background-color: var(--color-error-50);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .dropdown-menu {
    left: 1rem !important;
    right: 1rem !important;
    min-width: auto !important;
    max-width: calc(100vw - 2rem) !important;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .dropdown-enter-active,
  .dropdown-leave-active,
  .default-trigger,
  .menu-item {
    transition: none !important;
    animation: none !important;
  }
  
  .trigger-icon {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .default-trigger,
  .dropdown-menu {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .dropdown-menu {
    display: none;
  }
}
</style>
