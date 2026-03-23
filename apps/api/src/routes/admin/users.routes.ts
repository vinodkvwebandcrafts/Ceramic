import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';
import { parsePagination, buildPagination } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

router.use(auth, admin);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      }),
      prisma.user.count(),
    ]);
    res.json({ success: true, data: users, pagination: buildPagination(page, limit, total) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, addresses: true, orders: { orderBy: { createdAt: 'desc' }, take: 10 }, _count: { select: { orders: true, reviews: true } } },
    });
    if (!user) throw new NotFoundError('User not found');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

export default router;
