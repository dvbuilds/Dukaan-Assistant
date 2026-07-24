// One-time migration script: reads the old flat-file data/shop_info.json
// and inserts it as a real Shop + Product documents in MongoDB, owned by
// a seed shopkeeper account. Run with: node utils/seedFromLegacyJson.js
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEGACY_FILE = path.join(__dirname, '..', 'data', 'shop_info.json');

// Default coordinates used when the legacy data has no location on file
// (Kolkata, since that's the reference shop's context) — edit as needed.
const DEFAULT_LAT = 22.5726;
const DEFAULT_LNG = 88.3639;

async function run() {
  await connectDB();

  const raw = await fs.readFile(LEGACY_FILE, 'utf8');
  const legacy = JSON.parse(raw);

  const seedEmail = 'seed.shopkeeper@dukaan.local';
  let owner = await User.findOne({ email: seedEmail });
  if (!owner) {
    owner = await User.create({
      name: legacy.storeName || 'Seed Shopkeeper',
      email: seedEmail,
      password: 'ChangeMe123!', // meant to be reset immediately after seeding
      role: 'shopkeeper',
    });
    console.log(`Created seed shopkeeper: ${seedEmail} (password: ChangeMe123!)`);
  }

  let shop = await Shop.findOne({ owner: owner._id, name: legacy.storeName });
  if (!shop) {
    shop = await Shop.create({
      owner: owner._id,
      name: legacy.storeName || 'Migrated Shop',
      address: 'Address not set during migration — update via PATCH /api/shops/:id',
      location: { type: 'Point', coordinates: [DEFAULT_LNG, DEFAULT_LAT] },
      storeHours: legacy.storeHours || '',
      deliveryPolicy: legacy.deliveryPolicy || '',
    });
    console.log(`Created shop: ${shop.name} (${shop._id})`);
  }

  for (const item of legacy.items || []) {
    const exists = await Product.findOne({ shop: shop._id, name: item.name });
    if (exists) continue;

    await Product.create({
      shop: shop._id,
      name: item.name,
      price: Number(item.price) || 0,
      stockQty: item.status === 'In Stock' ? 10 : 0, // legacy had no real qty, default a seed value
    });
  }
  console.log(`Migrated ${legacy.items?.length || 0} products into shop ${shop._id}`);

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
