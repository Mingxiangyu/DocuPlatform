# DocuVault API接口设计文档

## 接口概览

### 基础信息
- **Base URL**: `https://api.docuvault.com`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ErrorResponse {
  success: false
  message: string
  errors: string[]
  code: string
}
```

### 状态码规范
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `422` - 数据验证失败
- `429` - 请求频率限制
- `500` - 服务器内部错误

## 认证接口

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "nickname": "用户昵称"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-12-10T10:00:00Z"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 900
    }
  }
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### 微信OAuth登录
```http
POST /api/auth/oauth/wechat
Content-Type: application/json

{
  "code": "wechat_auth_code"
}
```

### 刷新Token
```http
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

### 获取用户信息
```http
GET /api/auth/profile
Authorization: Bearer {access_token}
```

## 文章管理接口

### 获取文章列表
```http
GET /api/articles?page=1&limit=20&category=tech&search=vue&sort=latest&is_paid=false
Authorization: Bearer {access_token} (可选)
```

**查询参数**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认20，最大100
- `category`: 分类ID或slug
- `search`: 搜索关键词
- `sort`: 排序方式 (latest, popular, price_asc, price_desc)
- `is_paid`: 是否付费文章 (true/false)
- `author_id`: 作者ID

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Vue 3 完全指南",
      "excerpt": "深入学习Vue 3的新特性...",
      "cover_image_url": "https://cdn.example.com/cover.jpg",
      "author": {
        "id": "uuid",
        "nickname": "技术专家",
        "avatar_url": "https://cdn.example.com/avatar.jpg"
      },
      "category": {
        "id": "uuid",
        "name": "前端技术",
        "slug": "frontend"
      },
      "is_paid": true,
      "price": 29.00,
      "view_count": 1250,
      "like_count": 89,
      "published_at": "2024-12-01T10:00:00Z",
      "reading_time": 15,
      "has_purchased": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 获取文章详情
```http
GET /api/articles/{id}
Authorization: Bearer {access_token} (可选)
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Vue 3 完全指南",
    "content": "# Vue 3 介绍\n\n这是文章内容...",
    "excerpt": "深入学习Vue 3的新特性...",
    "cover_image_url": "https://cdn.example.com/cover.jpg",
    "author": {
      "id": "uuid",
      "nickname": "技术专家",
      "avatar_url": "https://cdn.example.com/avatar.jpg",
      "bio": "10年前端开发经验"
    },
    "category": {
      "id": "uuid",
      "name": "前端技术",
      "slug": "frontend"
    },
    "tags": ["vue", "javascript", "frontend"],
    "is_paid": true,
    "price": 29.00,
    "view_count": 1251,
    "like_count": 89,
    "published_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-05T14:30:00Z",
    "reading_time": 15,
    "has_purchased": true,
    "has_liked": false,
    "paywall_position": 500,
    "related_articles": [
      {
        "id": "uuid",
        "title": "React vs Vue 对比",
        "cover_image_url": "https://cdn.example.com/related.jpg"
      }
    ]
  }
}
```

### 创建文章 (管理员)
```http
POST /api/articles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "新文章标题",
  "content": "# 文章内容\n\n这里是正文...",
  "excerpt": "文章摘要",
  "cover_image_url": "https://cdn.example.com/cover.jpg",
  "category_id": "uuid",
  "tags": ["tag1", "tag2"],
  "is_paid": true,
  "price": 39.00,
  "status": "draft"
}
```

### 更新文章 (管理员)
```http
PUT /api/articles/{id}
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 删除文章 (管理员)
```http
DELETE /api/articles/{id}
Authorization: Bearer {access_token}
```

### 点赞文章
```http
POST /api/articles/{id}/like
Authorization: Bearer {access_token}
```

### 取消点赞
```http
DELETE /api/articles/{id}/like
Authorization: Bearer {access_token}
```

## 笔记管理接口

### 获取用户笔记
```http
GET /api/notes?article_id=uuid&type=highlight&page=1&limit=50
Authorization: Bearer {access_token}
```

**查询参数**:
- `article_id`: 文章ID (可选)
- `type`: 笔记类型 (highlight, note, both)
- `page`: 页码
- `limit`: 每页数量

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "article_id": "uuid",
      "article_title": "Vue 3 完全指南",
      "highlight_text": "useState 是 React 中最基础的 Hook",
      "note_text": "这个概念很重要，需要深入理解",
      "highlight_color": "yellow",
      "position_data": {
        "start": 150,
        "end": 180,
        "xpath": "/html/body/div[1]/p[3]"
      },
      "created_at": "2024-12-10T10:30:00Z",
      "updated_at": "2024-12-10T10:35:00Z"
    }
  ]
}
```

### 创建笔记
```http
POST /api/notes
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "article_id": "uuid",
  "highlight_text": "选中的文本内容",
  "note_text": "我的想法和笔记",
  "highlight_color": "yellow",
  "position_data": {
    "start": 150,
    "end": 180,
    "xpath": "/html/body/div[1]/p[3]"
  }
}
```

### 更新笔记
```http
PUT /api/notes/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "note_text": "更新后的笔记内容",
  "highlight_color": "blue"
}
```

### 删除笔记
```http
DELETE /api/notes/{id}
Authorization: Bearer {access_token}
```

### 批量同步笔记
```http
POST /api/notes/sync
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notes": [
    {
      "id": "uuid",
      "article_id": "uuid",
      "highlight_text": "文本内容",
      "note_text": "笔记内容",
      "highlight_color": "yellow",
      "position_data": {...},
      "updated_at": "2024-12-10T10:35:00Z"
    }
  ]
}
```

## 支付接口

### 创建支付订单
```http
POST /api/payments/create
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "article_id": "uuid",
  "payment_method": "wechat"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "amount": 29.00,
    "payment_method": "wechat",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "payment_url": "weixin://wxpay/bizpayurl?pr=xxx",
    "expires_at": "2024-12-10T11:00:00Z",
    "status": "pending"
  }
}
```

### 查询支付状态
```http
GET /api/payments/{order_id}/status
Authorization: Bearer {access_token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "status": "paid",
    "paid_at": "2024-12-10T10:45:00Z",
    "transaction_id": "wx_transaction_id"
  }
}
```

### 支付回调 (Webhook)
```http
POST /api/payments/webhook
Content-Type: application/json
X-Signature: sha256_signature

{
  "order_id": "uuid",
  "transaction_id": "wx_transaction_id",
  "amount": 29.00,
  "status": "paid",
  "paid_at": "2024-12-10T10:45:00Z"
}
```

### 获取用户订单
```http
GET /api/orders?page=1&limit=20&status=paid
Authorization: Bearer {access_token}
```

## 文件上传接口

### 上传图片
```http
POST /api/upload/image
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [图片文件]
type: cover|avatar|content
```

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/images/uuid.jpg",
    "filename": "original_name.jpg",
    "size": 1024000,
    "mime_type": "image/jpeg"
  }
}
```

### 上传Markdown文件
```http
POST /api/upload/markdown
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [.md文件]
```

### 上传附件
```http
POST /api/upload/attachment
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [文件]
article_id: uuid
```

## 搜索接口

### 全文搜索
```http
GET /api/search?q=vue&type=articles&page=1&limit=20
Authorization: Bearer {access_token} (可选)
```

**查询参数**:
- `q`: 搜索关键词
- `type`: 搜索类型 (articles, users, collections)
- `page`: 页码
- `limit`: 每页数量
- `category`: 分类筛选
- `price_range`: 价格范围 (0-50)

**响应**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Vue 3 完全指南",
        "excerpt": "深入学习<mark>Vue</mark> 3的新特性...",
        "highlight": "这是一个关于<mark>Vue</mark>框架的教程",
        "score": 0.95
      }
    ],
    "total": 25,
    "took": 15
  }
}
```

### 搜索建议
```http
GET /api/search/suggestions?q=vu
```

**响应**:
```json
{
  "success": true,
  "data": [
    "vue",
    "vue3",
    "vuex",
    "vue-router"
  ]
}
```

## 管理后台接口

### 获取统计数据
```http
GET /api/admin/stats
Authorization: Bearer {admin_access_token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "new_today": 15,
      "active_today": 89
    },
    "articles": {
      "total": 156,
      "published": 142,
      "draft": 14
    },
    "revenue": {
      "total": 125600.00,
      "today": 890.00,
      "this_month": 15600.00
    },
    "orders": {
      "total": 2340,
      "pending": 5,
      "paid": 2280,
      "failed": 55
    }
  }
}
```

### 用户管理
```http
GET /api/admin/users?page=1&limit=50&role=user&search=
PUT /api/admin/users/{id}/role
DELETE /api/admin/users/{id}
```

### 内容管理
```http
GET /api/admin/articles?status=all&author_id=
PUT /api/admin/articles/{id}/status
DELETE /api/admin/articles/{id}
```

## 错误处理

### 常见错误响应
```json
{
  "success": false,
  "message": "验证失败",
  "errors": [
    "邮箱格式不正确",
    "密码至少8位字符"
  ],
  "code": "VALIDATION_ERROR"
}
```

### 错误代码说明
- `VALIDATION_ERROR`: 数据验证失败
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `RESOURCE_NOT_FOUND`: 资源不存在
- `DUPLICATE_RESOURCE`: 资源重复
- `RATE_LIMIT_EXCEEDED`: 请求频率超限
- `PAYMENT_ERROR`: 支付相关错误
- `UPLOAD_ERROR`: 文件上传错误

## 限流规则

- **认证接口**: 15分钟内最多5次请求
- **普通API**: 15分钟内最多100次请求
- **支付接口**: 1分钟内最多3次请求
- **上传接口**: 1分钟内最多10次请求
- **搜索接口**: 1分钟内最多30次请求

## 接口版本控制

- 当前版本: v1
- 版本在URL中指定: `/api/v1/...`
- 向后兼容性保证: 至少6个月
- 废弃通知: 提前3个月通知

## 开发调试

### 测试环境
- Base URL: `https://api-test.docuvault.com`
- 测试账号: test@docuvault.com / TestPass123

### API文档
- Swagger UI: `https://api.docuvault.com/docs`
- Postman Collection: 提供完整的API测试集合

### 响应时间要求
- 95%的请求响应时间 < 500ms
- 99%的请求响应时间 < 1000ms
- 超时时间: 30秒
