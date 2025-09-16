import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下的调试工具
if (import.meta.env.DEV) {
  // 暴露应用实例到全局，便于调试
  ;(window as any).__app = app
  ;(window as any).__pinia = pinia
  ;(window as any).__router = router
}
