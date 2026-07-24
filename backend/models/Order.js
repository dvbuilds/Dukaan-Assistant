import mongoose from 'mongoose';

// Order items snapshot name/price at the time of order, so later price or
// name changes on the Product never rewrite order history.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'delivered'],
      default: 'pending',
    },
    // Payment-ready placeholder — no gateway wired up yet, but the shape
    // exists so a future payments phase doesn't require a schema migration.
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

orderSchema.index({ shop: 1, status: 1 });
orderSchema.index({ customer: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
