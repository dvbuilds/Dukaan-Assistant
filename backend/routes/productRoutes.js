import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProductsByShop,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateRequest from '../middleware/validateRequest.js';

// mergeParams lets this router read :shopId from the parent mount in server.js
const router = Router({ mergeParams: true });

// Public - customers browse a shop's products
router.get('/', getProductsByShop);

// Shopkeeper-only
router.post(
  '/',
  authenticate,
  authorize('shopkeeper'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
    body('stockQty').isInt({ min: 0 }).withMessage('stockQty must be a non-negative integer'),
  ],
  validateRequest,
  createProduct
);

export default router;
