import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import categoriesRoutes from './categories.routes.js';
import cartRoutes from './cart.routes.js';
import ordersRoutes from './orders.routes.js';
import reviewsRoutes from './reviews.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import paymentsRoutes from './payments.routes.js';
import uploadRoutes from './upload.routes.js';
import adminProductsRoutes from './admin/products.routes.js';
import adminOrdersRoutes from './admin/orders.routes.js';
import adminUsersRoutes from './admin/users.routes.js';
import adminCategoriesRoutes from './admin/categories.routes.js';
import adminReviewsRoutes from './admin/reviews.routes.js';
import adminAnalyticsRoutes from './admin/analytics.routes.js';

const router = Router();

// Public
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);

// Customer (auth required - handled within each route file)
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/payments', paymentsRoutes);
router.use('/upload', uploadRoutes);

// Admin
router.use('/admin/products', adminProductsRoutes);
router.use('/admin/orders', adminOrdersRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/admin/categories', adminCategoriesRoutes);
router.use('/admin/reviews', adminReviewsRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);

export default router;
