import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Exists now so future AI chat + voice features (customer cart-building,
// shopkeeper inventory updates) have somewhere to persist history without
// a schema migration later. Not yet written to by Phase 9's basic Q&A
// endpoint, but wired for that to be a small addition, not a redesign.
const aiConversationSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'shopkeeper'],
      required: true,
    },
    // 'chat' = text Q&A (Phase 9); 'voice_cart' / 'voice_inventory' reserved
    // for the future voice-assistant features described in the brief.
    channel: {
      type: String,
      enum: ['chat', 'voice_cart', 'voice_inventory'],
      default: 'chat',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

aiConversationSchema.index({ shop: 1, user: 1 });

const AiConversation = mongoose.model('AiConversation', aiConversationSchema);

export default AiConversation;
