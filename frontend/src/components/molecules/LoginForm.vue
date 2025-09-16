<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <DSInput
        v-model="form.email"
        type="email"
        label="邮箱"
        placeholder="请输入邮箱地址"
        required
        :error="errors.email"
        @blur="validateField('email')"
      />
    </div>

    <div>
      <DSInput
        v-model="form.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        required
        :error="errors.password"
        @blur="validateField('password')"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input
          v-model="form.rememberMe"
          type="checkbox"
          class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <span class="ml-2 text-sm text-gray-600">记住我</span>
      </label>

      <a href="#" class="text-sm text-purple-600 hover:text-purple-500">
        忘记密码？
      </a>
    </div>

    <DSButton
      type="submit"
      variant="primary"
      size="lg"
      :loading="loading"
      :disabled="!isFormValid"
      full-width
    >
      登录
    </DSButton>

    <div v-if="error" class="text-red-600 text-sm text-center">
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import DSInput from '../atoms/DSInput.vue'
import DSButton from '../atoms/DSButton.vue'
import type { LoginRequest } from '../../types/api'

interface Props {
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: LoginRequest & { rememberMe: boolean }]
}>()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const isFormValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password
})

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
    
    case 'password':
      if (!form.password) {
        errors.password = '密码是必需的'
      } else if (form.password.length < 6) {
        errors.password = '密码至少需要6个字符'
      } else {
        errors.password = ''
      }
      break
  }
}

const handleSubmit = () => {
  // 验证所有字段
  validateField('email')
  validateField('password')

  if (isFormValid.value) {
    emit('submit', {
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe
    })
  }
}
</script>
