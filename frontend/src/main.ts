import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import './style.css'
import { setTokenProvider } from './services/ApiClient'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例并配置持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用插件
app.use(pinia)
app.use(router)

// 设置API客户端的token provider（在Pinia初始化后）
setTokenProvider(() => {
  // 从localStorage获取token（Pinia持久化存储的位置）
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

// 挂载应用
app.mount('#app')

// 开发环境下的调试工具
if (import.meta.env.DEV) {
  // 暴露应用实例到全局，便于调试
  ;(window as any).__app = app
  ;(window as any).__pinia = pinia
  ;(window as any).__router = router
}
