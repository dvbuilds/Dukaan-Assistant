import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import AiConversation from '../models/AiConversation.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateShopReply } from '../services/aiService.js';

// POST /api/shops/:shopId/ai/ask  (customer only)  body: { question, language }
// Shop data is loaded from MongoDB by shopId in the URL — never trusted from
// the request body. This is what makes "AI only answers about this shop"
// an actual guarantee instead of something the client could spoof.
export const askShopAi = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { question, language } = req.body;

  if (!question || !question.trim()) {
    throw new ApiError(400, 'question is required.');
  }

  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, 'Shop not found.');

  const products = await Product.find({ shop: shopId });

  const reply = await generateShopReply({ shop, products, question, language });

  // Persist to conversation history so future voice/chat features (and any
  // "show my past questions" UI) have data to build on immediately.
  await AiConversation.findOneAndUpdate(
    { shop: shopId, user: req.user._id, channel: 'chat' },
    {
      $setOnInsert: { role: 'customer' },
      $push: {
        messages: {
          $each: [
            { sender: 'user', text: question },
            { sender: 'ai', text: reply },
          ],
        },
      },
    },
    { upsert: true }
  );

  res.json({ success: true, reply });
});

// --- Voice-assistant placeholders -----------------------------------------
// Contract exists now so the frontend/routes don't change shape later;
// implementation intentionally deferred per the phased plan.

// POST /api/shops/:shopId/ai/voice-cart  (customer only)
export const voiceBuildCart = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Voice-based cart building is not implemented yet.',
  });
});

// POST /api/shops/:shopId/ai/voice-inventory  (shopkeeper only)
export const voiceUpdateInventory = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Voice-based inventory updates are not implemented yet.',
  });
});
