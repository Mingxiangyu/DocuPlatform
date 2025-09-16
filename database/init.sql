-- DocuVault 数据库初始化脚本
-- 创建数据库和基础配置

-- 创建数据库（如果不存在）
-- CREATE DATABASE docuvault;

-- 连接到数据库
\c docuvault;

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 创建全文搜索配置（中文支持）
CREATE TEXT SEARCH CONFIGURATION chinese (COPY = simple);
CREATE TEXT SEARCH DICTIONARY chinese_stem (
    TEMPLATE = simple,
    STOPWORDS = chinese
);
ALTER TEXT SEARCH CONFIGURATION chinese
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart,
                      word, hword, hword_part
    WITH chinese_stem;

-- 创建索引函数（用于全文搜索）
CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('chinese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('chinese', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('chinese', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建用户角色和权限
DO $$
BEGIN
  -- 创建只读用户（用于报表和分析）
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'docuvault_readonly') THEN
    CREATE ROLE docuvault_readonly;
  END IF;
  
  -- 创建应用用户
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'docuvault_app') THEN
    CREATE ROLE docuvault_app WITH LOGIN PASSWORD 'app_password_change_in_production';
  END IF;
END
$$;

-- 设置默认权限
GRANT CONNECT ON DATABASE docuvault TO docuvault_readonly;
GRANT CONNECT ON DATABASE docuvault TO docuvault_app;

-- 创建性能监控视图
CREATE OR REPLACE VIEW article_stats AS
SELECT 
  a.id,
  a.title,
  a.view_count,
  a.like_count,
  COUNT(DISTINCT n.id) as note_count,
  COUNT(DISTINCT h.id) as highlight_count,
  COUNT(DISTINCT o.id) as purchase_count
FROM articles a
LEFT JOIN notes n ON a.id = n.article_id
LEFT JOIN highlights h ON a.id = h.article_id  
LEFT JOIN orders o ON a.id = o.article_id AND o.status = 'COMPLETED'
GROUP BY a.id, a.title, a.view_count, a.like_count;

-- 创建用户活跃度视图
CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
  u.id,
  u.nickname,
  u.email,
  COUNT(DISTINCT a.id) as articles_written,
  COUNT(DISTINCT n.id) as notes_created,
  COUNT(DISTINCT h.id) as highlights_created,
  COUNT(DISTINCT o.id) as purchases_made,
  u.created_at as joined_date
FROM users u
LEFT JOIN articles a ON u.id = a.author_id
LEFT JOIN notes n ON u.id = n.user_id
LEFT JOIN highlights h ON u.id = h.user_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'COMPLETED'
GROUP BY u.id, u.nickname, u.email, u.created_at;

-- 创建收入统计视图
CREATE OR REPLACE VIEW revenue_stats AS
SELECT 
  DATE_TRUNC('month', o.paid_at) as month,
  COUNT(*) as order_count,
  SUM(o.amount) as total_revenue,
  AVG(o.amount) as avg_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers
FROM orders o
WHERE o.status = 'COMPLETED' AND o.paid_at IS NOT NULL
GROUP BY DATE_TRUNC('month', o.paid_at)
ORDER BY month DESC;

-- 设置数据库参数优化
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- 创建备份和维护函数
CREATE OR REPLACE FUNCTION cleanup_old_sessions() RETURNS void AS $$
BEGIN
  -- 清理超过30天的会话数据（如果有会话表的话）
  -- DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 清理超过90天的日志数据（如果有日志表的话）
  -- DELETE FROM logs WHERE created_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE '清理完成';
END;
$$ LANGUAGE plpgsql;

-- 创建定期维护任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_sessions();');

COMMENT ON DATABASE docuvault IS 'DocuVault知识付费平台数据库';
COMMENT ON FUNCTION articles_search_vector_update() IS '文章全文搜索向量更新触发器函数';
COMMENT ON VIEW article_stats IS '文章统计信息视图';
COMMENT ON VIEW user_activity_stats IS '用户活跃度统计视图';
COMMENT ON VIEW revenue_stats IS '收入统计视图';

-- 输出初始化完成信息
SELECT 'DocuVault数据库初始化完成' as status;
