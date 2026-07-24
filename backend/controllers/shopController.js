import Shop from '../models/Shop.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/shops  (shopkeeper only)
export const createShop = asyncHandler(async (req, res) => {
  const { name, description, address, lat, lng, storeHours, deliveryPolicy } = req.body;

  if (lat === undefined || lng === undefined) {
    throw new ApiError(400, 'lat and lng are required to register a shop location.');
  }

  const shop = await Shop.create({
    owner: req.user._id,
    name,
    description,
    address,
    location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
    storeHours,
    deliveryPolicy,
  });

  res.status(201).json({ success: true, shop });
});

// GET /api/shops
// - If lat/lng/radius given -> geospatial "nearby shops" query
// - Otherwise -> plain list (paginated-ready, kept simple for now)
export const getShops = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;

  let query = Shop.find({ isActive: true });

  if (lat && lng) {
    const radiusInMeters = (Number(radius) || 5) * 1000; // default 5km
    query = Shop.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radiusInMeters,
        },
      },
    });
  }

  const shops = await query.limit(50);
  res.json({ success: true, count: shops.length, shops });
});

// GET /api/shops/:id
export const getShopById = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new ApiError(404, 'Shop not found.');
  res.json({ success: true, shop });
});

// PATCH /api/shops/:id  (owner only)
export const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw new ApiError(404, 'Shop not found.');

  if (shop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not own this shop.');
  }

  const { name, description, address, lat, lng, storeHours, deliveryPolicy, isActive } = req.body;

  if (name !== undefined) shop.name = name;
  if (description !== undefined) shop.description = description;
  if (address !== undefined) shop.address = address;
  if (storeHours !== undefined) shop.storeHours = storeHours;
  if (deliveryPolicy !== undefined) shop.deliveryPolicy = deliveryPolicy;
  if (isActive !== undefined) shop.isActive = isActive;
  if (lat !== undefined && lng !== undefined) {
    shop.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
  }

  await shop.save();
  res.json({ success: true, shop });
});

// GET /api/shops/mine/list  (shopkeeper only - their own shops)
export const getMyShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find({ owner: req.user._id });
  res.json({ success: true, count: shops.length, shops });
});
