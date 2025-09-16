<template>
  <div 
    :class="[
      'stats-card bg-white rounded-lg shadow-sm p-6 transition-all duration-300',
      clickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
    ]"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm text-gray-600 mb-1">{{ title }}</p>
        <div class="flex items-baseline space-x-2">
          <p 
            :class="[
              'text-2xl font-bold transition-all duration-500',
              getValueColor()
            ]"
          >
            <CountUp 
              v-if="animated"
              :end-val="numericValue"
              :options="countUpOptions"
            />
            <span v-else>{{ formattedValue }}</span>
          </p>
          <div v-if="trend" class="flex items-center">
            <i 
              :class="[
                'fas text-xs mr-1',
                trend.type === 'up' ? 'fa-arrow-up text-green-500' :
                trend.type === 'down' ? 'fa-arrow-down text-red-500' :
                'fa-minus text-gray-400'
              ]"
            ></i>
            <span 
              :class="[
                'text-xs font-medium',
                trend.type === 'up' ? 'text-green-600' :
                trend.type === 'down' ? 'text-red-600' :
                'text-gray-500'
              ]"
            >
              {{ trend.value }}{{ trend.unit || '%' }}
            </span>
          </div>
        </div>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
      
      <div 
        :class="[
          'w-12 h-12 rounded-lg flex items-center justify-center ml-4',
          getIconBgColor()
        ]"
      >
        <i 
          :class="[
            icon,
            'text-xl',
            getIconColor()
          ]"
        ></i>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div v-if="progress" class="mt-4">
      <div class="flex justify-between text-xs text-gray-600 mb-1">
        <span>{{ progress.label }}</span>
        <span>{{ progress.current }}/{{ progress.total }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          :class="[
            'h-2 rounded-full transition-all duration-500',
            getProgressColor()
          ]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 额外信息 -->
    <div v-if="extra" class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">{{ extra.label }}</span>
        <span :class="getExtraValueColor()">{{ extra.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 类型定义
export interface StatsTrend {
  type: 'up' | 'down' | 'stable'
  value: number | string
  unit?: string
}

export interface StatsProgress {
  label: string
  current: number
  total: number
}

export interface StatsExtra {
  label: string
  value: string | number
  type?: 'success' | 'warning' | 'danger' | 'info'
}

// Props
interface Props {
  title: string
  value: number | string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray'
  subtitle?: string
  trend?: StatsTrend
  progress?: StatsProgress
  extra?: StatsExtra
  animated?: boolean
  clickable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  animated: true,
  clickable: false,
  loading: false
})

// Emits
const emit = defineEmits<{
  'click': []
}>()

// 计算属性
const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  const parsed = parseFloat(props.value.toString().replace(/[^\d.-]/g, ''))
  return isNaN(parsed) ? 0 : parsed
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  // 格式化数字
  if (props.value >= 1000000) {
    return (props.value / 1000000).toFixed(1) + 'M'
  } else if (props.value >= 1000) {
    return (props.value / 1000).toFixed(1) + 'K'
  }
  
  return props.value.toLocaleString()
})

const progressPercentage = computed(() => {
  if (!props.progress) return 0
  return Math.min((props.progress.current / props.progress.total) * 100, 100)
})

const countUpOptions = computed(() => ({
  duration: 2,
  useEasing: true,
  useGrouping: true,
  separator: ',',
  decimal: '.',
  prefix: '',
  suffix: ''
}))

// 颜色方法
const getValueColor = () => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-900'
  }
  return colors[props.color]
}

const getIconColor = () => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  }
  return colors[props.color]
}

const getIconBgColor = () => {
  const colors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
    gray: 'bg-gray-100'
  }
  return colors[props.color]
}

const getProgressColor = () => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  }
  return colors[props.color]
}

const getExtraValueColor = () => {
  if (!props.extra?.type) return 'text-gray-900'
  
  const colors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  }
  return colors[props.extra.type]
}

// 方法
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<script lang="ts">
// CountUp 组件简单实现
import { defineComponent, ref, onMounted, watch } from 'vue'

const CountUp = defineComponent({
  name: 'CountUp',
  props: {
    endVal: {
      type: Number,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const displayValue = ref(0)
    
    const animate = () => {
      const duration = props.options.duration || 2
      const steps = 60 * duration // 60fps
      const increment = props.endVal / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= props.endVal) {
          displayValue.value = props.endVal
          clearInterval(timer)
        } else {
          displayValue.value = Math.floor(current)
        }
      }, 1000 / 60)
    }
    
    onMounted(() => {
      animate()
    })
    
    watch(() => props.endVal, () => {
      animate()
    })
    
    return () => displayValue.value.toLocaleString()
  }
})

export { CountUp }
</script>

<style scoped>
.stats-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.stats-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 加载状态 */
.stats-card.loading {
  position: relative;
  overflow: hidden;
}

.stats-card.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
