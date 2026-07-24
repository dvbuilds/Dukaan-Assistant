import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dukaan-assistant';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

const StoreSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  ownerEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  slug: { type: String, unique: true },
  storeHours: { type: String, default: '9:00 AM - 9:00 PM, Monday to Saturday (Sunday closed)' },
  deliveryPolicy: { type: String, default: 'Free home delivery for orders above ₹500 within 2 km. For orders below ₹500, delivery charge is ₹30. Standard delivery time is 2-4 hours.' },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  productName: { type: String, required: true, trim: true },
  price: { type: String, required: true, trim: true },
  stockStatus: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
  createdAt: { type: Date, default: Date.now }
});

const InvoiceSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  customerName: { type: String, required: true },
  customerContact: { type: String, default: '' },
  items: [
    {
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: String, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const QueryLogSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  question: { type: String, required: true },
  reply: { type: String, required: true },
  language: { type: String, default: 'English' },
  source: { type: String, enum: ['owner', 'public'], default: 'owner' },
  createdAt: { type: Date, default: Date.now }
});

const Store = mongoose.model('Store', StoreSchema);
const Product = mongoose.model('Product', ProductSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const QueryLog = mongoose.model('QueryLog', QueryLogSchema);

async function generateUniqueSlug(storeName) {
  let baseSlug = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!baseSlug) baseSlug = 'store';

  let slug = baseSlug;
  let count = 1;
  while (true) {
    const existing = await Store.findOne({ slug });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${count}`;
    count++;
  }
}

mongoose.connection.once('open', async () => {
  try {
    const legacyStores = await Store.find({ slug: { $exists: false } });
    for (const store of legacyStores) {
      store.slug = await generateUniqueSlug(store.storeName);
      await store.save();
      console.log(`Migrated legacy store "${store.storeName}" with slug "${store.slug}"`);
    }
  } catch (error) {
    console.error('Legacy store slug migration error:', error);
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || 'YOUR_JWT_SECRET_HERE';
    const decoded = jwt.verify(token, jwtSecret);
    req.storeId = decoded.storeId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { storeName, ownerEmail, password } = req.body;
    if (!storeName || !ownerEmail || !password) {
      return res.status(400).json({ error: 'Store name, email, and password are required.' });
    }

    const emailLower = ownerEmail.toLowerCase().trim();
    const existingStore = await Store.findOne({ ownerEmail: emailLower });
    if (existingStore) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const slug = await generateUniqueSlug(storeName);

    const store = new Store({
      storeName,
      ownerEmail: emailLower,
      passwordHash,
      slug
    });
    await store.save();

    const defaultProducts = [
      { productName: 'Fortune Mustard Oil (1 Litre)', price: '175', stockStatus: 'In Stock' },
      { productName: 'Aashirvaad Shudh Chakki Atta (5 kg)', price: '260', stockStatus: 'In Stock' },
      { productName: 'Tata Salt (1 kg)', price: '28', stockStatus: 'In Stock' },
      { productName: 'Amul Butter (500g)', price: '275', stockStatus: 'Out of Stock' },
      { productName: 'Maggi 2-Minute Noodles (Pack of 12)', price: '168', stockStatus: 'In Stock' },
      { productName: 'Surf Excel Easy Wash (1 kg)', price: '140', stockStatus: 'In Stock' },
      { productName: 'Dettol Liquid Handwash Refill (175ml)', price: '99', stockStatus: 'Out of Stock' }
    ];
    await Product.insertMany(defaultProducts.map(p => ({ ...p, storeId: store._id })));

    const jwtSecret = process.env.JWT_SECRET || 'YOUR_JWT_SECRET_HERE';
    const token = jwt.sign({ storeId: store._id }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        ownerEmail: store.ownerEmail,
        storeHours: store.storeHours,
        deliveryPolicy: store.deliveryPolicy,
        slug: store.slug
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create store account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { ownerEmail, password } = req.body;
    if (!ownerEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailLower = ownerEmail.toLowerCase().trim();
    const store = await Store.findOne({ ownerEmail: emailLower });
    if (!store) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, store.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!store.slug) {
      store.slug = await generateUniqueSlug(store.storeName);
      await store.save();
    }

    const jwtSecret = process.env.JWT_SECRET || 'YOUR_JWT_SECRET_HERE';
    const token = jwt.sign({ storeId: store._id }, jwtSecret, { expiresIn: '7d' });

    res.json({
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        ownerEmail: store.ownerEmail,
        storeHours: store.storeHours,
        deliveryPolicy: store.deliveryPolicy,
        slug: store.slug
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/shop-info', authMiddleware, async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (!store.slug) {
      store.slug = await generateUniqueSlug(store.storeName);
      await store.save();
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isConfigured = !!apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_');

    res.json({
      storeName: store.storeName,
      storeHours: store.storeHours,
      deliveryPolicy: store.deliveryPolicy,
      slug: store.slug,
      apiKeyConfigured: isConfigured
    });
  } catch (error) {
    console.error('Failed to get store info:', error);
    res.status(500).json({ error: 'Failed to read shop info.' });
  }
});

app.post('/api/shop-info', authMiddleware, async (req, res) => {
  try {
    const { storeName, storeHours, deliveryPolicy } = req.body;
    
    const currentStore = await Store.findById(req.storeId);
    let slug = currentStore.slug;
    if (storeName && storeName.trim() !== currentStore.storeName) {
      slug = await generateUniqueSlug(storeName);
    }

    const store = await Store.findByIdAndUpdate(
      req.storeId,
      { storeName, storeHours, deliveryPolicy, slug },
      { new: true }
    );
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isConfigured = !!apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_');

    res.json({
      message: 'Shop info saved successfully.',
      data: {
        storeName: store.storeName,
        storeHours: store.storeHours,
        deliveryPolicy: store.deliveryPolicy,
        slug: store.slug
      },
      apiKeyConfigured: isConfigured
    });
  } catch (error) {
    console.error('Failed to save store details:', error);
    res.status(500).json({ error: 'Failed to save shop details.' });
  }
});

app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.storeId }).sort({ createdAt: 1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to load products.' });
  }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { productName, price, stockStatus } = req.body;
    if (!productName || !price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }

    const newProduct = new Product({
      storeId: req.storeId,
      productName,
      price,
      stockStatus: stockStatus || 'In Stock'
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to save product.' });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { productName, price, stockStatus } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      { productName, price, stockStatus },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Edit product error:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

app.get('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ storeId: req.storeId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to load invoices.' });
  }
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const { customerName, customerContact, items, totalAmount } = req.body;
    if (!customerName || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ error: 'Customer name, items, and total amount are required.' });
    }

    const newInvoice = new Invoice({
      storeId: req.storeId,
      customerName,
      customerContact: customerContact || '',
      items,
      totalAmount
    });
    await newInvoice.save();

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to save invoice.' });
  }
});

app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const logs = await QueryLog.find({ storeId: req.storeId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to load query logs.' });
  }
});

app.delete('/api/history', authMiddleware, async (req, res) => {
  try {
    await QueryLog.deleteMany({ storeId: req.storeId });
    res.json({ message: 'History cleared successfully.' });
  } catch (error) {
    console.error('Delete logs error:', error);
    res.status(500).json({ error: 'Failed to clear query logs.' });
  }
});

app.post('/api/generate', authMiddleware, async (req, res) => {
  const { question, language } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    return res.status(400).json({ 
      error: 'GEMINI_API_KEY environment variable is not configured or is using a placeholder. Please set a valid API key in backend/.env'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemma-2-9b-it';

  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const products = await Product.find({ storeId: req.storeId }).sort({ createdAt: 1 });

    const prompt = `You are the customer service assistant for ${store.storeName}. Using ONLY the shop information below, write a short, natural, friendly reply to the customer's question. Output ONLY the reply text itself — nothing else. Do not explain your reasoning. Do not repeat these instructions. Do not use bullet points or labels.

Selected Language: ${language || 'English'} (Ensure the entire output response is written in ${language || 'English'} only)

Shop Information:
- Store Name: ${store.storeName}
- Store Hours: ${store.storeHours || 'N/A'}
- Delivery Policy: ${store.deliveryPolicy || 'N/A'}
- Products/Items in Stock and Prices:
${
  products && products.length > 0
    ? products.map(item => `  * ${item.productName}: Price: ₹${item.price}, Status: ${item.stockStatus}`).join('\n')
    : '  * No product items listed.'
}

Customer Question:
"${question}"

Remember: Output ONLY the final customer-facing reply text. No thinking tags, no reasoning process, no constraint validation, no labels. If the information needed to answer the question is not present in the Shop Information, respond with: "I'm sorry, I don't have that information." (or equivalent translation in ${language || 'English'}).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`Calling Gemini API using model: ${model} for store ${store.storeName}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error details:', errorData);
      return res.status(response.status).json({
        error: `Gemini API returned an error: ${response.statusText}`,
        details: errorData.error?.message || 'No detailed error message provided.'
      });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
      let reply = data.candidates[0].content.parts
        .filter(part => part.text && !part.thought)
        .map(part => part.text)
        .join('')
        .trim();

      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      reply = reply.replace(/```xml\s*<think>[\s\S]*?<\/think>\s*```/gi, '').trim();
      reply = reply.replace(/^(Draft|Answer|Reply|Response):\s*/i, '').trim();

      const log = new QueryLog({
        storeId: store._id,
        question: question.trim(),
        reply,
        language,
        source: 'owner'
      });
      await log.save();
      
      res.json({ reply });
    } else {
      console.error('Unexpected Gemini API response structure:', data);
      res.status(500).json({ error: 'Unexpected response format from Gemini API.' });
    }
  } catch (error) {
    console.error('Failed to generate reply:', error);
    res.status(500).json({ error: 'Internal server error while generating reply.', details: error.message });
  }
});

app.get('/api/public/store/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }
    res.json({
      storeName: store.storeName,
      storeHours: store.storeHours,
      deliveryPolicy: store.deliveryPolicy,
      slug: store.slug
    });
  } catch (error) {
    console.error('Public fetch store error:', error);
    res.status(500).json({ error: 'Failed to load store.' });
  }
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many question requests from this IP. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/public/:slug/ask', publicLimiter, async (req, res) => {
  const { question, language } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const products = await Product.find({ storeId: store._id }).sort({ createdAt: 1 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
      return res.status(400).json({ 
        error: 'Assistant is currently offline. Please contact the store owner.'
      });
    }

    const model = process.env.GEMINI_MODEL || 'gemma-2-9b-it';

    const prompt = `You are the customer service assistant for ${store.storeName}. Using ONLY the shop information below, write a short, natural, friendly reply to the customer's question. Output ONLY the reply text itself — nothing else. Do not explain your reasoning. Do not repeat these instructions. Do not use bullet points or labels.

Selected Language: ${language || 'English'} (Ensure the entire output response is written in ${language || 'English'} only)

Shop Information:
- Store Name: ${store.storeName}
- Store Hours: ${store.storeHours || 'N/A'}
- Delivery Policy: ${store.deliveryPolicy || 'N/A'}
- Products/Items in Stock and Prices:
${
  products && products.length > 0
    ? products.map(item => `  * ${item.productName}: Price: ₹${item.price}, Status: ${item.stockStatus}`).join('\n')
    : '  * No product items listed.'
}

Customer Question:
"${question}"

Remember: Output ONLY the final customer-facing reply text. No thinking tags, no reasoning process, no constraint validation, no labels. If the information needed to answer the question is not present in the Shop Information, respond with: "I'm sorry, I don't have that information." (or equivalent translation in ${language || 'English'}).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log(`Calling Gemini API (public request) using model: ${model} for store ${store.storeName}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API public error:', errorData);
      return res.status(response.status).json({
        error: `AI response generation failed.`,
        details: errorData.error?.message || 'AI helper offline.'
      });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
      let reply = data.candidates[0].content.parts
        .filter(part => part.text && !part.thought)
        .map(part => part.text)
        .join('')
        .trim();

      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      reply = reply.replace(/```xml\s*<think>[\s\S]*?<\/think>\s*```/gi, '').trim();
      reply = reply.replace(/^(Draft|Answer|Reply|Response):\s*/i, '').trim();

      const log = new QueryLog({
        storeId: store._id,
        question: question.trim(),
        reply,
        language,
        source: 'public'
      });
      await log.save();
      
      res.json({ reply });
    } else {
      res.status(500).json({ error: 'Unexpected response format.' });
    }
  } catch (error) {
    console.error('Public generate error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
