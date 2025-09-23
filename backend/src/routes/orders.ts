import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// 获取用户的购买记录
router.get('/my-purchases', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: '用户未认证' })
    }

    // 查询用户的所有已完成订单
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        articleId: true,
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        article: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(orders)
  } catch (error) {
    console.error('获取购买记录失败:', error)
    res.status(500).json({ error: '获取购买记录失败' })
  }
})

// 创建订单
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: '用户未认证' })
    }

    const { articleId } = req.body
    if (!articleId) {
      return res.status(400).json({ error: '文章ID不能为空' })
    }

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    if (!article.isPaid) {
      return res.status(400).json({ error: '该文章为免费文章，无需购买' })
    }

    // 检查用户是否已经购买过
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        articleId: articleId,
        status: 'COMPLETED'
      }
    })

    if (existingOrder) {
      return res.status(400).json({ error: '您已经购买过该文章' })
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: userId,
        articleId: articleId,
        amount: article.price,
        status: 'PENDING'
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    res.json(order)
  } catch (error) {
    console.error('创建订单失败:', error)
    res.status(500).json({ error: '创建订单失败' })
  }
})

// 模拟支付完成
router.post('/:orderId/complete', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: '用户未认证' })
    }

    const { orderId } = req.params

    // 查找订单
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      }
    })

    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: '订单已完成' })
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date()
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error('完成支付失败:', error)
    res.status(500).json({ error: '完成支付失败' })
  }
})

export default router
