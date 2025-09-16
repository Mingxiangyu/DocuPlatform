# DocuVault 部署指南

## 概述

DocuVault 是一个现代化的知识付费平台，采用 Vue 3 + TypeScript + Node.js 技术栈构建。本文档提供完整的生产环境部署指南。

## 系统要求

### 硬件要求
- **CPU**: 2核心以上
- **内存**: 4GB RAM 最小，8GB 推荐
- **存储**: 20GB 可用空间最小，50GB 推荐
- **网络**: 稳定的互联网连接

### 软件要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Docker 支持的任何系统
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (如果不使用 Docker)
- **PostgreSQL**: 15+ (如果不使用 Docker)
- **Redis**: 7+ (如果不使用 Docker)

## 快速部署

### 1. 克隆项目
```bash
git clone https://github.com/your-org/docuvault.git
cd docuvault
```

### 2. 配置环境变量
```bash
cp .env.production.example .env.production
# 编辑 .env.production 文件，设置必要的环境变量
```

### 3. 启动服务
```bash
# 使用部署脚本（推荐）
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 或手动启动
docker-compose -f docker-compose.production.yml up -d
```

### 4. 验证部署
```bash
# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 访问应用
curl http://localhost/health
```

## 详细部署步骤

### 环境配置

#### 必需的环境变量
```bash
# 数据库配置
DB_PASSWORD=your_secure_database_password
DATABASE_URL=postgresql://docuvault:${DB_PASSWORD}@postgres:5432/docuvault

# JWT 配置
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long

# 支付配置
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# 邮件服务
EMAIL_SERVICE_API_KEY=your_sendgrid_api_key
```

#### 可选的环境变量
```bash
# 监控配置
GRAFANA_PASSWORD=your_grafana_admin_password
SENTRY_DSN=https://your_sentry_dsn_here

# SSL 配置
SSL_CERT_PATH=/etc/ssl/certs/docuvault.crt
SSL_KEY_PATH=/etc/ssl/private/docuvault.key
```

### SSL/HTTPS 配置

#### 使用 Let's Encrypt
```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 配置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 使用自签名证书（开发环境）
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/docuvault.key \
  -out ssl/docuvault.crt
```

### 数据库初始化

#### 自动初始化
部署脚本会自动处理数据库初始化。

#### 手动初始化
```bash
# 连接到数据库容器
docker exec -it docuvault-postgres psql -U docuvault -d docuvault

# 运行初始化脚本
\i /docker-entrypoint-initdb.d/init.sql
```

### 反向代理配置

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 监控和日志

### 启用监控服务
```bash
# 启动监控服务
docker-compose -f docker-compose.production.yml --profile monitoring up -d

# 访问监控面板
# Grafana: http://localhost:3000 (admin/your_grafana_password)
# Prometheus: http://localhost:9090
```

### 日志管理
```bash
# 查看应用日志
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f backend

# 日志轮转配置
# 日志文件位于 ./logs/ 目录
# 自动清理超过 10 个的日志文件
```

## 备份和恢复

### 数据库备份
```bash
# 手动备份
docker exec docuvault-postgres pg_dump -U docuvault docuvault > backup_$(date +%Y%m%d_%H%M%S).sql

# 自动备份（crontab）
0 2 * * * /path/to/backup_script.sh
```

### 文件备份
```bash
# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz .env.production docker-compose.production.yml
```

### 恢复数据
```bash
# 恢复数据库
docker exec -i docuvault-postgres psql -U docuvault docuvault < backup.sql

# 恢复文件
tar -xzf uploads_backup.tar.gz
```

## 性能优化

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_notes_article_id ON notes(article_id);

-- 配置连接池
-- 在 .env.production 中设置
DB_POOL_MIN=2
DB_POOL_MAX=20
```

### 缓存配置
```bash
# Redis 配置优化
# 在 redis/redis.conf 中设置
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### CDN 配置
```bash
# 配置 CDN URL
CDN_URL=https://cdn.yourdomain.com

# 上传静态资源到 CDN
aws s3 sync ./frontend/dist/assets s3://your-cdn-bucket/assets
```

## 安全配置

### 防火墙设置
```bash
# Ubuntu UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 安全头部
应用已自动配置以下安全头部：
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: 已配置

### 定期安全更新
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新 Docker 镜像
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## 故障排除

### 常见问题

#### 服务无法启动
```bash
# 检查日志
docker-compose -f docker-compose.production.yml logs

# 检查端口占用
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# 检查磁盘空间
df -h
```

#### 数据库连接失败
```bash
# 检查数据库状态
docker-compose -f docker-compose.production.yml ps postgres

# 测试数据库连接
docker exec docuvault-postgres pg_isready -U docuvault
```

#### 性能问题
```bash
# 检查资源使用
docker stats

# 检查数据库性能
docker exec -it docuvault-postgres psql -U docuvault -d docuvault -c "SELECT * FROM pg_stat_activity;"
```

### 健康检查
```bash
# 应用健康检查
curl http://localhost/health

# 数据库健康检查
curl http://localhost:3001/api/health

# 完整系统检查
./scripts/health_check.sh
```

## 扩展部署

### 负载均衡
```yaml
# docker-compose.production.yml 中添加
nginx-lb:
  image: nginx:alpine
  ports:
    - "8080:80"
  volumes:
    - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf
```

### 多实例部署
```bash
# 扩展前端实例
docker-compose -f docker-compose.production.yml up -d --scale frontend=3

# 扩展后端实例
docker-compose -f docker-compose.production.yml up -d --scale backend=2
```

## 维护

### 定期维护任务
- 每日：检查日志和监控指标
- 每周：数据库备份验证
- 每月：安全更新和性能优化
- 每季度：完整系统审计

### 更新部署
```bash
# 拉取最新代码
git pull origin main

# 运行部署脚本
./scripts/deploy.sh

# 验证更新
curl http://localhost/health
```

## 支持

如需技术支持，请联系：
- 邮箱: support@docuvault.com
- 文档: https://docs.docuvault.com
- GitHub Issues: https://github.com/your-org/docuvault/issues
