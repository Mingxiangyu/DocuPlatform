<!--
  设计系统个人中心页 - DSProfilePage
  基于新设计系统重构的个人中心页面，集成用户信息、统计数据、内容管理等功能
-->

<template>
  <DSDefaultLayout
    :show-scroll-progress="true"
    :show-search="true"
    :show-footer="true"
    :show-back-to-top="true"
    @search="handleGlobalSearch"
  >
    <!-- 页面容器 -->
    <div class="profile-page" :style="pageStyles">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container" :style="breadcrumbContainerStyles">
        <DSBreadcrumb
          :items="breadcrumbItems"
          :show-home="true"
          home-label="首页"
          home-to="/"
          size="md"
          variant="default"
          :scroll-animation="true"
        />
      </div>

      <!-- 用户信息头部 -->
      <header class="profile-header" :style="profileHeaderStyles">
        <div class="header-background" :style="headerBackgroundStyles">
          <!-- 背景装饰 -->
          <div class="background-pattern" :style="backgroundPatternStyles"></div>
        </div>
        
        <div class="header-content" :style="headerContentStyles">
          <!-- 用户头像和基本信息 -->
          <div class="user-info-section" :style="userInfoSectionStyles">
            <div class="avatar-container" :style="avatarContainerStyles">
              <div class="avatar-wrapper" :style="avatarWrapperStyles">
                <img
                  :src="user.avatarUrl || '/default-avatar.png'"
                  :alt="user.nickname"
                  class="avatar-image"
                  :style="avatarImageStyles"
                />
                <div class="avatar-status" :style="avatarStatusStyles">
                  <div class="status-indicator" :style="statusIndicatorStyles"></div>
                </div>
              </div>
              
              <button
                class="avatar-edit-button"
                :style="avatarEditButtonStyles"
                @click="handleAvatarEdit"
                aria-label="编辑头像"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
                </svg>
              </button>
            </div>

            <div class="user-details" :style="userDetailsStyles">
              <h1 class="user-name" :style="userNameStyles">
                {{ user.nickname || '用户' }}
              </h1>
              <p class="user-title" :style="userTitleStyles">
                {{ user.title || '知识创作者' }}
              </p>
              <p class="user-email" :style="userEmailStyles">
                {{ user.email }}
              </p>
              
              <!-- 用户标签 -->
              <div class="user-tags" :style="userTagsStyles">
                <span
                  v-for="tag in user.tags"
                  :key="tag"
                  class="user-tag"
                  :style="userTagStyles"
                >
                  {{ tag }}
                </span>
              </div>
              
              <!-- 操作按钮 -->
              <div class="user-actions" :style="userActionsStyles">
                <button
                  class="action-button primary"
                  :style="getPrimaryActionButtonStyles()"
                  @click="handleEditProfile"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
                  </svg>
                  编辑资料
                </button>
                <button
                  class="action-button secondary"
                  :style="getSecondaryActionButtonStyles()"
                  @click="handleSettings"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                  设置
                </button>
              </div>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="stats-section" :style="statsSectionStyles">
            <div class="stats-grid" :style="statsGridStyles">
              <div class="stat-card" :style="statCardStyles">
                <div class="stat-icon" :style="getStatIconStyles('articles')">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="stat-content" :style="statContentStyles">
                  <div class="stat-number" :style="statNumberStyles">{{ stats.articles }}</div>
                  <div class="stat-label" :style="statLabelStyles">文章</div>
                </div>
              </div>

              <div class="stat-card" :style="statCardStyles">
                <div class="stat-icon" :style="getStatIconStyles('followers')">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div class="stat-content" :style="statContentStyles">
                  <div class="stat-number" :style="statNumberStyles">{{ stats.followers }}</div>
                  <div class="stat-label" :style="statLabelStyles">关注者</div>
                </div>
              </div>

              <div class="stat-card" :style="statCardStyles">
                <div class="stat-icon" :style="getStatIconStyles('likes')">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="stat-content" :style="statContentStyles">
                  <div class="stat-number" :style="statNumberStyles">{{ stats.likes }}</div>
                  <div class="stat-label" :style="statLabelStyles">获赞</div>
                </div>
              </div>

              <div class="stat-card" :style="statCardStyles">
                <div class="stat-icon" :style="getStatIconStyles('views')">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="stat-content" :style="statContentStyles">
                  <div class="stat-number" :style="statNumberStyles">{{ stats.views }}</div>
                  <div class="stat-label" :style="statLabelStyles">浏览</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 导航标签 -->
      <nav class="profile-nav" :style="profileNavStyles">
        <div class="nav-container" :style="navContainerStyles">
          <div class="nav-tabs" :style="navTabsStyles">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['nav-tab', { active: activeTab === tab.id }]"
              :style="getNavTabStyles(tab.id)"
              @click="setActiveTab(tab.id)"
            >
              <component :is="tab.icon" />
              <span>{{ tab.label }}</span>
              <span v-if="tab.count" class="tab-count" :style="tabCountStyles">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- 主内容区域 -->
      <main class="profile-main" :style="profileMainStyles">
        <!-- 我的文章 -->
        <section v-if="activeTab === 'articles'" class="content-section">
          <div class="section-header" :style="sectionHeaderStyles">
            <h2 class="section-title" :style="sectionTitleStyles">我的文章</h2>
            <div class="section-actions" :style="sectionActionsStyles">
              <button
                class="action-button primary"
                :style="getPrimaryActionButtonStyles()"
                @click="handleCreateArticle"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                写文章
              </button>
            </div>
          </div>

          <!-- 文章筛选 -->
          <div class="content-filters" :style="contentFiltersStyles">
            <DSCategoryNavigation
              :categories="articleCategories"
              :selected-category="selectedArticleCategory"
              :show-title="false"
              :show-all-option="true"
              all-option-label="全部文章"
              :show-counts="true"
              layout="horizontal"
              variant="pills"
              size="sm"
              @category-select="handleArticleCategorySelect"
            />
          </div>

          <!-- 文章列表 -->
          <div class="articles-grid" :style="articlesGridStyles">
            <DSSkeletonLoader
              v-if="isLoadingArticles"
              v-for="i in 6"
              :key="i"
              :width="'100%'"
              :height="'200px'"
              :animation="true"
              :delay="i * 100"
            />
            <DSArticleCard
              v-else
              v-for="article in filteredUserArticles"
              :key="article.id"
              :article="article"
              variant="default"
              :show-author="false"
              :show-stats="true"
              :show-actions="true"
              @click="handleArticleClick"
              @edit="handleArticleEdit"
              @delete="handleArticleDelete"
            />
          </div>

          <!-- 空状态 -->
          <div
            v-if="!isLoadingArticles && filteredUserArticles.length === 0"
            class="empty-state"
            :style="emptyStateStyles"
          >
            <div class="empty-icon" :style="emptyIconStyles">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="empty-title" :style="emptyTitleStyles">还没有文章</h3>
            <p class="empty-description" :style="emptyDescriptionStyles">
              开始创作你的第一篇文章，分享你的知识和见解
            </p>
            <button
              class="empty-action"
              :style="getPrimaryActionButtonStyles()"
              @click="handleCreateArticle"
            >
              写第一篇文章
            </button>
          </div>
        </section>

        <!-- 我的收藏 -->
        <section v-else-if="activeTab === 'favorites'" class="content-section">
          <div class="section-header" :style="sectionHeaderStyles">
            <h2 class="section-title" :style="sectionTitleStyles">我的收藏</h2>
          </div>

          <!-- 收藏列表 -->
          <div class="favorites-grid" :style="favoritesGridStyles">
            <DSSkeletonLoader
              v-if="isLoadingFavorites"
              v-for="i in 6"
              :key="i"
              :width="'100%'"
              :height="'200px'"
              :animation="true"
              :delay="i * 100"
            />
            <DSArticleCard
              v-else
              v-for="article in userFavorites"
              :key="article.id"
              :article="article"
              variant="default"
              :show-author="true"
              :show-stats="true"
              :show-favorite="true"
              :is-favorited="true"
              @click="handleArticleClick"
              @favorite="handleToggleFavorite"
            />
          </div>

          <!-- 空状态 -->
          <div
            v-if="!isLoadingFavorites && userFavorites.length === 0"
            class="empty-state"
            :style="emptyStateStyles"
          >
            <div class="empty-icon" :style="emptyIconStyles">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="empty-title" :style="emptyTitleStyles">还没有收藏</h3>
            <p class="empty-description" :style="emptyDescriptionStyles">
              收藏你喜欢的文章，方便随时查看
            </p>
          </div>
        </section>

        <!-- 我的购买 -->
        <section v-else-if="activeTab === 'purchases'" class="content-section">
          <div class="section-header" :style="sectionHeaderStyles">
            <h2 class="section-title" :style="sectionTitleStyles">我的购买</h2>
          </div>

          <!-- 购买记录 -->
          <div class="purchases-list" :style="purchasesListStyles">
            <div
              v-for="purchase in userPurchases"
              :key="purchase.id"
              class="purchase-item"
              :style="purchaseItemStyles"
            >
              <div class="purchase-content" :style="purchaseContentStyles">
                <div class="purchase-info" :style="purchaseInfoStyles">
                  <h4 class="purchase-title" :style="purchaseTitleStyles">
                    {{ purchase.title }}
                  </h4>
                  <p class="purchase-date" :style="purchaseDateStyles">
                    购买时间：{{ formatDate(purchase.purchaseDate) }}
                  </p>
                </div>
                <div class="purchase-price" :style="purchasePriceStyles">
                  ¥{{ purchase.price }}
                </div>
              </div>
              <div class="purchase-actions" :style="purchaseActionsStyles">
                <button
                  class="action-button secondary"
                  :style="getSecondaryActionButtonStyles()"
                  @click="handleViewPurchase(purchase)"
                >
                  查看
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="userPurchases.length === 0"
            class="empty-state"
            :style="emptyStateStyles"
          >
            <div class="empty-icon" :style="emptyIconStyles">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="empty-title" :style="emptyTitleStyles">还没有购买记录</h3>
            <p class="empty-description" :style="emptyDescriptionStyles">
              购买优质内容，提升你的知识技能
            </p>
          </div>
        </section>

        <!-- 账户设置 -->
        <section v-else-if="activeTab === 'settings'" class="content-section">
          <div class="section-header" :style="sectionHeaderStyles">
            <h2 class="section-title" :style="sectionTitleStyles">账户设置</h2>
          </div>

          <!-- 设置选项 -->
          <div class="settings-grid" :style="settingsGridStyles">
            <div
              v-for="setting in settingsOptions"
              :key="setting.id"
              class="setting-item"
              :style="settingItemStyles"
              @click="handleSettingClick(setting)"
            >
              <div class="setting-icon" :style="settingIconStyles">
                <component :is="setting.icon" />
              </div>
              <div class="setting-content" :style="settingContentStyles">
                <h4 class="setting-title" :style="settingTitleStyles">
                  {{ setting.title }}
                </h4>
                <p class="setting-description" :style="settingDescriptionStyles">
                  {{ setting.description }}
                </p>
              </div>
              <div class="setting-arrow" :style="settingArrowStyles">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDesignTokens } from '../design-system/composables'
import { eventBus, showNotification } from '../utils/EventBus'

// 导入组件
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSBreadcrumb from '../components/molecules/DSBreadcrumb.vue'
import DSCategoryNavigation from '../components/molecules/DSCategoryNavigation.vue'
import DSArticleCard from '../components/molecules/DSArticleCard.vue'
import DSSkeletonLoader from '../components/atoms/DSSkeletonLoader.vue'

// 用户接口
interface User {
  id: string
  nickname: string
  email: string
  avatarUrl: string
  title: string
  tags: string[]
  bio: string
  joinDate: string
  isOnline: boolean
}

// 统计接口
interface Stats {
  articles: number
  followers: number
  likes: number
  views: number
}

// 文章接口
interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  viewCount: number
  likeCount: number
  isPaid: boolean
  price?: number
}

// 购买记录接口
interface Purchase {
  id: string
  title: string
  price: number
  purchaseDate: string
  type: 'article' | 'collection'
}

// 设置选项接口
interface SettingOption {
  id: string
  title: string
  description: string
  icon: any
  path: string
}

// 路由和设计令牌
const router = useRouter()
const route = useRoute()
const { tokens, getColor, getSpacing, getShadow } = useDesignTokens()

// 状态管理
const activeTab = ref('articles')
const selectedArticleCategory = ref('all')
const isLoadingArticles = ref(false)
const isLoadingFavorites = ref(false)

// 用户数据
const user = ref<User>({
  id: '1',
  nickname: '张三',
  email: 'zhangsan@example.com',
  avatarUrl: '/avatars/user1.jpg',
  title: '全栈开发工程师',
  tags: ['Vue.js', 'Node.js', '前端开发'],
  bio: '热爱技术，专注于前端和后端开发',
  joinDate: '2023-01-15',
  isOnline: true
})

const stats = ref<Stats>({
  articles: 24,
  followers: 1234,
  likes: 5678,
  views: 98765
})

// 文章数据
const userArticles = ref<Article[]>([])
const userFavorites = ref<Article[]>([])
const userPurchases = ref<Purchase[]>([])

// 标签配置
const tabs = computed(() => [
  {
    id: 'articles',
    label: '我的文章',
    count: stats.value.articles,
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>' }
  },
  {
    id: 'favorites',
    label: '我的收藏',
    count: userFavorites.value.length,
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>' }
  },
  {
    id: 'purchases',
    label: '我的购买',
    count: userPurchases.value.length,
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" /></svg>' }
  },
  {
    id: 'settings',
    label: '设置',
    icon: { template: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>' }
  }
])

// 文章分类
const articleCategories = computed(() => [
  { id: 'frontend', label: '前端开发', count: 12, icon: null, color: 'blue' },
  { id: 'backend', label: '后端开发', count: 8, icon: null, color: 'green' },
  { id: 'mobile', label: '移动开发', count: 4, icon: null, color: 'purple' }
])

// 设置选项
const settingsOptions = computed(() => [
  {
    id: 'profile',
    title: '个人资料',
    description: '编辑你的个人信息和头像',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>' },
    path: '/profile/edit'
  },
  {
    id: 'security',
    title: '账户安全',
    description: '修改密码和安全设置',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>' },
    path: '/profile/security'
  },
  {
    id: 'notifications',
    title: '通知设置',
    description: '管理你的通知偏好',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>' },
    path: '/profile/notifications'
  },
  {
    id: 'privacy',
    title: '隐私设置',
    description: '控制你的隐私和数据',
    icon: { template: '<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>' },
    path: '/profile/privacy'
  }
])

// 计算属性
const breadcrumbItems = computed(() => [
  { label: '个人中心', to: '/profile' }
])

const filteredUserArticles = computed(() => {
  if (selectedArticleCategory.value === 'all') {
    return userArticles.value
  }
  return userArticles.value.filter(article => article.category === selectedArticleCategory.value)
})

// 样式计算
const pageStyles = computed(() => ({
  maxWidth: '1280px',
  margin: '0 auto',
  padding: `0 ${getSpacing(4)}`,
  paddingBottom: getSpacing(12)
}))

const breadcrumbContainerStyles = computed(() => ({
  marginBottom: getSpacing(6)
}))

// 头部样式
const profileHeaderStyles = computed(() => ({
  position: 'relative',
  marginBottom: getSpacing(8),
  borderRadius: tokens.borderRadius.xl,
  overflow: 'hidden'
}))

const headerBackgroundStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  background: `linear-gradient(135deg, ${getColor('primary.600')} 0%, ${getColor('primary.800')} 100%)`,
  zIndex: '1'
}))

const backgroundPatternStyles = computed(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  opacity: '0.3'
}))

const headerContentStyles = computed(() => ({
  position: 'relative',
  zIndex: '2',
  padding: getSpacing(8),
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(8)
}))

// 用户信息样式
const userInfoSectionStyles = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: getSpacing(6),
  flexWrap: 'wrap'
}))

const avatarContainerStyles = computed(() => ({
  position: 'relative',
  flexShrink: '0'
}))

const avatarWrapperStyles = computed(() => ({
  position: 'relative',
  width: '120px',
  height: '120px'
}))

const avatarImageStyles = computed(() => ({
  width: '100%',
  height: '100%',
  borderRadius: tokens.borderRadius.full,
  objectFit: 'cover',
  border: `4px solid white`,
  boxShadow: getShadow('large')
}))

const avatarStatusStyles = computed(() => ({
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  width: '24px',
  height: '24px',
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const statusIndicatorStyles = computed(() => ({
  width: '12px',
  height: '12px',
  borderRadius: tokens.borderRadius.full,
  backgroundColor: user.value.isOnline ? getColor('success.500') : getColor('gray.400')
}))

const avatarEditButtonStyles = computed(() => ({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  width: '32px',
  height: '32px',
  backgroundColor: getColor('primary.600'),
  color: 'white',
  border: 'none',
  borderRadius: tokens.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: getShadow('medium'),
  transition: 'all 0.2s ease'
}))

const userDetailsStyles = computed(() => ({
  flex: '1',
  minWidth: '300px'
}))

const userNameStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['3xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: 'white',
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const userTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  color: 'rgba(255, 255, 255, 0.9)',
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const userEmailStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: getSpacing(4),
  margin: '0 0 1rem 0'
}))

const userTagsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(2),
  marginBottom: getSpacing(4),
  flexWrap: 'wrap'
}))

const userTagStyles = computed(() => ({
  padding: `${getSpacing(1)} ${getSpacing(3)}`,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontSize: tokens.typography.fontSize.sm[0],
  borderRadius: tokens.borderRadius.full,
  backdropFilter: 'blur(8px)'
}))

const userActionsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(3),
  flexWrap: 'wrap'
}))

const getPrimaryActionButtonStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  backgroundColor: 'white',
  color: getColor('primary.600'),
  border: 'none',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: getShadow('soft')
})

const getSecondaryActionButtonStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(2),
  padding: `${getSpacing(3)} ${getSpacing(4)}`,
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.typography.fontSize.sm[0],
  fontWeight: tokens.typography.fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(8px)'
})

// 统计数据样式
const statsSectionStyles = computed(() => ({
  alignSelf: 'flex-end'
}))

const statsGridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: getSpacing(4)
}))

const statCardStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: getSpacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: tokens.borderRadius.lg,
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}))

const getStatIconStyles = (type: string) => {
  const iconColors = {
    articles: 'rgba(59, 130, 246, 0.8)',
    followers: 'rgba(16, 185, 129, 0.8)',
    likes: 'rgba(239, 68, 68, 0.8)',
    views: 'rgba(245, 158, 11, 0.8)'
  }
  
  return {
    color: iconColors[type as keyof typeof iconColors] || 'white',
    marginBottom: getSpacing(2)
  }
}

const statContentStyles = computed(() => ({
  textAlign: 'center'
}))

const statNumberStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: 'white',
  lineHeight: '1'
}))

const statLabelStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: 'rgba(255, 255, 255, 0.8)',
  marginTop: getSpacing(1)
}))

// 导航标签样式
const profileNavStyles = computed(() => ({
  marginBottom: getSpacing(8),
  borderBottom: `1px solid ${getColor('gray.200')}`
}))

const navContainerStyles = computed(() => ({
  overflow: 'auto'
}))

const navTabsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(1),
  minWidth: 'max-content'
}))

const getNavTabStyles = (tabId: string) => {
  const isActive = activeTab.value === tabId
  return {
    display: 'flex',
    alignItems: 'center',
    gap: getSpacing(2),
    padding: `${getSpacing(3)} ${getSpacing(4)}`,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${isActive ? getColor('primary.600') : 'transparent'}`,
    color: isActive ? getColor('primary.600') : getColor('gray.600'),
    fontSize: tokens.typography.fontSize.sm[0],
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  }
}

const tabCountStyles = computed(() => ({
  padding: `${getSpacing(1)} ${getSpacing(2)}`,
  backgroundColor: getColor('gray.100'),
  color: getColor('gray.600'),
  fontSize: tokens.typography.fontSize.xs[0],
  borderRadius: tokens.borderRadius.full,
  minWidth: '20px',
  textAlign: 'center'
}))

// 主内容样式
const profileMainStyles = computed(() => ({
  minHeight: '400px'
}))

const sectionHeaderStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: getSpacing(6),
  flexWrap: 'wrap',
  gap: getSpacing(4)
}))

const sectionTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize['2xl'][0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('gray.900'),
  margin: '0'
}))

const sectionActionsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(3)
}))

const contentFiltersStyles = computed(() => ({
  marginBottom: getSpacing(6)
}))

const articlesGridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: getSpacing(6),
  marginBottom: getSpacing(8)
}))

const favoritesGridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: getSpacing(6),
  marginBottom: getSpacing(8)
}))

// 购买记录样式
const purchasesListStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: getSpacing(4)
}))

const purchaseItemStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: getSpacing(4),
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  border: `1px solid ${getColor('gray.200')}`,
  transition: 'all 0.2s ease'
}))

const purchaseContentStyles = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: '1',
  marginRight: getSpacing(4)
}))

const purchaseInfoStyles = computed(() => ({
  flex: '1'
}))

const purchaseTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900'),
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const purchaseDateStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

const purchasePriceStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.lg[0],
  fontWeight: tokens.typography.fontWeight.bold,
  color: getColor('primary.600')
}))

const purchaseActionsStyles = computed(() => ({
  display: 'flex',
  gap: getSpacing(2)
}))

// 设置样式
const settingsGridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: getSpacing(4)
}))

const settingItemStyles = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: getSpacing(4),
  padding: getSpacing(4),
  backgroundColor: 'white',
  borderRadius: tokens.borderRadius.lg,
  border: `1px solid ${getColor('gray.200')}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}))

const settingIconStyles = computed(() => ({
  flexShrink: '0',
  color: getColor('primary.600')
}))

const settingContentStyles = computed(() => ({
  flex: '1'
}))

const settingTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  fontWeight: tokens.typography.fontWeight.medium,
  color: getColor('gray.900'),
  marginBottom: getSpacing(1),
  margin: '0 0 0.25rem 0'
}))

const settingDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.sm[0],
  color: getColor('gray.600'),
  margin: '0'
}))

const settingArrowStyles = computed(() => ({
  color: getColor('gray.400')
}))

// 空状态样式
const emptyStateStyles = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: getSpacing(12),
  textAlign: 'center'
}))

const emptyIconStyles = computed(() => ({
  color: getColor('gray.400'),
  marginBottom: getSpacing(4)
}))

const emptyTitleStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.xl[0],
  fontWeight: tokens.typography.fontWeight.semibold,
  color: getColor('gray.900'),
  marginBottom: getSpacing(2),
  margin: '0 0 0.5rem 0'
}))

const emptyDescriptionStyles = computed(() => ({
  fontSize: tokens.typography.fontSize.base[0],
  color: getColor('gray.600'),
  marginBottom: getSpacing(6),
  margin: '0 0 1.5rem 0'
}))

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 事件处理函数
const handleGlobalSearch = (query: string) => {
  // 全局搜索处理
}

const handleAvatarEdit = () => {
  showNotification('info', '头像编辑功能开发中')
}

const handleEditProfile = () => {
  router.push('/profile/edit')
}

const handleSettings = () => {
  setActiveTab('settings')
}

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
  
  // 更新URL
  const query = { ...route.query }
  if (tabId !== 'articles') {
    query.tab = tabId
  } else {
    delete query.tab
  }
  router.replace({ query })
}

const handleArticleCategorySelect = (categoryId: string) => {
  selectedArticleCategory.value = categoryId
}

const handleCreateArticle = () => {
  router.push('/articles/create')
}

const handleArticleClick = (article: Article) => {
  router.push(`/articles/${article.id}`)
}

const handleArticleEdit = (article: Article) => {
  router.push(`/articles/${article.id}/edit`)
}

const handleArticleDelete = (article: Article) => {
  // 删除文章逻辑
  showNotification('success', '文章删除成功')
}

const handleToggleFavorite = (article: Article) => {
  // 切换收藏状态
  showNotification('success', '已取消收藏')
}

const handleViewPurchase = (purchase: Purchase) => {
  if (purchase.type === 'article') {
    router.push(`/articles/${purchase.id}`)
  } else {
    router.push(`/collections/${purchase.id}`)
  }
}

const handleSettingClick = (setting: SettingOption) => {
  router.push(setting.path)
}

// 数据加载
const loadUserData = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    userArticles.value = [
      {
        id: '1',
        title: 'Vue 3 Composition API 深度解析',
        excerpt: '深入了解 Vue 3 Composition API 的设计理念和最佳实践',
        category: 'frontend',
        publishedAt: '2024-12-10',
        viewCount: 1234,
        likeCount: 89,
        isPaid: false
      }
      // 更多文章...
    ]
    
    userFavorites.value = [
      {
        id: '2',
        title: 'React Hooks 最佳实践',
        excerpt: 'React Hooks 的使用技巧和注意事项',
        category: 'frontend',
        publishedAt: '2024-12-09',
        viewCount: 2345,
        likeCount: 156,
        isPaid: true,
        price: 29.9
      }
      // 更多收藏...
    ]
    
    userPurchases.value = [
      {
        id: '3',
        title: 'Node.js 微服务架构实战',
        price: 99.9,
        purchaseDate: '2024-12-08',
        type: 'article'
      }
      // 更多购买记录...
    ]
    
  } catch (error) {
    console.error('Load user data error:', error)
    showNotification('error', '加载用户数据失败')
  }
}

// 组件挂载
onMounted(() => {
  // 从URL恢复活跃标签
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && tabs.value.some(tab => tab.id === tabFromQuery)) {
    activeTab.value = tabFromQuery
  }
  
  // 加载用户数据
  loadUserData()
})
</script>

<style scoped>
.avatar-edit-button:hover {
  background-color: var(--color-primary-700);
  transform: scale(1.05);
}

.action-button.primary:hover {
  background-color: var(--color-gray-100);
  transform: translateY(-1px);
}

.action-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.nav-tab:hover {
  color: var(--color-primary-600);
}

.nav-tab.active .tab-count {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.purchase-item:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.setting-item:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
  border-color: var(--color-primary-300);
}

.setting-item:hover .setting-icon {
  color: var(--color-primary-700);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    padding: 1.5rem;
  }
  
  .user-info-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stats-section {
    align-self: stretch;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nav-tabs {
    padding: 0 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .articles-grid,
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .purchase-content {
    flex-direction: column;
    align-items: flex-start;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .user-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .purchase-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .purchase-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .avatar-edit-button,
  .action-button,
  .nav-tab,
  .purchase-item,
  .setting-item {
    transition: none !important;
    transform: none !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .header-background {
    border: 2px solid white;
  }
  
  .stat-card,
  .purchase-item,
  .setting-item {
    border: 2px solid currentColor;
  }
}

/* 打印样式 */
@media print {
  .profile-nav,
  .user-actions,
  .section-actions,
  .purchase-actions {
    display: none;
  }
  
  .header-background {
    background: white !important;
  }
  
  .user-name,
  .user-title,
  .user-email {
    color: black !important;
  }
}
</style>
