import { Router } from 'express';
import { getShopOrders } from '../controllers/orderController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

// Mounted at /api/shops/:shopId/orders
const router = Router({ mergeParams: true });

router.get('/', authenticate, authorize('shopkeeper'), getShopOrders);

export default router;
