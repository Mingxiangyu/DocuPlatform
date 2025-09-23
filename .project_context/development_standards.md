# DocuVault 开发规范文档

**版本**: 2.0
**最后更新**: 2024-12-23
**基于**: 认证状态管理重构成果和文档精简优化
**项目版本**: v2.1 (认证状态管理重构版)

## 概述

本文档基于DocuVault项目认证状态管理重构的成功经验和最新的文档精简优化成果，为团队提供统一的开发规范和最佳实践指导。所有规范都经过实际项目验证，确保代码质量和开发效率。

## 1. 认证状态管理规范

### 1.1 Pinia Plugin Persistedstate 统一标准

#### 核心原则
- **唯一持久化机制**: 统一使用Pinia Plugin Persistedstate，禁止手动localStorage操作
- **精确字段选择**: 只持久化必要的状态字段，避免存储冗余数据
- **类型安全保障**: 完整的TypeScript类型定义和验证
- **真实API集成**: 所有认证流程必须通过真实后端API，严禁模拟逻辑

#### 认证Store标准配置
```typescript
// ✅ 认证状态管理标准配置
export const useAuthStore = defineStore('auth', () => {
  // 状态定义
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // 业务方法 - 只通过真实API调用
  const login = async (credentials: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
    if (response.success && response.data) {
      user.value = response.data.user
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
    }
    return response
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
  }

  return { user, token, refreshToken, isAuthenticated, login, logout }
}, {
  persist: {
    storage: localStorage,
    pick: ['user', 'token', 'refreshToken'], // 只持久化必要字段
    beforeHydrate: (ctx) => console.log('Auth state hydrating...'),
    afterHydrate: (ctx) => console.log('Auth state hydrated')
  }
})
```

#### 严禁的操作模式
```typescript
// ❌ 严禁手动localStorage操作
localStorage.setItem('user_data', JSON.stringify(data))
localStorage.getItem('auth_token')
localStorage.removeItem('user_info')

// ❌ 严禁模拟登录逻辑
if (credentials.email === 'demo@docuvault.com') {
  // 任何模拟登录逻辑都被严禁
}

// ❌ 严禁后端可用性检测
const checkBackendAvailable = async () => { /* 已废弃 */ }

// ❌ 严禁重复的状态持久化
sessionStorage.setItem('temp_data', value)
```

### 1.2 状态访问和组件集成规范

#### Header组件条件渲染模式（参考实现）
```vue
<script setup lang="ts">
// ✅ 标准的组件状态访问
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
const toggleUserMenu = () => { /* 用户菜单逻辑 */ }
</script>

<template>
  <!-- ✅ 标准的条件渲染模式 -->
  <div v-if="!isAuthenticated" class="auth-buttons">
    <button @click="goToLogin" class="btn-primary">登录</button>
    <button @click="goToRegister" class="btn-secondary">注册</button>
  </div>

  <div v-if="isAuthenticated" class="user-menu">
    <button @click="toggleUserMenu" class="user-avatar-btn">
      <img :src="user?.avatarUrl || defaultAvatar" :alt="user?.nickname" />
      <span>{{ user?.nickname || '用户' }}</span>
    </button>
  </div>
</template>
```

#### 避免的状态访问模式
```typescript
// ❌ 直接访问store状态（不推荐）
const isAuth = authStore.isAuthenticated
const userData = authStore.user

// ❌ 在模板中直接访问store（不推荐）
<template>
  <div v-if="authStore.isAuthenticated">内容</div>
</template>

// ❌ 在方法中直接修改store状态（不推荐）
const handleLogin = () => {
  authStore.user = newUser // 应该通过store的方法
}
```

## 2. API集成规范

### 2.1 ApiClient Token Provider配置最佳实践

#### 关键配置要求
**必须在应用初始化时配置token provider**，否则所有需要认证的API请求都会失败。

```typescript
// ✅ 正确的配置方式 - main.ts
import { setTokenProvider } from './services/ApiClient'

// 在Pinia初始化后立即配置
app.use(pinia)
setTokenProvider(() => {
  const authData = localStorage.getItem('auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.token || null
    } catch (error) {
      console.warn('Failed to parse auth data from localStorage:', error)
      return null
    }
  }
  return null
})
```

#### 常见错误和避免方法

```typescript
// ❌ 错误：忘记配置token provider
// 这会导致所有API请求都不包含认证头

// ❌ 错误：在Pinia初始化前配置
setTokenProvider(() => authStore.token) // authStore还不存在

// ❌ 错误：直接访问store而不是localStorage
setTokenProvider(() => useAuthStore().token) // 可能导致循环依赖

// ✅ 正确：从localStorage读取（Pinia持久化存储位置）
setTokenProvider(() => {
  const authData = localStorage.getItem('auth')
  return authData ? JSON.parse(authData).token : null
})
```

#### 验证配置是否生效

```typescript
// 开发环境下验证token provider是否正确配置
if (import.meta.env.DEV) {
  // 检查API请求是否包含Authorization头
  console.log('Token provider configured:', !!getAuthToken)
}
```

### 2.2 统一API调用标准

#### 核心原则
- **统一ApiClient**: 所有API调用必须通过统一的ApiClient进行
- **真实后端集成**: 严禁绕过后端API的模拟逻辑
- **完整错误处理**: 统一的错误处理和用户反馈机制
- **类型安全**: 完整的TypeScript类型定义

#### 认证API调用标准模式
```typescript
// ✅ 认证相关API调用标准
const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  try {
    isLoading.value = true
    error.value = null

    // 统一的ApiClient调用
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)

    if (response.success && response.data) {
      // 更新认证状态
      user.value = response.data.user
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      return { success: true, data: response.data }
    } else {
      throw new Error(response.message || '登录失败')
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || '网络错误'
    error.value = errorMessage
    return { success: false, error: errorMessage }
  } finally {
    isLoading.value = false
  }
}
```

### 2.2 严禁的模拟逻辑

#### 已清理的废弃模式（严禁重新添加）
```typescript
// ❌ 严禁模拟登录逻辑（已清理67行代码）
if (credentials.email === 'demo@docuvault.com') {
  // 任何模拟登录逻辑都被严禁
}

// ❌ 严禁后端可用性检测（已废弃）
const checkBackendAvailable = async () => { /* 已删除 */ }

// ❌ 严禁模拟数据返回
const useMockData = isDev && !backendAvailable
if (useMockData) {
  return mockResponse
}

// ❌ 严禁绕过API的假数据
const mockUser = { id: 1, email: 'demo@docuvault.com' } // 已清理
```

### 2.3 错误处理标准

#### 统一的错误处理模式
```typescript
// ✅ 标准错误处理
try {
  const response = await apiCall()
  // 处理成功响应
} catch (err: any) {
  const errorMessage = err.response?.data?.message || err.message || '操作失败'
  error.value = errorMessage

  // 用户反馈
  eventBus.emit('notification:show', {
    type: 'error',
    message: errorMessage
  })

  return { success: false, error: errorMessage }
}
```

## 3. 组件开发规范

### 3.1 认证状态条件渲染模式

#### Header组件标准实现（参考模板）
```vue
<script setup lang="ts">
// ✅ 标准的状态访问模式
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 导航方法
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
const toggleUserMenu = () => { /* 用户菜单逻辑 */ }
</script>

<template>
  <header class="header">
    <!-- ✅ 标准的条件渲染：未登录状态 -->
    <div v-if="!isAuthenticated" class="auth-buttons">
      <button @click="goToLogin" class="btn-primary">登录</button>
      <button @click="goToRegister" class="btn-secondary">注册</button>
    </div>

    <!-- ✅ 标准的条件渲染：已登录状态 -->
    <div v-if="isAuthenticated" class="user-menu">
      <button @click="toggleUserMenu" class="user-avatar-btn">
        <img :src="user?.avatarUrl || defaultAvatar" :alt="user?.nickname" />
        <span>{{ user?.nickname || '用户' }}</span>
      </button>
    </div>
  </header>
</template>
```

### 3.2 文章详情页面布局规范

#### 三列Grid布局标准
```vue
<template>
  <!-- ✅ 标准的三列Grid布局 -->
  <div class="article-detail-layout">
    <!-- 左侧目录 (20%) -->
    <aside class="article-toc sticky top-28 self-start">
      <nav class="toc-navigation">
        <!-- 目录内容 -->
      </nav>
    </aside>

    <!-- 中间内容 (60%) -->
    <main class="article-content">
      <article class="prose max-w-none">
        <!-- 文章内容 -->
      </article>
    </main>

    <!-- 右侧留白 (16%) -->
    <aside class="article-sidebar">
      <!-- 侧边栏内容 -->
    </aside>
  </div>
</template>

<style scoped>
.article-detail-layout {
  display: grid;
  grid-template-columns: 1fr 3fr 0.8fr; /* 20%:60%:16% */
  gap: 2rem;
}

/* 移动端响应式 */
@media (max-width: 767px) {
  .article-detail-layout {
    grid-template-columns: 1fr;
  }

  .sticky {
    position: static !important;
  }
}
</style>
```

## 4. 代码清理检查清单

### 4.1 认证状态管理代码清理成果（v2.1版本）

#### 已清理的问题代码（67行）
- ✅ 移除手动localStorage操作（`localStorage.setItem/getItem`）
- ✅ 移除模拟登录逻辑（`demo@docuvault.com`硬编码）
- ✅ 移除后端可用性检测（`checkBackendAvailable`函数）
- ✅ 移除重复的状态持久化操作
- ✅ 统一使用Pinia Plugin Persistedstate

### 4.2 开发前检查清单
- [ ] 是否需要状态持久化？使用Pinia Plugin Persistedstate
- [ ] 是否需要API调用？使用统一的ApiClient
- [ ] 是否需要条件渲染？使用computed属性
- [ ] 是否需要错误处理？遵循统一错误处理模式

### 4.3 代码审查检查清单
- [ ] 是否存在手动localStorage操作？
- [ ] 是否添加了模拟登录逻辑？
- [ ] 是否正确使用computed属性访问状态？
- [ ] 是否遵循条件渲染最佳实践？
- [ ] 是否通过真实API进行请求？
- [ ] 是否有重复的状态管理逻辑？
- [ ] 是否有硬编码的测试数据？

### 4.4 常见问题识别和解决

#### localStorage重复操作问题
```typescript
// ❌ 问题代码（已清理）
localStorage.setItem('user_data', JSON.stringify(userData))
user.value = userData

// ✅ 正确做法
user.value = userData // Pinia插件自动持久化
```

#### 模拟逻辑问题
```typescript
// ❌ 问题代码（已清理）
if (credentials.email === 'demo@docuvault.com') {
  return mockLoginResponse
}

// ✅ 正确做法
const response = await apiClient.post('/api/auth/login', credentials)
return response
```

## 5. 最佳实践总结

### 5.1 认证状态管理黄金法则
1. **单一数据源**: 使用Pinia作为唯一的状态管理
2. **自动持久化**: 通过Pinia Plugin Persistedstate实现，避免手动操作
3. **真实API**: 所有请求必须通过后端验证，严禁模拟逻辑
4. **响应式访问**: 使用computed属性访问状态
5. **条件渲染**: 基于认证状态进行UI控制

### 5.2 性能优化要点
```typescript
// ✅ 只持久化必要字段
{
  persist: {
    pick: ['user', 'token', 'refreshToken'], // 精确选择
    storage: localStorage
  }
}

// ✅ 使用computed缓存计算结果
const isAuthenticated = computed(() => !!user.value && !!token.value)
```

### 5.3 代码质量保证
1. **定期清理**: 识别和移除冗余代码（如本次清理67行）
2. **统一规范**: 遵循团队开发标准
3. **完整测试**: 覆盖关键功能和边界情况
4. **文档更新**: 保持文档与代码同步

## 6. 故障排除指南

### 6.1 常见问题及解决方案

#### 认证状态丢失
**症状**: 页面刷新后用户需要重新登录
**解决**: 检查Pinia持久化配置是否正确

#### Header显示异常
**症状**: 登录后仍显示登录按钮
**解决**: 检查条件渲染逻辑，确保使用computed属性

#### API请求认证失败（v2.1.1重要修复）
**症状**: 用户登录后访问页面时自动登出，API请求返回401错误
**原因**: ApiClient的token provider未配置，导致请求不包含Authorization头
**解决**: 在main.ts中配置token provider
```typescript
import { setTokenProvider } from './services/ApiClient'
setTokenProvider(() => {
  const authData = localStorage.getItem('auth')
  return authData ? JSON.parse(authData).token : null
})
```

#### 认证状态在页面跳转时不一致
**症状**: 某些页面显示已登录，某些页面显示未登录
**原因**: token provider配置缺失或错误
**解决**: 确保在应用初始化时正确配置token provider，并验证所有API请求都包含认证头

#### API调用失败
**症状**: 登录请求返回错误
**解决**: 检查API端点和错误处理逻辑

### 6.2 调试技巧
1. **Vue DevTools**: 检查Pinia状态变化
2. **浏览器控制台**: 查看持久化日志
3. **网络面板**: 检查API请求和响应
4. **localStorage检查**: 验证数据持久化

## 7. 团队协作规范

### 7.1 Pull Request 检查清单
- [ ] 代码遵循开发规范
- [ ] 没有手动localStorage操作
- [ ] 没有模拟登录逻辑
- [ ] 使用computed属性访问状态
- [ ] 包含必要的测试用例

### 7.2 Code Review 重点
1. **状态管理**: 检查是否正确使用Pinia持久化

## 8. 测试和调试

### 8.1 演示账户信息

**测试账户**（用于开发和测试）：
- **邮箱**: `test@docuvault.dev`
- **密码**: `Password123`
- **用途**: 用于测试登录功能、认证状态管理、API调用等

**注意事项**：
- 该账户仅用于开发和测试环境
- 生产环境请使用真实用户账户
- 测试时请确保后端服务正常运行

### 8.2 认证功能测试步骤

1. **登录测试**：
   ```
   1. 访问 http://localhost:3000/login
   2. 输入邮箱：test@docuvault.dev
   3. 输入密码：Password123
   4. 点击登录按钮
   5. 验证跳转到首页且右上角显示用户头像
   ```

2. **状态持久化测试**：
   ```
   1. 登录成功后刷新页面
   2. 验证认证状态是否保持
   3. 检查localStorage中的auth数据
   ```

3. **认证状态管理测试**：
   ```
   1. 登录后访问文章页面
   2. 访问不存在的文章页面（如 /articles/test-001）
   3. 验证认证状态是否保持稳定
   4. 确认不会触发自动登出
   ```
2. **API集成**: 确认所有请求通过真实后端
3. **组件逻辑**: 验证条件渲染和状态访问
4. **性能考虑**: 评估对应用性能的影响

## 8. 参考资料

### 8.1 项目文档
- `.project_context/architecture.md` - 项目架构文档
- `frontend/src/stores/auth.ts` - 认证状态管理实现
- `frontend/src/components/organisms/DSHeader.vue` - Header组件参考

### 8.2 技术文档
- [Pinia Plugin Persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**文档版本**: 2.0
**最后更新**: 2024-12-23
**适用项目**: DocuVault v2.1 (认证状态管理重构版)
