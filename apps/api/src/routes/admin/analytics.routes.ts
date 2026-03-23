import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';

const router = Router();

router.use(auth, admin);

router.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalRevenue, totalOrders, totalCustomers, lowStockProducts] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'CAPTURED' }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 }, isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total ?? 0,
        totalOrders,
        totalCustomers,
        lowStockProducts,
      },
    });
  } catch (err) { next(err); }
});

router.get('/products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [topProducts, lowStock] = await Promise.all([
      prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { price: true, quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        include: { product: { select: { name: true } } },
        orderBy: { stock: 'asc' },
        take: 20,
      }),
    ]);
    res.json({ success: true, data: { topProducts, lowStock } });
  } catch (err) { next(err); }
});

export default router;
