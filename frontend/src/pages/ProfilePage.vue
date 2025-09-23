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

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 用户信息卡片 -->
      <DSCard variant="elevated" padding="xl" class="mb-8" :animation="true">
        <div class="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-6 lg:space-y-0">
          <!-- 头像区域 -->
          <div class="flex flex-col items-center lg:items-start">
            <div class="relative group">
              <div class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-100 shadow-xl">
                <img
                  :src="user?.avatarUrl || '/default-avatar.png'"
                  :alt="user?.nickname"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <DSButton
                @click="showEditProfile = true"
                variant="primary"
                size="sm"
                class="absolute -bottom-2 -right-2 rounded-full p-3 shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </DSButton>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="flex-1 text-center lg:text-left">
            <h1 class="text-4xl font-bold text-gray-900 mb-3">{{ user?.nickname || '用户' }}</h1>
            <p class="text-xl text-gray-600 mb-6">{{ user?.email }}</p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-8 text-sm">
              <div class="flex items-center text-gray-600">
                <div class="w-5 h-5 mr-2 text-purple-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V9H5a1 1 0 110-2h3z"></path>
                  </svg>
                </div>
                <span>加入时间：{{ formatDate(user?.createdAt) }}</span>
              </div>

              <div class="flex items-center">
                <div class="icon-size mr-2" :class="user?.emailVerified ? 'text-green-500' : 'text-yellow-500'">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <span :class="user?.emailVerified ? 'text-green-600' : 'text-yellow-600'">
                  {{ user?.emailVerified ? '邮箱已验证' : '邮箱未验证' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-col space-y-3 lg:items-end">
            <DSButton @click="showEditProfile = true" variant="primary" size="lg" class="w-full lg:w-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              编辑资料
            </DSButton>
            <DSButton @click="goToSettings" variant="outline" size="lg" class="w-full lg:w-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              账户设置
            </DSButton>
          </div>
        </div>
      </DSCard>

      <!-- 统计数据 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 购买文章统计 -->
        <DSCard variant="elevated" padding="lg" :hover="true" :animation="true" class="group">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">购买文章</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{{ stats.purchasedArticles }}</p>
            </div>
          </div>
        </DSCard>

        <!-- 我的笔记统计 -->
        <DSCard variant="elevated" padding="lg" :hover="true" :animation="true" class="group">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">我的笔记</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ stats.notes }}</p>
            </div>
          </div>
        </DSCard>

        <!-- 高亮标记统计 -->
        <DSCard variant="elevated" padding="lg" :hover="true" :animation="true" class="group">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">高亮标记</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">{{ stats.highlights }}</p>
            </div>
          </div>
        </DSCard>

        <!-- 总消费统计 -->
        <DSCard variant="elevated" padding="lg" :hover="true" :animation="true" class="group">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">总消费</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">¥{{ stats.totalSpent }}</p>
            </div>
          </div>
        </DSCard>
      </div>

      <!-- 标签页导航 -->
      <DSCard variant="elevated" padding="none" class="overflow-hidden">
        <div class="border-b border-gray-100">
          <nav class="flex space-x-0 px-6">
            <DSButton
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :variant="activeTab === tab.id ? 'primary' : 'ghost'"
              size="lg"
              class="rounded-none border-b-2 transition-all duration-200"
              :class="[
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
              ]"
            >
              <svg v-if="tab.id === 'purchases'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <svg v-else-if="tab.id === 'notes'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <svg v-else-if="tab.id === 'highlights'" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
              </svg>
              {{ tab.name }}
            </DSButton>
          </nav>
        </div>

        <div class="p-6">
          <!-- 购买记录 -->
          <div v-if="activeTab === 'purchases'" class="space-y-6">
            <div v-if="purchases.length === 0" class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">暂无购买记录</h3>
              <p class="text-gray-600 mb-6 max-w-sm mx-auto">去发现一些优质的付费内容，开始你的知识之旅吧</p>
              <DSButton @click="goToArticles" variant="primary" size="lg">
                <svg class="icon-size mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                浏览文章
              </DSButton>
            </div>

            <div v-else class="space-y-4">
              <DSCard
                v-for="purchase in purchases"
                :key="purchase.id"
                variant="outlined"
                padding="lg"
                :hover="true"
                :clickable="true"
                @click="goToArticle(purchase.articleId)"
                class="group cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                      {{ purchase.articleTitle }}
                    </h4>
                    <div class="flex items-center text-sm text-gray-600 space-x-4">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V9H5a1 1 0 110-2h3z"></path>
                        </svg>
                        购买时间：{{ formatDate(purchase.createdAt) }}
                      </div>
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        已购买
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4 ml-6">
                    <div class="text-right">
                      <div class="text-2xl font-bold text-purple-600">¥{{ purchase.amount }}</div>
                      <div class="text-sm text-gray-500">支付金额</div>
                    </div>
                    <DSButton variant="primary" size="md" class="flex-shrink-0">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                      阅读
                    </DSButton>
                  </div>
                </div>
              </DSCard>
            </div>
          </div>

          <!-- 我的笔记 -->
          <div v-if="activeTab === 'notes'" class="space-y-6">
            <div v-if="notes.length === 0" class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">暂无笔记</h3>
              <p class="text-gray-600 max-w-sm mx-auto">在阅读文章时创建笔记，记录你的思考和灵感</p>
            </div>

            <div v-else class="space-y-4">
              <DSCard
                v-for="note in notes"
                :key="note.id"
                variant="outlined"
                padding="lg"
                :hover="true"
                class="group"
              >
                <div class="space-y-4">
                  <!-- 笔记头部 -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {{ note.articleTitle }}
                      </h4>
                      <div class="flex items-center text-sm text-gray-500 mt-1">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V9H5a1 1 0 110-2h3z"></path>
                        </svg>
                        {{ formatDate(note.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <!-- 笔记内容 -->
                  <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p class="text-gray-800 leading-relaxed">{{ note.content }}</p>
                  </div>

                  <!-- 笔记底部 -->
                  <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      来自文章：{{ note.articleTitle }}
                    </div>
                    <DSButton @click="goToArticle(note.articleId)" variant="outline" size="sm">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      查看原文
                    </DSButton>
                  </div>
                </div>
              </DSCard>
            </div>
          </div>

          <!-- 高亮标记 -->
          <div v-if="activeTab === 'highlights'" class="space-y-6">
            <div v-if="highlights.length === 0" class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V3h6v1H9z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">暂无高亮标记</h3>
              <p class="text-gray-600 max-w-sm mx-auto">在阅读文章时选择文本进行高亮标记，方便日后回顾</p>
            </div>

            <div v-else class="space-y-4">
              <DSCard
                v-for="highlight in highlights"
                :key="highlight.id"
                variant="outlined"
                padding="lg"
                :hover="true"
                class="group"
              >
                <div class="space-y-4">
                  <!-- 高亮头部 -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        {{ highlight.articleTitle }}
                      </h4>
                      <div class="flex items-center text-sm text-gray-500 mt-1">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V9H5a1 1 0 110-2h3z"></path>
                        </svg>
                        {{ formatDate(highlight.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <!-- 高亮内容 -->
                  <div
                    class="p-4 rounded-lg border-l-4 relative"
                    :style="{
                      backgroundColor: highlight.color + '20',
                      borderLeftColor: highlight.color
                    }"
                  >
                    <div class="flex items-start">
                      <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" :style="{ color: highlight.color }" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                      <p class="text-gray-800 leading-relaxed italic">{{ highlight.text }}</p>
                    </div>
                  </div>

                  <!-- 高亮底部 -->
                  <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      来自文章：{{ highlight.articleTitle }}
                    </div>
                    <DSButton @click="goToArticle(highlight.articleId)" variant="outline" size="sm">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      查看原文
                    </DSButton>
                  </div>
                </div>
              </DSCard>
            </div>
          </div>
        </div>
      </DSCard>

      <!-- 编辑资料模态框 -->
      <div v-if="showEditProfile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <DSCard variant="elevated" padding="xl" class="w-full max-w-md mx-auto">
          <div class="space-y-6">
            <!-- 模态框头部 -->
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold text-gray-900">编辑个人资料</h3>
              <DSButton @click="showEditProfile = false" variant="ghost" size="sm" class="rounded-full p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </DSButton>
            </div>

            <!-- 表单 -->
            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- 昵称输入 -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">昵称</label>
                <DSInput
                  v-model="editForm.nickname"
                  type="text"
                  placeholder="请输入昵称"
                  required
                  class="w-full"
                />
              </div>

              <!-- 头像URL输入 -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">头像URL</label>
                <DSInput
                  v-model="editForm.avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">请输入有效的图片链接地址</p>
              </div>

              <!-- 头像预览 -->
              <div v-if="editForm.avatarUrl" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-200">
                  <img
                    :src="editForm.avatarUrl"
                    alt="头像预览"
                    class="w-full h-full object-cover"
                    @error="avatarError = true"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">头像预览</p>
                  <p class="text-xs text-gray-500">这是你的新头像预览</p>
                </div>
              </div>

              <!-- 按钮组 -->
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <DSButton @click="showEditProfile = false" variant="outline" size="lg">
                  取消
                </DSButton>
                <DSButton type="submit" variant="primary" size="lg" :disabled="isUpdating">
                  <svg v-if="isUpdating" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isUpdating ? '保存中...' : '保存' }}
                </DSButton>
              </div>
            </form>
          </div>
        </DSCard>
      </div>
    </div>
  </DSDefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { eventBus } from '../utils/EventBus'
import DSDefaultLayout from '../components/templates/DSDefaultLayout.vue'
import DSCard from '../components/atoms/DSCard.vue'
import DSButton from '../components/atoms/DSButton.vue'
import DSInput from '../components/atoms/DSInput.vue'
import DSProgressBar from '../components/atoms/DSProgressBar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('purchases')
const showEditProfile = ref(false)
const isUpdating = ref(false)
const avatarError = ref(false)

// 编辑表单
const editForm = ref({
  nickname: '',
  avatarUrl: ''
})

// 模拟数据
const stats = ref({
  purchasedArticles: 3,
  notes: 12,
  highlights: 28,
  totalSpent: 129.7
})

const purchases = ref([
  {
    id: '1',
    articleId: '2',
    articleTitle: 'TypeScript高级类型系统详解',
    amount: 29.9,
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: '2',
    articleId: '3',
    articleTitle: 'Node.js性能优化实战',
    amount: 39.9,
    createdAt: '2024-12-02T15:30:00Z'
  }
])

const notes = ref([
  {
    id: '1',
    articleId: '2',
    articleTitle: 'TypeScript高级类型系统详解',
    content: '泛型约束是TypeScript中一个非常重要的概念，它允许我们在保持类型安全的同时提供更大的灵活性。',
    createdAt: '2024-12-01T11:00:00Z'
  }
])

const highlights = ref([
  {
    id: '1',
    articleId: '2',
    articleTitle: 'TypeScript高级类型系统详解',
    text: '类型安全是TypeScript的核心优势之一',
    color: '#fef08a',
    createdAt: '2024-12-01T10:30:00Z'
  }
])

// 标签页配置
const tabs = [
  { id: 'purchases', name: '购买记录' },
  { id: 'notes', name: '我的笔记' },
  { id: 'highlights', name: '高亮标记' }
]

// 计算属性
const user = computed(() => authStore.user)

// 方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToSettings = () => {
  router.push('/settings')
}

const goToArticles = () => {
  router.push('/articles')
}

const goToArticle = (articleId: string) => {
  router.push(`/articles/${articleId}`)
}

const updateProfile = async () => {
  try {
    isUpdating.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新用户信息
    if (authStore.user) {
      authStore.user.nickname = editForm.value.nickname
      authStore.user.avatarUrl = editForm.value.avatarUrl
    }

    showEditProfile.value = false

    eventBus.emit('notification:show', {
      type: 'success',
      message: '个人资料更新成功'
    })

  } catch (err: any) {
    eventBus.emit('notification:show', {
      type: 'error',
      message: err.message || '更新失败'
    })
  } finally {
    isUpdating.value = false
  }
}

// 生命周期
onMounted(() => {
  if (user.value) {
    editForm.value.nickname = user.value.nickname
    editForm.value.avatarUrl = user.value.avatarUrl || ''
  }
})
</script>

<style scoped>
/* 修复SVG图标尺寸问题 */
.icon-size {
  width: 1.25rem !important;
  height: 1.25rem !important;
  flex-shrink: 0;
}
</style>
