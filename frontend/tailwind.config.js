/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调系统 - 紫色系
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },

        // 中性色系统
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        // 语义化颜色系统
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // 分类颜色系统
        'category-frontend': 'rgba(124, 58, 237, 0.1)',
        'category-backend': 'rgba(59, 130, 246, 0.1)',
        'category-database': 'rgba(16, 185, 129, 0.1)',
        'category-mobile': 'rgba(245, 158, 11, 0.1)',
        'category-cloud': 'rgba(236, 72, 153, 0.1)',
        'category-security': 'rgba(220, 38, 38, 0.1)',
      },
      // 完整字体系统
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
        serif: [
          'Crimson Text',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ],
        mono: [
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ]
      },

      // 完整阴影系统
      boxShadow: {
        'none': 'none',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 0 1px rgba(168, 85, 247, 0.05), 0 4px 16px rgba(168, 85, 247, 0.12)',

        // 彩色阴影
        'primary-glow': '0 0 0 1px rgba(168, 85, 247, 0.1), 0 4px 16px rgba(168, 85, 247, 0.2)',
        'success-glow': '0 0 0 1px rgba(34, 197, 94, 0.1), 0 4px 16px rgba(34, 197, 94, 0.2)',
        'warning-glow': '0 0 0 1px rgba(245, 158, 11, 0.1), 0 4px 16px rgba(245, 158, 11, 0.2)',
        'error-glow': '0 0 0 1px rgba(239, 68, 68, 0.1), 0 4px 16px rgba(239, 68, 68, 0.2)',

        // 内阴影
        'inner-subtle': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-medium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },

      // 完整动画系统
      animation: {
        // 基础动画
        'fadeIn': 'fadeIn 0.5s ease-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.6s ease-out',
        'fadeInLeft': 'fadeInLeft 0.6s ease-out',
        'fadeInRight': 'fadeInRight 0.6s ease-out',
        'scaleIn': 'scaleIn 0.4s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'slideDown': 'slideDown 0.5s ease-out',

        // 特殊动画
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'progress': 'progress 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s linear infinite',

        // 卡片动画
        'card-hover': 'cardHover 0.3s ease-out',
        'button-press': 'buttonPress 0.15s ease-out',
        'text-shimmer': 'textShimmer 2s linear infinite',
      },

      // 完整关键帧系统
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        fadeInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translateY(0)'
          },
          '40%, 43%': {
            transform: 'translateY(-8px)'
          },
          '70%': {
            transform: 'translateY(-4px)'
          },
          '90%': {
            transform: 'translateY(-2px)'
          }
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' }
        },
        skeleton: {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          }
        },
        cardHover: {
          '0%': {
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          },
          '100%': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }
        },
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' }
        },
        textShimmer: {
          '0%': {
            backgroundPosition: '-200% center'
          },
          '100%': {
            backgroundPosition: '200% center'
          }
        }
      }
    },
  },
  plugins: [
    // 自定义插件 - 添加工具类
    function({ addUtilities, theme }) {
      const newUtilities = {
        // 文字渐变工具类
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text'
        },
        '.text-gradient-hover': {
          'background': 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text'
        },

        // 卡片悬停效果
        '.card-hover': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': theme('boxShadow.floating')
          }
        },

        // 按钮悬停效果
        '.button-hover': {
          'transition': 'all 0.2s ease',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': theme('boxShadow.soft')
          },
          '&:active': {
            'transform': 'translateY(0)',
            'box-shadow': theme('boxShadow.subtle')
          }
        },

        // 分类卡片样式
        '.category-card': {
          'background': 'white',
          'border-radius': theme('borderRadius.2xl'),
          'padding': theme('spacing.6'),
          'box-shadow': theme('boxShadow.soft'),
          'transition': 'all 0.3s ease',
          'cursor': 'pointer',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': theme('boxShadow.large')
          }
        },

        // 英雄区域背景
        '.hero-gradient': {
          'background': 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)'
        },

        // 骨架屏动画
        '.skeleton': {
          'background': 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          'background-size': '200% 100%',
          'animation': 'skeleton 1.5s linear infinite'
        },

        // 滚动条样式
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': theme('colors.gray.300') + ' transparent'
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          'width': '6px'
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          'background': 'transparent'
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': theme('colors.gray.300'),
          'border-radius': '3px'
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': theme('colors.gray.400')
        },

        // 焦点样式
        '.focus-ring': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': '0 0 0 3px rgba(168, 85, 247, 0.1)'
          }
        },

        // 无障碍隐藏
        '.sr-only': {
          'position': 'absolute',
          'width': '1px',
          'height': '1px',
          'padding': '0',
          'margin': '-1px',
          'overflow': 'hidden',
          'clip': 'rect(0, 0, 0, 0)',
          'white-space': 'nowrap',
          'border': '0'
        }
      }

      addUtilities(newUtilities)
    }
  ],
}
