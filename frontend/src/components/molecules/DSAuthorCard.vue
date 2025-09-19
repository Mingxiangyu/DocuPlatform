<template>
  <div 
    class="author-card"
    :class="{ 'cursor-pointer': clickable }"
    :style="cardStyles"
    @click="handleClick"
  >
    <div class="author-avatar">
      <img 
        :src="author.avatar || defaultAvatar"
        :alt="author.name"
        style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
      />
    </div>
    
    <div class="author-info">
      <h3 class="author-name">{{ author.name }}</h3>
      <p class="author-field">{{ author.field || '技术专家' }}</p>
      <div class="author-stats">
        <span class="stat-item">{{ author.articleCount || 0 }} 篇文章</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Author {
  id: string
  name: string
  avatar?: string
  field?: string
  articleCount?: number
}

interface Props {
  author: Author
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  clickable: false
})

const emit = defineEmits<{
  click: [author: Author]
}>()

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'

const cardStyles = computed(() => ({
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  ':hover': props.clickable ? {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  } : {}
}))

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.author)
  }
}
</script>

<style scoped>
.author-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.author-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.author-info {
  text-align: center;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.author-field {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.author-stats {
  font-size: 11px;
  color: #9ca3af;
}

.stat-item {
  display: inline-block;
}
</style>
