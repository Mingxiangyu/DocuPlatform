# DocuVault Frontend Dockerfile
# 多阶段构建，优化镜像大小和安全性

# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache git python3 make g++

# 复制package文件
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build:production

# 生产阶段
FROM nginx:1.25-alpine AS production

# 安装必要工具
RUN apk add --no-cache curl tzdata

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建nginx用户和组
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# 创建必要目录
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/log/nginx \
    /var/run

# 设置权限
RUN chown -R nginx:nginx /var/cache/nginx \
    /var/log/nginx \
    /var/run \
    /usr/share/nginx/html

# 创建健康检查脚本
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost:80/health || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# 暴露端口
EXPOSE 80

# 切换到非root用户
USER nginx

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]

# 元数据标签
LABEL maintainer="DocuVault Team <dev@docuvault.com>"
LABEL version="1.0.0"
LABEL description="DocuVault Frontend Application"
LABEL org.opencontainers.image.title="DocuVault Frontend"
LABEL org.opencontainers.image.description="知识付费平台前端应用"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="DocuVault"
LABEL org.opencontainers.image.licenses="MIT"
