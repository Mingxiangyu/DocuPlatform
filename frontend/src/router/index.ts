import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: {
      title: '首页 - DocuVault'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: {
      title: '登录 - DocuVault',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: {
      title: '注册 - DocuVault',
      requiresGuest: true
    }
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('../pages/ArticlesPage.vue'),
    meta: {
      title: '文章列表 - DocuVault'
    }
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('../pages/ArticleDetailPage.vue'),
    meta: {
      title: '文章详情 - DocuVault'
    }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('../pages/CollectionsPage.vue'),
    meta: {
      title: '合集 - DocuVault'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: {
      title: '个人资料 - DocuVault',
      requiresAuth: true
    }
  },
  {
    path: '/my-articles',
    name: 'MyArticles',
    component: () => import('../pages/MyArticlesPage.vue'),
    meta: {
      title: '我的文章 - DocuVault',
      requiresAuth: true
    }
  },
  {
    path: '/my-notes',
    name: 'MyNotes',
    component: () => import('../pages/MyNotesPage.vue'),
    meta: {
      title: '我的笔记 - DocuVault',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: {
      title: '设置 - DocuVault',
      requiresAuth: true
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../pages/SearchPage.vue'),
    meta: {
      title: '搜索 - DocuVault'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/AdminPage.vue'),
    meta: {
      title: '管理后台 - DocuVault',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFoundPage.vue'),
    meta: {
      title: '页面未找到 - DocuVault'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // 权限不足，跳转到首页
      next({ name: 'Home' })
      return
    }
  }

  // 检查是否需要游客状态（如登录、注册页面）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // 已登录用户访问登录/注册页面，跳转到首页
    next({ name: 'Home' })
    return
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
