import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = Router();

router.post('/', authenticate, authorize('customer'), placeOrder);
router.get('/mine', authenticate, authorize('customer'), getMyOrders);
router.patch('/:id/status', authenticate, authorize('shopkeeper'), updateOrderStatus);

export default router;
