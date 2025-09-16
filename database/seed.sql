-- DocuVault 开发环境种子数据
-- 用于本地开发和测试

-- 插入测试用户
INSERT INTO users (id, email, password_hash, nickname, role, avatar_url, bio, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@docuvault.dev', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '系统管理员', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '系统管理员账户，负责平台管理和维护', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'editor@docuvault.dev', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '内容编辑', 'CONTENT_MANAGER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor', '内容管理员，负责文章审核和编辑', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'author@docuvault.dev', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '知识创作者', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=author', '专业的知识内容创作者，分享技术和经验', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'user@docuvault.dev', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '普通用户', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', '平台的普通用户，喜欢阅读和学习', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'demo@docuvault.dev', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', '演示账户', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', '用于演示和测试的账户', NOW(), NOW());

-- 插入文章分类
INSERT INTO categories (id, name, slug, description, color, created_at, updated_at) VALUES
('cat-tech', '技术分享', 'technology', '编程、开发、技术相关的文章', '#3B82F6', NOW(), NOW()),
('cat-design', '设计思维', 'design', 'UI/UX设计、产品设计相关内容', '#8B5CF6', NOW(), NOW()),
('cat-business', '商业洞察', 'business', '商业分析、市场趋势、创业经验', '#10B981', NOW(), NOW()),
('cat-life', '生活感悟', 'lifestyle', '生活方式、个人成长、心得体会', '#F59E0B', NOW(), NOW()),
('cat-science', '科学探索', 'science', '科学知识、研究发现、学术分享', '#EF4444', NOW(), NOW());

-- 插入测试文章
INSERT INTO articles (id, title, slug, excerpt, content, author_id, category_id, status, is_premium, price, view_count, like_count, published_at, created_at, updated_at) VALUES
('art-001', 'Vue 3 Composition API 深度解析', 'vue3-composition-api-deep-dive', 'Vue 3 Composition API 是 Vue.js 框架的重大革新，本文将深入探讨其设计理念、使用方法和最佳实践。', 
'<h1>Vue 3 Composition API 深度解析</h1>
<p>Vue 3 引入的 Composition API 是一个重大的架构改进，它为开发者提供了更灵活、更强大的组件逻辑组织方式。</p>
<h2>什么是 Composition API？</h2>
<p>Composition API 是一套基于函数的 API，允许我们更灵活地组织组件逻辑。与传统的 Options API 相比，它提供了更好的逻辑复用和类型推导能力。</p>
<h2>核心概念</h2>
<h3>1. setup() 函数</h3>
<p>setup() 是 Composition API 的入口点，它在组件创建之前执行，用于设置组件的响应式状态和逻辑。</p>
<pre><code>import { ref, computed } from "vue"

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    return {
      count,
      doubleCount,
      increment
    }
  }
}</code></pre>
<h3>2. 响应式 API</h3>
<p>Vue 3 提供了多种响应式 API：</p>
<ul>
<li><strong>ref()</strong>: 创建响应式引用</li>
<li><strong>reactive()</strong>: 创建响应式对象</li>
<li><strong>computed()</strong>: 创建计算属性</li>
<li><strong>watch()</strong>: 创建侦听器</li>
</ul>
<h2>最佳实践</h2>
<p>在使用 Composition API 时，建议遵循以下最佳实践：</p>
<ol>
<li>将相关逻辑组织在一起</li>
<li>使用组合函数提取可复用逻辑</li>
<li>合理使用 ref 和 reactive</li>
<li>注意响应式数据的解构</li>
</ol>
<p>通过合理使用 Composition API，我们可以编写出更加清晰、可维护的 Vue 应用程序。</p>', 
'550e8400-e29b-41d4-a716-446655440003', 'cat-tech', 'PUBLISHED', false, 0, 1250, 89, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),

('art-002', '现代前端架构设计原则', 'modern-frontend-architecture-principles', '探讨现代前端应用的架构设计原则，包括组件化、状态管理、性能优化等关键要素。', 
'<h1>现代前端架构设计原则</h1>
<p>随着前端技术的快速发展，构建大型、可维护的前端应用变得越来越重要。本文将探讨现代前端架构的核心设计原则。</p>
<h2>1. 组件化设计</h2>
<p>组件化是现代前端架构的基石，它将复杂的用户界面分解为独立、可复用的组件。</p>
<h3>原子设计理论</h3>
<p>原子设计将组件分为五个层次：</p>
<ul>
<li><strong>原子（Atoms）</strong>: 最基础的UI元素</li>
<li><strong>分子（Molecules）</strong>: 由原子组合而成的简单组件</li>
<li><strong>有机体（Organisms）</strong>: 复杂的UI组件</li>
<li><strong>模板（Templates）</strong>: 页面级别的组件布局</li>
<li><strong>页面（Pages）</strong>: 具体的页面实例</li>
</ul>
<h2>2. 状态管理</h2>
<p>合理的状态管理是构建复杂应用的关键。现代前端应用通常采用以下状态管理模式：</p>
<h3>单向数据流</h3>
<p>数据从父组件流向子组件，事件从子组件传递到父组件，确保数据流的可预测性。</p>
<h3>状态提升</h3>
<p>将共享状态提升到最近的公共父组件中，避免状态的重复和不一致。</p>
<h2>3. 性能优化</h2>
<p>性能优化是现代前端架构不可忽视的重要方面：</p>
<ul>
<li>代码分割和懒加载</li>
<li>虚拟化长列表</li>
<li>图片优化和懒加载</li>
<li>缓存策略</li>
<li>预加载关键资源</li>
</ul>
<h2>4. 可维护性</h2>
<p>良好的架构应该易于维护和扩展：</p>
<ul>
<li>清晰的目录结构</li>
<li>一致的编码规范</li>
<li>完善的类型定义</li>
<li>充分的测试覆盖</li>
</ul>
<p>通过遵循这些设计原则，我们可以构建出高质量、可维护的现代前端应用。</p>', 
'550e8400-e29b-41d4-a716-446655440003', 'cat-tech', 'PUBLISHED', true, 29.99, 856, 67, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW()),

('art-003', 'TypeScript 高级类型系统详解', 'typescript-advanced-type-system', 'TypeScript 的类型系统是其最强大的特性之一，本文将深入探讨高级类型的使用技巧和最佳实践。', 
'<h1>TypeScript 高级类型系统详解</h1>
<p>TypeScript 的类型系统为 JavaScript 带来了强大的静态类型检查能力。掌握高级类型技巧对于编写高质量的 TypeScript 代码至关重要。</p>
<h2>泛型（Generics）</h2>
<p>泛型允许我们创建可重用的组件，这些组件可以处理多种类型的数据。</p>
<pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}

// 使用泛型
const stringResult = identity&lt;string&gt;("hello");
const numberResult = identity&lt;number&gt;(42);</code></pre>
<h2>条件类型（Conditional Types）</h2>
<p>条件类型允许我们根据类型条件来选择类型。</p>
<pre><code>type NonNullable&lt;T&gt; = T extends null | undefined ? never : T;

type Example = NonNullable&lt;string | null&gt;; // string</code></pre>
<h2>映射类型（Mapped Types）</h2>
<p>映射类型允许我们基于现有类型创建新类型。</p>
<pre><code>type Readonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};

type Optional&lt;T&gt; = {
  [P in keyof T]?: T[P];
};</code></pre>
<h2>实用工具类型</h2>
<p>TypeScript 提供了许多内置的实用工具类型：</p>
<ul>
<li><strong>Partial&lt;T&gt;</strong>: 将所有属性变为可选</li>
<li><strong>Required&lt;T&gt;</strong>: 将所有属性变为必需</li>
<li><strong>Pick&lt;T, K&gt;</strong>: 选择特定属性</li>
<li><strong>Omit&lt;T, K&gt;</strong>: 排除特定属性</li>
<li><strong>Record&lt;K, T&gt;</strong>: 创建键值对类型</li>
</ul>
<h2>高级模式</h2>
<h3>模板字面量类型</h3>
<p>TypeScript 4.1 引入了模板字面量类型，允许我们创建基于字符串的类型。</p>
<pre><code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`;
type ButtonEvent = EventName&lt;"click"&gt;; // "onClick"</code></pre>
<h3>递归类型</h3>
<p>TypeScript 支持递归类型定义，用于处理嵌套结构。</p>
<pre><code>type DeepReadonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly&lt;T[P]&gt; : T[P];
};</code></pre>
<p>掌握这些高级类型技巧，将大大提升你的 TypeScript 开发效率和代码质量。</p>', 
'550e8400-e29b-41d4-a716-446655440003', 'cat-tech', 'PUBLISHED', true, 39.99, 642, 45, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW());

-- 插入测试笔记
INSERT INTO notes (id, title, content, article_id, user_id, is_public, created_at, updated_at) VALUES
('note-001', 'Vue 3 学习笔记', '学习了 Composition API 的基本用法，感觉比 Options API 更灵活。特别是 setup() 函数的设计很巧妙。', 'art-001', '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
('note-002', '前端架构思考', '组件化设计确实是现代前端的核心，原子设计理论提供了很好的组织方式。', 'art-002', '550e8400-e29b-41d4-a716-446655440004', false, NOW(), NOW()),
('note-003', 'TypeScript 类型技巧', '条件类型和映射类型的组合使用可以创造出非常强大的类型工具。', 'art-003', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW());

-- 插入测试高亮
INSERT INTO highlights (id, article_id, user_id, start_offset, end_offset, text_content, color, note_id, created_at, updated_at) VALUES
('hl-001', 'art-001', '550e8400-e29b-41d4-a716-446655440004', 150, 200, 'Composition API 是一套基于函数的 API', '#FFD700', 'note-001', NOW(), NOW()),
('hl-002', 'art-002', '550e8400-e29b-41d4-a716-446655440004', 300, 350, '组件化是现代前端架构的基石', '#FF6B6B', 'note-002', NOW(), NOW()),
('hl-003', 'art-003', '550e8400-e29b-41d4-a716-446655440005', 250, 300, '泛型允许我们创建可重用的组件', '#4ECDC4', 'note-003', NOW(), NOW());

-- 插入测试订单
INSERT INTO orders (id, user_id, article_id, amount, currency, status, payment_method, stripe_payment_intent_id, paid_at, created_at, updated_at) VALUES
('order-001', '550e8400-e29b-41d4-a716-446655440004', 'art-002', 29.99, 'USD', 'COMPLETED', 'STRIPE', 'pi_test_1234567890', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW()),
('order-002', '550e8400-e29b-41d4-a716-446655440005', 'art-003', 39.99, 'USD', 'COMPLETED', 'STRIPE', 'pi_test_0987654321', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW());

-- 更新统计信息
ANALYZE;

-- 输出种子数据插入完成信息
SELECT 'DocuVault种子数据插入完成' as status,
       (SELECT COUNT(*) FROM users) as user_count,
       (SELECT COUNT(*) FROM articles) as article_count,
       (SELECT COUNT(*) FROM notes) as note_count,
       (SELECT COUNT(*) FROM highlights) as highlight_count,
       (SELECT COUNT(*) FROM orders) as order_count;
