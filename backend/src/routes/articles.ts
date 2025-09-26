import { Router, Request, Response } from 'express'
import { prisma } from '../server'
import { asyncHandler, createSuccessResponse, createErrorResponse } from '../middleware/errorHandler'
// import { BusinessLogger } from '../utils/logger' // 暂时注释掉未使用的导入

const router = Router()

/**
 * 获取文章列表
 */
router.get('/', 
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, category, status = 'PUBLISHED' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      status: status as string
    }

    if (category) {
      where.categoryId = category
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.article.count({ where })
    ])

    // BusinessLogger.logArticleListAccess(req.ip, articles.length)

    const response = createSuccessResponse({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })

    res.json(response)
  })
)

/**
 * 获取单篇文章详情
 */
router.get('/:id', 
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '文章ID不能为空',
        code: 'INVALID_ARTICLE_ID'
      })
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    if (!article) {
      const { response, statusCode } = createErrorResponse(
        '文章不存在',
        'ARTICLE_NOT_FOUND',
        404
      )
      return res.status(statusCode).json(response)
    }

    // 增加浏览量
    await prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // BusinessLogger.logArticleAccess(id, req.ip)

    const response = createSuccessResponse(article)
    res.json(response)
  })
)

/**
 * 获取文章分类列表
 */
router.get('/categories/list', 
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    const response = createSuccessResponse(categories)
    res.json(response)
  })
)

export default router
