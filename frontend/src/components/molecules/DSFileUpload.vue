<!--
  设计系统文件上传组件 - DSFileUpload
  企业级文件上传组件，支持拖拽、多文件、进度显示、预览等功能
-->

<template>
  <div class="file-upload" :style="uploadStyles">
    <!-- 上传区域 -->
    <div
      ref="dropZoneRef"
      class="upload-zone"
      :style="getUploadZoneStyles()"
      :class="uploadZoneClasses"
      @click="handleZoneClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileSelect"
        style="display: none"
      />

      <!-- 上传区域内容 -->
      <div class="upload-content" :style="uploadContentStyles">
        <slot name="upload-area" :isDragging="isDragging" :disabled="disabled">
          <!-- 图标 -->
          <div class="upload-icon" :style="uploadIconStyles">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- 文本 -->
          <div class="upload-text" :style="uploadTextStyles">
            <p class="upload-title" :style="uploadTitleStyles">
              {{ isDragging ? dragText : uploadText }}
            </p>
            <p class="upload-hint" :style="uploadHintStyles">
              {{ hintText }}
            </p>
          </div>

          <!-- 上传按钮 -->
          <button
            v-if="showButton"
            class="upload-button"
            :style="uploadButtonStyles"
            :disabled="disabled"
            @click.stop="handleButtonClick"
          >
            {{ buttonText }}
          </button>
        </slot>
      </div>
    </div>

    <!-- 文件列表 -->
    <div
      v-if="showFileList && fileList.length > 0"
      class="file-list"
      :style="fileListStyles"
    >
      <div class="file-list-header" :style="fileListHeaderStyles">
        <span class="list-title" :style="listTitleStyles">
          已选择文件 ({{ fileList.length }})
        </span>
        <button
          v-if="clearable"
          class="clear-button"
          :style="clearButtonStyles"
          @click="handleClearAll"
        >
          清空
        </button>
      </div>

      <div class="file-items" :style="fileItemsStyles">
        <div
          v-for="(file, index) in fileList"
          :key="file.id"
          class="file-item"
          :style="getFileItemStyles(file)"
        >
          <!-- 文件图标 -->
          <div class="file-icon" :style="fileIconStyles">
            <component :is="getFileIcon(file)" />
          </div>

          <!-- 文件信息 -->
          <div class="file-info" :style="fileInfoStyles">
            <div class="file-name" :style="fileNameStyles">
              {{ file.name }}
            </div>
            <div class="file-meta" :style="fileMetaStyles">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span v-if="file.status" class="file-status" :style="getFileStatusStyles(file)">
                {{ getStatusText(file.status) }}
              </span>
            </div>

            <!-- 进度条 -->
            <div
              v-if="file.status === 'uploading' && file.progress !== undefined"
              class="file-progress"
              :style="fileProgressStyles"
            >
              <div
                class="progress-bar"
                :style="getProgressBarStyles(file.progress)"
              ></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions" :style="fileActionsStyles">
            <!-- 预览按钮 -->
            <button
              v-if="previewable && isPreviewable(file)"
              class="action-button preview-button"
              :style="actionButtonStyles"
              @click="handlePreview(file)"
              title="预览"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- 删除按钮 -->
            <button
              class="action-button remove-button"
              :style="removeButtonStyles"
              @click="handleRemove(file, index)"
              title="删除"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误信息 -->
    <div
      v-if="errorMessage"
      class="error-message"
      :style="errorMessageStyles"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useDesignTokens } from '../../design-system/composables'

// 文件状态
type FileStatus = 'pending' | 'uploading' | 'success' | 'error'

// 文件接口
interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  status?: FileStatus
  progress?: number
  url?: string
  error?: string
}

// 组件属性
interface Props {
  // 基础配置
  multiple?: boolean
  accept?: string
  maxSize?: number
  maxCount?: number
  
  // 功能配置
  disabled?: boolean
  draggable?: boolean
  showFileList?: boolean
  previewable?: boolean
  clearable?: boolean
  showButton?: boolean
  
  // 文本配置
  uploadText?: string
  dragText?: string
  hintText?: string
  buttonText?: string
  
  // 样式配置
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dashed' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  maxCount: 10,
  disabled: false,
  draggable: true,
  showFileList: true,
  previewable: true,
  clearable: true,
  showButton: true,
  uploadText: '点击或拖拽文件到此区域上传',
  dragText: '释放文件开始上传',
  hintText: '支持单个或批量上传',
  buttonText: '选择文件',
  size: 'md',
  variant: 'default'
})

// 组件事件
interface Emits {
  (e: 'change', files: UploadFile[]): void
  (e: 'remove', file: UploadFile, index: number): void
  (e: 'preview', file: UploadFile): void
  (e: 'error', error: string): void
  (e: 'exceed', files: File[]): void
}

const emit = defineEmits<Emits>()

// 设计令牌
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const fileList = ref<UploadFile[]>([])
const isDragging = ref(false)
const errorMessage = ref('')
const dropZoneRef = ref<HTMLElement>()
const fileInputRef = ref<HTMLInputElement>()

// 计算属性
const uploadZoneClasses = computed(() => [
  'upload-zone',
  {
    'is-dragging': isDragging.value,
    'is-disabled': props.disabled
  }
])

// 样式计算
const uploadStyles = computed(() => ({
  width: '100%'
}))

const getUploadZoneStyles = () => {
  const sizeMap = {
    sm: { padding: getSpacing(4), minHeight: '120px' },
    md: { padding: getSpacing(6), minHeight: '160px' },
    lg: { padding: getSpacing(8), minHeight: '200px' }
  }
  
  const variantMap = {
    default: {
      border: `2px solid ${getColor('gray.300')}`,
      backgroundColor: getColor('gray.50')
    },
    dashed: {
      border: `2px dashed ${getColor('gray.300')}`,
      backgroundColor: 'white'
    },
    minimal: {
      border: `1px solid ${getColor('gray.200')}`,
      backgroundColor: 'white'
    }
  }
  
  const size = sizeMap[props.size]
  const variant = variantMap[props.variant]
  
  return {
    ...size,
    ...variant,
    borderRadius: tokens.borderRadius.lg,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: props.disabled ? '0.6' : '1',
    borderColor: isDragging.value ? getColor('primary.500') : variant.border.split(' ')[2],
    backgroundColor: isDragging.value ? getColor('primary.50') : variant.backgroundColor
  }
}

const uploadContentStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: getSpacing(4),
  textAlign: 'center'
}))

const uploadIconStyles = computed(() => ({
  color: isDragging.value ? getColor('primary.600') : getColor('gray.400'),
  transition: 'color 0.2s ease'
}))

const uploadTextStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(2)
}))

const uploadTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900'),
  margin: '0'
}))

const uploadHintStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.500'),
  margin: '0'
}))

const uploadButtonStyles = computed(() => ({
  padding: `${getSpacing(2)} ${getSpacing(4)}`,
  backgroundColor: getColor('primary.600'),
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease'
}))

const fileListStyles = computed(() => ({
  marginTop: getSpacing(4),
  border: `1px solid ${getColor('gray.200')}`,
  borderRadius: tokens.borderRadius.lg,
  overflow: 'hidden'
}))

const fileListHeaderStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: getSpacing(3),
  backgroundColor: getColor('gray.50'),
  borderBottom: `1px solid ${getColor('gray.200')}`
}))

const listTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900')
}))

const clearButtonStyles = computed(() => ({
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  backgroundColor: 'transparent',
  color: getColor('error.600'),
  border: `1px solid ${getColor('error.300')}`,
  borderRadius: tokens.borderRadius.sm,
  fontSize: tokens.typography.fontSize.xs[0],
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

const fileItemsStyles = computed(() => ({
  maxHeight: '300px',
  overflow: 'auto'
}))

const getFileItemStyles = (file: UploadFile) => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  padding: getSpacing(3),
  borderBottom: `1px solid ${getColor('gray.100')}`,
  transition: 'background-color 0.2s ease'
})

const fileIconStyles = computed(() => ({
  flexShrink: '0',
  width: '32px',
  height: '32px',
  color: getColor('primary.600')
}))

const fileInfoStyles = computed(() => ({
  flex: '1',
  minWidth: '0'
}))

const fileNameStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900'),
  marginBottom: getSpacing(1),
  wordBreak: 'break-all'
}))

const fileMetaStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  fontSize: tokens.typography.fontSize.xs[0],
  color: getColor('gray.500')
}))

const getFileStatusStyles = (file: UploadFile) => {
  const statusColors = {
    pending: getColor('gray.500'),
    uploading: getColor('primary.600'),
    success: getColor('success.600'),
    error: getColor('error.600')
  }
  
  return {
    color: statusColors[file.status || 'pending']
  }
}

const fileProgressStyles = computed(() => ({
  marginTop: getSpacing(2),
  height: '4px',
  backgroundColor: getColor('gray.200'),
  borderRadius: tokens.borderRadius.full,
  overflow: 'hidden'
}))

const getProgressBarStyles = (progress: number) => ({
  height: '100%',
  backgroundColor: getColor('primary.600'),
  width: `${progress}%`,
  transition: 'width 0.3s ease'
})

const fileActionsStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1)
}))

const actionButtonStyles = computed(() => ({
  padding: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.500'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease'
}))

const removeButtonStyles = computed(() => ({
  ...actionButtonStyles.value,
  color: getColor('error.500')
}))

const errorMessageStyles = computed(() => ({
  marginTop: getSpacing(2),
  padding: getSpacing(2),
  backgroundColor: getColor('error.50'),
  color: getColor('error.700'),
  border: `1px solid ${getColor('error.200')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0]
}))

// 工具函数
const generateFileId = () => {
  return Math.random().toString(36).substr(2, 9)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: UploadFile) => {
  const type = file.type.toLowerCase()
  
  if (type.startsWith('image/')) {
    return {
      template: '<svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>'
    }
  }
  
  if (type.includes('pdf')) {
    return {
      template: '<svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" /></svg>'
    }
  }
  
  return {
    template: '<svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>'
  }
}

const getStatusText = (status: FileStatus) => {
  const statusMap = {
    pending: '等待上传',
    uploading: '上传中',
    success: '上传成功',
    error: '上传失败'
  }
  return statusMap[status]
}

const isPreviewable = (file: UploadFile) => {
  return file.type.startsWith('image/')
}

const validateFile = (file: File) => {
  // 检查文件大小
  if (file.size > props.maxSize) {
    return `文件大小不能超过 ${formatFileSize(props.maxSize)}`
  }
  
  // 检查文件类型
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const isValidType = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })
    
    if (!isValidType) {
      return `不支持的文件类型`
    }
  }
  
  return null
}

// 事件处理
const handleZoneClick = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}

const handleButtonClick = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
  target.value = '' // 清空input值，允许重复选择同一文件
}

const handleDragOver = (event: DragEvent) => {
  if (!props.disabled && props.draggable) {
    isDragging.value = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  
  if (props.disabled || !props.draggable) return
  
  const files = Array.from(event.dataTransfer?.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  errorMessage.value = ''
  
  // 检查文件数量限制
  const totalCount = fileList.value.length + files.length
  if (totalCount > props.maxCount) {
    emit('exceed', files)
    errorMessage.value = `最多只能上传 ${props.maxCount} 个文件`
    return
  }
  
  const validFiles: UploadFile[] = []
  
  for (const file of files) {
    const error = validateFile(file)
    if (error) {
      emit('error', error)
      errorMessage.value = error
      continue
    }
    
    const uploadFile: UploadFile = {
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'pending'
    }
    
    validFiles.push(uploadFile)
  }
  
  if (validFiles.length > 0) {
    fileList.value.push(...validFiles)
    emit('change', fileList.value)
  }
}

const handleRemove = (file: UploadFile, index: number) => {
  fileList.value.splice(index, 1)
  emit('remove', file, index)
  emit('change', fileList.value)
}

const handleClearAll = () => {
  fileList.value = []
  emit('change', fileList.value)
}

const handlePreview = (file: UploadFile) => {
  emit('preview', file)
}

// 暴露方法
defineExpose({
  clearFiles: handleClearAll,
  addFiles: processFiles,
  fileList: computed(() => fileList.value)
})
</script>

<style scoped>
/* 上传区域样式 */
.upload-zone:hover:not(.is-disabled) {
  border-color: var(--color-primary-400);
  background-color: var(--color-primary-25);
}

.upload-button:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

/* 文件项样式 */
.file-item:hover {
  background-color: var(--color-gray-50);
}

.action-button:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.remove-button:hover {
  background-color: var(--color-error-50);
  color: var(--color-error-700);
}

.clear-button:hover {
  background-color: var(--color-error-50);
  border-color: var(--color-error-400);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .upload-zone {
    min-height: 120px;
    padding: 1rem;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .file-actions {
    align-self: flex-end;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .upload-zone,
  .upload-button,
  .file-item,
  .action-button,
  .progress-bar {
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .upload-zone,
  .file-list {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .upload-zone,
  .file-actions {
    display: none;
  }
}
</style>
