<template>
  <DSDefaultLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题和统计 -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 font-serif mb-2">我的笔记</h1>
            <p class="text-gray-600">管理您的阅读笔记和划线内容，构建个人知识库</p>
          </div>

          <!-- 统计信息 -->
          <div class="flex items-center space-x-6 mt-4 md:mt-0">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ notesStore.stats.totalNotes }}</div>
              <div class="text-sm text-gray-500">总笔记</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-600">{{ notesStore.stats.totalHighlights }}</div>
              <div class="text-sm text-gray-500">总划线</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ notesStore.stats.totalArticles }}</div>
              <div class="text-sm text-gray-500">文章数</div>
            </div>
          </div>
        </div>

        <!-- 视图切换和筛选 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <!-- 视图切换 -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">视图：</span>
              <DSButton
                @click="notesStore.setView('grouped')"
                :variant="notesStore.currentView === 'grouped' ? 'primary' : 'outline'"
                size="sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5"></path>
                </svg>
                按文章分组
              </DSButton>
              <DSButton
                @click="notesStore.setView('timeline')"
                :variant="notesStore.currentView === 'timeline' ? 'primary' : 'outline'"
                size="sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                时间线
              </DSButton>
            </div>

            <!-- 筛选选项 -->
            <div class="flex items-center space-x-4">
              <select
                v-model="selectedFilter"
                @change="notesStore.setFilter(selectedFilter)"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="highlight">仅划线</option>
                <option value="note">仅笔记</option>
                <option value="both">划线+笔记</option>
              </select>

              <select
                v-model="selectedSort"
                @change="notesStore.setSort(selectedSort)"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">最新创建</option>
                <option value="oldest">最早创建</option>
                <option value="article">按文章排序</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="notesStore.isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="notesStore.error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="text-2xl font-bold mb-2">加载失败</h2>
          <p class="text-gray-600">{{ notesStore.error }}</p>
        </div>
        <DSButton @click="notesStore.loadNotes()" variant="primary">重试</DSButton>
      </div>

      <!-- 笔记内容区域 -->
      <div v-else>
        <!-- 按文章分组视图 -->
        <div v-if="notesStore.currentView === 'grouped'">
          <div v-if="Object.keys(notesStore.groupedNotes).length === 0" class="text-center py-16">
            <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无笔记</h3>
            <p class="text-gray-600 mb-6">开始阅读文章并添加笔记吧</p>
            <DSButton @click="goToArticles" variant="primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              去阅读文章
            </DSButton>
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="(group, articleId) in notesStore.groupedNotes"
              :key="articleId"
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <!-- 文章头部 -->
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ group.articleTitle }}</h3>
                    <p class="text-sm text-gray-600">作者：{{ group.articleAuthor }} · {{ group.notes.length }} 条笔记</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <DSButton
                      @click="goToArticle(articleId)"
                      variant="outline"
                      size="sm"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      查看原文
                    </DSButton>
                  </div>
                </div>
              </div>

              <!-- 笔记列表 -->
              <div class="divide-y divide-gray-100">
                <NoteCard
                  v-for="note in group.notes"
                  :key="note.id"
                  :note="note"
                  class="border-0 rounded-none"
                  @edit="handleEditNote"
                  @delete="handleDeleteNote"
                  @view-article="goToArticle"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 时间线视图 -->
        <div v-else-if="notesStore.currentView === 'timeline'">
          <div v-if="notesStore.filteredNotes.length === 0" class="text-center py-16">
            <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无笔记</h3>
            <p class="text-gray-600">您的笔记时间线将在这里显示</p>
          </div>

          <div v-else class="space-y-4">
            <NoteCard
              v-for="note in notesStore.filteredNotes"
              :key="note.id"
              :note="note"
              :show-article-info="true"
              @edit="handleEditNote"
              @delete="handleDeleteNote"
              @view-article="goToArticle"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑笔记模态框 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">编辑笔记</h3>
          <DSButton @click="closeEditModal" variant="ghost" size="sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </DSButton>
        </div>

        <form @submit.prevent="saveNote" class="space-y-4">
          <!-- 高亮文本 -->
          <div v-if="editingNote?.highlightText">
            <label class="block text-sm font-medium text-gray-700 mb-2">高亮文本</label>
            <div class="bg-gray-50 p-3 rounded-lg border">
              <p class="text-gray-800">"{{ editingNote.highlightText }}"</p>
            </div>
          </div>

          <!-- 笔记文本 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">我的想法</label>
            <textarea
              v-model="editForm.noteText"
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="在这里记录您的想法和见解..."
            ></textarea>
          </div>

          <!-- 高亮颜色选择 -->
          <div v-if="editingNote?.highlightText">
            <label class="block text-sm font-medium text-gray-700 mb-2">高亮颜色</label>
            <div class="flex space-x-2">
              <button
                v-for="color in highlightColors"
                :key="color.value"
                type="button"
                @click="editForm.highlightColor = color.value"
                :class="[
                  'w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform',
                  editForm.highlightColor === color.value ? 'ring-2 ring-purple-500' : ''
                ]"
                :style="{ backgroundColor: color.color }"
                :title="color.name"
              />
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4">
            <DSButton @click="closeEditModal" variant="outline">取消</DSButton>
            <DSButton type="submit" variant="primary" :loading="isSaving">保存</DSButton>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-2">删除笔记</h3>
          <p class="text-sm text-gray-500 mb-6">确定要删除这条笔记吗？此操作无法撤销。</p>

          <div class="flex items-center justify-center space-x-3">
            <DSButton @click="closeDeleteModal" variant="outline">取消</DSButton>
            <DSButton @click="confirmDelete" variant="danger" :loading="isDeleting">删除</DSButton>
          </div>
        </div>
      </div>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSButton from '../components/atoms/DSButton.vue'
import NoteCard from '../components/molecules/NoteCard.vue'
import { useNotesStore, type Note, type NoteFilterType, type NoteSortType } from '../stores/notes'
import { eventBus } from '../utils/EventBus'

const router = useRouter()
const notesStore = useNotesStore()

// 响应式状态
const selectedFilter = ref<NoteFilterType>('all')
const selectedSort = ref<NoteSortType>('newest')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingNote = ref<Note | null>(null)
const deletingNote = ref<Note | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)

// 编辑表单
const editForm = ref({
  noteText: '',
  highlightColor: 'yellow' as const
})

// 高亮颜色选项
const highlightColors = [
  { name: '黄色', value: 'yellow', color: '#fef08a' },
  { name: '蓝色', value: 'blue', color: '#93c5fd' },
  { name: '绿色', value: 'green', color: '#86efac' },
  { name: '紫色', value: 'purple', color: '#c4b5fd' }
]

// 方法
const goToArticles = () => {
  router.push('/articles')
}

const goToArticle = (articleId: string) => {
  router.push(`/articles/${articleId}`)
}

const handleEditNote = (note: Note) => {
  editingNote.value = note
  editForm.value.noteText = note.noteText || ''
  editForm.value.highlightColor = note.highlightColor
  showEditModal.value = true
}

const handleDeleteNote = (note: Note) => {
  deletingNote.value = note
  showDeleteModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingNote.value = null
  editForm.value.noteText = ''
  editForm.value.highlightColor = 'yellow'
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingNote.value = null
}

const saveNote = async () => {
  if (!editingNote.value) return

  try {
    isSaving.value = true

    await notesStore.updateNote(editingNote.value.id, {
      noteText: editForm.value.noteText,
      highlightColor: editForm.value.highlightColor
    })

    closeEditModal()
  } catch (err) {
    console.error('Failed to save note:', err)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async () => {
  if (!deletingNote.value) return

  try {
    isDeleting.value = true

    await notesStore.deleteNote(deletingNote.value.id)

    closeDeleteModal()
  } catch (err) {
    console.error('Failed to delete note:', err)
  } finally {
    isDeleting.value = false
  }
}

// 生命周期
onMounted(async () => {
  await notesStore.loadNotes()
})
</script>
