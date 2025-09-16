/**
 * Vitest 测试配置
 * 配置单元测试、集成测试和覆盖率报告
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置文件
    setupFiles: ['./src/design-system/tests/setup.ts'],
    
    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/design-system/tests/**/*.test.ts'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.nuxt',
      'coverage',
      'e2e'
    ],
    
    // 全局变量
    globals: true,
    
    // 测试超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      
      // 包含的文件
      include: [
        'src/design-system/**/*.{js,ts,vue}',
        'src/components/**/*.vue',
        'src/utils/**/*.ts'
      ],
      
      // 排除的文件
      exclude: [
        'src/design-system/tests/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/index.ts',
        'node_modules/**',
        'dist/**'
      ]
    },
    
    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html'
    },
    
    // 监听模式配置
    watch: {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**']
    },
    
    // 模拟配置
    deps: {
      inline: ['@vue', '@vueuse']
    },
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITEST: 'true'
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@design-system': resolve(__dirname, './src/design-system'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types')
    }
  },
  
  // 定义全局常量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  
  // 优化配置
  optimizeDeps: {
    include: ['vue', '@vue/test-utils', 'vitest']
  }
})
