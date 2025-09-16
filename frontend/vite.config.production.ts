import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    vue(),
    
    // HTML 模板处理
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'DocuVault - 知识付费平台',
          description: '专业的知识付费和文档管理平台',
          keywords: '知识付费,文档管理,在线学习,笔记,高亮',
          author: 'DocuVault Team'
        }
      }
    }),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    
    // Brotli 压缩
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    
    // 打包分析
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  // 构建配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'terser',
    
    // Terser 压缩配置
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'] // 移除指定函数
      },
      mangle: {
        safari10: true // 兼容 Safari 10
      }
    },
    
    // 代码分割配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      output: {
        // 手动分包
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // UI 组件库
          'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          
          // 工具库
          'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
          
          // 虚拟DOM高亮系统
          'highlight-system': [
            './src/utils/VirtualDOMManager.ts',
            './src/utils/HighlightManager.ts',
            './src/utils/TextSelector.ts'
          ],
          
          // 业务模块
          'business-modules': [
            './src/stores/articles.ts',
            './src/stores/notes.ts',
            './src/stores/highlights.ts',
            './src/stores/payment.ts'
          ]
        },
        
        // 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.')
          const ext = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name!)) {
            return `assets/media/[name]-[hash].${ext}`
          }
          
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name!)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          
          return `assets/[ext]/[name]-[hash].${ext}`
        }
      },
      
      // 外部依赖（CDN）
      external: [],
      
      // 警告处理
      onwarn(warning, warn) {
        // 忽略某些警告
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
    
    // 资源内联阈值
    assetsInlineLimit: 4096, // 4KB 以下的资源内联
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 生成清单文件
    manifest: true,
    
    // 报告压缩详情
    reportCompressedSize: true,
    
    // 块大小警告限制
    chunkSizeWarningLimit: 1000 // 1MB
  },
  
  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 30000
      }
    }
  },
  
  // 预览服务器配置
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  
  // CSS 配置
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            colormin: true,
            convertValues: true,
            discardDuplicates: true,
            discardEmpty: true,
            mergeRules: true,
            minifyFontValues: true,
            minifySelectors: true
          }]
        })
      ]
    }
  },
  
  // 环境变量
  define: {
    __VUE_OPTIONS_API__: false, // 禁用 Options API
    __VUE_PROD_DEVTOOLS__: false, // 生产环境禁用 devtools
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  // 优化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@headlessui/vue',
      '@heroicons/vue/24/outline',
      '@heroicons/vue/24/solid'
    ],
    exclude: [
      'vue-demi'
    ]
  },
  
  // 实验性功能
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  },
  
  // ESBuild 配置
  esbuild: {
    drop: ['console', 'debugger'], // 移除 console 和 debugger
    legalComments: 'none' // 移除法律注释
  }
})
