-- 创建三篇测试文章数据，用于测试不同的付费状态场景

-- 1. 免费文章：React Hooks 最佳实践指南
INSERT INTO articles (
    id,
    title,
    content,
    excerpt,
    "coverImageUrl",
    "authorId",
    "categoryId",
    "isPaid",
    price,
    status,
    "viewCount",
    "likeCount",
    "publishedAt",
    "createdAt",
    "updatedAt"
) VALUES (
    'art-free-001',
    'React Hooks 最佳实践指南',
    '# React Hooks 最佳实践指南

## 1. 引言

React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。本文将深入探讨 React Hooks 的最佳实践。

## 2. useState Hook

### 2.1 基本用法

useState 是最常用的 Hook，用于在函数组件中添加状态。

```javascript
import React, { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### 2.2 状态更新的最佳实践

当新的 state 需要通过使用先前的 state 计算得出时，可以将函数传递给 setState：

```javascript
// 推荐做法
setCount(prevCount => prevCount + 1);

// 避免这样做
setCount(count + 1);
```

## 3. useEffect Hook

### 3.1 副作用处理

useEffect Hook 让你能够在函数组件中执行副作用操作。

```javascript
import React, { useState, useEffect } from ''react'';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `你点击了 ${count} 次`;
  });

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### 3.2 清理副作用

有些副作用需要清理，比如订阅外部数据源：

```javascript
useEffect(() => {
  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
  
  // 清理函数
  return function cleanup() {
    ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
  };
});
```

## 4. 自定义 Hooks

### 4.1 创建自定义 Hook

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

```javascript
import { useState, useEffect } from ''react'';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

### 4.2 使用自定义 Hook

```javascript
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return ''Loading...'';
  }
  return isOnline ? ''Online'' : ''Offline'';
}
```

## 5. Hook 规则

### 5.1 只在最顶层使用 Hook

不要在循环，条件或嵌套函数中调用 Hook。

```javascript
// ❌ 错误做法
if (name !== '''') {
  useEffect(function persistForm() {
    localStorage.setItem(''formData'', name);
  });
}

// ✅ 正确做法
useEffect(function persistForm() {
  if (name !== '''') {
    localStorage.setItem(''formData'', name);
  }
});
```

### 5.2 只在 React 函数中调用 Hook

不要在普通的 JavaScript 函数中调用 Hook。

## 6. 性能优化

### 6.1 使用 useMemo

useMemo 可以帮助你避免在每次渲染时都进行高开销的计算。

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 6.2 使用 useCallback

useCallback 返回一个 memoized 回调函数。

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

## 7. 总结

React Hooks 为函数组件提供了强大的状态管理和副作用处理能力。通过遵循最佳实践，我们可以编写出更加清晰、可维护的 React 代码。

记住以下几个关键点：
- 只在最顶层使用 Hook
- 只在 React 函数中调用 Hook
- 合理使用依赖数组
- 适当使用性能优化 Hook

希望这篇指南能帮助你更好地使用 React Hooks！',
    'React Hooks 是 React 16.8 引入的新特性，本文深入探讨了 React Hooks 的最佳实践，包括 useState、useEffect、自定义 Hooks 等核心概念。',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    'cmfuxrun700002gsmq3s50g99',
    'cat-tech',
    false,
    NULL,
    'PUBLISHED',
    1250,
    89,
    NOW(),
    NOW(),
    NOW()
);

-- 2. 已购买付费文章：TypeScript 进阶开发指南
INSERT INTO articles (
    id,
    title,
    content,
    excerpt,
    "coverImageUrl",
    "authorId",
    "categoryId",
    "isPaid",
    price,
    status,
    "viewCount",
    "likeCount",
    "publishedAt",
    "createdAt",
    "updatedAt"
) VALUES (
    'art-paid-purchased',
    'TypeScript 进阶开发指南',
    '# TypeScript 进阶开发指南

## 1. 前言

TypeScript 是 JavaScript 的超集，为 JavaScript 添加了静态类型定义。本指南将带你深入了解 TypeScript 的高级特性和最佳实践。

## 2. 高级类型系统

### 2.1 联合类型与交叉类型

联合类型表示一个值可以是几种类型之一：

```typescript
type StringOrNumber = string | number;

function formatValue(value: StringOrNumber): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toString();
}
```

交叉类型将多个类型合并为一个类型：

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee {
  employeeId: number;
  department: string;
}

type PersonEmployee = Person & Employee;

const employee: PersonEmployee = {
  name: "张三",
  age: 30,
  employeeId: 12345,
  department: "技术部"
};
```

### 2.2 泛型约束

使用 extends 关键字来约束泛型：

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

## 3. 装饰器

### 3.1 类装饰器

类装饰器在类声明之前被声明：

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

### 3.2 方法装饰器

方法装饰器声明在一个方法的声明之前：

```typescript
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

## 4. 模块系统

### 4.1 命名空间

命名空间是位于全局命名空间下的一个普通的带有名字的 JavaScript 对象：

```typescript
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}
```

### 4.2 模块导入导出

使用 ES6 模块语法：

```typescript
// math.ts
export function add(x: number, y: number): number {
  return x + y;
}

export function subtract(x: number, y: number): number {
  return x - y;
}

// calculator.ts
import { add, subtract } from "./math";

console.log(add(2, 3)); // 5
console.log(subtract(5, 2)); // 3
```

## 5. 工具类型

### 5.1 Partial<T>

将类型 T 的所有属性设为可选：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(id: number, updates: Partial<User>) {
  // 实现更新逻辑
}

updateUser(1, { name: "新名字" }); // 只更新 name 属性
```

### 5.2 Pick<T, K>

从类型 T 中选择属性 K：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserPreview = Pick<User, "id" | "name">;
// 等价于 { id: number; name: string; }
```

### 5.3 Omit<T, K>

从类型 T 中排除属性 K：

```typescript
type UserWithoutId = Omit<User, "id">;
// 等价于 { name: string; email: string; age: number; }
```

## 6. 条件类型

### 6.1 基本条件类型

条件类型的形式为 `T extends U ? X : Y`：

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null>; // string
type B = NonNullable<string | undefined>; // string
```

### 6.2 分布式条件类型

当条件类型作用于联合类型时，会分布到每个成员：

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StrArrOrNumArr = ToArray<string | number>; // string[] | number[]
```

## 7. 映射类型

### 7.1 基本映射类型

映射类型基于旧类型创建新类型：

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

### 7.2 条件映射类型

结合条件类型使用：

```typescript
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
```

## 8. 最佳实践

### 8.1 严格模式配置

在 tsconfig.json 中启用严格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 8.2 类型断言的使用

谨慎使用类型断言，优先使用类型守卫：

```typescript
// 类型守卫
function isString(value: any): value is string {
  return typeof value === "string";
}

// 使用类型守卫
if (isString(someValue)) {
  // someValue 在这里被推断为 string 类型
  console.log(someValue.toUpperCase());
}
```

## 9. 总结

TypeScript 提供了强大的类型系统，帮助我们编写更安全、更可维护的代码。通过掌握高级类型、装饰器、模块系统等特性，我们可以充分发挥 TypeScript 的优势。

记住以下关键点：
- 合理使用类型系统
- 善用工具类型
- 遵循最佳实践
- 保持代码的类型安全

希望这份指南能帮助你在 TypeScript 开发中更进一步！',
    'TypeScript 进阶开发指南，深入探讨高级类型系统、装饰器、模块系统、工具类型等核心特性，帮助开发者掌握 TypeScript 的高级用法。',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    'cmfuxrun700002gsmq3s50g99',
    'cat-tech',
    true,
    29.99,
    'PUBLISHED',
    2100,
    156,
    NOW(),
    NOW(),
    NOW()
);

-- 为已购买付费文章创建订单记录
INSERT INTO orders (
    id,
    "userId",
    "articleId",
    "collectionId",
    amount,
    status,
    "paymentMethod",
    "paymentId",
    "paidAt",
    "createdAt",
    "updatedAt"
) VALUES (
    'order-001',
    'cmfuxrun700002gsmq3s50g99',
    'art-paid-purchased',
    NULL,
    29.99,
    'COMPLETED',
    'wechat_pay',
    'wx_pay_123456789',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);
