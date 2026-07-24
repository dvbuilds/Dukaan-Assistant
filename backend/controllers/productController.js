import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Shared helper: throws unless req.user owns the shop identified by shopId
async function assertOwnsShop(shopId, userId) {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, 'Shop not found.');
  if (shop.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not own this shop.');
  }
  return shop;
}

// POST /api/shops/:shopId/products  (owner only)
export const createProduct = asyncHandler(async (req, res) => {
  await assertOwnsShop(req.params.shopId, req.user._id);

  const { name, category, price, unit, stockQty, imageUrl } = req.body;

  const product = await Product.create({
    shop: req.params.shopId,
    name,
    category,
    price,
    unit,
    stockQty,
    imageUrl,
  });

  res.status(201).json({ success: true, product });
});

// GET /api/shops/:shopId/products  (public - customer browsing)
export const getProductsByShop = asyncHandler(async (req, res) => {
  const { category, q } = req.query;
  const filter = { shop: req.params.shopId };

  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const products = await Product.find(filter).sort({ name: 1 });
  res.json({ success: true, count: products.length, products });
});

// PATCH /api/products/:id  (owner only)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');

  await assertOwnsShop(product.shop, req.user._id);

  const { name, category, price, unit, stockQty, imageUrl } = req.body;

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = price;
  if (unit !== undefined) product.unit = unit;
  if (stockQty !== undefined) product.stockQty = stockQty;
  if (imageUrl !== undefined) product.imageUrl = imageUrl;

  await product.save();
  res.json({ success: true, product });
});

// DELETE /api/products/:id  (owner only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');

  await assertOwnsShop(product.shop, req.user._id);

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted.' });
});
