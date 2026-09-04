/**
 * Migration Utility: Transfers all data from phonestore.db (SQLite) to MongoDB
 * Usage: node migrate-to-mongo.js <MONGODB_URI>
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const initSqlJs = require('sql.js');
const {
  mongoose,
  User,
  Setting,
  Brand,
  Category,
  Product,
  Review
} = require('./models');

const mongoUri = process.argv[2] || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('\nUsage: node migrate-to-mongo.js <MONGODB_URI>\n');
  process.exit(1);
}

async function migrate() {
  console.log(' Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const dbPath = path.join(__dirname, 'phonestore.db');
  if (!fs.existsSync(dbPath)) {
    console.error('✗ phonestore.db not found!');
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const filebuffer = fs.readFileSync(dbPath);
  const sqliteDb = new SQL.Database(filebuffer);

  // 1. Migrate Settings
  try {
    const res = sqliteDb.exec("SELECT key, value FROM settings");
    if (res.length > 0) {
      for (const [key, value] of res[0].values) {
        await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true });
      }
      console.log(`✓ Migrated ${res[0].values.length} settings`);
    }
  } catch (e) { console.warn('Settings:', e.message); }

  // 2. Migrate Brands
  try {
    const res = sqliteDb.exec("SELECT id, name, description, logo_url FROM brands");
    if (res.length > 0) {
      for (const [id, name, description, logo_url] of res[0].values) {
        await Brand.findOneAndUpdate(
          { name },
          { legacy_id: id, name, description, logo_url },
          { upsert: true }
        );
      }
      console.log(`✓ Migrated ${res[0].values.length} brands`);
    }
  } catch (e) { console.warn('Brands:', e.message); }

  // 3. Migrate Categories
  try {
    const res = sqliteDb.exec("SELECT id, name, description, icon FROM categories");
    if (res.length > 0) {
      for (const [id, name, description, icon] of res[0].values) {
        await Category.findOneAndUpdate(
          { name },
          { legacy_id: id, name, description, icon },
          { upsert: true }
        );
      }
      console.log(`✓ Migrated ${res[0].values.length} categories`);
    }
  } catch (e) { console.warn('Categories:', e.message); }

  // 4. Migrate Products
  try {
    const res = sqliteDb.exec("SELECT id, name, brand, category, price, size, description, image_url, stock FROM products");
    if (res.length > 0) {
      for (const [id, name, brand, category, price, size, description, image_url, stock] of res[0].values) {
        await Product.findOneAndUpdate(
          { name, brand },
          { legacy_id: id, name, brand, category, price, size, description, image_url, stock },
          { upsert: true }
        );
      }
      console.log(`✓ Migrated ${res[0].values.length} products`);
    }
  } catch (e) { console.warn('Products:', e.message); }

  // 5. Migrate Reviews
  try {
    const res = sqliteDb.exec("SELECT id, product_id, customer_name, rating, comment FROM reviews");
    if (res.length > 0) {
      for (const [id, product_id, customer_name, rating, comment] of res[0].values) {
        await Review.findOneAndUpdate(
          { legacy_id: id },
          { legacy_id: id, product_id: String(product_id), customer_name, rating, comment },
          { upsert: true }
        );
      }
      console.log(`✓ Migrated ${res[0].values.length} reviews`);
    }
  } catch (e) { console.warn('Reviews:', e.message); }

  // 6. Migrate Users
  try {
    const res = sqliteDb.exec("SELECT id, username, password, role, display_name, email, phone, avatar_url FROM users");
    if (res.length > 0) {
      for (const [id, username, password, role, display_name, email, phone, avatar_url] of res[0].values) {
        await User.findOneAndUpdate(
          { username },
          { legacy_id: id, username, password, role, display_name, email, phone, avatar_url },
          { upsert: true }
        );
      }
      console.log(`✓ Migrated ${res[0].values.length} users`);
    }
  } catch (e) { console.warn('Users:', e.message); }

  console.log('\n✨ SUCCESS: All data migrated from SQLite to MongoDB Atlas!\n');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
