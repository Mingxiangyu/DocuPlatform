<template>
  <DesignSystemProvider
    theme="light"
    :enable-animations="true"
    :enable-transitions="true"
    :enable-global-progress="true"
    :enable-global-loading="true"
    :debug-mode="false"
  >
    <router-view />
  </DesignSystemProvider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import DesignSystemProvider from './design-system/providers/DesignSystemProvider.vue'

const authStore = useAuthStore()

// 应用初始化
onMounted(() => {
  // 初始化认证状态（Pinia插件会自动恢复状态）
  authStore.initAuth()

  // 如果有认证信息，验证token有效性
  if (authStore.isAuthenticated) {
    authStore.checkAuth()
  }
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
