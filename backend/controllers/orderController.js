import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/orders  (customer only)  body: { shopId, deliveryAddress, paymentMethod }
// Builds the order from the customer's current cart for that shop, snapshots
// prices, decrements stock, then clears the cart.
export const placeOrder = asyncHandler(async (req, res) => {
  const { shopId, deliveryAddress, paymentMethod } = req.body;
  if (!shopId) throw new ApiError(400, 'shopId is required.');

  const cart = await Cart.findOne({ customer: req.user._id, shop: shopId }).populate(
    'items.product'
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty.');
  }

  // Validate stock and build snapshot items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product) throw new ApiError(400, 'A product in your cart no longer exists.');
    if (product.stockQty < item.quantity) {
      throw new ApiError(400, `Only ${product.stockQty} of ${product.name} available.`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    totalAmount += product.price * item.quantity;
  }

  // Decrement stock
  for (const item of cart.items) {
    await Product.updateOne(
      { _id: item.product._id },
      { $inc: { stockQty: -item.quantity } }
    );
  }

  const order = await Order.create({
    customer: req.user._id,
    shop: shopId,
    items: orderItems,
    totalAmount,
    paymentMethod: paymentMethod || 'cod',
    deliveryAddress: deliveryAddress || '',
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

// GET /api/orders/mine  (customer only)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// GET /api/shops/:shopId/orders  (shopkeeper only, must own shop)
export const getShopOrders = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.shopId);
  if (!shop) throw new ApiError(404, 'Shop not found.');
  if (shop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not own this shop.');
  }

  const orders = await Order.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// PATCH /api/orders/:id/status  (shopkeeper only)  body: { status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'delivered'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');

  const shop = await Shop.findById(order.shop);
  if (!shop || shop.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not own the shop for this order.');
  }

  // If rejecting an order that already decremented stock, restore it
  if (status === 'rejected' && order.status !== 'rejected') {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stockQty: item.quantity } });
    }
  }

  order.status = status;
  await order.save();

  res.json({ success: true, order });
});
