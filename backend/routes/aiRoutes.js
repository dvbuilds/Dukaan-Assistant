import { Router } from 'express';
import { askShopAi, voiceBuildCart, voiceUpdateInventory } from '../controllers/aiController.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

// Mounted at /api/shops/:shopId/ai
const router = Router({ mergeParams: true });

router.post('/ask', authenticate, authorize('customer'), askShopAi);

// Voice-ready placeholders (501 until implemented) — see aiController.js
router.post('/voice-cart', authenticate, authorize('customer'), voiceBuildCart);
router.post('/voice-inventory', authenticate, authorize('shopkeeper'), voiceUpdateInventory);

export default router;
