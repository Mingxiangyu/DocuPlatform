// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

// API错误类型
export interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户相关API类型
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  nickname: string
  avatarUrl?: string
  role: 'USER' | 'ADMIN' | 'CONTENT_MANAGER'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

// 文章相关API类型
export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  coverImageUrl?: string
  authorId: string
  author: Pick<User, 'id' | 'nickname' | 'avatarUrl'>
  categoryId?: string
  category?: Category
  isPaid: boolean
  price?: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  viewCount: number
  likeCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateArticleRequest {
  title: string
  content: string
  excerpt?: string
  coverImageUrl?: string
  categoryId?: string
  isPaid: boolean
  price?: number
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

// 分类相关API类型
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

// 笔记相关API类型
export interface Note {
  id: string
  userId: string
  articleId: string
  highlightText?: string
  noteText?: string
  positionData: any
  createdAt: string
  updatedAt: string
}

export interface CreateNoteRequest {
  articleId: string
  highlightText?: string
  noteText?: string
  positionData: any
}

export interface UpdateNoteRequest {
  highlightText?: string
  noteText?: string
  positionData?: any
}

// 高亮相关API类型
export interface Highlight {
  id: string
  userId: string
  articleId: string
  startOffset: number
  endOffset: number
  color: string
  virtualNodeId: string
  createdAt: string
}

export interface CreateHighlightRequest {
  articleId: string
  startOffset: number
  endOffset: number
  color: string
  virtualNodeId: string
}

// 订单相关API类型
export interface Order {
  id: string
  userId: string
  articleId?: string
  collectionId?: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  paymentMethod?: string
  paymentId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  articleId?: string
  collectionId?: string
  paymentMethod: 'wechat' | 'alipay'
}

// 合集相关API类型
export interface Collection {
  id: string
  title: string
  description?: string
  coverImageUrl?: string
  price: number
  authorId: string
  author: Pick<User, 'id' | 'nickname' | 'avatarUrl'>
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  items: CollectionItem[]
  createdAt: string
  updatedAt: string
}

export interface CollectionItem {
  id: string
  collectionId: string
  articleId: string
  article: Pick<Article, 'id' | 'title' | 'excerpt' | 'coverImageUrl'>
  sortOrder: number
  createdAt: string
}

// 搜索相关API类型
export interface SearchRequest {
  query: string
  type?: 'article' | 'collection' | 'user'
  categoryId?: string
  isPaid?: boolean
  priceRange?: {
    min?: number
    max?: number
  }
  dateRange?: {
    start?: string
    end?: string
  }
}

export interface SearchResponse {
  articles: Article[]
  collections: Collection[]
  users: User[]
  total: number
  took: number
}

// 统计相关API类型
export interface UserStats {
  articlesCount: number
  notesCount: number
  highlightsCount: number
  purchasesCount: number
  totalSpent: number
}

export interface ArticleStats {
  viewCount: number
  likeCount: number
  noteCount: number
  highlightCount: number
  purchaseCount: number
  revenue: number
}

// 文件上传相关API类型
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

// API客户端配置
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableCache: boolean
  cacheTimeout: number
}
