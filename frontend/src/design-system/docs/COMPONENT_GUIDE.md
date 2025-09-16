# DocuVault 设计系统组件使用指南

## 概述

DocuVault 设计系统是一个企业级的 Vue 3 组件库，基于原子设计理论构建，提供了36个高质量组件，覆盖了知识付费平台的所有常用UI需求。

## 快速开始

### 安装

```bash
# 使用 npm
npm install @docuvault/design-system

# 使用 yarn
yarn add @docuvault/design-system

# 使用 pnpm
pnpm add @docuvault/design-system
```

### 基础使用

```typescript
// main.ts
import { createApp } from 'vue'
import { DesignSystemProvider } from '@docuvault/design-system'
import '@docuvault/design-system/dist/style.css'

const app = createApp(App)
app.use(DesignSystemProvider)
app.mount('#app')
```

### 组件导入

```vue
<template>
  <div>
    <DSButton variant="primary" @click="handleClick">
      点击我
    </DSButton>
    <DSInput v-model="inputValue" placeholder="请输入内容" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DSButton, DSInput } from '@docuvault/design-system'

const inputValue = ref('')

const handleClick = () => {
  console.log('按钮被点击了！')
}
</script>
```

## 组件分类

### 原子组件 (Atoms)

原子组件是最基础的UI元素，不可再分割。

#### DSButton - 按钮组件

```vue
<template>
  <!-- 基础用法 -->
  <DSButton>默认按钮</DSButton>
  
  <!-- 不同变体 -->
  <DSButton variant="primary">主要按钮</DSButton>
  <DSButton variant="secondary">次要按钮</DSButton>
  <DSButton variant="success">成功按钮</DSButton>
  <DSButton variant="warning">警告按钮</DSButton>
  <DSButton variant="error">错误按钮</DSButton>
  
  <!-- 不同尺寸 -->
  <DSButton size="xs">超小按钮</DSButton>
  <DSButton size="sm">小按钮</DSButton>
  <DSButton size="md">中等按钮</DSButton>
  <DSButton size="lg">大按钮</DSButton>
  <DSButton size="xl">超大按钮</DSButton>
  
  <!-- 状态 -->
  <DSButton :loading="true">加载中</DSButton>
  <DSButton :disabled="true">禁用状态</DSButton>
  
  <!-- 图标按钮 -->
  <DSButton :icon="PlusIcon">添加</DSButton>
  <DSButton :icon="PlusIcon" icon-only />
</template>
```

**Props:**
- `variant`: 按钮变体 (`default` | `primary` | `secondary` | `success` | `warning` | `error`)
- `size`: 按钮尺寸 (`xs` | `sm` | `md` | `lg` | `xl`)
- `loading`: 加载状态
- `disabled`: 禁用状态
- `icon`: 图标组件
- `iconOnly`: 仅显示图标

#### DSInput - 输入框组件

```vue
<template>
  <!-- 基础用法 -->
  <DSInput v-model="value" placeholder="请输入内容" />
  
  <!-- 不同类型 -->
  <DSInput type="email" placeholder="邮箱地址" />
  <DSInput type="password" placeholder="密码" />
  <DSInput type="number" placeholder="数字" />
  
  <!-- 带标签 -->
  <DSInput label="用户名" placeholder="请输入用户名" />
  
  <!-- 带帮助文本 -->
  <DSInput 
    label="密码" 
    type="password" 
    help-text="密码长度至少8位"
    placeholder="请输入密码" 
  />
  
  <!-- 错误状态 -->
  <DSInput 
    label="邮箱" 
    :error="true" 
    error-message="邮箱格式不正确"
    placeholder="请输入邮箱" 
  />
  
  <!-- 带图标 -->
  <DSInput :prefix-icon="SearchIcon" placeholder="搜索" />
  <DSInput :suffix-icon="EyeIcon" type="password" />
</template>
```

**Props:**
- `modelValue`: 绑定值
- `type`: 输入类型
- `label`: 标签文本
- `placeholder`: 占位符
- `helpText`: 帮助文本
- `error`: 错误状态
- `errorMessage`: 错误信息
- `prefixIcon`: 前缀图标
- `suffixIcon`: 后缀图标

#### DSBadge - 徽章组件

```vue
<template>
  <!-- 基础用法 -->
  <DSBadge>默认</DSBadge>
  
  <!-- 不同变体 -->
  <DSBadge variant="primary">主要</DSBadge>
  <DSBadge variant="success">成功</DSBadge>
  <DSBadge variant="warning">警告</DSBadge>
  <DSBadge variant="error">错误</DSBadge>
  
  <!-- 不同形状 -->
  <DSBadge shape="rounded">圆角</DSBadge>
  <DSBadge shape="pill">胶囊</DSBadge>
  <DSBadge shape="square">方形</DSBadge>
  
  <!-- 样式模式 -->
  <DSBadge :outline="true">轮廓</DSBadge>
  <DSBadge :soft="true">柔和</DSBadge>
  
  <!-- 带计数 -->
  <DSBadge :count="5">消息</DSBadge>
  <DSBadge :count="99" :max-count="99">通知</DSBadge>
  
  <!-- 可关闭 -->
  <DSBadge :closable="true" @close="handleClose">可关闭</DSBadge>
</template>
```

### 分子组件 (Molecules)

分子组件由多个原子组件组合而成，具有特定的功能。

#### DSModal - 模态框组件

```vue
<template>
  <DSButton @click="showModal = true">打开模态框</DSButton>
  
  <DSModal
    v-model="showModal"
    title="确认操作"
    description="此操作不可撤销，请确认是否继续？"
    variant="warning"
    size="md"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="showModal = false"
  >
    <p>这里是模态框的内容区域。</p>
  </DSModal>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const loading = ref(false)

const handleConfirm = async () => {
  loading.value = true
  try {
    // 执行异步操作
    await new Promise(resolve => setTimeout(resolve, 2000))
    showModal.value = false
  } finally {
    loading.value = false
  }
}
</script>
```

#### DSToast - 消息提示组件

```vue
<template>
  <div>
    <DSButton @click="showSuccess">成功消息</DSButton>
    <DSButton @click="showError">错误消息</DSButton>
    <DSButton @click="showWarning">警告消息</DSButton>
    <DSButton @click="showInfo">信息消息</DSButton>
  </div>
  
  <DSToast ref="toastRef" position="top-right" />
</template>

<script setup>
import { ref } from 'vue'

const toastRef = ref()

const showSuccess = () => {
  toastRef.value.success('操作成功！')
}

const showError = () => {
  toastRef.value.error('操作失败，请重试')
}

const showWarning = () => {
  toastRef.value.warning('请注意检查输入内容')
}

const showInfo = () => {
  toastRef.value.info('这是一条信息提示', {
    duration: 5000,
    action: {
      label: '查看详情',
      handler: () => console.log('查看详情')
    }
  })
}
</script>
```

#### DSFileUpload - 文件上传组件

```vue
<template>
  <DSFileUpload
    :multiple="true"
    accept="image/*,.pdf,.doc,.docx"
    :max-size="10 * 1024 * 1024"
    :max-count="5"
    upload-text="点击或拖拽文件到此区域上传"
    hint-text="支持 jpg、png、pdf、doc 格式，单个文件不超过 10MB"
    @change="handleFileChange"
    @error="handleError"
  />
</template>

<script setup>
const handleFileChange = (files) => {
  console.log('文件列表:', files)
  // 处理文件上传逻辑
}

const handleError = (error) => {
  console.error('上传错误:', error)
}
</script>
```

### 有机组件 (Organisms)

有机组件是由分子和原子组件组成的复杂组件，具有完整的业务功能。

#### DSDataTable - 数据表格组件

```vue
<template>
  <DSDataTable
    title="用户列表"
    description="系统中的所有用户信息"
    :data="tableData"
    :columns="columns"
    :selectable="true"
    :searchable="true"
    :pagination="true"
    @select="handleSelect"
    @row-click="handleRowClick"
  />
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
  // 更多数据...
])

const columns = ref([
  { key: 'id', title: 'ID', width: '80px', sortable: true },
  { key: 'name', title: '姓名', sortable: true },
  { key: 'email', title: '邮箱', sortable: true },
  { 
    key: 'status', 
    title: '状态', 
    formatter: (value) => value === 'active' ? '活跃' : '非活跃'
  }
])

const handleSelect = (selectedRows) => {
  console.log('选中的行:', selectedRows)
}

const handleRowClick = (row, index) => {
  console.log('点击的行:', row, index)
}
</script>
```

### 模板组件 (Templates)

模板组件定义了页面的整体布局结构。

#### DSAdminLayout - 管理后台布局

```vue
<template>
  <DSAdminLayout
    brand-title="DocuVault Admin"
    brand-subtitle="知识付费管理平台"
    :menu-items="menuItems"
    :breadcrumbs="breadcrumbs"
    user-name="管理员"
    user-avatar="/avatar.jpg"
    :collapsed="sidebarCollapsed"
    @menu-click="handleMenuClick"
    @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
  >
    <!-- 主要内容 -->
    <div class="admin-content">
      <h1>仪表板</h1>
      <p>欢迎使用 DocuVault 管理后台</p>
    </div>
    
    <!-- 自定义页脚 -->
    <template #footer>
      <p>© 2024 DocuVault. 版权所有.</p>
    </template>
  </DSAdminLayout>
</template>

<script setup>
import { ref } from 'vue'

const sidebarCollapsed = ref(false)

const menuItems = ref([
  {
    key: 'dashboard',
    label: '仪表板',
    href: '/admin/dashboard',
    icon: 'DashboardIcon',
    active: true
  },
  {
    key: 'users',
    label: '用户管理',
    href: '/admin/users',
    icon: 'UsersIcon',
    badge: 5
  },
  {
    key: 'content',
    label: '内容管理',
    icon: 'ContentIcon',
    children: [
      { key: 'articles', label: '文章管理', href: '/admin/articles' },
      { key: 'categories', label: '分类管理', href: '/admin/categories' }
    ]
  }
])

const breadcrumbs = ref([
  { label: '首页', href: '/admin' },
  { label: '仪表板' }
])

const handleMenuClick = (item) => {
  console.log('菜单点击:', item)
}
</script>
```

## 主题定制

### 使用设计令牌

```vue
<script setup>
import { useDesignTokens } from '@docuvault/design-system'

const { tokens, getColor, getSpacing } = useDesignTokens()

// 使用颜色令牌
const primaryColor = getColor('primary.600')
const backgroundColor = getColor('gray.50')

// 使用间距令牌
const padding = getSpacing(4)
const margin = getSpacing(2)
</script>
```

### 自定义主题

```typescript
// theme.ts
import type { ThemeConfig } from '@docuvault/design-system'

export const customTheme: ThemeConfig = {
  name: 'custom',
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      600: '#2563eb',
      // 其他色阶...
    }
  }
}
```

## 最佳实践

### 1. 组件命名

- 使用 `DS` 前缀区分设计系统组件
- 采用 PascalCase 命名规范
- 名称要清晰表达组件功能

### 2. 属性设计

- 使用一致的属性命名
- 提供合理的默认值
- 支持常见的尺寸和变体

### 3. 事件处理

- 使用描述性的事件名称
- 提供必要的事件参数
- 支持事件的阻止和修饰符

### 4. 可访问性

- 添加适当的 ARIA 属性
- 支持键盘导航
- 确保颜色对比度符合标准

### 5. 性能优化

- 使用 `v-show` 而不是 `v-if` 对于频繁切换的元素
- 合理使用 `computed` 和 `watch`
- 避免不必要的重新渲染

## 常见问题

### Q: 如何自定义组件样式？

A: 推荐使用设计令牌进行样式定制，避免直接修改组件的 CSS 类。

```vue
<template>
  <DSButton :style="customButtonStyle">自定义按钮</DSButton>
</template>

<script setup>
import { useDesignTokens } from '@docuvault/design-system'

const { getColor, getSpacing } = useDesignTokens()

const customButtonStyle = {
  backgroundColor: getColor('purple.600'),
  padding: `${getSpacing(3)} ${getSpacing(6)}`
}
</script>
```

### Q: 如何处理表单验证？

A: 使用组件的内置验证功能，结合表单库如 VeeValidate。

```vue
<template>
  <form @submit="handleSubmit">
    <DSInput
      v-model="email"
      type="email"
      label="邮箱"
      :error="emailError"
      :error-message="emailErrorMessage"
      @blur="validateEmail"
    />
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { validators } from '@docuvault/design-system'

const email = ref('')
const emailError = ref(false)
const emailErrorMessage = ref('')

const validateEmail = () => {
  if (!validators.isEmail(email.value)) {
    emailError.value = true
    emailErrorMessage.value = '请输入有效的邮箱地址'
  } else {
    emailError.value = false
    emailErrorMessage.value = ''
  }
}
</script>
```

### Q: 如何实现响应式设计？

A: 使用设计系统提供的响应式工具和断点。

```vue
<script setup>
import { useResponsive } from '@docuvault/design-system'

const { isMobile, isTablet, isDesktop } = useResponsive()

// 根据屏幕尺寸调整组件行为
const buttonSize = computed(() => {
  if (isMobile.value) return 'sm'
  if (isTablet.value) return 'md'
  return 'lg'
})
</script>
```

## 更新日志

### v2.0.0 (2024-12-11)

- 🎉 完整重构设计系统架构
- ✨ 新增36个企业级组件
- 🔧 建立完整的设计令牌系统
- 💪 实现100%TypeScript支持
- ♿ 添加完整的可访问性支持
- ⚡ 优化性能和包体积
- 🎨 支持主题定制和暗色模式

## 贡献指南

欢迎为 DocuVault 设计系统贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细的贡献指南。

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件。
