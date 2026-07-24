import { Router } from 'express';
import { body } from 'express-validator';
import {
  createShop,
  getShops,
  getShopById,
  updateShop,
  getMyShops,
} from '../controllers/shopController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateRequest from '../middleware/validateRequest.js';

const router = Router();

// Public / customer browsing
router.get('/', getShops);
router.get('/mine/list', authenticate, authorize('shopkeeper'), getMyShops);
router.get('/:id', getShopById);

// Shopkeeper-only
router.post(
  '/',
  authenticate,
  authorize('shopkeeper'),
  [
    body('name').trim().notEmpty().withMessage('Shop name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('lat').isFloat().withMessage('lat is required'),
    body('lng').isFloat().withMessage('lng is required'),
  ],
  validateRequest,
  createShop
);

router.patch('/:id', authenticate, authorize('shopkeeper'), updateShop);

export default router;
