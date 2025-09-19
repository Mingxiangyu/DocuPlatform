<template>
  <DSDefaultLayout>
    <!-- 滚动进度条 -->
    <DSProgressBar
      :scroll-progress="true"
      position="fixed-top"
      variant="gradient"
      size="xs"
      :animated="true"
    />

    <!-- 新的英雄区域 -->
    <DSHeroSection
      title="发现优质技术文档"
      subtitle="提升你的开发技能"
      description="汇聚全网精选技术文档，从入门到进阶，助你成为更优秀的开发者"
      :image="{
        src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        alt: 'DocuVault知识平台插图'
      }"
      :primary-action="{
        text: '开始探索',
        variant: 'primary',
        size: 'lg'
      }"
      variant="prototype"
      size="lg"
      :show-floating-elements="false"
      :show-features="false"
      :show-stats="false"
      :animation="true"
      @primary-action="handleStartExploring"
    >
      <template #actions>
        <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
          <!-- 搜索区域 -->
          <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
            <div style="position: relative; flex: 1; max-width: 400px;">
              <input
                v-model="heroSearchQuery"
                type="text"
                placeholder="搜索 React、Python、Java..."
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem; font-size: 1rem; outline: none; transition: all 0.3s ease;"
                @keyup.enter="handleHeroSearch"
                @focus="(e) => { e.target.style.borderColor = 'rgb(147, 51, 234)'; e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)'; }"
                @blur="(e) => { e.target.style.borderColor = 'rgb(209, 213, 219)'; e.target.style.boxShadow = 'none'; }"
              />
              <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: rgb(156, 163, 175);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <button
              style="padding: 0.75rem 1.5rem; background-color: rgb(147, 51, 234); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;"
              @click="handleStartExploring"
              @mouseenter="(e) => e.target.style.backgroundColor = 'rgb(126, 34, 206)'"
              @mouseleave="(e) => e.target.style.backgroundColor = 'rgb(147, 51, 234)'"
            >
              开始探索
            </button>
          </div>

          <!-- 热门标签区域 -->
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <span style="font-size: 0.875rem; color: rgb(107, 114, 128); font-weight: 500;">热门搜索:</span>
            <a
              href="/search?q=React"
              style="font-size: 0.875rem; color: rgb(147, 51, 234); text-decoration: none; padding: 0.25rem 0.75rem; border-radius: 9999px; background-color: rgb(250, 245, 255); transition: all 0.2s ease;"
              @mouseenter="(e) => { e.target.style.backgroundColor = 'rgb(243, 232, 255)'; e.target.style.color = 'rgb(126, 34, 206)'; }"
              @mouseleave="(e) => { e.target.style.backgroundColor = 'rgb(250, 245, 255)'; e.target.style.color = 'rgb(147, 51, 234)'; }"
            >React</a>
            <a
              href="/search?q=Python"
              style="font-size: 0.875rem; color: rgb(147, 51, 234); text-decoration: none; padding: 0.25rem 0.75rem; border-radius: 9999px; background-color: rgb(250, 245, 255); transition: all 0.2s ease;"
              @mouseenter="(e) => { e.target.style.backgroundColor = 'rgb(243, 232, 255)'; e.target.style.color = 'rgb(126, 34, 206)'; }"
              @mouseleave="(e) => { e.target.style.backgroundColor = 'rgb(250, 245, 255)'; e.target.style.color = 'rgb(147, 51, 234)'; }"
            >Python</a>
            <a
              href="/search?q=JavaScript"
              style="font-size: 0.875rem; color: rgb(147, 51, 234); text-decoration: none; padding: 0.25rem 0.75rem; border-radius: 9999px; background-color: rgb(250, 245, 255); transition: all 0.2s ease;"
              @mouseenter="(e) => { e.target.style.backgroundColor = 'rgb(243, 232, 255)'; e.target.style.color = 'rgb(126, 34, 206)'; }"
              @mouseleave="(e) => { e.target.style.backgroundColor = 'rgb(250, 245, 255)'; e.target.style.color = 'rgb(147, 51, 234)'; }"
            >JavaScript</a>
          </div>
        </div>
      </template>

      <template #media>
        <div style="position: relative; width: 100%; max-width: 500px; margin: 0 auto;">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            alt="技术文档展示"
            style="width: 100%; height: auto; border-radius: 0.75rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display: block;"
            @error="handleImageError"
          />
        </div>
      </template>
    </DSHeroSection>

    <!-- 分类导航区域 -->
    <section style="padding: 4rem 0; background-color: rgb(249, 250, 251);">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); font-family: serif;">浏览分类</h2>
          <router-link
            to="/categories"
            style="color: rgb(147, 51, 234); display: flex; align-items: center; font-size: 0.875rem; font-weight: 500; transition: color 0.3s ease;"
            @mouseenter="(e) => e.target.style.color = 'rgb(126, 34, 206)'"
            @mouseleave="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
          >
            查看全部
            <svg style="margin-left: 0.25rem; width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </router-link>
        </div>

        <DSCategoryGrid
          :categories="simplifiedCategories"
          :loading="categoriesLoading"
          :scroll-animation="true"
          :animation-stagger="100"
          gap="md"
          variant="compact"
          card-variant="minimal"
          card-size="sm"
          :card-animation="true"
          aria-label="知识分类导航"
          @category-click="handleCategoryClick"
          @category-hover="handleCategoryHover"
        />
      </div>
    </section>

    <!-- 热门推荐区域 -->
    <section style="padding: 4rem 0; background-color: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); font-family: serif;">热门推荐</h2>
          <router-link
            to="/articles?sort=popular"
            style="color: rgb(147, 51, 234); display: flex; align-items: center; font-size: 0.875rem; font-weight: 500; transition: color 0.3s ease;"
            @mouseenter="(e) => e.target.style.color = 'rgb(126, 34, 206)'"
            @mouseleave="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
          >
            更多热门
            <svg style="margin-left: 0.25rem; width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </router-link>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 100%;">
          <div
            v-for="article in popularArticles.slice(0, 3)"
            :key="article.id"
            style="background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: box-shadow 0.3s ease; cursor: pointer;"
            @click="handleViewArticle(article.id)"
            @mouseenter="(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'"
            @mouseleave="(e) => e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'"
          >
            <img
              :src="article.coverImage"
              :alt="article.title"
              style="width: 100%; height: 12rem; object-fit: cover; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem;"
            />
            <div style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="padding: 0.25rem 0.5rem; background-color: rgb(243, 232, 255); color: rgb(126, 34, 206); font-size: 0.75rem; font-weight: 500; border-radius: 9999px;">
                  {{ article.category?.name || '技术' }}
                </span>
              </div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: rgb(17, 24, 39); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ article.title }}
              </h3>
              <p style="color: rgb(107, 114, 128); font-size: 0.875rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                {{ article.summary }}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <img
                    :src="article.author?.avatar"
                    :alt="article.author?.name"
                    style="width: 24px; height: 24px; border-radius: 50%;"
                  />
                  <span style="font-size: 0.875rem; color: rgb(55, 65, 81);">{{ article.author?.name }}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: rgb(107, 114, 128);">
                  <span>{{ article.viewCount }} 阅读</span>
                  <span>{{ article.likeCount }} 点赞</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新发布区域 -->
    <section style="padding: 4rem 0; background-color: rgb(249, 250, 251);">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); font-family: serif;">最新发布</h2>
          <router-link
            to="/articles?sort=latest"
            style="color: rgb(147, 51, 234); display: flex; align-items: center; font-size: 0.875rem; font-weight: 500; transition: color 0.3s ease;"
            @mouseenter="(e) => e.target.style.color = 'rgb(126, 34, 206)'"
            @mouseleave="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
          >
            更多最新
            <svg style="margin-left: 0.25rem; width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </router-link>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 100%;">
          <div
            v-for="article in latestArticles.slice(0, 3)"
            :key="article.id"
            style="background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: box-shadow 0.3s ease; cursor: pointer;"
            @click="handleViewArticle(article.id)"
            @mouseenter="(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'"
            @mouseleave="(e) => e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'"
          >
            <img
              :src="article.coverImage"
              :alt="article.title"
              style="width: 100%; height: 12rem; object-fit: cover; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem;"
            />
            <div style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="padding: 0.25rem 0.5rem; background-color: rgb(220, 252, 231); color: rgb(22, 163, 74); font-size: 0.75rem; font-weight: 500; border-radius: 9999px;">
                  最新
                </span>
                <span style="padding: 0.25rem 0.5rem; background-color: rgb(243, 232, 255); color: rgb(126, 34, 206); font-size: 0.75rem; font-weight: 500; border-radius: 9999px;">
                  {{ article.category?.name || '技术' }}
                </span>
                <span style="font-size: 0.75rem; color: rgb(107, 114, 128);">{{ article.publishedAt }}</span>
              </div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: rgb(17, 24, 39); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ article.title }}
              </h3>
              <p style="color: rgb(107, 114, 128); font-size: 0.875rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                {{ article.summary }}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <img
                    :src="article.author?.avatar"
                    :alt="article.author?.name"
                    style="width: 24px; height: 24px; border-radius: 50%;"
                  />
                  <span style="font-size: 0.875rem; color: rgb(55, 65, 81);">{{ article.author?.name }}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: rgb(107, 114, 128);">
                  <span>{{ article.viewCount }} 阅读</span>
                  <span>{{ article.likeCount }} 点赞</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 精选作者区域 -->
    <section style="padding: 4rem 0; background-color: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: rgb(17, 24, 39); font-family: serif;">精选作者</h2>
          <router-link
            to="/authors"
            style="color: rgb(147, 51, 234); display: flex; align-items: center; font-size: 0.875rem; font-weight: 500; transition: color 0.3s ease;"
            @mouseenter="(e) => e.target.style.color = 'rgb(126, 34, 206)'"
            @mouseleave="(e) => e.target.style.color = 'rgb(147, 51, 234)'"
          >
            查看全部作者
            <svg style="margin-left: 0.25rem; width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </router-link>
        </div>

        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; max-width: 100%;">
          <div
            v-for="author in featuredAuthors"
            :key="author.id"
            style="background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s ease;"
            @click="handleViewAuthor(author)"
            @mouseenter="(e) => { e.target.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)'; e.target.style.transform = 'translateY(-2px)'; }"
            @mouseleave="(e) => { e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'; e.target.style.transform = 'translateY(0px)'; }"
          >
            <div style="margin-bottom: 0.75rem;">
              <img
                :src="author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80'"
                :alt="author.name"
                style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin: 0 auto;"
              />
            </div>
            <div>
              <h3 style="font-size: 0.875rem; font-weight: 600; color: rgb(31, 41, 55); margin-bottom: 0.25rem;">{{ author.name }}</h3>
              <p style="font-size: 0.75rem; color: rgb(107, 114, 128); margin-bottom: 0.5rem;">{{ author.field || '技术专家' }}</p>
              <div style="font-size: 0.6875rem; color: rgb(156, 163, 175);">
                <span>{{ author.articleCount || 0 }} 篇文章</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>





    <!-- 订阅区域 -->
    <section style="padding: 4rem 0; background: linear-gradient(to right, rgb(250, 245, 255), rgb(243, 232, 255));">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; text-align: center;">
        <h2 style="font-size: 1.875rem; font-weight: 700; color: rgb(17, 24, 39); margin-bottom: 1rem;">订阅技术文档更新</h2>
        <p style="font-size: 1.125rem; color: rgb(75, 85, 99); margin-bottom: 2rem;">及时获取最新技术文档和教程，提升你的开发技能</p>

        <div style="display: flex; flex-direction: row; gap: 1rem; max-width: 28rem; margin: 0 auto; align-items: center;">
          <input
            v-model="subscriptionEmail"
            type="email"
            placeholder="输入你的邮箱地址"
            style="flex: 1; padding: 0.75rem 1rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem; font-size: 1rem; background-color: white; outline: none; transition: all 0.2s ease;"
            @focus="(e) => { e.target.style.borderColor = 'rgb(147, 51, 234)'; e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)'; }"
            @blur="(e) => { e.target.style.borderColor = 'rgb(209, 213, 219)'; e.target.style.boxShadow = 'none'; }"
          />
          <button
            style="padding: 0.75rem 1.5rem; background-color: rgb(147, 51, 234); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;"
            @click="handleSubscribe"
            @mouseenter="(e) => e.target.style.backgroundColor = 'rgb(126, 34, 206)'"
            @mouseleave="(e) => e.target.style.backgroundColor = 'rgb(147, 51, 234)'"
          >
            立即订阅
          </button>
        </div>

        <p style="font-size: 0.875rem; color: rgb(107, 114, 128); margin-top: 1rem;">我们尊重你的隐私，不会向第三方分享你的信息</p>
      </div>
    </section>


  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSHeroSection from '../components/organisms/DSHeroSection.vue'
import DSCategoryGrid from '../components/organisms/DSCategoryGrid.vue'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSAuthorCard from '../components/molecules/DSAuthorCard.vue'
import DSSkeletonLoader from '../components/atoms/DSSkeletonLoader.vue'
import DSProgressBar from '../components/atoms/DSProgressBar.vue'
import { useArticlesStore } from '../stores/articles'
import { eventBus } from '../utils/EventBus'
import type { Article } from '../types/api'

// 图标组件（简化版，移除固定尺寸让其适应容器）
const CodeIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>' }
const ServerIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM4 7h12V5H4v2zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM4 15h12v-2H4v2z" clip-rule="evenodd" /></svg>' }
const DatabaseIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>' }
const MobileIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM8 16a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd" /></svg>' }
const CloudIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /></svg>' }
const SecurityIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' }
const DesignIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1z" clip-rule="evenodd" /></svg>' }
const AIIcon = { template: '<svg width="100%" height="100%" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>' }

const router = useRouter()
const articlesStore = useArticlesStore()

const articlesLoading = ref(true)
const categoriesLoading = ref(false)
const featuredArticles = ref<Article[]>([])

// 静态模拟数据 - 确保立即显示
const popularArticles = ref<Article[]>([
  {
    id: 'popular-1',
    title: 'Modern React Hooks 完全指南',
    summary: '深入探讨 React Hooks 的设计原理、核心 API 以及实战应用，帮助你掌握这一现代 React 开发的必备技能。',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: '前端开发' },
    author: { name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '1.2k',
    likeCount: 89
  },
  {
    id: 'popular-2',
    title: 'Python 数据分析实战：从入门到精通',
    summary: '使用 Pandas、NumPy 和 Matplotlib 进行数据分析的完整指南，包含实际案例和最佳实践。',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: '数据科学' },
    author: { name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '2.5k',
    likeCount: 156
  },
  {
    id: 'popular-3',
    title: 'Docker 容器化与 Kubernetes 编排指南',
    summary: '学习如何使用 Docker 容器化应用程序，并通过 Kubernetes 实现自动化部署、扩展和管理。',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: 'DevOps' },
    author: { name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '1.8k',
    likeCount: 112
  }
])

const latestArticles = ref<Article[]>([
  {
    id: 'latest-1',
    title: 'TypeScript 5.0 新特性全解析',
    summary: '深入了解 TypeScript 5.0 的最新特性，包括装饰器、枚举增强、模块解析改进等内容。',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: '前端开发' },
    author: { name: '赵六', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '342',
    likeCount: 28,
    publishedAt: '2024-09-05'
  },
  {
    id: 'latest-2',
    title: 'Flutter 3.16 跨平台应用开发实战',
    summary: '使用 Flutter 3.16 开发高性能跨平台应用，从 UI 设计到状态管理，再到原生功能集成。',
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: '移动开发' },
    author: { name: '钱七', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '289',
    likeCount: 21,
    publishedAt: '2024-09-03'
  },
  {
    id: 'latest-3',
    title: 'Go 语言并发编程模式与最佳实践',
    summary: '深入探讨 Go 语言的并发模型，学习 goroutine、channel、select 等并发编程模式。',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: { name: '后端开发' },
    author: { name: '孙八', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80' },
    viewCount: '412',
    likeCount: 35,
    publishedAt: '2024-09-01'
  }
])

const featuredAuthors = ref<any[]>([
  { id: 'author-1', name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '前端技术专家', articleCount: 32 },
  { id: 'author-2', name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '数据科学家', articleCount: 24 },
  { id: 'author-3', name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: 'DevOps 工程师', articleCount: 18 },
  { id: 'author-4', name: '赵六', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '全栈开发者', articleCount: 41 },
  { id: 'author-5', name: '钱七', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '移动开发专家', articleCount: 27 },
  { id: 'author-6', name: '孙八', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '后端架构师', articleCount: 35 }
])

const heroSearchQuery = ref('')
const subscriptionEmail = ref('')

// 分类数据
const categories = ref([
  {
    id: 'frontend',
    title: '前端开发',
    description: 'React, Vue, Angular等现代前端技术',
    type: 'frontend' as const,
    articleCount: 1250,
    authorCount: 89,
    tags: ['React', 'Vue', 'TypeScript'],
    icon: CodeIcon
  },
  {
    id: 'backend',
    title: '后端开发',
    description: 'Node.js, Python, Java等后端技术栈',
    type: 'backend' as const,
    articleCount: 980,
    authorCount: 67,
    tags: ['Node.js', 'Python', 'Java'],
    icon: ServerIcon
  },
  {
    id: 'mobile',
    title: '移动开发',
    description: 'iOS, Android, React Native等移动端开发',
    type: 'mobile' as const,
    articleCount: 650,
    authorCount: 45,
    tags: ['iOS', 'Android', 'Flutter'],
    icon: MobileIcon
  },
  {
    id: 'design',
    title: 'UI/UX设计',
    description: '用户界面设计和用户体验优化',
    type: 'design' as const,
    articleCount: 420,
    authorCount: 32,
    tags: ['Figma', 'Sketch', 'Prototyping'],
    icon: DesignIcon
  },
  {
    id: 'devops',
    title: 'DevOps运维',
    description: 'Docker, Kubernetes, CI/CD等运维技术',
    type: 'devops' as const,
    articleCount: 380,
    authorCount: 28,
    tags: ['Docker', 'K8s', 'AWS'],
    icon: CloudIcon
  },
  {
    id: 'ai',
    title: '人工智能',
    description: '机器学习, 深度学习, AI应用开发',
    type: 'ai' as const,
    articleCount: 520,
    authorCount: 41,
    tags: ['TensorFlow', 'PyTorch', 'OpenAI'],
    icon: AIIcon
  }
])

// 简化的分类数据，完全匹配高保真原型
const simplifiedCategories = ref([
  {
    id: 'frontend',
    title: '前端开发',
    type: 'frontend' as const,
    articleCount: 248,
    description: '248 篇文档',
    icon: CodeIcon
  },
  {
    id: 'backend',
    title: '后端开发',
    type: 'backend' as const,
    articleCount: 186,
    description: '186 篇文档',
    icon: ServerIcon
  },
  {
    id: 'database',
    title: '数据库',
    type: 'database' as const,
    articleCount: 124,
    description: '124 篇文档',
    icon: DatabaseIcon
  },
  {
    id: 'mobile',
    title: '移动开发',
    type: 'mobile' as const,
    articleCount: 98,
    description: '98 篇文档',
    icon: MobileIcon
  },
  {
    id: 'cloud',
    title: '云计算',
    type: 'cloud' as const,
    articleCount: 76,
    description: '76 篇文档',
    icon: CloudIcon
  },
  {
    id: 'security',
    title: '网络安全',
    type: 'security' as const,
    articleCount: 63,
    description: '63 篇文档',
    icon: SecurityIcon
  }
])

const loadFeaturedArticles = async () => {
  try {
    articlesLoading.value = true
    const result = await articlesStore.fetchArticles({
      limit: 6,
      status: 'PUBLISHED',
      sortBy: 'viewCount',
      sortOrder: 'desc'
    })

    if (result.success) {
      featuredArticles.value = articlesStore.articles
    }
  } catch (error) {
    console.error('加载精选文章失败:', error)
    eventBus.emit('ui:notification', {
      type: 'error',
      message: '加载精选文章失败'
    })
  } finally {
    articlesLoading.value = false
  }
}

const loadPopularArticles = async () => {
  try {
    const result = await articlesStore.fetchArticles({
      limit: 3,
      status: 'PUBLISHED',
      sortBy: 'viewCount',
      sortOrder: 'desc'
    })

    if (result.success && articlesStore.articles.length > 0) {
      popularArticles.value = articlesStore.articles.slice(0, 3)
    } else {
      throw new Error('No articles found')
    }
  } catch (error) {
    console.error('加载热门文章失败:', error)
    // 使用模拟数据作为后备
    popularArticles.value = [
      {
        id: 'popular-1',
        title: 'React 18 新特性深度解析',
        summary: '深入了解 React 18 的并发特性、自动批处理、Suspense 改进等核心功能',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: '前端开发' },
        viewCount: 1250,
        likeCount: 89,
        createdAt: new Date().toISOString()
      },
      {
        id: 'popular-2',
        title: 'Python 异步编程最佳实践',
        summary: '掌握 asyncio、async/await 语法，构建高性能异步应用程序',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: '后端开发' },
        viewCount: 980,
        likeCount: 67,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'popular-3',
        title: 'Docker 容器化部署指南',
        summary: '从基础概念到生产环境部署，全面掌握 Docker 容器技术',
        coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: 'DevOps运维' },
        viewCount: 756,
        likeCount: 45,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  }
}

const loadLatestArticles = async () => {
  try {
    const result = await articlesStore.fetchArticles({
      limit: 3,
      status: 'PUBLISHED',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    if (result.success && articlesStore.articles.length > 0) {
      latestArticles.value = articlesStore.articles.slice(0, 3)
    } else {
      throw new Error('No articles found')
    }
  } catch (error) {
    console.error('加载最新文章失败:', error)
    // 使用模拟数据作为后备
    latestArticles.value = [
      {
        id: 'latest-1',
        title: 'Vue 3.4 版本更新详解',
        summary: '探索 Vue 3.4 的新功能：defineModel、v-bind 同名简写、改进的水合等',
        coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '赵六', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: '前端开发' },
        viewCount: 234,
        likeCount: 18,
        createdAt: new Date().toISOString()
      },
      {
        id: 'latest-2',
        title: 'TypeScript 5.0 新特性一览',
        summary: '了解 TypeScript 5.0 的装饰器、const 断言、模板字面量类型等新功能',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '孙七', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: '前端开发' },
        viewCount: 189,
        likeCount: 12,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'latest-3',
        title: 'Kubernetes 集群监控实战',
        summary: '使用 Prometheus + Grafana 构建完整的 K8s 集群监控体系',
        coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        author: { name: '周八', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
        category: { name: 'DevOps运维' },
        viewCount: 156,
        likeCount: 9,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  }
}

const loadFeaturedAuthors = async () => {
  try {
    // 这里应该调用实际的API
    // const result = await authorsStore.fetchFeaturedAuthors({ limit: 6 })

    // 使用模拟数据作为后备
    featuredAuthors.value = [
      {
        id: 'author-1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: '前端架构师',
        articleCount: 45
      },
      {
        id: 'author-2',
        name: '李四',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: '后端专家',
        articleCount: 38
      },
      {
        id: 'author-3',
        name: '王五',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: 'DevOps工程师',
        articleCount: 29
      },
      {
        id: 'author-4',
        name: '赵六',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: 'UI/UX设计师',
        articleCount: 22
      },
      {
        id: 'author-5',
        name: '孙七',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: 'AI研究员',
        articleCount: 31
      },
      {
        id: 'author-6',
        name: '周八',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        field: '移动开发专家',
        articleCount: 26
      }
    ]
  } catch (error) {
    console.error('加载精选作者失败:', error)
  }
}

// 英雄区域事件处理
const handleStartExploring = () => {
  if (heroSearchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(heroSearchQuery.value)}`)
  } else {
    router.push('/articles')
  }
}

const handleHeroSearch = () => {
  if (heroSearchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(heroSearchQuery.value)}`)
  }
}

const handleImageError = () => {
  console.log('英雄区域图片加载失败，使用默认插图')
}

// 分类点击处理
const handleCategoryClick = (category: any) => {
  router.push(`/articles?category=${category.type}`)
}

// 分类悬停处理
const handleCategoryHover = (category: any, event: MouseEvent) => {
  // 可以在这里添加悬停预览逻辑
  console.log('分类悬停:', category.title)
}

// 文章相关处理
const handleViewArticle = (articleId: string) => {
  router.push(`/articles/${articleId}`)
}

const handlePurchaseArticle = (articleId: string) => {
  router.push(`/articles/${articleId}/purchase`)
}

const handleLikeArticle = async (articleId: string) => {
  try {
    await articlesStore.likeArticle(articleId)
    eventBus.emit('ui:notification', {
      type: 'success',
      message: '点赞成功'
    })
  } catch (error) {
    eventBus.emit('ui:notification', {
      type: 'error',
      message: '点赞失败'
    })
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 作者相关处理
const handleViewAuthor = (author: any) => {
  router.push(`/authors/${author.id}`)
}

// 订阅处理
const handleSubscribe = () => {
  if (!subscriptionEmail.value.trim()) {
    eventBus.emit('ui:notification', {
      type: 'warning',
      message: '请输入邮箱地址'
    })
    return
  }

  // 这里应该调用实际的订阅API
  eventBus.emit('ui:notification', {
    type: 'success',
    message: '订阅成功！我们会及时向您推送最新内容'
  })

  subscriptionEmail.value = ''
}

onMounted(() => {
  // 直接设置模拟数据，确保内容显示
  popularArticles.value = [
    {
      id: 'popular-1',
      title: 'Modern React Hooks 完全指南',
      summary: '深入探讨 React Hooks 的设计原理、核心 API 以及实战应用，帮助你掌握这一现代 React 开发的必备技能。',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: '前端开发' },
      viewCount: 1200,
      likeCount: 89,
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular-2',
      title: 'Python 数据分析实战：从入门到精通',
      summary: '使用 Pandas、NumPy 和 Matplotlib 进行数据分析的完整指南，包含实际案例和最佳实践。',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: '数据科学' },
      viewCount: 2500,
      likeCount: 156,
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular-3',
      title: 'Docker 容器化与 Kubernetes 编排指南',
      summary: '学习如何使用 Docker 容器化应用程序，并通过 Kubernetes 实现自动化部署、扩展和管理。',
      coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: 'DevOps' },
      viewCount: 1800,
      likeCount: 112,
      createdAt: new Date().toISOString()
    }
  ]

  latestArticles.value = [
    {
      id: 'latest-1',
      title: 'TypeScript 5.0 新特性全解析',
      summary: '深入了解 TypeScript 5.0 的最新特性，包括装饰器、枚举增强、模块解析改进等内容。',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '赵六', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: '前端开发' },
      viewCount: 342,
      likeCount: 28,
      createdAt: '2024-09-05'
    },
    {
      id: 'latest-2',
      title: 'Flutter 3.16 跨平台应用开发实战',
      summary: '使用 Flutter 3.16 开发高性能跨平台应用，从 UI 设计到状态管理，再到原生功能集成。',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '钱七', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: '移动开发' },
      viewCount: 289,
      likeCount: 21,
      createdAt: '2024-09-03'
    },
    {
      id: 'latest-3',
      title: 'Go 语言并发编程模式与最佳实践',
      summary: '深入探讨 Go 语言的并发模型，学习 goroutine、channel、select 等并发编程模式。',
      coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: { name: '孙八', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80' },
      category: { name: '后端开发' },
      viewCount: 412,
      likeCount: 35,
      createdAt: '2024-09-01'
    }
  ]

  featuredAuthors.value = [
    { id: 'author-1', name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '前端技术专家', articleCount: 32 },
    { id: 'author-2', name: '李四', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '数据科学家', articleCount: 24 },
    { id: 'author-3', name: '王五', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: 'DevOps 工程师', articleCount: 18 },
    { id: 'author-4', name: '赵六', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '全栈开发者', articleCount: 41 },
    { id: 'author-5', name: '钱七', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '移动开发专家', articleCount: 27 },
    { id: 'author-6', name: '孙八', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80', field: '后端架构师', articleCount: 35 }
  ]

  // 也尝试加载API数据作为备用
  loadFeaturedArticles()
  loadPopularArticles()
  loadLatestArticles()
  loadFeaturedAuthors()
})
</script>

<style scoped>
/* 英雄区域样式 */
.hero-search-container {
  @apply flex flex-col sm:flex-row gap-4 mb-6;
}

.hero-popular-tags {
  @apply flex items-center text-sm text-gray-600;
}

.btn-primary {
  @apply bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300;
}

/* 文章卡片样式 */
.article-card {
  @apply bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite 1.5s;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .hero-illustration-container {
    margin-top: 2rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-float-delayed {
    animation: none !important;
  }
}
</style>
