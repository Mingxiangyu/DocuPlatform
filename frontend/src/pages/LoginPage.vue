<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10">
      <!-- 头部区域 -->
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center mb-8">
          <div class="relative group">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <span class="text-white font-bold text-2xl">D</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
        </div>

        <div class="text-center space-y-4">
          <h1 class="text-4xl font-bold text-gray-900 tracking-tight">
            欢迎回来
          </h1>
          <p class="text-lg text-gray-600">
            登录到 <span class="text-purple-600 font-semibold">DocuVault</span> 继续你的知识之旅
          </p>
          <p class="text-sm text-gray-500">
            还没有账户？
            <router-link
              to="/register"
              class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 hover:underline"
            >
              立即注册
            </router-link>
          </p>
        </div>
      </div>

      <!-- 登录表单区域 -->
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <DSCard variant="elevated" padding="xl" class="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <div class="space-y-8">
            <!-- 登录表单 -->
            <div class="space-y-6">
              <LoginForm
                :loading="loading"
                :error="error"
                @submit="handleLogin"
              />
            </div>

            <!-- 分隔线 -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500 font-medium">或者</span>
              </div>
            </div>

            <!-- 第三方登录 -->
            <div class="space-y-4">
              <DSButton
                variant="outline"
                size="lg"
                class="w-full group"
                @click="handleWeChatLogin"
              >
                <svg class="w-5 h-5 mr-3 text-green-500 group-hover:text-green-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18z"/>
                  <path d="M15.308 9.537c-3.95 0-7.102 2.445-7.102 5.567 0 1.96 1.22 3.7 3.133 4.776a.581.581 0 0 1 .211.659l-.344 1.309a.38.38 0 0 0-.032.141c0 .114.09.206.2.206a.25.25 0 0 0 .124-.033l1.672-.98a.567.567 0 0 1 .472-.065 8.426 8.426 0 0 0 2.666.427c3.95 0 7.102-2.445 7.102-5.567 0-3.122-3.152-5.567-7.102-5.567zm-2.44 2.967c.504 0 .912.417.912.93 0 .513-.408.93-.912.93s-.912-.417-.912-.93c0-.513.408-.93.912-.93zm4.879 0c.504 0 .912.417.912.93 0 .513-.408.93-.912.93s-.912-.417-.912-.93c0-.513.408-.93.912-.93z"/>
                </svg>
                <span class="text-gray-700 group-hover:text-gray-900 transition-colors">微信登录</span>
              </DSButton>

              <DSButton
                variant="outline"
                size="lg"
                class="w-full group"
                @click="handleGithubLogin"
              >
                <svg class="w-5 h-5 mr-3 text-gray-700 group-hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-gray-700 group-hover:text-gray-900 transition-colors">GitHub 登录</span>
              </DSButton>
            </div>

            <!-- 底部提示 -->
            <div class="text-center">
              <p class="text-xs text-gray-500">
                登录即表示您同意我们的
                <a href="/terms" class="text-purple-600 hover:text-purple-500 transition-colors">服务条款</a>
                和
                <a href="/privacy" class="text-purple-600 hover:text-purple-500 transition-colors">隐私政策</a>
              </p>
            </div>
          </div>
        </DSCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import LoginForm from '../components/molecules/LoginForm.vue'
import { useAuthStore } from '../stores/auth'
import { eventBus } from '../utils/EventBus'
import type { LoginRequest } from '../types/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const handleLogin = async (data: LoginRequest & { rememberMe: boolean }) => {
  try {
    loading.value = true
    error.value = ''

    const result = await authStore.login({
      email: data.email,
      password: data.password
    })

    if (result.success) {
      eventBus.emit('ui:notification', {
        type: 'success',
        message: '登录成功'
      })
      
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    } else {
      error.value = result.error || '登录失败'
    }
  } catch (err: any) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}

const handleWeChatLogin = () => {
  // 模拟微信登录
  eventBus.emit('ui:notification', {
    type: 'info',
    message: '微信登录功能开发中...'
  })
}

const handleGithubLogin = () => {
  // 模拟GitHub登录
  eventBus.emit('ui:notification', {
    type: 'info',
    message: 'GitHub登录功能开发中...'
  })
}
</script>

<style scoped>
/* 背景动画 */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* 渐变背景 */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* 毛玻璃效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 悬停效果增强 */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 链接悬停效果 */
a:hover {
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
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
