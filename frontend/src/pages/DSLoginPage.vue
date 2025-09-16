<!--
  设计系统登录页 - DSLoginPage
  基于新设计系统重构的登录页面，集成现代化设计和完整的用户体验
-->

<template>
  <div class="login-page" :style="pageStyles">
    <!-- 背景装饰 -->
    <div class="background-decorations" :style="backgroundDecorationsStyles">
      <div class="decoration-blob blob-1" :style="getBlobStyles(1)"></div>
      <div class="decoration-blob blob-2" :style="getBlobStyles(2)"></div>
      <div class="decoration-blob blob-3" :style="getBlobStyles(3)"></div>
      <div class="decoration-pattern" :style="decorationPatternStyles"></div>
    </div>

    <!-- 主要内容容器 -->
    <div class="main-container" :style="mainContainerStyles">
      <!-- 左侧品牌区域 -->
      <div class="brand-section" :style="brandSectionStyles">
        <div class="brand-content" :style="brandContentStyles">
          <!-- 品牌Logo -->
          <div class="brand-logo" :style="brandLogoStyles">
            <div class="logo-icon" :style="logoIconStyles">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="logo-text" :style="logoTextStyles">DocuVault</span>
          </div>

          <!-- 品牌标语 -->
          <div class="brand-tagline" :style="brandTaglineStyles">
            <h1 class="tagline-title" :style="taglineTitleStyles">
              知识的宝库
            </h1>
            <p class="tagline-subtitle" :style="taglineSubtitleStyles">
              发现、学习、分享优质内容，与全球知识创作者一起成长
            </p>
          </div>

          <!-- 特性列表 -->
          <div class="features-list" :style="featuresListStyles">
            <div
              v-for="feature in features"
              :key="feature.id"
              class="feature-item"
              :style="featureItemStyles"
            >
              <div class="feature-icon" :style="featureIconStyles">
                <component :is="feature.icon" />
              </div>
              <div class="feature-content" :style="featureContentStyles">
                <h3 class="feature-title" :style="featureTitleStyles">
                  {{ feature.title }}
                </h3>
                <p class="feature-description" :style="featureDescriptionStyles">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="form-section" :style="formSectionStyles">
        <div class="form-container" :style="formContainerStyles">
          <!-- 表单头部 -->
          <div class="form-header" :style="formHeaderStyles">
            <h2 class="form-title" :style="formTitleStyles">
              欢迎回来
            </h2>
            <p class="form-subtitle" :style="formSubtitleStyles">
              登录到你的账户继续学习之旅
            </p>
          </div>

          <!-- 登录表单 -->
          <form class="login-form" :style="loginFormStyles" @submit.prevent="handleSubmit">
            <!-- 邮箱输入 -->
            <div class="form-group" :style="formGroupStyles">
              <label class="form-label" :style="formLabelStyles" for="email">
                邮箱地址
              </label>
              <div class="input-container" :style="inputContainerStyles">
                <div class="input-icon" :style="inputIconStyles">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="form-input"
                  :style="getInputStyles('email')"
                  placeholder="请输入邮箱地址"
                  :disabled="isLoading"
                  @blur="validateField('email')"
                  @focus="clearFieldError('email')"
                />
              </div>
              <div
                v-if="errors.email"
                class="error-message"
                :style="errorMessageStyles"
              >
                {{ errors.email }}
              </div>
            </div>

            <!-- 密码输入 -->
            <div class="form-group" :style="formGroupStyles">
              <label class="form-label" :style="formLabelStyles" for="password">
                密码
              </label>
              <div class="input-container" :style="inputContainerStyles">
                <div class="input-icon" :style="inputIconStyles">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="form-input"
                  :style="getInputStyles('password')"
                  placeholder="请输入密码"
                  :disabled="isLoading"
                  @blur="validateField('password')"
                  @focus="clearFieldError('password')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :style="passwordToggleStyles"
                  @click="togglePasswordVisibility"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                >
                  <svg v-if="showPassword" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                  <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div
                v-if="errors.password"
                class="error-message"
                :style="errorMessageStyles"
              >
                {{ errors.password }}
              </div>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="form-options" :style="formOptionsStyles">
              <label class="checkbox-label" :style="checkboxLabelStyles">
                <input
                  v-model="formData.rememberMe"
                  type="checkbox"
                  class="checkbox-input"
                  :style="checkboxInputStyles"
                  :disabled="isLoading"
                />
                <span class="checkbox-text" :style="checkboxTextStyles">
                  记住我
                </span>
              </label>
              <router-link
                to="/forgot-password"
                class="forgot-link"
                :style="forgotLinkStyles"
              >
                忘记密码？
              </router-link>
            </div>

            <!-- 全局错误信息 -->
            <div
              v-if="globalError"
              class="global-error"
              :style="globalErrorStyles"
            >
              <div class="error-icon" :style="errorIconStyles">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="error-text" :style="errorTextStyles">
                {{ globalError }}
              </span>
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="submit-button"
              :style="getSubmitButtonStyles()"
              :disabled="isLoading || !isFormValid"
            >
              <div v-if="isLoading" class="loading-spinner" :style="loadingSpinnerStyles">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75" />
                </svg>
              </div>
              <span>{{ isLoading ? '登录中...' : '登录' }}</span>
            </button>
          </form>

          <!-- 分割线 -->
          <div class="divider" :style="dividerStyles">
            <span class="divider-text" :style="dividerTextStyles">或</span>
          </div>

          <!-- 社交登录 -->
          <div class="social-login" :style="socialLoginStyles">
            <button
              v-for="provider in socialProviders"
              :key="provider.id"
              class="social-button"
              :style="getSocialButtonStyles(provider.color)"
              @click="handleSocialLogin(provider.id)"
              :disabled="isLoading"
            >
              <component :is="provider.icon" />
              <span>{{ provider.label }}</span>
            </button>
          </div>

          <!-- 注册链接 -->
          <div class="register-link" :style="registerLinkStyles">
            <span class="register-text" :style="registerTextStyles">
              还没有账户？
            </span>
            <router-link
              to="/register"
              class="register-button"
              :style="registerButtonStyles"
            >
              立即注册
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDesignTokens } from '../design-system/composables'
import { eventBus, showNotification } from '../utils/EventBus'

// 表单数据接口
interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

// 错误信息接口
interface FormErrors {
  email?: string
  password?: string
}

// 特性接口
interface Feature {
  id: string
  title: string
  description: string
  icon: any
}

// 社交登录提供商接口
interface SocialProvider {
  id: string
  label: string
  color: string
  icon: any
}

// 路由和设计令牌
const router = useRouter()
const route = useRoute()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const isLoading = ref(false)
const showPassword = ref(false)
const globalError = ref('')

// 表单数据
const formData = reactive<LoginFormData>({
  email: '',
  password: '',
  rememberMe: false
})

// 表单错误
const errors = reactive<FormErrors>({})

// 特性列表
const features = ref<Feature[]>([
  {
    id: 'knowledge',
    title: '知识管理',
    description: '整理和管理你的学习资料',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>' }
  },
  {
    id: 'collaboration',
    title: '协作学习',
    description: '与其他学习者交流和分享',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>' }
  },
  {
    id: 'growth',
    title: '持续成长',
    description: '跟踪学习进度，持续提升',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>' }
  }
])

// 社交登录提供商
const socialProviders = ref<SocialProvider[]>([
  {
    id: 'google',
    label: '使用 Google 登录',
    color: '#4285f4',
    icon: { template: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' }
  },
  {
    id: 'github',
    label: '使用 GitHub 登录',
    color: '#333',
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" /></svg>' }
  }
])

// 计算属性
const isFormValid = computed(() => {
  return formData.email && formData.password && !errors.email && !errors.password
})

// 样式计算
const pageStyles = computed(() => ({
  minHeight: '100vh',
  backgroundColor: getColor('gray.50'),
  position: 'relative',
  overflow: 'hidden'
}))

const backgroundDecorationsStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  zIndex: '1'
}))

const getBlobStyles = (index: number) => {
  const positions = [
    { top: '-10%', right: '-10%', color: getColor('primary.200') },
    { bottom: '-10%', left: '-10%', color: getColor('blue.200') },
    { top: '20%', left: '10%', color: getColor('purple.200') }
  ]
  
  const position = positions[index - 1]
  
  return {
    position: 'absolute',
    width: '400px',
    height: '400px',
    backgroundColor: position.color,
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: '0.3',
    animation: `blob 7s infinite ${index * 2}s`,
    ...position
  }
}

const decorationPatternStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${getColor('primary.300').replace('#', '')}' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  opacity: '0.5'
}))

const mainContainerStyles = computed(() => ({
  position: 'relative',
  zIndex: '2',
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  maxWidth: '1400px',
  margin: '0 auto'
}))

// 品牌区域样式
const brandSectionStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(12),
  background: `linear-gradient(135deg, ${getColor('primary.600')} 0%, ${getColor('primary.800')} 100%)`,
  color: 'white'
}))

const brandContentStyles = computed(() => ({
  maxWidth: '480px',
  width: '100%'
}))

const brandLogoStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(3),
  marginBottom: getSpacing(8)
}))

const logoIconStyles = computed(() => ({
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: tokens.borderRadius.xl,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)'
}))

const logoTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  fontFamily: tokens.typography.fontFamily.serif.join(', ')
}))

const brandTaglineStyles = computed(() => ({
  marginBottom: getSpacing(10)
}))

const taglineTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['4xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  lineHeight: tokens.typography.lineHeight.tight,
  marginBottom: getSpacing(4),
  margin: '0 0 1rem 0'
}))

const taglineSubtitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  lineHeight: tokens.typography.lineHeight.relaxed,
  opacity: '0.9',
  margin: '0'
}))

const featuresListStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(6)
}))

const featureItemStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: getSpacing(4)
}))

const featureIconStyles = computed(() => ({
  width: '48px',
  height: '48px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: tokens.borderRadius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
  backdropFilter: 'blur(8px)'
}))

const featureContentStyles = computed(() => ({
  flex: '1'
}))

const featureTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const featureDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  opacity: '0.8',
  lineHeight: tokens.typography.lineHeight.relaxed,
  margin: '0'
}))

// 表单区域样式
const formSectionStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(12),
  backgroundColor: 'white'
}))

const formContainerStyles = computed(() => ({
  width: '100%',
  maxWidth: '400px'
}))

const formHeaderStyles = computed(() => ({
  textAlign: 'center',
  marginBottom: getSpacing(8)
}))

const formTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['3xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0 0 0.5rem 0'
}))

const formSubtitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.600'),
  margin: '0'
}))

const loginFormStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(6)
}))

const formGroupStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(2)
}))

const formLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.700')
}))

const inputContainerStyles = computed(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
}))

const inputIconStyles = computed(() => ({
  position: 'absolute',
  left: getSpacing(3),
  color: getColor('gray.400'),
  zIndex: '2'
}))

const getInputStyles = (field: string) => {
  const hasError = errors[field as keyof FormErrors]
  
  return {
    width: '100%',
    padding: `${getSpacing(3)} ${getSpacing(3)} ${getSpacing(3)} ${getSpacing(10)}`,
    border: `1px solid ${hasError ? getColor('error.300') : getColor('gray.300')}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base[0],
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s ease',
    paddingRight: field === 'password' ? getSpacing(10) : getSpacing(3)
  }
}

const passwordToggleStyles = computed(() => ({
  position: 'absolute',
  right: getSpacing(3),
  padding: getSpacing(1),
  backgroundColor: 'transparent',
  border: 'none',
  color: getColor('gray.400'),
  cursor: 'pointer',
  borderRadius: tokens.borderRadius.sm,
  transition: 'all 0.2s ease'
}))

const errorMessageStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('error.600'),
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(1)
}))

const formOptionsStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}))

const checkboxLabelStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  cursor: 'pointer'
}))

const checkboxInputStyles = computed(() => ({
  width: '16px',
  height: '16px',
  accentColor: getColor('primary.600')
}))

const checkboxTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.700')
}))

const forgotLinkStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('primary.600'),
  textDecoration: 'none',
  fontWeight: tokens.typography.fontWeight.medium,
  transition: 'color 0.2s ease'
}))

const globalErrorStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  padding: getSpacing(3),
  backgroundColor: getColor('error.50'),
  border: `1px solid ${getColor('error.200')}`,
  borderRadius: tokens.borderRadius.md,
  color: getColor('error.700')
}))

const errorIconStyles = computed(() => ({
  flexShrink: '0'
}))

const errorTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0]
}))

const getSubmitButtonStyles = () => {
  const isDisabled = isLoading.value || !isFormValid.value
  
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(2),
    padding: `${getSpacing(3)} ${getSpacing(4)}`,
    backgroundColor: isDisabled ? getColor('gray.300') : getColor('primary.600'),
    color: 'white',
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base[0],
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease'
  }
}

const loadingSpinnerStyles = computed(() => ({
  animation: 'spin 1s linear infinite'
}))

const dividerStyles = computed(() => ({
  position: 'relative',
  textAlign: 'center',
  margin: `${getSpacing(6)} 0`
}))

const dividerTextStyles = computed(() => ({
  backgroundColor: 'white',
  padding: `0 ${getSpacing(4)}`,
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.500')
}))

const socialLoginStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(3)
}))

const getSocialButtonStyles = (color: string) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: getSpacing(3),
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  backgroundColor: 'white',
  border: `1px solid ${getColor('gray.300')}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.700'),
  cursor: 'pointer',
  transition: 'all 0.2s ease'
})

const registerLinkStyles = computed(() => ({
  textAlign: 'center',
  marginTop: getSpacing(6)
}))

const registerTextStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600')
}))

const registerButtonStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('primary.600'),
  textDecoration: 'none',
  fontWeight: tokens.typography.fontWeight.medium,
  marginLeft: getSpacing(1),
  transition: 'color 0.2s ease'
}))

// 表单验证
const validateField = (field: keyof FormErrors) => {
  switch (field) {
    case 'email':
      if (!formData.email) {
        errors.email = '请输入邮箱地址'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = '请输入有效的邮箱地址'
      } else {
        delete errors.email
      }
      break
    case 'password':
      if (!formData.password) {
        errors.password = '请输入密码'
      } else if (formData.password.length < 6) {
        errors.password = '密码至少需要6个字符'
      } else {
        delete errors.password
      }
      break
  }
}

const clearFieldError = (field: keyof FormErrors) => {
  delete errors[field]
  globalError.value = ''
}

// 事件处理
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  // 验证所有字段
  validateField('email')
  validateField('password')
  
  if (!isFormValid.value) {
    return
  }
  
  try {
    isLoading.value = true
    globalError.value = ''
    
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟登录成功
    showNotification('success', '登录成功！')
    
    // 重定向到目标页面
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
    
  } catch (error) {
    globalError.value = '登录失败，请检查邮箱和密码'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = (provider: string) => {
  showNotification('info', `${provider} 登录功能开发中`)
}
</script>

<style scoped>
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-input:focus + .password-toggle {
  color: var(--color-primary-600);
}

.password-toggle:hover {
  color: var(--color-primary-600);
  background-color: var(--color-gray-100);
}

.forgot-link:hover {
  color: var(--color-primary-700);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
}

.social-button:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-soft);
}

.register-button:hover {
  color: var(--color-primary-700);
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-gray-200);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .main-container {
    grid-template-columns: 1fr;
  }
  
  .brand-section {
    display: none;
  }
  
  .form-section {
    min-height: 100vh;
  }
}

@media (max-width: 640px) {
  .form-section {
    padding: 1.5rem;
  }
  
  .form-container {
    max-width: none;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .social-login {
    gap: 0.75rem;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .decoration-blob,
  .form-input,
  .submit-button,
  .social-button {
    animation: none !important;
    transition: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .form-input,
  .submit-button,
  .social-button {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .background-decorations,
  .brand-section,
  .social-login {
    display: none;
  }
}
</style>
