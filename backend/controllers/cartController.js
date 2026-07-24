import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/cart?shopId=...  (customer only)
export const getCart = asyncHandler(async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) throw new ApiError(400, 'shopId query param is required.');

  const cart = await Cart.findOne({ customer: req.user._id, shop: shopId }).populate(
    'items.product'
  );

  res.json({ success: true, cart: cart || { customer: req.user._id, shop: shopId, items: [] } });
});

// POST /api/cart/items  (customer only)  body: { shopId, productId, quantity }
export const addItemToCart = asyncHandler(async (req, res) => {
  const { shopId, productId, quantity = 1 } = req.body;
  if (!shopId || !productId) throw new ApiError(400, 'shopId and productId are required.');

  const product = await Product.findOne({ _id: productId, shop: shopId });
  if (!product) throw new ApiError(404, 'Product not found in this shop.');

  if (product.stockQty < quantity) {
    throw new ApiError(400, `Only ${product.stockQty} of ${product.name} available.`);
  }

  let cart = await Cart.findOne({ customer: req.user._id, shop: shopId });
  if (!cart) {
    cart = await Cart.create({ customer: req.user._id, shop: shopId, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(201).json({ success: true, cart });
});

// PATCH /api/cart/items/:productId  (customer only)  body: { shopId, quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { shopId, quantity } = req.body;
  const { productId } = req.params;

  if (!shopId || quantity === undefined) {
    throw new ApiError(400, 'shopId and quantity are required.');
  }

  const cart = await Cart.findOne({ customer: req.user._id, shop: shopId });
  if (!cart) throw new ApiError(404, 'Cart not found.');

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, 'Item not in cart.');

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate('items.product');

  res.json({ success: true, cart });
});

// DELETE /api/cart/items/:productId?shopId=...  (customer only)
export const removeCartItem = asyncHandler(async (req, res) => {
  const { shopId } = req.query;
  const { productId } = req.params;
  if (!shopId) throw new ApiError(400, 'shopId query param is required.');

  const cart = await Cart.findOne({ customer: req.user._id, shop: shopId });
  if (!cart) throw new ApiError(404, 'Cart not found.');

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  res.json({ success: true, cart });
});
