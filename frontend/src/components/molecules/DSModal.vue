<!--
  设计系统模态框组件 - DSModal
  企业级模态框组件，支持多种尺寸、样式和配置选项
-->

<template>
  <teleport to="body">
    <transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        class="modal-overlay"
        :style="overlayStyles"
        @click="handleOverlayClick"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
      >
        <div
          class="modal-container"
          :style="containerStyles"
          @click.stop
        >
          <!-- 模态框内容 -->
          <div class="modal-content" :style="contentStyles">
            <!-- 头部 -->
            <div
              v-if="showHeader"
              class="modal-header"
              :style="headerStyles"
            >
              <div class="header-content" :style="headerContentStyles">
                <!-- 图标 -->
                <div
                  v-if="icon"
                  class="modal-icon"
                  :style="getIconStyles()"
                >
                  <component :is="icon" />
                </div>
                
                <!-- 标题和描述 -->
                <div class="title-section" :style="titleSectionStyles">
                  <h2
                    v-if="title"
                    :id="titleId"
                    class="modal-title"
                    :style="titleStyles"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    class="modal-description"
                    :style="descriptionStyles"
                  >
                    {{ description }}
                  </p>
                </div>
              </div>
              
              <!-- 关闭按钮 -->
              <button
                v-if="showCloseButton"
                class="close-button"
                :style="closeButtonStyles"
                @click="handleClose"
                :aria-label="closeLabel"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- 主体内容 -->
            <div
              :id="contentId"
              class="modal-body"
              :style="bodyStyles"
            >
              <slot>
                <div v-if="content" v-html="content"></div>
              </slot>
            </div>

            <!-- 底部操作区 -->
            <div
              v-if="showFooter || $slots.footer"
              class="modal-footer"
              :style="footerStyles"
            >
              <slot name="footer">
                <div class="footer-actions" :style="footerActionsStyles">
                  <!-- 取消按钮 -->
                  <button
                    v-if="showCancelButton"
                    class="cancel-button"
                    :style="getCancelButtonStyles()"
                    @click="handleCancel"
                    :disabled="loading"
                  >
                    {{ cancelText }}
                  </button>
                  
                  <!-- 确认按钮 -->
                  <button
                    v-if="showConfirmButton"
                    class="confirm-button"
                    :style="getConfirmButtonStyles()"
                    @click="handleConfirm"
                    :disabled="loading || confirmDisabled"
                  >
                    <div v-if="loading" class="loading-spinner" :style="loadingSpinnerStyles">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75" />
                      </svg>
                    </div>
                    <span>{{ loading ? loadingText : confirmText }}</span>
                  </button>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 组件属性
interface Props {
  // 基础属性
  modelValue?: boolean
  title?: string
  description?: string
  content?: string
  
  // 尺寸和样式
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
  
  // 显示控制
  showHeader?: boolean
  showFooter?: boolean
  showCloseButton?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  
  // 行为控制
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
  loading?: boolean
  confirmDisabled?: boolean
  
  // 文本配置
  confirmText?: string
  cancelText?: string
  loadingText?: string
  closeLabel?: string
  
  // 图标
  icon?: any
  
  // 无障碍访问
  titleId?: string
  contentId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  variant: 'default',
  showHeader: true,
  showFooter: true,
  showCloseButton: true,
  showCancelButton: true,
  showConfirmButton: true,
  closeOnOverlay: true,
  closeOnEscape: true,
  persistent: false,
  loading: false,
  confirmDisabled: false,
  confirmText: '确认',
  cancelText: '取消',
  loadingText: '处理中...',
  closeLabel: '关闭',
  titleId: 'modal-title',
  contentId: 'modal-content'
})

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
  (e: 'opened'): void
  (e: 'closed'): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 样式计算
const overlayStyles = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(4),
  zIndex: '1000',
  backdropFilter: 'blur(4px)'
}))

const containerStyles = computed(() => {
  const sizeMap = {
    xs: { maxWidth: '320px', width: '100%' },
    sm: { maxWidth: '400px', width: '100%' },
    md: { maxWidth: '500px', width: '100%' },
    lg: { maxWidth: '700px', width: '100%' },
    xl: { maxWidth: '900px', width: '100%' },
    full: { maxWidth: '95vw', width: '95vw', height: '95vh' }
  }
  
  const size = sizeMap[props.size]
  
  return {
    ...size,
    maxHeight: props.size === 'full' ? '95vh' : '90vh',
    backgroundColor: 'white',
    borderRadius: tokens.borderRadius.lg,
    boxShadow: getShadow('large'),
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }
})

const contentStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}))

const headerStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: getSpacing(6),
  borderBottom: `1px solid ${getColor('gray.200')}`,
  flexShrink: '0'
}))

const headerContentStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: getSpacing(3),
  flex: '1',
  minWidth: '0'
}))

const getIconStyles = () => {
  const variantColors = {
    default: getColor('primary.600'),
    danger: getColor('error.600'),
    warning: getColor('warning.600'),
    success: getColor('success.600'),
    info: getColor('info.600')
  }
  
  return {
    flexShrink: '0',
    color: variantColors[props.variant],
    width: '24px',
    height: '24px'
  }
}

const titleSectionStyles = computed(() => ({
  flex: '1',
  minWidth: '0'
}))

const titleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  marginBottom: props.description ? getSpacing(1) : '0',
  margin: props.description ? '0 0 0.25rem 0' : '0',
  wordWrap: 'break-word'
}))

const descriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  lineHeight: tokens.typography.lineHeight.relaxed,
  margin: '0',
  wordWrap: 'break-word'
}))

const closeButtonStyles = computed(() => ({
  flexShrink: '0',
  padding: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.400'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease',
  marginLeft: getSpacing(2)
}))

const bodyStyles = computed(() => ({
  flex: '1',
  padding: getSpacing(6),
  overflow: 'auto',
  fontSize: tokens.typography.fontSize.base[0],
  lineHeight: tokens.typography.lineHeight.relaxed,
  color: getColor('gray.700')
}))

const footerStyles = computed(() => ({
  flexShrink: '0',
  padding: getSpacing(6),
  borderTop: `1px solid ${getColor('gray.200')}`,
  backgroundColor: getColor('gray.50')
}))

const footerActionsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: getSpacing(3)
}))

const getCancelButtonStyles = () => ({
  padding: `${getSpacing(2)} ${getSpacing(4)}`,
  backgroundColor: 'white',
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.700'),
  cursor: props.loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  opacity: props.loading ? '0.6' : '1'
})

const getConfirmButtonStyles = () => {
  const variantColors = {
    default: getColor('primary.600'),
    danger: getColor('error.600'),
    warning: getColor('warning.600'),
    success: getColor('success.600'),
    info: getColor('info.600')
  }
  
  const isDisabled = props.loading || props.confirmDisabled
  
  return {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(2),
    padding: `${getSpacing(2)} ${getSpacing(4)}`,
    backgroundColor: isDisabled ? getColor('gray.300') : variantColors[props.variant],
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm[0],
    fontWeight: tokens.typography.fontWeight.medium,
    color: 'white',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease'
  }
}

const loadingSpinnerStyles = computed(() => ({
  animation: 'spin 1s linear infinite'
}))

// 事件处理
const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.persistent) {
    handleClose()
  }
}

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
    if (!props.persistent) {
      emit('update:modelValue', false)
    }
  }
}

const handleConfirm = () => {
  if (!props.loading && !props.confirmDisabled) {
    emit('confirm')
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && !props.persistent) {
    handleClose()
  }
}

// 动画钩子
const onEnter = (el: Element) => {
  // 进入动画开始
}

const onAfterEnter = (el: Element) => {
  emit('opened')
}

const onLeave = (el: Element) => {
  // 离开动画开始
}

const onAfterLeave = (el: Element) => {
  emit('closed')
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// 监听模态框状态变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // 阻止背景滚动
    document.body.style.overflow = 'hidden'
    // 聚焦到模态框
    nextTick(() => {
      const modal = document.querySelector('.modal-container') as HTMLElement
      if (modal) {
        modal.focus()
      }
    })
  } else {
    // 恢复背景滚动
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 模态框动画 */
.modal-enter-active {
  transition: all 0.3s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1) translateY(0);
}

.modal-container {
  transition: transform 0.3s ease;
}

/* 交互样式 */
.close-button:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
}

.cancel-button:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.confirm-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .footer-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-button,
  .confirm-button {
    width: 100%;
    justify-content: center;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-container,
  .close-button,
  .cancel-button,
  .confirm-button {
    transition: none !important;
    animation: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .modal-content {
    border: 2px solid currentColor;
  }
  
  .cancel-button,
  .confirm-button {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .modal-overlay {
    display: none;
  }
}
</style>
