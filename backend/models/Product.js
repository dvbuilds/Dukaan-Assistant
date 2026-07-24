import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'pc', // e.g. kg, litre, pack, pc
    },
    stockQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Availability is derived from stockQty rather than stored redundantly,
// so it can never drift out of sync with the actual count.
productSchema.virtual('isAvailable').get(function isAvailable() {
  return this.stockQty > 0;
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.index({ shop: 1, name: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
