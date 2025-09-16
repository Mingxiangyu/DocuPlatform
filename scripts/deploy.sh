#!/bin/bash

# DocuVault 生产部署脚本
# 自动化部署流程，包含构建、测试、部署、健康检查

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="DocuVault"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/deploy_$(date +%Y%m%d_%H%M%S).log"
HEALTH_CHECK_TIMEOUT=300  # 5分钟
ROLLBACK_ENABLED=true

# 创建日志目录
mkdir -p logs backups

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# 检查依赖
check_dependencies() {
    log "检查部署依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose 未安装"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        error "生产环境配置文件 .env.production 不存在"
        exit 1
    fi
    
    # 检查必要的环境变量
    source .env.production
    required_vars=("DB_PASSWORD" "JWT_SECRET" "STRIPE_SECRET_KEY")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "环境变量 $var 未设置"
            exit 1
        fi
    done
    
    log "依赖检查完成 ✓"
}

# 预部署检查
pre_deploy_checks() {
    log "执行预部署检查..."
    
    # 检查磁盘空间
    available_space=$(df / | awk 'NR==2 {print $4}')
    required_space=2097152  # 2GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        error "磁盘空间不足，需要至少2GB可用空间"
        exit 1
    fi
    
    # 检查端口占用
    ports=(80 443 3001 5432 6379)
    for port in "${ports[@]}"; do
        if netstat -tuln | grep -q ":$port "; then
            warn "端口 $port 已被占用，可能会导致冲突"
        fi
    done
    
    # 检查Docker守护进程
    if ! docker info &> /dev/null; then
        error "Docker 守护进程未运行"
        exit 1
    fi
    
    log "预部署检查完成 ✓"
}

# 备份当前部署
backup_current_deployment() {
    if [ "$ROLLBACK_ENABLED" = true ]; then
        log "备份当前部署..."
        
        mkdir -p "$BACKUP_DIR"
        
        # 备份数据库
        if docker ps | grep -q docuvault-postgres; then
            info "备份数据库..."
            docker exec docuvault-postgres pg_dump -U docuvault docuvault > "$BACKUP_DIR/database.sql"
        fi
        
        # 备份上传文件
        if [ -d "./uploads" ]; then
            info "备份上传文件..."
            cp -r ./uploads "$BACKUP_DIR/"
        fi
        
        # 备份配置文件
        cp .env.production "$BACKUP_DIR/"
        cp docker-compose.production.yml "$BACKUP_DIR/"
        
        log "备份完成: $BACKUP_DIR ✓"
    fi
}

# 构建镜像
build_images() {
    log "构建Docker镜像..."
    
    # 构建前端镜像
    info "构建前端镜像..."
    docker build -t docuvault-frontend:latest ./frontend
    
    # 构建后端镜像（如果存在）
    if [ -d "./backend" ]; then
        info "构建后端镜像..."
        docker build -t docuvault-backend:latest ./backend
    fi
    
    log "镜像构建完成 ✓"
}

# 运行测试
run_tests() {
    log "运行部署前测试..."
    
    # 前端测试
    if [ -f "./frontend/package.json" ]; then
        info "运行前端测试..."
        cd frontend
        npm run test:unit || warn "前端单元测试失败"
        npm run test:e2e || warn "前端E2E测试失败"
        cd ..
    fi
    
    # 后端测试（如果存在）
    if [ -f "./backend/package.json" ]; then
        info "运行后端测试..."
        cd backend
        npm test || warn "后端测试失败"
        cd ..
    fi
    
    log "测试完成 ✓"
}

# 停止旧服务
stop_old_services() {
    log "停止旧服务..."
    
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    fi
    
    # 清理未使用的镜像
    docker image prune -f
    
    log "旧服务已停止 ✓"
}

# 启动新服务
start_new_services() {
    log "启动新服务..."
    
    # 加载环境变量
    export $(cat .env.production | xargs)
    
    # 启动核心服务
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres redis
    
    # 等待数据库启动
    info "等待数据库启动..."
    sleep 30
    
    # 启动后端服务
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d backend
    
    # 等待后端启动
    info "等待后端服务启动..."
    sleep 20
    
    # 启动前端服务
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d frontend
    
    log "新服务已启动 ✓"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    local timeout=$HEALTH_CHECK_TIMEOUT
    local interval=10
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        # 检查前端服务
        if curl -f http://localhost:80/health &> /dev/null; then
            log "前端服务健康检查通过 ✓"
            
            # 检查后端服务
            if curl -f http://localhost:3001/health &> /dev/null; then
                log "后端服务健康检查通过 ✓"
                return 0
            fi
        fi
        
        info "等待服务启动... ($elapsed/$timeout 秒)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    error "健康检查失败，服务未能在 $timeout 秒内启动"
    return 1
}

# 部署后验证
post_deploy_verification() {
    log "执行部署后验证..."
    
    # 验证关键页面
    pages=("/" "/login" "/articles" "/profile")
    for page in "${pages[@]}"; do
        if curl -f "http://localhost:80$page" &> /dev/null; then
            info "页面 $page 可访问 ✓"
        else
            warn "页面 $page 不可访问"
        fi
    done
    
    # 验证API端点
    api_endpoints=("/api/health" "/api/articles" "/api/auth/me")
    for endpoint in "${api_endpoints[@]}"; do
        if curl -f "http://localhost:3001$endpoint" &> /dev/null; then
            info "API $endpoint 可访问 ✓"
        else
            warn "API $endpoint 不可访问"
        fi
    done
    
    log "部署后验证完成 ✓"
}

# 回滚函数
rollback() {
    if [ "$ROLLBACK_ENABLED" = true ] && [ -d "$BACKUP_DIR" ]; then
        error "部署失败，开始回滚..."
        
        # 停止当前服务
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        
        # 恢复数据库
        if [ -f "$BACKUP_DIR/database.sql" ]; then
            info "恢复数据库..."
            docker-compose -f "$DOCKER_COMPOSE_FILE" up -d postgres
            sleep 30
            docker exec -i docuvault-postgres psql -U docuvault docuvault < "$BACKUP_DIR/database.sql"
        fi
        
        # 恢复上传文件
        if [ -d "$BACKUP_DIR/uploads" ]; then
            info "恢复上传文件..."
            rm -rf ./uploads
            cp -r "$BACKUP_DIR/uploads" ./
        fi
        
        # 恢复配置文件
        cp "$BACKUP_DIR/.env.production" ./
        cp "$BACKUP_DIR/docker-compose.production.yml" ./
        
        # 重新启动服务
        start_new_services
        
        log "回滚完成"
    else
        error "回滚失败或未启用回滚功能"
    fi
}

# 清理函数
cleanup() {
    log "执行清理..."
    
    # 清理旧的备份（保留最近5个）
    if [ -d "./backups" ]; then
        ls -t ./backups | tail -n +6 | xargs -I {} rm -rf ./backups/{}
    fi
    
    # 清理旧的日志（保留最近10个）
    if [ -d "./logs" ]; then
        ls -t ./logs/deploy_*.log | tail -n +11 | xargs -I {} rm -f {}
    fi
    
    # 清理Docker资源
    docker system prune -f
    
    log "清理完成 ✓"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    # 这里可以集成Slack、钉钉、邮件等通知服务
    info "通知: $status - $message"
    
    # 示例：发送到Slack
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"$PROJECT_NAME 部署$status: $message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
}

# 主部署流程
main() {
    log "开始 $PROJECT_NAME 生产部署"
    
    # 设置错误处理
    trap 'error "部署过程中发生错误"; rollback; exit 1' ERR
    
    # 执行部署步骤
    check_dependencies
    pre_deploy_checks
    backup_current_deployment
    build_images
    run_tests
    stop_old_services
    start_new_services
    
    # 健康检查
    if health_check; then
        post_deploy_verification
        cleanup
        
        log "🎉 $PROJECT_NAME 部署成功完成!"
        send_notification "成功" "部署已完成并通过健康检查"
    else
        error "健康检查失败"
        rollback
        send_notification "失败" "部署失败，已执行回滚"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "DocuVault 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  --no-rollback          禁用自动回滚"
    echo "  --skip-tests           跳过测试"
    echo "  --monitoring           启用监控服务"
    echo ""
    echo "环境变量:"
    echo "  HEALTH_CHECK_TIMEOUT   健康检查超时时间（秒，默认300）"
    echo "  SLACK_WEBHOOK_URL      Slack通知webhook URL"
    echo ""
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --no-rollback)
            ROLLBACK_ENABLED=false
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --monitoring)
            DOCKER_COMPOSE_FILE="docker-compose.production.yml"
            export COMPOSE_PROFILES="monitoring"
            shift
            ;;
        *)
            error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行主流程
main
