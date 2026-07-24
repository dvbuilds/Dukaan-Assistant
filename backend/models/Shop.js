import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    // GeoJSON Point for "nearby shops" queries via $near / $geoNear.
    // coordinates order is [longitude, latitude] — GeoJSON convention.
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    storeHours: {
      type: String,
      default: '9:00 AM - 9:00 PM',
    },
    deliveryPolicy: {
      type: String,
      default: 'Contact shop for delivery details.',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 2dsphere index enables $near/$geoNear geospatial queries for "nearby shops"
shopSchema.index({ location: '2dsphere' });

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
