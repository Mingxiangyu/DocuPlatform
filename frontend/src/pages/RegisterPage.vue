<template>
  <div class="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-gray-900 font-serif">DocuVault</h1>
            </div>
          </div>

          <!-- 右侧操作区 -->
          <div class="flex items-center">
            <router-link to="/" class="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">
              返回首页
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <!-- 注册卡片 -->
        <DSCard variant="elevated" padding="xl" class="overflow-hidden form-appear">
          <!-- 表单标题 -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">创建账户</h2>
            <p class="text-gray-600">
              已有账户？
              <router-link to="/login" class="text-purple-600 hover:text-purple-500 font-medium transition-colors">
                立即登录
              </router-link>
            </p>
          </div>

          <!-- 社交注册 -->
          <div class="space-y-3 mb-8">
            <DSButton
              variant="outline"
              size="lg"
              class="w-full group"
              @click="handleGithubRegister"
            >
              <svg class="w-5 h-5 mr-3 text-gray-700 group-hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="text-gray-700 group-hover:text-gray-900 transition-colors">使用 GitHub 注册</span>
            </DSButton>

            <DSButton
              variant="outline"
              size="lg"
              class="w-full group"
              @click="handleGoogleRegister"
            >
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-gray-700 group-hover:text-gray-900 transition-colors">使用 Google 注册</span>
            </DSButton>

            <DSButton
              variant="outline"
              size="lg"
              class="w-full group"
              @click="handleWeChatRegister"
            >
              <svg class="w-5 h-5 mr-3 text-green-500 group-hover:text-green-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18z"/>
                <path d="M15.308 9.537c-3.95 0-7.102 2.445-7.102 5.567 0 1.96 1.22 3.7 3.133 4.776a.581.581 0 0 1 .211.659l-.344 1.309a.38.38 0 0 0-.032.141c0 .114.09.206.2.206a.25.25 0 0 0 .124-.033l1.672-.98a.567.567 0 0 1 .472-.065 8.426 8.426 0 0 0 2.666.427c3.95 0 7.102-2.445 7.102-5.567 0-3.122-3.152-5.567-7.102-5.567zm-2.44 2.967c.504 0 .912.417.912.93 0 .513-.408.93-.912.93s-.912-.417-.912-.93c0-.513.408-.93.912-.93zm4.879 0c.504 0 .912.417.912.93 0 .513-.408.93-.912.93s-.912-.417-.912-.93c0-.513.408-.93.912-.93z"/>
              </svg>
              <span class="text-gray-700 group-hover:text-gray-900 transition-colors">使用微信注册</span>
            </DSButton>
          </div>

          <!-- 分隔线 -->
          <div class="relative mb-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">或使用邮箱注册</span>
            </div>
          </div>

          <!-- 注册表单 -->
          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- 邮箱输入 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
                邮箱地址
              </label>
              <DSInput
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱地址"
                required
                :error="errors.email"
                @blur="validateField('email')"
                class="w-full"
              />
            </div>

            <!-- 昵称输入 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                昵称
              </label>
              <DSInput
                v-model="form.nickname"
                type="text"
                placeholder="请输入昵称"
                required
                :error="errors.nickname"
                @blur="validateField('nickname')"
                class="w-full"
              />
            </div>

            <!-- 密码输入 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                密码
              </label>
              <DSInput
                v-model="form.password"
                type="password"
                placeholder="请输入密码（至少6个字符）"
                required
                :error="errors.password"
                @blur="validateField('password')"
                class="w-full"
              />
              <!-- 密码强度指示器 -->
              <div v-if="form.password" class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-300"
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrengthWidth }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium" :class="passwordStrengthTextClass">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 确认密码输入 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                确认密码
              </label>
              <DSInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                required
                :error="errors.confirmPassword"
                @blur="validateField('confirmPassword')"
                class="w-full"
              />
            </div>

            <!-- 同意条款 -->
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  v-model="form.agreeToTerms"
                  id="terms"
                  name="terms"
                  type="checkbox"
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  required
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="terms" class="text-gray-600">
                  我同意
                  <a href="/terms" class="text-purple-600 hover:text-purple-500 transition-colors">服务条款</a>
                  和
                  <a href="/privacy" class="text-purple-600 hover:text-purple-500 transition-colors">隐私政策</a>
                </label>
              </div>
            </div>

            <!-- 注册按钮 -->
            <div>
              <DSButton
                type="submit"
                variant="primary"
                size="lg"
                :loading="loading"
                :disabled="!isFormValid"
                class="w-full"
              >
                <template v-if="loading">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  注册中...
                </template>
                <template v-else>
                  注册账户
                </template>
              </DSButton>
            </div>

            <!-- 错误信息 -->
            <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
              {{ error }}
            </div>
          </form>
        </DSCard>

        <!-- 安全提示 -->
        <div class="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>DocuVault 重视您的账号安全，我们采用银行级加密保护您的数据</p>
          <p>© 2024 DocuVault 保留所有权利</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSInput from '../components/atoms/DSInput.vue'
import { useAuthStore } from '../stores/auth'
import { eventBus } from '../utils/EventBus'
import type { RegisterRequest } from '../types/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const errors = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.email &&
         form.nickname &&
         form.password &&
         form.confirmPassword &&
         form.agreeToTerms &&
         !errors.email &&
         !errors.nickname &&
         !errors.password &&
         !errors.confirmPassword
})

// 密码强度检测
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { score: 0, text: '弱', class: 'bg-red-500', textClass: 'text-red-500', width: '0%' }

  let score = 0

  // 基础长度检查
  if (password.length >= 8) score += 25
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 25
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 25
  // 包含数字或特殊字符
  if (/[0-9!@#$%^&*]/.test(password)) score += 25

  if (score < 50) {
    return { score, text: '弱', class: 'bg-red-500', textClass: 'text-red-500', width: `${score}%` }
  } else if (score < 75) {
    return { score, text: '中', class: 'bg-yellow-500', textClass: 'text-yellow-500', width: `${score}%` }
  } else {
    return { score, text: '强', class: 'bg-green-500', textClass: 'text-green-500', width: `${score}%` }
  }
})

const passwordStrengthClass = computed(() => passwordStrength.value.class)
const passwordStrengthText = computed(() => passwordStrength.value.text)
const passwordStrengthTextClass = computed(() => passwordStrength.value.textClass)
const passwordStrengthWidth = computed(() => passwordStrength.value.width)

const validateField = (field: keyof typeof errors) => {
  switch (field) {
    case 'email':
      if (!form.email) {
        errors.email = '邮箱是必需的'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = '邮箱格式不正确'
      } else {
        errors.email = ''
      }
      break
    
    case 'nickname':
      if (!form.nickname) {
        errors.nickname = '昵称是必需的'
      } else if (form.nickname.length < 2) {
        errors.nickname = '昵称至少需要2个字符'
      } else if (form.nickname.length > 20) {
        errors.nickname = '昵称不能超过20个字符'
      } else {
        errors.nickname = ''
      }
      break
    
    case 'password':
      if (!form.password) {
        errors.password = '密码是必需的'
      } else if (form.password.length < 8) {
        errors.password = '密码至少需要8个字符'
      } else {
        errors.password = ''
      }
      // 如果确认密码已填写，重新验证确认密码
      if (form.confirmPassword) {
        validateField('confirmPassword')
      }
      break
    
    case 'confirmPassword':
      if (!form.confirmPassword) {
        errors.confirmPassword = '请确认密码'
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
      } else {
        errors.confirmPassword = ''
      }
      break
  }
}

const handleRegister = async () => {
  // 验证所有字段
  validateField('email')
  validateField('nickname')
  validateField('password')
  validateField('confirmPassword')

  if (!isFormValid.value) {
    return
  }

  try {
    loading.value = true
    error.value = ''

    const result = await authStore.register({
      email: form.email,
      nickname: form.nickname,
      password: form.password
    })

    if (result.success) {
      eventBus.emit('ui:notification', {
        type: 'success',
        message: '注册成功，欢迎加入DocuVault！'
      })
      
      // 跳转到首页
      router.push('/')
    } else {
      error.value = result.error || '注册失败'
    }
  } catch (err: any) {
    error.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}

// 社交注册处理函数
const handleGithubRegister = () => {
  eventBus.emit('ui:notification', {
    type: 'info',
    message: 'GitHub注册功能开发中...'
  })
}

const handleGoogleRegister = () => {
  eventBus.emit('ui:notification', {
    type: 'info',
    message: 'Google注册功能开发中...'
  })
}

const handleWeChatRegister = () => {
  eventBus.emit('ui:notification', {
    type: 'info',
    message: '微信注册功能开发中...'
  })
}
</script>

<style scoped>
/* 表单动画 */
.form-appear {
  animation: formFadeIn 0.5s ease-out;
}

@keyframes formFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .sm\:mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .sm\:w-full {
    width: 100%;
  }

  .sm\:max-w-md {
    max-width: 28rem;
  }

  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>
