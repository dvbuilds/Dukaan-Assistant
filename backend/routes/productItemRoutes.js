import { Router } from 'express';
import { updateProduct, deleteProduct } from '../controllers/productController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

// Mounted at /api/products — operates on a single product by its own :id,
// separate from productRoutes.js which is nested under /api/shops/:shopId/products
const router = Router();

router.patch('/:id', authenticate, authorize('shopkeeper'), updateProduct);
router.delete('/:id', authenticate, authorize('shopkeeper'), deleteProduct);

export default router;
