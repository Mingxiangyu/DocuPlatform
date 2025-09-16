import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { logger } from '@utils/logger'

/**
 * 验证中间件工厂
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {}

    // 验证请求体
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false })
      if (error) {
        errors.body = error.details.map(detail => detail.message)
      }
    }

    // 验证路径参数
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false })
      if (error) {
        errors.params = error.details.map(detail => detail.message)
      }
    }

    // 验证查询参数
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false })
      if (error) {
        errors.query = error.details.map(detail => detail.message)
      }
    }

    // 如果有验证错误，返回错误响应
    if (Object.keys(errors).length > 0) {
      logger.warn('数据验证失败:', { url: req.url, errors })
      
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        code: 'VALIDATION_ERROR',
        errors
      })
    }

    next()
  }
}

// 通用验证规则
export const commonValidations = {
  // ID验证
  id: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required().messages({
    'string.pattern.base': 'ID格式无效',
    'any.required': 'ID是必需的'
  }),

  // 邮箱验证
  email: Joi.string().email().required().messages({
    'string.email': '邮箱格式无效',
    'any.required': '邮箱是必需的'
  }),

  // 密码验证
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': '密码至少需要8个字符',
    'string.pattern.base': '密码必须包含大小写字母和数字',
    'any.required': '密码是必需的'
  }),

  // 昵称验证
  nickname: Joi.string().min(2).max(20).required().messages({
    'string.min': '昵称至少需要2个字符',
    'string.max': '昵称最多20个字符',
    'any.required': '昵称是必需的'
  }),

  // 分页参数
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  },

  // 价格验证
  price: Joi.number().precision(2).min(0).max(99999.99).messages({
    'number.base': '价格必须是数字',
    'number.min': '价格不能为负数',
    'number.max': '价格不能超过99999.99'
  }),

  // URL验证
  url: Joi.string().uri().messages({
    'string.uri': 'URL格式无效'
  }),

  // 颜色验证
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$|^(yellow|green|blue|pink|orange)$/).messages({
    'string.pattern.base': '颜色格式无效'
  })
}

// 认证相关验证规则
export const authValidations = {
  // 登录验证
  login: {
    body: Joi.object({
      email: commonValidations.email,
      password: Joi.string().required().messages({
        'any.required': '密码是必需的'
      })
    })
  },

  // 注册验证
  register: {
    body: Joi.object({
      email: commonValidations.email,
      password: commonValidations.password,
      nickname: commonValidations.nickname
    })
  },

  // 刷新token验证
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': '刷新token是必需的'
      })
    })
  },

  // 重置密码验证
  resetPassword: {
    body: Joi.object({
      email: commonValidations.email
    })
  },

  // 验证邮箱
  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': '验证token是必需的'
      })
    })
  },

  // 更新密码
  updatePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': '当前密码是必需的'
      }),
      newPassword: commonValidations.password
    })
  }
}

// 文章相关验证规则
export const articleValidations = {
  // 创建文章
  create: {
    body: Joi.object({
      title: Joi.string().min(1).max(200).required().messages({
        'string.min': '标题不能为空',
        'string.max': '标题最多200个字符',
        'any.required': '标题是必需的'
      }),
      content: Joi.string().min(1).required().messages({
        'string.min': '内容不能为空',
        'any.required': '内容是必需的'
      }),
      excerpt: Joi.string().max(500).optional().messages({
        'string.max': '摘要最多500个字符'
      }),
      coverImageUrl: commonValidations.url.optional(),
      categoryId: commonValidations.id.optional(),
      isPaid: Joi.boolean().default(false),
      price: Joi.when('isPaid', {
        is: true,
        then: commonValidations.price.required(),
        otherwise: Joi.forbidden()
      })
    })
  },

  // 更新文章
  update: {
    params: Joi.object({
      id: commonValidations.id
    }),
    body: Joi.object({
      title: Joi.string().min(1).max(200).optional(),
      content: Joi.string().min(1).optional(),
      excerpt: Joi.string().max(500).optional(),
      coverImageUrl: commonValidations.url.optional(),
      categoryId: commonValidations.id.optional(),
      isPaid: Joi.boolean().optional(),
      price: commonValidations.price.optional(),
      status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional()
    })
  },

  // 获取文章列表
  list: {
    query: Joi.object({
      ...commonValidations.pagination,
      categoryId: commonValidations.id.optional(),
      authorId: commonValidations.id.optional(),
      status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
      isPaid: Joi.boolean().optional(),
      search: Joi.string().max(100).optional()
    })
  },

  // 获取单篇文章
  get: {
    params: Joi.object({
      id: commonValidations.id
    })
  }
}

// 笔记相关验证规则
export const noteValidations = {
  // 创建笔记
  create: {
    body: Joi.object({
      articleId: commonValidations.id,
      highlightText: Joi.string().max(1000).optional(),
      noteText: Joi.string().max(2000).optional(),
      positionData: Joi.object().required().messages({
        'any.required': '位置数据是必需的'
      })
    })
  },

  // 更新笔记
  update: {
    params: Joi.object({
      id: commonValidations.id
    }),
    body: Joi.object({
      highlightText: Joi.string().max(1000).optional(),
      noteText: Joi.string().max(2000).optional(),
      positionData: Joi.object().optional()
    })
  }
}

// 高亮相关验证规则
export const highlightValidations = {
  // 创建高亮
  create: {
    body: Joi.object({
      articleId: commonValidations.id,
      startOffset: Joi.number().integer().min(0).required(),
      endOffset: Joi.number().integer().min(0).required(),
      color: commonValidations.color.default('yellow'),
      virtualNodeId: Joi.string().required().messages({
        'any.required': '虚拟节点ID是必需的'
      })
    })
  },

  // 更新高亮颜色
  updateColor: {
    params: Joi.object({
      id: commonValidations.id
    }),
    body: Joi.object({
      color: commonValidations.color.required()
    })
  }
}
